'use strict';
var util = require('util'),
    generators = require('yeoman-generator'),
    chalk = require('chalk'),
    _ = require('lodash'),
    scriptBase = require('../generator-base'),
    prompts = require('./prompts'),
    mkdirp = require('mkdirp'),
    packagejs = require('../../package.json');

var JhipsterClientGenerator = generators.Base.extend({});

util.inherits(JhipsterClientGenerator, scriptBase);

/* Constants use throughout */
const constants = require('../generator-constants'),
    QUESTIONS = constants.CLIENT_QUESTIONS,
    DIST_DIR = constants.CLIENT_DIST_DIR,
    MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR,
    TEST_SRC_DIR = constants.CLIENT_TEST_SRC_DIR,
    ANGULAR_DIR = constants.ANGULAR_DIR;

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
        this.jhiPrefix = this.configOptions.jhiPrefix || this.config.get('jhiPrefix') || this.options['jhi-prefix'];
        this.jhiPrefixCapitalized = _.upperFirst(this.jhiPrefix);
        this.testFrameworks = [];
        this.options['protractor'] && this.testFrameworks.push('protractor');
        this.currentQuestion = this.configOptions.lastQuestion ? this.configOptions.lastQuestion : 0;
        this.totalQuestions = this.configOptions.totalQuestions ? this.configOptions.totalQuestions : QUESTIONS;
        this.baseName = this.configOptions.baseName;
        this.logo = this.configOptions.logo;
    },

    initializing: {
        displayLogo: function () {
            if (this.logo) {
                this.printJHipsterLogo();
            }
        },

        setupClientVars: function () {
            // Make constants available in templates
            this.MAIN_SRC_DIR = MAIN_SRC_DIR;
            this.TEST_SRC_DIR = TEST_SRC_DIR;

            this.serverPort = this.config.get('serverPort') || this.configOptions.serverPort || 8080;
            this.applicationType = this.config.get('applicationType') || this.configOptions.applicationType;
            if (!this.applicationType) {
                this.applicationType = 'monolith';
            }
            this.useSass = this.config.get('useSass');
            this.enableTranslation = this.config.get('enableTranslation'); // this is enabled by default to avoid conflicts for existing applications
            this.nativeLanguage = this.config.get('nativeLanguage');
            this.languages = this.config.get('languages');
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
        }
    },

    prompting: {

        askForModuleName: prompts.askForModuleName,

        askForClientSideOpts: prompts.askForClientSideOpts,

        askFori18n: prompts.askFori18n,

        setSharedConfigOptions: function () {
            this.configOptions.lastQuestion = this.currentQuestion;
            this.configOptions.totalQuestions = this.totalQuestions;
            this.configOptions.useSass = this.useSass;
        }

    },

    configuring: {
        insight: function () {
            var insight = this.insight();
            insight.trackWithEvent('generator', 'client');
            insight.track('app/useSass', this.useSass);
            insight.track('app/enableTranslation', this.enableTranslation);
            insight.track('app/nativeLanguage', this.nativeLanguage);
            insight.track('app/languages', this.languages);
        },

        configureGlobal: function () {
            // Application name modified, using each technology's conventions
            this.angularAppName = this.getAngularAppName();
            this.camelizedBaseName = _.camelCase(this.baseName);
            this.capitalizedBaseName = _.upperFirst(this.baseName);
            this.dasherizedBaseName = _.kebabCase(this.baseName);
            this.lowercaseBaseName = this.baseName.toLowerCase();
            if (!this.nativeLanguage) {
                // set to english when translation is set to false
                this.nativeLanguage = 'en';
            }
        },

        saveConfig: function () {
            this.config.set('useSass', this.useSass);
            this.config.set('enableTranslation', this.enableTranslation);
            if (this.enableTranslation && !this.configOptions.skipI18nQuestion) {
                this.config.set('nativeLanguage', this.nativeLanguage);
                this.config.set('languages', this.languages);
            }
        }
    },

    default: {

        getSharedConfigOptions: function () {
            if (this.configOptions.hibernateCache) {
                this.hibernateCache = this.configOptions.hibernateCache;
            }
            if (this.configOptions.websocket) {
                this.websocket = this.configOptions.websocket;
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
            if (this.configOptions.searchEngine) {
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
            this.DIST_DIR = this.BUILD_DIR + DIST_DIR;
        },

        composeLanguages: function () {
            if (this.configOptions.skipI18nQuestion) return;

            this.composeLanguagesSub(this, this.configOptions, 'client');
        }
    },

    writing: {

        writeCommonFiles: function () {
            this.template('_package.json', 'package.json', this, {});
            this.template('_bower.json', 'bower.json', this, {});
            this.template('_tsconfig.json', 'tsconfig.json', this, {});
            this.template('typings.json', 'typings.json', this, {});
            this.template('_bowerrc', '.bowerrc', this, {});
            this.template('_eslintrc.json', '.eslintrc.json', this, {});
            this.template('_eslintignore', '.eslintignore', this, {});
            this.template('_gulpfile.js', 'gulpfile.js', this, {});
            this.fs.copy(this.templatePath('gulp/_handleErrors.js'), this.destinationPath('gulp/handleErrors.js')); // to avoid interpolate errors
            this.template('gulp/_utils.js', 'gulp/utils.js', this, {});
            this.template('gulp/_serve.js', 'gulp/serve.js', this, {});
            this.template('gulp/_config.js', 'gulp/config.js', this, {});
            this.template('gulp/_build.js', 'gulp/build.js', this, {});
            this.template('gulp/_copy.js', 'gulp/copy.js', this, {});
            this.template('gulp/_inject.js', 'gulp/inject.js', this, {});
        },

        writeCssFiles: function () {
            // normal CSS or SCSS?
            if (this.useSass) {
                this.template(MAIN_SRC_DIR + 'scss/main.scss', MAIN_SRC_DIR + 'scss/main.scss');
                this.template(MAIN_SRC_DIR + 'scss/vendor.scss', MAIN_SRC_DIR + 'scss/vendor.scss');
            }
            // this css file will be overwritten by the sass generated css if sass is enabled
            // but this will avoid errors when running app without running sass task first
            this.template(MAIN_SRC_DIR + 'content/css/main.css', MAIN_SRC_DIR + 'content/css/main.css');
            this.copy(MAIN_SRC_DIR + 'content/css/documentation.css', MAIN_SRC_DIR + 'content/css/documentation.css');
        },

        writeCommonWebFiles: function () {
            // Create Webapp
            mkdirp(MAIN_SRC_DIR);

            // HTML5 BoilerPlate
            this.copy(MAIN_SRC_DIR + 'favicon.ico', MAIN_SRC_DIR + 'favicon.ico');
            this.copy(MAIN_SRC_DIR + 'robots.txt', MAIN_SRC_DIR + 'robots.txt');
            this.copy(MAIN_SRC_DIR + '404.html', MAIN_SRC_DIR + '404.html');
        },

        writeSwaggerFiles: function () {
            // Swagger-ui for Jhipster
            this.template(MAIN_SRC_DIR + 'swagger-ui/_index.html', MAIN_SRC_DIR + 'swagger-ui/index.html', this, {});
            this.copy(MAIN_SRC_DIR + 'swagger-ui/images/throbber.gif', MAIN_SRC_DIR + 'swagger-ui/images/throbber.gif');
        },

        writeAngularAppFiles: function () {
            this.copyHtml(MAIN_SRC_DIR + '_index.html', MAIN_SRC_DIR + 'index.html');
            this.copy(MAIN_SRC_DIR + 'system.config.js', MAIN_SRC_DIR + 'system.config.js');

            // Angular JS module
            this.template(ANGULAR_DIR + '_upgrade_adapter.ts', ANGULAR_DIR + 'upgrade_adapter.ts', this, {});
            this.template(ANGULAR_DIR + '_app.main.ts', ANGULAR_DIR + 'app.main.ts', this, {});
            this.template(ANGULAR_DIR + '_app.module.ts', ANGULAR_DIR + 'app.module.ts', this, {});
            this.template(ANGULAR_DIR + '_app.state.ts', ANGULAR_DIR + 'app.state.ts', this, {});
            this.template(ANGULAR_DIR + '_app.constants.ts', ANGULAR_DIR + 'app.constants.ts', this, {});
            this.template(ANGULAR_DIR + 'blocks/handlers/_state.handler.ts', ANGULAR_DIR + 'blocks/handlers/state.handler.ts', this, {});
            if (this.enableTranslation) {
                this.template(ANGULAR_DIR + 'blocks/handlers/_translation.handler.ts', ANGULAR_DIR + 'blocks/handlers/translation.handler.ts', this, {});
                this.template(ANGULAR_DIR + 'blocks/config/_translation.config.ts', ANGULAR_DIR + 'blocks/config/translation.config.ts', this, {});
                this.template(ANGULAR_DIR + 'blocks/config/_translation-storage.provider.ts', ANGULAR_DIR + 'blocks/config/translation-storage.provider.ts', this, {});
            }
            this.template(ANGULAR_DIR + 'blocks/config/_alert.config.ts', ANGULAR_DIR + 'blocks/config/alert.config.ts', this, {});
            this.template(ANGULAR_DIR + 'blocks/config/_http.config.ts', ANGULAR_DIR + 'blocks/config/http.config.ts', this, {});
            this.template(ANGULAR_DIR + 'blocks/config/_localstorage.config.ts', ANGULAR_DIR + 'blocks/config/localstorage.config.ts', this, {});
            this.template(ANGULAR_DIR + 'blocks/config/_compile.config.ts', ANGULAR_DIR + 'blocks/config/compile.config.ts', this, {});
            this.template(ANGULAR_DIR + 'blocks/config/_uib-pager.config.ts', ANGULAR_DIR + 'blocks/config/uib-pager.config.ts', this, {});
            this.template(ANGULAR_DIR + 'blocks/config/_uib-pagination.config.ts', ANGULAR_DIR + 'blocks/config/uib-pagination.config.ts', this, {});
        },

        writeAngularAuthFiles: function () {
            // account module
            this.template(ANGULAR_DIR + 'account/_account.module.ts', ANGULAR_DIR + 'account/account.module.ts', this, {});
            this.template(ANGULAR_DIR + 'account/_account.state.ts', ANGULAR_DIR + 'account/account.state.ts', this, {});
            this.copyHtml(ANGULAR_DIR + 'account/activate/activate.html', ANGULAR_DIR + 'account/activate/activate.html');
            this.copyJs(ANGULAR_DIR + 'account/activate/_activate.state.ts', ANGULAR_DIR + 'account/activate/activate.state.ts', this, {});
            this.template(ANGULAR_DIR + 'account/activate/_activate.controller.ts', ANGULAR_DIR + 'account/activate/activate.controller.ts', this, {});
            this.template(ANGULAR_DIR + 'account/activate/_activate.service.ts', ANGULAR_DIR + 'account/activate/activate.service.ts', this, {});
            this.copyHtml(ANGULAR_DIR + 'account/password/password.html', ANGULAR_DIR + 'account/password/password.html');
            this.copyJs(ANGULAR_DIR + 'account/password/_password.state.ts', ANGULAR_DIR + 'account/password/password.state.ts', this, {});
            this.template(ANGULAR_DIR + 'account/password/_password.controller.ts', ANGULAR_DIR + 'account/password/password.controller.ts', this, {});
            this.template(ANGULAR_DIR + 'account/password/_password.service.ts', ANGULAR_DIR + 'account/password/password.service.ts', this, {});
            this.template(ANGULAR_DIR + 'account/password/_password-strength-bar.directive.ts', ANGULAR_DIR + 'account/password/password-strength-bar.directive.ts', this, {});
            this.copyHtml(ANGULAR_DIR + 'account/register/register.html', ANGULAR_DIR + 'account/register/register.html');
            this.copyJs(ANGULAR_DIR + 'account/register/_register.state.ts', ANGULAR_DIR + 'account/register/register.state.ts', this, {});
            this.template(ANGULAR_DIR + 'account/register/_register.controller.ts', ANGULAR_DIR + 'account/register/register.controller.ts', this, {});
            this.template(ANGULAR_DIR + 'account/register/_register.service.ts', ANGULAR_DIR + 'account/register/register.service.ts', this, {});
            this.copyHtml(ANGULAR_DIR + 'account/reset/request/reset-request.html', ANGULAR_DIR + 'account/reset/request/reset-request.html');
            this.copyJs(ANGULAR_DIR + 'account/reset/request/_reset-request.state.ts', ANGULAR_DIR + 'account/reset/request/reset-request.state.ts', this, {});
            this.template(ANGULAR_DIR + 'account/reset/request/_reset-request.controller.ts', ANGULAR_DIR + 'account/reset/request/reset-request.controller.ts', this, {});
            this.template(ANGULAR_DIR + 'account/reset/request/_reset-request.service.ts', ANGULAR_DIR + 'account/reset/request/reset-request.service.ts', this, {});
            this.copyHtml(ANGULAR_DIR + 'account/reset/finish/reset-finish.html', ANGULAR_DIR + 'account/reset/finish/reset-finish.html');
            this.copyJs(ANGULAR_DIR + 'account/reset/finish/_reset-finish.state.ts', ANGULAR_DIR + 'account/reset/finish/reset-finish.state.ts', this, {});
            this.template(ANGULAR_DIR + 'account/reset/finish/_reset-finish.controller.ts', ANGULAR_DIR + 'account/reset/finish/reset-finish.controller.ts', this, {});
            this.template(ANGULAR_DIR + 'account/reset/finish/_reset-finish.service.ts', ANGULAR_DIR + 'account/reset/finish/reset-finish.service.ts', this, {});
            if (this.authenticationType === 'session') {
                this.copyHtml(ANGULAR_DIR + 'account/sessions/sessions.html', ANGULAR_DIR + 'account/sessions/sessions.html');
                this.copyJs(ANGULAR_DIR + 'account/sessions/_sessions.state.ts', ANGULAR_DIR + 'account/sessions/sessions.state.ts', this, {});
                this.template(ANGULAR_DIR + 'account/sessions/_sessions.controller.ts', ANGULAR_DIR + 'account/sessions/sessions.controller.ts', this, {});
                this.template(ANGULAR_DIR + 'account/sessions/_sessions.service.ts', ANGULAR_DIR + 'account/sessions/sessions.service.ts', this, {});
            }
            this.copyHtml(ANGULAR_DIR + 'account/settings/settings.html', ANGULAR_DIR + 'account/settings/settings.html');
            this.copyJs(ANGULAR_DIR + 'account/settings/_settings.state.ts', ANGULAR_DIR + 'account/settings/settings.state.ts', this, {});
            this.template(ANGULAR_DIR + 'account/settings/_settings.controller.ts', ANGULAR_DIR + 'account/settings/settings.controller.ts', this, {});
            // Social
            if (this.enableSocialSignIn) {
                this.copyHtml(ANGULAR_DIR + 'account/social/directive/_social.html', ANGULAR_DIR + 'account/social/directive/social.html');
                this.template(ANGULAR_DIR + 'account/social/directive/_social.directive.ts', ANGULAR_DIR + 'account/social/directive/social.directive.ts', this, {});
                this.copyHtml(ANGULAR_DIR + 'account/social/_social-register.html', ANGULAR_DIR + 'account/social/social-register.html');
                this.template(ANGULAR_DIR + 'account/social/_social-register.controller.ts', ANGULAR_DIR + 'account/social/social-register.controller.ts', this, {});
                this.template(ANGULAR_DIR + 'account/social/_social.service.ts', ANGULAR_DIR + 'account/social/social.service.ts', this, {});
                this.copyJs(ANGULAR_DIR + 'account/social/_social.state.ts', ANGULAR_DIR + 'account/social/social.state.ts', this, {});

                if (this.authenticationType === 'jwt') {
                    this.template(ANGULAR_DIR + 'account/social/_social-auth.controller.ts', ANGULAR_DIR + 'account/social/social-auth.controller.ts', this, {});
                }
            }
        },

        writeAngularAdminModuleFiles: function () {
            // admin modules
            this.template(ANGULAR_DIR + 'admin/_admin.module.ts', ANGULAR_DIR + 'admin/admin.module.ts', this, {});
            this.template(ANGULAR_DIR + 'admin/_admin.state.ts', ANGULAR_DIR + 'admin/admin.state.ts', this, {});
            this.copyHtml(ANGULAR_DIR + 'admin/audits/audits.html', ANGULAR_DIR + 'admin/audits/audits.html');
            this.copyJs(ANGULAR_DIR + 'admin/audits/_audits.state.ts', ANGULAR_DIR + 'admin/audits/audits.state.ts', this, {});
            this.template(ANGULAR_DIR + 'admin/audits/_audits.controller.ts', ANGULAR_DIR + 'admin/audits/audits.controller.ts', this, {});
            this.template(ANGULAR_DIR + 'admin/audits/_audits.service.ts', ANGULAR_DIR + 'admin/audits/audits.service.ts', this, {});
            this.copyHtml(ANGULAR_DIR + 'admin/configuration/configuration.html', ANGULAR_DIR + 'admin/configuration/configuration.html');
            this.copyJs(ANGULAR_DIR + 'admin/configuration/_configuration.state.ts', ANGULAR_DIR + 'admin/configuration/configuration.state.ts', this, {});
            this.template(ANGULAR_DIR + 'admin/configuration/_configuration.controller.ts', ANGULAR_DIR + 'admin/configuration/configuration.controller.ts', this, {});
            this.template(ANGULAR_DIR + 'admin/configuration/_configuration.service.ts', ANGULAR_DIR + 'admin/configuration/configuration.service.ts', this, {});
            this.copy(ANGULAR_DIR + 'admin/docs/docs.html', ANGULAR_DIR + 'admin/docs/docs.html');
            this.copyJs(ANGULAR_DIR + 'admin/docs/_docs.state.ts', ANGULAR_DIR + 'admin/docs/docs.state.ts', this, {});
            this.copyHtml(ANGULAR_DIR + 'admin/health/health.html', ANGULAR_DIR + 'admin/health/health.html');
            this.copyHtml(ANGULAR_DIR + 'admin/health/_health-modal.html', ANGULAR_DIR + 'admin/health/health-modal.html');
            this.copyJs(ANGULAR_DIR + 'admin/health/_health.state.ts', ANGULAR_DIR + 'admin/health/health.state.ts', this, {});
            this.template(ANGULAR_DIR + 'admin/health/_health.controller.ts', ANGULAR_DIR + 'admin/health/health.controller.ts', this, {});
            this.template(ANGULAR_DIR + 'admin/health/_health-modal.controller.ts', ANGULAR_DIR + 'admin/health/health-modal.controller.ts', this, {});
            this.template(ANGULAR_DIR + 'admin/health/_health.service.ts', ANGULAR_DIR + 'admin/health/health.service.ts', this, {});
            this.copyHtml(ANGULAR_DIR + 'admin/logs/logs.html', ANGULAR_DIR + 'admin/logs/logs.html');
            this.copyJs(ANGULAR_DIR + 'admin/logs/_logs.state.ts', ANGULAR_DIR + 'admin/logs/logs.state.ts', this, {});
            this.template(ANGULAR_DIR + 'admin/logs/_logs.controller.ts', ANGULAR_DIR + 'admin/logs/logs.controller.ts', this, {});
            this.template(ANGULAR_DIR + 'admin/logs/_logs.service.ts', ANGULAR_DIR + 'admin/logs/logs.service.ts', this, {});
            this.copyHtml(ANGULAR_DIR + 'admin/metrics/_metrics.html', ANGULAR_DIR + 'admin/metrics/metrics.html', this, {}, true);
            this.copyHtml(ANGULAR_DIR + 'admin/metrics/_metrics-modal.html', ANGULAR_DIR + 'admin/metrics/metrics-modal.html', this, {}, true);
            this.copyJs(ANGULAR_DIR + 'admin/metrics/_metrics.state.ts', ANGULAR_DIR + 'admin/metrics/metrics.state.ts', this, {});
            this.template(ANGULAR_DIR + 'admin/metrics/_metrics.controller.ts', ANGULAR_DIR + 'admin/metrics/metrics.controller.ts', this, {});
            this.template(ANGULAR_DIR + 'admin/metrics/_metrics-modal.controller.ts', ANGULAR_DIR + 'admin/metrics/metrics-modal.controller.ts', this, {});
            this.template(ANGULAR_DIR + 'admin/metrics/_metrics.service.ts', ANGULAR_DIR + 'admin/metrics/metrics.service.ts', this, {});
            if (this.websocket === 'spring-websocket') {
                this.copyHtml(ANGULAR_DIR + 'admin/tracker/tracker.html', ANGULAR_DIR + 'admin/tracker/tracker.html');
                this.copyJs(ANGULAR_DIR + 'admin/tracker/_tracker.state.ts', ANGULAR_DIR + 'admin/tracker/tracker.state.ts', this, {});
                this.template(ANGULAR_DIR + 'admin/tracker/_tracker.controller.ts', ANGULAR_DIR + 'admin/tracker/tracker.controller.ts', this, {});
                this.template(ANGULAR_DIR + 'admin/tracker/_tracker.service.ts', ANGULAR_DIR + 'admin/tracker/tracker.service.ts', this, {});
            }
        },

        writeAngularUserMgmntFiles: function () {
            if (this.skipUserManagement) return;

            this.copyHtml(ANGULAR_DIR + 'admin/user-management/user-management.html', ANGULAR_DIR + 'admin/user-management/user-management.html');
            this.copyHtml(ANGULAR_DIR + 'admin/user-management/_user-management-detail.html', ANGULAR_DIR + 'admin/user-management/user-management-detail.html');
            this.copyHtml(ANGULAR_DIR + 'admin/user-management/_user-management-dialog.html', ANGULAR_DIR + 'admin/user-management/user-management-dialog.html');
            this.copyHtml(ANGULAR_DIR + 'admin/user-management/_user-management-delete-dialog.html', ANGULAR_DIR + 'admin/user-management/user-management-delete-dialog.html');
            this.copyJs(ANGULAR_DIR + 'admin/user-management/_user-management.state.ts', ANGULAR_DIR + 'admin/user-management/user-management.state.ts', this, {});
            this.template(ANGULAR_DIR + 'admin/user-management/_user-management.controller.ts', ANGULAR_DIR + 'admin/user-management/user-management.controller.ts', this, {});
            this.template(ANGULAR_DIR + 'admin/user-management/_user-management-detail.controller.ts', ANGULAR_DIR + 'admin/user-management/user-management-detail.controller.ts', this, {});
            this.template(ANGULAR_DIR + 'admin/user-management/_user-management-dialog.controller.ts', ANGULAR_DIR + 'admin/user-management/user-management-dialog.controller.ts', this, {});
            this.template(ANGULAR_DIR + 'admin/user-management/_user-management-delete-dialog.controller.ts', ANGULAR_DIR + 'admin/user-management/user-management-delete-dialog.controller.ts', this, {});
            this.template(ANGULAR_DIR + 'admin/user-management/_user.service.ts', ANGULAR_DIR + 'admin/user-management/user.service.ts', this, {});
        },

        writeAngularGatewayFiles: function () {
            if (this.applicationType !== 'gateway') return;

            this.copyHtml(ANGULAR_DIR + 'admin/gateway/gateway.html', ANGULAR_DIR + 'admin/gateway/gateway.html');
            this.copyJs(ANGULAR_DIR + 'admin/gateway/_gateway.state.ts', ANGULAR_DIR + 'admin/gateway/gateway.state.ts', this, {});
            this.copyJs(ANGULAR_DIR + 'admin/gateway/_gateway.controller.ts', ANGULAR_DIR + 'admin/gateway/gateway.controller.ts', this, {});
            this.copyJs(ANGULAR_DIR + 'admin/gateway/_gateway-routes.service.ts', ANGULAR_DIR + 'admin/gateway/gateway-routes.service.ts', this, {});
        },

        writeAngularComponentFiles: function () {
            this.template(ANGULAR_DIR + 'components/_common.module.ts', ANGULAR_DIR + 'components/common.module.ts', this, {});
            //components
            this.template(ANGULAR_DIR + 'components/form/_show-validation.directive.ts', ANGULAR_DIR + 'components/form/show-validation.directive.ts', this, {});
            this.template(ANGULAR_DIR + 'components/form/_maxbytes.directive.ts', ANGULAR_DIR + 'components/form/maxbytes.directive.ts', this, {});
            this.template(ANGULAR_DIR + 'components/form/_minbytes.directive.ts', ANGULAR_DIR + 'components/form/minbytes.directive.ts', this, {});
            this.template(ANGULAR_DIR + 'components/form/_pagination.constants.ts', ANGULAR_DIR + 'components/form/pagination.constants.ts', this, {});
            if (this.enableTranslation) {
                this.template(ANGULAR_DIR + 'components/language/_language.filter.ts', ANGULAR_DIR + 'components/language/language.filter.ts', this, {});
                this.template(ANGULAR_DIR + 'components/language/_language.constants.ts', ANGULAR_DIR + 'components/language/language.constants.ts', this, {});
                this.template(ANGULAR_DIR + 'components/language/_language.controller.ts', ANGULAR_DIR + 'components/language/language.controller.ts', this, {});
                this.template(ANGULAR_DIR + 'components/language/_language.service.ts', ANGULAR_DIR + 'components/language/language.service.ts', this, {});
            }
            this.copyHtml(ANGULAR_DIR + 'components/login/login.html', ANGULAR_DIR + 'components/login/login.html');
            this.copyJs(ANGULAR_DIR + 'components/login/_login.service.ts', ANGULAR_DIR + 'components/login/login.service.ts', this, {});
            this.template(ANGULAR_DIR + 'components/login/_login.controller.ts', ANGULAR_DIR + 'components/login/login.controller.ts', this, {});
            this.template(ANGULAR_DIR + 'components/util/_base64.service.ts', ANGULAR_DIR + 'components/util/base64.service.ts', this, {});
            this.template(ANGULAR_DIR + 'components/util/_capitalize.pipe.ts', ANGULAR_DIR + 'components/util/capitalize.pipe.ts', this, {});
            this.template(ANGULAR_DIR + 'components/util/_parse-links.service.ts', ANGULAR_DIR + 'components/util/parse-links.service.ts', this, {});
            this.template(ANGULAR_DIR + 'components/util/_truncate-characters.pipe.ts', ANGULAR_DIR + 'components/util/truncate-characters.pipe.ts', this, {});
            this.template(ANGULAR_DIR + 'components/util/_truncate-words.pipe.ts', ANGULAR_DIR + 'components/util/truncate-words.pipe.ts', this, {});
            this.template(ANGULAR_DIR + 'components/util/_date-util.service.ts', ANGULAR_DIR + 'components/util/date-util.service.ts', this, {});
            this.template(ANGULAR_DIR + 'components/util/_data-util.service.ts', ANGULAR_DIR + 'components/util/data-util.service.ts', this, {});
            this.template(ANGULAR_DIR + 'components/util/_pagination-util.service.ts', ANGULAR_DIR + 'components/util/pagination-util.service.ts', this, {});
            this.template(ANGULAR_DIR + 'components/util/_sort.directive.ts', ANGULAR_DIR + 'components/util/sort.directive.ts', this, {});
            this.template(ANGULAR_DIR + 'components/util/_sort-by.directive.ts', ANGULAR_DIR + 'components/util/sort-by.directive.ts', this, {});
            this.template(ANGULAR_DIR + 'components/util/_jhi-item-count.directive.ts', ANGULAR_DIR + 'components/util/jhi-item-count.directive.ts', this, {});

            // interceptor code
            if (this.authenticationType === 'oauth2' || this.authenticationType === 'jwt' || this.authenticationType === 'uaa') {
                this.template(ANGULAR_DIR + 'blocks/interceptor/_auth.interceptor.ts', ANGULAR_DIR + 'blocks/interceptor/auth.interceptor.ts', this, {});
            }
            this.template(ANGULAR_DIR + 'blocks/interceptor/_auth-expired.interceptor.ts', ANGULAR_DIR + 'blocks/interceptor/auth-expired.interceptor.ts', this, {});
            this.template(ANGULAR_DIR + 'blocks/interceptor/_errorhandler.interceptor.ts', ANGULAR_DIR + 'blocks/interceptor/errorhandler.interceptor.ts', this, {});
            this.template(ANGULAR_DIR + 'blocks/interceptor/_notification.interceptor.ts', ANGULAR_DIR + 'blocks/interceptor/notification.interceptor.ts', this, {});

            //alert service code
            this.template(ANGULAR_DIR + 'components/alert/_alert.service.ts', ANGULAR_DIR + 'components/alert/alert.service.ts', this, {});
            this.template(ANGULAR_DIR + 'components/alert/_alert.directive.ts', ANGULAR_DIR + 'components/alert/alert.directive.ts', this, {});
            this.template(ANGULAR_DIR + 'components/alert/_alert-error.directive.ts', ANGULAR_DIR + 'components/alert/alert-error.directive.ts', this, {});
        },

        writeAngularAuthServiceFiles: function () {
            // services
            this.template(ANGULAR_DIR + 'components/auth/_auth.service.ts', ANGULAR_DIR + 'components/auth/auth.service.ts', this, {});
            this.template(ANGULAR_DIR + 'components/auth/_principal.service.ts', ANGULAR_DIR + 'components/auth/principal.service.ts', this, {});
            this.template(ANGULAR_DIR + 'components/auth/_has-authority.directive.ts', ANGULAR_DIR + 'components/auth/has-authority.directive.ts', this, {});
            this.template(ANGULAR_DIR + 'components/auth/_has-any-authority.directive.ts', ANGULAR_DIR + 'components/auth/has-any-authority.directive.ts', this, {});
            if (this.authenticationType === 'oauth2') {
                this.template(ANGULAR_DIR + 'components/auth/_auth-oauth2.service.ts', ANGULAR_DIR + 'components/auth/auth-oauth2.service.ts', this, {});
            } else if (this.authenticationType === 'jwt' || this.authenticationType === 'uaa') {
                this.template(ANGULAR_DIR + 'components/auth/_auth-jwt.service.ts', ANGULAR_DIR + 'components/auth/auth-jwt.service.ts', this, {});
            } else {
                this.template(ANGULAR_DIR + 'components/auth/_auth-session.service.ts', ANGULAR_DIR + 'components/auth/auth-session.service.ts', this, {});
            }
            this.template(ANGULAR_DIR + 'components/auth/_account.service.ts', ANGULAR_DIR + 'components/auth/account.service.ts', this, {});

        },

        writeAngularMainFiles: function () {
            // entities
            this.template(ANGULAR_DIR + 'entities/_entity.module.ts', ANGULAR_DIR + 'entities/entity.module.ts', this, {});
            this.copyJs(ANGULAR_DIR + 'entities/_entity.state.ts', ANGULAR_DIR + 'entities/entity.state.ts', this, {});

            // home module
            this.copyHtml(ANGULAR_DIR + 'home/home.html', ANGULAR_DIR + 'home/home.html');
            this.copyJs(ANGULAR_DIR + 'home/_home.state.ts', ANGULAR_DIR + 'home/home.state.ts', this, {});
            this.template(ANGULAR_DIR + 'home/_home.controller.ts', ANGULAR_DIR + 'home/home.controller.ts', this, {});

            // layouts
            this.template(ANGULAR_DIR + 'layouts/navbar/_active-link.directive.ts', ANGULAR_DIR + 'layouts/navbar/active-link.directive.ts', this, {});
            if (this.enableTranslation) {
                this.template(ANGULAR_DIR + 'layouts/navbar/_active-menu.directive.ts', ANGULAR_DIR + 'layouts/navbar/active-menu.directive.ts', this, {});
            }
            this.copyHtml(ANGULAR_DIR + 'layouts/navbar/navbar.html', ANGULAR_DIR + 'layouts/navbar/navbar.html');
            this.template(ANGULAR_DIR + 'layouts/navbar/_navbar.controller.ts', ANGULAR_DIR + 'layouts/navbar/navbar.controller.ts', this, {});
            this.copyHtml(ANGULAR_DIR + 'layouts/error/error.html', ANGULAR_DIR + 'layouts/error/error.html');
            this.copyHtml(ANGULAR_DIR + 'layouts/error/accessdenied.html', ANGULAR_DIR + 'layouts/error/accessdenied.html');
            this.copyJs(ANGULAR_DIR + 'layouts/error/_error.state.ts', ANGULAR_DIR + 'layouts/error/error.state.ts', this, {});
        },

        writeAngularProfileServiceFiles: function () {
            // services
            this.template(ANGULAR_DIR + 'components/profiles/_profile.service.ts', ANGULAR_DIR + 'components/profiles/profile.service.ts', this, {});
            this.template(ANGULAR_DIR + 'components/profiles/_profile-info.ts', ANGULAR_DIR + 'components/profiles/profile-info.ts', this, {});
            this.template(ANGULAR_DIR + 'components/profiles/_page-ribbon.component.ts', ANGULAR_DIR + 'components/profiles/page-ribbon.component.ts', this, {});
        },

        writeImageFiles: function () {
            // Images
            this.copy(MAIN_SRC_DIR + 'content/images/hipster.png', MAIN_SRC_DIR + 'content/images/hipster.png');
            this.copy(MAIN_SRC_DIR + 'content/images/hipster2x.png', MAIN_SRC_DIR + 'content/images/hipster2x.png');
            this.copy(MAIN_SRC_DIR + 'content/images/logo-jhipster.png', MAIN_SRC_DIR + 'content/images/logo-jhipster.png');
        },

        writeClientTestFwFiles: function () {
            // Create Test Javascript files
            var testTemplates = [
                '_karma.conf.js',
                'spec/helpers/_module.js',
                'spec/helpers/_httpBackend.js',
                'spec/app/admin/health/_health.controller.spec.js',
                'spec/app/account/password/_password.controller.spec.js',
                'spec/app/account/password/_password-strength-bar.directive.spec.js',
                'spec/app/account/settings/_settings.controller.spec.js',
                'spec/app/account/activate/_activate.controller.spec.js',
                'spec/app/account/register/_register.controller.spec.js',
                'spec/app/account/reset/finish/_reset-finish.controller.spec.js',
                'spec/app/account/reset/request/_reset-request.controller.spec.js',
                'spec/app/services/auth/_auth.services.spec.js',
                'spec/app/components/login/_login.controller.spec.js'
            ];
            if (this.authenticationType === 'session') {
                testTemplates.push('spec/app/account/sessions/_sessions.controller.spec.js');
            }
            // Create Protractor test files
            if (this.testFrameworks.indexOf('protractor') !== -1) {
                testTemplates.push('e2e/account/_account.js');
                testTemplates.push('e2e/admin/_administration.js');
                testTemplates.push('_protractor.conf.js');
            }
            testTemplates.map(function (testTemplatePath) {
                this.template(TEST_SRC_DIR + testTemplatePath, TEST_SRC_DIR + testTemplatePath.replace(/_/, ''), this, {});
            }.bind(this));

        }

    },

    install: function () {
        var injectDependenciesAndConstants = function () {
            if (this.options['skip-install']) {
                this.log(
                    'After running ' + chalk.yellow.bold('npm install & bower install') + ' ...' +
                    '\n' +
                    '\nInject your front end dependencies into your source code:' +
                    '\n ' + chalk.yellow.bold('gulp inject') +
                    '\n' +
                    '\nGenerate the Angular constants:' +
                    '\n ' + chalk.yellow.bold('gulp ngconstant:dev') +
                    '\n' +
                    '\nCompile your Typescript files:' +
                    '\n ' + chalk.yellow.bold('gulp tscompile') +
                    (this.useSass ? '\n' +
                    '\nCompile your Sass style sheets:' +
                    '\n ' + chalk.yellow.bold('gulp sass') : '') +
                    '\n' +
                    '\nOr do all of the above:' +
                    '\n ' + chalk.yellow.bold('gulp install') +
                    '\n' +
                    '\nInstall Typescript typings:' +
                    '\n ' + chalk.yellow.bold('npm run typings install') +
                    '\n'
                );
            } else {
                this.spawnCommand('gulp', ['install']);
            }
        };
        if (!this.options['skip-install']) {
            this.installDependencies({
                callback: injectDependenciesAndConstants.bind(this)
            });
        } else {
            injectDependenciesAndConstants.call(this);
        }
    },

    end: function () {
        this.log(chalk.green.bold('\nClient app generated successfully.\n'));
    }

});
