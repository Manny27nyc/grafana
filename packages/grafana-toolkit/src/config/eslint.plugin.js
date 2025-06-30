// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
  extends: ['@grafana/eslint-config'],
  rules: {
    'react/prop-types': 'off',
  },
};
