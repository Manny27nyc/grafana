// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { DataSourceInstanceSettings, DataSourcePluginMeta } from '@grafana/data';

import { variableAdapters } from '../adapters';
import { createAdHocVariableAdapter } from './adapter';
import { reduxTester } from '../../../../test/core/redux/reduxTester';
import { getRootReducer, RootReducerType } from '../state/helpers';
import { toVariableIdentifier, toVariablePayload } from '../state/types';
import {
  addFilter,
  AdHocTableOptions,
  applyFilterFromTable,
  changeFilter,
  changeVariableDatasource,
  initAdHocVariableEditor,
  removeFilter,
  setFiltersFromUrl,
} from './actions';
import { filterAdded, filterRemoved, filtersRestored, filterUpdated } from './reducer';
import { addVariable, changeVariableProp } from '../state/sharedReducer';
import { VariableModel } from 'app/features/variables/types';
import { changeVariableEditorExtended, setIdInEditor } from '../editor/reducer';
import { adHocBuilder } from '../shared/testing/builders';
import { locationService } from '@grafana/runtime';

const getList = jest.fn().mockReturnValue([]);
const getDatasource = jest.fn().mockResolvedValue({});

locationService.partial = jest.fn();
jest.mock('app/features/plugins/datasource_srv', () => ({
  getDatasourceSrv: jest.fn(() => ({
    get: getDatasource,
    getList,
  })),
}));

variableAdapters.setInit(() => [createAdHocVariableAdapter()]);

