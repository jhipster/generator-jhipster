<%#
 Copyright 2013-2017 the original author or authors.

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
const path = require('path');
module.exports = {
    entry: {
        'vendor': [
            './src/main/webapp/app/vendor',
            '@angular/common',
            '@angular/compiler',
            '@angular/core',
            '@angular/forms',
            '@angular/http',
            '@angular/platform-browser',
            '@angular/platform-browser-dynamic',
            '@angular/router',
            '@ng-bootstrap/ng-bootstrap',
            'angular2-cookie',
            'ngx-infinite-scroll',
            'jquery',
            'ng-jhipster',
            'ng2-webstorage',
            <%_ if (websocket == 'spring-websocket') { _%>
            'sockjs-client',
            'webstomp-client',
            <%_ } _%>
            'rxjs'
        ]
    },
    resolve: {
        extensions: ['.ts', '.js'],
        modules: ['node_modules']
    },
    module: {
        exprContextCritical: false,
        rules: [
            <%_ if (useSass) { _%>
            {
                test: /(vendor\.scss|global\.scss)/,
                loaders: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader']
            },
            <%_ } else { _%>
            {
                test: /(vendor\.css|global\.css)/,
                loaders: ['style-loader', 'css-loader']
            },
            <%_ } _%>
            {
                test: /\.(jpe?g|png|gif|svg|woff2?|ttf|eot)$/i,
                loaders: ['file-loader?hash=sha512&digest=hex&name=[hash].[ext]']
            }
        ]
    },
    output: {
        filename: '[name].dll.js',
        path: path.resolve('./<%= BUILD_DIR %>www'),
        library: '[name]'
    },
    plugins: [
        new webpack.DllPlugin({
            name: '[name]',
            path: path.resolve('./<%= BUILD_DIR %>www/[name].json')
        })
    ]
};
