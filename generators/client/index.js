'use strict';
const util = require('util'),
    generators = require('yeoman-generator'),
    chalk = require('chalk'),
    _ = require('lodash'),
    scriptBase = require('../generator-base'),
    prompts = require('./prompts'),
    writeAngularFiles = require('./files-angular').writeFiles,
    writeAngularJsFiles = require('./files-angularjs').writeFiles,
    packagejs = require('../../package.json');

var JhipsterClientGenerator = generators.Base.extend({});

util.inherits(JhipsterClientGenerator, scriptBase);

/* Constants use throughout */
const constants = require('../generator-constants'),
    QUESTIONS = constants.CLIENT_QUESTIONS;

module.exports = JhipsterClientGenerator.extend({
    constructor: function () {
        generators.Base.apply(this, arguments);

        this.configOptions = this.options.configOptions || {};

        // This adds support for a `--protractor` flag
        this.option('protractor', {
            desc: 'Enable protractor tests',
            type: Boolean,
            defaults: false
        });

        // This adds support for a `--auth` flag
        this.option('auth', {
            desc: 'Provide authentication type for the application',
            type: String
        });

        // This adds support for a `--build` flag
        this.option('build', {
            desc: 'Provide build tool for the application',
            type: String
        });

        // This adds support for a `--websocket` flag
        this.option('websocket', {
            desc: 'Provide websocket option for the application',
            type: String
        });

        // This adds support for a `--dev-db` flag
        this.option('dev-db', {
            desc: 'Provide development DB option for the application',
            type: String
        });

        // This adds support for a `--db` flag
        this.option('db', {
            desc: 'Provide DB type for the application',
            type: String
        });

        // This adds support for a `--social` flag
        this.option('social', {
            desc: 'Provide development DB option for the application',
            type: Boolean,
            default: false
        });

        // This adds support for a `--search-engine` flag
        this.option('search-engine', {
            desc: 'Provide development DB option for the application',
            type: String
        });

        // This adds support for a `--search-engine` flag
        this.option('hb-cache', {
            desc: 'Provide hibernate cache option for the application',
            type: String
        });

        // This adds support for a `--jhi-prefix` flag
        this.option('jhi-prefix', {
            desc: 'Add prefix before services, controllers and states name',
            type: String,
            defaults: 'jhi'
        });

        // This adds support for a `--skip-user-management` flag
        this.option('skip-user-management', {
            desc: 'Skip the user management module during app generation',
            type: Boolean,
            defaults: false
        });

        // This adds support for a `--npm` flag
        this.option('npm', {
            desc: 'Use npm instead of yarn',
            type: Boolean,
            defaults: false
        });

        this.skipServer = this.configOptions.skipServer || this.config.get('skipServer');
        this.skipUserManagement = this.configOptions.skipUserManagement || this.options['skip-user-management'] || this.config.get('skipUserManagement');
        this.authenticationType = this.options['auth'];
        this.buildTool = this.options['build'];
        this.websocket = this.options['websocket'];
        this.devDatabaseType = this.options['dev-db'];
        this.databaseType = this.options['db'];
        this.enableSocialSignIn = this.options['social'];
        this.searchEngine = this.options['search-engine'];
        this.hibernateCache = this.options['hb-cache'];
        this.otherModules = this.configOptions.otherModules || [];
        this.jhiPrefix = this.configOptions.jhiPrefix || this.config.get('jhiPrefix') || this.options['jhi-prefix'];
        this.jhiPrefixCapitalized = _.upperFirst(this.jhiPrefix);
        this.testFrameworks = [];
        this.options['protractor'] && this.testFrameworks.push('protractor');
        this.currentQuestion = this.configOptions.lastQuestion ? this.configOptions.lastQuestion : 0;
        this.totalQuestions = this.configOptions.totalQuestions ? this.configOptions.totalQuestions : QUESTIONS;
        this.baseName = this.configOptions.baseName;
        this.logo = this.configOptions.logo;
        this.yarnInstall = this.configOptions.yarnInstall = !this.options['npm'];
        this.clientPackageManager = this.configOptions.clientPackageManager;
    },

    initializing: {
        displayLogo: function () {
            if (this.logo) {
                this.printJHipsterLogo();
            }
        },

        setupClientVars: function () {
            // Make constants available in templates
            this.MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR;
            this.TEST_SRC_DIR = constants.CLIENT_TEST_SRC_DIR;

            this.serverPort = this.config.get('serverPort') || this.configOptions.serverPort || 8080;
            this.applicationType = this.config.get('applicationType') || this.configOptions.applicationType;
            if (!this.applicationType) {
                this.applicationType = 'monolith';
            }
            this.clientFramework = this.config.get('clientFramework');
            if (!this.clientFramework) {
                /* for backward compatibility */
                this.clientFramework = 'angular1';
            }
            this.useSass = this.config.get('useSass');
            this.enableTranslation = this.config.get('enableTranslation'); // this is enabled by default to avoid conflicts for existing applications
            this.nativeLanguage = this.config.get('nativeLanguage');
            this.languages = this.config.get('languages');
            this.messageBroker = this.config.get('messageBroker');
            this.packagejs = packagejs;
            var baseName = this.config.get('baseName');
            if (baseName) {
                this.baseName = baseName;
            }

            var clientConfigFound = this.useSass !== undefined;
            if (clientConfigFound) {
                // If translation is not defined, it is enabled by default
                if (this.enableTranslation === undefined) {
                    this.enableTranslation = true;
                }
                if (this.nativeLanguage === undefined) {
                    this.nativeLanguage = 'en';
                }
                if (this.languages === undefined) {
                    this.languages = ['en', 'fr'];
                }

                this.existingProject = true;
            }
            if (!this.clientPackageManager) {
                if (this.yarnInstall) {
                    this.clientPackageManager = 'yarn';
                } else {
                    this.clientPackageManager = 'npm';
                }
            }
        }
    },

    prompting: {

        askForModuleName: prompts.askForModuleName,
        askForClient: prompts.askForClient,
        askForClientSideOpts: prompts.askForClientSideOpts,
        askFori18n: prompts.askFori18n,

        setSharedConfigOptions: function () {
            this.configOptions.lastQuestion = this.currentQuestion;
            this.configOptions.totalQuestions = this.totalQuestions;
            this.configOptions.clientFramework = this.clientFramework;
            this.configOptions.useSass = this.useSass;
        }

    },

    configuring: {
        insight: function () {
            var insight = this.insight();
            insight.trackWithEvent('generator', 'client');
            insight.track('app/clientFramework', this.clientFramework);
            insight.track('app/useSass', this.useSass);
            insight.track('app/enableTranslation', this.enableTranslation);
            insight.track('app/nativeLanguage', this.nativeLanguage);
            insight.track('app/languages', this.languages);
        },

        configureGlobal: function () {
            // Application name modified, using each technology's conventions
            this.camelizedBaseName = _.camelCase(this.baseName);
            this.angularAppName = this.getAngularAppName();
            this.angular2AppName = this.getAngular2AppName();
            this.capitalizedBaseName = _.upperFirst(this.baseName);
            this.dasherizedBaseName = _.kebabCase(this.baseName);
            this.lowercaseBaseName = this.baseName.toLowerCase();
            if (!this.nativeLanguage) {
                // set to english when translation is set to false
                this.nativeLanguage = 'en';
            }
        },

        saveConfig: function () {
            this.config.set('clientFramework', this.clientFramework);
            this.config.set('useSass', this.useSass);
            this.config.set('enableTranslation', this.enableTranslation);
            if (this.enableTranslation && !this.configOptions.skipI18nQuestion) {
                this.config.set('nativeLanguage', this.nativeLanguage);
                this.config.set('languages', this.languages);
            }
            this.config.set('clientPackageManager', this.clientPackageManager);
        }
    },

    default: {

        getSharedConfigOptions: function () {
            if (this.configOptions.hibernateCache) {
                this.hibernateCache = this.configOptions.hibernateCache;
            }
            if (this.configOptions.websocket !== undefined) {
                this.websocket = this.configOptions.websocket;
            }
            if (this.configOptions.clientFramework) {
                this.clientFramework = this.configOptions.clientFramework;
            }
            if (this.configOptions.databaseType) {
                this.databaseType = this.configOptions.databaseType;
            }
            if (this.configOptions.devDatabaseType) {
                this.devDatabaseType = this.configOptions.devDatabaseType;
            }
            if (this.configOptions.prodDatabaseType) {
                this.prodDatabaseType = this.configOptions.prodDatabaseType;
            }
            if (this.configOptions.messageBroker !== undefined) {
                this.messageBroker = this.configOptions.messageBroker;
            }
            if (this.configOptions.searchEngine !== undefined) {
                this.searchEngine = this.configOptions.searchEngine;
            }
            if (this.configOptions.buildTool) {
                this.buildTool = this.configOptions.buildTool;
            }
            if (this.configOptions.enableSocialSignIn !== undefined) {
                this.enableSocialSignIn = this.configOptions.enableSocialSignIn;
            }
            if (this.configOptions.authenticationType) {
                this.authenticationType = this.configOptions.authenticationType;
            }
            if (this.configOptions.testFrameworks) {
                this.testFrameworks = this.configOptions.testFrameworks;
            }
            this.protractorTests = this.testFrameworks.indexOf('protractor') !== -1;

            if (this.configOptions.enableTranslation !== undefined) {
                this.enableTranslation = this.configOptions.enableTranslation;
            }
            if (this.configOptions.nativeLanguage !== undefined) {
                this.nativeLanguage = this.configOptions.nativeLanguage;
            }
            if (this.configOptions.languages !== undefined) {
                this.languages = this.configOptions.languages;
            }

            if(this.configOptions.uaaBaseName !== undefined) {
                this.uaaBaseName = this.configOptions.uaaBaseName;
            }

            // Make dist dir available in templates
            if (this.configOptions.buildTool === 'maven') {
                this.BUILD_DIR = 'target/';
            } else {
                this.BUILD_DIR = 'build/';
            }
            this.DIST_DIR = this.BUILD_DIR + constants.CLIENT_DIST_DIR;
        },

        composeLanguages: function () {
            if (this.configOptions.skipI18nQuestion) return;

            this.composeLanguagesSub(this, this.configOptions, 'client');
        }
    },

    writing: function () {
        if (this.clientFramework === 'angular1') {
            return writeAngularJsFiles.call(this);
        } else {
            return writeAngularFiles.call(this);
        }
    },

    install: function () {

        let logMsg =
            'To install your dependencies manually, run: ' + chalk.yellow.bold(this.clientPackageManager + ' install');

        if (this.clientFramework === 'angular1') {
            logMsg =
                'To install your dependencies manually, run: ' + chalk.yellow.bold(this.clientPackageManager + ' install & bower install');
        }

        let injectDependenciesAndConstants = () => {
            if (this.options['skip-install']) {
                this.log(logMsg);
            } else {
                if (this.clientFramework === 'angular1') {
                    this.spawnCommand('gulp', ['install']);
                }
            }
        };

        let installConfig = {
            bower: false,
            npm: true,
            callback: injectDependenciesAndConstants
        };

        if (this.clientFramework === 'angular1') {
            installConfig = {
                callback: injectDependenciesAndConstants
            };
        }

        if (!this.options['skip-install']) {
            if (this.clientPackageManager === 'yarn') {
                var nbRetry = 0;
                var maxRetry = 2;
                do {
                    if (nbRetry > 0) {
                        this.warning('yarn install failed. Retrying to launch yarn: ' + nbRetry + '/' + maxRetry + ' retries.');
                    }
                    var result = this.spawnCommandSync('yarn');
                    nbRetry++;
                } while(result.status !== 0 && nbRetry <= maxRetry);
                if (result.status !== 0) {
                    this.error('yarn install failed.');
                }
                if (this.clientFramework === 'angular1') {
                    this.spawnCommandSync('bower', ['install']);
                }
                injectDependenciesAndConstants();

            } else if (this.clientPackageManager === 'npm') {
                this.installDependencies(installConfig);
            }
        } else {
            injectDependenciesAndConstants();
        }
    },

    end: function () {
        this.log(chalk.green.bold('\nClient application generated successfully.\n'));

        let logMsg =
            'Start your Webpack development server with:' +
            '\n ' + chalk.yellow.bold(this.clientPackageManager + ' start') +
            '\n';

        if (this.clientFramework === 'angular1') {
            logMsg =
                'Inject your front end dependencies into your source code:' +
                '\n ' + chalk.yellow.bold('gulp inject') +
                '\n' +
                '\nGenerate the AngularJS constants:' +
                '\n ' + chalk.yellow.bold('gulp ngconstant:dev') +
                (this.useSass ?
                '\n' +
                '\nCompile your Sass style sheets:' +
                '\n ' + chalk.yellow.bold('gulp sass') : '') +
                '\n' +
                '\nOr do all of the above:' +
                '\n ' + chalk.yellow.bold('gulp install') +
                '\n';
        }
        this.log(chalk.green(logMsg));
    }
});
