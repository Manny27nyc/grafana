// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { MutableDataFrame } from '@grafana/data';

export const bigResponse = new MutableDataFrame({
  fields: [
    {
      name: 'traceID',
      values: [
        '04450900759028499335',
        '04450900759028499335',
        '04450900759028499335',
        '04450900759028499335',
        '04450900759028499335',
        '04450900759028499335',
        '04450900759028499335',
        '04450900759028499335',
        '04450900759028499335',
        '04450900759028499335',
        '04450900759028499335',
        '04450900759028499335',
        '04450900759028499335',
        '04450900759028499335',
        '04450900759028499335',
        '04450900759028499335',
        '04450900759028499335',
        '04450900759028499335',
        '04450900759028499335',
        '04450900759028499335',
        '04450900759028499335',
        '04450900759028499335',
        '04450900759028499335',
        '04450900759028499335',
        '04450900759028499335',
        '04450900759028499335',
        '04450900759028499335',
        '04450900759028499335',
        '04450900759028499335',
        '04450900759028499335',
      ],
    },
    {
      name: 'spanID',
      values: [
        '4322526419282105830',
        '3095626263385822295',
        '6397320272727147889',
        '1853508259384889601',
        '835290848278351608',
        '5850531882244692375',
        '663601651643245598',
        '7501257416198979329',
        '197793019475688138',
        '1615811285828848458',
        '4574624098918415850',
        '7514953483465123028',
        '8952478937948910109',
        '4807320274580307678',
        '3568196851335088191',
        '8875894577931816561',
        '797350946023907600',
        '3198122728676260175',
        '2528859115168229623',
        '2108752984455624810',
        '4343095775387093037',
        '8751049139444653283',
        '7753188085660872705',
        '879502345235818407',
        '3139747016493009985',
        '7783241608507301178',
        '1799838932837912875',
        '4045260340056550643',
        '4790760741274015949',
        '4450900759028499335',
      ],
    },
    {
      name: 'parentSpanID',
      values: [
        '3095626263385822295',
        '3198122728676260175',
        '7501257416198979329',
        '663601651643245598',
        '5850531882244692375',
        '663601651643245598',
        '7501257416198979329',
        '197793019475688138',
        '1615811285828848458',
        '3198122728676260175',
        '8875894577931816561',
        '3568196851335088191',
        '4807320274580307678',
        '3568196851335088191',
        '8875894577931816561',
        '797350946023907600',
        '3198122728676260175',
        '1799838932837912875',
        '4343095775387093037',
        '4343095775387093037',
        '8751049139444653283',
        '1799838932837912875',
        '3139747016493009985',
        '3139747016493009985',
        '7783241608507301178',
        '1799838932837912875',
        '4045260340056550643',
        '4790760741274015949',
        '4450900759028499335',
        '',
      ],
    },
    {
      name: 'operationName',
      values: [
        'store.validateQueryTimeRange',
        'store.validateQuery',
        'cachingIndexClient.cacheFetch',
        'Shipper.Uploads.Query',
        'Shipper.Downloads.Table.MultiQueries',
        'Shipper.Downloads.Query',
        'QUERY',
        'store.lookupEntriesByQueries',
        'Store.lookupIdsByMetricNameMatcher',
        'SeriesStore.lookupSeriesByMetricNameMatchers',
        'cachingIndexClient.cacheFetch',
        'Shipper.Uploads.Query',
        'Shipper.Downloads.Table.MultiQueries',
        'Shipper.Downloads.Query',
        'QUERY',
        'store.lookupEntriesByQueries',
        'SeriesStore.lookupChunksBySeries',
        'SeriesStore.GetChunkRefs',
        'Fetcher.processCacheResponse',
        'GetParallelChunks',
        'ChunkStore.FetchChunks',
        'LokiStore.fetchLazyChunks',
        'Fetcher.processCacheResponse',
        'GetParallelChunks',
        'ChunkStore.FetchChunks',
        'LokiStore.fetchLazyChunks',
        '/logproto.Querier/Query',
        '/logproto.Querier/Query',
        'query.Exec',
        'HTTP GET - loki_api_v1_query_range',
      ],
    },
    {
      name: 'serviceName',
      values: [
        'loki-all',
        'loki-all',
        'loki-all',
        'loki-all',
        'loki-all',
        'loki-all',
        'loki-all',
        'loki-all',
        'loki-all',
        'loki-all',
        'loki-all',
        'loki-all',
        'loki-all',
        'loki-all',
        'loki-all',
        'loki-all',
        'loki-all',
        'loki-all',
        'loki-all',
        'loki-all',
        'loki-all',
        'loki-all',
        'loki-all',
        'loki-all',
        'loki-all',
        'loki-all',
        'loki-all',
        'loki-all',
        'loki-all',
        'loki-all',
      ],
    },
    {
      name: 'serviceTags',
      values: [
        [
          {
            value: 'loki-all',
            key: 'service.name',
          },
          {
            value: 'Jaeger-Go-2.25.0',
            key: 'opencensus.exporterversion',
          },
          {
            value: '708c78ea08c1',
            key: 'host.hostname',
          },
          {
            value: '172.18.0.3',
            key: 'ip',
          },
          {
            value: '632583de9a4a497b',
            key: 'client-uuid',
          },
        ],
        [
          {
            value: 'loki-all',
            key: 'service.name',
          },
          {
            value: 'Jaeger-Go-2.25.0',
            key: 'opencensus.exporterversion',
          },
          {
            value: '708c78ea08c1',
            key: 'host.hostname',
          },
          {
            value: '172.18.0.3',
            key: 'ip',
          },
          {
            value: '632583de9a4a497b',
            key: 'client-uuid',
          },
        ],
        [
          {
            value: 'loki-all',
            key: 'service.name',
          },
          {
            value: 'Jaeger-Go-2.25.0',
            key: 'opencensus.exporterversion',
          },
          {
            value: '708c78ea08c1',
            key: 'host.hostname',
          },
          {
            value: '172.18.0.3',
            key: 'ip',
          },
          {
            value: '632583de9a4a497b',
            key: 'client-uuid',
          },
        ],
        [
          {
            value: 'loki-all',
            key: 'service.name',
          },
          {
            value: 'Jaeger-Go-2.25.0',
            key: 'opencensus.exporterversion',
          },
          {
            value: '708c78ea08c1',
            key: 'host.hostname',
          },
          {
            value: '172.18.0.3',
            key: 'ip',
          },
          {
            value: '632583de9a4a497b',
            key: 'client-uuid',
          },
        ],
        [
          {
            value: 'loki-all',
            key: 'service.name',
          },
          {
            value: 'Jaeger-Go-2.25.0',
            key: 'opencensus.exporterversion',
          },
          {
            value: '708c78ea08c1',
            key: 'host.hostname',
          },
          {
            value: '172.18.0.3',
            key: 'ip',
          },
          {
            value: '632583de9a4a497b',
            key: 'client-uuid',
          },
        ],
        [
          {
            value: 'loki-all',
            key: 'service.name',
          },
          {
            value: 'Jaeger-Go-2.25.0',
            key: 'opencensus.exporterversion',
          },
          {
            value: '708c78ea08c1',
            key: 'host.hostname',
          },
          {
            value: '172.18.0.3',
            key: 'ip',
          },
          {
            value: '632583de9a4a497b',
            key: 'client-uuid',
          },
        ],
        [
          {
            value: 'loki-all',
            key: 'service.name',
          },
          {
            value: 'Jaeger-Go-2.25.0',
            key: 'opencensus.exporterversion',
          },
          {
            value: '708c78ea08c1',
            key: 'host.hostname',
          },
          {
            value: '172.18.0.3',
            key: 'ip',
          },
          {
            value: '632583de9a4a497b',
            key: 'client-uuid',
          },
        ],
        [
          {
            value: 'loki-all',
            key: 'service.name',
          },
          {
            value: 'Jaeger-Go-2.25.0',
            key: 'opencensus.exporterversion',
          },
          {
            value: '708c78ea08c1',
            key: 'host.hostname',
          },
          {
            value: '172.18.0.3',
            key: 'ip',
          },
          {
            value: '632583de9a4a497b',
            key: 'client-uuid',
          },
        ],
        [
          {
            value: 'loki-all',
            key: 'service.name',
          },
          {
            value: 'Jaeger-Go-2.25.0',
            key: 'opencensus.exporterversion',
          },
          {
            value: '708c78ea08c1',
            key: 'host.hostname',
          },
          {
            value: '172.18.0.3',
            key: 'ip',
          },
          {
            value: '632583de9a4a497b',
            key: 'client-uuid',
          },
        ],
        [
          {
            value: 'loki-all',
            key: 'service.name',
          },
          {
            value: 'Jaeger-Go-2.25.0',
            key: 'opencensus.exporterversion',
          },
          {
            value: '708c78ea08c1',
            key: 'host.hostname',
          },
          {
            value: '172.18.0.3',
            key: 'ip',
          },
          {
            value: '632583de9a4a497b',
            key: 'client-uuid',
          },
        ],
        [
          {
            value: 'loki-all',
            key: 'service.name',
          },
          {
            value: 'Jaeger-Go-2.25.0',
            key: 'opencensus.exporterversion',
          },
          {
            value: '708c78ea08c1',
            key: 'host.hostname',
          },
          {
            value: '172.18.0.3',
            key: 'ip',
          },
          {
            value: '632583de9a4a497b',
            key: 'client-uuid',
          },
        ],
        [
          {
            value: 'loki-all',
            key: 'service.name',
          },
          {
            value: 'Jaeger-Go-2.25.0',
            key: 'opencensus.exporterversion',
          },
          {
            value: '708c78ea08c1',
            key: 'host.hostname',
          },
          {
            value: '172.18.0.3',
            key: 'ip',
          },
          {
            value: '632583de9a4a497b',
            key: 'client-uuid',
          },
        ],
        [
          {
            value: 'loki-all',
            key: 'service.name',
          },
          {
            value: 'Jaeger-Go-2.25.0',
            key: 'opencensus.exporterversion',
          },
          {
            value: '708c78ea08c1',
            key: 'host.hostname',
          },
          {
            value: '172.18.0.3',
            key: 'ip',
          },
          {
            value: '632583de9a4a497b',
            key: 'client-uuid',
          },
        ],
        [
          {
            value: 'loki-all',
            key: 'service.name',
          },
          {
            value: 'Jaeger-Go-2.25.0',
            key: 'opencensus.exporterversion',
          },
          {
            value: '708c78ea08c1',
            key: 'host.hostname',
          },
          {
            value: '172.18.0.3',
            key: 'ip',
          },
          {
            value: '632583de9a4a497b',
            key: 'client-uuid',
          },
        ],
        [
          {
            value: 'loki-all',
            key: 'service.name',
          },
          {
            value: 'Jaeger-Go-2.25.0',
            key: 'opencensus.exporterversion',
          },
          {
            value: '708c78ea08c1',
            key: 'host.hostname',
          },
          {
            value: '172.18.0.3',
            key: 'ip',
          },
          {
            value: '632583de9a4a497b',
            key: 'client-uuid',
          },
        ],
        [
          {
            value: 'loki-all',
            key: 'service.name',
          },
          {
            value: 'Jaeger-Go-2.25.0',
            key: 'opencensus.exporterversion',
          },
          {
            value: '708c78ea08c1',
            key: 'host.hostname',
          },
          {
            value: '172.18.0.3',
            key: 'ip',
          },
          {
            value: '632583de9a4a497b',
            key: 'client-uuid',
          },
        ],
        [
          {
            value: 'loki-all',
            key: 'service.name',
          },
          {
            value: 'Jaeger-Go-2.25.0',
            key: 'opencensus.exporterversion',
          },
          {
            value: '708c78ea08c1',
            key: 'host.hostname',
          },
          {
            value: '172.18.0.3',
            key: 'ip',
          },
          {
            value: '632583de9a4a497b',
            key: 'client-uuid',
          },
        ],
        [
          {
            value: 'loki-all',
            key: 'service.name',
          },
          {
            value: 'Jaeger-Go-2.25.0',
            key: 'opencensus.exporterversion',
          },
          {
            value: '708c78ea08c1',
            key: 'host.hostname',
          },
          {
            value: '172.18.0.3',
            key: 'ip',
          },
          {
            value: '632583de9a4a497b',
            key: 'client-uuid',
          },
        ],
        [
          {
            value: 'loki-all',
            key: 'service.name',
          },
          {
            value: 'Jaeger-Go-2.25.0',
            key: 'opencensus.exporterversion',
          },
          {
            value: '708c78ea08c1',
            key: 'host.hostname',
          },
          {
            value: '172.18.0.3',
            key: 'ip',
          },
          {
            value: '632583de9a4a497b',
            key: 'client-uuid',
          },
        ],
        [
          {
            value: 'loki-all',
            key: 'service.name',
          },
          {
            value: 'Jaeger-Go-2.25.0',
            key: 'opencensus.exporterversion',
          },
          {
            value: '708c78ea08c1',
            key: 'host.hostname',
          },
          {
            value: '172.18.0.3',
            key: 'ip',
          },
          {
            value: '632583de9a4a497b',
            key: 'client-uuid',
          },
        ],
        [
          {
            value: 'loki-all',
            key: 'service.name',
          },
          {
            value: 'Jaeger-Go-2.25.0',
            key: 'opencensus.exporterversion',
          },
          {
            value: '708c78ea08c1',
            key: 'host.hostname',
          },
          {
            value: '172.18.0.3',
            key: 'ip',
          },
          {
            value: '632583de9a4a497b',
            key: 'client-uuid',
          },
        ],
        [
          {
            value: 'loki-all',
            key: 'service.name',
          },
          {
            value: 'Jaeger-Go-2.25.0',
            key: 'opencensus.exporterversion',
          },
          {
            value: '708c78ea08c1',
            key: 'host.hostname',
          },
          {
            value: '172.18.0.3',
            key: 'ip',
          },
          {
            value: '632583de9a4a497b',
            key: 'client-uuid',
          },
        ],
        [
          {
            value: 'loki-all',
            key: 'service.name',
          },
          {
            value: 'Jaeger-Go-2.25.0',
            key: 'opencensus.exporterversion',
          },
          {
            value: '708c78ea08c1',
            key: 'host.hostname',
          },
          {
            value: '172.18.0.3',
            key: 'ip',
          },
          {
            value: '632583de9a4a497b',
            key: 'client-uuid',
          },
        ],
        [
          {
            value: 'loki-all',
            key: 'service.name',
          },
          {
            value: 'Jaeger-Go-2.25.0',
            key: 'opencensus.exporterversion',
          },
          {
            value: '708c78ea08c1',
            key: 'host.hostname',
          },
          {
            value: '172.18.0.3',
            key: 'ip',
          },
          {
            value: '632583de9a4a497b',
            key: 'client-uuid',
          },
        ],
        [
          {
            value: 'loki-all',
            key: 'service.name',
          },
          {
            value: 'Jaeger-Go-2.25.0',
            key: 'opencensus.exporterversion',
          },
          {
            value: '708c78ea08c1',
            key: 'host.hostname',
          },
          {
            value: '172.18.0.3',
            key: 'ip',
          },
          {
            value: '632583de9a4a497b',
            key: 'client-uuid',
          },
        ],
        [
          {
            value: 'loki-all',
            key: 'service.name',
          },
          {
            value: 'Jaeger-Go-2.25.0',
            key: 'opencensus.exporterversion',
          },
          {
            value: '708c78ea08c1',
            key: 'host.hostname',
          },
          {
            value: '172.18.0.3',
            key: 'ip',
          },
          {
            value: '632583de9a4a497b',
            key: 'client-uuid',
          },
        ],
        [
          {
            value: 'loki-all',
            key: 'service.name',
          },
          {
            value: 'Jaeger-Go-2.25.0',
            key: 'opencensus.exporterversion',
          },
          {
            value: '708c78ea08c1',
            key: 'host.hostname',
          },
          {
            value: '172.18.0.3',
            key: 'ip',
          },
          {
            value: '632583de9a4a497b',
            key: 'client-uuid',
          },
        ],
        [
          {
            value: 'loki-all',
            key: 'service.name',
          },
          {
            value: 'Jaeger-Go-2.25.0',
            key: 'opencensus.exporterversion',
          },
          {
            value: '708c78ea08c1',
            key: 'host.hostname',
          },
          {
            value: '172.18.0.3',
            key: 'ip',
          },
          {
            value: '632583de9a4a497b',
            key: 'client-uuid',
          },
        ],
        [
          {
            value: 'loki-all',
            key: 'service.name',
          },
          {
            value: 'Jaeger-Go-2.25.0',
            key: 'opencensus.exporterversion',
          },
          {
            value: '708c78ea08c1',
            key: 'host.hostname',
          },
          {
            value: '172.18.0.3',
            key: 'ip',
          },
          {
            value: '632583de9a4a497b',
            key: 'client-uuid',
          },
        ],
        [
          {
            value: 'loki-all',
            key: 'service.name',
          },
          {
            value: 'Jaeger-Go-2.25.0',
            key: 'opencensus.exporterversion',
          },
          {
            value: '708c78ea08c1',
            key: 'host.hostname',
          },
          {
            value: '172.18.0.3',
            key: 'ip',
          },
          {
            value: '632583de9a4a497b',
            key: 'client-uuid',
          },
        ],
      ],
    },
    {
      name: 'startTime',
      values: [
        1619712655875.4539,
        1619712655875.4502,
        1619712655875.592,
        1619712655875.653,
        1619712655875.731,
        1619712655875.712,
        1619712655875.6428,
        1619712655875.5771,
        1619712655875.5168,
        1619712655875.488,
        1619712655875.939,
        1619712655875.959,
        1619712655876.0051,
        1619712655875.991,
        1619712655875.9539,
        1619712655875.9338,
        1619712655875.917,
        1619712655875.442,
        1619712655876.365,
        1619712655876.3809,
        1619712655876.359,
        1619712655876.331,
        1619712655876.62,
        1619712655876.629,
        1619712655876.616,
        1619712655876.592,
        1619712655875.052,
        1619712655874.819,
        1619712655874.7021,
        1619712655874.591,
      ],
    },
    {
      name: 'duration',
      values: [
        0.004,
        0.016,
        0.039,
        0.047,
        0.063,
        0.087,
        0.163,
        0.303,
        0.384,
        0.421,
        0.012,
        0.021,
        0.033,
        0.048,
        0.092,
        0.169,
        0.197,
        0.689,
        0.012,
        0.196,
        0.225,
        0.255,
        0.007,
        0.167,
        0.189,
        0.217,
        13.918,
        14.723,
        14.984,
        18.208,
      ],
    },
    {
      name: 'logs',
      values: [
        null,
        null,
        [
          {
            timestamp: 1619712655875.631,
            fields: [
              {
                value: 'debug',
                key: 'level',
              },
              {
                value: 0,
                key: 'hits',
              },
              {
                value: 16,
                key: 'misses',
              },
            ],
          },
        ],
        null,
        [
          {
            timestamp: 1619712655875.738,
            fields: [
              {
                value: 'debug',
                key: 'level',
              },
              {
                value: 'index_18746',
                key: 'table-name',
              },
              {
                value: 16,
                key: 'query-count',
              },
            ],
          },
          {
            timestamp: 1619712655875.773,
            fields: [
              {
                value: 'debug',
                key: 'level',
              },
              {
                value: 'compactor-1619711145.gz',
                key: 'queried-db',
              },
            ],
          },
          {
            timestamp: 1619712655875.794,
            fields: [
              {
                value: 'debug',
                key: 'level',
              },
              {
                value: '708c78ea08c1-1619516350042748959-1619711100.gz',
                key: 'queried-db',
              },
            ],
          },
        ],
        [
          {
            timestamp: 1619712655875.719,
            fields: [
              {
                value: 'debug',
                key: 'level',
              },
              {
                value: 'index_18746',
                key: 'table-name',
              },
            ],
          },
        ],
        [
          {
            timestamp: 1619712655875.7068,
            fields: [
              {
                value: 'debug',
                key: 'level',
              },
              {
                value: 'uploads-manager',
                key: 'queried',
              },
            ],
          },
          {
            timestamp: 1619712655875.803,
            fields: [
              {
                value: 'debug',
                key: 'level',
              },
              {
                value: 'downloads-manager',
                key: 'queried',
              },
            ],
          },
        ],
        null,
        [
          {
            timestamp: 1619712655875.536,
            fields: [
              {
                value: 'debug',
                key: 'level',
              },
              {
                value: 'logs',
                key: 'metricName',
              },
              {
                value: 'compose_project="devenv"',
                key: 'matcher',
              },
            ],
          },
          {
            timestamp: 1619712655875.568,
            fields: [
              {
                value: 'debug',
                key: 'level',
              },
              {
                value: 'compose_project="devenv"',
                key: 'matcher',
              },
              {
                value: 16,
                key: 'queries',
              },
            ],
          },
          {
            timestamp: 1619712655875.5762,
            fields: [
              {
                value: 'debug',
                key: 'level',
              },
              {
                value: 'compose_project="devenv"',
                key: 'matcher',
              },
              {
                value: 16,
                key: 'filteredQueries',
              },
            ],
          },
          {
            timestamp: 1619712655875.892,
            fields: [
              {
                value: 'debug',
                key: 'level',
              },
              {
                value: 'compose_project="devenv"',
                key: 'matcher',
              },
              {
                value: 2,
                key: 'entries',
              },
            ],
          },
          {
            timestamp: 1619712655875.9019,
            fields: [
              {
                value: 'debug',
                key: 'level',
              },
              {
                value: 'compose_project="devenv"',
                key: 'matcher',
              },
              {
                value: 1,
                key: 'ids',
              },
            ],
          },
        ],
        [
          {
            timestamp: 1619712655875.4958,
            fields: [
              {
                value: 'debug',
                key: 'level',
              },
              {
                value: 'logs',
                key: 'metricName',
              },
              {
                value: 1,
                key: 'matchers',
              },
            ],
          },
          {
            timestamp: 1619712655875.9092,
            fields: [
              {
                value: 'debug',
                key: 'level',
              },
              {
                value: 'post intersection',
                key: 'msg',
              },
              {
                value: 1,
                key: 'ids',
              },
            ],
          },
        ],
        [
          {
            timestamp: 1619712655875.9512,
            fields: [
              {
                value: 'debug',
                key: 'level',
              },
              {
                value: 0,
                key: 'hits',
              },
              {
                value: 1,
                key: 'misses',
              },
            ],
          },
        ],
        null,
        [
          {
            timestamp: 1619712655876.012,
            fields: [
              {
                value: 'debug',
                key: 'level',
              },
              {
                value: 'index_18746',
                key: 'table-name',
              },
              {
                value: 1,
                key: 'query-count',
              },
            ],
          },
          {
            timestamp: 1619712655876.031,
            fields: [
              {
                value: 'debug',
                key: 'level',
              },
              {
                value: 'compactor-1619711145.gz',
                key: 'queried-db',
              },
            ],
          },
          {
            timestamp: 1619712655876.0378,
            fields: [
              {
                value: 'debug',
                key: 'level',
              },
              {
                value: '708c78ea08c1-1619516350042748959-1619711100.gz',
                key: 'queried-db',
              },
            ],
          },
        ],
        [
          {
            timestamp: 1619712655875.999,
            fields: [
              {
                value: 'debug',
                key: 'level',
              },
              {
                value: 'index_18746',
                key: 'table-name',
              },
            ],
          },
        ],
        [
          {
            timestamp: 1619712655875.988,
            fields: [
              {
                value: 'debug',
                key: 'level',
              },
              {
                value: 'uploads-manager',
                key: 'queried',
              },
            ],
          },
          {
            timestamp: 1619712655876.0452,
            fields: [
              {
                value: 'debug',
                key: 'level',
              },
              {
                value: 'downloads-manager',
                key: 'queried',
              },
            ],
          },
        ],
        null,
        [
          {
            timestamp: 1619712655875.925,
            fields: [
              {
                value: 'debug',
                key: 'level',
              },
              {
                value: 1,
                key: 'seriesIDs',
              },
            ],
          },
          {
            timestamp: 1619712655875.9329,
            fields: [
              {
                value: 'debug',
                key: 'level',
              },
              {
                value: 1,
                key: 'queries',
              },
            ],
          },
          {
            timestamp: 1619712655876.1118,
            fields: [
              {
                value: 'debug',
                key: 'level',
              },
              {
                value: 2,
                key: 'entries',
              },
            ],
          },
        ],
        [
          {
            timestamp: 1619712655875.4849,
            fields: [
              {
                value: 'debug',
                key: 'level',
              },
              {
                value: 'logs',
                key: 'metric',
              },
            ],
          },
          {
            timestamp: 1619712655875.915,
            fields: [
              {
                value: 'debug',
                key: 'level',
              },
              {
                value: 1,
                key: 'series-ids',
              },
            ],
          },
          {
            timestamp: 1619712655876.12,
            fields: [
              {
                value: 'debug',
                key: 'level',
              },
              {
                value: 2,
                key: 'chunk-ids',
              },
            ],
          },
          {
            timestamp: 1619712655876.131,
            fields: [
              {
                value: 'debug',
                key: 'level',
              },
              {
                value: 2,
                key: 'chunks-post-filtering',
              },
            ],
          },
        ],
        [
          {
            timestamp: 1619712655876.375,
            fields: [
              {
                value: 'debug',
                key: 'level',
              },
              {
                value: 1,
                key: 'chunks',
              },
              {
                value: 0,
                key: 'decodeRequests',
              },
              {
                value: 1,
                key: 'missing',
              },
            ],
          },
        ],
        [
          {
            timestamp: 1619712655876.384,
            fields: [
              {
                value: 1,
                key: 'chunks requested',
              },
            ],
          },
          {
            timestamp: 1619712655876.577,
            fields: [
              {
                value: 1,
                key: 'chunks fetched',
              },
            ],
          },
        ],
        null,
        [
          {
            timestamp: 1619712655876.342,
            fields: [
              {
                value: 'debug',
                key: 'level',
              },
              {
                value: 'loading lazy chunks',
                key: 'msg',
              },
              {
                value: 1,
                key: 'chunks',
              },
            ],
          },
        ],
        [
          {
            timestamp: 1619712655876.627,
            fields: [
              {
                value: 'debug',
                key: 'level',
              },
              {
                value: 1,
                key: 'chunks',
              },
              {
                value: 0,
                key: 'decodeRequests',
              },
              {
                value: 1,
                key: 'missing',
              },
            ],
          },
        ],
        [
          {
            timestamp: 1619712655876.631,
            fields: [
              {
                value: 1,
                key: 'chunks requested',
              },
            ],
          },
          {
            timestamp: 1619712655876.795,
            fields: [
              {
                value: 1,
                key: 'chunks fetched',
              },
            ],
          },
        ],
        null,
        [
          {
            timestamp: 1619712655876.604,
            fields: [
              {
                value: 'debug',
                key: 'level',
              },
              {
                value: 'loading lazy chunks',
                key: 'msg',
              },
              {
                value: 1,
                key: 'chunks',
              },
            ],
          },
        ],
        null,
        null,
        [
          {
            timestamp: 1619712655889.606,
            fields: [
              {
                value: 'debug',
                key: 'level',
              },
              {
                value: 1,
                key: 'Ingester.TotalReached',
              },
              {
                value: 1,
                key: 'Ingester.TotalChunksMatched',
              },
              {
                value: 0,
                key: 'Ingester.TotalBatches',
              },
              {
                value: 0,
                key: 'Ingester.TotalLinesSent',
              },
              {
                value: '47 kB',
                key: 'Ingester.HeadChunkBytes',
              },
              {
                value: 424,
                key: 'Ingester.HeadChunkLines',
              },
              {
                value: '219 kB',
                key: 'Ingester.DecompressedBytes',
              },
              {
                value: 1679,
                key: 'Ingester.DecompressedLines',
              },
              {
                value: '124 kB',
                key: 'Ingester.CompressedBytes',
              },
              {
                value: 0,
                key: 'Ingester.TotalDuplicates',
              },
              {
                value: 0,
                key: 'Store.TotalChunksRef',
              },
              {
                value: 0,
                key: 'Store.TotalChunksDownloaded',
              },
              {
                value: '0s',
                key: 'Store.ChunksDownloadTime',
              },
              {
                value: '0 B',
                key: 'Store.HeadChunkBytes',
              },
              {
                value: 0,
                key: 'Store.HeadChunkLines',
              },
              {
                value: '0 B',
                key: 'Store.DecompressedBytes',
              },
              {
                value: 0,
                key: 'Store.DecompressedLines',
              },
              {
                value: '0 B',
                key: 'Store.CompressedBytes',
              },
              {
                value: 0,
                key: 'Store.TotalDuplicates',
              },
            ],
          },
          {
            timestamp: 1619712655889.617,
            fields: [
              {
                value: 'debug',
                key: 'level',
              },
              {
                value: '18 MB',
                key: 'Summary.BytesProcessedPerSecond',
              },
              {
                value: 141753,
                key: 'Summary.LinesProcessedPerSecond',
              },
              {
                value: '266 kB',
                key: 'Summary.TotalBytesProcessed',
              },
              {
                value: 2103,
                key: 'Summary.TotalLinesProcessed',
              },
              {
                value: '14.835651ms',
                key: 'Summary.ExecTime',
              },
            ],
          },
        ],
        null,
      ],
    },
    {
      name: 'tags',
      values: [
        [
          {
            value: 0,
            key: 'status.code',
          },
        ],
        [
          {
            value: 0,
            key: 'status.code',
          },
        ],
        [
          {
            value: 0,
            key: 'status.code',
          },
        ],
        [
          {
            value: 0,
            key: 'status.code',
          },
        ],
        [
          {
            value: 0,
            key: 'status.code',
          },
        ],
        [
          {
            value: 0,
            key: 'status.code',
          },
        ],
        [
          {
            value: 'fake',
            key: 'organization',
          },
          {
            value: 'client',
            key: 'span.kind',
          },
          {
            value: 0,
            key: 'status.code',
          },
        ],
        [
          {
            value: 0,
            key: 'status.code',
          },
        ],
        [
          {
            value: 0,
            key: 'status.code',
          },
        ],
        [
          {
            value: 0,
            key: 'status.code',
          },
        ],
        [
          {
            value: 0,
            key: 'status.code',
          },
        ],
        [
          {
            value: 0,
            key: 'status.code',
          },
        ],
        [
          {
            value: 0,
            key: 'status.code',
          },
        ],
        [
          {
            value: 0,
            key: 'status.code',
          },
        ],
        [
          {
            value: 'fake',
            key: 'organization',
          },
          {
            value: 'client',
            key: 'span.kind',
          },
          {
            value: 0,
            key: 'status.code',
          },
        ],
        [
          {
            value: 0,
            key: 'status.code',
          },
        ],
        [
          {
            value: 0,
            key: 'status.code',
          },
        ],
        [
          {
            value: 0,
            key: 'status.code',
          },
        ],
        [
          {
            value: 0,
            key: 'status.code',
          },
        ],
        [
          {
            value: 0,
            key: 'status.code',
          },
        ],
        [
          {
            value: 0,
            key: 'status.code',
          },
        ],
        [
          {
            value: 0,
            key: 'status.code',
          },
        ],
        [
          {
            value: 0,
            key: 'status.code',
          },
        ],
        [
          {
            value: 0,
            key: 'status.code',
          },
        ],
        [
          {
            value: 0,
            key: 'status.code',
          },
        ],
        [
          {
            value: 0,
            key: 'status.code',
          },
        ],
        [
          {
            value: 'gRPC',
            key: 'component',
          },
          {
            value: 'server',
            key: 'span.kind',
          },
          {
            value: 0,
            key: 'status.code',
          },
        ],
        [
          {
            value: 'gRPC',
            key: 'component',
          },
          {
            value: 'client',
            key: 'span.kind',
          },
          {
            value: 0,
            key: 'status.code',
          },
        ],
        [
          {
            value: 0,
            key: 'status.code',
          },
        ],
        [
          {
            value: 'const',
            key: 'sampler.type',
          },
          {
            value: true,
            key: 'sampler.param',
          },
          {
            value: 200,
            key: 'http.status_code',
          },
          {
            value: 'GET',
            key: 'http.method',
          },
          {
            value:
              '/loki/api/v1/query_range?direction=BACKWARD&limit=1000&query=%7Bcompose_project%3D%22devenv%22%7D&start=1619709055000000000&end=1619712656000000000&step=2',
            key: 'http.url',
          },
          {
            value: 'net/http',
            key: 'component',
          },
          {
            value: 'server',
            key: 'span.kind',
          },
          {
            value: 0,
            key: 'status.code',
          },
        ],
      ],
    },
  ],
});

