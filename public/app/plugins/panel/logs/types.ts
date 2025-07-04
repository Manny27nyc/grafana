// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { LogsSortOrder, LogsDedupStrategy } from '@grafana/data';

export interface Options {
  showLabels: boolean;
  showCommonLabels: boolean;
  showTime: boolean;
  wrapLogMessage: boolean;
  prettifyLogMessage: boolean;
  enableLogDetails: boolean;
  sortOrder: LogsSortOrder;
  dedupStrategy: LogsDedupStrategy;
}
