// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { size } from 'lodash';
import { BarAlignment, GraphDrawStyle, StackingMode } from '@grafana/schema';
import { ansicolor, colors } from '@grafana/ui';

import {
  AbsoluteTimeRange,
  DataFrame,
  DataQuery,
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  dateTime,
  dateTimeFormat,
  dateTimeFormatTimeAgo,
  FieldCache,
  FieldColorModeId,
  FieldConfig,
  FieldType,
  FieldWithIndex,
  findCommonLabels,
  findUniqueLabels,
  getLogLevel,
  getLogLevelFromKey,
  Labels,
  LoadingState,
  LogLevel,
  LogRowModel,
  LogsDedupStrategy,
  LogsMetaItem,
  LogsMetaKind,
  LogsModel,
  MutableDataFrame,
  rangeUtil,
  ScopedVars,
  sortInAscendingOrder,
  textUtil,
  TimeRange,
  toDataFrame,
} from '@grafana/data';
import { getThemeColor } from 'app/core/utils/colors';
import { SIPrefix } from '@grafana/data/src/valueFormats/symbolFormatters';
import { Observable, throwError, timeout } from 'rxjs';

export const LIMIT_LABEL = 'Line limit';
export const COMMON_LABELS = 'Common labels';

export const LogLevelColor = {
  [LogLevel.critical]: colors[7],
  [LogLevel.warning]: colors[1],
  [LogLevel.error]: colors[4],
  [LogLevel.info]: colors[0],
  [LogLevel.debug]: colors[5],
  [LogLevel.trace]: colors[2],
  [LogLevel.unknown]: getThemeColor('#8e8e8e', '#dde4ed'),
};

const MILLISECOND = 1;
const SECOND = 1000 * MILLISECOND;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const isoDateRegexp = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-6]\d[,\.]\d+([+-][0-2]\d:[0-5]\d|Z)/g;
function isDuplicateRow(row: LogRowModel, other: LogRowModel, strategy?: LogsDedupStrategy): boolean {
  switch (strategy) {
    case LogsDedupStrategy.exact:
      // Exact still strips dates
      return row.entry.replace(isoDateRegexp, '') === other.entry.replace(isoDateRegexp, '');

    case LogsDedupStrategy.numbers:
      return row.entry.replace(/\d/g, '') === other.entry.replace(/\d/g, '');

    case LogsDedupStrategy.signature:
      return row.entry.replace(/\w/g, '') === other.entry.replace(/\w/g, '');

    default:
      return false;
  }
}

export function dedupLogRows(rows: LogRowModel[], strategy?: LogsDedupStrategy): LogRowModel[] {
  if (strategy === LogsDedupStrategy.none) {
    return rows;
  }

  return rows.reduce((result: LogRowModel[], row: LogRowModel, index) => {
    const rowCopy = { ...row };
    const previous = result[result.length - 1];
    if (index > 0 && isDuplicateRow(row, previous, strategy)) {
      previous.duplicates!++;
    } else {
      rowCopy.duplicates = 0;
      result.push(rowCopy);
    }
    return result;
  }, []);
}

export function filterLogLevels(logRows: LogRowModel[], hiddenLogLevels: Set<LogLevel>): LogRowModel[] {
  if (hiddenLogLevels.size === 0) {
    return logRows;
  }

  return logRows.filter((row: LogRowModel) => {
    return !hiddenLogLevels.has(row.logLevel);
  });
}

