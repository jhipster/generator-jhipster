<%#
 Copyright 2013-2017 the original author or authors.

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

// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts

const { SpecReporter } = require('jasmine-spec-reporter');
const HtmlScreenshotReporter = require("protractor-jasmine2-screenshot-reporter");

exports.config = {
  allScriptsTimeout: 20000,
  specs: [
    './e2e/account/*.spec.ts',
    './e2e/admin/*.spec.ts',
    './e2e/entities/*.spec.ts'
  ],
  capabilities: {
    'browserName': 'chrome',
    'phantomjs.binary.path': require('phantomjs-prebuilt').path,
    'phantomjs.ghostdriver.cli.args': ['--loglevel=DEBUG']
  },
  directConnect: true,
  baseUrl: 'http://localhost:<%= serverPort %>/',
  framework: 'jasmine2',
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000,
  },
  beforeLaunch: function() {
    require('ts-node').register({
      project: ''
    });
  },
  onPrepare() {
    browser.driver.manage().window().setSize(1280, 1024);
    jasmine.getEnv().addReporter(new SpecReporter({ spec: { displayStacktrace: true } }));
    jasmine.getEnv().addReporter(new HtmlScreenshotReporter({
        dest: "<%= BUILD_DIR %>reports/e2e/screenshots"
    }));
  },
  useAllAngular2AppRoots: true
};
