const webpack = require('webpack');
const commonConfig = require('./webpack.common.js');
const webpackMerge = require('webpack-merge');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const ENV = 'dev';

module.exports = webpackMerge(commonConfig({env: ENV}), {
    module: {
        rules: [{
            test: /\.ts$/,
            loaders: [
                'tslint'
            ],
            exclude: ['node_modules', /reflect-metadata\/Reflect\.ts/]
        }]
    },
    plugins: [
        new BrowserSyncPlugin({
            host: 'localhost',
            port: 9000,
            proxy: 'http://localhost:<%= serverPort %>'
        }),
        new ExtractTextPlugin('styles.css'),
        new webpack.NoErrorsPlugin()
    ]
});
