// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { DataQuery, DataSourceJsonData, QueryResultMeta, ScopedVars } from '@grafana/data';

export interface LokiInstantQueryRequest {
  query: string;
  limit?: number;
  time?: string;
  direction?: 'BACKWARD' | 'FORWARD';
}

export interface LokiRangeQueryRequest {
  query: string;
  limit?: number;
  start?: number;
  end?: number;
  step?: number;
  direction?: 'BACKWARD' | 'FORWARD';
}

export enum LokiResultType {
  Stream = 'streams',
  Vector = 'vector',
  Matrix = 'matrix',
}

export enum LokiQueryType {
  Range = 'range',
  Instant = 'instant',
  // Stream = 'stream',
}

export interface LokiQuery extends DataQuery {
  queryType?: LokiQueryType;
  expr: string;
  query?: string;
  format?: string;
  reverse?: boolean;
  legendFormat?: string;
  valueWithRefId?: boolean;
  maxLines?: number;
  resolution?: number;
  volumeQuery?: boolean; // Used in range queries

  /* @deprecated now use queryType */
  range?: boolean;

  /* @deprecated now use queryType */
  instant?: boolean;
}

export interface LokiOptions extends DataSourceJsonData {
  maxLines?: string;
  derivedFields?: DerivedFieldConfig[];
  alertmanager?: string;
}

export interface LokiStats {
  [component: string]: {
    [label: string]: number;
  };
}

export interface LokiVectorResult {
  metric: { [label: string]: string };
  value: [number, string];
}

export interface LokiVectorResponse {
  status: string;
  data: {
    resultType: LokiResultType.Vector;
    result: LokiVectorResult[];
    stats?: LokiStats;
  };
}

export interface LokiMatrixResult {
  metric: Record<string, string>;
  values: Array<[number, string]>;
}

export interface LokiMatrixResponse {
  status: string;
  data: {
    resultType: LokiResultType.Matrix;
    result: LokiMatrixResult[];
    stats?: LokiStats;
  };
}

export interface LokiStreamResult {
  stream: Record<string, string>;
  values: Array<[string, string]>;
}

export interface LokiStreamResponse {
  status: string;
  data: {
    resultType: LokiResultType.Stream;
    result: LokiStreamResult[];
    stats?: LokiStats;
  };
}

export interface LokiTailResponse {
  streams: LokiStreamResult[];
  dropped_entries?: Array<{
    labels: Record<string, string>;
    timestamp: string;
  }> | null;
}

export type LokiResult = LokiVectorResult | LokiMatrixResult | LokiStreamResult;
export type LokiResponse = LokiVectorResponse | LokiMatrixResponse | LokiStreamResponse;

export interface LokiLogsStreamEntry {
  line: string;
  ts: string;
}

export interface LokiExpression {
  regexp: string;
  query: string;
}

export type DerivedFieldConfig = {
  matcherRegex: string;
  name: string;
  url?: string;
  urlDisplayLabel?: string;
  datasourceUid?: string;
};

export interface TransformerOptions {
  format?: string;
  legendFormat?: string;
  step: number;
  start: number;
  end: number;
  query: string;
  responseListLength: number;
  refId: string;
  scopedVars: ScopedVars;
  meta?: QueryResultMeta;
  valueWithRefId?: boolean;
}
