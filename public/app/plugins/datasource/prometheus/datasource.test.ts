// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { map, cloneDeep } from 'lodash';
import { of, throwError } from 'rxjs';
import {
  CoreApp,
  DataQueryRequest,
  DataQueryResponseData,
  DataSourceInstanceSettings,
  dateTime,
  getFieldDisplayName,
  LoadingState,
  toDataFrame,
} from '@grafana/data';

import {
  alignRange,
  extractRuleMappingFromGroups,
  PrometheusDatasource,
  prometheusRegularEscape,
  prometheusSpecialRegexEscape,
} from './datasource';
import { PromOptions, PromQuery } from './types';
import { VariableHide } from '../../../features/variables/types';
import { describe } from '../../../../test/lib/common';
import { QueryOptions } from 'app/types';

const fetchMock = jest.fn().mockReturnValue(of(createDefaultPromResponse()));

jest.mock('./metric_find_query');
jest.mock('@grafana/runtime', () => ({
  // @ts-ignore
  ...jest.requireActual('@grafana/runtime'),
  getBackendSrv: () => ({
    fetch: fetchMock,
  }),
}));

const templateSrvStub = {
  getAdhocFilters: jest.fn(() => [] as any[]),
  replace: jest.fn((a: string, ...rest: any) => a),
};