export function makeDataFramesForLogs(sortedRows: LogRowModel[], bucketSize: number): DataFrame[] {
  // currently interval is rangeMs / resolution, which is too low for showing series as bars.
  // Should be solved higher up the chain when executing queries & interval calculated and not here but this is a temporary fix.

  // Graph time series by log level
  const seriesByLevel: any = {};
  const seriesList: any[] = [];

  for (const row of sortedRows) {
    let series = seriesByLevel[row.logLevel];

    if (!series) {
      seriesByLevel[row.logLevel] = series = {
        lastTs: null,
        datapoints: [],
        target: row.logLevel,
        color: LogLevelColor[row.logLevel],
      };

      seriesList.push(series);
    }

    // align time to bucket size - used Math.floor for calculation as time of the bucket
    // must be in the past (before Date.now()) to be displayed on the graph
    const time = Math.floor(row.timeEpochMs / bucketSize) * bucketSize;

    // Entry for time
    if (time === series.lastTs) {
      series.datapoints[series.datapoints.length - 1][0]++;
    } else {
      series.datapoints.push([1, time]);
      series.lastTs = time;
    }

    // add zero to other levels to aid stacking so each level series has same number of points
    for (const other of seriesList) {
      if (other !== series && other.lastTs !== time) {
        other.datapoints.push([0, time]);
        other.lastTs = time;
      }
    }
  }

  return seriesList.map((series, i) => {
    series.datapoints.sort((a: number[], b: number[]) => a[1] - b[1]);

    const data = toDataFrame(series);
    const fieldCache = new FieldCache(data);

    const valueField = fieldCache.getFirstFieldOfType(FieldType.number)!;

    data.fields[valueField.index].config.min = 0;
    data.fields[valueField.index].config.decimals = 0;
    data.fields[valueField.index].config.color = {
      mode: FieldColorModeId.Fixed,
      fixedColor: series.color,
    };

    data.fields[valueField.index].config.custom = {
      drawStyle: GraphDrawStyle.Bars,
      barAlignment: BarAlignment.Center,
      barWidthFactor: 0.9,
      barMaxWidth: 5,
      lineColor: series.color,
      pointColor: series.color,
      fillColor: series.color,
      lineWidth: 0,
      fillOpacity: 100,
      stacking: {
        mode: StackingMode.Normal,
        group: 'A',
      },
    };

    return data;
  });
}

function isLogsData(series: DataFrame) {
  return series.fields.some((f) => f.type === FieldType.time) && series.fields.some((f) => f.type === FieldType.string);
}

/**
 * Convert dataFrame into LogsModel which consists of creating separate array of log rows and metrics series. Metrics
 * series can be either already included in the dataFrame or will be computed from the log rows.
 * @param dataFrame
 * @param intervalMs In case there are no metrics series, we use this for computing it from log rows.
 */
export function dataFrameToLogsModel(
  dataFrame: DataFrame[],
  intervalMs: number | undefined,
  absoluteRange?: AbsoluteTimeRange,
  queries?: DataQuery[]
): LogsModel {
  const { logSeries } = separateLogsAndMetrics(dataFrame);
  const logsModel = logSeriesToLogsModel(logSeries);

  if (logsModel) {
    // Create histogram metrics from logs using the interval as bucket size for the line count
    if (intervalMs && logsModel.rows.length > 0) {
      const sortedRows = logsModel.rows.sort(sortInAscendingOrder);
      const { visibleRange, bucketSize, visibleRangeMs, requestedRangeMs } = getSeriesProperties(
        sortedRows,
        intervalMs,
        absoluteRange
      );
      logsModel.visibleRange = visibleRange;
      logsModel.series = makeDataFramesForLogs(sortedRows, bucketSize);

      if (logsModel.meta) {
        logsModel.meta = adjustMetaInfo(logsModel, visibleRangeMs, requestedRangeMs);
      }
    } else {
      logsModel.series = [];
    }
    logsModel.queries = queries;
    return logsModel;
  }

  return {
    hasUniqueLabels: false,
    rows: [],
    meta: [],
    series: [],
    queries,
  };
}

/**
 * Returns a clamped time range and interval based on the visible logs and the given range.
 *
 * @param sortedRows Log rows from the query response
 * @param intervalMs Dynamic data interval based on available pixel width
 * @param absoluteRange Requested time range
 * @param pxPerBar Default: 20, buckets will be rendered as bars, assuming 10px per histogram bar plus some free space around it
 */
