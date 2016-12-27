// Karma configuration
// http://karma-runner.github.io/1.0/config/configuration-file.html
'use strict';

module.exports = function (config) {
    config.set({

        // base path, that will be used to resolve files and exclude
        basePath: '<%= TEST_SRC_DIR %>'.replace(/[^/]+/g, '..'),

        // testing framework to use (jasmine/mocha/qunit/...)
        frameworks: ['jasmine', 'karma-typescript'],

        // list of files / patterns to load in the browser
        files: [
            {pattern: '<%= TEST_SRC_DIR %>spec/spec.ts'},

            {pattern: '<%= MAIN_SRC_DIR %>app/admin/health/health.component.ts'},
            {pattern: '<%= MAIN_SRC_DIR %>app/admin/health/health.service.ts'},
            {pattern: '<%= MAIN_SRC_DIR %>app/admin/health/health-modal.component.ts'},

            {pattern: '<%= TEST_SRC_DIR %>spec/app/admin/health/health.component.spec.ts'}
        ],

        proxies: {
            '/app/': '/base/src/main/webapp/app/'
        },

        // list of files / patterns to exclude
        exclude: [<% if (protractorTests) { %>'<%= TEST_SRC_DIR %>e2e/**'<% } %>],

        preprocessors: {
            '**/*.ts': ['karma-typescript']
        },

        reporters: ['dots', 'junit', 'coverage', 'progress', 'karma-typescript'],

        junitReporter: {<% if (buildTool == 'maven') { %>
            outputFile: 'target/test-results/karma/TESTS-results.xml'<% } else { %>
            outputFile: 'build/test-results/karma/TESTS-results.xml'<% } %>
        },

        coverageReporter: {<% if (buildTool == 'maven') { %>
            dir: 'target/test-results/coverage',<% } else { %>
            dir: 'build/test-results/coverage',<% } %>
            reporters: [
                {type: 'lcov', subdir: 'report-lcov'}
            ]
        },

        // web server port
        port: 9876,

        // level of logging
        // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
        logLevel: config.LOG_INFO,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,

        // Start these browsers, currently available:
        // - Chrome
        // - ChromeCanary
        // - Firefox
        // - Opera
        // - Safari (only Mac)
        // - PhantomJS
        // - IE (only Windows)
        browsers: ['PhantomJS'],

        // Continuous Integration mode
        // if true, it capture browsers, run tests and exit
        singleRun: false,

        // to avoid DISCONNECTED messages when connecting to slow virtual machines
        browserDisconnectTimeout: 10000, // default 2000
        browserDisconnectTolerance: 1, // default 0
        browserNoActivityTimeout: 4 * 60 * 1000 //default 10000
    });
};
