// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { PanelModel } from 'app/features/dashboard/state';
import { StoreState } from 'app/types';
import { PanelState } from './reducers';

export function getPanelStateForModel(state: StoreState, model: PanelModel): PanelState | undefined {
  return state.panels[model.key];
}