export const otlpDataFrameFromResponse = new MutableDataFrame({
  meta: {
    preferredVisualisationType: 'trace',
    custom: {
      traceFormat: 'otlp',
    },
  },
  creator: jest.fn(),
  fields: [
    {
      name: 'traceID',
      type: 'string',
      config: {},
      labels: undefined,
      values: ['60ba2abb44f13eae'],
      state: {
        displayName: 'traceID',
      },
    },
    {
      name: 'spanID',
      type: 'string',
      config: {},
      labels: undefined,
      values: ['726b5e30102fc0d0'],
      state: {
        displayName: 'spanID',
      },
    },
    {
      name: 'parentSpanID',
      type: 'string',
      config: {},
      labels: undefined,
      values: ['398f0f21a3db99ae'],
      state: {
        displayName: 'parentSpanID',
      },
    },
    {
      name: 'operationName',
      type: 'string',
      config: {},
      labels: undefined,
      values: ['HTTP GET - root'],
      state: {
        displayName: 'operationName',
      },
    },
    {
      name: 'serviceName',
      type: 'string',
      config: {},
      labels: undefined,
      values: ['db'],
      state: {
        displayName: 'serviceName',
      },
    },
    {
      name: 'serviceTags',
      type: 'other',
      config: {},
      labels: undefined,
      values: [
        [
          {
            key: 'service.name',
            value: 'db',
          },
          {
            key: 'job',
            value: 'tns/db',
          },
          {
            key: 'opencensus.exporterversion',
            value: 'Jaeger-Go-2.22.1',
          },
          {
            key: 'host.name',
            value: '63d16772b4a2',
          },
          {
            key: 'ip',
            value: '0.0.0.0',
          },
          {
            key: 'client-uuid',
            value: '39fb01637a579639',
          },
        ],
      ],
      state: {
        displayName: 'serviceTags',
      },
    },
    {
      name: 'startTime',
      type: 'number',
      config: {},
      labels: undefined,
      values: [1627471657255.809],
      state: {
        displayName: 'startTime',
      },
    },
    {
      name: 'duration',
      type: 'number',
      config: {},
      labels: undefined,
      values: [0.459008],
      state: {
        displayName: 'duration',
      },
    },
    {
      name: 'logs',
      type: 'other',
      config: {},
      labels: undefined,
      values: [[]],
      state: {
        displayName: 'logs',
      },
    },
    {
      name: 'tags',
      type: 'other',
      config: {},
      labels: undefined,
      values: [
        [
          {
            key: 'http.status_code',
            value: 200,
          },
          {
            key: 'http.method',
            value: 'GET',
          },
          {
            key: 'http.url',
            value: '/',
          },
          {
            key: 'component',
            value: 'net/http',
          },
          {
            key: 'span.kind',
            value: 'client',
          },
        ],
      ],
      state: {
        displayName: 'tags',
      },
    },
  ],
  length: 1,
} as any);