describe('adhoc actions', () => {
  describe('when applyFilterFromTable is dispatched and filter already exist', () => {
    it('then correct actions are dispatched', async () => {
      const options: AdHocTableOptions = {
        datasource: { uid: 'influxdb' },
        key: 'filter-key',
        value: 'filter-value',
        operator: '=',
      };

      const existingFilter = {
        key: 'filter-key',
        value: 'filter-existing',
        operator: '!=',
        condition: '',
      };

      const variable = adHocBuilder()
        .withId('Filters')
        .withName('Filters')
        .withFilters([existingFilter])
        .withDatasource(options.datasource)
        .build();

      const tester = await reduxTester<RootReducerType>()
        .givenRootReducer(getRootReducer())
        .whenActionIsDispatched(createAddVariableAction(variable))
        .whenAsyncActionIsDispatched(applyFilterFromTable(options), true);

      const expectedQuery = { 'var-Filters': ['filter-key|!=|filter-existing', 'filter-key|=|filter-value'] };
      const expectedFilter = { key: 'filter-key', value: 'filter-value', operator: '=', condition: '' };

      tester.thenDispatchedActionsShouldEqual(filterAdded(toVariablePayload(variable, expectedFilter)));

      expect(locationService.partial).toHaveBeenLastCalledWith(expectedQuery);
    });
  });

  describe('when applyFilterFromTable is dispatched and previously no variable or filter exists', () => {
    it('then correct actions are dispatched', async () => {
      const options: AdHocTableOptions = {
        datasource: { uid: 'influxdb' },
        key: 'filter-key',
        value: 'filter-value',
        operator: '=',
      };

      const tester = await reduxTester<RootReducerType>()
        .givenRootReducer(getRootReducer())
        .whenAsyncActionIsDispatched(applyFilterFromTable(options), true);

      const variable = adHocBuilder().withId('Filters').withName('Filters').withDatasource(options.datasource).build();

      const expectedQuery = { 'var-Filters': ['filter-key|=|filter-value'] };
      const expectedFilter = { key: 'filter-key', value: 'filter-value', operator: '=', condition: '' };

      tester.thenDispatchedActionsShouldEqual(
        createAddVariableAction(variable),
        filterAdded(toVariablePayload(variable, expectedFilter))
      );

      expect(locationService.partial).toHaveBeenLastCalledWith(expectedQuery);
    });
  });

  describe('when applyFilterFromTable is dispatched and previously no filter exists', () => {
    it('then correct actions are dispatched', async () => {
      const options: AdHocTableOptions = {
        datasource: { uid: 'influxdb' },
        key: 'filter-key',
        value: 'filter-value',
        operator: '=',
      };

      const variable = adHocBuilder()
        .withId('Filters')
        .withName('Filters')
        .withFilters([])
        .withDatasource(options.datasource)
        .build();

      const tester = await reduxTester<RootReducerType>()
        .givenRootReducer(getRootReducer())
        .whenActionIsDispatched(createAddVariableAction(variable))
        .whenAsyncActionIsDispatched(applyFilterFromTable(options), true);

      const expectedFilter = { key: 'filter-key', value: 'filter-value', operator: '=', condition: '' };
      const expectedQuery = { 'var-Filters': ['filter-key|=|filter-value'] };

      tester.thenDispatchedActionsShouldEqual(filterAdded(toVariablePayload(variable, expectedFilter)));
      expect(locationService.partial).toHaveBeenLastCalledWith(expectedQuery);
    });
  });

  describe('when applyFilterFromTable is dispatched and adhoc variable with other datasource exists', () => {
    it('then correct actions are dispatched', async () => {
      const options: AdHocTableOptions = {
        datasource: { uid: 'influxdb' },
        key: 'filter-key',
        value: 'filter-value',
        operator: '=',
      };

      const existing = adHocBuilder()
        .withId('elastic-filter')
        .withName('elastic-filter')
        .withDatasource({ uid: 'elasticsearch' })
        .build();

      const variable = adHocBuilder().withId('Filters').withName('Filters').withDatasource(options.datasource).build();

      const tester = await reduxTester<RootReducerType>()
        .givenRootReducer(getRootReducer())
        .whenActionIsDispatched(createAddVariableAction(existing))
        .whenAsyncActionIsDispatched(applyFilterFromTable(options), true);

      const expectedFilter = { key: 'filter-key', value: 'filter-value', operator: '=', condition: '' };
      const expectedQuery = { 'var-elastic-filter': [] as string[], 'var-Filters': ['filter-key|=|filter-value'] };

      tester.thenDispatchedActionsShouldEqual(
        createAddVariableAction(variable, 1),
        filterAdded(toVariablePayload(variable, expectedFilter))
      );

      expect(locationService.partial).toHaveBeenLastCalledWith(expectedQuery);
    });
  });

  describe('when changeFilter is dispatched', () => {
    it('then correct actions are dispatched', async () => {
      const existing = {
        key: 'key',
        value: 'value',
        operator: '=',
        condition: '',
      };

      const updated = {
        ...existing,
        operator: '!=',
      };

      const variable = adHocBuilder()
        .withId('elastic-filter')
        .withName('elastic-filter')
        .withFilters([existing])
        .withDatasource({ uid: 'elasticsearch' })
        .build();

      const update = { index: 0, filter: updated };

      const tester = await reduxTester<RootReducerType>()
        .givenRootReducer(getRootReducer())
        .whenActionIsDispatched(createAddVariableAction(variable))
        .whenAsyncActionIsDispatched(changeFilter('elastic-filter', update), true);

      const expectedQuery = { 'var-elastic-filter': ['key|!=|value'] };
      const expectedUpdate = { index: 0, filter: updated };

      tester.thenDispatchedActionsShouldEqual(filterUpdated(toVariablePayload(variable, expectedUpdate)));

      expect(locationService.partial).toHaveBeenLastCalledWith(expectedQuery);
    });
  });

  describe('when addFilter is dispatched on variable with existing filter', () => {
    it('then correct actions are dispatched', async () => {
      const existing = {
        key: 'key',
        value: 'value',
        operator: '=',
        condition: '',
      };

      const adding = {
        ...existing,
        operator: '!=',
      };

      const variable = adHocBuilder()
        .withId('elastic-filter')
        .withName('elastic-filter')
        .withFilters([existing])
        .withDatasource({ uid: 'elasticsearch' })
        .build();

      const tester = await reduxTester<RootReducerType>()
        .givenRootReducer(getRootReducer())
        .whenActionIsDispatched(createAddVariableAction(variable))
        .whenAsyncActionIsDispatched(addFilter('elastic-filter', adding), true);

      const expectedQuery = { 'var-elastic-filter': ['key|=|value', 'key|!=|value'] };
      const expectedFilter = { key: 'key', value: 'value', operator: '!=', condition: '' };

      tester.thenDispatchedActionsShouldEqual(filterAdded(toVariablePayload(variable, expectedFilter)));
      expect(locationService.partial).toHaveBeenLastCalledWith(expectedQuery);
    });
  });

  describe('when addFilter is dispatched on variable with no existing filter', () => {
    it('then correct actions are dispatched', async () => {
      const adding = {
        key: 'key',
        value: 'value',
        operator: '=',
        condition: '',
      };

      const variable = adHocBuilder()
        .withId('elastic-filter')
        .withName('elastic-filter')
        .withFilters([])
        .withDatasource({ uid: 'elasticsearch' })
        .build();

      const tester = await reduxTester<RootReducerType>()
        .givenRootReducer(getRootReducer())
        .whenActionIsDispatched(createAddVariableAction(variable))
        .whenAsyncActionIsDispatched(addFilter('elastic-filter', adding), true);

      const expectedQuery = { 'var-elastic-filter': ['key|=|value'] };

      tester.thenDispatchedActionsShouldEqual(filterAdded(toVariablePayload(variable, adding)));
      expect(locationService.partial).toHaveBeenLastCalledWith(expectedQuery);
    });
  });

  describe('when removeFilter is dispatched on variable with no existing filter', () => {
    it('then correct actions are dispatched', async () => {
      const variable = adHocBuilder()
        .withId('elastic-filter')
        .withName('elastic-filter')
        .withFilters([])
        .withDatasource({ uid: 'elasticsearch' })
        .build();

      const tester = await reduxTester<RootReducerType>()
        .givenRootReducer(getRootReducer())
        .whenActionIsDispatched(createAddVariableAction(variable))
        .whenAsyncActionIsDispatched(removeFilter('elastic-filter', 0), true);

      const expectedQuery = { 'var-elastic-filter': [] as string[] };

      tester.thenDispatchedActionsShouldEqual(filterRemoved(toVariablePayload(variable, 0)));
      expect(locationService.partial).toHaveBeenLastCalledWith(expectedQuery);
    });
  });

  describe('when removeFilter is dispatched on variable with existing filter', () => {
    it('then correct actions are dispatched', async () => {
      const filter = {
        key: 'key',
        value: 'value',
        operator: '=',
        condition: '',
      };

      const variable = adHocBuilder()
        .withId('elastic-filter')
        .withName('elastic-filter')
        .withFilters([filter])
        .withDatasource({ uid: 'elasticsearch' })
        .build();

      const tester = await reduxTester<RootReducerType>()
        .givenRootReducer(getRootReducer())
        .whenActionIsDispatched(createAddVariableAction(variable))
        .whenAsyncActionIsDispatched(removeFilter('elastic-filter', 0), true);

      const expectedQuery = { 'var-elastic-filter': [] as string[] };

      tester.thenDispatchedActionsShouldEqual(filterRemoved(toVariablePayload(variable, 0)));
      expect(locationService.partial).toHaveBeenLastCalledWith(expectedQuery);
    });
  });

  describe('when setFiltersFromUrl is dispatched', () => {
    it('then correct actions are dispatched', async () => {
      const existing = {
        key: 'key',
        value: 'value',
        operator: '=',
        condition: '',
      };

      const variable = adHocBuilder()
        .withId('elastic-filter')
        .withName('elastic-filter')
        .withFilters([existing])
        .withDatasource({ uid: 'elasticsearch' })
        .build();

      const fromUrl = [
        { ...existing, condition: '>' },
        { ...existing, name: 'value-2' },
      ];

      const tester = await reduxTester<RootReducerType>()
        .givenRootReducer(getRootReducer())
        .whenActionIsDispatched(createAddVariableAction(variable))
        .whenAsyncActionIsDispatched(setFiltersFromUrl('elastic-filter', fromUrl), true);

      const expectedQuery = { 'var-elastic-filter': ['key|=|value', 'key|=|value'] };
      const expectedFilters = [
        { key: 'key', value: 'value', operator: '=', condition: '>' },
        { key: 'key', value: 'value', operator: '=', condition: '', name: 'value-2' },
      ];

      tester.thenDispatchedActionsShouldEqual(filtersRestored(toVariablePayload(variable, expectedFilters)));
      expect(locationService.partial).toHaveBeenLastCalledWith(expectedQuery);
    });
  });

  describe('when initAdHocVariableEditor is dispatched', () => {
    it('then correct actions are dispatched', async () => {
      const datasources = [
        { ...createDatasource('default', true, true), value: null },
        createDatasource('elasticsearch-v1'),
        createDatasource('loki', false),
        createDatasource('influx'),
        createDatasource('google-sheets', false),
        createDatasource('elasticsearch-v7'),
      ];

      getList.mockRestore();
      getList.mockReturnValue(datasources);

      const tester = reduxTester<RootReducerType>()
        .givenRootReducer(getRootReducer())
        .whenActionIsDispatched(initAdHocVariableEditor());

      const expectedDatasources = [
        { text: '', value: {} },
        { text: 'default (default)', value: { uid: 'default', type: 'default' } },
        { text: 'elasticsearch-v1', value: { uid: 'elasticsearch-v1', type: 'elasticsearch-v1' } },
        { text: 'influx', value: { uid: 'influx', type: 'influx' } },
        { text: 'elasticsearch-v7', value: { uid: 'elasticsearch-v7', type: 'elasticsearch-v7' } },
      ];

      tester.thenDispatchedActionsShouldEqual(
        changeVariableEditorExtended({ propName: 'dataSources', propValue: expectedDatasources })
      );
    });
  });

  describe('when changeVariableDatasource is dispatched with unsupported datasource', () => {
    it('then correct actions are dispatched', async () => {
      const datasource = { uid: 'mysql' };
      const loadingText = 'Ad hoc filters are applied automatically to all queries that target this data source';
      const variable = adHocBuilder().withId('Filters').withName('Filters').withDatasource({ uid: 'influxdb' }).build();

      getDatasource.mockRestore();
      getDatasource.mockResolvedValue(null);

      const tester = await reduxTester<RootReducerType>()
        .givenRootReducer(getRootReducer())
        .whenActionIsDispatched(createAddVariableAction(variable))
        .whenActionIsDispatched(setIdInEditor({ id: variable.id }))
        .whenAsyncActionIsDispatched(changeVariableDatasource(datasource), true);

      tester.thenDispatchedActionsShouldEqual(
        changeVariableEditorExtended({ propName: 'infoText', propValue: loadingText }),
        changeVariableProp(toVariablePayload(variable, { propName: 'datasource', propValue: datasource })),
        changeVariableEditorExtended({
          propName: 'infoText',
          propValue: 'This data source does not support ad hoc filters yet.',
        })
      );
    });
  });

  describe('when changeVariableDatasource is dispatched with datasource', () => {
    it('then correct actions are dispatched', async () => {
      const datasource = { uid: 'elasticsearch' };
      const loadingText = 'Ad hoc filters are applied automatically to all queries that target this data source';
      const variable = adHocBuilder().withId('Filters').withName('Filters').withDatasource({ uid: 'influxdb' }).build();

      getDatasource.mockRestore();
      getDatasource.mockResolvedValue({
        getTagKeys: () => {},
      });

      const tester = await reduxTester<RootReducerType>()
        .givenRootReducer(getRootReducer())
        .whenActionIsDispatched(createAddVariableAction(variable))
        .whenActionIsDispatched(setIdInEditor({ id: variable.id }))
        .whenAsyncActionIsDispatched(changeVariableDatasource(datasource), true);

      tester.thenDispatchedActionsShouldEqual(
        changeVariableEditorExtended({ propName: 'infoText', propValue: loadingText }),
        changeVariableProp(toVariablePayload(variable, { propName: 'datasource', propValue: datasource }))
      );
    });
  });
});

function createAddVariableAction(variable: VariableModel, index = 0) {
  const identifier = toVariableIdentifier(variable);
  const global = false;
  const data = { global, index, model: { ...variable, index: -1, global } };
  return addVariable(toVariablePayload(identifier, data));
}

function createDatasource(name: string, selectable = true, isDefault = false): DataSourceInstanceSettings {
  return {
    name,
    meta: {
      mixed: !selectable,
    } as DataSourcePluginMeta,
    isDefault,
    uid: name,
    type: name,
  } as DataSourceInstanceSettings;
}
