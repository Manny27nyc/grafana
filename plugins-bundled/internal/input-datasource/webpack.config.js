// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
const { merge } = require('lodash');
const PnpWebpackPlugin = require('pnp-webpack-plugin');

module.exports = {
  getWebpackConfig: (baseConfig) => {
    return merge(baseConfig, {
      resolve: {
        plugins: [PnpWebpackPlugin],
      },
      resolveLoader: {
        plugins: [PnpWebpackPlugin.moduleLoader(module)],
      },
    });
  },
};
