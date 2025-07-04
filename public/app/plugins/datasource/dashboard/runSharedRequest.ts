// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { Observable } from 'rxjs';
import { QueryRunnerOptions } from 'app/features/query/state/PanelQueryRunner';
import { DashboardQuery, SHARED_DASHBOARD_QUERY } from './types';
import { getDashboardSrv } from 'app/features/dashboard/services/DashboardSrv';
import {
  DataQuery,
  DataQueryRequest,
  DataSourceApi,
  DataSourceRef,
  getDefaultTimeRange,
  LoadingState,
  PanelData,
} from '@grafana/data';

export function isSharedDashboardQuery(datasource: string | DataSourceRef | DataSourceApi | null) {
  if (!datasource) {
    // default datasource
    return false;
  }

  if (typeof datasource === 'string') {
    return datasource === SHARED_DASHBOARD_QUERY;
  }

  if ('meta' in datasource) {
    return datasource.meta.name === SHARED_DASHBOARD_QUERY || datasource.uid === SHARED_DASHBOARD_QUERY;
  }

  return datasource.uid === SHARED_DASHBOARD_QUERY;
}

export function runSharedRequest(options: QueryRunnerOptions): Observable<PanelData> {
  return new Observable<PanelData>((subscriber) => {
    const dashboard = getDashboardSrv().getCurrent();
    const listenToPanelId = getPanelIdFromQuery(options.queries);

    if (!listenToPanelId) {
      subscriber.next(getQueryError('Missing panel reference ID'));
      return undefined;
    }

    const listenToPanel = dashboard?.getPanelById(listenToPanelId);

    if (!listenToPanel) {
      subscriber.next(getQueryError('Unknown Panel: ' + listenToPanelId));
      return undefined;
    }

    const listenToRunner = listenToPanel.getQueryRunner();
    const subscription = listenToRunner.getData({ withTransforms: false, withFieldConfig: false }).subscribe({
      next: (data: PanelData) => {
        subscriber.next(data);
      },
    });

    // If we are in fullscreen the other panel will not execute any queries
    // So we have to trigger it from here
    if (!listenToPanel.isInView) {
      const { datasource, targets } = listenToPanel;
      const modified = {
        ...options,
        datasource,
        panelId: listenToPanelId,
        queries: targets,
      };
      listenToRunner.run(modified);
    }

    return () => {
      subscription.unsubscribe();
    };
  });
}

function getPanelIdFromQuery(queries: DataQuery[]): number | undefined {
  if (!queries || !queries.length) {
    return undefined;
  }
  return (queries[0] as DashboardQuery).panelId;
}

function getQueryError(msg: string): PanelData {
  return {
    state: LoadingState.Error,
    series: [],
    request: {} as DataQueryRequest,
    error: { message: msg },
    timeRange: getDefaultTimeRange(),
  };
}
