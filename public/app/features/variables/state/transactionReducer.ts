// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { AnyAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  addVariable,
  changeVariableOrder,
  changeVariableProp,
  changeVariableType,
  duplicateVariable,
  removeVariable,
} from './sharedReducer';

export enum TransactionStatus {
  NotStarted = 'Not started',
  Fetching = 'Fetching',
  Completed = 'Completed',
}

export interface TransactionState {
  uid: string | undefined | null;
  status: TransactionStatus;
  isDirty: boolean;
}

export const initialTransactionState: TransactionState = {
  uid: null,
  status: TransactionStatus.NotStarted,
  isDirty: false,
};

const transactionSlice = createSlice({
  name: 'templating/transaction',
  initialState: initialTransactionState,
  reducers: {
    variablesInitTransaction: (state, action: PayloadAction<{ uid: string | undefined | null }>) => {
      state.uid = action.payload.uid;
      state.status = TransactionStatus.Fetching;
    },
    variablesCompleteTransaction: (state, action: PayloadAction<{ uid: string | undefined | null }>) => {
      if (state.uid !== action.payload.uid) {
        // this might be an action from a cancelled batch
        return;
      }

      state.status = TransactionStatus.Completed;
    },
    variablesClearTransaction: (state, action: PayloadAction<undefined>) => {
      state.uid = null;
      state.status = TransactionStatus.NotStarted;
      state.isDirty = false;
    },
  },
  extraReducers: (builder) =>
    builder.addMatcher(actionAffectsDirtyState, (state, action) => {
      if (state.status === TransactionStatus.Completed) {
        state.isDirty = true;
      }
    }),
});

function actionAffectsDirtyState(action: AnyAction): boolean {
  return [
    removeVariable.type,
    addVariable.type,
    changeVariableProp.type,
    changeVariableOrder.type,
    duplicateVariable.type,
    changeVariableType.type,
  ].includes(action.type);
}

export const {
  variablesInitTransaction,
  variablesClearTransaction,
  variablesCompleteTransaction,
} = transactionSlice.actions;

export const transactionReducer = transactionSlice.reducer;
