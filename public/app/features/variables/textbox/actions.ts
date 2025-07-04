// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { TextBoxVariableModel } from '../types';
import { ThunkResult } from '../../../types';
import { getVariable } from '../state/selectors';
import { variableAdapters } from '../adapters';
import { createTextBoxOptions } from './reducer';
import { toVariableIdentifier, toVariablePayload, VariableIdentifier } from '../state/types';
import { setOptionFromUrl } from '../state/actions';
import { UrlQueryValue } from '@grafana/data';
import { changeVariableProp } from '../state/sharedReducer';
import { ensureStringValues } from '../utils';

export const updateTextBoxVariableOptions = (identifier: VariableIdentifier): ThunkResult<void> => {
  return async (dispatch, getState) => {
    await dispatch(createTextBoxOptions(toVariablePayload(identifier)));

    const variableInState = getVariable<TextBoxVariableModel>(identifier.id, getState());
    await variableAdapters.get(identifier.type).setValue(variableInState, variableInState.options[0], true);
  };
};

export const setTextBoxVariableOptionsFromUrl = (
  identifier: VariableIdentifier,
  urlValue: UrlQueryValue
): ThunkResult<void> => async (dispatch, getState) => {
  const variableInState = getVariable<TextBoxVariableModel>(identifier.id, getState());

  const stringUrlValue = ensureStringValues(urlValue);
  dispatch(changeVariableProp(toVariablePayload(variableInState, { propName: 'query', propValue: stringUrlValue })));

  await dispatch(setOptionFromUrl(toVariableIdentifier(variableInState), stringUrlValue));
};
