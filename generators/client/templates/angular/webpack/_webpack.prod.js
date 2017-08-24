<%#
 Copyright 2013-2017 the original author or authors from the JHipster project.

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
const Visualizer = require('webpack-visualizer-plugin');
const ngcWebpack = require('ngc-webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const path = require('path');

const utils = require('./utils.js');
const commonConfig = require('./webpack.common.js');

const ENV = 'production';
<%_ if (useSass) { _%>
const extractSASS = new ExtractTextPlugin(`[name]-sass.[hash].css`);
<%_ } _%>
const extractCSS = new ExtractTextPlugin(`[name].[hash].css`);

module.exports = webpackMerge(commonConfig({ env: ENV }), {
    // Enable source maps. Please note that this will slow down the build.
    // You have to enable it in UglifyJSPlugin config below and in tsconfig-aot.json as well
    // devtool: 'source-map',
    entry: {
        polyfills: './<%= MAIN_SRC_DIR %>app/polyfills',
        <%_ if (useSass) { _%>
        global: './<%= MAIN_SRC_DIR %>content/scss/global.scss',
        <%_ } else { _%>
        global: './<%= MAIN_SRC_DIR %>content/css/global.css',
        <%_ } _%>
        main: './<%= MAIN_SRC_DIR %>app/app.main-aot'
    },
    output: {
        path: utils.root('<%= BUILD_DIR %>www'),
        filename: 'app/[name].[hash].bundle.js',
        chunkFilename: 'app/[id].[hash].chunk.js'
    },
    module: {
        rules: [{
            test: /\.ts$/,
            use: [
                {
                    loader: 'awesome-typescript-loader',
                    options: {
                        configFileName: 'tsconfig-aot.json'
                    },
                },
                { loader: 'angular2-template-loader' }
            ],
            exclude: ['node_modules/generator-jhipster']
        },
        <%_ if (useSass) { _%>
        {
            test: /\.scss$/,
            loaders: ['to-string-loader', 'css-loader', 'sass-loader'],
            exclude: /(vendor\.scss|global\.scss)/
        },
        {
            test: /(vendor\.scss|global\.scss)/,
            use: extractSASS.extract({
                fallback: 'style-loader',
                use: ['css-loader', 'postcss-loader', 'sass-loader']
            })
        },
        <%_ } _%>
        {
            test: /\.css$/,
            loaders: ['to-string-loader', 'css-loader'],
            exclude: /(vendor\.css|global\.css)/
        },
        {
            test: /(vendor\.css|global\.css)/,
            use: extractCSS.extract({
                fallback: 'style-loader',
                use: ['css-loader']
            })
        }]
    },
    plugins: [
        <%_ if (useSass) { _%>
        extractSASS,
        <%_ } _%>
        extractCSS,
        new Visualizer({
            // Webpack statistics in target folder
            filename: '../stats.html'
        }),
        new UglifyJSPlugin({
            parallel: true,
            uglifyOptions: {
                ie8: false,
                // sourceMap: true, // Enable source maps. Please note that this will slow down the build
                compress: {
                    dead_code: true,
                    warnings: false,
                    properties: true,
                    drop_debugger: true,
                    conditionals: true,
                    booleans: true,
                    loops: true,
                    unused: true,
                    toplevel: true,
                    if_return: true,
                    inline: true,
                    join_vars: true
                },
                output: {
                    comments: false,
                    beautify: false,
                    indent_level: 2
                }
            }
        }),
        new ngcWebpack.NgcWebpackPlugin({
            disabled: false,
            tsConfig: utils.root('tsconfig-aot.json'),
            resourceOverride: ''
        }),
        new webpack.LoaderOptionsPlugin({
            minimize: true,
            debug: false
        })
    ]
});
