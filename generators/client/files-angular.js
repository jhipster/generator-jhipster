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
                '_angular-cli.json',
                'webpack/_webpack.common.js',
                'webpack/_webpack.dev.js',
                'webpack/_webpack.prod.js'
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
                //since we use webpack-html-plugin to process the ejs later we need to use `<# #>` for ejs which needs to processed by generator
                { file: '_index.ejs', method: 'template', options: { delimiter: '#' }}
            ]
        }
    ],
    angularApp: [
        {
            path: ANGULAR_DIR,
            templates: [
                '_app.main.ts',
                '_app.module.ts',
                { file: '_app.state.ts', method: 'copyJs' },
                '_app.constants.ts',
                '_polyfills.ts',
                '_vendor.ts',
                'blocks/config/_register-transition-hooks.ts',
                'blocks/config/_router.config.ts',
                'blocks/config/_prod.config.ts',
                'blocks/config/_uib-pagination.config.ts',
                //interceptors
                'blocks/interceptor/_auth-expired.interceptor.ts',
                'blocks/interceptor/_errorhandler.interceptor.ts',
                'blocks/interceptor/_notification.interceptor.ts',
                'blocks/interceptor/_http.provider.ts'
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
                'entities/_index.ts',
                // home module
                'home/_index.ts',
                'home/_home.component.ts',
                { file: 'home/_home.state.ts', method: 'copyJs' },
                { file: 'home/_home.component.html', method: 'copyHtml' },
                // layouts
                'layouts/_index.ts',
                'layouts/profiles/_profile.service.ts',
                'layouts/profiles/_profile-info.model.ts',
                'layouts/profiles/_page-ribbon.component.ts',
                'layouts/main/_main.component.ts',
                'layouts/main/_main.component.html',
                { file: 'layouts/navbar/_navbar.component.ts', method: 'copyJs' },
                { file: 'layouts/navbar/_navbar.component.html', method: 'copyHtml' },
                'layouts/footer/_footer.component.ts',
                { file: 'layouts/footer/_footer.component.html', method: 'copyHtml' },
                'layouts/error/_error.component.ts',
                { file: 'layouts/error/_error.state.ts', method: 'copyJs' },
                { file: 'layouts/error/_error.component.html', method: 'copyHtml' }
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
                'account/_account.state.ts',
                'account/activate/_activate.component.ts',
                'account/activate/_activate.service.ts',
                { file: 'account/activate/_activate.component.html', method: 'copyHtml' },
                { file: 'account/activate/_activate.state.ts', method: 'copyJs' },
                'account/password/_password.component.ts',
                'account/password/_password.service.ts',
                { file: 'account/password/_password.component.html', method: 'copyHtml' },
                { file: 'account/password/_password.state.ts', method: 'copyJs' },
                'account/password/_password-strength-bar.component.ts',
                { file: 'account/register/_register.component.ts', method: 'copyJs' },
                'account/register/_register.service.ts',
                { file: 'account/register/_register.state.ts', method: 'copyJs' },
                { file: 'account/register/_register.component.html', method: 'copyHtml' },
                { file: 'account/password-reset/init/_password-reset-init.state.ts', method: 'copyJs' },
                'account/password-reset/init/_password-reset-init.component.ts',
                { file: 'account/password-reset/init/_password-reset-init.component.html', method: 'copyHtml' },
                'account/password-reset/init/_password-reset-init.service.ts',
                { file: 'account/password-reset/finish/_password-reset-finish.state.ts', method: 'copyJs' },
                'account/password-reset/finish/_password-reset-finish.component.ts',
                { file: 'account/password-reset/finish/_password-reset-finish.component.html', method: 'copyHtml' },
                'account/password-reset/finish/_password-reset-finish.service.ts',
                { file: 'account/settings/_settings.component.ts', method: 'copyJs' },
                { file: 'account/settings/_settings.component.html', method: 'copyHtml' },
                { file: 'account/settings/_settings.state.ts', method: 'copyJs' }
            ]
        },
        {
            condition: generator => generator.authenticationType === 'session',
            path: ANGULAR_DIR,
            templates: [
                { file: 'account/sessions/_sessions.state.ts', method: 'copyJs' },
                { file: 'account/sessions/_sessions.component.html', method: 'copyHtml' },
                'account/sessions/_sessions.component.ts',
                'account/sessions/_sessions.service.ts',
                'account/sessions/_session.model.ts'
            ]
        },
        {
            condition: generator => generator.enableSocialSignIn,
            path: ANGULAR_DIR,
            templates: [
                { file: 'shared/social/_social.component.html', method: 'copyHtml' },
                { file: 'account/social/_social-register.component.html', method: 'copyHtml' },
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
                'admin/_admin.state.ts',
                // admin modules
                'admin/audits/_audit-data.model.ts',
                'admin/audits/_audit.model.ts',
                'admin/audits/_audits.component.ts',
                { file: 'admin/audits/_audits.component.html', method: 'copyHtml' },
                { file: 'admin/audits/_audits.state.ts', method: 'copyJs' },
                'admin/audits/_audits.service.ts',
                'admin/configuration/_configuration.component.ts',
                { file: 'admin/configuration/_configuration.component.html', method: 'copyHtml' },
                { file: 'admin/configuration/_configuration.state.ts', method: 'copyJs' },
                'admin/configuration/_configuration.service.ts',
                'admin/docs/_docs.component.ts',
                'admin/docs/_docs.component.html',
                'admin/docs/_docs.state.ts',
                'admin/health/_health.component.ts',
                'admin/health/_health-modal.component.ts',
                'admin/health/_health.service.ts',
                { file: 'admin/health/_health.component.html', method: 'copyHtml' },
                { file: 'admin/health/_health-modal.component.html', method: 'copyHtml' },
                { file: 'admin/health/_health.state.ts', method: 'copyJs' },
                'admin/logs/_logs.component.ts',
                'admin/logs/_log.model.ts',
                'admin/logs/_logs.service.ts',
                { file: 'admin/logs/_logs.component.html', method: 'copyHtml' },
                { file: 'admin/logs/_logs.state.ts', method: 'copyJs' },
                'admin/metrics/_metrics.component.ts',
                'admin/metrics/_metrics-modal.component.ts',
                'admin/metrics/_metrics.service.ts',
                { file: 'admin/metrics/_metrics.component.html', method: 'copyHtml', template: true },
                { file: 'admin/metrics/_metrics-modal.component.html', method: 'copyHtml', template: true },
                { file: 'admin/metrics/_metrics.state.ts', method: 'copyJs' }
            ]
        },
        {
            condition: generator => generator.websocket === 'spring-websocket',
            path: ANGULAR_DIR,
            templates: [
                { file: 'admin/tracker/_tracker.state.ts', method: 'copyJs' },
                { file: 'admin/tracker/_tracker.component.html', method: 'copyHtml' },
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
                { file: 'admin/user-management/_user-management.component.html', method: 'copyHtml' },
                { file: 'admin/user-management/_user-management-detail.component.html', method: 'copyHtml' },
                { file: 'admin/user-management/_user-management-dialog.component.html', method: 'copyHtml' },
                { file: 'admin/user-management/_user-management-delete-dialog.component.html', method: 'copyHtml' }
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
                { file: 'admin/gateway/_gateway.component.html', method: 'copyHtml' }
            ]
        }
    ],
    angularShared: [
        {
            path: ANGULAR_DIR,
            templates: [
                'shared/_index.ts',
                'shared/_shared.module.ts',
                'shared/_shared-libs.module.ts',
                'shared/_shared-common.module.ts',
                'shared/constants/_pagination.constants.ts',
                //models
                'shared/model/_account.model.ts',
                //login
                { file: 'shared/login/_login.component.html', method: 'copyHtml' },
                'shared/login/_login.service.ts',
                'shared/login/_login-modal.service.ts',
                'shared/login/_login.component.ts',
                //alert service code
                'shared/alert/_alert.component.ts',
                'shared/alert/_alert-error.component.ts'
            ]
        },
        {
            condition: generator => generator.enableTranslation,
            path: ANGULAR_DIR,
            templates: [
                'shared/language/_language.pipe.ts',
                'shared/language/_language.constants.ts',
                'shared/language/_language.helper.ts'
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
                'shared/auth/_auth-oauth2.service.ts'
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
                'spec/_entry.ts',
                'spec/app/admin/health/_health.component.spec.ts',
                'spec/helpers/_spyobject.ts'
            ]
        },
        {
            condition: generator => generator.protractorTests,
            path: TEST_SRC_DIR,
            templates: [
                'e2e/account/_account.spec.ts',
                'e2e/admin/_administration.spec.ts',
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
    mkdirp(MAIN_SRC_DIR);
    // write angular 2.x and above files
    this.writeFilesToDisk(files, this, false, 'angular');
}
