const webpack = require('webpack');
const writeFilePlugin = require('write-file-webpack-plugin');
const webpackMerge = require('webpack-merge');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const WebpackNotifierPlugin = require('webpack-notifier');
const path = require('path');

const utils = require('./utils.js');
const commonConfig = require('./webpack.common.js');

const ENV = 'development';

module.exports = webpackMerge(commonConfig({ env: ENV }), {
  devtool: 'eval-source-map',
  devServer: {
    stats: {
      children: false
    },
    hot: true,
    contentBase: './<%= BUILD_DIR %>www',
    proxy: [
      {
        context: [
          '/api', '/management', '/swagger-resources', '/v2/api-docs', '/h2-console'
        ],
        target: 'http://127.0.0.1:8080',
        secure: false
      }, {
        context: ['/websocket'],
        target: 'ws://127.0.0.1:8080',
        ws: true
      }
    ]
  },
  entry: [
    'react-hot-loader/patch',
    './src/main/webapp/app/index'
  ],
  output: {
    path: utils.root('<%= BUILD_DIR %>www'),
    filename: 'app/[name].bundle.js',
    chunkFilename: 'app/[id].chunk.js'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [{
          loader: 'react-hot-loader/webpack',
        },
        {
          loader: 'awesome-typescript-loader',
          options: {
            useCache: true
          }
        }],
        include: [utils.root('./src/main/webapp/app')],
        exclude: ['node_modules']
      },
      {
        test: /\.scss$/,
        loaders: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader']
      },
      {
        test: /\.css$/,
        loaders: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new BrowserSyncPlugin({
      host: 'localhost',
      port: 8000,
      proxy: {
        target: 'http://localhost:8005',
        ws: true
      }
    }, {
        reload: false
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.NamedModulesPlugin(),
    new writeFilePlugin(),
    new webpack.WatchIgnorePlugin([
      utils.root('src/test'),
    ]),
    new WebpackNotifierPlugin({
      title: 'XL-Agatha',
      contentImage: path.join(__dirname, 'logo-jhipster.png')
    })
  ]
});