const timeSrvStub = {
  timeRange(): any {
    return {
      from: dateTime(1531468681),
      to: dateTime(1531489712),
    };
  },
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('PrometheusDatasource', () => {
  let ds: PrometheusDatasource;
  const instanceSettings = ({
    url: 'proxied',
    directUrl: 'direct',
    user: 'test',
    password: 'mupp',
    jsonData: {
      customQueryParameters: '',
    } as any,
  } as unknown) as DataSourceInstanceSettings<PromOptions>;

  beforeEach(() => {
    ds = new PrometheusDatasource(instanceSettings, templateSrvStub as any, timeSrvStub as any);
  });

  describe('Query', () => {
    it('returns empty array when no queries', async () => {
      await expect(ds.query(createDataRequest([]))).toEmitValuesWith((response) => {
        expect(response[0].data).toEqual([]);
        expect(response[0].state).toBe(LoadingState.Done);
      });
    });

    it('performs time series queries', async () => {
      await expect(ds.query(createDataRequest([{}]))).toEmitValuesWith((response) => {
        expect(response[0].data.length).not.toBe(0);
        expect(response[0].state).toBe(LoadingState.Done);
      });
    });

    it('with 2 queries and used from Explore, sends results as they arrive', async () => {
      await expect(ds.query(createDataRequest([{}, {}], { app: CoreApp.Explore }))).toEmitValuesWith((response) => {
        expect(response[0].data.length).not.toBe(0);
        expect(response[0].state).toBe(LoadingState.Loading);
        expect(response[1].state).toBe(LoadingState.Done);
      });
    });

    it('with 2 queries and used from Panel, waits for all to finish until sending Done status', async () => {
      await expect(ds.query(createDataRequest([{}, {}], { app: CoreApp.Dashboard }))).toEmitValuesWith((response) => {
        expect(response[0].data.length).not.toBe(0);
        expect(response[0].state).toBe(LoadingState.Done);
      });
    });
  });

  describe('Datasource metadata requests', () => {
    it('should perform a GET request with the default config', () => {
      ds.metadataRequest('/foo', { bar: 'baz baz', foo: 'foo' });
      expect(fetchMock.mock.calls.length).toBe(1);
      expect(fetchMock.mock.calls[0][0].method).toBe('GET');
      expect(fetchMock.mock.calls[0][0].url).toContain('bar=baz%20baz&foo=foo');
    });
    it('should still perform a GET request with the DS HTTP method set to POST and not POST-friendly endpoint', () => {
      const postSettings = cloneDeep(instanceSettings);
      postSettings.jsonData.httpMethod = 'POST';
      const promDs = new PrometheusDatasource(postSettings, templateSrvStub as any, timeSrvStub as any);
      promDs.metadataRequest('/foo');
      expect(fetchMock.mock.calls.length).toBe(1);
      expect(fetchMock.mock.calls[0][0].method).toBe('GET');
    });
    it('should try to perform a POST request with the DS HTTP method set to POST and POST-friendly endpoint', () => {
      const postSettings = cloneDeep(instanceSettings);
      postSettings.jsonData.httpMethod = 'POST';
      const promDs = new PrometheusDatasource(postSettings, templateSrvStub as any, timeSrvStub as any);
      promDs.metadataRequest('api/v1/series', { bar: 'baz baz', foo: 'foo' });
      expect(fetchMock.mock.calls.length).toBe(1);
      expect(fetchMock.mock.calls[0][0].method).toBe('POST');
      expect(fetchMock.mock.calls[0][0].url).not.toContain('bar=baz%20baz&foo=foo');
      expect(fetchMock.mock.calls[0][0].data).toEqual({ bar: 'baz baz', foo: 'foo' });
    });
  });

  describe('customQueryParams', () => {
    const target = { expr: 'test{job="testjob"}', format: 'time_series', refId: '' };
    function makeQuery(target: PromQuery) {
      return {
        range: { from: time({ seconds: 63 }), to: time({ seconds: 183 }) },
        targets: [target],
        interval: '60s',
      } as any;
    }

    describe('with GET http method', () => {
      const promDs = new PrometheusDatasource(
        { ...instanceSettings, jsonData: { customQueryParameters: 'customQuery=123', httpMethod: 'GET' } as any },
        templateSrvStub as any,
        timeSrvStub as any
      );

      it('added to metadata request', () => {
        promDs.metadataRequest('/foo');
        expect(fetchMock.mock.calls.length).toBe(1);
        expect(fetchMock.mock.calls[0][0].url).toBe('proxied/foo?customQuery=123');
      });

      it('adds params to timeseries query', () => {
        promDs.query(makeQuery(target));
        expect(fetchMock.mock.calls.length).toBe(1);
        expect(fetchMock.mock.calls[0][0].url).toBe(
          'proxied/api/v1/query_range?query=test%7Bjob%3D%22testjob%22%7D&start=60&end=180&step=60&customQuery=123'
        );
      });
      it('adds params to exemplars query', () => {
        promDs.query(makeQuery({ ...target, exemplar: true }));
        // We do also range query for single exemplars target
        expect(fetchMock.mock.calls.length).toBe(2);
        expect(fetchMock.mock.calls[0][0].url).toContain('&customQuery=123');
        expect(fetchMock.mock.calls[1][0].url).toContain('&customQuery=123');
      });

      it('adds params to instant query', () => {
        promDs.query(makeQuery({ ...target, instant: true }));
        expect(fetchMock.mock.calls.length).toBe(1);
        expect(fetchMock.mock.calls[0][0].url).toContain('&customQuery=123');
      });
    });

    describe('with POST http method', () => {
      const promDs = new PrometheusDatasource(
        { ...instanceSettings, jsonData: { customQueryParameters: 'customQuery=123', httpMethod: 'POST' } as any },
        templateSrvStub as any,
        timeSrvStub as any
      );

      it('added to metadata request with non-POST endpoint', () => {
        promDs.metadataRequest('/foo');
        expect(fetchMock.mock.calls.length).toBe(1);
        expect(fetchMock.mock.calls[0][0].url).toBe('proxied/foo?customQuery=123');
      });

      it('added to metadata request with POST endpoint', () => {
        promDs.metadataRequest('/api/v1/labels');
        expect(fetchMock.mock.calls.length).toBe(1);
        expect(fetchMock.mock.calls[0][0].url).toBe('proxied/api/v1/labels');
        expect(fetchMock.mock.calls[0][0].data.customQuery).toBe('123');
      });

      it('adds params to timeseries query', () => {
        promDs.query(makeQuery(target));
        expect(fetchMock.mock.calls.length).toBe(1);
        expect(fetchMock.mock.calls[0][0].url).toBe('proxied/api/v1/query_range');
        expect(fetchMock.mock.calls[0][0].data).toEqual({
          customQuery: '123',
          query: 'test{job="testjob"}',
          step: 60,
          end: 180,
          start: 60,
        });
      });
      it('adds params to exemplars query', () => {
        promDs.query(makeQuery({ ...target, exemplar: true }));
        // We do also range query for single exemplars target
        expect(fetchMock.mock.calls.length).toBe(2);
        expect(fetchMock.mock.calls[0][0].data.customQuery).toBe('123');
        expect(fetchMock.mock.calls[1][0].data.customQuery).toBe('123');
      });

      it('adds params to instant query', () => {
        promDs.query(makeQuery({ ...target, instant: true }));
        expect(fetchMock.mock.calls.length).toBe(1);
        expect(fetchMock.mock.calls[0][0].data.customQuery).toBe('123');
      });
    });
  });

  describe('When using adhoc filters', () => {
    const DEFAULT_QUERY_EXPRESSION = 'metric{job="foo"} - metric';
    const target = { expr: DEFAULT_QUERY_EXPRESSION };
    const originalAdhocFiltersMock = templateSrvStub.getAdhocFilters();

    afterAll(() => {
      templateSrvStub.getAdhocFilters.mockReturnValue(originalAdhocFiltersMock);
    });

    it('should not modify expression with no filters', () => {
      const result = ds.createQuery(target as any, { interval: '15s' } as any, 0, 0);
      expect(result).toMatchObject({ expr: DEFAULT_QUERY_EXPRESSION });
    });

    it('should add filters to expression', () => {
      templateSrvStub.getAdhocFilters.mockReturnValue([
        {
          key: 'k1',
          operator: '=',
          value: 'v1',
        },
        {
          key: 'k2',
          operator: '!=',
          value: 'v2',
        },
      ]);
      const result = ds.createQuery(target as any, { interval: '15s' } as any, 0, 0);
      expect(result).toMatchObject({ expr: 'metric{job="foo",k1="v1",k2!="v2"} - metric{k1="v1",k2!="v2"}' });
    });

    it('should add escaping if needed to regex filter expressions', () => {
      templateSrvStub.getAdhocFilters.mockReturnValue([
        {
          key: 'k1',
          operator: '=~',
          value: 'v.*',
        },
        {
          key: 'k2',
          operator: '=~',
          value: `v'.*`,
        },
      ]);
      const result = ds.createQuery(target as any, { interval: '15s' } as any, 0, 0);
      expect(result).toMatchObject({
        expr: `metric{job="foo",k1=~"v.*",k2=~"v\\\\'.*"} - metric{k1=~"v.*",k2=~"v\\\\'.*"}`,
      });
    });
  });

  describe('When converting prometheus histogram to heatmap format', () => {
    let query: any;
    beforeEach(() => {
      query = {
        range: { from: dateTime(1443454528000), to: dateTime(1443454528000) },
        targets: [{ expr: 'test{job="testjob"}', format: 'heatmap', legendFormat: '{{le}}' }],
        interval: '1s',
      };
    });

    it('should convert cumulative histogram to ordinary', async () => {
      const resultMock = [
        {
          metric: { __name__: 'metric', job: 'testjob', le: '10' },
          values: [
            [1443454528.0, '10'],
            [1443454528.0, '10'],
          ],
        },
        {
          metric: { __name__: 'metric', job: 'testjob', le: '20' },
          values: [
            [1443454528.0, '20'],
            [1443454528.0, '10'],
          ],
        },
        {
          metric: { __name__: 'metric', job: 'testjob', le: '30' },
          values: [
            [1443454528.0, '25'],
            [1443454528.0, '10'],
          ],
        },
      ];
      const responseMock = { data: { data: { result: resultMock } } };

      ds.performTimeSeriesQuery = jest.fn().mockReturnValue(of(responseMock));
      await expect(ds.query(query)).toEmitValuesWith((result) => {
        const results = result[0].data;
        expect(results[0].fields[1].values.toArray()).toEqual([10, 10]);
        expect(results[1].fields[1].values.toArray()).toEqual([10, 0]);
        expect(results[2].fields[1].values.toArray()).toEqual([5, 0]);
      });
    });

    it('should sort series by label value', async () => {
      const resultMock = [
        {
          metric: { __name__: 'metric', job: 'testjob', le: '2' },
          values: [
            [1443454528.0, '10'],
            [1443454528.0, '10'],
          ],
        },
        {
          metric: { __name__: 'metric', job: 'testjob', le: '4' },
          values: [
            [1443454528.0, '20'],
            [1443454528.0, '10'],
          ],
        },
        {
          metric: { __name__: 'metric', job: 'testjob', le: '+Inf' },
          values: [
            [1443454528.0, '25'],
            [1443454528.0, '10'],
          ],
        },
        {
          metric: { __name__: 'metric', job: 'testjob', le: '1' },
          values: [
            [1443454528.0, '25'],
            [1443454528.0, '10'],
          ],
        },
      ];
      const responseMock = { data: { data: { result: resultMock } } };

      const expected = ['1', '2', '4', '+Inf'];

      ds.performTimeSeriesQuery = jest.fn().mockReturnValue(of(responseMock));
      await expect(ds.query(query)).toEmitValuesWith((result) => {
        const seriesLabels = map(result[0].data, 'name');
        expect(seriesLabels).toEqual(expected);
      });
    });
  });

  describe('alignRange', () => {
    it('does not modify already aligned intervals with perfect step', () => {
      const range = alignRange(0, 3, 3, 0);
      expect(range.start).toEqual(0);
      expect(range.end).toEqual(3);
    });

    it('does modify end-aligned intervals to reflect number of steps possible', () => {
      const range = alignRange(1, 6, 3, 0);
      expect(range.start).toEqual(0);
      expect(range.end).toEqual(6);
    });

    it('does align intervals that are a multiple of steps', () => {
      const range = alignRange(1, 4, 3, 0);
      expect(range.start).toEqual(0);
      expect(range.end).toEqual(3);
    });

    it('does align intervals that are not a multiple of steps', () => {
      const range = alignRange(1, 5, 3, 0);
      expect(range.start).toEqual(0);
      expect(range.end).toEqual(3);
    });

    it('does align intervals with local midnight -UTC offset', () => {
      //week range, location 4+ hours UTC offset, 24h step time
      const range = alignRange(4 * 60 * 60, (7 * 24 + 4) * 60 * 60, 24 * 60 * 60, -4 * 60 * 60); //04:00 UTC, 7 day range
      expect(range.start).toEqual(4 * 60 * 60);
      expect(range.end).toEqual((7 * 24 + 4) * 60 * 60);
    });

    it('does align intervals with local midnight +UTC offset', () => {
      //week range, location 4- hours UTC offset, 24h step time
      const range = alignRange(20 * 60 * 60, (8 * 24 - 4) * 60 * 60, 24 * 60 * 60, 4 * 60 * 60); //20:00 UTC on day1, 7 days later is 20:00 on day8
      expect(range.start).toEqual(20 * 60 * 60);
      expect(range.end).toEqual((8 * 24 - 4) * 60 * 60);
    });
  });

  describe('extractRuleMappingFromGroups()', () => {
    it('returns empty mapping for no rule groups', () => {
      expect(extractRuleMappingFromGroups([])).toEqual({});
    });

    it('returns a mapping for recording rules only', () => {
      const groups = [
        {
          rules: [
            {
              name: 'HighRequestLatency',
              query: 'job:request_latency_seconds:mean5m{job="myjob"} > 0.5',
              type: 'alerting',
            },
            {
              name: 'job:http_inprogress_requests:sum',
              query: 'sum(http_inprogress_requests) by (job)',
              type: 'recording',
            },
          ],
          file: '/rules.yaml',
          interval: 60,
          name: 'example',
        },
      ];
      const mapping = extractRuleMappingFromGroups(groups);
      expect(mapping).toEqual({ 'job:http_inprogress_requests:sum': 'sum(http_inprogress_requests) by (job)' });
    });
  });

  describe('Prometheus regular escaping', () => {
    it('should not escape non-string', () => {
      expect(prometheusRegularEscape(12)).toEqual(12);
    });

    it('should not escape simple string', () => {
      expect(prometheusRegularEscape('cryptodepression')).toEqual('cryptodepression');
    });

    it("should escape '", () => {
      expect(prometheusRegularEscape("looking'glass")).toEqual("looking\\\\'glass");
    });

    it('should escape \\', () => {
      expect(prometheusRegularEscape('looking\\glass')).toEqual('looking\\\\glass');
    });

    it('should escape multiple characters', () => {
      expect(prometheusRegularEscape("'looking'glass'")).toEqual("\\\\'looking\\\\'glass\\\\'");
    });

    it('should escape multiple different characters', () => {
      expect(prometheusRegularEscape("'loo\\king'glass'")).toEqual("\\\\'loo\\\\king\\\\'glass\\\\'");
    });
  });

  describe('Prometheus regexes escaping', () => {
    it('should not escape simple string', () => {
      expect(prometheusSpecialRegexEscape('cryptodepression')).toEqual('cryptodepression');
    });

    it('should escape $^*+?.()|\\', () => {
      expect(prometheusSpecialRegexEscape("looking'glass")).toEqual("looking\\\\'glass");
      expect(prometheusSpecialRegexEscape('looking{glass')).toEqual('looking\\\\{glass');
      expect(prometheusSpecialRegexEscape('looking}glass')).toEqual('looking\\\\}glass');
      expect(prometheusSpecialRegexEscape('looking[glass')).toEqual('looking\\\\[glass');
      expect(prometheusSpecialRegexEscape('looking]glass')).toEqual('looking\\\\]glass');
      expect(prometheusSpecialRegexEscape('looking$glass')).toEqual('looking\\\\$glass');
      expect(prometheusSpecialRegexEscape('looking^glass')).toEqual('looking\\\\^glass');
      expect(prometheusSpecialRegexEscape('looking*glass')).toEqual('looking\\\\*glass');
      expect(prometheusSpecialRegexEscape('looking+glass')).toEqual('looking\\\\+glass');
      expect(prometheusSpecialRegexEscape('looking?glass')).toEqual('looking\\\\?glass');
      expect(prometheusSpecialRegexEscape('looking.glass')).toEqual('looking\\\\.glass');
      expect(prometheusSpecialRegexEscape('looking(glass')).toEqual('looking\\\\(glass');
      expect(prometheusSpecialRegexEscape('looking)glass')).toEqual('looking\\\\)glass');
      expect(prometheusSpecialRegexEscape('looking\\glass')).toEqual('looking\\\\\\\\glass');
      expect(prometheusSpecialRegexEscape('looking|glass')).toEqual('looking\\\\|glass');
    });

    it('should escape multiple special characters', () => {
      expect(prometheusSpecialRegexEscape('+looking$glass?')).toEqual('\\\\+looking\\\\$glass\\\\?');
    });
  });

  describe('When interpolating variables', () => {
    let customVariable: any;
    beforeEach(() => {
      customVariable = {
        id: '',
        global: false,
        multi: false,
        includeAll: false,
        allValue: null,
        query: '',
        options: [],
        current: {},
        name: '',
        type: 'custom',
        label: null,
        hide: VariableHide.dontHide,
        skipUrlSync: false,
        index: -1,
        initLock: null,
      };
    });

    describe('and value is a string', () => {
      it('should only escape single quotes', () => {
        expect(ds.interpolateQueryExpr("abc'$^*{}[]+?.()|", customVariable)).toEqual("abc\\\\'$^*{}[]+?.()|");
      });
    });

    describe('and value is a number', () => {
      it('should return a number', () => {
        expect(ds.interpolateQueryExpr(1000 as any, customVariable)).toEqual(1000);
      });
    });

    describe('and variable allows multi-value', () => {
      beforeEach(() => {
        customVariable.multi = true;
      });

      it('should regex escape values if the value is a string', () => {
        expect(ds.interpolateQueryExpr('looking*glass', customVariable)).toEqual('looking\\\\*glass');
      });

      it('should return pipe separated values if the value is an array of strings', () => {
        expect(ds.interpolateQueryExpr(['a|bc', 'de|f'], customVariable)).toEqual('(a\\\\|bc|de\\\\|f)');
      });

      it('should return 1 regex escaped value if there is just 1 value in an array of strings', () => {
        expect(ds.interpolateQueryExpr(['looking*glass'], customVariable)).toEqual('looking\\\\*glass');
      });
    });

    describe('and variable allows all', () => {
      beforeEach(() => {
        customVariable.includeAll = true;
      });

      it('should regex escape values if the array is a string', () => {
        expect(ds.interpolateQueryExpr('looking*glass', customVariable)).toEqual('looking\\\\*glass');
      });

      it('should return pipe separated values if the value is an array of strings', () => {
        expect(ds.interpolateQueryExpr(['a|bc', 'de|f'], customVariable)).toEqual('(a\\\\|bc|de\\\\|f)');
      });

      it('should return 1 regex escaped value if there is just 1 value in an array of strings', () => {
        expect(ds.interpolateQueryExpr(['looking*glass'], customVariable)).toEqual('looking\\\\*glass');
      });
    });
  });

  describe('interpolateVariablesInQueries', () => {
    it('should call replace function 2 times', () => {
      const query = {
        expr: 'test{job="testjob"}',
        format: 'time_series',
        interval: '$Interval',
        refId: 'A',
      };
      const interval = '10m';
      templateSrvStub.replace.mockReturnValue(interval);

      const queries = ds.interpolateVariablesInQueries([query], { Interval: { text: interval, value: interval } });
      expect(templateSrvStub.replace).toBeCalledTimes(2);
      expect(queries[0].interval).toBe(interval);
    });
  });

  describe('applyTemplateVariables', () => {
    const originalAdhocFiltersMock = templateSrvStub.getAdhocFilters();
    const originalReplaceMock = jest.fn((a: string, ...rest: any) => a);
    afterAll(() => {
      templateSrvStub.getAdhocFilters.mockReturnValue(originalAdhocFiltersMock);
      templateSrvStub.replace = originalReplaceMock;
    });

    it('should call replace function for legendFormat', () => {
      const query = {
        expr: 'test{job="bar"}',
        legendFormat: '$legend',
        refId: 'A',
      };
      const legend = 'baz';
      templateSrvStub.replace.mockReturnValue(legend);

      const interpolatedQuery = ds.applyTemplateVariables(query, { legend: { text: legend, value: legend } });
      expect(interpolatedQuery.legendFormat).toBe(legend);
    });

    it('should call replace function for interval', () => {
      const query = {
        expr: 'test{job="bar"}',
        interval: '$step',
        refId: 'A',
      };
      const step = '5s';
      templateSrvStub.replace.mockReturnValue(step);

      const interpolatedQuery = ds.applyTemplateVariables(query, { step: { text: step, value: step } });
      expect(interpolatedQuery.interval).toBe(step);
    });

    it('should call replace function for expr', () => {
      const query = {
        expr: 'test{job="$job"}',
        refId: 'A',
      };
      const job = 'bar';
      templateSrvStub.replace.mockReturnValue(job);

      const interpolatedQuery = ds.applyTemplateVariables(query, { job: { text: job, value: job } });
      expect(interpolatedQuery.expr).toBe(job);
    });

    it('should add ad-hoc filters to expr', () => {
      templateSrvStub.replace = jest.fn((a: string) => a);
      templateSrvStub.getAdhocFilters.mockReturnValue([
        {
          key: 'k1',
          operator: '=',
          value: 'v1',
        },
        {
          key: 'k2',
          operator: '!=',
          value: 'v2',
        },
      ]);

      const query = {
        expr: 'test{job="bar"}',
        refId: 'A',
      };

      const result = ds.applyTemplateVariables(query, {});
      expect(result).toMatchObject({ expr: 'test{job="bar",k1="v1",k2!="v2"}' });
    });
  });

  describe('metricFindQuery', () => {
    beforeEach(() => {
      const query = 'query_result(topk(5,rate(http_request_duration_microseconds_count[$__interval])))';
      templateSrvStub.replace = jest.fn();
      ds.metricFindQuery(query);
    });

    afterAll(() => {
      templateSrvStub.replace = jest.fn((a: string) => a);
    });

    it('should call templateSrv.replace with scopedVars', () => {
      expect(templateSrvStub.replace.mock.calls[0][1]).toBeDefined();
    });

    it('should have the correct range and range_ms', () => {
      const range = templateSrvStub.replace.mock.calls[0][1].__range;
      const rangeMs = templateSrvStub.replace.mock.calls[0][1].__range_ms;
      const rangeS = templateSrvStub.replace.mock.calls[0][1].__range_s;
      expect(range).toEqual({ text: '21s', value: '21s' });
      expect(rangeMs).toEqual({ text: 21031, value: 21031 });
      expect(rangeS).toEqual({ text: 21, value: 21 });
    });

    it('should pass the default interval value', () => {
      const interval = templateSrvStub.replace.mock.calls[0][1].__interval;
      const intervalMs = templateSrvStub.replace.mock.calls[0][1].__interval_ms;
      expect(interval).toEqual({ text: '15s', value: '15s' });
      expect(intervalMs).toEqual({ text: 15000, value: 15000 });
    });
  });
});

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;

const time = ({ hours = 0, seconds = 0, minutes = 0 }) => dateTime(hours * HOUR + minutes * MINUTE + seconds * SECOND);

describe('PrometheusDatasource', () => {
  const instanceSettings = ({
    url: 'proxied',
    directUrl: 'direct',
    user: 'test',
    password: 'mupp',
    jsonData: { httpMethod: 'GET' },
  } as unknown) as DataSourceInstanceSettings<PromOptions>;

  let ds: PrometheusDatasource;
  beforeEach(() => {
    ds = new PrometheusDatasource(instanceSettings, templateSrvStub as any, timeSrvStub as any);
  });

  describe('When querying prometheus with one target using query editor target spec', () => {
    describe('and query syntax is valid', () => {
      let results: any;
      const query = {
        range: { from: time({ seconds: 63 }), to: time({ seconds: 183 }) },
        targets: [{ expr: 'test{job="testjob"}', format: 'time_series' }],
        interval: '60s',
      };

      // Interval alignment with step
      const urlExpected = `proxied/api/v1/query_range?query=${encodeURIComponent(
        'test{job="testjob"}'
      )}&start=60&end=180&step=60`;

      beforeEach(async () => {
        const response = {
          data: {
            status: 'success',
            data: {
              resultType: 'matrix',
              result: [
                {
                  metric: { __name__: 'test', job: 'testjob' },
                  values: [[60, '3846']],
                },
              ],
            },
          },
        };
        fetchMock.mockImplementation(() => of(response));
        ds.query(query as any).subscribe((data: any) => {
          results = data;
        });
      });

      it('should generate the correct query', () => {
        const res = fetchMock.mock.calls[0][0];
        expect(res.method).toBe('GET');
        expect(res.url).toBe(urlExpected);
      });

      it('should return series list', async () => {
        const frame = toDataFrame(results.data[0]);
        expect(results.data.length).toBe(1);
        expect(getFieldDisplayName(frame.fields[1], frame)).toBe('test{job="testjob"}');
      });
    });

    describe('and query syntax is invalid', () => {
      let results: string;
      const query = {
        range: { from: time({ seconds: 63 }), to: time({ seconds: 183 }) },
        targets: [{ expr: 'tes;;t{job="testjob"}', format: 'time_series' }],
        interval: '60s',
      };

      const errMessage = 'parse error at char 25: could not parse remaining input';
      const response = {
        data: {
          status: 'error',
          errorType: 'bad_data',
          error: errMessage,
        },
      };

      it('should generate an error', () => {
        fetchMock.mockImplementation(() => throwError(response));
        ds.query(query as any).subscribe((e: any) => {
          results = e.message;
          expect(results).toBe(`"${errMessage}"`);
        });
      });
    });
  });

  describe('When querying prometheus with one target which returns multiple series', () => {
    let results: any;
    const start = 60;
    const end = 360;
    const step = 60;

    const query = {
      range: { from: time({ seconds: start }), to: time({ seconds: end }) },
      targets: [{ expr: 'test{job="testjob"}', format: 'time_series' }],
      interval: '60s',
    };

    beforeEach(async () => {
      const response = {
        status: 'success',
        data: {
          data: {
            resultType: 'matrix',
            result: [
              {
                metric: { __name__: 'test', job: 'testjob', series: 'series 1' },
                values: [
                  [start + step * 1, '3846'],
                  [start + step * 3, '3847'],
                  [end - step * 1, '3848'],
                ],
              },
              {
                metric: { __name__: 'test', job: 'testjob', series: 'series 2' },
                values: [[start + step * 2, '4846']],
              },
            ],
          },
        },
      };

      fetchMock.mockImplementation(() => of(response));

      ds.query(query as any).subscribe((data: any) => {
        results = data;
      });
    });

    it('should be same length', () => {
      expect(results.data.length).toBe(2);
      expect(results.data[0].length).toBe((end - start) / step + 1);
      expect(results.data[1].length).toBe((end - start) / step + 1);
    });

    it('should fill null until first datapoint in response', () => {
      expect(results.data[0].fields[0].values.get(0)).toBe(start * 1000);
      expect(results.data[0].fields[1].values.get(0)).toBe(null);
      expect(results.data[0].fields[0].values.get(1)).toBe((start + step * 1) * 1000);
      expect(results.data[0].fields[1].values.get(1)).toBe(3846);
    });

    it('should fill null after last datapoint in response', () => {
      const length = (end - start) / step + 1;
      expect(results.data[0].fields[0].values.get(length - 2)).toBe((end - step * 1) * 1000);
      expect(results.data[0].fields[1].values.get(length - 2)).toBe(3848);
      expect(results.data[0].fields[0].values.get(length - 1)).toBe(end * 1000);
      expect(results.data[0].fields[1].values.get(length - 1)).toBe(null);
    });

    it('should fill null at gap between series', () => {
      expect(results.data[0].fields[0].values.get(2)).toBe((start + step * 2) * 1000);
      expect(results.data[0].fields[1].values.get(2)).toBe(null);
      expect(results.data[1].fields[0].values.get(1)).toBe((start + step * 1) * 1000);
      expect(results.data[1].fields[1].values.get(1)).toBe(null);
      expect(results.data[1].fields[0].values.get(3)).toBe((start + step * 3) * 1000);
      expect(results.data[1].fields[1].values.get(3)).toBe(null);
    });
  });

  describe('When querying prometheus with one target and instant = true', () => {
    let results: any;
    const urlExpected = `proxied/api/v1/query?query=${encodeURIComponent('test{job="testjob"}')}&time=123`;
    const query = {
      range: { from: time({ seconds: 63 }), to: time({ seconds: 123 }) },
      targets: [{ expr: 'test{job="testjob"}', format: 'time_series', instant: true }],
      interval: '60s',
    };

    beforeEach(async () => {
      const response = {
        status: 'success',
        data: {
          data: {
            resultType: 'vector',
            result: [
              {
                metric: { __name__: 'test', job: 'testjob' },
                value: [123, '3846'],
              },
            ],
          },
        },
      };

      fetchMock.mockImplementation(() => of(response));
      ds.query(query as any).subscribe((data: any) => {
        results = data;
      });
    });

    it('should generate the correct query', () => {
      const res = fetchMock.mock.calls[0][0];
      expect(res.method).toBe('GET');
      expect(res.url).toBe(urlExpected);
    });

    it('should return series list', () => {
      const frame = toDataFrame(results.data[0]);
      expect(results.data.length).toBe(1);
      expect(frame.name).toBe('test{job="testjob"}');
      expect(getFieldDisplayName(frame.fields[1], frame)).toBe('test{job="testjob"}');
    });
  });

  describe('annotationQuery', () => {
    let results: any;
    const options: any = {
      annotation: {
        expr: 'ALERTS{alertstate="firing"}',
        tagKeys: 'job',
        titleFormat: '{{alertname}}',
        textFormat: '{{instance}}',
      },
      range: {
        from: time({ seconds: 63 }),
        to: time({ seconds: 123 }),
      },
    };

    const response = createAnnotationResponse();

    describe('when time series query is cancelled', () => {
      it('should return empty results', async () => {
        fetchMock.mockImplementation(() => of({ cancelled: true }));

        await ds.annotationQuery(options).then((data: any) => {
          results = data;
        });

        expect(results).toEqual([]);
      });
    });

    describe('not use useValueForTime', () => {
      beforeEach(async () => {
        options.annotation.useValueForTime = false;
        fetchMock.mockImplementation(() => of(response));

        await ds.annotationQuery(options).then((data: any) => {
          results = data;
        });
      });

      it('should return annotation list', () => {
        expect(results.length).toBe(1);
        expect(results[0].tags).toContain('testjob');
        expect(results[0].title).toBe('InstanceDown');
        expect(results[0].text).toBe('testinstance');
        expect(results[0].time).toBe(123);
      });
    });

    describe('use useValueForTime', () => {
      beforeEach(async () => {
        options.annotation.useValueForTime = true;
        fetchMock.mockImplementation(() => of(response));

        await ds.annotationQuery(options).then((data: any) => {
          results = data;
        });
      });

      it('should return annotation list', () => {
        expect(results[0].time).toEqual(456);
      });
    });

    describe('step parameter', () => {
      beforeEach(() => {
        fetchMock.mockImplementation(() => of(response));
      });

      it('should use default step for short range if no interval is given', () => {
        const query = {
          ...options,
          range: {
            from: time({ seconds: 63 }),
            to: time({ seconds: 123 }),
          },
        };
        ds.annotationQuery(query);
        const req = fetchMock.mock.calls[0][0];
        expect(req.data.queries[0].interval).toBe('60s');
      });

      it('should use default step for short range when annotation step is empty string', () => {
        const query = {
          ...options,
          annotation: {
            ...options.annotation,
            step: '',
          },
          range: {
            from: time({ seconds: 63 }),
            to: time({ seconds: 123 }),
          },
        };
        ds.annotationQuery(query);
        const req = fetchMock.mock.calls[0][0];
        expect(req.data.queries[0].interval).toBe('60s');
      });

      it('should use custom step for short range', () => {
        const annotation = {
          ...options.annotation,
          step: '10s',
        };
        const query = {
          ...options,
          annotation,
          range: {
            from: time({ seconds: 63 }),
            to: time({ seconds: 123 }),
          },
        };
        ds.annotationQuery(query);
        const req = fetchMock.mock.calls[0][0];
        expect(req.data.queries[0].interval).toBe('10s');
      });
    });

    describe('region annotations for sectors', () => {
      const options: any = {
        annotation: {
          expr: 'ALERTS{alertstate="firing"}',
          tagKeys: 'job',
          titleFormat: '{{alertname}}',
          textFormat: '{{instance}}',
        },
        range: {
          from: time({ seconds: 63 }),
          to: time({ seconds: 900 }),
        },
      };

      async function runAnnotationQuery(data: number[][]) {
        let response = createAnnotationResponse();
        response.data.results['X'].frames[0].data.values = data;

        options.annotation.useValueForTime = false;
        fetchMock.mockImplementation(() => of(response));

        return ds.annotationQuery(options);
      }

      it('should handle gaps and inactive values', async () => {
        const results = await runAnnotationQuery([
          [2 * 60000, 3 * 60000, 5 * 60000, 6 * 60000, 7 * 60000, 8 * 60000, 9 * 60000],
          [1, 1, 1, 1, 1, 0, 1],
        ]);
        expect(results.map((result) => [result.time, result.timeEnd])).toEqual([
          [120000, 180000],
          [300000, 420000],
          [540000, 540000],
        ]);
      });

      it('should handle single region', async () => {
        const results = await runAnnotationQuery([
          [2 * 60000, 3 * 60000],
          [1, 1],
        ]);
        expect(results.map((result) => [result.time, result.timeEnd])).toEqual([[120000, 180000]]);
      });

      it('should handle 0 active regions', async () => {
        const results = await runAnnotationQuery([
          [2 * 60000, 3 * 60000, 5 * 60000],
          [0, 0, 0],
        ]);
        expect(results.length).toBe(0);
      });

      it('should handle single active value', async () => {
        const results = await runAnnotationQuery([[2 * 60000], [1]]);
        expect(results.map((result) => [result.time, result.timeEnd])).toEqual([[120000, 120000]]);
      });
    });
    describe('with template variables', () => {
      const originalReplaceMock = jest.fn((a: string, ...rest: any) => a);
      afterAll(() => {
        templateSrvStub.replace = originalReplaceMock;
      });

      it('should interpolate variables in query expr', () => {
        const query = {
          ...options,
          annotation: {
            ...options.annotation,
            expr: '$variable',
          },
          range: {
            from: time({ seconds: 1 }),
            to: time({ seconds: 2 }),
          },
        };
        const interpolated = 'interpolated_expr';
        templateSrvStub.replace.mockReturnValue(interpolated);
        ds.annotationQuery(query);
        const req = fetchMock.mock.calls[0][0];
        expect(req.data.queries[0].expr).toBe(interpolated);
      });
    });
  });

  describe('When resultFormat is table and instant = true', () => {
    let results: any;
    const query = {
      range: { from: time({ seconds: 63 }), to: time({ seconds: 123 }) },
      targets: [{ expr: 'test{job="testjob"}', format: 'time_series', instant: true }],
      interval: '60s',
    };

    beforeEach(async () => {
      const response = {
        status: 'success',
        data: {
          data: {
            resultType: 'vector',
            result: [
              {
                metric: { __name__: 'test', job: 'testjob' },
                value: [123, '3846'],
              },
            ],
          },
        },
      };

      fetchMock.mockImplementation(() => of(response));
      ds.query(query as any).subscribe((data: any) => {
        results = data;
      });
    });

    it('should return result', () => {
      expect(results).not.toBe(null);
    });
  });

  describe('The "step" query parameter', () => {
    const response = {
      status: 'success',
      data: {
        data: {
          resultType: 'matrix',
          result: [] as DataQueryResponseData[],
        },
      },
    };

    it('should be min interval when greater than auto interval', async () => {
      const query = {
        // 6 minute range
        range: { from: time({ minutes: 1 }), to: time({ minutes: 7 }) },
        targets: [
          {
            expr: 'test',
            interval: '10s',
          },
        ],
        interval: '5s',
      };
      const urlExpected = 'proxied/api/v1/query_range?query=test&start=60&end=420&step=10';

      fetchMock.mockImplementation(() => of(response));
      ds.query(query as any);
      const res = fetchMock.mock.calls[0][0];
      expect(res.method).toBe('GET');
      expect(res.url).toBe(urlExpected);
    });

    it('step should be fractional for sub second intervals', async () => {
      const query = {
        // 6 minute range
        range: { from: time({ minutes: 1 }), to: time({ minutes: 7 }) },
        targets: [{ expr: 'test' }],
        interval: '100ms',
      };
      const urlExpected = 'proxied/api/v1/query_range?query=test&start=60&end=420&step=0.1';
      fetchMock.mockImplementation(() => of(response));
      ds.query(query as any);
      const res = fetchMock.mock.calls[0][0];
      expect(res.method).toBe('GET');
      expect(res.url).toBe(urlExpected);
    });

    it('should be auto interval when greater than min interval', async () => {
      const query = {
        // 6 minute range
        range: { from: time({ minutes: 1 }), to: time({ minutes: 7 }) },
        targets: [
          {
            expr: 'test',
            interval: '5s',
          },
        ],
        interval: '10s',
      };
      const urlExpected = 'proxied/api/v1/query_range?query=test&start=60&end=420&step=10';
      fetchMock.mockImplementation(() => of(response));
      ds.query(query as any);
      const res = fetchMock.mock.calls[0][0];
      expect(res.method).toBe('GET');
      expect(res.url).toBe(urlExpected);
    });

    it('should result in querying fewer than 11000 data points', async () => {
      const query = {
        // 6 hour range
        range: { from: time({ hours: 1 }), to: time({ hours: 7 }) },
        targets: [{ expr: 'test' }],
        interval: '1s',
      };
      const end = 7 * 60 * 60;
      const start = 60 * 60;
      const urlExpected = 'proxied/api/v1/query_range?query=test&start=' + start + '&end=' + end + '&step=2';
      fetchMock.mockImplementation(() => of(response));
      ds.query(query as any);
      const res = fetchMock.mock.calls[0][0];
      expect(res.method).toBe('GET');
      expect(res.url).toBe(urlExpected);
    });

    it('should not apply min interval when interval * intervalFactor greater', async () => {
      const query = {
        // 6 minute range
        range: { from: time({ minutes: 1 }), to: time({ minutes: 7 }) },
        targets: [
          {
            expr: 'test',
            interval: '10s',
            intervalFactor: 10,
          },
        ],
        interval: '5s',
      };
      // times get rounded up to interval
      const urlExpected = 'proxied/api/v1/query_range?query=test&start=50&end=400&step=50';
      fetchMock.mockImplementation(() => of(response));
      ds.query(query as any);
      const res = fetchMock.mock.calls[0][0];
      expect(res.method).toBe('GET');
      expect(res.url).toBe(urlExpected);
    });

    it('should apply min interval when interval * intervalFactor smaller', async () => {
      const query = {
        // 6 minute range
        range: { from: time({ minutes: 1 }), to: time({ minutes: 7 }) },
        targets: [
          {
            expr: 'test',
            interval: '15s',
            intervalFactor: 2,
          },
        ],
        interval: '5s',
      };
      const urlExpected = 'proxied/api/v1/query_range?query=test' + '&start=60&end=420&step=15';
      fetchMock.mockImplementation(() => of(response));
      ds.query(query as any);
      const res = fetchMock.mock.calls[0][0];
      expect(res.method).toBe('GET');
      expect(res.url).toBe(urlExpected);
    });

    it('should apply intervalFactor to auto interval when greater', async () => {
      const query = {
        // 6 minute range
        range: { from: time({ minutes: 1 }), to: time({ minutes: 7 }) },
        targets: [
          {
            expr: 'test',
            interval: '5s',
            intervalFactor: 10,
          },
        ],
        interval: '10s',
      };
      // times get aligned to interval
      const urlExpected = 'proxied/api/v1/query_range?query=test' + '&start=0&end=400&step=100';
      fetchMock.mockImplementation(() => of(response));
      ds.query(query as any);
      const res = fetchMock.mock.calls[0][0];
      expect(res.method).toBe('GET');
      expect(res.url).toBe(urlExpected);
    });

    it('should not not be affected by the 11000 data points limit when large enough', async () => {
      const query = {
        // 1 week range
        range: { from: time({}), to: time({ hours: 7 * 24 }) },
        targets: [
          {
            expr: 'test',
            intervalFactor: 10,
          },
        ],
        interval: '10s',
      };
      const end = 7 * 24 * 60 * 60;
      const start = 0;
      const urlExpected = 'proxied/api/v1/query_range?query=test' + '&start=' + start + '&end=' + end + '&step=100';
      fetchMock.mockImplementation(() => of(response));
      ds.query(query as any);
      const res = fetchMock.mock.calls[0][0];
      expect(res.method).toBe('GET');
      expect(res.url).toBe(urlExpected);
    });

    it('should be determined by the 11000 data points limit when too small', async () => {
      const query = {
        // 1 week range
        range: { from: time({}), to: time({ hours: 7 * 24 }) },
        targets: [
          {
            expr: 'test',
            intervalFactor: 10,
          },
        ],
        interval: '5s',
      };
      let end = 7 * 24 * 60 * 60;
      end -= end % 55;
      const start = 0;
      const step = 55;
      const adjusted = alignRange(start, end, step, timeSrvStub.timeRange().to.utcOffset() * 60);
      const urlExpected =
        'proxied/api/v1/query_range?query=test' + '&start=' + adjusted.start + '&end=' + adjusted.end + '&step=' + step;
      fetchMock.mockImplementation(() => of(response));
      ds.query(query as any);
      const res = fetchMock.mock.calls[0][0];
      expect(res.method).toBe('GET');
      expect(res.url).toBe(urlExpected);
    });
  });

  describe('The __interval and __interval_ms template variables', () => {
    const response = {
      status: 'success',
      data: {
        data: {
          resultType: 'matrix',
          result: [] as DataQueryResponseData[],
        },
      },
    };

    it('should be unchanged when auto interval is greater than min interval', async () => {
      const query = {
        // 6 minute range
        range: { from: time({ minutes: 1 }), to: time({ minutes: 7 }) },
        targets: [
          {
            expr: 'rate(test[$__interval])',
            interval: '5s',
          },
        ],
        interval: '10s',
        scopedVars: {
          __interval: { text: '10s', value: '10s' },
          __interval_ms: { text: 10 * 1000, value: 10 * 1000 },
        },
      };

      const urlExpected =
        'proxied/api/v1/query_range?query=' +
        encodeURIComponent('rate(test[$__interval])') +
        '&start=60&end=420&step=10';

      templateSrvStub.replace = jest.fn((str) => str) as any;
      fetchMock.mockImplementation(() => of(response));
      ds.query(query as any);
      const res = fetchMock.mock.calls[0][0];
      expect(res.method).toBe('GET');
      expect(res.url).toBe(urlExpected);

      expect(templateSrvStub.replace.mock.calls[0][1]).toEqual({
        __interval: {
          text: '10s',
          value: '10s',
        },
        __interval_ms: {
          text: 10000,
          value: 10000,
        },
      });
    });

    it('should be min interval when it is greater than auto interval', async () => {
      const query = {
        // 6 minute range
        range: { from: time({ minutes: 1 }), to: time({ minutes: 7 }) },
        targets: [
          {
            expr: 'rate(test[$__interval])',
            interval: '10s',
          },
        ],
        interval: '5s',
        scopedVars: {
          __interval: { text: '5s', value: '5s' },
          __interval_ms: { text: 5 * 1000, value: 5 * 1000 },
        },
      };
      const urlExpected =
        'proxied/api/v1/query_range?query=' +
        encodeURIComponent('rate(test[$__interval])') +
        '&start=60&end=420&step=10';
      fetchMock.mockImplementation(() => of(response));
      templateSrvStub.replace = jest.fn((str) => str) as any;
      ds.query(query as any);
      const res = fetchMock.mock.calls[0][0];
      expect(res.method).toBe('GET');
      expect(res.url).toBe(urlExpected);

      expect(templateSrvStub.replace.mock.calls[0][1]).toEqual({
        __interval: {
          text: '5s',
          value: '5s',
        },
        __interval_ms: {
          text: 5000,
          value: 5000,
        },
      });
    });

    it('should account for intervalFactor', async () => {
      const query = {
        // 6 minute range
        range: { from: time({ minutes: 1 }), to: time({ minutes: 7 }) },
        targets: [
          {
            expr: 'rate(test[$__interval])',
            interval: '5s',
            intervalFactor: 10,
          },
        ],
        interval: '10s',
        scopedVars: {
          __interval: { text: '10s', value: '10s' },
          __interval_ms: { text: 10 * 1000, value: 10 * 1000 },
        },
      };
      const urlExpected =
        'proxied/api/v1/query_range?query=' +
        encodeURIComponent('rate(test[$__interval])') +
        '&start=0&end=400&step=100';
      fetchMock.mockImplementation(() => of(response));
      templateSrvStub.replace = jest.fn((str) => str) as any;
      ds.query(query as any);
      const res = fetchMock.mock.calls[0][0];
      expect(res.method).toBe('GET');
      expect(res.url).toBe(urlExpected);

      expect(templateSrvStub.replace.mock.calls[0][1]).toEqual({
        __interval: {
          text: '10s',
          value: '10s',
        },
        __interval_ms: {
          text: 10000,
          value: 10000,
        },
      });

      expect(query.scopedVars.__interval.text).toBe('10s');
      expect(query.scopedVars.__interval.value).toBe('10s');
      expect(query.scopedVars.__interval_ms.text).toBe(10 * 1000);
      expect(query.scopedVars.__interval_ms.value).toBe(10 * 1000);
    });

    it('should be interval * intervalFactor when greater than min interval', async () => {
      const query = {
        // 6 minute range
        range: { from: time({ minutes: 1 }), to: time({ minutes: 7 }) },
        targets: [
          {
            expr: 'rate(test[$__interval])',
            interval: '10s',
            intervalFactor: 10,
          },
        ],
        interval: '5s',
        scopedVars: {
          __interval: { text: '5s', value: '5s' },
          __interval_ms: { text: 5 * 1000, value: 5 * 1000 },
        },
      };
      const urlExpected =
        'proxied/api/v1/query_range?query=' +
        encodeURIComponent('rate(test[$__interval])') +
        '&start=50&end=400&step=50';

      templateSrvStub.replace = jest.fn((str) => str) as any;
      fetchMock.mockImplementation(() => of(response));
      ds.query(query as any);
      const res = fetchMock.mock.calls[0][0];
      expect(res.method).toBe('GET');
      expect(res.url).toBe(urlExpected);

      expect(templateSrvStub.replace.mock.calls[0][1]).toEqual({
        __interval: {
          text: '5s',
          value: '5s',
        },
        __interval_ms: {
          text: 5000,
          value: 5000,
        },
      });
    });

    it('should be min interval when greater than interval * intervalFactor', async () => {
      const query = {
        // 6 minute range
        range: { from: time({ minutes: 1 }), to: time({ minutes: 7 }) },
        targets: [
          {
            expr: 'rate(test[$__interval])',
            interval: '15s',
            intervalFactor: 2,
          },
        ],
        interval: '5s',
        scopedVars: {
          __interval: { text: '5s', value: '5s' },
          __interval_ms: { text: 5 * 1000, value: 5 * 1000 },
        },
      };
      const urlExpected =
        'proxied/api/v1/query_range?query=' +
        encodeURIComponent('rate(test[$__interval])') +
        '&start=60&end=420&step=15';

      fetchMock.mockImplementation(() => of(response));
      ds.query(query as any);
      const res = fetchMock.mock.calls[0][0];
      expect(res.method).toBe('GET');
      expect(res.url).toBe(urlExpected);

      expect(templateSrvStub.replace.mock.calls[0][1]).toEqual({
        __interval: {
          text: '5s',
          value: '5s',
        },
        __interval_ms: {
          text: 5000,
          value: 5000,
        },
      });
    });

    it('should be determined by the 11000 data points limit, accounting for intervalFactor', async () => {
      const query = {
        // 1 week range
        range: { from: time({}), to: time({ hours: 7 * 24 }) },
        targets: [
          {
            expr: 'rate(test[$__interval])',
            intervalFactor: 10,
          },
        ],
        interval: '5s',
        scopedVars: {
          __interval: { text: '5s', value: '5s' },
          __interval_ms: { text: 5 * 1000, value: 5 * 1000 },
        },
      };
      let end = 7 * 24 * 60 * 60;
      end -= end % 55;
      const start = 0;
      const step = 55;
      const adjusted = alignRange(start, end, step, timeSrvStub.timeRange().to.utcOffset() * 60);
      const urlExpected =
        'proxied/api/v1/query_range?query=' +
        encodeURIComponent('rate(test[$__interval])') +
        '&start=' +
        adjusted.start +
        '&end=' +
        adjusted.end +
        '&step=' +
        step;
      fetchMock.mockImplementation(() => of(response));
      templateSrvStub.replace = jest.fn((str) => str) as any;
      ds.query(query as any);
      const res = fetchMock.mock.calls[0][0];
      expect(res.method).toBe('GET');
      expect(res.url).toBe(urlExpected);

      expect(templateSrvStub.replace.mock.calls[0][1]).toEqual({
        __interval: {
          text: '5s',
          value: '5s',
        },
        __interval_ms: {
          text: 5000,
          value: 5000,
        },
      });
    });
  });

  describe('The __range, __range_s and __range_ms variables', () => {
    const response = {
      status: 'success',
      data: {
        data: {
          resultType: 'matrix',
          result: [] as DataQueryResponseData[],
        },
      },
    };

    it('should use overridden ranges, not dashboard ranges', async () => {
      const expectedRangeSecond = 3600;
      const expectedRangeString = '3600s';
      const query = {
        range: {
          from: time({}),
          to: time({ hours: 1 }),
        },
        targets: [
          {
            expr: 'test[${__range_s}s]',
          },
        ],
        interval: '60s',
      };
      const urlExpected = `proxied/api/v1/query_range?query=${encodeURIComponent(
        query.targets[0].expr
      )}&start=0&end=3600&step=60`;

      templateSrvStub.replace = jest.fn((str) => str) as any;
      fetchMock.mockImplementation(() => of(response));
      ds.query(query as any);
      const res = fetchMock.mock.calls[0][0];
      expect(res.url).toBe(urlExpected);

      expect(templateSrvStub.replace.mock.calls[1][1]).toEqual({
        __range_s: {
          text: expectedRangeSecond,
          value: expectedRangeSecond,
        },
        __range: {
          text: expectedRangeString,
          value: expectedRangeString,
        },
        __range_ms: {
          text: expectedRangeSecond * 1000,
          value: expectedRangeSecond * 1000,
        },
        __rate_interval: {
          text: '75s',
          value: '75s',
        },
      });
    });
  });

  describe('The __rate_interval variable', () => {
    const target = { expr: 'rate(process_cpu_seconds_total[$__rate_interval])', refId: 'A' };

    beforeEach(() => {
      templateSrvStub.replace.mockClear();
    });

    it('should be 4 times the scrape interval if interval + scrape interval is lower', () => {
      ds.createQuery(target, { interval: '15s' } as any, 0, 300);
      expect(templateSrvStub.replace.mock.calls[1][1]['__rate_interval'].value).toBe('60s');
    });
    it('should be interval + scrape interval if 4 times the scrape interval is lower', () => {
      ds.createQuery(target, { interval: '5m' } as any, 0, 10080);
      expect(templateSrvStub.replace.mock.calls[1][1]['__rate_interval'].value).toBe('315s');
    });
    it('should fall back to a scrape interval of 15s if min step is set to 0, resulting in 4*15s = 60s', () => {
      ds.createQuery({ ...target, interval: '' }, { interval: '15s' } as any, 0, 300);
      expect(templateSrvStub.replace.mock.calls[1][1]['__rate_interval'].value).toBe('60s');
    });
    it('should be 4 times the scrape interval if min step set to 1m and interval is 15s', () => {
      // For a 5m graph, $__interval is 15s
      ds.createQuery({ ...target, interval: '1m' }, { interval: '15s' } as any, 0, 300);
      expect(templateSrvStub.replace.mock.calls[2][1]['__rate_interval'].value).toBe('240s');
    });
    it('should be interval + scrape interval if min step set to 1m and interval is 5m', () => {
      // For a 7d graph, $__interval is 5m
      ds.createQuery({ ...target, interval: '1m' }, { interval: '5m' } as any, 0, 10080);
      expect(templateSrvStub.replace.mock.calls[2][1]['__rate_interval'].value).toBe('360s');
    });
    it('should be interval + scrape interval if resolution is set to 1/2 and interval is 10m', () => {
      // For a 7d graph, $__interval is 10m
      ds.createQuery({ ...target, intervalFactor: 2 }, { interval: '10m' } as any, 0, 10080);
      expect(templateSrvStub.replace.mock.calls[1][1]['__rate_interval'].value).toBe('1215s');
    });
    it('should be 4 times the scrape interval if resolution is set to 1/2 and interval is 15s', () => {
      // For a 5m graph, $__interval is 15s
      ds.createQuery({ ...target, intervalFactor: 2 }, { interval: '15s' } as any, 0, 300);
      expect(templateSrvStub.replace.mock.calls[1][1]['__rate_interval'].value).toBe('60s');
    });
    it('should interpolate min step if set', () => {
      templateSrvStub.replace = jest.fn((_: string) => '15s');
      ds.createQuery({ ...target, interval: '$int' }, { interval: '15s' } as any, 0, 300);
      expect(templateSrvStub.replace.mock.calls).toHaveLength(3);
      templateSrvStub.replace = jest.fn((a: string) => a);
    });
  });

  it('should give back 1 exemplar target when multiple queries with exemplar enabled and same metric', () => {
    const targetA: PromQuery = {
      refId: 'A',
      expr: 'histogram_quantile(0.95, sum(rate(tns_request_duration_seconds_bucket[5m])) by (le))',
      exemplar: true,
    };
    const targetB: PromQuery = {
      refId: 'B',
      expr: 'histogram_quantile(0.5, sum(rate(tns_request_duration_seconds_bucket[5m])) by (le))',
      exemplar: true,
    };

    ds.languageProvider = {
      histogramMetrics: ['tns_request_duration_seconds_bucket'],
    } as any;

    const request = ({
      targets: [targetA, targetB],
      interval: '1s',
      panelId: '',
    } as any) as DataQueryRequest<PromQuery>;

    const Aexemplars = ds.shouldRunExemplarQuery(targetA, request);
    const BExpemplars = ds.shouldRunExemplarQuery(targetB, request);

    expect(Aexemplars).toBe(true);
    expect(BExpemplars).toBe(false);
  });
});

describe('PrometheusDatasource for POST', () => {
  const instanceSettings = ({
    url: 'proxied',
    directUrl: 'direct',
    user: 'test',
    password: 'mupp',
    jsonData: { httpMethod: 'POST' },
  } as unknown) as DataSourceInstanceSettings<PromOptions>;

  let ds: PrometheusDatasource;
  beforeEach(() => {
    ds = new PrometheusDatasource(instanceSettings, templateSrvStub as any, timeSrvStub as any);
  });

  describe('When querying prometheus with one target using query editor target spec', () => {
    let results: any;
    const urlExpected = 'proxied/api/v1/query_range';
    const dataExpected = {
      query: 'test{job="testjob"}',
      start: 1 * 60,
      end: 2 * 60,
      step: 60,
    };
    const query = {
      range: { from: time({ minutes: 1, seconds: 3 }), to: time({ minutes: 2, seconds: 3 }) },
      targets: [{ expr: 'test{job="testjob"}', format: 'time_series' }],
      interval: '60s',
    };

    beforeEach(async () => {
      const response = {
        status: 'success',
        data: {
          data: {
            resultType: 'matrix',
            result: [
              {
                metric: { __name__: 'test', job: 'testjob' },
                values: [[2 * 60, '3846']],
              },
            ],
          },
        },
      };
      fetchMock.mockImplementation(() => of(response));
      ds.query(query as any).subscribe((data: any) => {
        results = data;
      });
    });

    it('should generate the correct query', () => {
      const res = fetchMock.mock.calls[0][0];
      expect(res.method).toBe('POST');
      expect(res.url).toBe(urlExpected);
      expect(res.data).toEqual(dataExpected);
    });

    it('should return series list', () => {
      const frame = toDataFrame(results.data[0]);
      expect(results.data.length).toBe(1);
      expect(getFieldDisplayName(frame.fields[1], frame)).toBe('test{job="testjob"}');
    });
  });

  describe('When querying prometheus via check headers X-Dashboard-Id and X-Panel-Id', () => {
    const options = { dashboardId: 1, panelId: 2 };
    const httpOptions = {
      headers: {} as { [key: string]: number | undefined },
    };

    it('with proxy access tracing headers should be added', () => {
      ds._addTracingHeaders(httpOptions as any, options as any);
      expect(httpOptions.headers['X-Dashboard-Id']).toBe(1);
      expect(httpOptions.headers['X-Panel-Id']).toBe(2);
    });

    it('with direct access tracing headers should not be added', () => {
      const mockDs = new PrometheusDatasource(
        { ...instanceSettings, url: 'http://127.0.0.1:8000' },
        templateSrvStub as any,
        timeSrvStub as any
      );
      mockDs._addTracingHeaders(httpOptions as any, options as any);
      expect(httpOptions.headers['X-Dashboard-Id']).toBe(undefined);
      expect(httpOptions.headers['X-Panel-Id']).toBe(undefined);
    });
  });
});

function getPrepareTargetsContext({
  targets,
  app,
  queryOptions,
  languageProvider,
}: {
  targets: PromQuery[];
  app?: CoreApp;
  queryOptions?: Partial<QueryOptions>;
  languageProvider?: any;
}) {
  const instanceSettings = ({
    url: 'proxied',
    directUrl: 'direct',
    user: 'test',
    password: 'mupp',
    jsonData: { httpMethod: 'POST' },
  } as unknown) as DataSourceInstanceSettings<PromOptions>;
  const start = 0;
  const end = 1;
  const panelId = '2';
  const options = ({
    targets,
    interval: '1s',
    panelId,
    app,
    ...queryOptions,
  } as any) as DataQueryRequest<PromQuery>;

  const ds = new PrometheusDatasource(instanceSettings, templateSrvStub as any, timeSrvStub as any);
  if (languageProvider) {
    ds.languageProvider = languageProvider;
  }
  const { queries, activeTargets } = ds.prepareTargets(options, start, end);

  return {
    queries,
    activeTargets,
    start,
    end,
    panelId,
  };
}

describe('prepareTargets', () => {
  describe('when run from a Panel', () => {
    it('then it should just add targets', () => {
      const target: PromQuery = {
        refId: 'A',
        expr: 'up',
        requestId: '2A',
      };

      const { queries, activeTargets, panelId, end, start } = getPrepareTargetsContext({ targets: [target] });

      expect(queries.length).toBe(1);
      expect(activeTargets.length).toBe(1);
      expect(queries[0]).toEqual({
        end,
        expr: 'up',
        headers: {
          'X-Dashboard-Id': undefined,
          'X-Panel-Id': panelId,
        },
        hinting: undefined,
        instant: undefined,
        refId: target.refId,
        requestId: panelId + target.refId,
        start,
        step: 1,
      });
      expect(activeTargets[0]).toEqual(target);
    });

    it('should give back 3 targets when multiple queries with exemplar enabled and same metric', () => {
      const targetA: PromQuery = {
        refId: 'A',
        expr: 'histogram_quantile(0.95, sum(rate(tns_request_duration_seconds_bucket[5m])) by (le))',
        exemplar: true,
      };
      const targetB: PromQuery = {
        refId: 'B',
        expr: 'histogram_quantile(0.5, sum(rate(tns_request_duration_seconds_bucket[5m])) by (le))',
        exemplar: true,
      };

      const { queries, activeTargets } = getPrepareTargetsContext({
        targets: [targetA, targetB],
        languageProvider: {
          histogramMetrics: ['tns_request_duration_seconds_bucket'],
        },
      });
      expect(queries).toHaveLength(3);
      expect(activeTargets).toHaveLength(3);
    });

    it('should give back 4 targets when multiple queries with exemplar enabled', () => {
      const targetA: PromQuery = {
        refId: 'A',
        expr: 'histogram_quantile(0.95, sum(rate(tns_request_duration_seconds_bucket[5m])) by (le))',
        exemplar: true,
      };
      const targetB: PromQuery = {
        refId: 'B',
        expr: 'histogram_quantile(0.5, sum(rate(tns_request_duration_bucket[5m])) by (le))',
        exemplar: true,
      };

      const { queries, activeTargets } = getPrepareTargetsContext({
        targets: [targetA, targetB],
        languageProvider: {
          histogramMetrics: ['tns_request_duration_seconds_bucket'],
        },
      });
      expect(queries).toHaveLength(4);
      expect(activeTargets).toHaveLength(4);
    });

    it('should give back 2 targets when exemplar enabled', () => {
      const target: PromQuery = {
        refId: 'A',
        expr: 'up',
        exemplar: true,
      };

      const { queries, activeTargets } = getPrepareTargetsContext({ targets: [target] });
      expect(queries).toHaveLength(2);
      expect(activeTargets).toHaveLength(2);
      expect(activeTargets[0].exemplar).toBe(true);
      expect(activeTargets[1].exemplar).toBe(false);
    });
    it('should give back 1 target when exemplar and instant are enabled', () => {
      const target: PromQuery = {
        refId: 'A',
        expr: 'up',
        exemplar: true,
        instant: true,
      };

      const { queries, activeTargets } = getPrepareTargetsContext({ targets: [target] });
      expect(queries).toHaveLength(1);
      expect(activeTargets).toHaveLength(1);
      expect(activeTargets[0].instant).toBe(true);
    });
  });

  describe('when run from Explore', () => {
    describe('when query type Both is selected', () => {
      it('should give back 6 targets when multiple queries with exemplar enabled', () => {
        const targetA: PromQuery = {
          refId: 'A',
          expr: 'histogram_quantile(0.95, sum(rate(tns_request_duration_seconds_bucket[5m])) by (le))',
          instant: true,
          range: true,
          exemplar: true,
        };
        const targetB: PromQuery = {
          refId: 'B',
          expr: 'histogram_quantile(0.5, sum(rate(tns_request_duration_bucket[5m])) by (le))',
          exemplar: true,
          instant: true,
          range: true,
        };

        const { queries, activeTargets } = getPrepareTargetsContext({
          targets: [targetA, targetB],
          app: CoreApp.Explore,
          languageProvider: {
            histogramMetrics: ['tns_request_duration_seconds_bucket'],
          },
        });
        expect(queries).toHaveLength(6);
        expect(activeTargets).toHaveLength(6);
      });

      it('should give back 5 targets when multiple queries with exemplar enabled and same metric', () => {
        const targetA: PromQuery = {
          refId: 'A',
          expr: 'histogram_quantile(0.95, sum(rate(tns_request_duration_seconds_bucket[5m])) by (le))',
          instant: true,
          range: true,
          exemplar: true,
        };
        const targetB: PromQuery = {
          refId: 'B',
          expr: 'histogram_quantile(0.5, sum(rate(tns_request_duration_seconds_bucket[5m])) by (le))',
          exemplar: true,
          instant: true,
          range: true,
        };

        const { queries, activeTargets } = getPrepareTargetsContext({
          targets: [targetA, targetB],
          app: CoreApp.Explore,
          languageProvider: {
            histogramMetrics: ['tns_request_duration_seconds_bucket'],
          },
        });
        expect(queries).toHaveLength(5);
        expect(activeTargets).toHaveLength(5);
      });

      it('then it should return both instant and time series related objects', () => {
        const target: PromQuery = {
          refId: 'A',
          expr: 'up',
          range: true,
          instant: true,
          requestId: '2A',
        };

        const { queries, activeTargets, panelId, end, start } = getPrepareTargetsContext({
          targets: [target],
          app: CoreApp.Explore,
        });

        expect(queries.length).toBe(2);
        expect(activeTargets.length).toBe(2);
        expect(queries[0]).toEqual({
          end,
          expr: 'up',
          headers: {
            'X-Dashboard-Id': undefined,
            'X-Panel-Id': panelId,
          },
          hinting: undefined,
          instant: true,
          refId: target.refId,
          requestId: panelId + target.refId + '_instant',
          start,
          step: 1,
        });
        expect(activeTargets[0]).toEqual({
          ...target,
          format: 'table',
          instant: true,
          requestId: panelId + target.refId + '_instant',
          valueWithRefId: true,
        });
        expect(queries[1]).toEqual({
          end,
          expr: 'up',
          headers: {
            'X-Dashboard-Id': undefined,
            'X-Panel-Id': panelId,
          },
          hinting: undefined,
          instant: false,
          refId: target.refId,
          requestId: panelId + target.refId,
          start,
          step: 1,
        });
        expect(activeTargets[1]).toEqual({
          ...target,
          format: 'time_series',
          instant: false,
          requestId: panelId + target.refId,
        });
      });
    });

    describe('when query type Instant is selected', () => {
      it('then it should target and modify its format to table', () => {
        const target: PromQuery = {
          refId: 'A',
          expr: 'up',
          instant: true,
          range: false,
          requestId: '2A',
        };

        const { queries, activeTargets, panelId, end, start } = getPrepareTargetsContext({
          targets: [target],
          app: CoreApp.Explore,
        });

        expect(queries.length).toBe(1);
        expect(activeTargets.length).toBe(1);
        expect(queries[0]).toEqual({
          end,
          expr: 'up',
          headers: {
            'X-Dashboard-Id': undefined,
            'X-Panel-Id': panelId,
          },
          hinting: undefined,
          instant: true,
          refId: target.refId,
          requestId: panelId + target.refId,
          start,
          step: 1,
        });
        expect(activeTargets[0]).toEqual({ ...target, format: 'table' });
      });
    });
  });

  describe('when query type Range is selected', () => {
    it('then it should just add targets', () => {
      const target: PromQuery = {
        refId: 'A',
        expr: 'up',
        range: true,
        instant: false,
        requestId: '2A',
      };

      const { queries, activeTargets, panelId, end, start } = getPrepareTargetsContext({
        targets: [target],
        app: CoreApp.Explore,
      });

      expect(queries.length).toBe(1);
      expect(activeTargets.length).toBe(1);
      expect(queries[0]).toEqual({
        end,
        expr: 'up',
        headers: {
          'X-Dashboard-Id': undefined,
          'X-Panel-Id': panelId,
        },
        hinting: undefined,
        instant: false,
        refId: target.refId,
        requestId: panelId + target.refId,
        start,
        step: 1,
      });
      expect(activeTargets[0]).toEqual(target);
    });
  });
});

describe('modifyQuery', () => {
  describe('when called with ADD_FILTER', () => {
    describe('and query has no labels', () => {
      it('then the correct label should be added', () => {
        const query: PromQuery = { refId: 'A', expr: 'go_goroutines' };
        const action = { key: 'cluster', value: 'us-cluster', type: 'ADD_FILTER' };
        const instanceSettings = ({ jsonData: {} } as unknown) as DataSourceInstanceSettings<PromOptions>;
        const ds = new PrometheusDatasource(instanceSettings, templateSrvStub as any, timeSrvStub as any);

        const result = ds.modifyQuery(query, action);

        expect(result.refId).toEqual('A');
        expect(result.expr).toEqual('go_goroutines{cluster="us-cluster"}');
      });
    });

    describe('and query has labels', () => {
      it('then the correct label should be added', () => {
        const query: PromQuery = { refId: 'A', expr: 'go_goroutines{cluster="us-cluster"}' };
        const action = { key: 'pod', value: 'pod-123', type: 'ADD_FILTER' };
        const instanceSettings = ({ jsonData: {} } as unknown) as DataSourceInstanceSettings<PromOptions>;
        const ds = new PrometheusDatasource(instanceSettings, templateSrvStub as any, timeSrvStub as any);

        const result = ds.modifyQuery(query, action);

        expect(result.refId).toEqual('A');
        expect(result.expr).toEqual('go_goroutines{cluster="us-cluster",pod="pod-123"}');
      });
    });
  });

  describe('when called with ADD_FILTER_OUT', () => {
    describe('and query has no labels', () => {
      it('then the correct label should be added', () => {
        const query: PromQuery = { refId: 'A', expr: 'go_goroutines' };
        const action = { key: 'cluster', value: 'us-cluster', type: 'ADD_FILTER_OUT' };
        const instanceSettings = ({ jsonData: {} } as unknown) as DataSourceInstanceSettings<PromOptions>;
        const ds = new PrometheusDatasource(instanceSettings, templateSrvStub as any, timeSrvStub as any);

        const result = ds.modifyQuery(query, action);

        expect(result.refId).toEqual('A');
        expect(result.expr).toEqual('go_goroutines{cluster!="us-cluster"}');
      });
    });

    describe('and query has labels', () => {
      it('then the correct label should be added', () => {
        const query: PromQuery = { refId: 'A', expr: 'go_goroutines{cluster="us-cluster"}' };
        const action = { key: 'pod', value: 'pod-123', type: 'ADD_FILTER_OUT' };
        const instanceSettings = ({ jsonData: {} } as unknown) as DataSourceInstanceSettings<PromOptions>;
        const ds = new PrometheusDatasource(instanceSettings, templateSrvStub as any, timeSrvStub as any);

        const result = ds.modifyQuery(query, action);

        expect(result.refId).toEqual('A');
        expect(result.expr).toEqual('go_goroutines{cluster="us-cluster",pod!="pod-123"}');
      });
    });
  });
});

function createDataRequest(targets: any[], overrides?: Partial<DataQueryRequest>): DataQueryRequest<PromQuery> {
  const defaults = {
    app: CoreApp.Dashboard,
    targets: targets.map((t) => {
      return {
        instant: false,
        start: dateTime().subtract(5, 'minutes'),
        end: dateTime(),
        expr: 'test',
        ...t,
      };
    }),
    range: {
      from: dateTime(),
      to: dateTime(),
    },
    interval: '15s',
    showingGraph: true,
  };

  return Object.assign(defaults, overrides || {}) as DataQueryRequest<PromQuery>;
}

function createDefaultPromResponse() {
  return {
    data: {
      data: {
        result: [
          {
            metric: {
              __name__: 'test_metric',
            },
            values: [[1568369640, 1]],
          },
        ],
        resultType: 'matrix',
      },
    },
  };
}

function createAnnotationResponse() {
  const response = {
    data: {
      results: {
        X: {
          frames: [
            {
              schema: {
                name: 'bar',
                refId: 'X',
                fields: [
                  {
                    name: 'Time',
                    type: 'time',
                    typeInfo: {
                      frame: 'time.Time',
                    },
                  },
                  {
                    name: 'Value',
                    type: 'number',
                    typeInfo: {
                      frame: 'float64',
                    },
                    labels: {
                      __name__: 'ALERTS',
                      alertname: 'InstanceDown',
                      alertstate: 'firing',
                      instance: 'testinstance',
                      job: 'testjob',
                    },
                  },
                ],
              },
              data: {
                values: [[123], [456]],
              },
            },
          ],
        },
      },
    },
  };

  return { ...response };
}