export function getSeriesProperties(
  sortedRows: LogRowModel[],
  intervalMs: number,
  absoluteRange?: AbsoluteTimeRange,
  pxPerBar = 20,
  minimumBucketSize = 1000
) {
  let visibleRange = absoluteRange;
  let resolutionIntervalMs = intervalMs;
  let bucketSize = Math.max(resolutionIntervalMs * pxPerBar, minimumBucketSize);
  let visibleRangeMs;
  let requestedRangeMs;
  // Clamp time range to visible logs otherwise big parts of the graph might look empty
  if (absoluteRange) {
    const earliestTsLogs = sortedRows[0].timeEpochMs;

    requestedRangeMs = absoluteRange.to - absoluteRange.from;
    visibleRangeMs = absoluteRange.to - earliestTsLogs;

    if (visibleRangeMs > 0) {
      // Adjust interval bucket size for potentially shorter visible range
      const clampingFactor = visibleRangeMs / requestedRangeMs;
      resolutionIntervalMs *= clampingFactor;
      // Minimum bucketsize of 1s for nicer graphing
      bucketSize = Math.max(Math.ceil(resolutionIntervalMs * pxPerBar), minimumBucketSize);
      // makeSeriesForLogs() aligns dataspoints with time buckets, so we do the same here to not cut off data
      const adjustedEarliest = Math.floor(earliestTsLogs / bucketSize) * bucketSize;
      visibleRange = { from: adjustedEarliest, to: absoluteRange.to };
    } else {
      // We use visibleRangeMs to calculate range coverage of received logs. However, some data sources are rounding up range in requests. This means that received logs
      // can (in edge cases) be outside of the requested range and visibleRangeMs < 0. In that case, we want to change visibleRangeMs to be 1 so we can calculate coverage.
      visibleRangeMs = 1;
    }
  }
  return { bucketSize, visibleRange, visibleRangeMs, requestedRangeMs };
}

function separateLogsAndMetrics(dataFrames: DataFrame[]) {
  const metricSeries: DataFrame[] = [];
  const logSeries: DataFrame[] = [];

  for (const dataFrame of dataFrames) {
    // We want to show meta stats even if no result was returned. That's why we are pushing also data frames with no fields.
    if (isLogsData(dataFrame) || !dataFrame.fields.length) {
      logSeries.push(dataFrame);
      continue;
    }

    if (dataFrame.length > 0) {
      metricSeries.push(dataFrame);
    }
  }

  return { logSeries, metricSeries };
}

interface LogFields {
  series: DataFrame;

  timeField: FieldWithIndex;
  stringField: FieldWithIndex;
  timeNanosecondField?: FieldWithIndex;
  logLevelField?: FieldWithIndex;
  idField?: FieldWithIndex;
}

/**
 * Converts dataFrames into LogsModel. This involves merging them into one list, sorting them and computing metadata
 * like common labels.
 */
