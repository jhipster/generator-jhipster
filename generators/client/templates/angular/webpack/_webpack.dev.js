const webpack = require('webpack');
const commonConfig = require('./webpack.common.js');
const webpackMerge = require('webpack-merge');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const ENV = 'dev';

module.exports = webpackMerge(commonConfig({env: ENV}), {
    devServer: {
        proxy: [{
            context: [<% if (authenticationType == 'oauth2') { %>
                '/oauth',<% } %>
                '/api',
                '/management',
                '/swagger-resources',
                '/v2/api-docs',
                '/h2-console'
            ],
            target: 'http://127.0.0.1:<%= serverPort %>',
            secure: false
        }]
    },
    output: {
        path: <% if (buildTool === 'gradle') { %>'/build/www'<% } else { %>'/target/www'<% } %>,
        filename: '[name].bundle.js',
        chunkFilename: '[id].chunk.js'
    },
    module: {
        rules: [{
            test: /\.ts$/,
            loaders: [
                'tslint-loader'
            ],
            exclude: ['node_modules', /reflect-metadata\/Reflect\.ts/]
        }]
    },
    plugins: [
        new BrowserSyncPlugin({
            host: 'localhost',
            port: 9000,
            proxy: 'http://localhost:<%= serverPort %>'
        }, {
            reload: false
        }),
        new ExtractTextPlugin('styles.css'),
        new webpack.NoErrorsPlugin()
    ]
});
