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
const webpackMerge = require('webpack-merge');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const WorkboxPlugin = require('workbox-webpack-plugin');
const path = require('path');

const utils = require('./utils.js');
const commonConfig = require('./webpack.common.js');

const ENV = 'production';
const extractCSS = new ExtractTextPlugin(`[name].[hash].css`);
const extractSASS = new ExtractTextPlugin(`[name]-sass.[hash].css`);

module.exports = webpackMerge(commonConfig({ env: ENV }), {
  // devtool: 'source-map', // Enable source maps. Please note that this will slow down the build
  entry: {
    main: './src/main/webapp/app/index'
  },
  output: {
    path: utils.root('<%= BUILD_DIR %>www'),
    filename: 'app/[name].[hash].bundle.js',
    chunkFilename: 'app/[id].[hash].chunk.js'
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.s?css$/,
        loader: 'stripcomment-loader'
      },
      {
        test: /\.tsx?$/,
        use: [{
          loader: 'awesome-typescript-loader',
          options: {
            useCache: false
          }
        }],
        include: [utils.root('./src/main/webapp/app')],
        exclude: ['node_modules']
      },
      {
        test: /\.scss$/,
        use: extractSASS.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'postcss-loader', 'sass-loader']
        })
      },
      {
        test: /\.css$/,
        use: extractCSS.extract({
          fallback: 'style-loader',
          use: ['css-loader']
        })
      }
    ]
  },
  plugins: [
    // this conflicts with -p option
    new webpack.optimize.UglifyJsPlugin({
      beautify: false,
      comments: false,
      // sourceMap: true, // Enable source maps. Please note that this will slow down the build
      compress: {
        screw_ie8: true,
        warnings: false
      },
      mangle: {
        keep_fnames: true,
        screw_i8: true
      }
    }),
    extractCSS,
    extractSASS,
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false
    }),
    new WorkboxPlugin({
      // to cache all under <%= BUILD_DIR %>www
      globDirectory: utils.root('<%= BUILD_DIR %>www'),
      // find these files and cache them
      globPatterns: ['**/*.{html,bundle.js,css,png,svg,jpg,gif,json}'],
      // create service worker at the <%= BUILD_DIR %>www
      swDest: path.resolve(utils.root('<%= BUILD_DIR %>www'), 'sw.js'),
      clientsClaim: true,
      skipWaiting: true,
    })
  ]
});
