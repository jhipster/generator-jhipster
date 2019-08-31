const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './lib/dsl/exports.js',
  output: {
    path: path.resolve(__dirname, './dist/'),
    filename: 'jdl-core.min.js',
    library: 'jdlCore',
    libraryTarget: 'umd',
    // https://github.com/webpack/webpack/issues/6784
    globalObject: "typeof self !== 'undefined' ? self : this"
  },
  externals: {
    // https://webpack.js.org/guides/author-libraries/#externalize-lodash
    lodash: {
      commonjs: 'lodash',
      commonjs2: 'lodash',
      amd: 'lodash',
      root: '_'
    }
  },
  optimization: {
    minimizer: [new TerserPlugin({})]
  }
};
