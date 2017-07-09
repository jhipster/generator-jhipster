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
const writeFilePlugin = require('write-file-webpack-plugin');
const webpackMerge = require('webpack-merge');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const WebpackNotifierPlugin = require('webpack-notifier');
const execSync = require('child_process').execSync;
const fs = require('fs');
const path = require('path');

const utils = require('./utils.js');
const commonConfig = require('./webpack.common.js');

const ENV = 'development';

module.exports = webpackMerge(commonConfig({ env: ENV }), {
    devtool: 'eval-source-map',
    devServer: {
        contentBase: './<%= BUILD_DIR %>www',
        proxy: [{
            context: [<% if (authenticationType === 'oauth2') { %>
                '/oauth',<% } %><% if (authenticationType === 'uaa') { %>
                '/<%= uaaBaseName.toLowerCase() %>',<% } %>
                /* jhipster-needle-add-entity-to-webpack - JHipster will add entity api paths here */
                '/api',
                '/management',
                '/swagger-resources',
                '/v2/api-docs',
                '/h2-console'
            ],
            target: 'http://127.0.0.1:<%= serverPort %>',
            secure: false
        }<% if (websocket === 'spring-websocket') { %>,{
            context: [
                '/websocket'
            ],
            target: 'ws://127.0.0.1:<%= serverPort %>',
            ws: true
        }<% } %>]
    },
    entry: {
        polyfills: './<%= MAIN_SRC_DIR %>app/polyfills',
        <%_ if (useSass) { _%>
        global: './<%= MAIN_SRC_DIR %>content/scss/global.scss',
        <%_ } else { _%>
        global: './<%= MAIN_SRC_DIR %>content/css/global.css',
        <%_ } _%>
        main: './<%= MAIN_SRC_DIR %>app/app.main'
    },
    output: {
        path: utils.root('<%= BUILD_DIR %>www'),
        filename: 'app/[name].bundle.js',
        chunkFilename: 'app/[id].chunk.js'
    },
    module: {
        rules: [{
            test: /\.ts$/,
            enforce: 'pre',
            loaders: 'tslint-loader',
            exclude: ['node_modules', new RegExp('reflect-metadata\\' + path.sep + 'Reflect\\.ts')]
        },
        {
            test: /\.ts$/,
            loaders: [
                'angular2-template-loader',
                'awesome-typescript-loader'
            ],
            exclude: ['node_modules/generator-jhipster']
        }]
    },
    plugins: [
        new BrowserSyncPlugin({
            host: 'localhost',
            port: 9000,
            proxy: {
                target: 'http://localhost:9060'<% if (websocket === 'spring-websocket') { %>,
                ws: true<% } %>
            }
        }, {
            reload: false
        }),
        new ExtractTextPlugin('styles.css'),
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.NamedModulesPlugin(),
        new writeFilePlugin(),
        new webpack.WatchIgnorePlugin([
            utils.root('src/test'),
        ]),
        new WebpackNotifierPlugin({
            title: 'JHipster',
            contentImage: path.join(__dirname, 'logo-jhipster.png')
        })
    ]
});
