// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
'use strict';
const { cloneDeep } = require('lodash');

module.exports.getWebpackConfig = (originalConfig, options) => {
  const config = cloneDeep(originalConfig);
  config.name = 'customConfig';
  return config;
};
