// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { PanelPluginMeta, PluginState } from '@grafana/data';
import { config } from 'app/core/config';

export function getAllPanelPluginMeta(): PanelPluginMeta[] {
  const allPanels = config.panels;

  return Object.keys(allPanels)
    .filter((key) => allPanels[key]['hideFromList'] === false)
    .map((key) => allPanels[key])
    .sort((a: PanelPluginMeta, b: PanelPluginMeta) => a.sort - b.sort);
}

export function filterPluginList(
  pluginsList: PanelPluginMeta[],
  searchQuery: string,
  current: PanelPluginMeta
): PanelPluginMeta[] {
  if (!searchQuery.length) {
    return pluginsList.filter((p) => {
      if (p.state === PluginState.deprecated) {
        return current.id === p.id;
      }
      return true;
    });
  }

  const query = searchQuery.toLowerCase();
  const first: PanelPluginMeta[] = [];
  const match: PanelPluginMeta[] = [];
  const isGraphQuery = 'graph'.startsWith(query);

  for (const item of pluginsList) {
    if (item.state === PluginState.deprecated && current.id !== item.id) {
      continue;
    }

    const name = item.name.toLowerCase();
    const idx = name.indexOf(query);

    if (idx === 0) {
      first.push(item);
    } else if (idx > 0) {
      match.push(item);
    } else if (isGraphQuery && item.id === 'timeseries') {
      first.push(item);
    }
  }

  return first.concat(match);
}
