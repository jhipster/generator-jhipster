var HtmlScreenshotReporter = require("protractor-jasmine2-screenshot-reporter");
var JasmineReporters = require('jasmine-reporters');

var prefix = '<%= TEST_SRC_DIR %>'.replace(/[^/]+/g,'..');

exports.config = {
    seleniumServerJar: prefix + 'node_modules/protractor/selenium/selenium-server-standalone-2.52.0.jar',
    chromeDriver: prefix + 'node_modules/protractor/selenium/chromedriver',
    allScriptsTimeout: 20000,

    suites: {
        account: './e2e/account/*.js',
        admin: './e2e/admin/*.js',
        entity: './e2e/entities/*.js'
    },

    capabilities: {
        'browserName': 'firefox',
        'phantomjs.binary.path': require('phantomjs-prebuilt').path,
        'phantomjs.ghostdriver.cli.args': ['--loglevel=DEBUG']
    },

    directConnect: true,

    baseUrl: 'http://localhost:8080/',

    framework: 'jasmine2',

    jasmineNodeOpts: {
        showColors: true,
        defaultTimeoutInterval: 30000
    },

    onPrepare: function() {
        browser.driver.manage().window().setSize(1280, 1024);
        jasmine.getEnv().addReporter(new JasmineReporters.JUnitXmlReporter({
            savePath: prefix + "<% if (buildTool == 'maven') { %>target<% } else { %>build<% } %>/reports/e2e",
            consolidateAll: false
        }));
        jasmine.getEnv().addReporter(new HtmlScreenshotReporter({
            dest: prefix + "<% if (buildTool == 'maven') { %>target<% } else { %>build<% } %>/reports/e2e/screenshots"
        }));
    },

    /**
     * Angular2 configuration
     *
     * tells Protractor to wait for any angular2
     */
    useAllAngular2AppRoots: true
};
