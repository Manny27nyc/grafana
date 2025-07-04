// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { cloneDeep } from 'lodash';

import { QueryVariableModel, VariableRefresh } from '../types';
import { initialQueryVariableModelState, queryVariableReducer } from './reducer';
import { dispatch } from '../../../store/store';
import { setOptionAsCurrent, setOptionFromUrl } from '../state/actions';
import { VariableAdapter } from '../adapters';
import { QueryVariableEditor } from './QueryVariableEditor';
import { updateQueryVariableOptions } from './actions';
import { ALL_VARIABLE_TEXT, toVariableIdentifier } from '../state/types';
import { containsVariable, isAllVariable } from '../utils';
import { optionPickerFactory } from '../pickers';

export const createQueryVariableAdapter = (): VariableAdapter<QueryVariableModel> => {
  return {
    id: 'query',
    description: 'Variable values are fetched from a datasource query',
    name: 'Query',
    initialState: initialQueryVariableModelState,
    reducer: queryVariableReducer,
    picker: optionPickerFactory<QueryVariableModel>(),
    editor: QueryVariableEditor,
    dependsOn: (variable, variableToTest) => {
      return containsVariable(variable.query, variable.datasource?.uid, variable.regex, variableToTest.name);
    },
    setValue: async (variable, option, emitChanges = false) => {
      await dispatch(setOptionAsCurrent(toVariableIdentifier(variable), option, emitChanges));
    },
    setValueFromUrl: async (variable, urlValue) => {
      await dispatch(setOptionFromUrl(toVariableIdentifier(variable), urlValue));
    },
    updateOptions: async (variable, searchFilter) => {
      await dispatch(updateQueryVariableOptions(toVariableIdentifier(variable), searchFilter));
    },
    getSaveModel: (variable) => {
      const { index, id, state, global, queryValue, ...rest } = cloneDeep(variable);
      // remove options
      if (variable.refresh !== VariableRefresh.never) {
        return { ...rest, options: [] };
      }

      return rest;
    },
    getValueForUrl: (variable) => {
      if (isAllVariable(variable)) {
        return ALL_VARIABLE_TEXT;
      }
      return variable.current.value;
    },
  };
};
