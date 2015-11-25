// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html

module.exports = function (config) {
    config.set({
        // base path, that will be used to resolve files and exclude
        basePath: '../../',

        // testing framework to use (jasmine/mocha/qunit/...)
        frameworks: ['jasmine'],

        // list of files / patterns to load in the browser
        files: [
            // bower:js
            // endbower
            'main/webapp/scripts/app/app.js',
            'main/webapp/scripts/app/**/*.js',
            'main/webapp/scripts/components/**/*.+(js|html)',
            'test/javascript/spec/helpers/module.js',
            'test/javascript/spec/helpers/httpBackend.js',
            'test/javascript/**/!(karma.conf<% if (testFrameworks.indexOf("protractor") > -1) { %>|protractor.conf<% } %>).js'
        ],


        // list of files / patterns to exclude
        exclude: [<% if (testFrameworks.indexOf('protractor') > -1) { %>'test/javascript/e2e/**'<% } %>],

        preprocessors: {
            './**/*.js': ['coverage']
        },

        reporters: ['dots', 'jenkins', 'coverage', 'progress'],

        jenkinsReporter: {
            <% if (buildTool == 'maven') { %>
            outputFile: '../target/test-results/karma/TESTS-results.xml'<% } else { %>
            outputFile: '../build/test-results/karma/TESTS-results.xml'<% } %>
        },

        coverageReporter: {
            <% if (buildTool == 'maven') { %>
            dir: '../target/test-results/coverage',<% } else { %>
            dir: '../build/test-results/coverage',<% } %>
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
        autoWatch: false,

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
        browserDisconnectTimeout : 10000, // default 2000
        browserDisconnectTolerance : 1, // default 0
        browserNoActivityTimeout : 4*60*1000 //default 10000
    });
};
