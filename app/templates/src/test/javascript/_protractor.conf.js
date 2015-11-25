var HtmlScreenshotReporter = require("protractor-jasmine2-screenshot-reporter");
var JasmineReporters = require('jasmine-reporters');

exports.config = {
    seleniumServerJar: '../../../node_modules/protractor/selenium/selenium-server-standalone-2.47.1.jar',
    chromeDriver: '../../../node_modules/protractor/selenium/chromedriver',
    allScriptsTimeout: 20000,

    specs: [
        'e2e/*.js'
    ],

    capabilities: {
        'browserName': 'firefox',
        'phantomjs.binary.path': require('phantomjs').path,
        'phantomjs.ghostdriver.cli.args': ['--loglevel=DEBUG']
    },

    baseUrl: 'http://localhost:8080/',

    framework: 'jasmine2',

    jasmineNodeOpts: {
        showColors: true,
        defaultTimeoutInterval: 30000
    },

    onPrepare: function() {
        browser.driver.manage().window().setSize(1280, 1024);
        jasmine.getEnv().addReporter(new JasmineReporters.JUnitXmlReporter({
            savePath: '<% if (buildTool == 'maven') { %>target<% } else { %>build<% } %>/reports/e2e',
            consolidateAll: false
        }));
        jasmine.getEnv().addReporter(new HtmlScreenshotReporter({
            dest: "<% if (buildTool == 'maven') { %>target<% } else { %>build<% } %>/reports/e2e/screenshots"
        }));
    }
};
