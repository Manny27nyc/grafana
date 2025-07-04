// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { getPanelPluginNotFound } from 'app/features/panel/components/PanelPluginError';
import { PanelModel } from 'app/features/dashboard/state/PanelModel';
import { loadPanelPlugin } from 'app/features/plugins/admin/state/actions';
import { ThunkResult } from 'app/types';
import { panelModelAndPluginReady } from './reducers';
import { LibraryElementDTO } from 'app/features/library-panels/types';
import { toPanelModelLibraryPanel } from 'app/features/library-panels/utils';
import { PanelOptionsChangedEvent, PanelQueriesChangedEvent } from 'app/types/events';
import { DataTransformerConfig, FieldConfigSource } from '@grafana/data';
import { getPanelOptionsWithDefaults } from 'app/features/dashboard/state/getPanelOptionsWithDefaults';

export function initPanelState(panel: PanelModel): ThunkResult<void> {
  return async (dispatch, getStore) => {
    let pluginToLoad = panel.type;
    let plugin = getStore().plugins.panels[pluginToLoad];

    if (!plugin) {
      try {
        plugin = await dispatch(loadPanelPlugin(pluginToLoad));
      } catch (e) {
        // When plugin not found
        plugin = getPanelPluginNotFound(pluginToLoad, pluginToLoad === 'row');
      }
    }

    if (!panel.plugin) {
      panel.pluginLoaded(plugin);
    }

    dispatch(panelModelAndPluginReady({ key: panel.key, plugin }));
  };
}

export interface ChangePanelPluginAndOptionsArgs {
  panel: PanelModel;
  pluginId: string;
  options?: any;
  fieldConfig?: FieldConfigSource;
  transformations?: DataTransformerConfig[];
}

export function changePanelPlugin({
  panel,
  pluginId,
  options,
  fieldConfig,
}: ChangePanelPluginAndOptionsArgs): ThunkResult<void> {
  return async (dispatch, getStore) => {
    // ignore action is no change
    if (panel.type === pluginId && !options && !fieldConfig) {
      return;
    }

    const store = getStore();
    let plugin = store.plugins.panels[pluginId];

    if (!plugin) {
      plugin = await dispatch(loadPanelPlugin(pluginId));
    }

    let cleanUpKey = panel.key;

    if (panel.type !== pluginId) {
      panel.changePlugin(plugin);
    }

    if (options || fieldConfig) {
      const newOptions = getPanelOptionsWithDefaults({
        plugin,
        currentOptions: options || panel.options,
        currentFieldConfig: fieldConfig || panel.fieldConfig,
        isAfterPluginChange: false,
      });

      panel.options = newOptions.options;
      panel.fieldConfig = newOptions.fieldConfig;
      panel.configRev++;
    }

    panel.generateNewKey();

    dispatch(panelModelAndPluginReady({ key: panel.key, plugin, cleanUpKey }));
  };
}

export function changeToLibraryPanel(panel: PanelModel, libraryPanel: LibraryElementDTO): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const newPluginId = libraryPanel.model.type;
    const oldType = panel.type;

    // Update model but preserve gridPos & id
    panel.restoreModel({
      ...libraryPanel.model,
      gridPos: panel.gridPos,
      id: panel.id,
      libraryPanel: toPanelModelLibraryPanel(libraryPanel.model),
    });

    // a new library panel usually means new queries, clear any current result
    panel.getQueryRunner().clearLastResult();

    // Handle plugin change
    if (oldType !== newPluginId) {
      const store = getStore();
      let plugin = store.plugins.panels[newPluginId];

      if (!plugin) {
        plugin = await dispatch(loadPanelPlugin(newPluginId));
      }

      const oldKey = panel.key;

      panel.pluginLoaded(plugin);
      panel.generateNewKey();

      await dispatch(panelModelAndPluginReady({ key: panel.key, plugin, cleanUpKey: oldKey }));
    }

    panel.configRev = 0;
    panel.refresh();

    panel.events.publish(PanelQueriesChangedEvent);
    panel.events.publish(PanelOptionsChangedEvent);
  };
}
