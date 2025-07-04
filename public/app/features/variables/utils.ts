// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { isArray, isEqual } from 'lodash';
import { ScopedVars, UrlQueryMap, UrlQueryValue, VariableType } from '@grafana/data';
import { getTemplateSrv } from '@grafana/runtime';

import { ALL_VARIABLE_TEXT, ALL_VARIABLE_VALUE } from './state/types';
import { QueryVariableModel, VariableModel, VariableRefresh } from './types';
import { getTimeSrv } from '../dashboard/services/TimeSrv';
import { variableAdapters } from './adapters';
import { safeStringifyValue } from 'app/core/utils/explore';
import { StoreState } from '../../types';
import { getState } from '../../store/store';
import { TransactionStatus } from './state/transactionReducer';

/*
 * This regex matches 3 types of variable reference with an optional format specifier
 * \$(\w+)                          $var1
 * \[\[([\s\S]+?)(?::(\w+))?\]\]    [[var2]] or [[var2:fmt2]]
 * \${(\w+)(?::(\w+))?}             ${var3} or ${var3:fmt3}
 */
export const variableRegex = /\$(\w+)|\[\[([\s\S]+?)(?::(\w+))?\]\]|\${(\w+)(?:\.([^:^\}]+))?(?::([^\}]+))?}/g;

// Helper function since lastIndex is not reset
export const variableRegexExec = (variableString: string) => {
  variableRegex.lastIndex = 0;
  return variableRegex.exec(variableString);
};

export const SEARCH_FILTER_VARIABLE = '__searchFilter';

export const containsSearchFilter = (query: string | unknown): boolean =>
  query && typeof query === 'string' ? query.indexOf(SEARCH_FILTER_VARIABLE) !== -1 : false;

export const getSearchFilterScopedVar = (args: {
  query: string;
  wildcardChar: string;
  options: { searchFilter?: string };
}): ScopedVars => {
  const { query, wildcardChar } = args;
  if (!containsSearchFilter(query)) {
    return {};
  }

  let { options } = args;

  options = options || { searchFilter: '' };
  const value = options.searchFilter ? `${options.searchFilter}${wildcardChar}` : `${wildcardChar}`;

  return {
    __searchFilter: {
      value,
      text: '',
    },
  };
};

export function containsVariable(...args: any[]) {
  const variableName = args[args.length - 1];
  args[0] = typeof args[0] === 'string' ? args[0] : safeStringifyValue(args[0]);
  const variableString = args.slice(0, -1).join(' ');
  const matches = variableString.match(variableRegex);
  const isMatchingVariable =
    matches !== null
      ? matches.find((match) => {
          const varMatch = variableRegexExec(match);
          return varMatch !== null && varMatch.indexOf(variableName) > -1;
        })
      : false;

  return !!isMatchingVariable;
}

export const isAllVariable = (variable: any): boolean => {
  if (!variable) {
    return false;
  }

  if (!variable.current) {
    return false;
  }

  if (variable.current.value) {
    const isArray = Array.isArray(variable.current.value);
    if (isArray && variable.current.value.length && variable.current.value[0] === ALL_VARIABLE_VALUE) {
      return true;
    }

    if (!isArray && variable.current.value === ALL_VARIABLE_VALUE) {
      return true;
    }
  }

  if (variable.current.text) {
    const isArray = Array.isArray(variable.current.text);
    if (isArray && variable.current.text.length && variable.current.text[0] === ALL_VARIABLE_TEXT) {
      return true;
    }

    if (!isArray && variable.current.text === ALL_VARIABLE_TEXT) {
      return true;
    }
  }

  return false;
};

export const getCurrentText = (variable: any): string => {
  if (!variable) {
    return '';
  }

  if (!variable.current) {
    return '';
  }

  if (!variable.current.text) {
    return '';
  }

  if (Array.isArray(variable.current.text)) {
    return variable.current.text.toString();
  }

  if (typeof variable.current.text !== 'string') {
    return '';
  }

  return variable.current.text;
};

export function getTemplatedRegex(variable: QueryVariableModel, templateSrv = getTemplateSrv()): string {
  if (!variable) {
    return '';
  }

  if (!variable.regex) {
    return '';
  }

  return templateSrv.replace(variable.regex, {}, 'regex');
}

export function getLegacyQueryOptions(variable: QueryVariableModel, searchFilter?: string, timeSrv = getTimeSrv()) {
  const queryOptions: any = { range: undefined, variable, searchFilter };
  if (variable.refresh === VariableRefresh.onTimeRangeChanged || variable.refresh === VariableRefresh.onDashboardLoad) {
    queryOptions.range = timeSrv.timeRange();
  }

  return queryOptions;
}

export function getVariableRefresh(variable: VariableModel): VariableRefresh {
  if (!variable || !variable.hasOwnProperty('refresh')) {
    return VariableRefresh.never;
  }

  const queryVariable = variable as QueryVariableModel;

  if (
    queryVariable.refresh !== VariableRefresh.onTimeRangeChanged &&
    queryVariable.refresh !== VariableRefresh.onDashboardLoad &&
    queryVariable.refresh !== VariableRefresh.never
  ) {
    return VariableRefresh.never;
  }

  return queryVariable.refresh;
}

export function getVariableTypes(): Array<{ label: string; value: VariableType }> {
  return variableAdapters
    .list()
    .filter((v) => v.id !== 'system')
    .map(({ id, name }) => ({
      label: name,
      value: id,
    }));
}

function getUrlValueForComparison(value: any): any {
  if (isArray(value)) {
    if (value.length === 0) {
      value = undefined;
    } else if (value.length === 1) {
      value = value[0];
    }
  }

  return value;
}

export interface UrlQueryType {
  value: UrlQueryValue;
  removed?: boolean;
}

export interface ExtendedUrlQueryMap extends Record<string, UrlQueryType> {}

export function findTemplateVarChanges(query: UrlQueryMap, old: UrlQueryMap): ExtendedUrlQueryMap | undefined {
  let count = 0;
  const changes: ExtendedUrlQueryMap = {};

  for (const key in query) {
    if (!key.startsWith('var-')) {
      continue;
    }

    let oldValue = getUrlValueForComparison(old[key]);
    let newValue = getUrlValueForComparison(query[key]);

    if (!isEqual(newValue, oldValue)) {
      changes[key] = { value: query[key] };
      count++;
    }
  }

  for (const key in old) {
    if (!key.startsWith('var-')) {
      continue;
    }

    const value = old[key];

    // ignore empty array values
    if (isArray(value) && value.length === 0) {
      continue;
    }

    if (!query.hasOwnProperty(key)) {
      changes[key] = { value: '', removed: true }; // removed
      count++;
    }
  }
  return count ? changes : undefined;
}

export function ensureStringValues(value: any | any[]): string | string[] {
  if (Array.isArray(value)) {
    return value.map(String);
  }

  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'number') {
    return value.toString(10);
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'boolean') {
    return value.toString();
  }

  return '';
}

export function hasOngoingTransaction(state: StoreState = getState()): boolean {
  return state.templating.transaction.status !== TransactionStatus.NotStarted;
}
