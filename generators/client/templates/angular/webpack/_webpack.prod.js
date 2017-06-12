<%#
 Copyright 2013-2017 the original author or authors from the JHipster project.

 This file is part of the JHipster project, see https://jhipster.github.io/
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
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const Visualizer = require('webpack-visualizer-plugin');
const AotPlugin = require('@ngtools/webpack').AotPlugin;
const path = require('path');

const commonConfig = require('./webpack.common.js');

const ENV = 'prod';
const _root = path.resolve(__dirname, '..');

function root(args) {
  args = Array.prototype.slice.call(arguments, 0);
  return path.join.apply(path, [_root].concat(args));
}

module.exports = webpackMerge(commonConfig({ env: ENV }), {
    devtool: 'source-map',
    entry: {
        'polyfills': './src/main/webapp/app/polyfills',
        'main': './src/main/webapp/app/app.main-aot',
        'vendor': './src/main/webapp/app/vendor-aot'
    },
    output: {
        path: path.resolve('./<%= BUILD_DIR %>www'),
        filename: 'app/[hash].[name].bundle.js',
        chunkFilename: 'app/[hash].[id].chunk.js'
    },
    plugins: [
        new ExtractTextPlugin('[hash].styles.css'),
        new Visualizer({
            // Webpack statistics in target folder
            filename: '../stats.html'
        }),
        // AOT Plugin 
        new AotPlugin({
            tsConfigPath: './tsconfig-aot.json',
            entryModule: root('src/main/webapp/app/app.module#<%=angular2AppName%>AppModule')
        }),
        new webpack.optimize.UglifyJsPlugin({
            beautify: false,
            comments: false,
            sourcMap: true,
            compress: {
                screw_ie8: true,
                warnings: false
            },
            mangle: {
                keep_fnames: true,
                screw_i8: true
            }
        })
    ]
});
