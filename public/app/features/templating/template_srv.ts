// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { escape, isString, property } from 'lodash';
import { deprecationWarning, ScopedVars, TimeRange } from '@grafana/data';
import { getFilteredVariables, getVariables, getVariableWithName } from '../variables/state/selectors';
import { variableRegex } from '../variables/utils';
import { isAdHoc } from '../variables/guard';
import { AdHocVariableFilter, AdHocVariableModel, VariableModel } from '../variables/types';
import { getDataSourceSrv, setTemplateSrv, TemplateSrv as BaseTemplateSrv } from '@grafana/runtime';
import { FormatOptions, formatRegistry, FormatRegistryID } from './formatRegistry';
import { ALL_VARIABLE_TEXT, ALL_VARIABLE_VALUE } from '../variables/state/types';
import { variableAdapters } from '../variables/adapters';

interface FieldAccessorCache {
  [key: string]: (obj: any) => any;
}

export interface TemplateSrvDependencies {
  getFilteredVariables: typeof getFilteredVariables;
  getVariables: typeof getVariables;
  getVariableWithName: typeof getVariableWithName;
}

const runtimeDependencies: TemplateSrvDependencies = {
  getFilteredVariables,
  getVariables,
  getVariableWithName,
};

export class TemplateSrv implements BaseTemplateSrv {
  private _variables: any[];
  private regex = variableRegex;
  private index: any = {};
  private grafanaVariables: any = {};
  private timeRange?: TimeRange | null = null;
  private fieldAccessorCache: FieldAccessorCache = {};

  constructor(private dependencies: TemplateSrvDependencies = runtimeDependencies) {
    this._variables = [];
  }

  init(variables: any, timeRange?: TimeRange) {
    this._variables = variables;
    this.timeRange = timeRange;
    this.updateIndex();
  }

  /**
   * @deprecated: this instance variable should not be used and will be removed in future releases
   *
   * Use getVariables function instead
   */
  get variables(): any[] {
    deprecationWarning('template_srv.ts', 'variables', 'getVariables');
    return this.getVariables();
  }

  getVariables(): VariableModel[] {
    return this.dependencies.getVariables();
  }

  updateIndex() {
    const existsOrEmpty = (value: any) => value || value === '';

    this.index = this._variables.reduce((acc, currentValue) => {
      if (currentValue.current && (currentValue.current.isNone || existsOrEmpty(currentValue.current.value))) {
        acc[currentValue.name] = currentValue;
      }
      return acc;
    }, {});

    if (this.timeRange) {
      const from = this.timeRange.from.valueOf().toString();
      const to = this.timeRange.to.valueOf().toString();

      this.index = {
        ...this.index,
        ['__from']: {
          current: { value: from, text: from },
        },
        ['__to']: {
          current: { value: to, text: to },
        },
      };
    }
  }

  updateTimeRange(timeRange: TimeRange) {
    this.timeRange = timeRange;
    this.updateIndex();
  }

  variableInitialized(variable: any) {
    this.index[variable.name] = variable;
  }

  getAdhocFilters(datasourceName: string): AdHocVariableFilter[] {
    let filters: any = [];
    let ds = getDataSourceSrv().getInstanceSettings(datasourceName);

    if (!ds) {
      return [];
    }

    for (const variable of this.getAdHocVariables()) {
      const variableUid = variable.datasource?.uid;

      if (variableUid === ds.uid || (variable.datasource == null && ds?.isDefault)) {
        filters = filters.concat(variable.filters);
      } else if (variableUid?.indexOf('$') === 0) {
        if (this.replace(variableUid) === datasourceName) {
          filters = filters.concat(variable.filters);
        }
      }
    }

    return filters;
  }

  formatValue(value: any, format: any, variable: any, text?: string): string {
    // for some scopedVars there is no variable
    variable = variable || {};

    if (value === null || value === undefined) {
      return '';
    }

    if (isAdHoc(variable) && format !== FormatRegistryID.queryParam) {
      return '';
    }

    // if it's an object transform value to string
    if (!Array.isArray(value) && typeof value === 'object') {
      value = `${value}`;
    }

    if (typeof format === 'function') {
      return format(value, variable, this.formatValue);
    }

    if (!format) {
      format = FormatRegistryID.glob;
    }

    // some formats have arguments that come after ':' character
    let args = format.split(':');
    if (args.length > 1) {
      format = args[0];
      args = args.slice(1);
    } else {
      args = [];
    }

    let formatItem = formatRegistry.getIfExists(format);

    if (!formatItem) {
      console.error(`Variable format ${format} not found. Using glob format as fallback.`);
      formatItem = formatRegistry.get(FormatRegistryID.glob);
    }

    const options: FormatOptions = { value, args, text: text ?? value };
    return formatItem.formatter(options, variable);
  }

  setGrafanaVariable(name: string, value: any) {
    this.grafanaVariables[name] = value;
  }