export function logSeriesToLogsModel(logSeries: DataFrame[]): LogsModel | undefined {
  if (logSeries.length === 0) {
    return undefined;
  }
  const allLabels: Labels[] = [];

  // Find the fields we care about and collect all labels
  let allSeries: LogFields[] = [];

  // We are sometimes passing data frames with no fields because we want to calculate correct meta stats.
  // Therefore we need to filter out series with no fields. These series are used only for meta stats calculation.
  const seriesWithFields = logSeries.filter((series) => series.fields.length);

  if (seriesWithFields.length) {
    allSeries = seriesWithFields.map((series) => {
      const fieldCache = new FieldCache(series);
      const stringField = fieldCache.getFirstFieldOfType(FieldType.string);

      if (stringField?.labels) {
        allLabels.push(stringField.labels);
      }

      return {
        series,
        timeField: fieldCache.getFirstFieldOfType(FieldType.time),
        timeNanosecondField: fieldCache.hasFieldWithNameAndType('tsNs', FieldType.time)
          ? fieldCache.getFieldByName('tsNs')
          : undefined,
        stringField,
        logLevelField: fieldCache.getFieldByName('level'),
        idField: getIdField(fieldCache),
      } as LogFields;
    });
  }

  const commonLabels = allLabels.length > 0 ? findCommonLabels(allLabels) : {};

  const rows: LogRowModel[] = [];
  let hasUniqueLabels = false;

  for (const info of allSeries) {
    const { timeField, timeNanosecondField, stringField, logLevelField, idField, series } = info;
    const labels = stringField.labels;
    const uniqueLabels = findUniqueLabels(labels, commonLabels);
    if (Object.keys(uniqueLabels).length > 0) {
      hasUniqueLabels = true;
    }

    let seriesLogLevel: LogLevel | undefined = undefined;
    if (labels && Object.keys(labels).indexOf('level') !== -1) {
      seriesLogLevel = getLogLevelFromKey(labels['level']);
    }

    for (let j = 0; j < series.length; j++) {
      const ts = timeField.values.get(j);
      const time = dateTime(ts);
      const tsNs = timeNanosecondField ? timeNanosecondField.values.get(j) : undefined;
      const timeEpochNs = tsNs ? tsNs : time.valueOf() + '000000';

      // In edge cases, this can be undefined. If undefined, we want to replace it with empty string.
      const messageValue: unknown = stringField.values.get(j) ?? '';
      // This should be string but sometimes isn't (eg elastic) because the dataFrame is not strongly typed.
      const message: string = typeof messageValue === 'string' ? messageValue : JSON.stringify(messageValue);

      const hasAnsi = textUtil.hasAnsiCodes(message);

      const hasUnescapedContent = !!message.match(/\\n|\\t|\\r/);

      const searchWords = series.meta && series.meta.searchWords ? series.meta.searchWords : [];
      const entry = hasAnsi ? ansicolor.strip(message) : message;

      let logLevel = LogLevel.unknown;
      if (logLevelField && logLevelField.values.get(j)) {
        logLevel = getLogLevelFromKey(logLevelField.values.get(j));
      } else if (seriesLogLevel) {
        logLevel = seriesLogLevel;
      } else {
        logLevel = getLogLevel(entry);
      }
      rows.push({
        entryFieldIndex: stringField.index,
        rowIndex: j,
        dataFrame: series,
        logLevel,
        timeFromNow: dateTimeFormatTimeAgo(ts),
        timeEpochMs: time.valueOf(),
        timeEpochNs,
        timeLocal: dateTimeFormat(ts, { timeZone: 'browser' }),
        timeUtc: dateTimeFormat(ts, { timeZone: 'utc' }),
        uniqueLabels,
        hasAnsi,
        hasUnescapedContent,
        searchWords,
        entry,
        raw: message,
        labels: stringField.labels || {},
        uid: idField ? idField.values.get(j) : j.toString(),
      });
    }
  }

  // Meta data to display in status
  const meta: LogsMetaItem[] = [];
  if (size(commonLabels) > 0) {
    meta.push({
      label: COMMON_LABELS,
      value: commonLabels,
      kind: LogsMetaKind.LabelsMap,
    });
  }

  const limits = logSeries.filter((series) => series.meta && series.meta.limit);
  const limitValue = Object.values(
    limits.reduce((acc: any, elem: any) => {
      acc[elem.refId] = elem.meta.limit;
      return acc;
    }, {})
  ).reduce((acc: number, elem: any) => (acc += elem), 0) as number;

  if (limitValue > 0) {
    meta.push({
      label: LIMIT_LABEL,
      value: limitValue,
      kind: LogsMetaKind.Number,
    });
  }

  let totalBytes = 0;
  const queriesVisited: { [refId: string]: boolean } = {};
  // To add just 1 error message
  let errorMetaAdded = false;

  for (const series of logSeries) {
    const totalBytesKey = series.meta?.custom?.lokiQueryStatKey;
    const { refId } = series; // Stats are per query, keeping track by refId

    if (!errorMetaAdded && series.meta?.custom?.error) {
      meta.push({
        label: '',
        value: series.meta?.custom.error,
        kind: LogsMetaKind.Error,
      });
      errorMetaAdded = true;
    }

    if (refId && !queriesVisited[refId]) {
      if (totalBytesKey && series.meta?.stats) {
        const byteStat = series.meta.stats.find((stat) => stat.displayName === totalBytesKey);
        if (byteStat) {
          totalBytes += byteStat.value;
        }
      }

      queriesVisited[refId] = true;
    }
  }

  if (totalBytes > 0) {
    const { text, suffix } = SIPrefix('B')(totalBytes);
    meta.push({
      label: 'Total bytes processed',
      value: `${text} ${suffix}`,
      kind: LogsMetaKind.String,
    });
  }

  return {
    hasUniqueLabels,
    meta,
    rows,
  };
}

function getIdField(fieldCache: FieldCache): FieldWithIndex | undefined {
  const idFieldNames = ['id'];
  for (const fieldName of idFieldNames) {
    const idField = fieldCache.getFieldByName(fieldName);
    if (idField) {
      return idField;
    }
  }
  return undefined;
}

