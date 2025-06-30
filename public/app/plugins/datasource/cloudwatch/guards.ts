// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { CloudWatchMetricsQuery, CloudWatchQuery } from './types';

export const isMetricsQuery = (query: CloudWatchQuery): query is CloudWatchMetricsQuery => {
  return query.queryMode === 'Metrics';
};
