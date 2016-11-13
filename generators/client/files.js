'use strict';

const mkdirp = require('mkdirp');
/* Constants use throughout */
const constants = require('../generator-constants'),
    MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR,
    TEST_SRC_DIR = constants.CLIENT_TEST_SRC_DIR,
    ANGULAR_DIR = constants.ANGULAR_DIR;

module.exports = {
    writeFiles
};

function writeFiles() {
    return {
        writeCommonFiles: function () {

            this.template('_package.json', 'package.json', this, {});
            this.template('_bower.json', 'bower.json', this, {});
            this.template('_.bowerrc', '.bowerrc', this, {});
            this.template('_.eslintrc.json', '.eslintrc.json', this, {});
            this.template('_.eslintignore', '.eslintignore', this, {});
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
            this.template(ANGULAR_DIR + 'blocks/config/_uib-pager.config.js', ANGULAR_DIR + 'blocks/config/uib-pager.config.js', this, {});
            this.template(ANGULAR_DIR + 'blocks/config/_uib-pagination.config.js', ANGULAR_DIR + 'blocks/config/uib-pagination.config.js', this, {});
        },

        writeAngularAuthFiles: function () {
            // account module
            this.template(ANGULAR_DIR + 'account/_account.state.js', ANGULAR_DIR + 'account/account.state.js', this, {});
            this.copyHtml(ANGULAR_DIR + 'account/activate/_activate.html', ANGULAR_DIR + 'account/activate/activate.html');
            this.copyJs(ANGULAR_DIR + 'account/activate/_activate.state.js', ANGULAR_DIR + 'account/activate/activate.state.js', this, {});
            this.template(ANGULAR_DIR + 'account/activate/_activate.controller.js', ANGULAR_DIR + 'account/activate/activate.controller.js', this, {});
            this.copyHtml(ANGULAR_DIR + 'account/password/_password.html', ANGULAR_DIR + 'account/password/password.html');
            this.copyJs(ANGULAR_DIR + 'account/password/_password.state.js', ANGULAR_DIR + 'account/password/password.state.js', this, {});
            this.template(ANGULAR_DIR + 'account/password/_password.controller.js', ANGULAR_DIR + 'account/password/password.controller.js', this, {});
            this.template(ANGULAR_DIR + 'account/password/_password-strength-bar.directive.js', ANGULAR_DIR + 'account/password/password-strength-bar.directive.js', this, {});
            this.copyHtml(ANGULAR_DIR + 'account/register/_register.html', ANGULAR_DIR + 'account/register/register.html');
            this.copyJs(ANGULAR_DIR + 'account/register/_register.state.js', ANGULAR_DIR + 'account/register/register.state.js', this, {});
            this.template(ANGULAR_DIR + 'account/register/_register.controller.js', ANGULAR_DIR + 'account/register/register.controller.js', this, {});
            this.copyHtml(ANGULAR_DIR + 'account/reset/request/_reset.request.html', ANGULAR_DIR + 'account/reset/request/reset.request.html');
            this.copyJs(ANGULAR_DIR + 'account/reset/request/_reset.request.state.js', ANGULAR_DIR + 'account/reset/request/reset.request.state.js', this, {});
            this.template(ANGULAR_DIR + 'account/reset/request/_reset.request.controller.js', ANGULAR_DIR + 'account/reset/request/reset.request.controller.js', this, {});
            this.copyHtml(ANGULAR_DIR + 'account/reset/finish/_reset.finish.html', ANGULAR_DIR + 'account/reset/finish/reset.finish.html');
            this.copyJs(ANGULAR_DIR + 'account/reset/finish/_reset.finish.state.js', ANGULAR_DIR + 'account/reset/finish/reset.finish.state.js', this, {});
            this.template(ANGULAR_DIR + 'account/reset/finish/_reset.finish.controller.js', ANGULAR_DIR + 'account/reset/finish/reset.finish.controller.js', this, {});
            if (this.authenticationType === 'session') {
                this.copyHtml(ANGULAR_DIR + 'account/sessions/_sessions.html', ANGULAR_DIR + 'account/sessions/sessions.html');
                this.copyJs(ANGULAR_DIR + 'account/sessions/_sessions.state.js', ANGULAR_DIR + 'account/sessions/sessions.state.js', this, {});
                this.template(ANGULAR_DIR + 'account/sessions/_sessions.controller.js', ANGULAR_DIR + 'account/sessions/sessions.controller.js', this, {});
            }
            this.copyHtml(ANGULAR_DIR + 'account/settings/_settings.html', ANGULAR_DIR + 'account/settings/settings.html');
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
            this.copyHtml(ANGULAR_DIR + 'admin/audits/_audits.html', ANGULAR_DIR + 'admin/audits/audits.html');
            this.copyJs(ANGULAR_DIR + 'admin/audits/_audits.state.js', ANGULAR_DIR + 'admin/audits/audits.state.js', this, {});
            this.template(ANGULAR_DIR + 'admin/audits/_audits.controller.js', ANGULAR_DIR + 'admin/audits/audits.controller.js', this, {});
            this.template(ANGULAR_DIR + 'admin/audits/_audits.service.js', ANGULAR_DIR + 'admin/audits/audits.service.js', this, {});
            this.copyHtml(ANGULAR_DIR + 'admin/configuration/_configuration.html', ANGULAR_DIR + 'admin/configuration/configuration.html');
            this.copyJs(ANGULAR_DIR + 'admin/configuration/_configuration.state.js', ANGULAR_DIR + 'admin/configuration/configuration.state.js', this, {});
            this.template(ANGULAR_DIR + 'admin/configuration/_configuration.controller.js', ANGULAR_DIR + 'admin/configuration/configuration.controller.js', this, {});
            this.template(ANGULAR_DIR + 'admin/configuration/_configuration.service.js', ANGULAR_DIR + 'admin/configuration/configuration.service.js', this, {});
            this.copy(ANGULAR_DIR + 'admin/docs/_docs.html', ANGULAR_DIR + 'admin/docs/docs.html');
            this.copyJs(ANGULAR_DIR + 'admin/docs/_docs.state.js', ANGULAR_DIR + 'admin/docs/docs.state.js', this, {});
            this.copyHtml(ANGULAR_DIR + 'admin/health/_health.html', ANGULAR_DIR + 'admin/health/health.html');
            this.copyHtml(ANGULAR_DIR + 'admin/health/_health.modal.html', ANGULAR_DIR + 'admin/health/health.modal.html');
            this.copyJs(ANGULAR_DIR + 'admin/health/_health.state.js', ANGULAR_DIR + 'admin/health/health.state.js', this, {});
            this.template(ANGULAR_DIR + 'admin/health/_health.controller.js', ANGULAR_DIR + 'admin/health/health.controller.js', this, {});
            this.template(ANGULAR_DIR + 'admin/health/_health.modal.controller.js', ANGULAR_DIR + 'admin/health/health.modal.controller.js', this, {});
            this.template(ANGULAR_DIR + 'admin/health/_health.service.js', ANGULAR_DIR + 'admin/health/health.service.js', this, {});
            this.copyHtml(ANGULAR_DIR + 'admin/logs/_logs.html', ANGULAR_DIR + 'admin/logs/logs.html');
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
                this.copyHtml(ANGULAR_DIR + 'admin/tracker/_tracker.html', ANGULAR_DIR + 'admin/tracker/tracker.html');
                this.copyJs(ANGULAR_DIR + 'admin/tracker/_tracker.state.js', ANGULAR_DIR + 'admin/tracker/tracker.state.js', this, {});
                this.template(ANGULAR_DIR + 'admin/tracker/_tracker.controller.js', ANGULAR_DIR + 'admin/tracker/tracker.controller.js', this, {});
                this.template(ANGULAR_DIR + 'admin/tracker/_tracker.service.js', ANGULAR_DIR + 'admin/tracker/tracker.service.js', this, {});
            }
        },

        writeAngularUserMgmntFiles: function () {
            if (this.skipUserManagement) return;

            this.copyHtml(ANGULAR_DIR + 'admin/user-management/_user-management.html', ANGULAR_DIR + 'admin/user-management/user-management.html');
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

            this.copyHtml(ANGULAR_DIR + 'admin/gateway/_gateway.html', ANGULAR_DIR + 'admin/gateway/gateway.html');
            this.copyJs(ANGULAR_DIR + 'admin/gateway/_gateway.state.js', ANGULAR_DIR + 'admin/gateway/gateway.state.js', this, {});
            this.copyJs(ANGULAR_DIR + 'admin/gateway/_gateway.controller.js', ANGULAR_DIR + 'admin/gateway/gateway.controller.js', this, {});
            this.copyJs(ANGULAR_DIR + 'admin/gateway/_gateway.routes.service.js', ANGULAR_DIR + 'admin/gateway/gateway.routes.service.js', this, {});
        },

        writeAngularComponentFiles: function () {
            //components
            this.template(ANGULAR_DIR + 'components/form/_show-validation.directive.js', ANGULAR_DIR + 'components/form/show-validation.directive.js', this, {});
            this.template(ANGULAR_DIR + 'components/form/_maxbytes.directive.js', ANGULAR_DIR + 'components/form/maxbytes.directive.js', this, {});
            this.template(ANGULAR_DIR + 'components/form/_minbytes.directive.js', ANGULAR_DIR + 'components/form/minbytes.directive.js', this, {});
            this.template(ANGULAR_DIR + 'components/form/_pagination.constants.js', ANGULAR_DIR + 'components/form/pagination.constants.js', this, {});
            if (this.enableTranslation) {
                this.template(ANGULAR_DIR + 'components/language/_language.filter.js', ANGULAR_DIR + 'components/language/language.filter.js', this, {});
                this.template(ANGULAR_DIR + 'components/language/_language.constants.js', ANGULAR_DIR + 'components/language/language.constants.js', this, {});
                this.template(ANGULAR_DIR + 'components/language/_language.controller.js', ANGULAR_DIR + 'components/language/language.controller.js', this, {});
                this.template(ANGULAR_DIR + 'components/language/_language.service.js', ANGULAR_DIR + 'components/language/language.service.js', this, {});
            }
            this.copyHtml(ANGULAR_DIR + 'components/login/_login.html', ANGULAR_DIR + 'components/login/login.html');
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
            this.copyHtml(ANGULAR_DIR + 'home/_home.html', ANGULAR_DIR + 'home/home.html');
            this.copyJs(ANGULAR_DIR + 'home/_home.state.js', ANGULAR_DIR + 'home/home.state.js', this, {});
            this.template(ANGULAR_DIR + 'home/_home.controller.js', ANGULAR_DIR + 'home/home.controller.js', this, {});

            // layouts
            if (this.enableTranslation) {
                this.template(ANGULAR_DIR + 'layouts/navbar/_active-menu.directive.js', ANGULAR_DIR + 'layouts/navbar/active-menu.directive.js', this, {});
            }
            this.copyHtml(ANGULAR_DIR + 'layouts/navbar/_navbar.html', ANGULAR_DIR + 'layouts/navbar/navbar.html');
            this.template(ANGULAR_DIR + 'layouts/navbar/_navbar.controller.js', ANGULAR_DIR + 'layouts/navbar/navbar.controller.js', this, {});
            this.copyHtml(ANGULAR_DIR + 'layouts/error/_error.html', ANGULAR_DIR + 'layouts/error/error.html');
            this.copyHtml(ANGULAR_DIR + 'layouts/error/_accessdenied.html', ANGULAR_DIR + 'layouts/error/accessdenied.html');
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
    };
}
