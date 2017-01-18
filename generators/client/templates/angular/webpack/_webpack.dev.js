const webpack = require('webpack');
const path = require('path');
const commonConfig = require('./webpack.common.js');
const writeFilePlugin = require('write-file-webpack-plugin');
const webpackMerge = require('webpack-merge');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const ENV = 'dev';
const execSync = require('child_process').execSync;
const fs = require('fs');
const ddlPath = './<%= BUILD_DIR %>www/vendor.json';

if (!fs.existsSync(ddlPath)) {
    execSync('webpack --config webpack/webpack.vendor.js');
}

module.exports = webpackMerge(commonConfig({env: ENV}), {
    devtool: 'inline-source-map',
    devServer: {
        contentBase: './<%= BUILD_DIR %>www',
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
        path: path.resolve('<%= BUILD_DIR %>www') ,
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
            proxy: 'http://localhost:9060'
        }, {
            reload: false
        }),
        new ExtractTextPlugin('styles.css'),
        new webpack.NoErrorsPlugin(),
        new webpack.NamedModulesPlugin(),
        new writeFilePlugin()
    ]
});
