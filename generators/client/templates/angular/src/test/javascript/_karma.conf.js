<%#
 Copyright 2013-2017 the original author or authors from the JHipster project.

 This file is part of the JHipster project, see https://jhipster.github.io/
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
'use strict';

// Karma configuration file, see link for more information
// https://karma-runner.github.io/0.13/config/configuration-file.html

module.exports = function (config) {
  config.set({
    basePath: './',
    frameworks: ['jasmine', 'intl-shim', '@angular/cli'],
    plugins: [
      require('karma-jasmine'),
      require('karma-phantomjs-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-intl-shim'),
      require('karma-notify-reporter'),
      require('karma-junit-reporter'),
      require('karma-coverage-istanbul-reporter'),
      require('@angular/cli/plugins/karma')
    ],
    client:{
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    files: [
      { pattern: './spec/entry.ts', watched: false }
    ],
    // list of files to exclude
    exclude: [<% if (protractorTests) { %>'e2e/**'<% } %>],
    preprocessors: {
      './spec/entry.ts': ['@angular/cli']
    },
    mime: {
      'text/x-typescript': ['ts','tsx']
    },
    coverageIstanbulReporter: {
      reports: [ 'html', 'lcovonly' ],
      fixWebpackSourcePaths: true
    },
    angularCli: {
      environment: 'dev'
    },
    reporters: config.angularCli && config.angularCli.codeCoverage
              ? ['dots', 'junit', 'progress', 'coverage-istanbul', 'notify']
              : ['dots', 'junit', 'progress', 'kjhtml', 'notify'],
    junitReporter: {
        outputFile: '../../../../target/test-results/karma/TESTS-results.xml'
    },

    notifyReporter: {
        reportEachFailure: true, // Default: false, will notify on every failed sepc
        reportSuccess: true // Default: true, will notify when a suite was successful
    },
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['PhantomJS'],
    singleRun: true
  });
};
