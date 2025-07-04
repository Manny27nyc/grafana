// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
define([], function () {
  'use strict';

  return {
    create: function () {
      return {
        title: '',
        tags: [],
        style: 'dark',
        timezone: 'browser',
        editable: true,
        failover: false,
        panel_hints: true,
        rows: [],
        pulldowns: [{ type: 'templating' }, { type: 'annotations' }],
        nav: [{ type: 'timepicker' }],
        time: { from: 'now-6h', to: 'now' },
        templating: {
          list: [],
        },
        refresh: '10s',
      };
    },
  };
});
