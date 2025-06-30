// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { PanelModel } from '@grafana/data';
import { sharedSingleStatMigrationHandler } from '@grafana/ui';
import { BarGaugeOptions } from './types';

export const barGaugePanelMigrationHandler = (panel: PanelModel<BarGaugeOptions>): Partial<BarGaugeOptions> => {
  return sharedSingleStatMigrationHandler(panel);
};
