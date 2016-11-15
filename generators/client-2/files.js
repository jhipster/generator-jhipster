'use strict';

const mkdirp = require('mkdirp');
/* Constants use throughout */
const constants = require('../generator-constants'),
    MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR,
    TEST_SRC_DIR = constants.CLIENT_TEST_SRC_DIR,
    ANGULAR_DIR = constants.ANGULAR_DIR;

/**
 * The default is to use a file path string. It implies use of the template method.
 * For any other config an object { file:.., method:.., template:.. } can be used
*/
const files = {
    common: [
        {
            templates: [
                '_package.json',
                '_tsconfig.json',
                '_tslint.json',
                '_.eslintrc.json',
                '_.eslintignore',
                '_webpack.config.js',
                '_webpack-dev',
            ]
        }
    ],
    css: [
        // this css file will be overwritten by the sass generated css if sass is enabled
        // but this will avoid errors when running app without running sass task first
        {
            path: MAIN_SRC_DIR,
            templates: [
                'content/css/_main.css',
                { file: 'content/css/_documentation.css', method: 'copy' }
            ]
        }
    ],
    sass: [
        {
            condition: generator => generator.useSass,
            path: MAIN_SRC_DIR,
            templates: [
                'scss/_main.scss',
                'scss/_vendor.scss'
            ]
        }
    ],
    image: [
        {
            path: MAIN_SRC_DIR,
            templates: [
                { file: 'content/images/_hipster.png', method: 'copy' },
                { file: 'content/images/_hipster2x.png', method: 'copy' },
                { file: 'content/images/_logo-jhipster.png', method: 'copy' }
            ]
        }
    ],
    swagger: [
        {
            path: MAIN_SRC_DIR,
            templates: [
                'swagger-ui/_index.html',
                { file: 'swagger-ui/images/_throbber.gif', method: 'copy' }
            ]
        }
    ],
    commonWeb: [
        {
            path: MAIN_SRC_DIR,
            templates: [
                { file: '_favicon.ico', method: 'copy' },
                { file: '_robots.txt', method: 'copy' },
                { file: '_404.html', method: 'copy' },
                { file: '_index.html', method: 'copyHtml' }
            ]
        }
    ],
    angularApp: [
        {
            path: ANGULAR_DIR,
            templates: [
                '_upgrade_adapter.ts',
                '_app.main.ts',
                '_app.module.ts',
                '_app.ng2module.ts',
                '_app.state.ts',
                '_app.constants.ts',
                '_polyfills.ts',
                '_vendor.ts',
                'blocks/config/_register-transition-hooks.ts',
                'blocks/config/_router.config.ts',
                'blocks/config/_http.config.ts',
                'blocks/config/_localstorage.config.ts',
                'blocks/config/_compile.config.ts',
                'blocks/config/_uib-pager.config.ts',
                'blocks/config/_uib-pagination.config.ts',
                //interceptors
                'blocks/interceptor/_auth-expired.interceptor.ts',
                'blocks/interceptor/_errorhandler.interceptor.ts',
                'blocks/interceptor/_notification.interceptor.ts'
            ]
        },
        {
            condition: generator => generator.enableTranslation,
            path: ANGULAR_DIR,
            templates: [
                'blocks/config/_translation.config.ts',
                'blocks/config/_translation-storage.provider.ts'
            ]
        },
        {
            condition: generator => generator.authenticationType === 'oauth2' || generator.authenticationType === 'jwt' || generator.authenticationType === 'uaa',
            path: ANGULAR_DIR,
            templates: [
                'blocks/interceptor/_auth.interceptor.ts'
            ]
        }
    ],
    angularMain: [
        {
            path: ANGULAR_DIR,
            templates: [
                // entities
                'entities/_entity.module.ts',
                'entities/_entity.state.ts',
                // home module
                'home/_index.ts',
                'home/_home.component.ts',
                { file: 'home/_home.state.ts', method: 'copyJs' },
                { file: 'home/_home.html', method: 'copyHtml' },
                // layouts
                'layouts/_index.ts',
                'layouts/profiles/_profile.service.ts',
                'layouts/profiles/_profile-info.model.ts',
                'layouts/profiles/_page-ribbon.component.ts',
                'layouts/main/_main.component.ts',
                'layouts/main/_main.html',
                'layouts/navbar/_navbar.component.ts',
                { file: 'layouts/navbar/_navbar.html', method: 'copyHtml' },
                'layouts/footer/_footer.component.ts',
                { file: 'layouts/footer/_footer.html', method: 'copyHtml' },
                'layouts/error/_error.component.ts',
                { file: 'layouts/error/_error.state.ts', method: 'copyJs' },
                { file: 'layouts/error/_error.html', method: 'copyHtml' }
            ]
        },
        {
            condition: generator => generator.enableTranslation,
            path: ANGULAR_DIR,
            templates: [
                'layouts/navbar/_active-menu.directive.ts'
            ]
        }
    ],
    angularAccountModule: [
        {
            path: ANGULAR_DIR,
            templates: [
                'account/_index.ts',
                'account/_account.module.ts',
                'account/_account.ng2module.ts',
                'account/_account.state.ts',
                'account/activate/_activate.component.ts',
                'account/activate/_activate.service.ts',
                { file: 'account/activate/_activate.html', method: 'copyHtml' },
                { file: 'account/activate/_activate.state.ts', method: 'copyJs' },
                'account/password/_password.component.ts',
                'account/password/_password.service.ts',
                { file: 'account/password/_password.html', method: 'copyHtml' },
                { file: 'account/password/_password.state.ts', method: 'copyJs' },
                'account/password/_password-strength-bar.component.ts',
                'account/register/_register.component.ts',
                'account/register/_register.service.ts',
                { file: 'account/register/_register.state.ts', method: 'copyJs' },
                { file: 'account/register/_register.html', method: 'copyHtml' },
                { file: 'account/password-reset/init/_password-reset-init.state.ts', method: 'copyJs' },
                'account/password-reset/init/_password-reset-init.component.ts',
                { file: 'account/password-reset/init/_password-reset-init.html', method: 'copyHtml' },
                'account/password-reset/init/_password-reset-init.service.ts',
                { file: 'account/password-reset/finish/_password-reset-finish.state.ts', method: 'copyJs' },
                'account/password-reset/finish/_password-reset-finish.component.ts',
                { file: 'account/password-reset/finish/_password-reset-finish.html', method: 'copyHtml' },
                'account/password-reset/finish/_password-reset-finish.service.ts',
                'account/settings/_settings.component.ts',
                { file: 'account/settings/_settings.html', method: 'copyHtml' },
                { file: 'account/settings/_settings.state.ts', method: 'copyJs' }
            ]
        },
        {
            condition: generator => generator.authenticationType === 'session',
            path: ANGULAR_DIR,
            templates: [
                { file: 'account/sessions/_sessions.state.ts', method: 'copyJs' },
                { file: 'account/sessions/_sessions.html', method: 'copyHtml' },
                'account/sessions/_sessions.component.ts',
                'account/sessions/_sessions.service.ts',
                'account/sessions/_session.model.ts'
            ]
        },
        {
            condition: generator => generator.enableSocialSignIn,
            path: ANGULAR_DIR,
            templates: [
                { file: 'account/social/_social.html', method: 'copyHtml' },
                { file: 'account/social/_social-register.html', method: 'copyHtml' },
                'account/social/_social-register.component.ts',
                'shared/social/_social.component.ts',
                'shared/social/_social.service.ts',
                { file: 'account/social/_social.state.ts', method: 'copyJs' }
            ]
        },
        {
            condition: generator => generator.enableSocialSignIn && generator.authenticationType === 'jwt',
            path: ANGULAR_DIR,
            templates: [
                'account/social/_social-auth.component.ts'
            ]
        }
    ],
    angularAdminModule: [
        {
            path: ANGULAR_DIR,
            templates: [
                'admin/_index.ts',
                'admin/_admin.module.ts',
                'admin/_admin.ng2module.ts',
                'admin/_admin.state.ts',
                // admin modules
                'admin/audits/_audit-data.model.ts',
                'admin/audits/_audit.model.ts',
                'admin/audits/_audits.component.ts',
                { file: 'admin/audits/_audits.component.html', method: 'copyHtml' },
                { file: 'admin/audits/_audits.state.ts', method: 'copyJs' },
                'admin/audits/_audits.service.ts',
                'admin/configuration/_configuration.component.ts',
                { file: 'admin/configuration/_configuration.html', method: 'copyHtml' },
                { file: 'admin/configuration/_configuration.state.ts', method: 'copyJs' },
                'admin/configuration/_configuration.service.ts',
                'admin/docs/_docs.component.ts',
                'admin/docs/_docs.html',
                'admin/docs/_docs.state.ts',
                'admin/health/_health.component.ts',
                'admin/health/_health-modal.component.ts',
                'admin/health/_health.service.ts',
                { file: 'admin/health/_health.html', method: 'copyHtml' },
                { file: 'admin/health/_health-modal.html', method: 'copyHtml' },
                { file: 'admin/health/_health.state.ts', method: 'copyJs' },
                'admin/logs/_logs.component.ts',
                'admin/logs/_log.model.ts',
                'admin/logs/_logs.service.ts',
                { file: 'admin/logs/_logs.html', method: 'copyHtml' },
                { file: 'admin/logs/_logs.state.ts', method: 'copyJs' },
                'admin/metrics/_metrics.component.ts',
                'admin/metrics/_metrics-modal.component.ts',
                'admin/metrics/_metrics.service.ts',
                { file: 'admin/metrics/_metrics.html', method: 'copyHtml', template: true },
                { file: 'admin/metrics/_metrics-modal.html', method: 'copyHtml', template: true },
                { file: 'admin/metrics/_metrics.state.ts', method: 'copyJs' }
            ]
        },
        {
            condition: generator => generator.websocket === 'spring-websocket',
            path: ANGULAR_DIR,
            templates: [
                { file: 'admin/tracker/_tracker.state.ts', method: 'copyJs' },
                { file: 'admin/tracker/_tracker.html', method: 'copyHtml' },
                'admin/tracker/_tracker.component.ts',
                'shared/tracker/_tracker.service.ts'
            ]
        },
        {
            condition: generator => !generator.skipUserManagement,
            path: ANGULAR_DIR,
            templates: [
                'admin/user-management/_user-management.component.ts',
                'admin/user-management/_user-management-detail.component.ts',
                'admin/user-management/_user-management-dialog.component.ts',
                'admin/user-management/_user-management-delete-dialog.component.ts',
                'admin/user-management/_user.model.ts',
                'admin/user-management/_user.service.ts',
                { file: 'admin/user-management/_user-management.state.ts', method: 'copyJs' },
                { file: 'admin/user-management/user-management.html', method: 'copyHtml' },
                { file: 'admin/user-management/_user-management-detail.html', method: 'copyHtml' },
                { file: 'admin/user-management/_user-management-dialog.html', method: 'copyHtml' },
                { file: 'admin/user-management/_user-management-delete-dialog.html', method: 'copyHtml' }
            ]
        },
        {
            condition: generator => generator.applicationType === 'gateway',
            path: ANGULAR_DIR,
            templates: [
                'admin/gateway/_gateway.component.ts',
                'admin/gateway/_gateway-routes.service.ts',
                'admin/gateway/_gateway-route.model.ts',
                { file: 'admin/gateway/_gateway.state.ts', method: 'copyJs' },
                { file: 'admin/gateway/_gateway.html', method: 'copyHtml' }
            ]
        }
    ],
    angularShared: [
        {
            path: ANGULAR_DIR,
            templates: [
                'shared/_index.ts',
                'shared/_shared.ng2module.ts',
                'shared/_shared-libs.ng2module.ts',
                'shared/_shared-common.ng2module.ts',
                'shared/constants/_pagination.constants.ts',
                //models
                'shared/model/_account.model.ts',
                //pipes
                'shared/pipe/_keys.pipe.ts',
                'shared/pipe/_filter.pipe.ts',
                'shared/pipe/_order-by.pipe.ts',
                'shared/pipe/_capitalize.pipe.ts',
                'shared/pipe/_truncate-characters.pipe.ts',
                'shared/pipe/_truncate-words.pipe.ts',
                //directives
                'shared/directive/_sort.directive.ts',
                'shared/directive/_sort-by.directive.ts',
                'shared/directive/_show-validation.directive.ts',
                'shared/directive/_maxbytes.directive.ts',
                'shared/directive/_minbytes.directive.ts',
                'shared/directive/_number-of-bytes.ts',
                //services
                'shared/service/_date-util.service.ts',
                'shared/service/_data-util.service.ts',
                'shared/service/_pagination-util.service.ts',
                'shared/service/_parse-links.service.ts',
                //components
                'shared/component/_jhi-item-count.component.ts',
                //login
                { file: 'shared/login/_login.html', method: 'copyHtml' },
                'shared/login/_login.service.ts',
                'shared/login/_login-modal.service.ts',
                'shared/login/_login.component.ts',
                //alert service code
                'shared/alert/_alert.service.ts',
                'shared/alert/_alert.provider.ts',
                'shared/alert/_alert.component.ts',
                'shared/alert/_alert-error.component.ts'
            ]
        },
        {
            condition: generator => generator.enableTranslation,
            path: ANGULAR_DIR,
            templates: [
                'shared/language/_jhi-translate.directive.ts',
                'shared/language/_translate-partial-loader.provider.ts',
                'shared/language/_language.pipe.ts',
                'shared/language/_language.constants.ts',
                'shared/language/_language.service.ts',
                'shared/language/_jhi-missing-translation.config.ts'
            ]
        }
    ],
    angularAuthService: [
        {
            path: ANGULAR_DIR,
            templates: [
                'shared/auth/_auth.service.ts',
                'shared/auth/_csrf.service.ts',
                'shared/auth/_state-storage.service.ts',
                'shared/auth/_principal.service.ts',
                'shared/auth/_has-authority.directive.ts',
                'shared/auth/_has-any-authority.directive.ts',
                'shared/auth/_account.service.ts'
            ]
        },
        {
            condition: generator => generator.authenticationType === 'oauth2',
            path: ANGULAR_DIR,
            templates: [
                'shared/auth/_auth-oauth2.service.ts',
                'shared/auth/_base64.service.ts'
            ]
        },
        {
            condition: generator => generator.authenticationType === 'jwt' || generator.authenticationType === 'uaa',
            path: ANGULAR_DIR,
            templates: [
                'shared/auth/_auth-jwt.service.ts'
            ]
        },
        {
            condition: generator => generator.authenticationType === 'session',
            path: ANGULAR_DIR,
            templates: [
                'shared/auth/_auth-session.service.ts'
            ]
        }
    ],
    clientTestFw: [
        {
            path: TEST_SRC_DIR,
            templates: [
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
            ]
        },
        {
            condition: generator => generator.authenticationType === 'session',
            path: TEST_SRC_DIR,
            templates: [
                'spec/app/account/sessions/_sessions.controller.spec.js'
            ]
        },
        {
            condition: generator => generator.testFrameworks.indexOf('protractor') !== -1,
            path: TEST_SRC_DIR,
            templates: [
                'e2e/account/_account.js',
                'e2e/admin/_administration.js',
                '_protractor.conf.js'
            ]
        }
    ]
};

module.exports = {
    writeFiles,
    files
};

function writeFiles() {
    return {
        writeSepcial: function () {
            mkdirp(MAIN_SRC_DIR);
        },

        writeAllFiles: function () {
            this.writeFilesToDisk(files);
        }
    };
}
