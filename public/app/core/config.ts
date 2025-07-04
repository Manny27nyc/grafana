// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { config, GrafanaBootConfig } from '@grafana/runtime';
import { PluginState } from '@grafana/data';
// Legacy binding paths
export { config, GrafanaBootConfig as Settings };

let grafanaConfig: GrafanaBootConfig = config;

export default grafanaConfig;

export const getConfig = () => {
  return grafanaConfig;
};

export const updateConfig = (update: Partial<GrafanaBootConfig>) => {
  grafanaConfig = {
    ...grafanaConfig,
    ...update,
  };
};

// The `enable_alpha` flag is no exposed directly, this is equivolant
export const hasAlphaPanels = Boolean(config.panels?.debug?.state === PluginState.alpha);
