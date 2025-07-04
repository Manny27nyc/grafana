// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { HideableFieldConfig, VisibilityMode, OptionsWithTooltip, OptionsWithLegend } from '@grafana/schema';

/**
 * @alpha
 */
export interface StatusPanelOptions extends OptionsWithTooltip, OptionsWithLegend {
  showValue: VisibilityMode;
  rowHeight: number;
  colWidth?: number;
}

/**
 * @alpha
 */
export interface StatusFieldConfig extends HideableFieldConfig {
  lineWidth?: number; // 0
  fillOpacity?: number; // 100
}

/**
 * @alpha
 */
export const defaultStatusFieldConfig: StatusFieldConfig = {
  lineWidth: 1,
  fillOpacity: 70,
};
