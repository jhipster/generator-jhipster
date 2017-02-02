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
                'webpack/_webpack.prod.js',
                'webpack/_webpack.vendor.js'
            ]
        }
    ],
    css: [
        // this css file will be overwritten by the sass generated css if sass is enabled
        // but this will avoid errors when running app without running sass task first
        {
            condition: generator => !generator.useSass,
            path: MAIN_SRC_DIR,
            templates: [
                'content/css/_global.css',
                'content/css/_vendor.css',
                { file: 'content/css/_documentation.css', method: 'copy' }
            ]
        }
    ],
    sass: [
        {
            condition: generator => generator.useSass,
            path: MAIN_SRC_DIR,
            templates: [
                'content/scss/_global.scss',
                'content/scss/_vendor.scss',
            ]
        },
        {
            condition: generator => generator.useSass,
            templates: [
                { file: '_postcss.config.js', method: 'copy' }
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
                { file: '_index.html', method: 'template'}
            ]
        }
    ],
    angularApp: [
        {
            path: ANGULAR_DIR,
            templates: [
                '_app.main.ts',
                '_app.route.ts',
                '_app.module.ts',
                '_app.constants.ts',
                '_polyfills.ts',
                '_vendor.ts',
                'blocks/config/_prod.config.ts',
                'blocks/config/_uib-pagination.config.ts',
                //interceptors
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
        },
        {
            condition: generator => !generator.skipServer,
            path: ANGULAR_DIR,
            templates: [
                'blocks/interceptor/_auth-expired.interceptor.ts'
            ]
        }
    ],
    angularMain: [
        {
            path: ANGULAR_DIR,
            templates: [
                // entities
                'entities/_entity.module.ts',
                // home module
                'home/_index.ts',
                { file: 'home/_home.route.ts', method: 'copyJs' },
                { file: 'home/_home.component.ts', method: 'copyJs' },
                { file: 'home/_home.component.html', method: 'copyHtml' },
                // layouts
                'layouts/_index.ts',
                'layouts/_layout-routing.module.ts',
                'layouts/profiles/_page-ribbon.component.ts',
                'layouts/profiles/_profile.service.ts',
                'layouts/profiles/_profile-info.model.ts',
                'layouts/main/_main.component.ts',
                'layouts/main/_main.component.html',
                { file: 'layouts/navbar/_navbar.component.ts', method: 'copyJs' },
                { file: 'layouts/navbar/_navbar.component.html', method: 'copyHtml' },
                'layouts/footer/_footer.component.ts',
                { file: 'layouts/footer/_footer.component.html', method: 'copyHtml' },
                { file:'layouts/error/_error.route.ts', method: 'copyJs' },
                { file: 'layouts/error/_error.component.ts', method: 'copyJs' },
                { file: 'layouts/error/_error.component.html', method: 'copyHtml' }
            ]
        },
        {
            condition: generator => generator.enableTranslation,
            path: ANGULAR_DIR,
            templates: [
                'layouts/navbar/_active-menu.directive.ts'
            ]
        },
        {
            condition: generator => generator.useSass,
            path: ANGULAR_DIR,
            templates: [
                'layouts/profiles/_page-ribbon.scss',
                'layouts/navbar/_navbar.scss',
                'home/_home.scss'
            ]
        },
        {
            condition: generator => !generator.useSass,
            path: ANGULAR_DIR,
            templates: [
                'layouts/profiles/_page-ribbon.css',
                'layouts/navbar/_navbar.css',
                'home/_home.css'
            ]
        },
    ],
    angularAccountModule: [
        {
            path: ANGULAR_DIR,
            templates: [
                'account/_index.ts',
                { file: 'account/_account.route.ts', method: 'copyJs' },
                'account/_account.module.ts',
                { file: 'account/activate/_activate.route.ts', method: 'copyJs' },
                { file: 'account/activate/_activate.component.ts', method: 'copyJs' },
                { file: 'account/activate/_activate.component.html', method: 'copyHtml' },
                'account/activate/_activate.service.ts',
                { file:'account/password/_password.route.ts', method: 'copyJs' },
                'account/password/_password-strength-bar.component.ts',
                { file: 'account/password/_password.component.ts', method: 'copyJs' },
                { file: 'account/password/_password.component.html', method: 'copyHtml' },
                'account/password/_password.service.ts',
                { file: 'account/register/_register.route.ts', method: 'copyJs' },
                { file: 'account/register/_register.component.ts', method: 'copyJs' },
                { file: 'account/register/_register.component.html', method: 'copyHtml' },
                'account/register/_register.service.ts',
                { file: 'account/password-reset/init/_password-reset-init.route.ts', method: 'copyJs' },
                { file: 'account/password-reset/init/_password-reset-init.component.ts', method: 'copyJs' },
                { file: 'account/password-reset/init/_password-reset-init.component.html', method: 'copyHtml' },
                'account/password-reset/init/_password-reset-init.service.ts',
                { file: 'account/password-reset/finish/_password-reset-finish.route.ts', method: 'copyJs' },
                { file: 'account/password-reset/finish/_password-reset-finish.component.ts', method: 'copyJs' },
                { file: 'account/password-reset/finish/_password-reset-finish.component.html', method: 'copyHtml' },
                'account/password-reset/finish/_password-reset-finish.service.ts',
                { file: 'account/settings/_settings.route.ts', method: 'copyJs' },
                { file: 'account/settings/_settings.component.ts', method: 'copyJs' },
                { file: 'account/settings/_settings.component.html', method: 'copyHtml' }
            ]
        },
        {
            condition: generator => generator.authenticationType === 'session',
            path: ANGULAR_DIR,
            templates: [
                { file: 'account/sessions/_sessions.route.ts', method: 'copyJs' },
                'account/sessions/_session.model.ts',
                { file: 'account/sessions/_sessions.component.ts', method: 'copyJs' },
                { file: 'account/sessions/_sessions.component.html', method: 'copyHtml' },
                'account/sessions/_sessions.service.ts'
            ]
        },
        {
            condition: generator => generator.enableSocialSignIn,
            path: ANGULAR_DIR,
            templates: [
                { file: 'account/social/_social.route.ts', method: 'copyJs' },
                { file: 'account/social/_social-register.component.ts', method: 'copyJs' },
                { file: 'account/social/_social-register.component.html', method: 'copyHtml' },
                { file: 'shared/social/_social.component.ts', method: 'copyJs' },
                { file: 'shared/social/_social.component.html', method: 'copyHtml' },
                'shared/social/_social.service.ts'
            ]
        },
        {
            condition: generator => generator.enableSocialSignIn && generator.authenticationType === 'jwt',
            path: ANGULAR_DIR,
            templates: [
                { file: 'account/social/_social-auth.component.ts', method: 'copyJs' },
            ]
        },
        {
            condition: generator => generator.useSass,
            path: ANGULAR_DIR,
            templates: [
                'account/password/_password-strength-bar.scss'
            ]
        },
        {
            condition: generator => !generator.useSass,
            path: ANGULAR_DIR,
            templates: [
                'account/password/_password-strength-bar.css'
            ]
        }
    ],
    angularAdminModule: [
        {
            path: ANGULAR_DIR,
            templates: [
                'admin/_index.ts',
                { file: 'admin/_admin.route.ts', method: 'copyJs' },
                'admin/_admin.module.ts',
                // admin modules
                { file: 'admin/audits/_audits.route.ts', method: 'copyJs' },
                'admin/audits/_audit-data.model.ts',
                'admin/audits/_audit.model.ts',
                { file: 'admin/audits/_audits.component.ts', method: 'copyJs' },
                { file: 'admin/audits/_audits.component.html', method: 'copyHtml' },
                'admin/audits/_audits.service.ts',
                { file: 'admin/configuration/_configuration.route.ts', method: 'copyJs' },
                { file: 'admin/configuration/_configuration.component.ts', method: 'copyJs' },
                { file: 'admin/configuration/_configuration.component.html', method: 'copyHtml' },
                'admin/configuration/_configuration.service.ts',
                { file: 'admin/docs/_docs.route.ts', method: 'copyJs' },
                { file: 'admin/docs/_docs.component.ts', method: 'copyJs' },
                'admin/docs/_docs.component.html',
                { file: 'admin/health/_health.route.ts', method: 'copyJs' },
                { file: 'admin/health/_health.component.ts', method: 'copyJs' },
                { file: 'admin/health/_health.component.html', method: 'copyHtml' },
                'admin/health/_health-modal.component.ts',
                { file: 'admin/health/_health-modal.component.html', method: 'copyHtml' },
                'admin/health/_health.service.ts',
                { file: 'admin/logs/_logs.route.ts', method: 'copyJs' },
                'admin/logs/_log.model.ts',
                { file: 'admin/logs/_logs.component.ts', method: 'copyJs' },
                { file: 'admin/logs/_logs.component.html', method: 'copyHtml' },
                'admin/logs/_logs.service.ts',
                { file: 'admin/metrics/_metrics.route.ts', method: 'copyJs' },
                { file: 'admin/metrics/_metrics.component.ts', method: 'copyJs' },
                { file: 'admin/metrics/_metrics.component.html', method: 'copyHtml', template: true },
                'admin/metrics/_metrics-modal.component.ts',
                { file: 'admin/metrics/_metrics-modal.component.html', method: 'copyHtml', template: true },
                'admin/metrics/_metrics.service.ts'
            ]
        },
        {
            condition: generator => generator.websocket === 'spring-websocket',
            path: ANGULAR_DIR,
            templates: [
                { file: 'admin/tracker/_tracker.route.ts', method: 'copyJs' },
                { file: 'admin/tracker/_tracker.component.ts', method: 'copyJs' },
                { file: 'admin/tracker/_tracker.component.html', method: 'copyHtml' },
                'shared/tracker/_tracker.service.ts'
            ]
        },
        {
            condition: generator => !generator.skipUserManagement,
            path: ANGULAR_DIR,
            templates: [
                { file: 'admin/user-management/_user-management.route.ts', method: 'copyJs' },
                { file: 'admin/user-management/_user-management.component.ts', method: 'copyJs' },
                { file: 'admin/user-management/_user-management.component.html', method: 'copyHtml' },
                { file: 'admin/user-management/_user-management-detail.component.ts', method: 'copyJs' },
                { file: 'admin/user-management/_user-management-detail.component.html', method: 'copyHtml' },
                { file: 'admin/user-management/_user-management-dialog.component.ts', method: 'copyJs' },
                { file: 'admin/user-management/_user-management-dialog.component.html', method: 'copyHtml' },
                { file: 'admin/user-management/_user-management-delete-dialog.component.ts', method: 'copyJs' },
                { file: 'admin/user-management/_user-management-delete-dialog.component.html', method: 'copyHtml' },
                'admin/user-management/_user-modal.service.ts'
            ]
        },
        {
            condition: generator => generator.applicationType === 'gateway',
            path: ANGULAR_DIR,
            templates: [
                { file: 'admin/gateway/_gateway.route.ts', method: 'copyJs' },
                'admin/gateway/_gateway-route.model.ts',
                { file: 'admin/gateway/_gateway.component.ts', method: 'copyJs' },
                { file: 'admin/gateway/_gateway.component.html', method: 'copyHtml' },
                'admin/gateway/_gateway-routes.service.ts'
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
                'shared/user/_account.model.ts',
                //login
                'shared/login/_login.component.ts',
                { file: 'shared/login/_login.component.html', method: 'copyHtml' },
                'shared/login/_login.service.ts',
                'shared/login/_login-modal.service.ts',
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
        },
        {
            condition: generator => !generator.skipUserManagement,
            path: ANGULAR_DIR,
            templates: [
                'shared/user/_user.model.ts',
                'shared/user/_user.service.ts'
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
                'shared/auth/_account.service.ts',
                'shared/auth/_user-route-access-service.ts'
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
                'spec/app/account/activate/_activate.component.spec.ts',
                'spec/app/account/password/_password.component.spec.ts',
                'spec/app/account/password/_password-strength-bar.component.spec.ts',
                'spec/app/account/register/_register.component.spec.ts',
                'spec/app/account/settings/_settings.component.spec.ts',
                'spec/app/admin/health/_health.component.spec.ts',
                'spec/helpers/_spyobject.ts',
                'spec/helpers/_mock-account.service.ts',
                'spec/helpers/_mock-principal.service.ts',
                'spec/helpers/_mock-route.service.ts'
            ]
        },
        {
            condition: generator => generator.enableTranslation,
            path: TEST_SRC_DIR,
            templates: [
                'spec/helpers/_mock-language.service.ts'
            ]
        },
        {
            condition: generator => generator.websocket === 'spring-websocket',
            path: TEST_SRC_DIR,
            templates: [
                'spec/helpers/_mock-tracker.service.ts'
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
