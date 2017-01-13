const commonConfig = require('./webpack.common.js');
const webpackMerge = require('webpack-merge');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const Visualizer = require('webpack-visualizer-plugin');
const ENV = 'prod';

module.exports = webpackMerge(commonConfig({env: ENV}), {
        devtool: 'cheap-module-source-map',
        output: {
        path: <% if (buildTool === 'gradle') { %>'./build/www'<% } else { %>'./target/www'<% } %>,
        filename: '[hash].[name].bundle.js',
        chunkFilename: '[hash].[id].chunk.js'
    },
    plugins: [
        new ExtractTextPlugin('[hash].styles.css'),
        new Visualizer()
    ]
});