export const otlpDataFrameToResponse = new MutableDataFrame({
  meta: {
    preferredVisualisationType: 'trace',
    custom: {
      traceFormat: 'otlp',
    },
  },
  fields: [
    {
      name: 'traceID',
      type: 'string',
      config: {},
      values: ['60ba2abb44f13eae'],
      state: {
        displayName: 'traceID',
      },
    },
    {
      name: 'spanID',
      type: 'string',
      config: {},
      values: ['726b5e30102fc0d0'],
      state: {
        displayName: 'spanID',
      },
    },
    {
      name: 'parentSpanID',
      type: 'string',
      config: {},
      values: ['398f0f21a3db99ae'],
      state: {
        displayName: 'parentSpanID',
      },
    },
    {
      name: 'operationName',
      type: 'string',
      config: {},
      values: ['HTTP GET - root'],
      state: {
        displayName: 'operationName',
      },
    },
    {
      name: 'serviceName',
      type: 'string',
      config: {},
      values: ['db'],
      state: {
        displayName: 'serviceName',
      },
    },
    {
      name: 'serviceTags',
      type: 'other',
      config: {},
      values: [
        [
          {
            key: 'service.name',
            value: 'db',
          },
          {
            key: 'job',
            value: 'tns/db',
          },
          {
            key: 'opencensus.exporterversion',
            value: 'Jaeger-Go-2.22.1',
          },
          {
            key: 'host.name',
            value: '63d16772b4a2',
          },
          {
            key: 'ip',
            value: '0.0.0.0',
          },
          {
            key: 'client-uuid',
            value: '39fb01637a579639',
          },
        ],
      ],
      state: {
        displayName: 'serviceTags',
      },
    },
    {
      name: 'startTime',
      type: 'number',
      config: {},
      values: [1627471657255.809],
      state: {
        displayName: 'startTime',
      },
    },
    {
      name: 'duration',
      type: 'number',
      config: {},
      values: [0.459008],
      state: {
        displayName: 'duration',
      },
    },
    {
      name: 'logs',
      type: 'other',
      config: {},
      values: [[]],
      state: {
        displayName: 'logs',
      },
    },
    {
      name: 'tags',
      type: 'other',
      config: {},
      values: [
        [
          {
            key: 'http.status_code',
            value: 200,
          },
          {
            key: 'http.method',
            value: 'GET',
          },
          {
            key: 'http.url',
            value: '/',
          },
          {
            key: 'component',
            value: 'net/http',
          },
          {
            key: 'span.kind',
            value: 'client',
          },
        ],
      ],
      state: {
        displayName: 'tags',
      },
    },
  ],
  first: ['60ba2abb44f13eae'],
  length: 1,
} as any);

