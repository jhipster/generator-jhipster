/* eslint-disable */
const webpackConfig = require('../../../webpack/webpack.test.js');
/* eslint-enable */
const WATCH = process.argv.indexOf('--watch') > -1;
const DEBUG = process.argv.indexOf('--debug') > -1;

module.exports = config => {
  config.set({
    // Add any browsers here
    // browsers: ['Chrome'],

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: './',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha', 'chai'],

    // list of files / patterns to load in the browser
    files: ['spec/entry.ts'],

    // list of files to exclude
    exclude: ['e2e/**'],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'spec/entry.ts': ['webpack', 'sourcemap']
    },

    webpack: webpackConfig,

    webpackMiddleware: {
      noInfo: true
    },

    // Ensure all browsers can run tests written in .ts files
    mime: {
      'text/x-typescript': ['ts', 'tsx']
    },

    // Webpack takes a little while to compile -- this manifests as a really
    // long load time while webpack blocks on serving the request.
    browserNoActivityTimeout: 60000, // 60 seconds

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['junit', 'mocha', 'progress', 'karma-remap-istanbul', 'notify'],

    mochaReporter: {
        showDiff: true
    },

    junitReporter: {
      outputFile: '../../../../build/test-results/karma/TESTS-results.xml'
    },

    notifyReporter: {
      reportEachFailure: true, // Default: false, will notify on every failed sepc
      reportSuccess: true // Default: true, will notify when a suite was successful
    },

    remapIstanbulReporter: {
      reports: {
        html: 'build/test-results/coverage',
        'text-summary': null
      }
    },

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: WATCH,

    // Ensure all browsers can run tests written in .ts files
    client: {
      // log console output in our test console
      captureConsole: true
    },

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: !WATCH && !DEBUG
  });
};
