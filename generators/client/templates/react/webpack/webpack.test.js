const webpack = require('webpack');
const path = require('path');
const webpackMerge = require('webpack-merge');
const commonConfig = require('./webpack.common.js');

const ENV = 'development';

module.exports = {
  entry: ['./src/test/javascript/spec/entry'],
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.scss$/,
        loaders: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader']
      },
      {
        test: /\.css$/,
        loaders: ['style-loader', 'css-loader']
      },
      {
        test: /\.(jpe?g|png|gif|svg|woff2?|ttf|eot)$/i,
        loaders: ['file-loader?hash=sha512&digest=hex&name=[hash].[ext]']
      },
      {
        enforce: 'pre',
        test: /\.jsx?$/,
        loader: 'source-map-loader'
      },
      {
        test: /src[/|\\]main[/|\\]webapp[/|\\].+\.tsx?$/,
        enforce: 'post',
        exclude: /(test|node_modules)/,
        loader: 'sourcemap-istanbul-instrumenter-loader?force-sourcemap=true'
      },
      {
        test: /\.tsx?$/,
        use: [{
          loader: 'awesome-typescript-loader',
          options: {
            useCache: true,
            ignoreDiagnostics: [2307] // due to a weird false error fro json files
          }
        }],
        include: [path.resolve('./src/main/webapp/app'), path.resolve('./src/test/javascript')],
        exclude: ['node_modules']
      }
    ]
  },
  cache: true,
  resolve: {
    extensions: [
      '.js', '.jsx', '.ts', '.tsx', '.json'
    ],
    modules: ['node_modules']
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify(ENV)
      }
    })
  ],
  externals: {
    cheerio: 'window',
    'react/addons': true,
    'react/lib/ExecutionEnvironment': true,
    'react/lib/ReactContext': true
  }
};
