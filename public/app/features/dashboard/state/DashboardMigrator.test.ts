// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { each, map } from 'lodash';
import { DashboardModel } from '../state/DashboardModel';
import { PanelModel } from '../state/PanelModel';
import { GRID_CELL_HEIGHT, GRID_CELL_VMARGIN } from 'app/core/constants';
import { expect } from 'test/lib/common';
import { DataLinkBuiltInVars, MappingType } from '@grafana/data';
import { VariableHide } from '../../variables/types';
import { config } from 'app/core/config';
import { getPanelPlugin } from 'app/features/plugins/__mocks__/pluginMocks';
import { setDataSourceSrv } from '@grafana/runtime';
import { mockDataSource, MockDataSourceSrv } from 'app/features/alerting/unified/mocks';
import { MIXED_DATASOURCE_NAME } from 'app/plugins/datasource/mixed/MixedDataSource';

jest.mock('app/core/services/context_srv', () => ({}));

const dataSources = {
  prom: mockDataSource({
    name: 'prom',
    type: 'prometheus',
  }),
  [MIXED_DATASOURCE_NAME]: mockDataSource({
    name: MIXED_DATASOURCE_NAME,
    type: 'mixed',
    uid: MIXED_DATASOURCE_NAME,
  }),
};

setDataSourceSrv(new MockDataSourceSrv(dataSources));

