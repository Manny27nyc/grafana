// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { defaults, each, sortBy } from 'lodash';

import config from 'app/core/config';
import { DashboardModel } from '../../state/DashboardModel';
import { PanelModel } from 'app/features/dashboard/state';
import { PanelPluginMeta } from '@grafana/data';
import { getDataSourceSrv } from '@grafana/runtime';
import { VariableOption, VariableRefresh } from '../../../variables/types';
import { isConstant, isQuery } from '../../../variables/guard';
import { LibraryElementKind } from '../../../library-panels/types';
import { isPanelModelLibraryPanel } from '../../../library-panels/guard';

interface Input {
  name: string;
  type: string;
  label: string;
  value: any;
  description: string;
}

interface Requires {
  [key: string]: {
    type: string;
    id: string;
    name: string;
    version: string;
  };
}

interface DataSources {
  [key: string]: {
    name: string;
    label: string;
    description: string;
    type: string;
    pluginId: string;
    pluginName: string;
  };
}

export interface LibraryElementExport {
  name: string;
  uid: string;
  model: any;
  kind: LibraryElementKind;
}

export class DashboardExporter {
  makeExportable(dashboard: DashboardModel) {
    // clean up repeated rows and panels,
    // this is done on the live real dashboard instance, not on a clone
    // so we need to undo this
    // this is pretty hacky and needs to be changed
    dashboard.cleanUpRepeats();

    const saveModel = dashboard.getSaveModelClone();
    saveModel.id = null;

    // undo repeat cleanup
    dashboard.processRepeats();

    const inputs: Input[] = [];
    const requires: Requires = {};
    const datasources: DataSources = {};
    const promises: Array<Promise<void>> = [];
    const variableLookup: { [key: string]: any } = {};
    const libraryPanels: Map<string, LibraryElementExport> = new Map<string, LibraryElementExport>();

    for (const variable of saveModel.getVariables()) {
      variableLookup[variable.name] = variable;
    }

    const templateizeDatasourceUsage = (obj: any) => {
      let datasource: string = obj.datasource;
      let datasourceVariable: any = null;

      // ignore data source properties that contain a variable
      if (datasource && (datasource as any).uid) {
        const uid = (datasource as any).uid as string;
        if (uid.indexOf('$') === 0) {
          datasourceVariable = variableLookup[uid.substring(1)];
          if (datasourceVariable && datasourceVariable.current) {
            datasource = datasourceVariable.current.value;
          }
        }
      }

      promises.push(
        getDataSourceSrv()
          .get(datasource)
          .then((ds) => {
            if (ds.meta?.builtIn) {
              return;
            }

            // add data source type to require list
            requires['datasource' + ds.meta?.id] = {
              type: 'datasource',
              id: ds.meta.id,
              name: ds.meta.name,
              version: ds.meta.info.version || '1.0.0',
            };

            // if used via variable we can skip templatizing usage
            if (datasourceVariable) {
              return;
            }

            const refName = 'DS_' + ds.name.replace(' ', '_').toUpperCase();
            datasources[refName] = {
              name: refName,
              label: ds.name,
              description: '',
              type: 'datasource',
              pluginId: ds.meta?.id,
              pluginName: ds.meta?.name,
            };

            if (obj.datasource === null || typeof obj.datasource === 'string') {
              obj.datasource = '${' + refName + '}';
            } else {
              obj.datasource.uid = '${' + refName + '}';
            }
          })
      );
    };

    const processPanel = (panel: PanelModel) => {
      if (panel.datasource !== undefined && panel.datasource !== null) {
        templateizeDatasourceUsage(panel);
      }

      if (panel.targets) {
        for (const target of panel.targets) {
          if (target.datasource !== undefined) {
            templateizeDatasourceUsage(target);
          }
        }
      }

      const panelDef: PanelPluginMeta = config.panels[panel.type];
      if (panelDef) {
        requires['panel' + panelDef.id] = {
          type: 'panel',
          id: panelDef.id,
          name: panelDef.name,
          version: panelDef.info.version,
        };
      }
    };

    const processLibraryPanels = (panel: any) => {
      if (isPanelModelLibraryPanel(panel)) {
        const { libraryPanel, ...model } = panel;
        const { name, uid } = libraryPanel;
        if (!libraryPanels.has(uid)) {
          libraryPanels.set(uid, { name, uid, kind: LibraryElementKind.Panel, model });
        }
      }
    };

    // check up panel data sources
    for (const panel of saveModel.panels) {
      processPanel(panel);

      // handle collapsed rows
      if (panel.collapsed !== undefined && panel.collapsed === true && panel.panels) {
        for (const rowPanel of panel.panels) {
          processPanel(rowPanel);
        }
      }
    }

    // templatize template vars
    for (const variable of saveModel.getVariables()) {
      if (isQuery(variable)) {
        templateizeDatasourceUsage(variable);
        variable.options = [];
        variable.current = ({} as unknown) as VariableOption;
        variable.refresh =
          variable.refresh !== VariableRefresh.never ? variable.refresh : VariableRefresh.onDashboardLoad;
      }
    }

    // templatize annotations vars
    for (const annotationDef of saveModel.annotations.list) {
      templateizeDatasourceUsage(annotationDef);
    }

    // add grafana version
    requires['grafana'] = {
      type: 'grafana',
      id: 'grafana',
      name: 'Grafana',
      version: config.buildInfo.version,
    };

    return Promise.all(promises)
      .then(() => {
        each(datasources, (value: any) => {
          inputs.push(value);
        });

        // we need to process all panels again after all the promises are resolved
        // so all data sources, variables and targets have been templateized when we process library panels
        for (const panel of saveModel.panels) {
          processLibraryPanels(panel);
          if (panel.collapsed !== undefined && panel.collapsed === true && panel.panels) {
            for (const rowPanel of panel.panels) {
              processLibraryPanels(rowPanel);
            }
          }
        }

        // templatize constants
        for (const variable of saveModel.getVariables()) {
          if (isConstant(variable)) {
            const refName = 'VAR_' + variable.name.replace(' ', '_').toUpperCase();
            inputs.push({
              name: refName,
              type: 'constant',
              label: variable.label || variable.name,
              value: variable.query,
              description: '',
            });
            // update current and option
            variable.query = '${' + refName + '}';
            variable.current = {
              value: variable.query,
              text: variable.query,
              selected: false,
            };
            variable.options = [variable.current];
          }
        }

        // make inputs and requires a top thing
        const newObj: { [key: string]: {} } = {};
        newObj['__inputs'] = inputs;
        newObj['__elements'] = [...libraryPanels.values()];
        newObj['__requires'] = sortBy(requires, ['id']);

        defaults(newObj, saveModel);
        return newObj;
      })
      .catch((err) => {
        console.error('Export failed:', err);
        return {
          error: err,
        };
      });
  }
}
