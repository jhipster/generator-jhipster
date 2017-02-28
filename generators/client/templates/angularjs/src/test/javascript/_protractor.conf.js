const os = require('os');

const HtmlScreenshotReporter = require("protractor-jasmine2-screenshot-reporter");
const JasmineReporters = require('jasmine-reporters');

const prefix = '<%= TEST_SRC_DIR %>'.replace(/[^/]+/g,'..');

var webbrowserDriver= '';
if (os.platform() === 'win32') {
    webbrowserDriver = prefix + 'node_modules/webdriver-manager/selenium/chromedriver_2.26.exe';
} else {
    webbrowserDriver = prefix + 'node_modules/webdriver-manager/selenium/chromedriver_2.26';
}

exports.config = {
    seleniumServerJar: prefix + 'node_modules/webdriver-manager/selenium/selenium-server-standalone-2.53.1.jar',
    chromeDriver: webbrowserDriver,
    allScriptsTimeout: 20000,

    suites: {
        account: './e2e/account/*.js',
        admin: './e2e/admin/*.js',
        entity: './e2e/entities/*.js'
    },

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
        defaultTimeoutInterval: 30000
    },

    onPrepare: function() {
        // Disable animations so e2e tests run more quickly
        var disableNgAnimate = function() {
            angular
                .module('disableNgAnimate', [])
                .run(['$animate', function($animate) {
                    $animate.enabled(false);
                }]);
        };

        var disableCssAnimate = function() {
            angular
                .module('disableCssAnimate', [])
                .run(function() {
                    var style = document.createElement('style');
                    style.type = 'text/css';
                    style.innerHTML = 'body * {' +
                        '-webkit-transition: none !important;' +
                        '-moz-transition: none !important;' +
                        '-o-transition: none !important;' +
                        '-ms-transition: none !important;' +
                        'transition: none !important;' +
                        '}';
                    document.getElementsByTagName('head')[0].appendChild(style);
                });
        };

        browser.addMockModule('disableNgAnimate', disableNgAnimate);
        browser.addMockModule('disableCssAnimate', disableCssAnimate);

        browser.driver.manage().window().setSize(1280, 1024);
        jasmine.getEnv().addReporter(new JasmineReporters.JUnitXmlReporter({
            savePath: '<%= BUILD_DIR %>reports/e2e',
            consolidateAll: false
        }));
        jasmine.getEnv().addReporter(new HtmlScreenshotReporter({
            dest: "<%= BUILD_DIR %>reports/e2e/screenshots"
        }));
    }
};
