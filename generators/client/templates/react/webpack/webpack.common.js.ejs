<%#
 Copyright 2013-2018 the original author or authors from the JHipster project.

    This file is part of the JHipster project, see http://www.jhipster.tech/
    for more information.

        Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
limitations under the License.
-%>
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const utils = require('./utils.js');
module.exports = options => ({
  cache: options.env !== 'production',
  resolve: {
    extensions: [
      '.js', '.jsx', '.ts', '.tsx', '.json'
    ],
    modules: ['node_modules']
  },
  module: {
    rules: [
      {
        test: /\.(jpe?g|png|gif|svg|woff2?|ttf|eot)$/i,
        loaders: ['file-loader?hash=sha512&digest=hex&name=[hash].[ext]']
      },
      {
        enforce: 'pre',
        test: /\.jsx?$/,
        loader: 'source-map-loader'
      },
      {
        test: /\.tsx?$/,
        enforce: 'pre',
        loaders: 'tslint-loader',
        exclude: ['node_modules']
      }
    ]
  },
  stats: {
    children: false
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: `'${options.env}'`,
        VERSION: `'${utils.parseVersion()}'`,
        DEBUG_INFO_ENABLED: options.env === 'development',
        // The root URL for API calls, ending with a '/' - for example: `"http://www.jhipster.tech:8081/myservice/"`.
        // If this URL is left empty (""), then it will be relative to the current context.
        // If you use an API server, in `prod` mode, you will need to enable CORS
        // (see the `jhipster.cors` common JHipster property in the `application-*.yml` configurations)
        SERVER_API_URL: `''`
      }
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      chunks: ['main'],
      minChunks: module => utils.isExternalLib(module)
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: ['manifest'],
      minChunks: Infinity
    }),
    new CopyWebpackPlugin([
      { from: './node_modules/swagger-ui/dist/css', to: 'swagger-ui/dist/css' },
      { from: './node_modules/swagger-ui/dist/lib', to: 'swagger-ui/dist/lib' },
      { from: './node_modules/swagger-ui/dist/swagger-ui.min.js', to: 'swagger-ui/dist/swagger-ui.min.js' },
      { from: './<%= MAIN_SRC_DIR %>/swagger-ui/', to: 'swagger-ui' },
      { from: './<%= MAIN_SRC_DIR %>static/', to: 'static' },
      { from: './<%= MAIN_SRC_DIR %>favicon.ico', to: 'favicon.ico' },
      { from: './<%= MAIN_SRC_DIR %>manifest.webapp', to: 'manifest.webapp' },
      // jhipster-needle-add-assets-to-webpack - JHipster will add/remove third-party resources in this array
      { from: './<%= MAIN_SRC_DIR %>robots.txt', to: 'robots.txt' }
    ]),
    new HtmlWebpackPlugin({
      template: './src/main/webapp/index.html',
      chunksSortMode: 'dependency',
      inject: 'body'
    })
  ]
});
