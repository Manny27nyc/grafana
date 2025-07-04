// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { DataFrame, DataLink, DataQueryRequest, DataQueryResponse, ScopedVars, TimeRange } from '@grafana/data';
import { CloudWatchLogsQuery, CloudWatchQuery } from '../types';
import { AwsUrl, encodeUrl } from '../aws_url';
import { getDataSourceSrv } from '@grafana/runtime';

type ReplaceFn = (
  target?: string,
  scopedVars?: ScopedVars,
  displayErrorIfIsMultiTemplateVariable?: boolean,
  fieldName?: string
) => string;

export async function addDataLinksToLogsResponse(
  response: DataQueryResponse,
  request: DataQueryRequest<CloudWatchQuery>,
  range: TimeRange,
  replaceFn: ReplaceFn,
  getRegion: (region: string) => string,
  tracingDatasourceUid?: string
): Promise<void> {
  const replace = (target: string, fieldName?: string) => replaceFn(target, request.scopedVars, true, fieldName);

  for (const dataFrame of response.data as DataFrame[]) {
    const curTarget = request.targets.find((target) => target.refId === dataFrame.refId) as CloudWatchLogsQuery;
    const interpolatedRegion = getRegion(replace(curTarget.region ?? '', 'region'));

    for (const field of dataFrame.fields) {
      if (field.name === '@xrayTraceId' && tracingDatasourceUid) {
        getRegion(replace(curTarget.region ?? '', 'region'));
        const xrayLink = await createInternalXrayLink(tracingDatasourceUid, interpolatedRegion);
        if (xrayLink) {
          field.config.links = [xrayLink];
        }
      } else {
        // Right now we add generic link to open the query in xray console to every field so it shows in the logs row
        // details. Unfortunately this also creates link for all values inside table which look weird.
        field.config.links = [createAwsConsoleLink(curTarget, range, interpolatedRegion, replace)];
      }
    }
  }
}

async function createInternalXrayLink(datasourceUid: string, region: string) {
  let ds;
  try {
    ds = await getDataSourceSrv().get(datasourceUid);
  } catch (e) {
    console.error('Could not load linked xray data source, it was probably deleted after it was linked', e);
    return undefined;
  }

  return {
    title: ds.name,
    url: '',
    internal: {
      query: { query: '${__value.raw}', queryType: 'getTrace', region: region },
      datasourceUid: datasourceUid,
      datasourceName: ds.name,
    },
  } as DataLink;
}

function createAwsConsoleLink(
  target: CloudWatchLogsQuery,
  range: TimeRange,
  region: string,
  replace: (target: string, fieldName?: string) => string
) {
  const interpolatedExpression = target.expression ? replace(target.expression) : '';
  const interpolatedGroups = target.logGroupNames?.map((logGroup: string) => replace(logGroup, 'log groups')) ?? [];

  const urlProps: AwsUrl = {
    end: range.to.toISOString(),
    start: range.from.toISOString(),
    timeType: 'ABSOLUTE',
    tz: 'UTC',
    editorString: interpolatedExpression,
    isLiveTail: false,
    source: interpolatedGroups,
  };

  const encodedUrl = encodeUrl(urlProps, region);
  return {
    url: encodedUrl,
    title: 'View in CloudWatch console',
    targetBlank: true,
  };
}