export const otlpResponse = {
  batches: [
    {
      resource: {
        attributes: [
          { key: 'service.name', value: { stringValue: 'db' } },
          { key: 'job', value: { stringValue: 'tns/db' } },
          { key: 'opencensus.exporterversion', value: { stringValue: 'Jaeger-Go-2.22.1' } },
          { key: 'host.name', value: { stringValue: '63d16772b4a2' } },
          { key: 'ip', value: { stringValue: '0.0.0.0' } },
          { key: 'client-uuid', value: { stringValue: '39fb01637a579639' } },
        ],
      },
      instrumentationLibrarySpans: [
        {
          spans: [
            {
              traceId: 'AAAAAAAAAABguiq7RPE+rg==',
              spanId: 'cmteMBAvwNA=',
              parentSpanId: 'OY8PIaPbma4=',
              name: 'HTTP GET - root',
              kind: 'SPAN_KIND_CLIENT',
              startTimeUnixNano: 1627471657255809000,
              endTimeUnixNano: 1627471657256268000,
              attributes: [
                { key: 'http.status_code', value: { intValue: 200 } },
                { key: 'http.method', value: { stringValue: 'GET' } },
                { key: 'http.url', value: { stringValue: '/' } },
                { key: 'component', value: { stringValue: 'net/http' } },
              ],
            },
          ],
        },
      ],
    },
  ],
};