describe('DashboardModel', () => {
  describe('when creating dashboard with old schema', () => {
    let model: any;
    let graph: any;
    let singlestat: any;
    let table: any;
    let singlestatGauge: any;

    config.panels = {
      stat: getPanelPlugin({ id: 'stat' }).meta,
      gauge: getPanelPlugin({ id: 'gauge' }).meta,
    };

    beforeEach(() => {
      model = new DashboardModel({
        services: {
          filter: { time: { from: 'now-1d', to: 'now' }, list: [{}] },
        },
        pulldowns: [
          { type: 'filtering', enable: true },
          { type: 'annotations', enable: true, annotations: [{ name: 'old' }] },
        ],
        panels: [
          {
            type: 'graph',
            legend: true,
            aliasYAxis: { test: 2 },
            y_formats: ['kbyte', 'ms'],
            grid: {
              min: 1,
              max: 10,
              rightMin: 5,
              rightMax: 15,
              leftLogBase: 1,
              rightLogBase: 2,
              threshold1: 200,
              threshold2: 400,
              threshold1Color: 'yellow',
              threshold2Color: 'red',
            },
            leftYAxisLabel: 'left label',
            targets: [{ refId: 'A' }, {}],
          },
          {
            type: 'singlestat',
            legend: true,
            thresholds: '10,20,30',
            colors: ['#FF0000', 'green', 'orange'],
            aliasYAxis: { test: 2 },
            grid: { min: 1, max: 10 },
            targets: [{ refId: 'A' }, {}],
          },
          {
            type: 'singlestat',
            thresholds: '10,20,30',
            colors: ['#FF0000', 'green', 'orange'],
            gauge: {
              show: true,
              thresholdMarkers: true,
              thresholdLabels: false,
            },
            grid: { min: 1, max: 10 },
          },
          {
            type: 'table',
            legend: true,
            styles: [{ thresholds: ['10', '20', '30'] }, { thresholds: ['100', '200', '300'] }],
            targets: [{ refId: 'A' }, {}],
          },
        ],
      });

      graph = model.panels[0];
      singlestat = model.panels[1];
      singlestatGauge = model.panels[2];
      table = model.panels[3];
    });

    it('should have title', () => {
      expect(model.title).toBe('No Title');
    });

    it('should have panel id', () => {
      expect(graph.id).toBe(1);
    });

    it('should move time and filtering list', () => {
      expect(model.time.from).toBe('now-1d');
      expect(model.templating.list[0].allFormat).toBe('glob');
    });

    it('graphite panel should change name too graph', () => {
      expect(graph.type).toBe('graph');
    });

    it('singlestat panel should be mapped to stat panel', () => {
      expect(singlestat.type).toBe('stat');
      expect(singlestat.fieldConfig.defaults.thresholds.steps[2].value).toBe(30);
      expect(singlestat.fieldConfig.defaults.thresholds.steps[0].color).toBe('#FF0000');
    });

    it('singlestat panel should be mapped to gauge panel', () => {
      expect(singlestatGauge.type).toBe('gauge');
      expect(singlestatGauge.options.showThresholdMarkers).toBe(true);
      expect(singlestatGauge.options.showThresholdLabels).toBe(false);
    });

    it('queries without refId should get it', () => {
      expect(graph.targets[1].refId).toBe('B');
    });

    it('update legend setting', () => {
      expect(graph.legend.show).toBe(true);
    });

    it('move aliasYAxis to series override', () => {
      expect(graph.seriesOverrides[0].alias).toBe('test');
      expect(graph.seriesOverrides[0].yaxis).toBe(2);
    });

    it('should move pulldowns to new schema', () => {
      expect(model.annotations.list[1].name).toBe('old');
    });

    it('table panel should only have two thresholds values', () => {
      expect(table.styles[0].thresholds[0]).toBe('20');
      expect(table.styles[0].thresholds[1]).toBe('30');
      expect(table.styles[1].thresholds[0]).toBe('200');
      expect(table.styles[1].thresholds[1]).toBe('300');
    });

    it('table type should be deprecated', () => {
      expect(table.type).toBe('table-old');
    });

    it('graph grid to yaxes options', () => {
      expect(graph.yaxes[0].min).toBe(1);
      expect(graph.yaxes[0].max).toBe(10);
      expect(graph.yaxes[0].format).toBe('kbyte');
      expect(graph.yaxes[0].label).toBe('left label');
      expect(graph.yaxes[0].logBase).toBe(1);
      expect(graph.yaxes[1].min).toBe(5);
      expect(graph.yaxes[1].max).toBe(15);
      expect(graph.yaxes[1].format).toBe('ms');
      expect(graph.yaxes[1].logBase).toBe(2);

      expect(graph.grid.rightMax).toBe(undefined);
      expect(graph.grid.rightLogBase).toBe(undefined);
      expect(graph.y_formats).toBe(undefined);
    });

    it('dashboard schema version should be set to latest', () => {
      expect(model.schemaVersion).toBe(34);
    });

    it('graph thresholds should be migrated', () => {
      expect(graph.thresholds.length).toBe(2);
      expect(graph.thresholds[0].op).toBe('gt');
      expect(graph.thresholds[0].value).toBe(200);
      expect(graph.thresholds[0].fillColor).toBe('yellow');
      expect(graph.thresholds[1].value).toBe(400);
      expect(graph.thresholds[1].fillColor).toBe('red');
    });

    it('graph thresholds should be migrated onto specified thresholds', () => {
      model = new DashboardModel({
        panels: [
          {
            type: 'graph',
            y_formats: ['kbyte', 'ms'],
            grid: {
              threshold1: 200,
              threshold2: 400,
            },
            thresholds: [{ value: 100 }],
          },
        ],
      });
      graph = model.panels[0];
      expect(graph.thresholds.length).toBe(3);
      expect(graph.thresholds[0].value).toBe(100);
      expect(graph.thresholds[1].value).toBe(200);
      expect(graph.thresholds[2].value).toBe(400);
    });
  });

  describe('when migrating to the grid layout', () => {
    let model: any;

    beforeEach(() => {
      model = {
        rows: [],
      };
    });

    it('should create proper grid', () => {
      model.rows = [createRow({ collapse: false, height: 8 }, [[6], [6]])];
      const dashboard = new DashboardModel(model);
      const panelGridPos = getGridPositions(dashboard);
      const expectedGrid = [
        { x: 0, y: 0, w: 12, h: 8 },
        { x: 12, y: 0, w: 12, h: 8 },
      ];

      expect(panelGridPos).toEqual(expectedGrid);
    });

    it('should add special "row" panel if row is collapsed', () => {
      model.rows = [createRow({ collapse: true, height: 8 }, [[6], [6]]), createRow({ height: 8 }, [[12]])];
      const dashboard = new DashboardModel(model);
      const panelGridPos = getGridPositions(dashboard);
      const expectedGrid = [
        { x: 0, y: 0, w: 24, h: 8 }, // row
        { x: 0, y: 1, w: 24, h: 8 }, // row
        { x: 0, y: 2, w: 24, h: 8 },
      ];

      expect(panelGridPos).toEqual(expectedGrid);
    });

    it('should add special "row" panel if row has visible title', () => {
      model.rows = [
        createRow({ showTitle: true, title: 'Row', height: 8 }, [[6], [6]]),
        createRow({ height: 8 }, [[12]]),
      ];
      const dashboard = new DashboardModel(model);
      const panelGridPos = getGridPositions(dashboard);
      const expectedGrid = [
        { x: 0, y: 0, w: 24, h: 8 }, // row
        { x: 0, y: 1, w: 12, h: 8 },
        { x: 12, y: 1, w: 12, h: 8 },
        { x: 0, y: 9, w: 24, h: 8 }, // row
        { x: 0, y: 10, w: 24, h: 8 },
      ];

      expect(panelGridPos).toEqual(expectedGrid);
    });

    it('should not add "row" panel if row has not visible title or not collapsed', () => {
      model.rows = [
        createRow({ collapse: true, height: 8 }, [[12]]),
        createRow({ height: 8 }, [[12]]),
        createRow({ height: 8 }, [[12], [6], [6]]),
        createRow({ collapse: true, height: 8 }, [[12]]),
      ];
      const dashboard = new DashboardModel(model);
      const panelGridPos = getGridPositions(dashboard);
      const expectedGrid = [
        { x: 0, y: 0, w: 24, h: 8 }, // row
        { x: 0, y: 1, w: 24, h: 8 }, // row
        { x: 0, y: 2, w: 24, h: 8 },
        { x: 0, y: 10, w: 24, h: 8 }, // row
        { x: 0, y: 11, w: 24, h: 8 },
        { x: 0, y: 19, w: 12, h: 8 },
        { x: 12, y: 19, w: 12, h: 8 },
        { x: 0, y: 27, w: 24, h: 8 }, // row
      ];

      expect(panelGridPos).toEqual(expectedGrid);
    });

    it('should add all rows if even one collapsed or titled row is present', () => {
      model.rows = [createRow({ collapse: true, height: 8 }, [[6], [6]]), createRow({ height: 8 }, [[12]])];
      const dashboard = new DashboardModel(model);
      const panelGridPos = getGridPositions(dashboard);
      const expectedGrid = [
        { x: 0, y: 0, w: 24, h: 8 }, // row
        { x: 0, y: 1, w: 24, h: 8 }, // row
        { x: 0, y: 2, w: 24, h: 8 },
      ];

      expect(panelGridPos).toEqual(expectedGrid);
    });

    it('should properly place panels with fixed height', () => {
      model.rows = [
        createRow({ height: 6 }, [[6], [6, 3], [6, 3]]),
        createRow({ height: 6 }, [[4], [4], [4, 3], [4, 3]]),
      ];
      const dashboard = new DashboardModel(model);
      const panelGridPos = getGridPositions(dashboard);
      const expectedGrid = [
        { x: 0, y: 0, w: 12, h: 6 },
        { x: 12, y: 0, w: 12, h: 3 },
        { x: 12, y: 3, w: 12, h: 3 },
        { x: 0, y: 6, w: 8, h: 6 },
        { x: 8, y: 6, w: 8, h: 6 },
        { x: 16, y: 6, w: 8, h: 3 },
        { x: 16, y: 9, w: 8, h: 3 },
      ];

      expect(panelGridPos).toEqual(expectedGrid);
    });

    it('should place panel to the right side of panel having bigger height', () => {
      model.rows = [createRow({ height: 6 }, [[4], [2, 3], [4, 6], [2, 3], [2, 3]])];
      const dashboard = new DashboardModel(model);
      const panelGridPos = getGridPositions(dashboard);
      const expectedGrid = [
        { x: 0, y: 0, w: 8, h: 6 },
        { x: 8, y: 0, w: 4, h: 3 },
        { x: 12, y: 0, w: 8, h: 6 },
        { x: 20, y: 0, w: 4, h: 3 },
        { x: 20, y: 3, w: 4, h: 3 },
      ];

      expect(panelGridPos).toEqual(expectedGrid);
    });

    it('should fill current row if it possible', () => {
      model.rows = [createRow({ height: 9 }, [[4], [2, 3], [4, 6], [2, 3], [2, 3], [8, 3]])];
      const dashboard = new DashboardModel(model);
      const panelGridPos = getGridPositions(dashboard);
      const expectedGrid = [
        { x: 0, y: 0, w: 8, h: 9 },
        { x: 8, y: 0, w: 4, h: 3 },
        { x: 12, y: 0, w: 8, h: 6 },
        { x: 20, y: 0, w: 4, h: 3 },
        { x: 20, y: 3, w: 4, h: 3 },
        { x: 8, y: 6, w: 16, h: 3 },
      ];

      expect(panelGridPos).toEqual(expectedGrid);
    });

    it('should fill current row if it possible (2)', () => {
      model.rows = [createRow({ height: 8 }, [[4], [2, 3], [4, 6], [2, 3], [2, 3], [8, 3]])];
      const dashboard = new DashboardModel(model);
      const panelGridPos = getGridPositions(dashboard);
      const expectedGrid = [
        { x: 0, y: 0, w: 8, h: 8 },
        { x: 8, y: 0, w: 4, h: 3 },
        { x: 12, y: 0, w: 8, h: 6 },
        { x: 20, y: 0, w: 4, h: 3 },
        { x: 20, y: 3, w: 4, h: 3 },
        { x: 8, y: 6, w: 16, h: 3 },
      ];

      expect(panelGridPos).toEqual(expectedGrid);
    });

    it('should fill current row if panel height more than row height', () => {
      model.rows = [createRow({ height: 6 }, [[4], [2, 3], [4, 8], [2, 3], [2, 3]])];
      const dashboard = new DashboardModel(model);
      const panelGridPos = getGridPositions(dashboard);
      const expectedGrid = [
        { x: 0, y: 0, w: 8, h: 6 },
        { x: 8, y: 0, w: 4, h: 3 },
        { x: 12, y: 0, w: 8, h: 8 },
        { x: 20, y: 0, w: 4, h: 3 },
        { x: 20, y: 3, w: 4, h: 3 },
      ];

      expect(panelGridPos).toEqual(expectedGrid);
    });

    it('should wrap panels to multiple rows', () => {
      model.rows = [createRow({ height: 6 }, [[6], [6], [12], [6], [3], [3]])];
      const dashboard = new DashboardModel(model);
      const panelGridPos = getGridPositions(dashboard);
      const expectedGrid = [
        { x: 0, y: 0, w: 12, h: 6 },
        { x: 12, y: 0, w: 12, h: 6 },
        { x: 0, y: 6, w: 24, h: 6 },
        { x: 0, y: 12, w: 12, h: 6 },
        { x: 12, y: 12, w: 6, h: 6 },
        { x: 18, y: 12, w: 6, h: 6 },
      ];

      expect(panelGridPos).toEqual(expectedGrid);
    });

    it('should add repeated row if repeat set', () => {
      model.rows = [
        createRow({ showTitle: true, title: 'Row', height: 8, repeat: 'server' }, [[6]]),
        createRow({ height: 8 }, [[12]]),
      ];
      const dashboard = new DashboardModel(model);
      const panelGridPos = getGridPositions(dashboard);
      const expectedGrid = [
        { x: 0, y: 0, w: 24, h: 8 },
        { x: 0, y: 1, w: 12, h: 8 },
        { x: 0, y: 9, w: 24, h: 8 },
        { x: 0, y: 10, w: 24, h: 8 },
      ];

      expect(panelGridPos).toEqual(expectedGrid);
      expect(dashboard.panels[0].repeat).toBe('server');
      expect(dashboard.panels[1].repeat).toBeUndefined();
      expect(dashboard.panels[2].repeat).toBeUndefined();
      expect(dashboard.panels[3].repeat).toBeUndefined();
    });

    it('should ignore repeated row', () => {
      model.rows = [
        createRow({ showTitle: true, title: 'Row1', height: 8, repeat: 'server' }, [[6]]),
        createRow(
          {
            showTitle: true,
            title: 'Row2',
            height: 8,
            repeatIteration: 12313,
            repeatRowId: 1,
          },
          [[6]]
        ),
      ];

      const dashboard = new DashboardModel(model);
      expect(dashboard.panels[0].repeat).toBe('server');
      expect(dashboard.panels.length).toBe(2);
    });

    it('should assign id', () => {
      model.rows = [createRow({ collapse: true, height: 8 }, [[6], [6]])];
      model.rows[0].panels[0] = {};

      const dashboard = new DashboardModel(model);
      expect(dashboard.panels[0].id).toBe(1);
    });
  });

  describe('when migrating from minSpan to maxPerRow', () => {
    it('maxPerRow should be correct', () => {
      const model = {
        panels: [{ minSpan: 8 }],
      };
      const dashboard = new DashboardModel(model);
      expect(dashboard.panels[0].maxPerRow).toBe(3);
    });
  });

  describe('when migrating panel links', () => {
    let model: any;

    beforeEach(() => {
      model = new DashboardModel({
        panels: [
          {
            links: [
              {
                url: 'http://mylink.com',
                keepTime: true,
                title: 'test',
              },
              {
                url: 'http://mylink.com?existingParam',
                params: 'customParam',
                title: 'test',
              },
              {
                url: 'http://mylink.com?existingParam',
                includeVars: true,
                title: 'test',
              },
              {
                dashboard: 'my other dashboard',
                title: 'test',
              },
              {
                dashUri: '',
                title: 'test',
              },
              {
                type: 'dashboard',
                keepTime: true,
              },
            ],
          },
        ],
      });
    });

    it('should add keepTime as variable', () => {
      expect(model.panels[0].links[0].url).toBe(`http://mylink.com?$${DataLinkBuiltInVars.keepTime}`);
    });

    it('should add params to url', () => {
      expect(model.panels[0].links[1].url).toBe('http://mylink.com?existingParam&customParam');
    });

    it('should add includeVars to url', () => {
      expect(model.panels[0].links[2].url).toBe(`http://mylink.com?existingParam&$${DataLinkBuiltInVars.includeVars}`);
    });

    it('should slugify dashboard name', () => {
      expect(model.panels[0].links[3].url).toBe(`dashboard/db/my-other-dashboard`);
    });
  });

  describe('when migrating variables', () => {
    let model: any;
    beforeEach(() => {
      model = new DashboardModel({
        panels: [
          {
            //graph panel
            options: {
              dataLinks: [
                {
                  url: 'http://mylink.com?series=${__series_name}',
                },
                {
                  url: 'http://mylink.com?series=${__value_time}',
                },
              ],
            },
          },
          {
            //  panel with field options
            options: {
              fieldOptions: {
                defaults: {
                  links: [
                    {
                      url: 'http://mylink.com?series=${__series_name}',
                    },
                    {
                      url: 'http://mylink.com?series=${__value_time}',
                    },
                  ],
                  title: '$__cell_0 * $__field_name * $__series_name',
                },
              },
            },
          },
        ],
      });
    });

    describe('data links', () => {
      it('should replace __series_name variable with __series.name', () => {
        expect(model.panels[0].options.dataLinks[0].url).toBe('http://mylink.com?series=${__series.name}');
        expect(model.panels[1].options.fieldOptions.defaults.links[0].url).toBe(
          'http://mylink.com?series=${__series.name}'
        );
      });

      it('should replace __value_time variable with __value.time', () => {
        expect(model.panels[0].options.dataLinks[1].url).toBe('http://mylink.com?series=${__value.time}');
        expect(model.panels[1].options.fieldOptions.defaults.links[1].url).toBe(
          'http://mylink.com?series=${__value.time}'
        );
      });
    });

    describe('field display', () => {
      it('should replace __series_name and __field_name variables with new syntax', () => {
        expect(model.panels[1].options.fieldOptions.defaults.title).toBe(
          '$__cell_0 * ${__field.name} * ${__series.name}'
        );
      });
    });
  });

  describe('when migrating labels from DataFrame to Field', () => {
    let model: any;
    beforeEach(() => {
      model = new DashboardModel({
        panels: [
          {
            //graph panel
            options: {
              dataLinks: [
                {
                  url: 'http://mylink.com?series=${__series.labels}&${__series.labels.a}',
                },
              ],
            },
          },
          {
            //  panel with field options
            options: {
              fieldOptions: {
                defaults: {
                  links: [
                    {
                      url: 'http://mylink.com?series=${__series.labels}&${__series.labels.x}',
                    },
                  ],
                },
              },
            },
          },
        ],
      });
    });

    describe('data links', () => {
      it('should replace __series.label variable with __field.label', () => {
        expect(model.panels[0].options.dataLinks[0].url).toBe(
          'http://mylink.com?series=${__field.labels}&${__field.labels.a}'
        );
        expect(model.panels[1].options.fieldOptions.defaults.links[0].url).toBe(
          'http://mylink.com?series=${__field.labels}&${__field.labels.x}'
        );
      });
    });
  });

  describe('when migrating variables with multi support', () => {
    let model: DashboardModel;

    beforeEach(() => {
      model = new DashboardModel({
        templating: {
          list: [
            {
              multi: false,
              current: {
                value: ['value'],
                text: ['text'],
              },
            },
            {
              multi: true,
              current: {
                value: ['value'],
                text: ['text'],
              },
            },
          ],
        },
      });
    });

    it('should have two variables after migration', () => {
      expect(model.templating.list.length).toBe(2);
    });

    it('should be migrated if being out of sync', () => {
      expect(model.templating.list[0].multi).toBe(false);
      expect(model.templating.list[0].current).toEqual({
        text: 'text',
        value: 'value',
      });
    });

    it('should not be migrated if being in sync', () => {
      expect(model.templating.list[1].multi).toBe(true);
      expect(model.templating.list[1].current).toEqual({
        text: ['text'],
        value: ['value'],
      });
    });
  });

  describe('when migrating variables with tags', () => {
    let model: DashboardModel;

    beforeEach(() => {
      model = new DashboardModel({
        templating: {
          list: [
            {
              type: 'query',
              tags: ['Africa', 'America', 'Asia', 'Europe'],
              tagsQuery: 'select datacenter from x',
              tagValuesQuery: 'select value from x where datacenter = xyz',
              useTags: true,
            },
            {
              type: 'query',
              current: {
                tags: [
                  {
                    selected: true,
                    text: 'America',
                    values: ['server-us-east', 'server-us-central', 'server-us-west'],
                    valuesText: 'server-us-east + server-us-central + server-us-west',
                  },
                  {
                    selected: true,
                    text: 'Europe',
                    values: ['server-eu-east', 'server-eu-west'],
                    valuesText: 'server-eu-east + server-eu-west',
                  },
                ],
                text: 'server-us-east + server-us-central + server-us-west + server-eu-east + server-eu-west',
                value: ['server-us-east', 'server-us-central', 'server-us-west', 'server-eu-east', 'server-eu-west'],
              },
              tags: ['Africa', 'America', 'Asia', 'Europe'],
              tagsQuery: 'select datacenter from x',
              tagValuesQuery: 'select value from x where datacenter = xyz',
              useTags: true,
            },
            {
              type: 'query',
              tags: [
                { text: 'Africa', selected: false },
                { text: 'America', selected: true },
                { text: 'Asia', selected: false },
                { text: 'Europe', selected: false },
              ],
              tagsQuery: 'select datacenter from x',
              tagValuesQuery: 'select value from x where datacenter = xyz',
              useTags: true,
            },
          ],
        },
      });
    });

    it('should have three variables after migration', () => {
      expect(model.templating.list.length).toBe(3);
    });

    it('should have no tags', () => {
      expect(model.templating.list[0].tags).toBeUndefined();
      expect(model.templating.list[1].tags).toBeUndefined();
      expect(model.templating.list[2].tags).toBeUndefined();
    });

    it('should have no tagsQuery property', () => {
      expect(model.templating.list[0].tagsQuery).toBeUndefined();
      expect(model.templating.list[1].tagsQuery).toBeUndefined();
      expect(model.templating.list[2].tagsQuery).toBeUndefined();
    });

    it('should have no tagValuesQuery property', () => {
      expect(model.templating.list[0].tagValuesQuery).toBeUndefined();
      expect(model.templating.list[1].tagValuesQuery).toBeUndefined();
      expect(model.templating.list[2].tagValuesQuery).toBeUndefined();
    });

    it('should have no useTags property', () => {
      expect(model.templating.list[0].useTags).toBeUndefined();
      expect(model.templating.list[1].useTags).toBeUndefined();
      expect(model.templating.list[2].useTags).toBeUndefined();
    });
  });

  describe('when migrating to new Text Panel', () => {
    let model: DashboardModel;

    beforeEach(() => {
      model = new DashboardModel({
        panels: [
          {
            id: 2,
            type: 'text',
            title: 'Angular Text Panel',
            content:
              '# Angular Text Panel\n# $constant\n\nFor markdown syntax help: [commonmark.org/help](https://commonmark.org/help/)\n\n## $text\n\n',
            mode: 'markdown',
          },
          {
            id: 3,
            type: 'text2',
            title: 'React Text Panel from scratch',
            options: {
              mode: 'markdown',
              content:
                '# React Text Panel from scratch\n# $constant\n\nFor markdown syntax help: [commonmark.org/help](https://commonmark.org/help/)\n\n## $text',
            },
          },
          {
            id: 4,
            type: 'text2',
            title: 'React Text Panel from Angular Panel',
            options: {
              mode: 'markdown',
              content:
                '# React Text Panel from Angular Panel\n# $constant\n\nFor markdown syntax help: [commonmark.org/help](https://commonmark.org/help/)\n\n## $text',
              angular: {
                content:
                  '# React Text Panel from Angular Panel\n# $constant\n\nFor markdown syntax help: [commonmark.org/help](https://commonmark.org/help/)\n\n## $text\n',
                mode: 'markdown',
                options: {},
              },
            },
          },
        ],
      });
    });

    it('should have 3 panels after migration', () => {
      expect(model.panels.length).toBe(3);
    });

    it('should not migrate panel with old Text Panel id', () => {
      const oldAngularPanel: any = model.panels[0];
      expect(oldAngularPanel.id).toEqual(2);
      expect(oldAngularPanel.type).toEqual('text');
      expect(oldAngularPanel.title).toEqual('Angular Text Panel');
      expect(oldAngularPanel.content).toEqual(
        '# Angular Text Panel\n# $constant\n\nFor markdown syntax help: [commonmark.org/help](https://commonmark.org/help/)\n\n## $text\n\n'
      );
      expect(oldAngularPanel.mode).toEqual('markdown');
    });

    it('should migrate panels with new Text Panel id', () => {
      const reactPanel: any = model.panels[1];
      expect(reactPanel.id).toEqual(3);
      expect(reactPanel.type).toEqual('text');
      expect(reactPanel.title).toEqual('React Text Panel from scratch');
      expect(reactPanel.options.content).toEqual(
        '# React Text Panel from scratch\n# $constant\n\nFor markdown syntax help: [commonmark.org/help](https://commonmark.org/help/)\n\n## $text'
      );
      expect(reactPanel.options.mode).toEqual('markdown');
    });

    it('should clean up old angular options for panels with new Text Panel id', () => {
      const reactPanel: any = model.panels[2];
      expect(reactPanel.id).toEqual(4);
      expect(reactPanel.type).toEqual('text');
      expect(reactPanel.title).toEqual('React Text Panel from Angular Panel');
      expect(reactPanel.options.content).toEqual(
        '# React Text Panel from Angular Panel\n# $constant\n\nFor markdown syntax help: [commonmark.org/help](https://commonmark.org/help/)\n\n## $text'
      );
      expect(reactPanel.options.mode).toEqual('markdown');
      expect(reactPanel.options.angular).toBeUndefined();
    });
  });

  describe('when migrating constant variables so they are always hidden', () => {
    let model: DashboardModel;

    beforeEach(() => {
      model = new DashboardModel({
        templating: {
          list: [
            {
              type: 'query',
              hide: VariableHide.dontHide,
              datasource: null,
              allFormat: '',
            },
            {
              type: 'query',
              hide: VariableHide.hideLabel,
              datasource: null,
              allFormat: '',
            },
            {
              type: 'query',
              hide: VariableHide.hideVariable,
              datasource: null,
              allFormat: '',
            },
            {
              type: 'constant',
              hide: VariableHide.dontHide,
              query: 'default value',
              current: { selected: true, text: 'A', value: 'B' },
              options: [{ selected: true, text: 'A', value: 'B' }],
              datasource: null,
              allFormat: '',
            },
            {
              type: 'constant',
              hide: VariableHide.hideLabel,
              query: 'default value',
              current: { selected: true, text: 'A', value: 'B' },
              options: [{ selected: true, text: 'A', value: 'B' }],
              datasource: null,
              allFormat: '',
            },
            {
              type: 'constant',
              hide: VariableHide.hideVariable,
              query: 'default value',
              current: { selected: true, text: 'A', value: 'B' },
              options: [{ selected: true, text: 'A', value: 'B' }],
              datasource: null,
              allFormat: '',
            },
          ],
        },
      });
    });

    it('should have six variables after migration', () => {
      expect(model.templating.list.length).toBe(6);
    });

    it('should not touch other variable types', () => {
      expect(model.templating.list[0].hide).toEqual(VariableHide.dontHide);
      expect(model.templating.list[1].hide).toEqual(VariableHide.hideLabel);
      expect(model.templating.list[2].hide).toEqual(VariableHide.hideVariable);
    });

    it('should migrate visible constant variables to textbox variables', () => {
      expect(model.templating.list[3]).toEqual({
        type: 'textbox',
        hide: VariableHide.dontHide,
        query: 'default value',
        current: { selected: true, text: 'default value', value: 'default value' },
        options: [{ selected: true, text: 'default value', value: 'default value' }],
        datasource: null,
        allFormat: '',
      });
      expect(model.templating.list[4]).toEqual({
        type: 'textbox',
        hide: VariableHide.hideLabel,
        query: 'default value',
        current: { selected: true, text: 'default value', value: 'default value' },
        options: [{ selected: true, text: 'default value', value: 'default value' }],
        datasource: null,
        allFormat: '',
      });
    });

    it('should change current and options for hidden constant variables', () => {
      expect(model.templating.list[5]).toEqual({
        type: 'constant',
        hide: VariableHide.hideVariable,
        query: 'default value',
        current: { selected: true, text: 'default value', value: 'default value' },
        options: [{ selected: true, text: 'default value', value: 'default value' }],
        datasource: null,
        allFormat: '',
      });
    });
  });

  describe('when migrating variable refresh to on dashboard load', () => {
    let model: DashboardModel;

    beforeEach(() => {
      model = new DashboardModel({
        templating: {
          list: [
            {
              type: 'query',
              name: 'variable_with_never_refresh_with_options',
              options: [{ text: 'A', value: 'A' }],
              refresh: 0,
            },
            {
              type: 'query',
              name: 'variable_with_never_refresh_without_options',
              options: [],
              refresh: 0,
            },
            {
              type: 'query',
              name: 'variable_with_dashboard_refresh_with_options',
              options: [{ text: 'A', value: 'A' }],
              refresh: 1,
            },
            {
              type: 'query',
              name: 'variable_with_dashboard_refresh_without_options',
              options: [],
              refresh: 1,
            },
            {
              type: 'query',
              name: 'variable_with_timerange_refresh_with_options',
              options: [{ text: 'A', value: 'A' }],
              refresh: 2,
            },
            {
              type: 'query',
              name: 'variable_with_timerange_refresh_without_options',
              options: [],
              refresh: 2,
            },
            {
              type: 'query',
              name: 'variable_with_no_refresh_with_options',
              options: [{ text: 'A', value: 'A' }],
            },
            {
              type: 'query',
              name: 'variable_with_no_refresh_without_options',
              options: [],
            },
            {
              type: 'query',
              name: 'variable_with_unknown_refresh_with_options',
              options: [{ text: 'A', value: 'A' }],
              refresh: 2001,
            },
            {
              type: 'query',
              name: 'variable_with_unknown_refresh_without_options',
              options: [],
              refresh: 2001,
            },
            {
              type: 'custom',
              name: 'custom',
              options: [{ text: 'custom', value: 'custom' }],
            },
            {
              type: 'textbox',
              name: 'textbox',
              options: [{ text: 'Hello', value: 'World' }],
            },
            {
              type: 'datasource',
              name: 'datasource',
              options: [{ text: 'ds', value: 'ds' }], // fake example doesn't exist
            },
            {
              type: 'interval',
              name: 'interval',
              options: [{ text: '1m', value: '1m' }],
            },
          ],
        },
      });
    });

    it('should have 11 variables after migration', () => {
      expect(model.templating.list.length).toBe(14);
    });

    it('should not affect custom variable types', () => {
      const custom = model.templating.list[10];
      expect(custom.type).toEqual('custom');
      expect(custom.options).toEqual([{ text: 'custom', value: 'custom' }]);
    });

    it('should not affect textbox variable types', () => {
      const textbox = model.templating.list[11];
      expect(textbox.type).toEqual('textbox');
      expect(textbox.options).toEqual([{ text: 'Hello', value: 'World' }]);
    });

    it('should not affect datasource variable types', () => {
      const datasource = model.templating.list[12];
      expect(datasource.type).toEqual('datasource');
      expect(datasource.options).toEqual([{ text: 'ds', value: 'ds' }]);
    });

    it('should not affect interval variable types', () => {
      const interval = model.templating.list[13];
      expect(interval.type).toEqual('interval');
      expect(interval.options).toEqual([{ text: '1m', value: '1m' }]);
    });

    it('should removed options from all query variables', () => {
      const queryVariables = model.templating.list.filter((v) => v.type === 'query');
      expect(queryVariables).toHaveLength(10);
      const noOfOptions = queryVariables.reduce((all, variable) => all + variable.options.length, 0);
      expect(noOfOptions).toBe(0);
    });

    it('should set the refresh prop to on dashboard load for all query variables that have never or unknown', () => {
      expect(model.templating.list[0].refresh).toBe(1);
      expect(model.templating.list[1].refresh).toBe(1);
      expect(model.templating.list[2].refresh).toBe(1);
      expect(model.templating.list[3].refresh).toBe(1);
      expect(model.templating.list[4].refresh).toBe(2);
      expect(model.templating.list[5].refresh).toBe(2);
      expect(model.templating.list[6].refresh).toBe(1);
      expect(model.templating.list[7].refresh).toBe(1);
      expect(model.templating.list[8].refresh).toBe(1);
      expect(model.templating.list[9].refresh).toBe(1);
      expect(model.templating.list[10].refresh).toBeUndefined();
      expect(model.templating.list[11].refresh).toBeUndefined();
      expect(model.templating.list[12].refresh).toBeUndefined();
      expect(model.templating.list[13].refresh).toBeUndefined();
    });
  });

  describe('when migrating old value mapping model', () => {
    let model: DashboardModel;

    beforeEach(() => {
      model = new DashboardModel({
        panels: [
          {
            id: 1,
            type: 'timeseries',
            fieldConfig: {
              defaults: {
                thresholds: {
                  mode: 'absolute',
                  steps: [
                    {
                      color: 'green',
                      value: null,
                    },
                    {
                      color: 'red',
                      value: 80,
                    },
                  ],
                },
                mappings: [
                  {
                    id: 0,
                    text: '1',
                    type: 1,
                    value: 'up',
                  },
                  {
                    id: 1,
                    text: 'BAD',
                    type: 1,
                    value: 'down',
                  },
                  {
                    from: '0',
                    id: 2,
                    text: 'below 30',
                    to: '30',
                    type: 2,
                  },
                  {
                    from: '30',
                    id: 3,
                    text: '100',
                    to: '100',
                    type: 2,
                  },
                  {
                    type: 1,
                    value: 'null',
                    text: 'it is null',
                  },
                ],
              },
              overrides: [
                {
                  matcher: { id: 'byName', options: 'D-series' },
                  properties: [
                    {
                      id: 'mappings',
                      value: [
                        {
                          id: 0,
                          text: 'OverrideText',
                          type: 1,
                          value: 'up',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          },
        ],
      });
    });

    it('should migrate value mapping model', () => {
      expect(model.panels[0].fieldConfig.defaults.mappings).toEqual([
        {
          type: MappingType.ValueToText,
          options: {
            down: { text: 'BAD', color: undefined },
            up: { text: '1', color: 'green' },
          },
        },
        {
          type: MappingType.RangeToText,
          options: {
            from: 0,
            to: 30,
            result: { text: 'below 30' },
          },
        },
        {
          type: MappingType.RangeToText,
          options: {
            from: 30,
            to: 100,
            result: { text: '100', color: 'red' },
          },
        },
        {
          type: MappingType.SpecialValue,
          options: {
            match: 'null',
            result: { text: 'it is null', color: undefined },
          },
        },
      ]);

      expect(model.panels[0].fieldConfig.overrides).toEqual([
        {
          matcher: { id: 'byName', options: 'D-series' },
          properties: [
            {
              id: 'mappings',
              value: [
                {
                  type: MappingType.ValueToText,
                  options: {
                    up: { text: 'OverrideText' },
                  },
                },
              ],
            },
          ],
        },
      ]);
    });
  });

  describe('when migrating tooltipOptions to tooltip', () => {
    it('should rename options.tooltipOptions to options.tooltip', () => {
      const model = new DashboardModel({
        panels: [
          {
            type: 'timeseries',
            legend: true,
            options: {
              tooltipOptions: { mode: 'multi' },
            },
          },
          {
            type: 'xychart',
            legend: true,
            options: {
              tooltipOptions: { mode: 'single' },
            },
          },
        ],
      });
      expect(model.panels[0].options).toMatchInlineSnapshot(`
        Object {
          "tooltip": Object {
            "mode": "multi",
          },
        }
      `);
      expect(model.panels[1].options).toMatchInlineSnapshot(`
        Object {
          "tooltip": Object {
            "mode": "single",
          },
        }
      `);
    });
  });

  describe('when migrating singlestat value mappings', () => {
    it('should migrate value mapping', () => {
      const model = new DashboardModel({
        panels: [
          {
            type: 'singlestat',
            legend: true,
            thresholds: '10,20,30',
            colors: ['#FF0000', 'green', 'orange'],
            aliasYAxis: { test: 2 },
            grid: { min: 1, max: 10 },
            targets: [{ refId: 'A' }, {}],
            mappingType: 1,
            mappingTypes: [
              {
                name: 'value to text',
                value: 1,
              },
            ],
            valueMaps: [
              {
                op: '=',
                text: 'test',
                value: '20',
              },
              {
                op: '=',
                text: 'test1',
                value: '30',
              },
              {
                op: '=',
                text: '50',
                value: '40',
              },
            ],
          },
        ],
      });
      expect(model.panels[0].fieldConfig.defaults.mappings).toMatchInlineSnapshot(`
        Array [
          Object {
            "options": Object {
              "20": Object {
                "color": undefined,
                "text": "test",
              },
              "30": Object {
                "color": undefined,
                "text": "test1",
              },
              "40": Object {
                "color": "orange",
                "text": "50",
              },
            },
            "type": "value",
          },
        ]
      `);
    });

    it('should migrate range mapping', () => {
      const model = new DashboardModel({
        panels: [
          {
            type: 'singlestat',
            legend: true,
            thresholds: '10,20,30',
            colors: ['#FF0000', 'green', 'orange'],
            aliasYAxis: { test: 2 },
            grid: { min: 1, max: 10 },
            targets: [{ refId: 'A' }, {}],
            mappingType: 2,
            mappingTypes: [
              {
                name: 'range to text',
                value: 2,
              },
            ],
            rangeMaps: [
              {
                from: '20',
                to: '25',
                text: 'text1',
              },
              {
                from: '1',
                to: '5',
                text: 'text2',
              },
              {
                from: '5',
                to: '10',
                text: '50',
              },
            ],
          },
        ],
      });
      expect(model.panels[0].fieldConfig.defaults.mappings).toMatchInlineSnapshot(`
        Array [
          Object {
            "options": Object {
              "from": 20,
              "result": Object {
                "color": undefined,
                "text": "text1",
              },
              "to": 25,
            },
            "type": "range",
          },
          Object {
            "options": Object {
              "from": 1,
              "result": Object {
                "color": undefined,
                "text": "text2",
              },
              "to": 5,
            },
            "type": "range",
          },
          Object {
            "options": Object {
              "from": 5,
              "result": Object {
                "color": "orange",
                "text": "50",
              },
              "to": 10,
            },
            "type": "range",
          },
        ]
      `);
    });
  });

  describe('when migrating folded panel without fieldConfig.defaults', () => {
    let model: DashboardModel;

    beforeEach(() => {
      model = new DashboardModel({
        schemaVersion: 29,
        panels: [
          {
            id: 1,
            type: 'timeseries',
            panels: [
              {
                id: 2,
                fieldConfig: {
                  overrides: [
                    {
                      matcher: { id: 'byName', options: 'D-series' },
                      properties: [
                        {
                          id: 'displayName',
                          value: 'foobar',
                        },
                      ],
                    },
                  ],
                },
              },
            ],
          },
        ],
      });
    });

    it('should ignore fieldConfig.defaults', () => {
      expect(model.panels[0].panels[0].fieldConfig.defaults).toEqual(undefined);
    });
  });

  describe('labelsToFields should be split into two transformers', () => {
    let model: DashboardModel;

    beforeEach(() => {
      model = new DashboardModel({
        schemaVersion: 29,
        panels: [
          {
            id: 1,
            type: 'timeseries',
            transformations: [{ id: 'labelsToFields' }],
          },
        ],
      });
    });

    it('should create two transormatoins', () => {
      const xforms = model.panels[0].transformations;
      expect(xforms).toMatchInlineSnapshot(`
        Array [
          Object {
            "id": "labelsToFields",
          },
          Object {
            "id": "merge",
            "options": Object {},
          },
        ]
      `);
    });
  });

  describe('migrating legacy CloudWatch queries', () => {
    let model: any;
    let panelTargets: any;

    beforeEach(() => {
      model = new DashboardModel({
        annotations: {
          list: [
            {
              actionPrefix: '',
              alarmNamePrefix: '',
              alias: '',
              dimensions: {
                InstanceId: 'i-123',
              },
              enable: true,
              expression: '',
              iconColor: 'red',
              id: '',
              matchExact: true,
              metricName: 'CPUUtilization',
              name: 'test',
              namespace: 'AWS/EC2',
              period: '',
              prefixMatching: false,
              region: 'us-east-2',
              statistics: ['Minimum', 'Sum'],
            },
          ],
        },
        panels: [
          {
            gridPos: {
              h: 8,
              w: 12,
              x: 0,
              y: 0,
            },
            id: 4,
            options: {
              legend: {
                calcs: [],
                displayMode: 'list',
                placement: 'bottom',
              },
              tooltipOptions: {
                mode: 'single',
              },
            },
            targets: [
              {
                alias: '',
                dimensions: {
                  InstanceId: 'i-123',
                },
                expression: '',
                id: '',
                matchExact: true,
                metricName: 'CPUUtilization',
                namespace: 'AWS/EC2',
                period: '',
                refId: 'A',
                region: 'default',
                statistics: ['Average', 'Minimum', 'p12.21'],
              },
              {
                alias: '',
                dimensions: {
                  InstanceId: 'i-123',
                },
                expression: '',
                hide: false,
                id: '',
                matchExact: true,
                metricName: 'CPUUtilization',
                namespace: 'AWS/EC2',
                period: '',
                refId: 'B',
                region: 'us-east-2',
                statistics: ['Sum'],
              },
            ],
            title: 'Panel Title',
            type: 'timeseries',
          },
        ],
      });
      panelTargets = model.panels[0].targets;
    });

    it('multiple stats query should have been split into three', () => {
      expect(panelTargets.length).toBe(4);
    });

    it('new stats query should get the right statistic', () => {
      expect(panelTargets[0].statistic).toBe('Average');
      expect(panelTargets[1].statistic).toBe('Sum');
      expect(panelTargets[2].statistic).toBe('Minimum');
      expect(panelTargets[3].statistic).toBe('p12.21');
    });

    it('new stats queries should be put in the end of the array', () => {
      expect(panelTargets[0].refId).toBe('A');
      expect(panelTargets[1].refId).toBe('B');
      expect(panelTargets[2].refId).toBe('C');
      expect(panelTargets[3].refId).toBe('D');
    });

    describe('with nested panels', () => {
      let panel1Targets: any;
      let panel2Targets: any;
      let nestedModel: DashboardModel;

      beforeEach(() => {
        nestedModel = new DashboardModel({
          annotations: {
            list: [
              {
                actionPrefix: '',
                alarmNamePrefix: '',
                alias: '',
                dimensions: {
                  InstanceId: 'i-123',
                },
                enable: true,
                expression: '',
                iconColor: 'red',
                id: '',
                matchExact: true,
                metricName: 'CPUUtilization',
                name: 'test',
                namespace: 'AWS/EC2',
                period: '',
                prefixMatching: false,
                region: 'us-east-2',
                statistics: ['Minimum', 'Sum'],
              },
            ],
          },
          panels: [
            {
              collapsed: false,
              gridPos: {
                h: 1,
                w: 24,
                x: 0,
                y: 89,
              },
              id: 96,
              title: 'DynamoDB',
              type: 'row',
              panels: [
                {
                  gridPos: {
                    h: 8,
                    w: 12,
                    x: 0,
                    y: 0,
                  },
                  id: 4,
                  options: {
                    legend: {
                      calcs: [],
                      displayMode: 'list',
                      placement: 'bottom',
                    },
                    tooltipOptions: {
                      mode: 'single',
                    },
                  },
                  targets: [
                    {
                      alias: '',
                      dimensions: {
                        InstanceId: 'i-123',
                      },
                      expression: '',
                      id: '',
                      matchExact: true,
                      metricName: 'CPUUtilization',
                      namespace: 'AWS/EC2',
                      period: '',
                      refId: 'C',
                      region: 'default',
                      statistics: ['Average', 'Minimum', 'p12.21'],
                    },
                    {
                      alias: '',
                      dimensions: {
                        InstanceId: 'i-123',
                      },
                      expression: '',
                      hide: false,
                      id: '',
                      matchExact: true,
                      metricName: 'CPUUtilization',
                      namespace: 'AWS/EC2',
                      period: '',
                      refId: 'B',
                      region: 'us-east-2',
                      statistics: ['Sum'],
                    },
                  ],
                  title: 'Panel Title',
                  type: 'timeseries',
                },
                {
                  gridPos: {
                    h: 8,
                    w: 12,
                    x: 0,
                    y: 0,
                  },
                  id: 4,
                  options: {
                    legend: {
                      calcs: [],
                      displayMode: 'list',
                      placement: 'bottom',
                    },
                    tooltipOptions: {
                      mode: 'single',
                    },
                  },
                  targets: [
                    {
                      alias: '',
                      dimensions: {
                        InstanceId: 'i-123',
                      },
                      expression: '',
                      id: '',
                      matchExact: true,
                      metricName: 'CPUUtilization',
                      namespace: 'AWS/EC2',
                      period: '',
                      refId: 'A',
                      region: 'default',
                      statistics: ['Average'],
                    },
                    {
                      alias: '',
                      dimensions: {
                        InstanceId: 'i-123',
                      },
                      expression: '',
                      hide: false,
                      id: '',
                      matchExact: true,
                      metricName: 'CPUUtilization',
                      namespace: 'AWS/EC2',
                      period: '',
                      refId: 'B',
                      region: 'us-east-2',
                      statistics: ['Sum', 'Min'],
                    },
                  ],
                  title: 'Panel Title',
                  type: 'timeseries',
                },
              ],
            },
          ],
        });
        panel1Targets = nestedModel.panels[0].panels[0].targets;
        panel2Targets = nestedModel.panels[0].panels[1].targets;
      });

      it('multiple stats query should have been split into one query per stat', () => {
        expect(panel1Targets.length).toBe(4);
        expect(panel2Targets.length).toBe(3);
      });

      it('new stats query should get the right statistic', () => {
        expect(panel1Targets[0].statistic).toBe('Average');
        expect(panel1Targets[1].statistic).toBe('Sum');
        expect(panel1Targets[2].statistic).toBe('Minimum');
        expect(panel1Targets[3].statistic).toBe('p12.21');

        expect(panel2Targets[0].statistic).toBe('Average');
        expect(panel2Targets[1].statistic).toBe('Sum');
        expect(panel2Targets[2].statistic).toBe('Min');
      });

      it('new stats queries should be put in the end of the array', () => {
        expect(panel1Targets[0].refId).toBe('C');
        expect(panel1Targets[1].refId).toBe('B');
        expect(panel1Targets[2].refId).toBe('A');
        expect(panel1Targets[3].refId).toBe('D');

        expect(panel2Targets[0].refId).toBe('A');
        expect(panel2Targets[1].refId).toBe('B');
        expect(panel2Targets[2].refId).toBe('C');
      });
    });
  });

  describe('when migrating datasource to refs', () => {
    let model: DashboardModel;

    beforeEach(() => {
      model = new DashboardModel({
        templating: {
          list: [
            {
              type: 'query',
              name: 'var',
              options: [{ text: 'A', value: 'A' }],
              refresh: 0,
              datasource: 'prom',
            },
          ],
        },
        panels: [
          {
            id: 1,
            datasource: 'prom',
          },
          {
            id: 2,
            datasource: null,
          },
          {
            id: 3,
            datasource: MIXED_DATASOURCE_NAME,
            targets: [
              {
                datasource: 'prom',
              },
            ],
          },
          {
            type: 'row',
            id: 5,
            panels: [
              {
                id: 6,
                datasource: 'prom',
              },
            ],
          },
        ],
      });
    });

    it('should not update variable datasource props to refs', () => {
      expect(model.templating.list[0].datasource).toEqual('prom');
    });

    it('should update panel datasource props to refs for named data source', () => {
      expect(model.panels[0].datasource).toEqual({ type: 'prometheus', uid: 'mock-ds-2' });
    });

    it('should update panel datasource props to refs for default data source', () => {
      expect(model.panels[1].datasource).toEqual(null);
    });

    it('should update panel datasource props to refs for mixed data source', () => {
      expect(model.panels[2].datasource).toEqual({ type: 'mixed', uid: MIXED_DATASOURCE_NAME });
    });

    it('should update target datasource props to refs', () => {
      expect(model.panels[2].targets[0].datasource).toEqual({ type: 'prometheus', uid: 'mock-ds-2' });
    });

    it('should update datasources in panels collapsed rows', () => {
      expect(model.panels[3].panels[0].datasource).toEqual({ type: 'prometheus', uid: 'mock-ds-2' });
    });
  });
});

function createRow(options: any, panelDescriptions: any[]) {
  const PANEL_HEIGHT_STEP = GRID_CELL_HEIGHT + GRID_CELL_VMARGIN;
  const { collapse, showTitle, title, repeat, repeatIteration } = options;
  let { height } = options;
  height = height * PANEL_HEIGHT_STEP;
  const panels: any[] = [];
  each(panelDescriptions, (panelDesc) => {
    const panel = { span: panelDesc[0] };
    if (panelDesc.length > 1) {
      //@ts-ignore
      panel['height'] = panelDesc[1] * PANEL_HEIGHT_STEP;
    }
    panels.push(panel);
  });
  const row = {
    collapse,
    height,
    showTitle,
    title,
    panels,
    repeat,
    repeatIteration,
  };
  return row;
}

function getGridPositions(dashboard: DashboardModel) {
  return map(dashboard.panels, (panel: PanelModel) => {
    return panel.gridPos;
  });
}
