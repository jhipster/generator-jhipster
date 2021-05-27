const path = require('path');
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const MergeJsonWebpackPlugin = require('merge-jsons-webpack-plugin');
const utils = require('./utils.js');

const getTsLoaderRule = env => {
  const rules = [
    {
      loader: 'thread-loader',
      options: {
        // There should be 1 cpu for the fork-ts-checker-webpack-plugin.
        // The value may need to be adjusted (e.g. to 1) in some CI environments,
        // as cpus() may report more cores than what are available to the build.
        workers: require('os').cpus().length - 1,
      },
    },
    {
      loader: 'ts-loader',
      options: {
        transpileOnly: true,
        happyPackMode: true,
      },
    },
  ];
  if (env === 'development') {
    rules.unshift({
      loader: 'react-hot-loader/webpack',
    });
  }
  return rules;
};

module.exports = options =>
  merge(
    // jhipster-needle-add-webpack-config - JHipster will add custom config
    {
      resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
        modules: ['node_modules'],
        alias: utils.mapTypescriptAliasToWebpackAlias(),
        fallback: {
          path: require.resolve('path-browserify'),
        },
      },
      module: {
        rules: [
          {
            test: /\.tsx?$/,
            use: getTsLoaderRule(options.env),
            include: [utils.root('./src/main/webapp/app')],
            exclude: [utils.root('node_modules')],
          },
          {
            test: /\.(jpe?g|png|gif|svg|woff2?|ttf|eot)$/i,
            loader: 'file-loader',
            options: {
              digest: 'hex',
              hash: 'sha512',
              name: 'content/[hash].[ext]',
            },
          },
          {
            enforce: 'pre',
            test: /\.jsx?$/,
            loader: 'source-map-loader',
          },
        ],
      },
      stats: {
        children: false,
      },
      optimization: {
        splitChunks: {
          cacheGroups: {
            commons: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
          },
        },
      },
      plugins: [
        new webpack.DefinePlugin({
          'process.env': {
            NODE_ENV: `'${options.env}'`,
            BUILD_TIMESTAMP: `'${new Date().getTime()}'`,
            // APP_VERSION is passed as an environment variable from the Gradle / Maven build tasks.
            VERSION: `'${process.env.hasOwnProperty('APP_VERSION') ? process.env.APP_VERSION : 'DEV'}'`,
            DEBUG_INFO_ENABLED: options.env === 'development',
            // The root URL for API calls, ending with a '/' - for example: `"https://www.jhipster.tech:8081/myservice/"`.
            // If this URL is left empty (""), then it will be relative to the current context.
            // If you use an API server, in `prod` mode, you will need to enable CORS
            // (see the `jhipster.cors` common JHipster property in the `application-*.yml` configurations)
            SERVER_API_URL: `''`,
          },
        }),
        new ESLintPlugin({
          extensions: ['js', 'ts', 'jsx', 'tsx'],
        }),
        new ForkTsCheckerWebpackPlugin(),
        new CopyWebpackPlugin({
          patterns: [
            {
              context: './node_modules/swagger-ui-dist/',
              from: '*.{js,css,html,png}',
              to: 'swagger-ui/',
              globOptions: { ignore: ['**/index.html'] },
            },
            { from: './node_modules/axios/dist/axios.min.js', to: 'swagger-ui/' },
            { from: './src/main/webapp/swagger-ui/', to: 'swagger-ui/' },
            { from: './src/main/webapp/content/', to: 'content/' },
            { from: './src/main/webapp/favicon.ico', to: 'favicon.ico' },
            { from: './src/main/webapp/manifest.webapp', to: 'manifest.webapp' },
            // jhipster-needle-add-assets-to-webpack - JHipster will add/remove third-party resources in this array
            { from: './src/main/webapp/robots.txt', to: 'robots.txt' },
          ],
        }),
        new HtmlWebpackPlugin({
          template: './src/main/webapp/index.html',
          chunksSortMode: 'auto',
          inject: 'body',
          base: '/',
        }),
        new MergeJsonWebpackPlugin({
          output: {
            groupBy: [
              { pattern: './src/main/webapp/i18n/en/*.json', fileName: './i18n/en.json' },
              { pattern: './src/main/webapp/i18n/de/*.json', fileName: './i18n/de.json' },
              { pattern: './src/main/webapp/i18n/fr/*.json', fileName: './i18n/fr.json' },
              // jhipster-needle-i18n-language-webpack - JHipster will add/remove languages in this array
            ],
          },
        }),
      ],
    }
  );
