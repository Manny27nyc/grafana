// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { initialVariableModelState, TextBoxVariableModel, VariableOption } from '../types';
import { getInstanceState, VariablePayload, initialVariablesState, VariablesState } from '../state/types';

export const initialTextBoxVariableModelState: TextBoxVariableModel = {
  ...initialVariableModelState,
  type: 'textbox',
  query: '',
  current: {} as VariableOption,
  options: [],
  originalQuery: null,
};

export const textBoxVariableSlice = createSlice({
  name: 'templating/textbox',
  initialState: initialVariablesState,
  reducers: {
    createTextBoxOptions: (state: VariablesState, action: PayloadAction<VariablePayload>) => {
      const instanceState = getInstanceState<TextBoxVariableModel>(state, action.payload.id);
      const option = { text: instanceState.query.trim(), value: instanceState.query.trim(), selected: false };
      instanceState.options = [option];
      instanceState.current = option;
    },
  },
});

export const textBoxVariableReducer = textBoxVariableSlice.reducer;

export const { createTextBoxOptions } = textBoxVariableSlice.actions;
