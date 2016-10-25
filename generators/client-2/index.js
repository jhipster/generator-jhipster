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
            this.camelizedBaseName = _.camelCase(this.baseName);
            this.angularAppName = this.getAngularAppName();
            this.angular2AppName = _.upperFirst(this.camelizedBaseName);
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
            this.template('_bowerrc', '.bowerrc', this, {});
            this.template('_tslint.json', 'tslint.json', this, {});
            this.template('_eslintrc.json', '.eslintrc.json', this, {});
            this.template('_eslintignore', '.eslintignore', this, {});
            this.template('_gulpfile.js', 'gulpfile.js', this, {});
            this.fs.copy(this.templatePath('gulp/_handle-errors.js'), this.destinationPath('gulp/handle-errors.js')); // to avoid interpolate errors
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
                this.template(MAIN_SRC_DIR + 'scss/_main.scss', MAIN_SRC_DIR + 'scss/main.scss');
                this.template(MAIN_SRC_DIR + 'scss/_vendor.scss', MAIN_SRC_DIR + 'scss/vendor.scss');
            }
            // this css file will be overwritten by the sass generated css if sass is enabled
            // but this will avoid errors when running app without running sass task first
            this.template(MAIN_SRC_DIR + 'content/css/_main.css', MAIN_SRC_DIR + 'content/css/main.css');
            this.copy(MAIN_SRC_DIR + 'content/css/_documentation.css', MAIN_SRC_DIR + 'content/css/documentation.css');
        },

        writeCommonWebFiles: function () {
            // Create Webapp
            mkdirp(MAIN_SRC_DIR);

            // HTML5 BoilerPlate
            this.copy(MAIN_SRC_DIR + '_favicon.ico', MAIN_SRC_DIR + 'favicon.ico');
            this.copy(MAIN_SRC_DIR + '_robots.txt', MAIN_SRC_DIR + 'robots.txt');
            this.copy(MAIN_SRC_DIR + '_404.html', MAIN_SRC_DIR + '404.html');
        },

        writeSwaggerFiles: function () {
            // Swagger-ui for Jhipster
            this.template(MAIN_SRC_DIR + 'swagger-ui/_index.html', MAIN_SRC_DIR + 'swagger-ui/index.html', this, {});
            this.copy(MAIN_SRC_DIR + 'swagger-ui/images/_throbber.gif', MAIN_SRC_DIR + 'swagger-ui/images/throbber.gif');
        },

        writeAngularAppFiles: function () {
            this.copyHtml(MAIN_SRC_DIR + '_index.html', MAIN_SRC_DIR + 'index.html');
            this.copy(MAIN_SRC_DIR + '_system.config.js', MAIN_SRC_DIR + 'system.config.js');

            // Angular JS module
            this.template(ANGULAR_DIR + '_upgrade_adapter.ts', ANGULAR_DIR + 'upgrade_adapter.ts', this, {});
            this.template(ANGULAR_DIR + '_app.main.ts', ANGULAR_DIR + 'app.main.ts', this, {});
            this.template(ANGULAR_DIR + '_app.module.ts', ANGULAR_DIR + 'app.module.ts', this, {});
            this.template(ANGULAR_DIR + '_app.ng2module.ts', ANGULAR_DIR + 'app.ng2module.ts', this, {});
            this.template(ANGULAR_DIR + '_app.state.ts', ANGULAR_DIR + 'app.state.ts', this, {});
            this.template(ANGULAR_DIR + '_app.constants.ts', ANGULAR_DIR + 'app.constants.ts', this, {});
            this.template(ANGULAR_DIR + 'blocks/handlers/_state.handler.ts', ANGULAR_DIR + 'blocks/handlers/state.handler.ts', this, {});
            if (this.enableTranslation) {
                this.template(ANGULAR_DIR + 'blocks/config/_translation.config.ts', ANGULAR_DIR + 'blocks/config/translation.config.ts', this, {});
                this.template(ANGULAR_DIR + 'blocks/config/_translation-storage.provider.ts', ANGULAR_DIR + 'blocks/config/translation-storage.provider.ts', this, {});
            }
            this.template(ANGULAR_DIR + 'blocks/config/_http.config.ts', ANGULAR_DIR + 'blocks/config/http.config.ts', this, {});
            this.template(ANGULAR_DIR + 'blocks/config/_localstorage.config.ts', ANGULAR_DIR + 'blocks/config/localstorage.config.ts', this, {});
            this.template(ANGULAR_DIR + 'blocks/config/_compile.config.ts', ANGULAR_DIR + 'blocks/config/compile.config.ts', this, {});
            this.template(ANGULAR_DIR + 'blocks/config/_uib-pager.config.ts', ANGULAR_DIR + 'blocks/config/uib-pager.config.ts', this, {});
            this.template(ANGULAR_DIR + 'blocks/config/_uib-pagination.config.ts', ANGULAR_DIR + 'blocks/config/uib-pagination.config.ts', this, {});
            this.template(ANGULAR_DIR + 'blocks/config/_ui-router-defer-intercept.config.ts', ANGULAR_DIR + 'blocks/config/ui-router-defer-intercept.config.ts', this, {});
        },

        writeAngularAuthFiles: function () {
            // account module
            this.template(ANGULAR_DIR + 'account/_index.ts', ANGULAR_DIR + 'account/index.ts', this, {});
            this.template(ANGULAR_DIR + 'account/_account.module.ts', ANGULAR_DIR + 'account/account.module.ts', this, {});
            this.template(ANGULAR_DIR + 'account/_account.ng2module.ts', ANGULAR_DIR + 'account/account.ng2module.ts', this, {});
            this.template(ANGULAR_DIR + 'account/_account.state.ts', ANGULAR_DIR + 'account/account.state.ts', this, {});
            this.copyHtml(ANGULAR_DIR + 'account/activate/_activate.html', ANGULAR_DIR + 'account/activate/activate.html');
            this.copyJs(ANGULAR_DIR + 'account/activate/_activate.state.ts', ANGULAR_DIR + 'account/activate/activate.state.ts', this, {});
            this.template(ANGULAR_DIR + 'account/activate/_activate.component.ts', ANGULAR_DIR + 'account/activate/activate.component.ts', this, {});
            this.template(ANGULAR_DIR + 'account/activate/_activate.service.ts', ANGULAR_DIR + 'account/activate/activate.service.ts', this, {});
            this.copyHtml(ANGULAR_DIR + 'account/password/_password.html', ANGULAR_DIR + 'account/password/password.html');
            this.copyJs(ANGULAR_DIR + 'account/password/_password.state.ts', ANGULAR_DIR + 'account/password/password.state.ts', this, {});
            this.template(ANGULAR_DIR + 'account/password/_password.component.ts', ANGULAR_DIR + 'account/password/password.component.ts', this, {});
            this.template(ANGULAR_DIR + 'account/password/_password.service.ts', ANGULAR_DIR + 'account/password/password.service.ts', this, {});
            this.template(ANGULAR_DIR + 'account/password/_password-strength-bar.component.ts', ANGULAR_DIR + 'account/password/password-strength-bar.component.ts', this, {});
            this.copyHtml(ANGULAR_DIR + 'account/register/_register.html', ANGULAR_DIR + 'account/register/register.html');
            this.copyJs(ANGULAR_DIR + 'account/register/_register.state.ts', ANGULAR_DIR + 'account/register/register.state.ts', this, {});
            this.template(ANGULAR_DIR + 'account/register/_register.component.ts', ANGULAR_DIR + 'account/register/register.component.ts', this, {});
            this.template(ANGULAR_DIR + 'account/register/_register.service.ts', ANGULAR_DIR + 'account/register/register.service.ts', this, {});
            this.copyHtml(ANGULAR_DIR + 'account/password-reset/init/_password-reset-init.html', ANGULAR_DIR + 'account/password-reset/init/password-reset-init.html');
            this.copyJs(ANGULAR_DIR + 'account/password-reset/init/_password-reset-init.state.ts', ANGULAR_DIR + 'account/password-reset/init/password-reset-init.state.ts', this, {});
            this.template(ANGULAR_DIR + 'account/password-reset/init/_password-reset-init.component.ts', ANGULAR_DIR + 'account/password-reset/init/password-reset-init.component.ts', this, {});
            this.template(ANGULAR_DIR + 'account/password-reset/init/_password-reset-init.service.ts', ANGULAR_DIR + 'account/password-reset/init/password-reset-init.service.ts', this, {});
            this.copyHtml(ANGULAR_DIR + 'account/password-reset/finish/_password-reset-finish.html', ANGULAR_DIR + 'account/password-reset/finish/password-reset-finish.html');
            this.copyJs(ANGULAR_DIR + 'account/password-reset/finish/_password-reset-finish.state.ts', ANGULAR_DIR + 'account/password-reset/finish/password-reset-finish.state.ts', this, {});
            this.template(ANGULAR_DIR + 'account/password-reset/finish/_password-reset-finish.component.ts', ANGULAR_DIR + 'account/password-reset/finish/password-reset-finish.component.ts', this, {});
            this.template(ANGULAR_DIR + 'account/password-reset/finish/_password-reset-finish.service.ts', ANGULAR_DIR + 'account/password-reset/finish/password-reset-finish.service.ts', this, {});
            if (this.authenticationType === 'session') {
                this.copyHtml(ANGULAR_DIR + 'account/sessions/_sessions.html', ANGULAR_DIR + 'account/sessions/sessions.html');
                this.copyJs(ANGULAR_DIR + 'account/sessions/_sessions.state.ts', ANGULAR_DIR + 'account/sessions/sessions.state.ts', this, {});
                this.template(ANGULAR_DIR + 'account/sessions/_sessions.component.ts', ANGULAR_DIR + 'account/sessions/sessions.component.ts', this, {});
                this.template(ANGULAR_DIR + 'account/sessions/_sessions.service.ts', ANGULAR_DIR + 'account/sessions/sessions.service.ts', this, {});
                this.template(ANGULAR_DIR + 'account/sessions/_session.model.ts', ANGULAR_DIR + 'account/sessions/session.model.ts', this, {});
            }
            this.copyHtml(ANGULAR_DIR + 'account/settings/_settings.html', ANGULAR_DIR + 'account/settings/settings.html');
            this.copyJs(ANGULAR_DIR + 'account/settings/_settings.state.ts', ANGULAR_DIR + 'account/settings/settings.state.ts', this, {});
            this.template(ANGULAR_DIR + 'account/settings/_settings.component.ts', ANGULAR_DIR + 'account/settings/settings.component.ts', this, {});
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
            this.template(ANGULAR_DIR + 'admin/_index.ts', ANGULAR_DIR + 'admin/index.ts', this, {});
            this.template(ANGULAR_DIR + 'admin/_admin.module.ts', ANGULAR_DIR + 'admin/admin.module.ts', this, {});
            this.template(ANGULAR_DIR + 'admin/_admin.ng2module.ts', ANGULAR_DIR + 'admin/admin.ng2module.ts', this, {});
            this.template(ANGULAR_DIR + 'admin/_admin.state.ts', ANGULAR_DIR + 'admin/admin.state.ts', this, {});
            this.copyHtml(ANGULAR_DIR + 'admin/audits/_audits.component.html', ANGULAR_DIR + 'admin/audits/audits.component.html');
            this.copyJs(ANGULAR_DIR + 'admin/audits/_audits.state.ts', ANGULAR_DIR + 'admin/audits/audits.state.ts', this, {});
            this.template(ANGULAR_DIR + 'admin/audits/_audit-data.model.ts', ANGULAR_DIR + 'admin/audits/audit-data.model.ts', this, {});
            this.template(ANGULAR_DIR + 'admin/audits/_audit.model.ts', ANGULAR_DIR + 'admin/audits/audit.model.ts', this, {});
            this.template(ANGULAR_DIR + 'admin/audits/_audits.component.ts', ANGULAR_DIR + 'admin/audits/audits.component.ts', this, {});
            this.template(ANGULAR_DIR + 'admin/audits/_audits.service.ts', ANGULAR_DIR + 'admin/audits/audits.service.ts', this, {});
            this.copyHtml(ANGULAR_DIR + 'admin/configuration/_configuration.html', ANGULAR_DIR + 'admin/configuration/configuration.html');
            this.copyJs(ANGULAR_DIR + 'admin/configuration/_configuration.state.ts', ANGULAR_DIR + 'admin/configuration/configuration.state.ts', this, {});
            this.template(ANGULAR_DIR + 'admin/configuration/_configuration.component.ts', ANGULAR_DIR + 'admin/configuration/configuration.component.ts', this, {});
            this.template(ANGULAR_DIR + 'admin/configuration/_configuration.service.ts', ANGULAR_DIR + 'admin/configuration/configuration.service.ts', this, {});
            this.copy(ANGULAR_DIR + 'admin/docs/_docs.html', ANGULAR_DIR + 'admin/docs/docs.html');
            this.template(ANGULAR_DIR + 'admin/docs/_docs.component.ts', ANGULAR_DIR + 'admin/docs/docs.component.ts', this, {});
            this.copyJs(ANGULAR_DIR + 'admin/docs/_docs.state.ts', ANGULAR_DIR + 'admin/docs/docs.state.ts', this, {});
            this.copyHtml(ANGULAR_DIR + 'admin/health/_health.html', ANGULAR_DIR + 'admin/health/health.html');
            this.copyHtml(ANGULAR_DIR + 'admin/health/_health-modal.html', ANGULAR_DIR + 'admin/health/health-modal.html');
            this.copyJs(ANGULAR_DIR + 'admin/health/_health.state.ts', ANGULAR_DIR + 'admin/health/health.state.ts', this, {});
            this.template(ANGULAR_DIR + 'admin/health/_health.component.ts', ANGULAR_DIR + 'admin/health/health.component.ts', this, {});
            this.template(ANGULAR_DIR + 'admin/health/_health-modal.component.ts', ANGULAR_DIR + 'admin/health/health-modal.component.ts', this, {});
            this.template(ANGULAR_DIR + 'admin/health/_health.service.ts', ANGULAR_DIR + 'admin/health/health.service.ts', this, {});
            this.copyHtml(ANGULAR_DIR + 'admin/logs/_logs.html', ANGULAR_DIR + 'admin/logs/logs.html');
            this.copyJs(ANGULAR_DIR + 'admin/logs/_logs.state.ts', ANGULAR_DIR + 'admin/logs/logs.state.ts', this, {});
            this.template(ANGULAR_DIR + 'admin/logs/_logs.component.ts', ANGULAR_DIR + 'admin/logs/logs.component.ts', this, {});
            this.template(ANGULAR_DIR + 'admin/logs/_log.model.ts', ANGULAR_DIR + 'admin/logs/log.model.ts', this, {});
            this.template(ANGULAR_DIR + 'admin/logs/_logs.service.ts', ANGULAR_DIR + 'admin/logs/logs.service.ts', this, {});
            this.copyHtml(ANGULAR_DIR + 'admin/metrics/_metrics.html', ANGULAR_DIR + 'admin/metrics/metrics.html', this, {}, true);
            this.copyHtml(ANGULAR_DIR + 'admin/metrics/_metrics-modal.html', ANGULAR_DIR + 'admin/metrics/metrics-modal.html', this, {}, true);
            this.copyJs(ANGULAR_DIR + 'admin/metrics/_metrics.state.ts', ANGULAR_DIR + 'admin/metrics/metrics.state.ts', this, {});
            this.template(ANGULAR_DIR + 'admin/metrics/_metrics.component.ts', ANGULAR_DIR + 'admin/metrics/metrics.component.ts', this, {});
            this.template(ANGULAR_DIR + 'admin/metrics/_metrics-modal.component.ts', ANGULAR_DIR + 'admin/metrics/metrics-modal.component.ts', this, {});
            this.template(ANGULAR_DIR + 'admin/metrics/_metrics.service.ts', ANGULAR_DIR + 'admin/metrics/metrics.service.ts', this, {});
            if (this.websocket === 'spring-websocket') {
                this.copyHtml(ANGULAR_DIR + 'admin/tracker/_tracker.html', ANGULAR_DIR + 'admin/tracker/tracker.html');
                this.copyJs(ANGULAR_DIR + 'admin/tracker/_tracker.state.ts', ANGULAR_DIR + 'admin/tracker/tracker.state.ts', this, {});
                this.template(ANGULAR_DIR + 'admin/tracker/_tracker.component.ts', ANGULAR_DIR + 'admin/tracker/tracker.component.ts', this, {});
                this.template(ANGULAR_DIR + 'shared/tracker/_tracker.service.ts', ANGULAR_DIR + 'shared/tracker/tracker.service.ts', this, {});
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

            this.copyHtml(ANGULAR_DIR + 'admin/gateway/_gateway.html', ANGULAR_DIR + 'admin/gateway/gateway.html');
            this.copyJs(ANGULAR_DIR + 'admin/gateway/_gateway.state.ts', ANGULAR_DIR + 'admin/gateway/gateway.state.ts', this, {});
            this.template(ANGULAR_DIR + 'admin/gateway/_gateway.component.ts', ANGULAR_DIR + 'admin/gateway/gateway.component.ts', this, {});
            this.template(ANGULAR_DIR + 'admin/gateway/_gateway-routes.service.ts', ANGULAR_DIR + 'admin/gateway/gateway-routes.service.ts', this, {});
            this.template(ANGULAR_DIR + 'admin/gateway/_gateway-route.model.ts', ANGULAR_DIR + 'admin/gateway/gateway-route.model.ts', this, {});
        },

        writeBlockInterceptors: function () {
            // interceptor code
            if (this.authenticationType === 'oauth2' || this.authenticationType === 'jwt' || this.authenticationType === 'uaa') {
                this.template(ANGULAR_DIR + 'blocks/interceptor/_auth.interceptor.ts', ANGULAR_DIR + 'blocks/interceptor/auth.interceptor.ts', this, {});
            }
            this.template(ANGULAR_DIR + 'blocks/interceptor/_auth-expired.interceptor.ts', ANGULAR_DIR + 'blocks/interceptor/auth-expired.interceptor.ts', this, {});
            this.template(ANGULAR_DIR + 'blocks/interceptor/_errorhandler.interceptor.ts', ANGULAR_DIR + 'blocks/interceptor/errorhandler.interceptor.ts', this, {});
            this.template(ANGULAR_DIR + 'blocks/interceptor/_notification.interceptor.ts', ANGULAR_DIR + 'blocks/interceptor/notification.interceptor.ts', this, {});
        },

        writeAngularSharedFiles: function () {
            this.template(ANGULAR_DIR + 'shared/_index.ts', ANGULAR_DIR + 'shared/index.ts', this, {});
            this.template(ANGULAR_DIR + 'shared/_shared.ng2module.ts', ANGULAR_DIR + 'shared/shared.ng2module.ts', this, {});
            this.template(ANGULAR_DIR + 'shared/_shared-libs.ng2module.ts', ANGULAR_DIR + 'shared/shared-libs.ng2module.ts', this, {});
            this.template(ANGULAR_DIR + 'shared/constants/_pagination.constants.ts', ANGULAR_DIR + 'shared/constants/pagination.constants.ts', this, {});

            this.template(ANGULAR_DIR + 'shared/model/_account.model.ts', ANGULAR_DIR + 'shared/model/account.model.ts', this, {});

            this.template(ANGULAR_DIR + 'shared/pipe/_keys.pipe.ts', ANGULAR_DIR + 'shared/pipe/keys.pipe.ts', this, {});
            this.template(ANGULAR_DIR + 'shared/pipe/_filter.pipe.ts', ANGULAR_DIR + 'shared/pipe/filter.pipe.ts', this, {});
            this.template(ANGULAR_DIR + 'shared/pipe/_order-by.pipe.ts', ANGULAR_DIR + 'shared/pipe/order-by.pipe.ts', this, {});
            this.template(ANGULAR_DIR + 'shared/pipe/_capitalize.pipe.ts', ANGULAR_DIR + 'shared/pipe/capitalize.pipe.ts', this, {});
            this.template(ANGULAR_DIR + 'shared/pipe/_truncate-characters.pipe.ts', ANGULAR_DIR + 'shared/pipe/truncate-characters.pipe.ts', this, {});
            this.template(ANGULAR_DIR + 'shared/pipe/_truncate-words.pipe.ts', ANGULAR_DIR + 'shared/pipe/truncate-words.pipe.ts', this, {});

            this.template(ANGULAR_DIR + 'shared/directive/_sort.directive.ts', ANGULAR_DIR + 'shared/directive/sort.directive.ts', this, {});
            this.template(ANGULAR_DIR + 'shared/directive/_sort-by.directive.ts', ANGULAR_DIR + 'shared/directive/sort-by.directive.ts', this, {});
            this.template(ANGULAR_DIR + 'shared/directive/_show-validation.directive.ts', ANGULAR_DIR + 'shared/directive/show-validation.directive.ts', this, {});
            this.template(ANGULAR_DIR + 'shared/directive/_maxbytes.directive.ts', ANGULAR_DIR + 'shared/directive/maxbytes.directive.ts', this, {});
            this.template(ANGULAR_DIR + 'shared/directive/_minbytes.directive.ts', ANGULAR_DIR + 'shared/directive/minbytes.directive.ts', this, {});
            this.template(ANGULAR_DIR + 'shared/directive/_number-of-bytes.ts', ANGULAR_DIR + 'shared/directive/number-of-bytes.ts', this, {});

            this.template(ANGULAR_DIR + 'shared/service/_date-util.service.ts', ANGULAR_DIR + 'shared/service/date-util.service.ts', this, {});
            this.template(ANGULAR_DIR + 'shared/service/_data-util.service.ts', ANGULAR_DIR + 'shared/service/data-util.service.ts', this, {});
            this.template(ANGULAR_DIR + 'shared/service/_pagination-util.service.ts', ANGULAR_DIR + 'shared/service/pagination-util.service.ts', this, {});
            this.template(ANGULAR_DIR + 'shared/service/_parse-links.service.ts', ANGULAR_DIR + 'shared/service/parse-links.service.ts', this, {});

            this.template(ANGULAR_DIR + 'shared/component/_jhi-item-count.component.ts', ANGULAR_DIR + 'shared/component/jhi-item-count.component.ts', this, {});
        },

        writeAngularSharedComponentFiles: function () {
            this.template(ANGULAR_DIR + 'shared/_shared-common.ng2module.ts', ANGULAR_DIR + 'shared/shared-common.ng2module.ts', this, {});
            //components
            if (this.enableTranslation) {
                this.template(ANGULAR_DIR + 'shared/language/_jhi-translate.directive.ts', ANGULAR_DIR + 'shared/language/jhi-translate.directive.ts', this, {});
                this.template(ANGULAR_DIR + 'shared/language/_translate-partial-loader.provider.ts', ANGULAR_DIR + 'shared/language/translate-partial-loader.provider.ts', this, {});
                this.template(ANGULAR_DIR + 'shared/language/_language.pipe.ts', ANGULAR_DIR + 'shared/language/language.pipe.ts', this, {});
                this.template(ANGULAR_DIR + 'shared/language/_language.constants.ts', ANGULAR_DIR + 'shared/language/language.constants.ts', this, {});
                this.template(ANGULAR_DIR + 'shared/language/_language.service.ts', ANGULAR_DIR + 'shared/language/language.service.ts', this, {});
                this.template(ANGULAR_DIR + 'shared/language/_jhi-missing-translation.config.ts', ANGULAR_DIR + 'shared/language/jhi-missing-translation.config.ts', this, {});
            }
            this.copyHtml(ANGULAR_DIR + 'shared/login/_login.html', ANGULAR_DIR + 'shared/login/login.html');
            this.template(ANGULAR_DIR + 'shared/login/_login.service.ts', ANGULAR_DIR + 'shared/login/login.service.ts', this, {});
            this.template(ANGULAR_DIR + 'shared/login/_login-modal.service.ts', ANGULAR_DIR + 'shared/login/login-modal.service.ts', this, {});
            this.template(ANGULAR_DIR + 'shared/login/_login.component.ts', ANGULAR_DIR + 'shared/login/login.component.ts', this, {});

            //alert service code
            this.template(ANGULAR_DIR + 'shared/alert/_alert.service.ts', ANGULAR_DIR + 'shared/alert/alert.service.ts', this, {});
            this.template(ANGULAR_DIR + 'shared/alert/_alert.provider.ts', ANGULAR_DIR + 'shared/alert/alert.provider.ts', this, {});
            this.template(ANGULAR_DIR + 'shared/alert/_alert.component.ts', ANGULAR_DIR + 'shared/alert/alert.component.ts', this, {});
            this.template(ANGULAR_DIR + 'shared/alert/_alert-error.component.ts', ANGULAR_DIR + 'shared/alert/alert-error.component.ts', this, {});
        },

        writeAngularAuthServiceFiles: function () {
            // services
            this.template(ANGULAR_DIR + 'shared/auth/_auth.service.ts', ANGULAR_DIR + 'shared/auth/auth.service.ts', this, {});
            this.template(ANGULAR_DIR + 'shared/auth/_csrf.service.ts', ANGULAR_DIR + 'shared/auth/csrf.service.ts', this, {});
            this.template(ANGULAR_DIR + 'shared/auth/_state-storage.service.ts', ANGULAR_DIR + 'shared/auth/state-storage.service.ts', this, {});
            this.template(ANGULAR_DIR + 'shared/auth/_principal.service.ts', ANGULAR_DIR + 'shared/auth/principal.service.ts', this, {});
            this.template(ANGULAR_DIR + 'shared/auth/_has-authority.directive.ts', ANGULAR_DIR + 'shared/auth/has-authority.directive.ts', this, {});
            this.template(ANGULAR_DIR + 'shared/auth/_has-any-authority.directive.ts', ANGULAR_DIR + 'shared/auth/has-any-authority.directive.ts', this, {});
            if (this.authenticationType === 'oauth2') {
                this.template(ANGULAR_DIR + 'shared/auth/_auth-oauth2.service.ts', ANGULAR_DIR + 'shared/auth/auth-oauth2.service.ts', this, {});
                this.template(ANGULAR_DIR + 'shared/auth/_base64.service.ts', ANGULAR_DIR + 'shared/auth/base64.service.ts', this, {});
            } else if (this.authenticationType === 'jwt' || this.authenticationType === 'uaa') {
                this.template(ANGULAR_DIR + 'shared/auth/_auth-jwt.service.ts', ANGULAR_DIR + 'shared/auth/auth-jwt.service.ts', this, {});
            } else {
                this.template(ANGULAR_DIR + 'shared/auth/_auth-session.service.ts', ANGULAR_DIR + 'shared/auth/auth-session.service.ts', this, {});
            }
            this.template(ANGULAR_DIR + 'shared/auth/_account.service.ts', ANGULAR_DIR + 'shared/auth/account.service.ts', this, {});

        },

        writeAngularMainFiles: function () {
            // entities
            this.template(ANGULAR_DIR + 'entities/_entity.module.ts', ANGULAR_DIR + 'entities/entity.module.ts', this, {});
            this.copyJs(ANGULAR_DIR + 'entities/_entity.state.ts', ANGULAR_DIR + 'entities/entity.state.ts', this, {});

            // home module
            this.copyHtml(ANGULAR_DIR + 'home/_home.html', ANGULAR_DIR + 'home/home.html');
            this.copyJs(ANGULAR_DIR + 'home/_home.state.ts', ANGULAR_DIR + 'home/home.state.ts', this, {});
            this.template(ANGULAR_DIR + 'home/_index.ts', ANGULAR_DIR + 'home/index.ts', this, {});
            this.template(ANGULAR_DIR + 'home/_home.component.ts', ANGULAR_DIR + 'home/home.component.ts', this, {});

            // layouts
            if (this.enableTranslation) {
                this.template(ANGULAR_DIR + 'layouts/navbar/_active-menu.directive.ts', ANGULAR_DIR + 'layouts/navbar/active-menu.directive.ts', this, {});
            }
            this.template(ANGULAR_DIR + 'layouts/_index.ts', ANGULAR_DIR + 'layouts/index.ts', this, {});
            this.copyHtml(ANGULAR_DIR + 'layouts/navbar/_navbar.html', ANGULAR_DIR + 'layouts/navbar/navbar.html');
            this.template(ANGULAR_DIR + 'layouts/navbar/_navbar.component.ts', ANGULAR_DIR + 'layouts/navbar/navbar.component.ts', this, {});
            this.copyHtml(ANGULAR_DIR + 'layouts/footer/_footer.html', ANGULAR_DIR + 'layouts/footer/footer.html');
            this.template(ANGULAR_DIR + 'layouts/footer/_footer.component.ts', ANGULAR_DIR + 'layouts/footer/footer.component.ts', this, {});
            this.copyHtml(ANGULAR_DIR + 'layouts/error/_error.html', ANGULAR_DIR + 'layouts/error/error.html');
            this.copyJs(ANGULAR_DIR + 'layouts/error/_error.state.ts', ANGULAR_DIR + 'layouts/error/error.state.ts', this, {});
            this.template(ANGULAR_DIR + 'layouts/error/_error.component.ts', ANGULAR_DIR + 'layouts/error/error.component.ts', this, {});
        },

        writeAngularProfileServiceFiles: function () {
            // services
            this.template(ANGULAR_DIR + 'layouts/profiles/_profile.service.ts', ANGULAR_DIR + 'layouts/profiles/profile.service.ts', this, {});
            this.template(ANGULAR_DIR + 'layouts/profiles/_profile-info.model.ts', ANGULAR_DIR + 'layouts/profiles/profile-info.model.ts', this, {});
            this.template(ANGULAR_DIR + 'layouts/profiles/_page-ribbon.component.ts', ANGULAR_DIR + 'layouts/profiles/page-ribbon.component.ts', this, {});
        },

        writeImageFiles: function () {
            // Images
            this.copy(MAIN_SRC_DIR + 'content/images/_hipster.png', MAIN_SRC_DIR + 'content/images/hipster.png');
            this.copy(MAIN_SRC_DIR + 'content/images/_hipster2x.png', MAIN_SRC_DIR + 'content/images/hipster2x.png');
            this.copy(MAIN_SRC_DIR + 'content/images/_logo-jhipster.png', MAIN_SRC_DIR + 'content/images/logo-jhipster.png');
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
