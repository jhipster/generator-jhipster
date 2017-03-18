/* eslint-disable */
const path = require('path');
const webpack = require('webpack');
// const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpackMerge = require('webpack-merge');
const commonConfig = require('./webpack.common.js');
/* eslint-enable */

module.exports = webpackMerge(commonConfig(), {
  devtool: 'source-map',
  output: {
    path: path.resolve('./target/www'),
    filename: '[name].js'
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendors',
      minChunks(module) {
        return (module.resource && module.resource.indexOf(path.resolve('node_modules')) === 0);
      }
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    }),
        // this conflicts with -p option
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        warnings: false
      }
    })
  ],
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.css$/,
        loader: 'stripcomment-loader'
      },
      {
        test: /\.js$/,
        loaders: ['babel-loader'],
        include: path.resolve('./src/main/webapp/app')
      }
    ]
  }
});
