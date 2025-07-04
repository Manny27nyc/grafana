// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { urlUtil, UrlQueryMap, Labels } from '@grafana/data';
import { config } from '@grafana/runtime';
import { Alert, CombinedRule, FilterState, RulesSource, SilenceFilterState } from 'app/types/unified-alerting';
import { ALERTMANAGER_NAME_QUERY_KEY } from './constants';
import { getRulesSourceName } from './datasource';
import * as ruleId from './rule-id';
import { SortOrder } from 'app/plugins/panel/alertlist/types';
import { alertInstanceKey } from 'app/features/alerting/unified/utils/rules';
import { sortBy } from 'lodash';
import { GrafanaAlertState, PromAlertingRuleState } from 'app/types/unified-alerting-dto';
import { getMatcherQueryParams } from './matchers';

export function createViewLink(ruleSource: RulesSource, rule: CombinedRule, returnTo: string): string {
  const sourceName = getRulesSourceName(ruleSource);
  const identifier = ruleId.fromCombinedRule(sourceName, rule);
  const paramId = encodeURIComponent(ruleId.stringifyIdentifier(identifier));
  const paramSource = encodeURIComponent(sourceName);

  return urlUtil.renderUrl(`${config.appSubUrl}/alerting/${paramSource}/${paramId}/view`, { returnTo });
}

export function createExploreLink(dataSourceName: string, query: string) {
  return urlUtil.renderUrl(`${config.appSubUrl}/explore`, {
    left: JSON.stringify([
      'now-1h',
      'now',
      dataSourceName,
      { datasource: dataSourceName, expr: query },
      { ui: [true, true, true, 'none'] },
    ]),
  });
}

export function arrayToRecord(items: Array<{ key: string; value: string }>): Record<string, string> {
  return items.reduce<Record<string, string>>((rec, { key, value }) => {
    rec[key] = value;
    return rec;
  }, {});
}

export const getFiltersFromUrlParams = (queryParams: UrlQueryMap): FilterState => {
  const queryString = queryParams['queryString'] === undefined ? undefined : String(queryParams['queryString']);
  const alertState = queryParams['alertState'] === undefined ? undefined : String(queryParams['alertState']);
  const dataSource = queryParams['dataSource'] === undefined ? undefined : String(queryParams['dataSource']);
  const ruleType = queryParams['ruleType'] === undefined ? undefined : String(queryParams['ruleType']);
  const groupBy = queryParams['groupBy'] === undefined ? undefined : String(queryParams['groupBy']).split(',');
  return { queryString, alertState, dataSource, groupBy, ruleType };
};

export const getSilenceFiltersFromUrlParams = (queryParams: UrlQueryMap): SilenceFilterState => {
  const queryString = queryParams['queryString'] === undefined ? undefined : String(queryParams['queryString']);
  const silenceState = queryParams['silenceState'] === undefined ? undefined : String(queryParams['silenceState']);

  return { queryString, silenceState };
};

export function recordToArray(record: Record<string, string>): Array<{ key: string; value: string }> {
  return Object.entries(record).map(([key, value]) => ({ key, value }));
}

export function makeAMLink(path: string, alertManagerName?: string, options?: Record<string, string>): string {
  const search = new URLSearchParams(options);
  if (alertManagerName) {
    search.append(ALERTMANAGER_NAME_QUERY_KEY, alertManagerName);
  }
  return `${path}?${search.toString()}`;
}

export function makeRuleBasedSilenceLink(alertManagerSourceName: string, rule: CombinedRule) {
  const labels: Labels = {
    alertname: rule.name,
    ...rule.labels,
  };

  return makeLabelBasedSilenceLink(alertManagerSourceName, labels);
}

export function makeLabelBasedSilenceLink(alertManagerSourceName: string, labels: Labels) {
  const silenceUrlParams = new URLSearchParams();
  silenceUrlParams.append('alertmanager', alertManagerSourceName);

  const matcherParams = getMatcherQueryParams(labels);
  matcherParams.forEach((value, key) => silenceUrlParams.append(key, value));

  return `${config.appSubUrl}/alerting/silence/new?${silenceUrlParams.toString()}`;
}

// keep retrying fn if it's error passes shouldRetry(error) and timeout has not elapsed yet
export function retryWhile<T, E = Error>(
  fn: () => Promise<T>,
  shouldRetry: (e: E) => boolean,
  timeout: number, // milliseconds, how long to keep retrying
  pause = 1000 // milliseconds, pause between retries
): Promise<T> {
  const start = new Date().getTime();
  const makeAttempt = (): Promise<T> =>
    fn().catch((e) => {
      if (shouldRetry(e) && new Date().getTime() - start < timeout) {
        return new Promise((resolve) => setTimeout(resolve, pause)).then(makeAttempt);
      }
      throw e;
    });
  return makeAttempt();
}

const alertStateSortScore = {
  [GrafanaAlertState.Alerting]: 1,
  [PromAlertingRuleState.Firing]: 1,
  [GrafanaAlertState.Error]: 1,
  [GrafanaAlertState.Pending]: 2,
  [PromAlertingRuleState.Pending]: 2,
  [PromAlertingRuleState.Inactive]: 2,
  [GrafanaAlertState.NoData]: 3,
  [GrafanaAlertState.Normal]: 4,
};

export function sortAlerts(sortOrder: SortOrder, alerts: Alert[]): Alert[] {
  // Make sure to handle tie-breaks because API returns alert instances in random order every time
  if (sortOrder === SortOrder.Importance) {
    return sortBy(alerts, (alert) => [alertStateSortScore[alert.state], alertInstanceKey(alert).toLocaleLowerCase()]);
  } else if (sortOrder === SortOrder.TimeAsc) {
    return sortBy(alerts, (alert) => [
      new Date(alert.activeAt) || new Date(),
      alertInstanceKey(alert).toLocaleLowerCase(),
    ]);
  } else if (sortOrder === SortOrder.TimeDesc) {
    return sortBy(alerts, (alert) => [
      new Date(alert.activeAt) || new Date(),
      alertInstanceKey(alert).toLocaleLowerCase(),
    ]).reverse();
  }
  const result = sortBy(alerts, (alert) => alertInstanceKey(alert).toLocaleLowerCase());
  if (sortOrder === SortOrder.AlphaDesc) {
    result.reverse();
  }

  return result;
}
