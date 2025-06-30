// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { configurePanel, PartialEditPanelConfig } from './configurePanel';

export const editPanel = (config: Partial<PartialEditPanelConfig>) =>
  configurePanel({
    ...config,
    isEdit: true,
  });
