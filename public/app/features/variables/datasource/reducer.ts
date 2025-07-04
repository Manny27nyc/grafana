// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DataSourceInstanceSettings } from '@grafana/data';

import { DataSourceVariableModel, initialVariableModelState, VariableOption, VariableRefresh } from '../types';
import {
  ALL_VARIABLE_TEXT,
  ALL_VARIABLE_VALUE,
  getInstanceState,
  initialVariablesState,
  VariablePayload,
  VariablesState,
} from '../state/types';

export interface DataSourceVariableEditorState {
  dataSourceTypes: Array<{ text: string; value: string }>;
}

export const initialDataSourceVariableModelState: DataSourceVariableModel = {
  ...initialVariableModelState,
  type: 'datasource',
  current: {} as VariableOption,
  regex: '',
  options: [],
  query: '',
  multi: false,
  includeAll: false,
  refresh: VariableRefresh.onDashboardLoad,
};

export const dataSourceVariableSlice = createSlice({
  name: 'templating/datasource',
  initialState: initialVariablesState,
  reducers: {
    createDataSourceOptions: (
      state: VariablesState,
      action: PayloadAction<VariablePayload<{ sources: DataSourceInstanceSettings[]; regex: RegExp | undefined }>>
    ) => {
      const { sources, regex } = action.payload.data;
      const options: VariableOption[] = [];
      const instanceState = getInstanceState<DataSourceVariableModel>(state, action.payload.id);
      for (let i = 0; i < sources.length; i++) {
        const source = sources[i];
        // must match on type
        if (source.meta.id !== instanceState.query) {
          continue;
        }

        if (isValid(source, regex)) {
          options.push({ text: source.name, value: source.name, selected: false });
        }

        if (isDefault(source, regex)) {
          options.push({ text: 'default', value: 'default', selected: false });
        }
      }

      if (options.length === 0) {
        options.push({ text: 'No data sources found', value: '', selected: false });
      }

      if (instanceState.includeAll) {
        options.unshift({ text: ALL_VARIABLE_TEXT, value: ALL_VARIABLE_VALUE, selected: false });
      }

      instanceState.options = options;
    },
  },
});

function isValid(source: DataSourceInstanceSettings, regex?: RegExp) {
  if (!regex) {
    return true;
  }

  return regex.exec(source.name);
}

function isDefault(source: DataSourceInstanceSettings, regex?: RegExp) {
  if (!source.isDefault) {
    return false;
  }

  if (!regex) {
    return true;
  }

  return regex.exec('default');
}

export const dataSourceVariableReducer = dataSourceVariableSlice.reducer;
export const { createDataSourceOptions } = dataSourceVariableSlice.actions;