  /**
   * @deprecated: setGlobalVariable function should not be used and will be removed in future releases
   *
   * Use addVariable action to add variables to Redux instead
   */
  setGlobalVariable(name: string, variable: any) {
    deprecationWarning('template_srv.ts', 'setGlobalVariable', '');
    this.index = {
      ...this.index,
      [name]: {
        current: variable,
      },
    };
  }

  getVariableName(expression: string) {
    this.regex.lastIndex = 0;
    const match = this.regex.exec(expression);
    if (!match) {
      return null;
    }
    const variableName = match.slice(1).find((match) => match !== undefined);
    return variableName;
  }

  variableExists(expression: string): boolean {
    const name = this.getVariableName(expression);
    const variable = name && this.getVariableAtIndex(name);
    return variable !== null && variable !== undefined;
  }

  highlightVariablesAsHtml(str: string) {
    if (!str || !isString(str)) {
      return str;
    }

    str = escape(str);
    this.regex.lastIndex = 0;
    return str.replace(this.regex, (match, var1, var2, fmt2, var3) => {
      if (this.getVariableAtIndex(var1 || var2 || var3)) {
        return '<span class="template-variable">' + match + '</span>';
      }
      return match;
    });
  }

  getAllValue(variable: any) {
    if (variable.allValue) {
      return variable.allValue;
    }
    const values = [];
    for (let i = 1; i < variable.options.length; i++) {
      values.push(variable.options[i].value);
    }
    return values;
  }

  private getFieldAccessor(fieldPath: string) {
    const accessor = this.fieldAccessorCache[fieldPath];
    if (accessor) {
      return accessor;
    }

    return (this.fieldAccessorCache[fieldPath] = property(fieldPath));
  }

  private getVariableValue(variableName: string, fieldPath: string | undefined, scopedVars: ScopedVars) {
    const scopedVar = scopedVars[variableName];
    if (!scopedVar) {
      return null;
    }

    if (fieldPath) {
      return this.getFieldAccessor(fieldPath)(scopedVar.value);
    }

    return scopedVar.value;
  }

  private getVariableText(variableName: string, value: any, scopedVars: ScopedVars) {
    const scopedVar = scopedVars[variableName];

    if (!scopedVar) {
      return null;
    }

    if (scopedVar.value === value || typeof value !== 'string') {
      return scopedVar.text;
    }

    return value;
  }

  replace(target?: string, scopedVars?: ScopedVars, format?: string | Function): string {
    if (!target) {
      return target ?? '';
    }

    this.regex.lastIndex = 0;

    return target.replace(this.regex, (match, var1, var2, fmt2, var3, fieldPath, fmt3) => {
      const variableName = var1 || var2 || var3;
      const variable = this.getVariableAtIndex(variableName);
      const fmt = fmt2 || fmt3 || format;

      if (scopedVars) {
        const value = this.getVariableValue(variableName, fieldPath, scopedVars);
        const text = this.getVariableText(variableName, value, scopedVars);

        if (value !== null && value !== undefined) {
          return this.formatValue(value, fmt, variable, text);
        }
      }

      if (!variable) {
        return match;
      }

      if (fmt === FormatRegistryID.queryParam || isAdHoc(variable)) {
        const value = variableAdapters.get(variable.type).getValueForUrl(variable);
        const text = isAdHoc(variable) ? variable.id : variable.current.text;

        return this.formatValue(value, fmt, variable, text);
      }

      const systemValue = this.grafanaVariables[variable.current.value];
      if (systemValue) {
        return this.formatValue(systemValue, fmt, variable);
      }

      let value = variable.current.value;
      let text = variable.current.text;

      if (this.isAllValue(value)) {
        value = this.getAllValue(variable);
        text = ALL_VARIABLE_TEXT;
        // skip formatting of custom all values
        if (variable.allValue && fmt !== FormatRegistryID.text) {
          return this.replace(value);
        }
      }

      if (fieldPath) {
        const fieldValue = this.getVariableValue(variableName, fieldPath, {
          [variableName]: { value, text },
        });
        if (fieldValue !== null && fieldValue !== undefined) {
          return this.formatValue(fieldValue, fmt, variable, text);
        }
      }

      const res = this.formatValue(value, fmt, variable, text);
      return res;
    });
  }

  isAllValue(value: any) {
    return value === ALL_VARIABLE_VALUE || (Array.isArray(value) && value[0] === ALL_VARIABLE_VALUE);
  }

  replaceWithText(target: string, scopedVars?: ScopedVars) {
    deprecationWarning('template_srv.ts', 'replaceWithText()', 'replace(), and specify the :text format');
    return this.replace(target, scopedVars, 'text');
  }

  private getVariableAtIndex(name: string) {
    if (!name) {
      return;
    }

    if (!this.index[name]) {
      return this.dependencies.getVariableWithName(name);
    }

    return this.index[name];
  }

  private getAdHocVariables(): AdHocVariableModel[] {
    return this.dependencies.getFilteredVariables(isAdHoc) as AdHocVariableModel[];
  }
}

// Expose the template srv
const srv = new TemplateSrv();

setTemplateSrv(srv);

export const getTemplateSrv = () => srv;
