'use strict';
const merge = require('webpack-merge');
const prodEnv = require('./prod.env');
const utils = require('../webpack/utils.js');

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  SERVER_API_URL: '\'\'',
  VERSION: `'${utils.parseVersion()}'`,
});