// Used to add additional information to Line limit meta info
function adjustMetaInfo(logsModel: LogsModel, visibleRangeMs?: number, requestedRangeMs?: number): LogsMetaItem[] {
  let logsModelMeta = [...logsModel.meta!];

  const limitIndex = logsModelMeta.findIndex((meta) => meta.label === LIMIT_LABEL);
  const limit = limitIndex >= 0 && logsModelMeta[limitIndex]?.value;

  if (limit && limit > 0) {
    let metaLimitValue;

    if (limit === logsModel.rows.length && visibleRangeMs && requestedRangeMs) {
      const coverage = ((visibleRangeMs / requestedRangeMs) * 100).toFixed(2);

      metaLimitValue = `${limit} reached, received logs cover ${coverage}% (${rangeUtil.msRangeToTimeString(
        visibleRangeMs
      )}) of your selected time range (${rangeUtil.msRangeToTimeString(requestedRangeMs)})`;
    } else {
      metaLimitValue = `${limit} (${logsModel.rows.length} returned)`;
    }

    logsModelMeta[limitIndex] = {
      label: LIMIT_LABEL,
      value: metaLimitValue,
      kind: LogsMetaKind.String,
    };
  }

  return logsModelMeta;
}

/**
 * Returns field configuration used to render logs volume bars
 */
function getLogVolumeFieldConfig(level: LogLevel, oneLevelDetected: boolean) {
  const name = oneLevelDetected && level === LogLevel.unknown ? 'logs' : level;
  const color = LogLevelColor[level];
  return {
    displayNameFromDS: name,
    color: {
      mode: FieldColorModeId.Fixed,
      fixedColor: color,
    },
    custom: {
      drawStyle: GraphDrawStyle.Bars,
      barAlignment: BarAlignment.Center,
      lineColor: color,
      pointColor: color,
      fillColor: color,
      lineWidth: 1,
      fillOpacity: 100,
      stacking: {
        mode: StackingMode.Normal,
        group: 'A',
      },
    },
  };
}

/**
 * Take multiple data frames, sum up values and group by level.
 * Return a list of data frames, each representing single level.
 */
export function aggregateRawLogsVolume(
  rawLogsVolume: DataFrame[],
  extractLevel: (dataFrame: DataFrame) => LogLevel
): DataFrame[] {
  const logsVolumeByLevelMap: Partial<Record<LogLevel, DataFrame[]>> = {};
  rawLogsVolume.forEach((dataFrame) => {
    const level = extractLevel(dataFrame);
    if (!logsVolumeByLevelMap[level]) {
      logsVolumeByLevelMap[level] = [];
    }
    logsVolumeByLevelMap[level]!.push(dataFrame);
  });

  return Object.keys(logsVolumeByLevelMap).map((level: string) => {
    return aggregateFields(
      logsVolumeByLevelMap[level as LogLevel]!,
      getLogVolumeFieldConfig(level as LogLevel, Object.keys(logsVolumeByLevelMap).length === 1)
    );
  });
}

/**
 * Aggregate multiple data frames into a single data frame by adding values.
 * Multiple data frames for the same level are passed here to get a single
 * data frame for a given level. Aggregation by level happens in aggregateRawLogsVolume()
 */
function aggregateFields(dataFrames: DataFrame[], config: FieldConfig): DataFrame {
  const aggregatedDataFrame = new MutableDataFrame();
  if (!dataFrames.length) {
    return aggregatedDataFrame;
  }

  const totalLength = dataFrames[0].length;
  const timeField = new FieldCache(dataFrames[0]).getFirstFieldOfType(FieldType.time);

  if (!timeField) {
    return aggregatedDataFrame;
  }

  aggregatedDataFrame.addField({ name: 'Time', type: FieldType.time }, totalLength);
  aggregatedDataFrame.addField({ name: 'Value', type: FieldType.number, config }, totalLength);

  dataFrames.forEach((dataFrame) => {
    dataFrame.fields.forEach((field) => {
      if (field.type === FieldType.number) {
        for (let pointIndex = 0; pointIndex < totalLength; pointIndex++) {
          const currentValue = aggregatedDataFrame.get(pointIndex).Value;
          const valueToAdd = field.values.get(pointIndex);
          const totalValue =
            currentValue === null && valueToAdd === null ? null : (currentValue || 0) + (valueToAdd || 0);
          aggregatedDataFrame.set(pointIndex, { Value: totalValue, Time: timeField.values.get(pointIndex) });
        }
      }
    });
  });

  return aggregatedDataFrame;
}

