'use strict';
var util = require('util'),
    path = require('path'),
    generators = require('yeoman-generator'),
    chalk = require('chalk'),
    _ = require('underscore.string'),
    scriptBase = require('../generator-base'),
    mkdirp = require('mkdirp'),
    html = require("html-wiring"),
    packagejs = require('../../package.json'),
    engine = require('ejs').render;

var JhipsterClientGenerator = generators.Base.extend({});

util.inherits(JhipsterClientGenerator, scriptBase);





/* Constants use through out */
const QUESTIONS = 15; // making questions a variable to avoid updating each question by hand when adding additional options
const WEBAPP_DIR = 'src/main/webapp/';
const ANGULAR_DIR = WEBAPP_DIR + 'app/';
const TEST_JS_DIR = 'src/test/javascript/';
const INTERPOLATE_REGEX = /<%=([\s\S]+?)%>/g; // so that tags in templates do not get mistreated as _ templates

var currentQuestion;
var configOptions = {};

module.exports = JhipsterClientGenerator.extend({
    constructor: function() {
        generators.Base.apply(this, arguments);

        configOptions = this.options.configOptions || {};

        // This adds support for a `--base-name` flag
        this.option('base-name', {
            desc: 'Provide base name for the application, this will be overwritten if base name is found in .yo-rc file',
            type: String
        });

        // This adds support for a `--protractor` flag
        this.option('protractor', {
            desc: 'Enable protractor tests',
            type: Boolean,
            defaults: false
        });

        // This adds support for a `--last-question` flag
        this.option('last-question', {
            desc: 'Pass the last question number asked',
            type: Number
        });

        // This adds support for a `--[no-]logo` flag
        this.option('logo', {
            desc: 'Disable or enable Jhipster logo',
            type: Boolean,
            defaults: true
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


        this.i18n = this.options['i18n'];
        this.baseName = this.options['base-name'];
        this.testFrameworks = [];
        var protractor = this.options['protractor'];
        protractor &&  this.testFrameworks.push('protractor');
        var lastQuestion = this.options['last-question'] || configOptions.lastQuestion;
        currentQuestion = lastQuestion ? lastQuestion : 0;
        this.logo = this.options['logo'];
        this.authenticationType = this.options['auth'];
        this.buildTool = this.options['build'];
        this.websocket = this.options['websocket'];
        this.devDatabaseType = this.options['dev-db'];
        this.databaseType = this.options['db'];
        this.enableSocialSignIn = this.options['social'];
        this.searchEngine = this.options['search-engine'];
        this.hibernateCache = this.options['hb-cache'];

    },
    initializing : {
        displayLogo : function () {
            if(this.logo){
                this.printJHipsterLogo();
            }
        },

        setupClientVars : function () {
            this.applicationType = this.config.get('applicationType') || configOptions.applicationType;
            if (!this.applicationType) {
                this.applicationType = 'monolith';
            }
            this.useSass = this.config.get('useSass');
            this.enableTranslation = this.config.get('enableTranslation'); // this is enabled by default to avoid conflicts for existing applications
            this.packagejs = packagejs;
            var baseName = this.config.get('baseName');
            if (baseName) {
                this.baseName = baseName;
            }

            var clientConfigFound = this.useSass != null;
            if (clientConfigFound) {
                // If translation is not defined, it is enabled by default
                if (this.enableTranslation == null) {
                    this.enableTranslation = true;
                }

                this.existingProject = true;
            }
        }
    },

    prompting: {

        askForModuleName: function () {

            if(this.baseName){
                return;
            }
            this.askModuleName(this, ++currentQuestion, QUESTIONS);
        },

        askForClientSideOpts: function () {
            if(this.existingProject){
                return;
            }
            var done = this.async();
            var prompts = [
                {
                    type: 'confirm',
                    name: 'useSass',
                    message: '(' + (++currentQuestion) + '/' + QUESTIONS + ') Would you like to use the LibSass stylesheet preprocessor for your CSS?',
                    default: false
                },
                {
                    type: 'confirm',
                    name: 'enableTranslation',
                    message: '(' + (++currentQuestion) + '/' + QUESTIONS + ') Would you like to enable translation support with Angular Translate?',
                    default: true
                }
            ];
            this.prompt(prompts, function (props) {
                this.useSass = props.useSass;
                this.enableTranslation = props.enableTranslation;
                done();
            }.bind(this));
        },

        setSharedConfigOptions : function () {
            configOptions.useSass = this.useSass;
            configOptions.enableTranslation = this.enableTranslation;
        }

    },

    configuring: {
        insight: function () {
            var insight = this.insight();
            insight.track('generator', 'app');
            insight.track('app/useSass', this.useSass);
            insight.track('app/enableTranslation', this.enableTranslation);
        },

        configureGlobal: function () {
            // Application name modified, using each technology's conventions
            this.angularAppName = this.getAngularAppName();
            this.camelizedBaseName = _.camelize(this.baseName);
            this.slugifiedBaseName = _.slugify(this.baseName);
            this.lowercaseBaseName = this.baseName.toLowerCase();

        },

        saveConfig: function () {
            this.config.set('useSass', this.useSass);
            this.config.set('enableTranslation', this.enableTranslation);
        }
    },

    default: {

        getSharedConfigOptions: function () {
            if(configOptions.hibernateCache) {
                this.hibernateCache = configOptions.hibernateCache;
            }
            if(configOptions.websocket) {
                this.websocket = configOptions.websocket;
            }
            if(configOptions.databaseType) {
                this.databaseType = configOptions.databaseType;
            }
            if(configOptions.devDatabaseType) {
                this.devDatabaseType = configOptions.devDatabaseType;
            }
            if(configOptions.prodDatabaseType) {
                this.prodDatabaseType = configOptions.prodDatabaseType;
            }
            if(configOptions.searchEngine) {
                this.searchEngine = configOptions.searchEngine;
            }
            if(configOptions.buildTool) {
                this.buildTool = configOptions.buildTool;
            }
            if(configOptions.enableSocialSignIn != null) {
                this.enableSocialSignIn = configOptions.enableSocialSignIn;
            }
            if(configOptions.authenticationType) {
                this.authenticationType = configOptions.authenticationType;
            }
            if(configOptions.testFrameworks) {
                this.testFrameworks = configOptions.testFrameworks;
            }
        }
    },

    writing: {
        writeClientFiles: function () {

            this.template('_package.json', 'package.json', this, {});
            this.template('_bower.json', 'bower.json', this, {});
            this.template('bowerrc', '.bowerrc', this, {});
            this.template('gulpfile.js', 'gulpfile.js', this, {});
            this.fs.copy(this.templatePath('gulp/handleErrors.js'), this.destinationPath('gulp/handleErrors.js')); // to avoid interpolate errors
            this.template('gulp/utils.js', 'gulp/utils.js', this, {});

            // Create Webapp
            mkdirp(WEBAPP_DIR);

            // normal CSS or SCSS?
            if (this.useSass) {
                this.template(WEBAPP_DIR + 'scss/main.scss', WEBAPP_DIR + 'scss/main.scss');
                this.template(WEBAPP_DIR + 'scss/vendor.scss', WEBAPP_DIR + 'scss/vendor.scss');
            }
            // this css file will be overwritten by the sass generated css if sass is enabled
            // but this will avoid errors when running app without running sass task first
            this.template(WEBAPP_DIR + 'content/css/main.css', WEBAPP_DIR + 'content/css/main.css');

            // HTML5 BoilerPlate
            this.copy(WEBAPP_DIR + 'favicon.ico', WEBAPP_DIR + 'favicon.ico');
            this.copy(WEBAPP_DIR + 'robots.txt', WEBAPP_DIR + 'robots.txt');
            this.copy(WEBAPP_DIR + 'htaccess.txt', WEBAPP_DIR + '.htaccess');
            this.copy(WEBAPP_DIR + '404.html', WEBAPP_DIR + '404.html');

            // install all files related to i18n if translation is enabled
            if (this.enableTranslation) {
                this.installI18nFilesByLanguage(this, WEBAPP_DIR, 'en');
                this.installI18nFilesByLanguage(this, WEBAPP_DIR, 'fr');
            }

            // Swagger-ui for Jhipster
            this.template(WEBAPP_DIR + '/swagger-ui/_index.html', WEBAPP_DIR + 'swagger-ui/index.html', this, {});
            this.copy(WEBAPP_DIR + '/swagger-ui/images/throbber.gif', WEBAPP_DIR + 'swagger-ui/images/throbber.gif');

            // Angular JS module
            this.template(ANGULAR_DIR + '_app.module.js', ANGULAR_DIR + 'app.module.js', this, {});
            this.template(ANGULAR_DIR + '_app.config.js', ANGULAR_DIR + 'app.config.js', this, {});
            this.template(ANGULAR_DIR + '_app.constants.js', ANGULAR_DIR + 'app.constants.js', this, {});

            // account module
            this.template(ANGULAR_DIR + 'account/_account.js', ANGULAR_DIR + 'account/account.js', this, {});
            this.copyHtml(ANGULAR_DIR + 'account/activate/activate.html', ANGULAR_DIR + 'account/activate/activate.html');
            this.copyJs(ANGULAR_DIR + 'account/activate/_activate.js', ANGULAR_DIR + 'account/activate/activate.js', this, {});
            this.template(ANGULAR_DIR + 'account/activate/_activate.controller.js', ANGULAR_DIR + 'account/activate/activate.controller.js', this, {});
            this.copyHtml(ANGULAR_DIR + 'account/login/login.html', ANGULAR_DIR + 'account/login/login.html');
            this.copyJs(ANGULAR_DIR + 'account/login/_login.js', ANGULAR_DIR + 'account/login/login.js', this, {});
            this.template(ANGULAR_DIR + 'account/login/_login.controller.js', ANGULAR_DIR + 'account/login/login.controller.js', this, {});
            this.copyHtml(ANGULAR_DIR + 'account/password/password.html', ANGULAR_DIR + 'account/password/password.html');
            this.copyJs(ANGULAR_DIR + 'account/password/_password.js', ANGULAR_DIR + 'account/password/password.js', this, {});
            this.template(ANGULAR_DIR + 'account/password/_password.controller.js', ANGULAR_DIR + 'account/password/password.controller.js', this, {});
            this.template(ANGULAR_DIR + 'account/password/_password.directive.js', ANGULAR_DIR + 'account/password/password.directive.js', this, {});
            this.copyHtml(ANGULAR_DIR + 'account/register/register.html', ANGULAR_DIR + 'account/register/register.html');
            this.copyJs(ANGULAR_DIR + 'account/register/_register.js', ANGULAR_DIR + 'account/register/register.js', this, {});
            this.template(ANGULAR_DIR + 'account/register/_register.controller.js', ANGULAR_DIR + 'account/register/register.controller.js', this, {});
            this.copyHtml(ANGULAR_DIR + 'account/reset/request/reset.request.html', ANGULAR_DIR + 'account/reset/request/reset.request.html');
            this.copyJs(ANGULAR_DIR + 'account/reset/request/_reset.request.js', ANGULAR_DIR + 'account/reset/request/reset.request.js', this, {});
            this.template(ANGULAR_DIR + 'account/reset/request/_reset.request.controller.js', ANGULAR_DIR + 'account/reset/request/reset.request.controller.js', this, {});
            this.copyHtml(ANGULAR_DIR + 'account/reset/finish/reset.finish.html', ANGULAR_DIR + 'account/reset/finish/reset.finish.html');
            this.copyJs(ANGULAR_DIR + 'account/reset/finish/_reset.finish.js', ANGULAR_DIR + 'account/reset/finish/reset.finish.js', this, {});
            this.template(ANGULAR_DIR + 'account/reset/finish/_reset.finish.controller.js', ANGULAR_DIR + 'account/reset/finish/reset.finish.controller.js', this, {});
            if (this.authenticationType == 'session') {
                this.copyHtml(ANGULAR_DIR + 'account/sessions/sessions.html', ANGULAR_DIR + 'account/sessions/sessions.html');
                this.copyJs(ANGULAR_DIR + 'account/sessions/_sessions.js', ANGULAR_DIR + 'account/sessions/sessions.js', this, {});
                this.template(ANGULAR_DIR + 'account/sessions/_sessions.controller.js', ANGULAR_DIR + 'account/sessions/sessions.controller.js', this, {});
            }
            this.copyHtml(ANGULAR_DIR + 'account/settings/settings.html', ANGULAR_DIR + 'account/settings/settings.html');
            this.copyJs(ANGULAR_DIR + 'account/settings/_settings.js', ANGULAR_DIR + 'account/settings/settings.js', this, {});
            this.template(ANGULAR_DIR + 'account/settings/_settings.controller.js', ANGULAR_DIR + 'account/settings/settings.controller.js', this, {});
            // Social
            if (this.enableSocialSignIn) {
                this.copyHtml(ANGULAR_DIR + 'account/social/directive/_social.html', ANGULAR_DIR + 'account/social/directive/social.html');
                this.template(ANGULAR_DIR + 'account/social/directive/_social.directive.js', ANGULAR_DIR + 'account/social/directive/social.directive.js', this, {});
                this.copyHtml(ANGULAR_DIR + 'account/social/_social-register.html', ANGULAR_DIR + 'account/social/social-register.html');
                this.template(ANGULAR_DIR + 'account/social/_social-register.controller.js', ANGULAR_DIR + 'account/social/social-register.controller.js', this, {});
                this.template(ANGULAR_DIR + 'account/social/_social.service.js', ANGULAR_DIR + 'account/social/social.service.js', this, {});
                this.copyJs(ANGULAR_DIR + 'account/social/_social-register.js', ANGULAR_DIR + 'account/social/social-register.js', this, {});
            }

            // admin modules
            this.template(ANGULAR_DIR + 'admin/_admin.js', ANGULAR_DIR + 'admin/admin.js', this, {});
            this.copyHtml(ANGULAR_DIR + 'admin/audits/audits.html', ANGULAR_DIR + 'admin/audits/audits.html');
            this.copyJs(ANGULAR_DIR + 'admin/audits/_audits.js', ANGULAR_DIR + 'admin/audits/audits.js', this, {});
            this.template(ANGULAR_DIR + 'admin/audits/_audits.controller.js', ANGULAR_DIR + 'admin/audits/audits.controller.js', this, {});
            this.template(ANGULAR_DIR + 'admin/audits/_audits.service.js', ANGULAR_DIR + 'admin/audits/audits.service.js', this, {});
            this.copyHtml(ANGULAR_DIR + 'admin/configuration/configuration.html', ANGULAR_DIR + 'admin/configuration/configuration.html');
            this.copyJs(ANGULAR_DIR + 'admin/configuration/_configuration.js', ANGULAR_DIR + 'admin/configuration/configuration.js', this, {});
            this.template(ANGULAR_DIR + 'admin/configuration/_configuration.controller.js', ANGULAR_DIR + 'admin/configuration/configuration.controller.js', this, {});
            this.template(ANGULAR_DIR + 'admin/configuration/_configuration.service.js', ANGULAR_DIR + 'admin/configuration/configuration.service.js', this, {});
            this.copy(ANGULAR_DIR + 'admin/docs/docs.html', ANGULAR_DIR + 'admin/docs/docs.html');
            this.copyJs(ANGULAR_DIR + 'admin/docs/_docs.js', ANGULAR_DIR + 'admin/docs/docs.js', this, {});
            this.copyHtml(ANGULAR_DIR + 'admin/health/health.html', ANGULAR_DIR + 'admin/health/health.html');
            this.copyHtml(ANGULAR_DIR + 'admin/health/_health.modal.html', ANGULAR_DIR + 'admin/health/health.modal.html');
            this.copyJs(ANGULAR_DIR + 'admin/health/_health.js', ANGULAR_DIR + 'admin/health/health.js', this, {});
            this.template(ANGULAR_DIR + 'admin/health/_health.controller.js', ANGULAR_DIR + 'admin/health/health.controller.js', this, {});
            this.template(ANGULAR_DIR + 'admin/health/_health.modal.controller.js', ANGULAR_DIR + 'admin/health/health.modal.controller.js', this, {});
            this.template(ANGULAR_DIR + 'admin/health/_health.service.js', ANGULAR_DIR + 'admin/health/health.service.js', this, {});
            this.copyHtml(ANGULAR_DIR + 'admin/logs/logs.html', ANGULAR_DIR + 'admin/logs/logs.html');
            this.copyJs(ANGULAR_DIR + 'admin/logs/_logs.js', ANGULAR_DIR + 'admin/logs/logs.js', this, {});
            this.template(ANGULAR_DIR + 'admin/logs/_logs.controller.js', ANGULAR_DIR + 'admin/logs/logs.controller.js', this, {});
            this.template(ANGULAR_DIR + 'admin/logs/_logs.service.js', ANGULAR_DIR + 'admin/logs/logs.service.js', this, {});
            this.copyHtml(ANGULAR_DIR + 'admin/metrics/_metrics.html', ANGULAR_DIR + 'admin/metrics/metrics.html', this, {}, true);
            this.copyHtml(ANGULAR_DIR + 'admin/metrics/_metrics.modal.html', ANGULAR_DIR + 'admin/metrics/metrics.modal.html', this, {}, true);
            this.copyJs(ANGULAR_DIR + 'admin/metrics/_metrics.js', ANGULAR_DIR + 'admin/metrics/metrics.js', this, {});
            this.template(ANGULAR_DIR + 'admin/metrics/_metrics.controller.js', ANGULAR_DIR + 'admin/metrics/metrics.controller.js', this, {});
            this.template(ANGULAR_DIR + 'admin/metrics/_metrics.modal.controller.js', ANGULAR_DIR + 'admin/metrics/metrics.modal.controller.js', this, {});
            this.template(ANGULAR_DIR + 'admin/metrics/_metrics.service.js', ANGULAR_DIR + 'admin/metrics/metrics.service.js', this, {});
            if (this.websocket == 'spring-websocket') {
                this.copyHtml(ANGULAR_DIR + 'admin/tracker/tracker.html', ANGULAR_DIR + 'admin/tracker/tracker.html');
                this.copyJs(ANGULAR_DIR + 'admin/tracker/_tracker.js', ANGULAR_DIR + 'admin/tracker/tracker.js', this, {});
                this.template(ANGULAR_DIR + 'admin/tracker/_tracker.controller.js', ANGULAR_DIR + 'admin/tracker/tracker.controller.js', this, {});
                this.template(ANGULAR_DIR + 'admin/tracker/_tracker.service.js', ANGULAR_DIR + 'admin/tracker/tracker.service.js', this, {});
            }
            this.copyHtml(ANGULAR_DIR + 'admin/user-management/user-management.html', ANGULAR_DIR + 'admin/user-management/user-management.html');
            this.copyHtml(ANGULAR_DIR + 'admin/user-management/_user-management-detail.html', ANGULAR_DIR + 'admin/user-management/user-management-detail.html');
            this.copyHtml(ANGULAR_DIR + 'admin/user-management/_user-management-dialog.html', ANGULAR_DIR + 'admin/user-management/user-management-dialog.html');
            this.copyHtml(ANGULAR_DIR + 'admin/user-management/_user-management-delete-dialog.html', ANGULAR_DIR + 'admin/user-management/user-management-delete-dialog.html');
            this.copyJs(ANGULAR_DIR + 'admin/user-management/_user-management.js', ANGULAR_DIR + 'admin/user-management/user-management.js', this, {});
            this.template(ANGULAR_DIR + 'admin/user-management/_user-management.controller.js', ANGULAR_DIR + 'admin/user-management/user-management.controller.js', this, {});
            this.template(ANGULAR_DIR + 'admin/user-management/_user-management-detail.controller.js', ANGULAR_DIR + 'admin/user-management/user-management-detail.controller.js', this, {});
            this.template(ANGULAR_DIR + 'admin/user-management/_user-management-dialog.controller.js', ANGULAR_DIR + 'admin/user-management/user-management-dialog.controller.js', this, {});
            this.template(ANGULAR_DIR + 'admin/user-management/_user-management-delete-dialog.controller.js', ANGULAR_DIR + 'admin/user-management/user-management-delete-dialog.controller.js', this, {});
            if (this.applicationType == 'gateway') {
                this.copyHtml(ANGULAR_DIR + 'admin/gateway/gateway.html', ANGULAR_DIR + 'admin/gateway/gateway.html');
                this.copyJs(ANGULAR_DIR + 'admin/gateway/_gateway.js', ANGULAR_DIR + 'admin/gateway/gateway.js', this, {});
                this.copyJs(ANGULAR_DIR + 'admin/gateway/_gateway.controller.js', ANGULAR_DIR + 'admin/gateway/gateway.controller.js', this, {});
                this.copyJs(ANGULAR_DIR + 'admin/gateway/_gateway.routes.service.js', ANGULAR_DIR + 'admin/gateway/gateway.routes.service.js', this, {});
            }

            //components
            this.template(ANGULAR_DIR + 'components/form/_form.directive.js', ANGULAR_DIR + 'components/form/form.directive.js', this, {});
            this.template(ANGULAR_DIR + 'components/form/_maxbytes.directive.js', ANGULAR_DIR + 'components/form/maxbytes.directive.js', this, {});
            this.template(ANGULAR_DIR + 'components/form/_minbytes.directive.js', ANGULAR_DIR + 'components/form/minbytes.directive.js', this, {});
            this.template(ANGULAR_DIR + 'components/form/_uib-pager.config.js', ANGULAR_DIR + 'components/form/uib-pager.config.js', this, {});
            this.template(ANGULAR_DIR + 'components/form/_uib-pagination.config.js', ANGULAR_DIR + 'components/form/uib-pagination.config.js', this, {});
            this.template(ANGULAR_DIR + 'components/form/_pagination.constants.js', ANGULAR_DIR + 'components/form/pagination.constants.js', this, {});
            if (this.enableTranslation) {
                this.template(ANGULAR_DIR + 'components/language/_language.controller.js', ANGULAR_DIR + 'components/language/language.controller.js', this, {});
                this.template(ANGULAR_DIR + 'components/language/_language.service.js', ANGULAR_DIR + 'components/language/language.service.js', this, {});
            }
            this.template(ANGULAR_DIR + 'components/util/_base64.service.js', ANGULAR_DIR + 'components/util/base64.service.js', this, {});
            this.template(ANGULAR_DIR + 'components/util/_capitalize.filter.js', ANGULAR_DIR + 'components/util/capitalize.filter.js', this, {});
            this.template(ANGULAR_DIR + 'components/util/_parse-links.service.js', ANGULAR_DIR + 'components/util/parse-links.service.js', this, {});
            this.template(ANGULAR_DIR + 'components/util/_truncate.filter.js', ANGULAR_DIR + 'components/util/truncate.filter.js', this, {});
            this.template(ANGULAR_DIR + 'components/util/_date-util.service.js', ANGULAR_DIR + 'components/util/date-util.service.js', this, {});
            this.template(ANGULAR_DIR + 'components/util/_data-util.service.js', ANGULAR_DIR + 'components/util/data-util.service.js', this, {});
            this.template(ANGULAR_DIR + 'components/util/_sort.directive.js', ANGULAR_DIR + 'components/util/sort.directive.js', this, {});
            // interceptor code
            this.template(ANGULAR_DIR + 'components/interceptor/_auth.interceptor.js', ANGULAR_DIR + 'components/interceptor/auth.interceptor.js', this, {});
            this.template(ANGULAR_DIR + 'components/interceptor/_errorhandler.interceptor.js', ANGULAR_DIR + 'components/interceptor/errorhandler.interceptor.js', this, {});
            this.template(ANGULAR_DIR + 'components/interceptor/_notification.interceptor.js', ANGULAR_DIR + 'components/interceptor/notification.interceptor.js', this, {});

            //alert service code
            this.template(ANGULAR_DIR + 'components/alert/_alert.service.js', ANGULAR_DIR + 'components/alert/alert.service.js', this, {});
            this.template(ANGULAR_DIR + 'components/alert/_alert.directive.js', ANGULAR_DIR + 'components/alert/alert.directive.js', this, {});

            // entities
            this.copyJs(ANGULAR_DIR + 'entities/_entity.js', ANGULAR_DIR + 'entities/entity.js', this, {});

            // home module
            this.copyHtml(ANGULAR_DIR + 'home/home.html', ANGULAR_DIR + 'home/home.html');
            this.copyJs(ANGULAR_DIR + 'home/_home.js', ANGULAR_DIR + 'home/home.js', this, {});
            this.template(ANGULAR_DIR + 'home/_home.controller.js', ANGULAR_DIR + 'home/home.controller.js', this, {});

            // layouts
            this.template(ANGULAR_DIR + 'layouts/navbar/_navbar.directive.js', ANGULAR_DIR + 'layouts/navbar/navbar.directive.js', this, {});
            this.copyHtml(ANGULAR_DIR + 'layouts/navbar/navbar.html', ANGULAR_DIR + 'layouts/navbar/navbar.html');
            this.template(ANGULAR_DIR + 'layouts/navbar/_navbar.controller.js', ANGULAR_DIR + 'layouts/navbar/navbar.controller.js', this, {});
            this.copyHtml(ANGULAR_DIR + 'layouts/error/error.html', ANGULAR_DIR + 'layouts/error/error.html');
            this.copyHtml(ANGULAR_DIR + 'layouts/error/accessdenied.html', ANGULAR_DIR + 'layouts/error/accessdenied.html');
            this.copyJs(ANGULAR_DIR + 'layouts/error/_error.js', ANGULAR_DIR + 'layouts/error/error.js', this, {});

            // services
            this.template(ANGULAR_DIR + 'services/auth/_auth.service.js', ANGULAR_DIR + 'services/auth/auth.service.js', this, {});
            this.template(ANGULAR_DIR + 'services/auth/_principal.service.js', ANGULAR_DIR + 'services/auth/principal.service.js', this, {});
            this.template(ANGULAR_DIR + 'services/auth/_authority.directive.js', ANGULAR_DIR + 'services/auth/authority.directive.js', this, {});
            if (this.authenticationType == 'oauth2') {
                this.template(ANGULAR_DIR + 'services/auth/_auth.oauth2.service.js', ANGULAR_DIR + 'services/auth/auth.oauth2.service.js', this, {});
            } else if (this.authenticationType == 'jwt') {
                this.template(ANGULAR_DIR + 'services/auth/_auth.jwt.service.js', ANGULAR_DIR + 'services/auth/auth.jwt.service.js', this, {});
            } else {
                this.template(ANGULAR_DIR + 'services/auth/_auth.session.service.js', ANGULAR_DIR + 'services/auth/auth.session.service.js', this, {});
            }
            this.template(ANGULAR_DIR + 'services/auth/_account.service.js', ANGULAR_DIR + 'services/auth/account.service.js', this, {});
            this.template(ANGULAR_DIR + 'services/auth/_activate.service.js', ANGULAR_DIR + 'services/auth/activate.service.js', this, {});
            this.template(ANGULAR_DIR + 'services/auth/_password.service.js', ANGULAR_DIR + 'services/auth/password.service.js', this, {});
            this.template(ANGULAR_DIR + 'services/auth/_register.service.js', ANGULAR_DIR + 'services/auth/register.service.js', this, {});
            if (this.authenticationType == 'session') {
                this.template(ANGULAR_DIR + 'services/auth/_sessions.service.js', ANGULAR_DIR + 'services/auth/sessions.service.js', this, {});
            }
            this.template(ANGULAR_DIR + 'services/user/_user.service.js', ANGULAR_DIR + 'services/user/user.service.js', this, {});

            // CSS
            this.copy(WEBAPP_DIR + 'content/css/documentation.css', WEBAPP_DIR + 'content/css/documentation.css');

            // Images
            this.copy(WEBAPP_DIR + 'content/images/development_ribbon.png', WEBAPP_DIR + 'content/images/development_ribbon.png');
            this.copy(WEBAPP_DIR + 'content/images/hipster.png', WEBAPP_DIR + 'content/images/hipster.png');
            this.copy(WEBAPP_DIR + 'content/images/hipster2x.png', WEBAPP_DIR + 'content/images/hipster2x.png');

        },

        updateJsToHtml: function () {
            // Index page
            var indexFile = html.readFileAsString(path.join(this.sourceRoot(), WEBAPP_DIR + '_index.html'));

            indexFile = engine(indexFile, this, {});

            var appScripts = [
                'app/app.module.js',
                'app/app.config.js',
                'app/app.constants.js',
                // account
                'app/account/account.js',
                'app/account/activate/activate.js',
                'app/account/activate/activate.controller.js',
                'app/account/login/login.js',
                'app/account/login/login.controller.js',
                'app/account/password/password.js',
                'app/account/password/password.controller.js',
                'app/account/password/password.directive.js',
                'app/account/register/register.js',
                'app/account/register/register.controller.js',
                'app/account/settings/settings.js',
                'app/account/settings/settings.controller.js',
                'app/account/reset/finish/reset.finish.controller.js',
                'app/account/reset/finish/reset.finish.js',
                'app/account/reset/request/reset.request.controller.js',
                'app/account/reset/request/reset.request.js',
                // admin
                'app/admin/admin.js',
                'app/admin/audits/audits.js',
                'app/admin/audits/audits.controller.js',
                'app/admin/audits/audits.service.js',
                'app/admin/configuration/configuration.js',
                'app/admin/configuration/configuration.controller.js',
                'app/admin/configuration/configuration.service.js',
                'app/admin/docs/docs.js',
                'app/admin/health/health.js',
                'app/admin/health/health.controller.js',
                'app/admin/health/health.service.js',
                'app/admin/health/health.modal.controller.js',
                'app/admin/logs/logs.js',
                'app/admin/logs/logs.controller.js',
                'app/admin/logs/logs.service.js',
                'app/admin/metrics/metrics.js',
                'app/admin/metrics/metrics.controller.js',
                'app/admin/metrics/metrics.service.js',
                'app/admin/metrics/metrics.modal.controller.js',
                'app/admin/user-management/user-management-detail.controller.js',
                'app/admin/user-management/user-management-dialog.controller.js',
                'app/admin/user-management/user-management-delete-dialog.controller.js',
                'app/admin/user-management/user-management.controller.js',
                'app/admin/user-management/user-management.js',
                // components
                'app/components/form/form.directive.js',
                'app/components/form/maxbytes.directive.js',
                'app/components/form/minbytes.directive.js',
                'app/components/form/uib-pager.config.js',
                'app/components/form/uib-pagination.config.js',
                'app/components/form/pagination.constants.js',
                'app/components/interceptor/auth.interceptor.js',
                'app/components/interceptor/errorhandler.interceptor.js',
                'app/components/interceptor/notification.interceptor.js',
                'app/components/util/truncate.filter.js',
                'app/components/util/base64.service.js',
                'app/components/util/capitalize.filter.js',
                'app/components/alert/alert.service.js',
                'app/components/alert/alert.directive.js',
                'app/components/util/parse-links.service.js',
                'app/components/util/date-util.service.js',
                'app/components/util/data-util.service.js',
                'app/components/util/sort.directive.js',
                // entities
                'app/entities/entity.js',
                // home
                'app/home/home.js',
                'app/home/home.controller.js',
                // layouts
                'app/layouts/error/error.js',
                'app/layouts/navbar/navbar.directive.js',
                'app/layouts/navbar/navbar.controller.js',
                // services
                'app/services/auth/auth.service.js',
                'app/services/auth/principal.service.js',
                'app/services/auth/authority.directive.js',
                'app/services/auth/account.service.js',
                'app/services/auth/activate.service.js',
                'app/services/auth/password.service.js',
                'app/services/auth/register.service.js',
                'app/services/user/user.service.js'
            ];
            if (this.enableTranslation) {
                appScripts = appScripts.concat([
                    'bower_components/messageformat/locale/en.js',
                    'bower_components/messageformat/locale/fr.js',
                    'app/components/language/language.service.js',
                    'app/components/language/language.controller.js']);
            }
            if (this.enableSocialSignIn) {
                appScripts = appScripts.concat([
                    'app/account/social/directive/social.directive.js',
                    'app/account/social/social-register.js',
                    'app/account/social/social-register.controller.js',
                    'app/account/social/social.service.js']);
            }
            if (this.authenticationType == 'jwt') {
                appScripts = appScripts.concat([
                    'app/services/auth/auth.jwt.service.js']);
            }

            if (this.authenticationType == 'oauth2') {
                appScripts = appScripts.concat([
                    'app/services/auth/auth.oauth2.service.js']);
            }

            if (this.authenticationType == 'session') {
                appScripts = appScripts.concat([
                    'app/services/auth/sessions.service.js',
                    'app/services/auth/auth.session.service.js',
                    'app/account/sessions/sessions.js',
                    'app/account/sessions/sessions.controller.js']);
            }

            if (this.websocket == 'spring-websocket') {
                appScripts = appScripts.concat([
                    'app/admin/tracker/tracker.js',
                    'app/admin/tracker/tracker.controller.js',
                    'app/admin/tracker/tracker.service.js'])
            }

            if (this.applicationType == 'gateway') {
                appScripts = appScripts.concat([
                    'app/admin/gateway/gateway.js',
                    'app/admin/gateway/gateway.controler.js',
                    'app/admin/gateway/gateway.routes.service.js'])
            }

            indexFile = html.appendScripts(indexFile, 'app/app.js', appScripts, {});
            this.write(WEBAPP_DIR + 'index.html', indexFile);

        },

        writeClientTestFwFiles: function () {
            // Create Test Javascript files
            var testTemplates = [
                '_karma.conf.js',
                'spec/helpers/_module.js',
                'spec/helpers/_httpBackend.js',
                'spec/app/admin/health/_health.controller.spec.js',
                'spec/app/account/login/_login.controller.spec.js',
                'spec/app/account/password/_password.controller.spec.js',
                'spec/app/account/password/_password.directive.spec.js',
                'spec/app/account/settings/_settings.controller.spec.js',
                'spec/app/account/activate/_activate.controller.spec.js',
                'spec/app/account/register/_register.controller.spec.js',
                'spec/app/account/reset/finish/_reset.finish.controller.spec.js',
                'spec/app/account/reset/request/_reset.request.controller.spec.js',
                'spec/app/services/auth/_auth.services.spec.js'
            ];
            if (this.authenticationType == 'session') {
                testTemplates.push('spec/app/account/sessions/_sessions.controller.spec.js');
            }
            // Create Protractor test files
            if (this.testFrameworks.indexOf('protractor') != -1) {
                testTemplates.push('e2e/_account.js');
                testTemplates.push('e2e/_administration.js');
                testTemplates.push('_protractor.conf.js')
            }
            testTemplates.map(function(testTemplatePath) {
                this.template(TEST_JS_DIR + testTemplatePath, TEST_JS_DIR + testTemplatePath.replace(/_/,''), this, {});
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
                    '\n ' + chalk.yellow.bold('gulp wiredep') +
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
        this.log(chalk.green.bold('\nClient app generated succesfully.\n'));
    }

});
