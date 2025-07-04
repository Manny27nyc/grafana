// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { ScopedVars, VariableModel } from '@grafana/data';
import { variableRegex } from '../variables/utils';
import { TemplateSrv } from '@grafana/runtime';

/**
 * Mock for TemplateSrv where you can just supply map of key and values and it will do the interpolation based on that.
 * For simple tests whether you your data source for example calls correct replacing code.
 *
 * This is implementing TemplateSrv interface but that is not enough in most cases. Datasources require some additional
 * methods and usually require TemplateSrv class directly instead of just the interface which probably should be fixed
 * later on.
 */
export class TemplateSrvMock implements TemplateSrv {
  private regex = variableRegex;
  constructor(private variables: Record<string, string>) {}

  getVariables(): VariableModel[] {
    return Object.keys(this.variables).map((key) => {
      return {
        type: 'custom',
        name: key,
        label: key,
      };
    });
  }

  replace(target?: string, scopedVars?: ScopedVars, format?: string | Function): string {
    if (!target) {
      return target ?? '';
    }

    this.regex.lastIndex = 0;

    return target.replace(this.regex, (match, var1, var2, fmt2, var3, fieldPath, fmt3) => {
      const variableName = var1 || var2 || var3;
      return this.variables[variableName];
    });
  }

  getVariableName(expression: string) {
    this.regex.lastIndex = 0;
    const match = this.regex.exec(expression);
    if (!match) {
      return null;
    }
    return match.slice(1).find((match) => match !== undefined);
  }
}
