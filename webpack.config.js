const webpack = require('webpack');
const path = require('path');
/**
 * Webpack Plugins
 */
const ProvidePlugin = require('webpack/lib/ProvidePlugin');
const DefinePlugin = require('webpack/lib/DefinePlugin');
const LoaderOptionsPlugin = require('webpack/lib/LoaderOptionsPlugin');

const ROOT = path.resolve(__dirname, '.');

const TEST = process.argv.indexOf('--test') > -1;

function root(args) {
  return path.join.apply(path, [ROOT].concat(args));
}

module.exports = {
  devtool: 'inline-source-map',

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    modules: ['node_modules']
  },

  entry: root('react-jhipster.ts'),

  output: {
    path: root('bundles'),
    publicPath: '/',
    filename: 'react-jhipster.umd.js',
    libraryTarget: 'umd',
    library: 'react-jhipster'
  },

  // require those dependencies but don't bundle them

  module: {
    rules: [{
      enforce: 'pre',
      test: /\.tsx?$/,
      loader: 'tslint-loader',
      exclude: [root('node_modules')]
    }, {
      test: /\.tsx?$/,
      loader: 'awesome-typescript-loader?declaration=false',
      exclude: [/\.e2e\.ts$/]
    }]
  },

  plugins: [
    new webpack.NamedModulesPlugin(),
    new webpack.LoaderOptionsPlugin({
      options: {
        tslintLoader: {
          emitErrors: false,
          failOnHint: false
        }
      }
    })
  ],
  externals: TEST ? {
    cheerio: 'window',
    'react/addons': true,
    'react/lib/ExecutionEnvironment': true,
    'react/lib/ReactContext': true
  } : {
    'lodash': true,
    'react': true,
    'react-addons-css-transition-group': true,
    'react-addons-transition-group': true,
    'react-dom': true
  }
};