const LOGS_VOLUME_QUERY_DEFAULT_TIMEOUT = 60000;

type LogsVolumeQueryOptions<T extends DataQuery> = {
  timeout?: number;
  extractLevel: (dataFrame: DataFrame) => LogLevel;
  targets: T[];
  range: TimeRange;
};

/**
 * Creates an observable, which makes requests to get logs volume and aggregates results.
 */
export function queryLogsVolume<T extends DataQuery>(
  datasource: DataSourceApi<T, any, any>,
  logsVolumeRequest: DataQueryRequest<T>,
  options: LogsVolumeQueryOptions<T>
): Observable<DataQueryResponse> {
  const timespan = options.range.to.valueOf() - options.range.from.valueOf();
  const intervalInfo = getIntervalInfo(logsVolumeRequest.scopedVars, timespan);
  logsVolumeRequest.interval = intervalInfo.interval;
  logsVolumeRequest.scopedVars.__interval = { value: intervalInfo.interval, text: intervalInfo.interval };
  if (intervalInfo.intervalMs !== undefined) {
    logsVolumeRequest.intervalMs = intervalInfo.intervalMs;
    logsVolumeRequest.scopedVars.__interval_ms = { value: intervalInfo.intervalMs, text: intervalInfo.intervalMs };
  }

  return new Observable((observer) => {
    let rawLogsVolume: DataFrame[] = [];
    observer.next({
      state: LoadingState.Loading,
      error: undefined,
      data: [],
    });

    const subscription = (datasource.query(logsVolumeRequest) as Observable<DataQueryResponse>)
      .pipe(
        timeout({
          each: options.timeout || LOGS_VOLUME_QUERY_DEFAULT_TIMEOUT,
          with: () => throwError(new Error('Request timed-out. Please make your query more specific and try again.')),
        })
      )
      .subscribe({
        complete: () => {
          const aggregatedLogsVolume = aggregateRawLogsVolume(rawLogsVolume, options.extractLevel);
          if (aggregatedLogsVolume[0]) {
            aggregatedLogsVolume[0].meta = {
              custom: {
                targets: options.targets,
                absoluteRange: { from: options.range.from.valueOf(), to: options.range.to.valueOf() },
              },
            };
          }
          observer.next({
            state: LoadingState.Done,
            error: undefined,
            data: aggregatedLogsVolume,
          });
          observer.complete();
        },
        next: (dataQueryResponse: DataQueryResponse) => {
          rawLogsVolume = rawLogsVolume.concat(dataQueryResponse.data.map(toDataFrame));
        },
        error: (error) => {
          const errorMessage = error.data?.message || error.statusText || error.message;
          console.error('Log volume query failed with error: ', errorMessage);
          observer.next({
            state: LoadingState.Error,
            error: error,
            data: [],
          });
          observer.error(error);
        },
      });
    return () => {
      subscription?.unsubscribe();
    };
  });
}

function getIntervalInfo(scopedVars: ScopedVars, timespanMs: number): { interval: string; intervalMs?: number } {
  if (scopedVars.__interval) {
    let intervalMs: number = scopedVars.__interval_ms.value;
    let interval = '';
    // below 5 seconds we force the resolution to be per 1ms as interval in scopedVars is not less than 10ms
    if (timespanMs < SECOND * 5) {
      intervalMs = MILLISECOND;
      interval = '1ms';
    } else if (intervalMs > HOUR) {
      intervalMs = DAY;
      interval = '1d';
    } else if (intervalMs > MINUTE) {
      intervalMs = HOUR;
      interval = '1h';
    } else if (intervalMs > SECOND) {
      intervalMs = MINUTE;
      interval = '1m';
    } else {
      intervalMs = SECOND;
      interval = '1s';
    }

    return { interval, intervalMs };
  } else {
    return { interval: '$__interval' };
  }
}
