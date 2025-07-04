// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { QueryRunners, variableDummyRefId } from './queryRunners';
import { getDefaultTimeRange, VariableSupportType } from '@grafana/data';
import { VariableRefresh } from '../types';
import { of } from 'rxjs';

describe('QueryRunners', () => {
  describe('when using a legacy data source', () => {
    const getLegacyTestContext = (variable?: any) => {
      const defaultTimeRange = getDefaultTimeRange();
      variable = variable ?? { query: 'A query' };
      const timeSrv = {
        timeRange: jest.fn().mockReturnValue(defaultTimeRange),
      };
      const datasource: any = { metricFindQuery: jest.fn().mockResolvedValue([{ text: 'A', value: 'A' }]) };
      const runner = new QueryRunners().getRunnerForDatasource(datasource);
      const runRequest = jest.fn().mockReturnValue(of({}));
      const runnerArgs: any = { datasource, variable, searchFilter: 'A searchFilter', timeSrv, runRequest };
      const request: any = {};

      return { timeSrv, datasource, runner, variable, runnerArgs, request, defaultTimeRange };
    };

    describe('and calling getRunnerForDatasource', () => {
      it('then it should return LegacyQueryRunner', () => {
        const { runner } = getLegacyTestContext();
        expect(runner!.type).toEqual(VariableSupportType.Legacy);
      });
    });

    describe('and calling getTarget', () => {
      it('then it should return correct target', () => {
        const { runner, datasource, variable } = getLegacyTestContext();
        const target = runner.getTarget({ datasource, variable });
        expect(target).toEqual('A query');
      });
    });

    describe('and calling runRequest with a variable that refreshes when time range changes', () => {
      const { datasource, runner, runnerArgs, request, timeSrv, defaultTimeRange } = getLegacyTestContext({
        query: 'A query',
        refresh: VariableRefresh.onTimeRangeChanged,
      });
      const observable = runner.runRequest(runnerArgs, request);

      it('then it should return correct observable', async () => {
        await expect(observable).toEmitValuesWith((received) => {
          const value = received[0];
          expect(value).toEqual({
            series: [{ text: 'A', value: 'A' }],
            state: 'Done',
            timeRange: defaultTimeRange,
          });
        });
      });

      it('and it should call timeSrv.timeRange()', () => {
        expect(timeSrv.timeRange).toHaveBeenCalledTimes(1);
      });

      it('and it should call metricFindQuery with correct options', () => {
        expect(datasource.metricFindQuery).toHaveBeenCalledTimes(1);
        expect(datasource.metricFindQuery).toHaveBeenCalledWith('A query', {
          range: defaultTimeRange,
          searchFilter: 'A searchFilter',
          variable: {
            query: 'A query',
            refresh: VariableRefresh.onTimeRangeChanged,
          },
        });
      });
    });

    describe('and calling runRequest with a variable that refreshes on dashboard load', () => {
      const { datasource, runner, runnerArgs, request, timeSrv, defaultTimeRange } = getLegacyTestContext({
        query: 'A query',
        refresh: VariableRefresh.onDashboardLoad,
      });
      const observable = runner.runRequest(runnerArgs, request);

      it('then it should return correct observable', async () => {
        await expect(observable).toEmitValuesWith((received) => {
          const value = received[0];
          expect(value).toEqual({
            series: [{ text: 'A', value: 'A' }],
            state: 'Done',
            timeRange: defaultTimeRange,
          });
        });
      });

      it('and it should call timeSrv.timeRange()', () => {
        expect(timeSrv.timeRange).toHaveBeenCalledTimes(1);
      });

      it('and it should call metricFindQuery with correct options', () => {
        expect(datasource.metricFindQuery).toHaveBeenCalledTimes(1);
        expect(datasource.metricFindQuery).toHaveBeenCalledWith('A query', {
          range: defaultTimeRange,
          searchFilter: 'A searchFilter',
          variable: {
            query: 'A query',
            refresh: VariableRefresh.onDashboardLoad,
          },
        });
      });
    });

    describe('and calling runRequest with a variable that does not refresh when time range changes', () => {
      const { datasource, runner, runnerArgs, request, timeSrv } = getLegacyTestContext({
        query: 'A query',
        refresh: VariableRefresh.never,
      });
      const observable = runner.runRequest(runnerArgs, request);

      it('then it should return correct observable', async () => {
        await expect(observable).toEmitValuesWith((received) => {
          const values = received[0];
          expect(values).toEqual({
            series: [{ text: 'A', value: 'A' }],
            state: 'Done',
            timeRange: undefined,
          });
        });
      });

      it('and it should not call timeSrv.timeRange()', () => {
        expect(timeSrv.timeRange).not.toHaveBeenCalled();
      });

      it('and it should call metricFindQuery with correct options', () => {
        expect(datasource.metricFindQuery).toHaveBeenCalledTimes(1);
        expect(datasource.metricFindQuery).toHaveBeenCalledWith('A query', {
          range: undefined,
          searchFilter: 'A searchFilter',
          variable: {
            query: 'A query',
            refresh: VariableRefresh.never,
          },
        });
      });
    });
  });

  describe('when using a data source with standard variable support', () => {
    const getStandardTestContext = (datasource?: any) => {
      const variable: any = { query: { refId: 'A', query: 'A query' } };
      const timeSrv = {};
      datasource = datasource ?? {
        variables: {
          getType: () => VariableSupportType.Standard,
          toDataQuery: (query: any) => ({ ...query, extra: 'extra' }),
        },
      };
      const runner = new QueryRunners().getRunnerForDatasource(datasource);
      const runRequest = jest.fn().mockReturnValue(of({}));
      const runnerArgs: any = { datasource, variable, searchFilter: 'A searchFilter', timeSrv, runRequest };
      const request: any = {};

      return { timeSrv, datasource, runner, variable, runnerArgs, request, runRequest };
    };

    describe('and calling getRunnerForDatasource', () => {
      it('then it should return StandardQueryRunner', () => {
        const { runner } = getStandardTestContext();
        expect(runner!.type).toEqual(VariableSupportType.Standard);
      });
    });

    describe('and calling getTarget', () => {
      it('then it should return correct target', () => {
        const { runner, variable, datasource } = getStandardTestContext();
        const target = runner.getTarget({ datasource, variable });
        expect(target).toEqual({ refId: 'A', query: 'A query', extra: 'extra' });
      });
    });

    describe('and calling runRequest with a datasource that uses a custom query', () => {
      const { runner, request, runnerArgs, runRequest, datasource } = getStandardTestContext({
        variables: {
          getType: () => VariableSupportType.Standard,
          toDataQuery: () => undefined,
          query: () => undefined,
        },
      });
      const observable = runner.runRequest(runnerArgs, request);

      it('then it should return correct observable', async () => {
        await expect(observable).toEmitValuesWith((received) => {
          const value = received[0];
          expect(value).toEqual({});
        });
      });

      it('then it should call runRequest with correct args', () => {
        expect(runRequest).toHaveBeenCalledTimes(1);
        expect(runRequest).toHaveBeenCalledWith(datasource, {}, datasource.variables.query);
      });
    });

    describe('and calling runRequest with a datasource that has no custom query', () => {
      const { runner, request, runnerArgs, runRequest, datasource } = getStandardTestContext({
        variables: { getType: () => VariableSupportType.Standard, toDataQuery: () => undefined },
      });
      const observable = runner.runRequest(runnerArgs, request);

      it('then it should return correct observable', async () => {
        await expect(observable).toEmitValuesWith((received) => {
          const value = received[0];
          expect(value).toEqual({});
        });
      });

      it('then it should call runRequest with correct args', () => {
        expect(runRequest).toHaveBeenCalledTimes(1);
        expect(runRequest).toHaveBeenCalledWith(datasource, {});
      });
    });
  });

  describe('when using a data source with custom variable support', () => {
    const getCustomTestContext = () => {
      const variable: any = { query: { refId: 'A', query: 'A query' } };
      const timeSrv = {};
      const datasource: any = {
        variables: { getType: () => VariableSupportType.Custom, query: () => undefined, editor: {} },
      };
      const runner = new QueryRunners().getRunnerForDatasource(datasource);
      const runRequest = jest.fn().mockReturnValue(of({}));
      const runnerArgs: any = { datasource, variable, searchFilter: 'A searchFilter', timeSrv, runRequest };
      const request: any = {};

      return { timeSrv, datasource, runner, variable, runnerArgs, request, runRequest };
    };

    describe('and calling getRunnerForDatasource', () => {
      it('then it should return CustomQueryRunner', () => {
        const { runner } = getCustomTestContext();
        expect(runner!.type).toEqual(VariableSupportType.Custom);
      });
    });

    describe('and calling getTarget', () => {
      it('then it should return correct target', () => {
        const { runner, variable, datasource } = getCustomTestContext();
        const target = runner.getTarget({ datasource, variable });
        expect(target).toEqual({ refId: 'A', query: 'A query' });
      });
    });

    describe('and calling runRequest', () => {
      const { runner, request, runnerArgs, runRequest, datasource } = getCustomTestContext();
      const observable = runner.runRequest(runnerArgs, request);

      it('then it should return correct observable', async () => {
        await expect(observable).toEmitValuesWith((received) => {
          const value = received[0];
          expect(value).toEqual({});
        });
      });

      it('then it should call runRequest with correct args', () => {
        expect(runRequest).toHaveBeenCalledTimes(1);
        expect(runRequest).toHaveBeenCalledWith(datasource, {}, datasource.variables.query);
      });
    });
  });

  describe('when using a data source with datasource variable support', () => {
    const getDatasourceTestContext = () => {
      const variable: any = { query: { refId: 'A', query: 'A query' } };
      const timeSrv = {};
      const datasource: any = {
        variables: { getType: () => VariableSupportType.Datasource },
      };
      const runner = new QueryRunners().getRunnerForDatasource(datasource);
      const runRequest = jest.fn().mockReturnValue(of({}));
      const runnerArgs: any = { datasource, variable, searchFilter: 'A searchFilter', timeSrv, runRequest };
      const request: any = {};

      return { timeSrv, datasource, runner, variable, runnerArgs, request, runRequest };
    };

    describe('and calling getRunnerForDatasource', () => {
      it('then it should return DatasourceQueryRunner', () => {
        const { runner } = getDatasourceTestContext();
        expect(runner!.type).toEqual(VariableSupportType.Datasource);
      });
    });

    describe('and calling getTarget', () => {
      it('then it should return correct target', () => {
        const { runner, datasource, variable } = getDatasourceTestContext();
        const target = runner.getTarget({ datasource, variable });
        expect(target).toEqual({ refId: 'A', query: 'A query' });
      });

      describe('and ref id is missing', () => {
        it('then it should return correct target with dummy ref id', () => {
          const { runner, datasource, variable } = getDatasourceTestContext();
          delete variable.query.refId;
          const target = runner.getTarget({ datasource, variable });
          expect(target).toEqual({ refId: variableDummyRefId, query: 'A query' });
        });
      });
    });

    describe('and calling runRequest', () => {
      const { runner, request, runnerArgs, runRequest, datasource } = getDatasourceTestContext();
      const observable = runner.runRequest(runnerArgs, request);

      it('then it should return correct observable', async () => {
        await expect(observable).toEmitValuesWith((received) => {
          const value = received[0];
          expect(value).toEqual({});
        });
      });

      it('then it should call runRequest with correct args', () => {
        expect(runRequest).toHaveBeenCalledTimes(1);
        expect(runRequest).toHaveBeenCalledWith(datasource, {});
      });
    });
  });

  describe('when using a data source with unknown variable support', () => {
    describe('and calling getRunnerForDatasource', () => {
      it('then it should throw', () => {
        const datasource: any = {
          variables: {},
        };

        expect(() => new QueryRunners().getRunnerForDatasource(datasource)).toThrow();
      });
    });
  });
});
