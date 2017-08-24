<%#
 Copyright 2013-2017 the original author or authors from the JHipster project.

 This file is part of the JHipster project, see http://www.jhipster.tech/
 for more information.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
-%>
const webpackConfig = require('../../../webpack/webpack.test.js');

const WATCH = process.argv.indexOf('--watch') > -1;

module.exports = (config) => {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: './',

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine', 'intl-shim'],

        // list of files / patterns to load in the browser
        files: [
            'spec/entry.ts'
        ],


        // list of files to exclude
        exclude: [<% if (protractorTests) { %>'e2e/**'<% } %>],

        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            'spec/entry.ts': ['webpack', 'sourcemap']
        },

        webpack: webpackConfig(WATCH),

        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['dots', 'junit', 'progress', 'karma-remap-istanbul', 'notify'],

        junitReporter: {
            outputFile: '../../../../<%= BUILD_DIR %>test-results/karma/TESTS-results.xml'
        },

        notifyReporter: {
            reportEachFailure: true, // Default: false, will notify on every failed sepc
            reportSuccess: true // Default: true, will notify when a suite was successful
        },


        remapIstanbulReporter: {
            reports: { // eslint-disable-line
                'html': '<%= BUILD_DIR %>test-results/coverage',
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

        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['PhantomJS'],

        // Ensure all browsers can run tests written in .ts files
        mime: {
            'text/x-typescript': ['ts','tsx']
        },

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: !WATCH
    });
};
