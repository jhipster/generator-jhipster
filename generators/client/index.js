'use strict';
var util = require('util'),
    generators = require('yeoman-generator'),
    chalk = require('chalk'),
    _ = require('lodash'),
    scriptBase = require('../generator-base'),
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

var currentQuestion;
var totalQuestions;
var configOptions = {};

module.exports = JhipsterClientGenerator.extend({
    constructor: function () {
        generators.Base.apply(this, arguments);

        configOptions = this.options.configOptions || {};

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

        this.skipServer = configOptions.skipServer || this.config.get('skipServer');
        this.skipUserManagement = configOptions.skipUserManagement || this.options['skip-user-management'] || this.config.get('skipUserManagement');
        this.authenticationType = this.options['auth'];
        this.buildTool = this.options['build'];
        this.websocket = this.options['websocket'];
        this.devDatabaseType = this.options['dev-db'];
        this.databaseType = this.options['db'];
        this.enableSocialSignIn = this.options['social'];
        this.searchEngine = this.options['search-engine'];
        this.hibernateCache = this.options['hb-cache'];
        this.jhiPrefix = configOptions.jhiPrefix || this.options['jhi-prefix'];
        this.jhiPrefixCapitalized = _.upperFirst(this.jhiPrefix);
        this.testFrameworks = [];
        this.options['protractor'] && this.testFrameworks.push('protractor');
        currentQuestion = configOptions.lastQuestion ? configOptions.lastQuestion : 0;
        totalQuestions = configOptions.totalQuestions ? configOptions.totalQuestions : QUESTIONS;
        this.baseName = configOptions.baseName;
        this.logo = configOptions.logo;
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

            this.serverPort = this.config.get('serverPort') || configOptions.serverPort || 8080;
            this.applicationType = this.config.get('applicationType') || configOptions.applicationType;
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

        askForModuleName: function () {

            if (this.baseName) return;

            this.askModuleName(this, currentQuestion++, totalQuestions);
        },

        askForClientSideOpts: function () {
            if (this.existingProject) return;

            var done = this.async();
            var getNumberedQuestion = this.getNumberedQuestion;
            var prompts = [
                {
                    type: 'confirm',
                    name: 'useSass',
                    message: function (response) {
                        return getNumberedQuestion('Would you like to use the LibSass stylesheet preprocessor for your CSS?', currentQuestion, totalQuestions, function (current) {
                            currentQuestion = current;
                        }, true);
                    },
                    default: false
                }
            ];
            this.prompt(prompts, function (props) {
                this.useSass = props.useSass;
                done();
            }.bind(this));
        },

        askFori18n: function () {
            if (this.existingProject || configOptions.skipI18nQuestion) return;

            this.aski18n(this, currentQuestion++, totalQuestions);
        },

        setSharedConfigOptions: function () {
            configOptions.lastQuestion = currentQuestion;
            configOptions.totalQuestions = totalQuestions;
            configOptions.useSass = this.useSass;
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
        },

        saveConfig: function () {
            this.config.set('useSass', this.useSass);
            this.config.set('enableTranslation', this.enableTranslation);
            if (this.enableTranslation && !configOptions.skipI18nQuestion) {
                this.config.set('nativeLanguage', this.nativeLanguage);
                this.config.set('languages', this.languages);
            }
        }
    },

    default: {

        getSharedConfigOptions: function () {
            if (configOptions.hibernateCache) {
                this.hibernateCache = configOptions.hibernateCache;
            }
            if (configOptions.websocket) {
                this.websocket = configOptions.websocket;
            }
            if (configOptions.databaseType) {
                this.databaseType = configOptions.databaseType;
            }
            if (configOptions.devDatabaseType) {
                this.devDatabaseType = configOptions.devDatabaseType;
            }
            if (configOptions.prodDatabaseType) {
                this.prodDatabaseType = configOptions.prodDatabaseType;
            }
            if (configOptions.searchEngine) {
                this.searchEngine = configOptions.searchEngine;
            }
            if (configOptions.buildTool) {
                this.buildTool = configOptions.buildTool;
            }
            if (configOptions.enableSocialSignIn !== undefined) {
                this.enableSocialSignIn = configOptions.enableSocialSignIn;
            }
            if (configOptions.authenticationType) {
                this.authenticationType = configOptions.authenticationType;
            }
            if (configOptions.testFrameworks) {
                this.testFrameworks = configOptions.testFrameworks;
            }
            if (configOptions.enableTranslation !== undefined) {
                this.enableTranslation = configOptions.enableTranslation;
            }
            if (configOptions.nativeLanguage !== undefined) {
                this.nativeLanguage = configOptions.nativeLanguage;
            }
            if (configOptions.languages !== undefined) {
                this.languages = configOptions.languages;
            }

            if(configOptions.uaaBaseName !== undefined) {
                this.uaaBaseName = configOptions.uaaBaseName;
            }

            this.nativeLanguageShortName = this.enableTranslation && this.nativeLanguage ? this.nativeLanguage.split('-')[0] : 'en';
            // Make dist dir available in templates
            if (configOptions.buildTool === 'maven') {
                this.BUILD_DIR = 'target/';
            } else {
                this.BUILD_DIR = 'build/';
            }
            this.DIST_DIR = this.BUILD_DIR + DIST_DIR;
        },

        composeLanguages: function () {
            if (configOptions.skipI18nQuestion) return;

            this.composeLanguagesSub(this, configOptions, 'client');
        }
    },

    writing: {

        writeCommonFiles: function () {

            this.template('_package.json', 'package.json', this, {});
            this.template('_bower.json', 'bower.json', this, {});
            this.template('bowerrc', '.bowerrc', this, {});
            this.template('_eslintrc.json', '.eslintrc.json', this, {});
            this.template('_eslintignore', '.eslintignore', this, {});
            this.template('gulpfile.js', 'gulpfile.js', this, {});
            this.fs.copy(this.templatePath('gulp/handleErrors.js'), this.destinationPath('gulp/handleErrors.js')); // to avoid interpolate errors
            this.template('gulp/utils.js', 'gulp/utils.js', this, {});
            this.template('gulp/serve.js', 'gulp/serve.js', this, {});
            this.template('gulp/config.js', 'gulp/config.js', this, {});
            this.template('gulp/build.js', 'gulp/build.js', this, {});
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

            // Angular JS module
            this.template(ANGULAR_DIR + '_app.module.js', ANGULAR_DIR + 'app.module.js', this, {});
            this.template(ANGULAR_DIR + '_app.state.js', ANGULAR_DIR + 'app.state.js', this, {});
            this.template(ANGULAR_DIR + '_app.constants.js', ANGULAR_DIR + 'app.constants.js', this, {});
            this.template(ANGULAR_DIR + 'blocks/handlers/_state.handler.js', ANGULAR_DIR + 'blocks/handlers/state.handler.js', this, {});
            if (this.enableTranslation) {
                this.template(ANGULAR_DIR + 'blocks/handlers/_translation.handler.js', ANGULAR_DIR + 'blocks/handlers/translation.handler.js', this, {});
                this.template(ANGULAR_DIR + 'blocks/config/_translation.config.js', ANGULAR_DIR + 'blocks/config/translation.config.js', this, {});
                this.template(ANGULAR_DIR + 'blocks/config/_translation-storage.provider.js', ANGULAR_DIR + 'blocks/config/translation-storage.provider.js', this, {});
            }
            this.template(ANGULAR_DIR + 'blocks/config/_alert.config.js', ANGULAR_DIR + 'blocks/config/alert.config.js', this, {});
            this.template(ANGULAR_DIR + 'blocks/config/_http.config.js', ANGULAR_DIR + 'blocks/config/http.config.js', this, {});
            this.template(ANGULAR_DIR + 'blocks/config/_localstorage.config.js', ANGULAR_DIR + 'blocks/config/localstorage.config.js', this, {});
            this.template(ANGULAR_DIR + 'blocks/config/_compile.config.js', ANGULAR_DIR + 'blocks/config/compile.config.js', this, {});
        },

        writeAngularAuthFiles: function () {
            // account module
            this.template(ANGULAR_DIR + 'account/_account.state.js', ANGULAR_DIR + 'account/account.state.js', this, {});
            this.copyHtml(ANGULAR_DIR + 'account/activate/activate.html', ANGULAR_DIR + 'account/activate/activate.html');
            this.copyJs(ANGULAR_DIR + 'account/activate/_activate.state.js', ANGULAR_DIR + 'account/activate/activate.state.js', this, {});
            this.template(ANGULAR_DIR + 'account/activate/_activate.controller.js', ANGULAR_DIR + 'account/activate/activate.controller.js', this, {});
            this.copyHtml(ANGULAR_DIR + 'account/password/password.html', ANGULAR_DIR + 'account/password/password.html');
            this.copyJs(ANGULAR_DIR + 'account/password/_password.state.js', ANGULAR_DIR + 'account/password/password.state.js', this, {});
            this.template(ANGULAR_DIR + 'account/password/_password.controller.js', ANGULAR_DIR + 'account/password/password.controller.js', this, {});
            this.template(ANGULAR_DIR + 'account/password/_password-strength-bar.directive.js', ANGULAR_DIR + 'account/password/password-strength-bar.directive.js', this, {});
            this.copyHtml(ANGULAR_DIR + 'account/register/register.html', ANGULAR_DIR + 'account/register/register.html');
            this.copyJs(ANGULAR_DIR + 'account/register/_register.state.js', ANGULAR_DIR + 'account/register/register.state.js', this, {});
            this.template(ANGULAR_DIR + 'account/register/_register.controller.js', ANGULAR_DIR + 'account/register/register.controller.js', this, {});
            this.copyHtml(ANGULAR_DIR + 'account/reset/request/reset.request.html', ANGULAR_DIR + 'account/reset/request/reset.request.html');
            this.copyJs(ANGULAR_DIR + 'account/reset/request/_reset.request.state.js', ANGULAR_DIR + 'account/reset/request/reset.request.state.js', this, {});
            this.template(ANGULAR_DIR + 'account/reset/request/_reset.request.controller.js', ANGULAR_DIR + 'account/reset/request/reset.request.controller.js', this, {});
            this.copyHtml(ANGULAR_DIR + 'account/reset/finish/reset.finish.html', ANGULAR_DIR + 'account/reset/finish/reset.finish.html');
            this.copyJs(ANGULAR_DIR + 'account/reset/finish/_reset.finish.state.js', ANGULAR_DIR + 'account/reset/finish/reset.finish.state.js', this, {});
            this.template(ANGULAR_DIR + 'account/reset/finish/_reset.finish.controller.js', ANGULAR_DIR + 'account/reset/finish/reset.finish.controller.js', this, {});
            if (this.authenticationType === 'session') {
                this.copyHtml(ANGULAR_DIR + 'account/sessions/sessions.html', ANGULAR_DIR + 'account/sessions/sessions.html');
                this.copyJs(ANGULAR_DIR + 'account/sessions/_sessions.state.js', ANGULAR_DIR + 'account/sessions/sessions.state.js', this, {});
                this.template(ANGULAR_DIR + 'account/sessions/_sessions.controller.js', ANGULAR_DIR + 'account/sessions/sessions.controller.js', this, {});
            }
            this.copyHtml(ANGULAR_DIR + 'account/settings/settings.html', ANGULAR_DIR + 'account/settings/settings.html');
            this.copyJs(ANGULAR_DIR + 'account/settings/_settings.state.js', ANGULAR_DIR + 'account/settings/settings.state.js', this, {});
            this.template(ANGULAR_DIR + 'account/settings/_settings.controller.js', ANGULAR_DIR + 'account/settings/settings.controller.js', this, {});
            // Social
            if (this.enableSocialSignIn) {
                this.copyHtml(ANGULAR_DIR + 'account/social/directive/_social.html', ANGULAR_DIR + 'account/social/directive/social.html');
                this.template(ANGULAR_DIR + 'account/social/directive/_social.directive.js', ANGULAR_DIR + 'account/social/directive/social.directive.js', this, {});
                this.copyHtml(ANGULAR_DIR + 'account/social/_social-register.html', ANGULAR_DIR + 'account/social/social-register.html');
                this.template(ANGULAR_DIR + 'account/social/_social-register.controller.js', ANGULAR_DIR + 'account/social/social-register.controller.js', this, {});
                this.template(ANGULAR_DIR + 'account/social/_social.service.js', ANGULAR_DIR + 'account/social/social.service.js', this, {});
                this.copyJs(ANGULAR_DIR + 'account/social/_social.state.js', ANGULAR_DIR + 'account/social/social.state.js', this, {});

                if (this.authenticationType === 'jwt') {
                    this.template(ANGULAR_DIR + 'account/social/_social-auth.controller.js', ANGULAR_DIR + 'account/social/social-auth.controller.js', this, {});
                }
            }
        },

        writeAngularAdminModuleFiles: function () {
            // admin modules
            this.template(ANGULAR_DIR + 'admin/_admin.state.js', ANGULAR_DIR + 'admin/admin.state.js', this, {});
            this.copyHtml(ANGULAR_DIR + 'admin/audits/audits.html', ANGULAR_DIR + 'admin/audits/audits.html');
            this.copyJs(ANGULAR_DIR + 'admin/audits/_audits.state.js', ANGULAR_DIR + 'admin/audits/audits.state.js', this, {});
            this.template(ANGULAR_DIR + 'admin/audits/_audits.controller.js', ANGULAR_DIR + 'admin/audits/audits.controller.js', this, {});
            this.template(ANGULAR_DIR + 'admin/audits/_audits.service.js', ANGULAR_DIR + 'admin/audits/audits.service.js', this, {});
            this.copyHtml(ANGULAR_DIR + 'admin/configuration/configuration.html', ANGULAR_DIR + 'admin/configuration/configuration.html');
            this.copyJs(ANGULAR_DIR + 'admin/configuration/_configuration.state.js', ANGULAR_DIR + 'admin/configuration/configuration.state.js', this, {});
            this.template(ANGULAR_DIR + 'admin/configuration/_configuration.controller.js', ANGULAR_DIR + 'admin/configuration/configuration.controller.js', this, {});
            this.template(ANGULAR_DIR + 'admin/configuration/_configuration.service.js', ANGULAR_DIR + 'admin/configuration/configuration.service.js', this, {});
            this.copy(ANGULAR_DIR + 'admin/docs/docs.html', ANGULAR_DIR + 'admin/docs/docs.html');
            this.copyJs(ANGULAR_DIR + 'admin/docs/_docs.state.js', ANGULAR_DIR + 'admin/docs/docs.state.js', this, {});
            this.copyHtml(ANGULAR_DIR + 'admin/health/health.html', ANGULAR_DIR + 'admin/health/health.html');
            this.copyHtml(ANGULAR_DIR + 'admin/health/_health.modal.html', ANGULAR_DIR + 'admin/health/health.modal.html');
            this.copyJs(ANGULAR_DIR + 'admin/health/_health.state.js', ANGULAR_DIR + 'admin/health/health.state.js', this, {});
            this.template(ANGULAR_DIR + 'admin/health/_health.controller.js', ANGULAR_DIR + 'admin/health/health.controller.js', this, {});
            this.template(ANGULAR_DIR + 'admin/health/_health.modal.controller.js', ANGULAR_DIR + 'admin/health/health.modal.controller.js', this, {});
            this.template(ANGULAR_DIR + 'admin/health/_health.service.js', ANGULAR_DIR + 'admin/health/health.service.js', this, {});
            this.copyHtml(ANGULAR_DIR + 'admin/logs/logs.html', ANGULAR_DIR + 'admin/logs/logs.html');
            this.copyJs(ANGULAR_DIR + 'admin/logs/_logs.state.js', ANGULAR_DIR + 'admin/logs/logs.state.js', this, {});
            this.template(ANGULAR_DIR + 'admin/logs/_logs.controller.js', ANGULAR_DIR + 'admin/logs/logs.controller.js', this, {});
            this.template(ANGULAR_DIR + 'admin/logs/_logs.service.js', ANGULAR_DIR + 'admin/logs/logs.service.js', this, {});
            this.copyHtml(ANGULAR_DIR + 'admin/metrics/_metrics.html', ANGULAR_DIR + 'admin/metrics/metrics.html', this, {}, true);
            this.copyHtml(ANGULAR_DIR + 'admin/metrics/_metrics.modal.html', ANGULAR_DIR + 'admin/metrics/metrics.modal.html', this, {}, true);
            this.copyJs(ANGULAR_DIR + 'admin/metrics/_metrics.state.js', ANGULAR_DIR + 'admin/metrics/metrics.state.js', this, {});
            this.template(ANGULAR_DIR + 'admin/metrics/_metrics.controller.js', ANGULAR_DIR + 'admin/metrics/metrics.controller.js', this, {});
            this.template(ANGULAR_DIR + 'admin/metrics/_metrics.modal.controller.js', ANGULAR_DIR + 'admin/metrics/metrics.modal.controller.js', this, {});
            this.template(ANGULAR_DIR + 'admin/metrics/_metrics.service.js', ANGULAR_DIR + 'admin/metrics/metrics.service.js', this, {});
            if (this.websocket === 'spring-websocket') {
                this.copyHtml(ANGULAR_DIR + 'admin/tracker/tracker.html', ANGULAR_DIR + 'admin/tracker/tracker.html');
                this.copyJs(ANGULAR_DIR + 'admin/tracker/_tracker.state.js', ANGULAR_DIR + 'admin/tracker/tracker.state.js', this, {});
                this.template(ANGULAR_DIR + 'admin/tracker/_tracker.controller.js', ANGULAR_DIR + 'admin/tracker/tracker.controller.js', this, {});
                this.template(ANGULAR_DIR + 'admin/tracker/_tracker.service.js', ANGULAR_DIR + 'admin/tracker/tracker.service.js', this, {});
            }
        },

        writeAngularUserMgmntFiles: function () {
            if (this.skipUserManagement) return;

            this.copyHtml(ANGULAR_DIR + 'admin/user-management/user-management.html', ANGULAR_DIR + 'admin/user-management/user-management.html');
            this.copyHtml(ANGULAR_DIR + 'admin/user-management/_user-management-detail.html', ANGULAR_DIR + 'admin/user-management/user-management-detail.html');
            this.copyHtml(ANGULAR_DIR + 'admin/user-management/_user-management-dialog.html', ANGULAR_DIR + 'admin/user-management/user-management-dialog.html');
            this.copyHtml(ANGULAR_DIR + 'admin/user-management/_user-management-delete-dialog.html', ANGULAR_DIR + 'admin/user-management/user-management-delete-dialog.html');
            this.copyJs(ANGULAR_DIR + 'admin/user-management/_user-management.state.js', ANGULAR_DIR + 'admin/user-management/user-management.state.js', this, {});
            this.template(ANGULAR_DIR + 'admin/user-management/_user-management.controller.js', ANGULAR_DIR + 'admin/user-management/user-management.controller.js', this, {});
            this.template(ANGULAR_DIR + 'admin/user-management/_user-management-detail.controller.js', ANGULAR_DIR + 'admin/user-management/user-management-detail.controller.js', this, {});
            this.template(ANGULAR_DIR + 'admin/user-management/_user-management-dialog.controller.js', ANGULAR_DIR + 'admin/user-management/user-management-dialog.controller.js', this, {});
            this.template(ANGULAR_DIR + 'admin/user-management/_user-management-delete-dialog.controller.js', ANGULAR_DIR + 'admin/user-management/user-management-delete-dialog.controller.js', this, {});
        },

        writeAngularGatewayFiles: function () {
            if (this.applicationType !== 'gateway') return;

            this.copyHtml(ANGULAR_DIR + 'admin/gateway/gateway.html', ANGULAR_DIR + 'admin/gateway/gateway.html');
            this.copyJs(ANGULAR_DIR + 'admin/gateway/_gateway.state.js', ANGULAR_DIR + 'admin/gateway/gateway.state.js', this, {});
            this.copyJs(ANGULAR_DIR + 'admin/gateway/_gateway.controller.js', ANGULAR_DIR + 'admin/gateway/gateway.controller.js', this, {});
            this.copyJs(ANGULAR_DIR + 'admin/gateway/_gateway.routes.service.js', ANGULAR_DIR + 'admin/gateway/gateway.routes.service.js', this, {});
        },

        writeAngularComponentFiles: function () {
            //components
            this.template(ANGULAR_DIR + 'components/form/_show-validation.directive.js', ANGULAR_DIR + 'components/form/show-validation.directive.js', this, {});
            this.template(ANGULAR_DIR + 'components/form/_maxbytes.directive.js', ANGULAR_DIR + 'components/form/maxbytes.directive.js', this, {});
            this.template(ANGULAR_DIR + 'components/form/_minbytes.directive.js', ANGULAR_DIR + 'components/form/minbytes.directive.js', this, {});
            this.template(ANGULAR_DIR + 'components/form/_uib-pager.config.js', ANGULAR_DIR + 'components/form/uib-pager.config.js', this, {});
            this.template(ANGULAR_DIR + 'components/form/_uib-pagination.config.js', ANGULAR_DIR + 'components/form/uib-pagination.config.js', this, {});
            this.template(ANGULAR_DIR + 'components/form/_pagination.constants.js', ANGULAR_DIR + 'components/form/pagination.constants.js', this, {});
            if (this.enableTranslation) {
                this.template(ANGULAR_DIR + 'components/language/_language.filter.js', ANGULAR_DIR + 'components/language/language.filter.js', this, {});
                this.template(ANGULAR_DIR + 'components/language/_language.constants.js', ANGULAR_DIR + 'components/language/language.constants.js', this, {});
                this.template(ANGULAR_DIR + 'components/language/_language.controller.js', ANGULAR_DIR + 'components/language/language.controller.js', this, {});
                this.template(ANGULAR_DIR + 'components/language/_language.service.js', ANGULAR_DIR + 'components/language/language.service.js', this, {});
            }
            this.copyHtml(ANGULAR_DIR + 'components/login/login.html', ANGULAR_DIR + 'components/login/login.html');
            this.copyJs(ANGULAR_DIR + 'components/login/_login.service.js', ANGULAR_DIR + 'components/login/login.service.js', this, {});
            this.template(ANGULAR_DIR + 'components/login/_login.controller.js', ANGULAR_DIR + 'components/login/login.controller.js', this, {});
            this.template(ANGULAR_DIR + 'components/util/_base64.service.js', ANGULAR_DIR + 'components/util/base64.service.js', this, {});
            this.template(ANGULAR_DIR + 'components/util/_capitalize.filter.js', ANGULAR_DIR + 'components/util/capitalize.filter.js', this, {});
            this.template(ANGULAR_DIR + 'components/util/_parse-links.service.js', ANGULAR_DIR + 'components/util/parse-links.service.js', this, {});
            this.template(ANGULAR_DIR + 'components/util/_truncate-characters.filter.js', ANGULAR_DIR + 'components/util/truncate-characters.filter.js', this, {});
            this.template(ANGULAR_DIR + 'components/util/_truncate-words.filter.js', ANGULAR_DIR + 'components/util/truncate-words.filter.js', this, {});
            this.template(ANGULAR_DIR + 'components/util/_date-util.service.js', ANGULAR_DIR + 'components/util/date-util.service.js', this, {});
            this.template(ANGULAR_DIR + 'components/util/_data-util.service.js', ANGULAR_DIR + 'components/util/data-util.service.js', this, {});
            this.template(ANGULAR_DIR + 'components/util/_pagination-util.service.js', ANGULAR_DIR + 'components/util/pagination-util.service.js', this, {});
            this.template(ANGULAR_DIR + 'components/util/_sort.directive.js', ANGULAR_DIR + 'components/util/sort.directive.js', this, {});
            this.template(ANGULAR_DIR + 'components/util/_sort-by.directive.js', ANGULAR_DIR + 'components/util/sort-by.directive.js', this, {});
            this.template(ANGULAR_DIR + 'components/util/_jhi-item-count.directive.js', ANGULAR_DIR + 'components/util/jhi-item-count.directive.js', this, {});

            // interceptor code
            if (this.authenticationType === 'oauth2' || this.authenticationType === 'jwt' || this.authenticationType === 'uaa') {
                this.template(ANGULAR_DIR + 'blocks/interceptor/_auth.interceptor.js', ANGULAR_DIR + 'blocks/interceptor/auth.interceptor.js', this, {});
            }
            this.template(ANGULAR_DIR + 'blocks/interceptor/_auth-expired.interceptor.js', ANGULAR_DIR + 'blocks/interceptor/auth-expired.interceptor.js', this, {});
            this.template(ANGULAR_DIR + 'blocks/interceptor/_errorhandler.interceptor.js', ANGULAR_DIR + 'blocks/interceptor/errorhandler.interceptor.js', this, {});
            this.template(ANGULAR_DIR + 'blocks/interceptor/_notification.interceptor.js', ANGULAR_DIR + 'blocks/interceptor/notification.interceptor.js', this, {});

            //alert service code
            this.template(ANGULAR_DIR + 'components/alert/_alert.service.js', ANGULAR_DIR + 'components/alert/alert.service.js', this, {});
            this.template(ANGULAR_DIR + 'components/alert/_alert.directive.js', ANGULAR_DIR + 'components/alert/alert.directive.js', this, {});
            this.template(ANGULAR_DIR + 'components/alert/_alert-error.directive.js', ANGULAR_DIR + 'components/alert/alert-error.directive.js', this, {});
        },

        writeAngularMainFiles: function () {
            // entities
            this.copyJs(ANGULAR_DIR + 'entities/_entity.state.js', ANGULAR_DIR + 'entities/entity.state.js', this, {});

            // home module
            this.copyHtml(ANGULAR_DIR + 'home/home.html', ANGULAR_DIR + 'home/home.html');
            this.copyJs(ANGULAR_DIR + 'home/_home.state.js', ANGULAR_DIR + 'home/home.state.js', this, {});
            this.template(ANGULAR_DIR + 'home/_home.controller.js', ANGULAR_DIR + 'home/home.controller.js', this, {});

            // layouts
            this.template(ANGULAR_DIR + 'layouts/navbar/_active-link.directive.js', ANGULAR_DIR + 'layouts/navbar/active-link.directive.js', this, {});
            if (this.enableTranslation) {
                this.template(ANGULAR_DIR + 'layouts/navbar/_active-menu.directive.js', ANGULAR_DIR + 'layouts/navbar/active-menu.directive.js', this, {});
            }
            this.copyHtml(ANGULAR_DIR + 'layouts/navbar/navbar.html', ANGULAR_DIR + 'layouts/navbar/navbar.html');
            this.template(ANGULAR_DIR + 'layouts/navbar/_navbar.controller.js', ANGULAR_DIR + 'layouts/navbar/navbar.controller.js', this, {});
            this.copyHtml(ANGULAR_DIR + 'layouts/error/error.html', ANGULAR_DIR + 'layouts/error/error.html');
            this.copyHtml(ANGULAR_DIR + 'layouts/error/accessdenied.html', ANGULAR_DIR + 'layouts/error/accessdenied.html');
            this.copyJs(ANGULAR_DIR + 'layouts/error/_error.state.js', ANGULAR_DIR + 'layouts/error/error.state.js', this, {});
        },

        writeAngularAuthServiceFiles: function () {
            // services
            this.template(ANGULAR_DIR + 'services/auth/_auth.service.js', ANGULAR_DIR + 'services/auth/auth.service.js', this, {});
            this.template(ANGULAR_DIR + 'services/auth/_principal.service.js', ANGULAR_DIR + 'services/auth/principal.service.js', this, {});
            this.template(ANGULAR_DIR + 'services/auth/_has-authority.directive.js', ANGULAR_DIR + 'services/auth/has-authority.directive.js', this, {});
            this.template(ANGULAR_DIR + 'services/auth/_has-any-authority.directive.js', ANGULAR_DIR + 'services/auth/has-any-authority.directive.js', this, {});
            if (this.authenticationType === 'oauth2') {
                this.template(ANGULAR_DIR + 'services/auth/_auth.oauth2.service.js', ANGULAR_DIR + 'services/auth/auth.oauth2.service.js', this, {});
            } else if (this.authenticationType === 'jwt' || this.authenticationType === 'uaa') {
                this.template(ANGULAR_DIR + 'services/auth/_auth.jwt.service.js', ANGULAR_DIR + 'services/auth/auth.jwt.service.js', this, {});
            } else {
                this.template(ANGULAR_DIR + 'services/auth/_auth.session.service.js', ANGULAR_DIR + 'services/auth/auth.session.service.js', this, {});
                this.template(ANGULAR_DIR + 'services/auth/_sessions.service.js', ANGULAR_DIR + 'services/auth/sessions.service.js', this, {});
            }
            this.template(ANGULAR_DIR + 'services/auth/_account.service.js', ANGULAR_DIR + 'services/auth/account.service.js', this, {});
            this.template(ANGULAR_DIR + 'services/auth/_activate.service.js', ANGULAR_DIR + 'services/auth/activate.service.js', this, {});
            this.template(ANGULAR_DIR + 'services/auth/_password.service.js', ANGULAR_DIR + 'services/auth/password.service.js', this, {});
            this.template(ANGULAR_DIR + 'services/auth/_password-reset-init.service.js', ANGULAR_DIR + 'services/auth/password-reset-init.service.js', this, {});
            this.template(ANGULAR_DIR + 'services/auth/_password-reset-finish.service.js', ANGULAR_DIR + 'services/auth/password-reset-finish.service.js', this, {});
            this.template(ANGULAR_DIR + 'services/auth/_register.service.js', ANGULAR_DIR + 'services/auth/register.service.js', this, {});
            this.template(ANGULAR_DIR + 'services/user/_user.service.js', ANGULAR_DIR + 'services/user/user.service.js', this, {});
        },

        writeAngularProfileServiceFiles: function () {
            // services
            this.template(ANGULAR_DIR + 'services/profiles/_profile.service.js', ANGULAR_DIR + 'services/profiles/profile.service.js', this, {});
            this.template(ANGULAR_DIR + 'services/profiles/_page-ribbon.directive.js', ANGULAR_DIR + 'services/profiles/page-ribbon.directive.js', this, {});
        },        

        writeImageFiles: function () {
            // Images
            this.copy(MAIN_SRC_DIR + 'content/images/hipster.png', MAIN_SRC_DIR + 'content/images/hipster.png');
            this.copy(MAIN_SRC_DIR + 'content/images/hipster2x.png', MAIN_SRC_DIR + 'content/images/hipster2x.png');
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
                'spec/app/account/reset/finish/_reset.finish.controller.spec.js',
                'spec/app/account/reset/request/_reset.request.controller.spec.js',
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
                    (this.useSass ?
                    '\n' +
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
