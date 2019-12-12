/**
 * Copyright 2013-2019 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const mkdirp = require('mkdirp');
const constants = require('../generator-constants');

/* Constants use throughout */
const MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR;
const TEST_SRC_DIR = constants.CLIENT_TEST_SRC_DIR;
const ANGULAR_DIR = constants.ANGULAR_DIR;

/**
 * The default is to use a file path string. It implies use of the template method.
 * For any other config an object { file:.., method:.., template:.. } can be used
 */
const files = {
    common: [
        {
            templates: [
                'package.json',
                'proxy.conf.json',
                'tsconfig.json',
                'tsconfig-aot.json',
                'tslint.json',
                '.eslintrc.json',
                '.eslintignore',
                'angular.json',
                'webpack/utils.js',
                'webpack/webpack.common.js',
                'webpack/webpack.dev.js',
                'webpack/webpack.prod.js',
                'postcss.config.js',
                { file: 'webpack/logo-jhipster.png', method: 'copy' }
            ]
        },
        {
            condition: generator => !generator.skipCommitHook,
            templates: ['.huskyrc', '.lintstagedrc.js']
        }
    ],
    sass: [
        {
            path: MAIN_SRC_DIR,
            templates: ['content/scss/_bootstrap-variables.scss', 'content/scss/global.scss', 'content/scss/vendor.scss']
        },
        {
            condition: generator => generator.enableI18nRTL,
            path: MAIN_SRC_DIR,
            templates: ['content/scss/rtl.scss']
        }
    ],
    image: [
        {
            path: MAIN_SRC_DIR,
            templates: [
                { file: 'content/images/jhipster_family_member_0.svg', method: 'copy' },
                { file: 'content/images/jhipster_family_member_1.svg', method: 'copy' },
                { file: 'content/images/jhipster_family_member_2.svg', method: 'copy' },
                { file: 'content/images/jhipster_family_member_3.svg', method: 'copy' },
                { file: 'content/images/jhipster_family_member_0_head-192.png', method: 'copy' },
                { file: 'content/images/jhipster_family_member_1_head-192.png', method: 'copy' },
                { file: 'content/images/jhipster_family_member_2_head-192.png', method: 'copy' },
                { file: 'content/images/jhipster_family_member_3_head-192.png', method: 'copy' },
                { file: 'content/images/jhipster_family_member_0_head-256.png', method: 'copy' },
                { file: 'content/images/jhipster_family_member_1_head-256.png', method: 'copy' },
                { file: 'content/images/jhipster_family_member_2_head-256.png', method: 'copy' },
                { file: 'content/images/jhipster_family_member_3_head-256.png', method: 'copy' },
                { file: 'content/images/jhipster_family_member_0_head-384.png', method: 'copy' },
                { file: 'content/images/jhipster_family_member_1_head-384.png', method: 'copy' },
                { file: 'content/images/jhipster_family_member_2_head-384.png', method: 'copy' },
                { file: 'content/images/jhipster_family_member_3_head-384.png', method: 'copy' },
                { file: 'content/images/jhipster_family_member_0_head-512.png', method: 'copy' },
                { file: 'content/images/jhipster_family_member_1_head-512.png', method: 'copy' },
                { file: 'content/images/jhipster_family_member_2_head-512.png', method: 'copy' },
                { file: 'content/images/jhipster_family_member_3_head-512.png', method: 'copy' },
                { file: 'content/images/logo-jhipster.png', method: 'copy' }
            ]
        }
    ],
    swagger: [
        {
            path: MAIN_SRC_DIR,
            templates: ['swagger-ui/index.html', { file: 'swagger-ui/dist/images/throbber.gif', method: 'copy' }]
        }
    ],
    commonWeb: [
        {
            path: MAIN_SRC_DIR,
            templates: [
                'WEB-INF/web.xml',
                { file: 'favicon.ico', method: 'copy' },
                'robots.txt',
                '404.html',
                'index.html',
                'manifest.webapp',
                'content/css/loading.css'
            ]
        }
    ],
    angularApp: [
        {
            path: ANGULAR_DIR,
            templates: [
                'app.main.ts',
                'app.module.ts',
                'app-routing.module.ts',
                'app.constants.ts',
                'polyfills.ts',
                'vendor.ts',
                'blocks/config/prod.config.ts',
                'blocks/config/uib-pagination.config.ts',
                // interceptors
                'blocks/interceptor/errorhandler.interceptor.ts',
                'blocks/interceptor/notification.interceptor.ts',
                'blocks/interceptor/auth-expired.interceptor.ts'
            ]
        },
        {
            condition: generator => generator.authenticationType === 'jwt',
            path: ANGULAR_DIR,
            templates: ['blocks/interceptor/auth.interceptor.ts']
        }
    ],
    angularMain: [
        {
            path: ANGULAR_DIR,
            templates: [
                // entities
                'entities/entity.module.ts',
                // home module
                { file: 'home/home.module.ts', method: 'processJs' },
                { file: 'home/home.route.ts', method: 'processJs' },
                { file: 'home/home.component.ts', method: 'processJs' },
                { file: 'home/home.component.html', method: 'processHtml' },
                // layouts
                'layouts/profiles/page-ribbon.component.ts',
                'layouts/profiles/profile.service.ts',
                'layouts/profiles/profile-info.model.ts',
                'layouts/main/main.component.ts',
                'layouts/main/main.component.html',
                { file: 'layouts/navbar/navbar.component.ts', method: 'processJs' },
                { file: 'layouts/navbar/navbar.component.html', method: 'processHtml' },
                'layouts/navbar/navbar.route.ts',
                'layouts/footer/footer.component.ts',
                { file: 'layouts/footer/footer.component.html', method: 'processHtml' },
                { file: 'layouts/error/error.route.ts', method: 'processJs' },
                { file: 'layouts/error/error.component.ts', method: 'processJs' },
                { file: 'layouts/error/error.component.html', method: 'processHtml' }
            ]
        },
        {
            condition: generator => generator.enableTranslation,
            path: ANGULAR_DIR,
            templates: ['layouts/navbar/active-menu.directive.ts']
        },
        {
            path: ANGULAR_DIR,
            templates: ['layouts/profiles/page-ribbon.scss', 'layouts/navbar/navbar.scss', 'home/home.scss']
        }
    ],
    angularAccountModule: [
        {
            path: ANGULAR_DIR,
            condition: generator => !generator.skipUserManagement,
            templates: [
                { file: 'account/account.route.ts', method: 'processJs' },
                'account/account.module.ts',
                { file: 'account/activate/activate.route.ts', method: 'processJs' },
                { file: 'account/activate/activate.component.ts', method: 'processJs' },
                { file: 'account/activate/activate.component.html', method: 'processHtml' },
                'account/activate/activate.service.ts',
                { file: 'account/password/password.route.ts', method: 'processJs' },
                'account/password/password-strength-bar.component.ts',
                { file: 'account/password/password.component.ts', method: 'processJs' },
                { file: 'account/password/password.component.html', method: 'processHtml' },
                'account/password/password.service.ts',
                { file: 'account/register/register.route.ts', method: 'processJs' },
                { file: 'account/register/register.component.ts', method: 'processJs' },
                { file: 'account/register/register.component.html', method: 'processHtml' },
                'account/register/register.service.ts',
                { file: 'account/password-reset/init/password-reset-init.route.ts', method: 'processJs' },
                { file: 'account/password-reset/init/password-reset-init.component.ts', method: 'processJs' },
                { file: 'account/password-reset/init/password-reset-init.component.html', method: 'processHtml' },
                'account/password-reset/init/password-reset-init.service.ts',
                { file: 'account/password-reset/finish/password-reset-finish.route.ts', method: 'processJs' },
                { file: 'account/password-reset/finish/password-reset-finish.component.ts', method: 'processJs' },
                { file: 'account/password-reset/finish/password-reset-finish.component.html', method: 'processHtml' },
                'account/password-reset/finish/password-reset-finish.service.ts',
                { file: 'account/settings/settings.route.ts', method: 'processJs' },
                { file: 'account/settings/settings.component.ts', method: 'processJs' },
                { file: 'account/settings/settings.component.html', method: 'processHtml' }
            ]
        },
        {
            condition: generator => generator.authenticationType === 'session' && !generator.skipUserManagement,
            path: ANGULAR_DIR,
            templates: [
                { file: 'account/sessions/sessions.route.ts', method: 'processJs' },
                'account/sessions/session.model.ts',
                { file: 'account/sessions/sessions.component.ts', method: 'processJs' },
                { file: 'account/sessions/sessions.component.html', method: 'processHtml' },
                'account/sessions/sessions.service.ts'
            ]
        },
        {
            condition: generator => !generator.skipUserManagement,
            path: ANGULAR_DIR,
            templates: ['account/password/password-strength-bar.scss']
        }
    ],
    angularAdminModule: [
        {
            path: ANGULAR_DIR,
            templates: [
                { file: 'admin/admin-routing.module.ts', method: 'processJs' },
                // admin modules
                { file: 'admin/configuration/configuration.route.ts', method: 'processJs' },
                { file: 'admin/configuration/configuration.module.ts', method: 'processJs' },
                { file: 'admin/configuration/configuration.component.ts', method: 'processJs' },
                { file: 'admin/configuration/configuration.component.html', method: 'processHtml' },
                'admin/configuration/configuration.service.ts',
                { file: 'admin/docs/docs.route.ts', method: 'processJs' },
                { file: 'admin/docs/docs.module.ts', method: 'processJs' },
                { file: 'admin/docs/docs.component.ts', method: 'processJs' },
                'admin/docs/docs.component.html',
                { file: 'admin/health/health.route.ts', method: 'processJs' },
                { file: 'admin/health/health.module.ts', method: 'processJs' },
                { file: 'admin/health/health.component.ts', method: 'processJs' },
                { file: 'admin/health/health.component.html', method: 'processHtml' },
                'admin/health/health-modal.component.ts',
                { file: 'admin/health/health-modal.component.html', method: 'processHtml' },
                'admin/health/health.service.ts',
                { file: 'admin/logs/logs.route.ts', method: 'processJs' },
                { file: 'admin/logs/logs.module.ts', method: 'processJs' },
                'admin/logs/log.model.ts',
                { file: 'admin/logs/logs.component.ts', method: 'processJs' },
                { file: 'admin/logs/logs.component.html', method: 'processHtml' },
                'admin/logs/logs.service.ts',
                { file: 'admin/metrics/metrics.route.ts', method: 'processJs' },
                { file: 'admin/metrics/metrics.module.ts', method: 'processJs' },
                { file: 'admin/metrics/metrics.component.ts', method: 'processJs' },
                { file: 'admin/metrics/metrics.component.html', method: 'processHtml', template: true },
                'admin/metrics/metrics.service.ts'
            ]
        },
        {
            condition: generator =>
                (generator.databaseType !== 'no' || generator.authenticationType === 'uaa') && generator.databaseType !== 'cassandra',
            path: ANGULAR_DIR,
            templates: [
                { file: 'admin/audits/audits.route.ts', method: 'processJs' },
                { file: 'admin/audits/audits.module.ts', method: 'processJs' },
                'admin/audits/audit-data.model.ts',
                'admin/audits/audit.model.ts',
                { file: 'admin/audits/audits.component.ts', method: 'processJs' },
                { file: 'admin/audits/audits.component.html', method: 'processHtml' },
                'admin/audits/audits.service.ts'
            ]
        },
        {
            condition: generator => generator.websocket === 'spring-websocket',
            path: ANGULAR_DIR,
            templates: [
                { file: 'admin/tracker/tracker.route.ts', method: 'processJs' },
                { file: 'admin/tracker/tracker.module.ts', method: 'processJs' },
                { file: 'admin/tracker/tracker.component.ts', method: 'processJs' },
                { file: 'admin/tracker/tracker.component.html', method: 'processHtml' },
                'core/tracker/tracker-activity.model.ts',
                'core/tracker/tracker.service.ts'
            ]
        },
        {
            condition: generator => !generator.skipUserManagement,
            path: ANGULAR_DIR,
            templates: [
                { file: 'admin/user-management/user-management.route.ts', method: 'processJs' },
                { file: 'admin/user-management/user-management.module.ts', method: 'processJs' },
                { file: 'admin/user-management/user-management.component.ts', method: 'processJs' },
                { file: 'admin/user-management/user-management.component.html', method: 'processHtml' },
                { file: 'admin/user-management/user-management-detail.component.ts', method: 'processJs' },
                { file: 'admin/user-management/user-management-detail.component.html', method: 'processHtml' },
                { file: 'admin/user-management/user-management-update.component.ts', method: 'processJs' },
                { file: 'admin/user-management/user-management-update.component.html', method: 'processHtml' },
                { file: 'admin/user-management/user-management-delete-dialog.component.ts', method: 'processJs' },
                { file: 'admin/user-management/user-management-delete-dialog.component.html', method: 'processHtml' }
            ]
        },
        {
            condition: generator => generator.applicationType === 'gateway' && generator.serviceDiscoveryType,
            path: ANGULAR_DIR,
            templates: [
                { file: 'admin/gateway/gateway.route.ts', method: 'processJs' },
                { file: 'admin/gateway/gateway.module.ts', method: 'processJs' },
                'admin/gateway/gateway-route.model.ts',
                { file: 'admin/gateway/gateway.component.ts', method: 'processJs' },
                { file: 'admin/gateway/gateway.component.html', method: 'processHtml' },
                'admin/gateway/gateway-routes.service.ts'
            ]
        }
    ],
    angularCore: [
        {
            path: ANGULAR_DIR,
            templates: [
                'core/core.module.ts',
                // login
                'core/login/login.service.ts',
                'core/user/account.model.ts',

                // icons
                'core/icons/font-awesome-icons.ts'
            ]
        },
        {
            path: ANGULAR_DIR,
            condition: generator => generator.authenticationType !== 'oauth2',
            templates: [
                // login
                'core/login/login.model.ts',
                'core/login/login-modal.service.ts'
            ]
        },
        {
            path: ANGULAR_DIR,
            condition: generator => generator.authenticationType === 'oauth2',
            templates: ['core/login/logout.model.ts']
        },
        {
            condition: generator => !generator.skipUserManagement || generator.authenticationType === 'oauth2',
            path: ANGULAR_DIR,
            templates: ['core/user/user.service.ts', 'core/user/user.model.ts']
        },
        {
            condition: generator => generator.enableTranslation,
            path: ANGULAR_DIR,
            templates: ['core/language/language.constants.ts', 'core/language/language.helper.ts']
        }
    ],
    angularShared: [
        {
            path: ANGULAR_DIR,
            templates: [
                'shared/shared.module.ts',
                'shared/shared-libs.module.ts',
                'shared/constants/error.constants.ts',
                'shared/constants/input.constants.ts',
                'shared/constants/pagination.constants.ts',
                // models
                'shared/util/request-util.ts',
                // alert service code
                'shared/alert/alert.component.ts',
                'shared/alert/alert-error.component.ts',
                'shared/alert/alert-error.model.ts',
                // dates
                'shared/util/datepicker-adapter.ts'
            ]
        },
        {
            path: ANGULAR_DIR,
            condition: generator => generator.authenticationType !== 'oauth2',
            templates: [
                // login
                'shared/login/login.component.ts',
                { file: 'shared/login/login.component.html', method: 'processHtml' }
            ]
        },
        {
            condition: generator => generator.enableTranslation,
            path: ANGULAR_DIR,
            templates: ['shared/language/find-language-from-key.pipe.ts']
        }
    ],
    angularAuthService: [
        {
            path: ANGULAR_DIR,
            templates: [
                'core/auth/csrf.service.ts',
                'core/auth/state-storage.service.ts',
                'shared/auth/has-any-authority.directive.ts',
                'core/auth/account.service.ts',
                'core/auth/user-route-access-service.ts'
            ]
        },
        {
            condition: generator => generator.authenticationType === 'jwt' || generator.authenticationType === 'uaa',
            path: ANGULAR_DIR,
            templates: ['core/auth/auth-jwt.service.ts']
        },
        {
            condition: generator => generator.authenticationType === 'session' || generator.authenticationType === 'oauth2',
            path: ANGULAR_DIR,
            templates: ['core/auth/auth-session.service.ts']
        }
    ],
    clientTestFw: [
        {
            path: TEST_SRC_DIR,
            templates: [
                'jest.conf.js',
                'jest.ts',
                'jest-global-mocks.ts',
                'spec/test.module.ts',
                'spec/app/admin/configuration/configuration.component.spec.ts',
                'spec/app/admin/configuration/configuration.service.spec.ts',
                'spec/app/admin/health/health.component.spec.ts',
                'spec/app/admin/logs/logs.component.spec.ts',
                'spec/app/admin/logs/logs.service.spec.ts',
                'spec/app/admin/metrics/metrics.component.spec.ts',
                'spec/app/admin/metrics/metrics.service.spec.ts',
                'spec/app/core/user/account.service.spec.ts',
                'spec/app/layouts/main/main.component.spec.ts',
                'spec/helpers/spyobject.ts',
                'spec/helpers/mock-account.service.ts',
                'spec/helpers/mock-route.service.ts',
                'spec/helpers/mock-login.service.ts',
                'spec/helpers/mock-event-manager.service.ts',
                'spec/helpers/mock-active-modal.service.ts',
                'spec/helpers/mock-state-storage.service.ts',
                'spec/helpers/mock-alert.service.ts'
            ]
        },
        {
            condition: generator => !generator.skipUserManagement,
            path: TEST_SRC_DIR,
            templates: [
                'spec/app/account/activate/activate.component.spec.ts',
                'spec/app/account/password/password.component.spec.ts',
                'spec/app/account/password/password-strength-bar.component.spec.ts',
                'spec/app/account/password-reset/init/password-reset-init.component.spec.ts',
                'spec/app/account/password-reset/finish/password-reset-finish.component.spec.ts',
                'spec/app/account/register/register.component.spec.ts',
                'spec/app/account/settings/settings.component.spec.ts'
            ]
        },
        {
            condition: generator => generator.authenticationType !== 'oauth2',
            path: TEST_SRC_DIR,
            templates: ['spec/app/shared/login/login.component.spec.ts', 'spec/app/shared/alert/alert-error.component.spec.ts']
        },
        {
            condition: generator =>
                (generator.databaseType !== 'no' || generator.authenticationType === 'uaa') && generator.databaseType !== 'cassandra',
            path: TEST_SRC_DIR,
            templates: ['spec/app/admin/audits/audits.component.spec.ts', 'spec/app/admin/audits/audits.service.spec.ts']
        },
        {
            condition: generator => !generator.skipUserManagement,
            path: TEST_SRC_DIR,
            templates: [
                'spec/app/admin/user-management/user-management.component.spec.ts',
                'spec/app/admin/user-management/user-management-detail.component.spec.ts',
                'spec/app/admin/user-management/user-management-update.component.spec.ts',
                'spec/app/admin/user-management/user-management-delete-dialog.component.spec.ts',
                // user service tests
                'spec/app/core/user/user.service.spec.ts'
            ]
        },
        {
            condition: generator => generator.authenticationType === 'session' && !generator.skipUserManagement,
            path: TEST_SRC_DIR,
            templates: ['spec/app/account/sessions/sessions.component.spec.ts']
        },
        {
            condition: generator => generator.enableTranslation,
            path: TEST_SRC_DIR,
            templates: ['spec/helpers/mock-language.service.ts']
        },
        {
            condition: generator => generator.websocket === 'spring-websocket',
            path: TEST_SRC_DIR,
            templates: ['spec/helpers/mock-tracker.service.ts']
        },
        {
            condition: generator => generator.protractorTests,
            path: TEST_SRC_DIR,
            templates: [
                'e2e/account/account.spec.ts',
                'e2e/admin/administration.spec.ts',
                'e2e/page-objects/jhi-page-objects.ts',
                'protractor.conf.js'
            ]
        },
        {
            condition: generator => generator.protractorTests,
            templates: ['tsconfig.e2e.json']
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
    this.writeFilesToDisk(files, this, false, this.fetchFromInstalledJHipster('client/templates/angular'));
}
