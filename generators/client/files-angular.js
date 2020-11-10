/**
 * Copyright 2013-2020 the original author or authors from the JHipster project.
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
const constants = require('../generator-constants');

const { CLIENT_MAIN_SRC_DIR, CLIENT_TEST_SRC_DIR, ANGULAR_DIR } = constants;

/**
 * The default is to use a file path string. It implies use of the template method.
 * For any other config an object { file:.., method:.., template:.. } can be used
 */
const files = {
    common: [
        {
            templates: [
                'package.json',
                'tsconfig.json',
                'tsconfig.app.json',
                'tsconfig.spec.json',
                '.eslintrc.json',
                'angular.json',
                'ngsw-config.json',
                'webpack/proxy.conf.js',
                'webpack/webpack.custom.js',
                '.browserslistrc',
                { file: 'webpack/logo-jhipster.png', method: 'copy' },
            ],
        },
    ],
    sass: [
        {
            path: CLIENT_MAIN_SRC_DIR,
            templates: ['content/scss/_bootstrap-variables.scss', 'content/scss/global.scss', 'content/scss/vendor.scss'],
        },
    ],
    swagger: [
        {
            path: CLIENT_MAIN_SRC_DIR,
            templates: ['swagger-ui/index.html', { file: 'swagger-ui/dist/images/throbber.gif', method: 'copy' }],
        },
    ],
    commonWeb: [
        {
            path: CLIENT_MAIN_SRC_DIR,
            templates: [
                'WEB-INF/web.xml',
                { file: 'favicon.ico', method: 'copy' },
                'robots.txt',
                '404.html',
                'index.html',
                'content/css/loading.css',
            ],
        },
    ],
    angularApp: [
        {
            path: ANGULAR_DIR,
            templates: ['app.main.ts', 'app.module.ts', 'app-routing.module.ts', 'app.constants.ts', 'polyfills.ts', 'vendor.ts'],
        },
    ],
    angularMain: [
        {
            path: ANGULAR_DIR,
            templates: [
                // entities
                'entities/entity-routing.module.ts',
                // home module
                'home/home.module.ts',
                { file: 'home/home.route.ts', method: 'processJs' },
                'home/home.component.ts',
                { file: 'home/home.component.html', method: 'processHtml' },
                // layouts
                'layouts/profiles/page-ribbon.component.ts',
                'layouts/profiles/profile.service.ts',
                'layouts/profiles/profile-info.model.ts',
                'layouts/main/main.component.ts',
                'layouts/main/main.component.html',
                'layouts/navbar/navbar.component.ts',
                { file: 'layouts/navbar/navbar.component.html', method: 'processHtml' },
                'layouts/navbar/navbar.route.ts',
                'layouts/footer/footer.component.ts',
                { file: 'layouts/footer/footer.component.html', method: 'processHtml' },
                { file: 'layouts/error/error.route.ts', method: 'processJs' },
                'layouts/error/error.component.ts',
                { file: 'layouts/error/error.component.html', method: 'processHtml' },
                // login
                'login/login.service.ts',
            ],
        },
        {
            condition: generator => generator.enableTranslation,
            path: ANGULAR_DIR,
            templates: ['layouts/navbar/active-menu.directive.ts'],
        },
        {
            path: ANGULAR_DIR,
            templates: ['layouts/profiles/page-ribbon.scss', 'layouts/navbar/navbar.scss', 'home/home.scss'],
        },
        // login
        {
            path: ANGULAR_DIR,
            condition: generator => generator.authenticationType !== 'oauth2',
            templates: [
                'login/login.module.ts',
                { file: 'login/login.route.ts', method: 'processJs' },
                'login/login.component.ts',
                { file: 'login/login.component.html', method: 'processHtml' },
                'login/login.model.ts',
            ],
        },
        {
            path: ANGULAR_DIR,
            condition: generator => generator.authenticationType === 'oauth2',
            templates: ['login/logout.model.ts'],
        },
    ],
    angularAccountModule: [
        {
            path: ANGULAR_DIR,
            condition: generator => !generator.skipUserManagement,
            templates: [
                { file: 'account/account.route.ts', method: 'processJs' },
                'account/account.module.ts',
                { file: 'account/activate/activate.route.ts', method: 'processJs' },
                'account/activate/activate.component.ts',
                { file: 'account/activate/activate.component.html', method: 'processHtml' },
                'account/activate/activate.service.ts',
                { file: 'account/password/password.route.ts', method: 'processJs' },
                'account/password/password-strength-bar.component.ts',
                'account/password/password.component.ts',
                { file: 'account/password/password.component.html', method: 'processHtml' },
                'account/password/password.service.ts',
                { file: 'account/register/register.route.ts', method: 'processJs' },
                'account/register/register.component.ts',
                { file: 'account/register/register.component.html', method: 'processHtml' },
                'account/register/register.service.ts',
                { file: 'account/password-reset/init/password-reset-init.route.ts', method: 'processJs' },
                'account/password-reset/init/password-reset-init.component.ts',
                { file: 'account/password-reset/init/password-reset-init.component.html', method: 'processHtml' },
                'account/password-reset/init/password-reset-init.service.ts',
                { file: 'account/password-reset/finish/password-reset-finish.route.ts', method: 'processJs' },
                'account/password-reset/finish/password-reset-finish.component.ts',
                { file: 'account/password-reset/finish/password-reset-finish.component.html', method: 'processHtml' },
                'account/password-reset/finish/password-reset-finish.service.ts',
                { file: 'account/settings/settings.route.ts', method: 'processJs' },
                'account/settings/settings.component.ts',
                { file: 'account/settings/settings.component.html', method: 'processHtml' },
            ],
        },
        {
            condition: generator => generator.authenticationType === 'session' && !generator.skipUserManagement,
            path: ANGULAR_DIR,
            templates: [
                { file: 'account/sessions/sessions.route.ts', method: 'processJs' },
                'account/sessions/session.model.ts',
                'account/sessions/sessions.component.ts',
                { file: 'account/sessions/sessions.component.html', method: 'processHtml' },
                'account/sessions/sessions.service.ts',
            ],
        },
        {
            condition: generator => !generator.skipUserManagement,
            path: ANGULAR_DIR,
            templates: ['account/password/password-strength-bar.scss'],
        },
    ],
    angularAdminModule: [
        {
            path: ANGULAR_DIR,
            templates: [
                { file: 'admin/admin-routing.module.ts', method: 'processJs' },
                // admin modules
                { file: 'admin/configuration/configuration.route.ts', method: 'processJs' },
                'admin/configuration/configuration.module.ts',
                'admin/configuration/configuration.component.ts',
                { file: 'admin/configuration/configuration.component.html', method: 'processHtml' },
                'admin/configuration/configuration.service.ts',
                'admin/configuration/configuration.model.ts',
                { file: 'admin/docs/docs.route.ts', method: 'processJs' },
                'admin/docs/docs.module.ts',
                'admin/docs/docs.component.ts',
                'admin/docs/docs.component.html',
                'admin/docs/docs.scss',
                { file: 'admin/health/health.route.ts', method: 'processJs' },
                'admin/health/health.module.ts',
                'admin/health/health.component.ts',
                { file: 'admin/health/health.component.html', method: 'processHtml' },
                'admin/health/health-modal.component.ts',
                { file: 'admin/health/health-modal.component.html', method: 'processHtml' },
                'admin/health/health.service.ts',
                'admin/health/health.model.ts',
                { file: 'admin/logs/logs.route.ts', method: 'processJs' },
                'admin/logs/logs.module.ts',
                'admin/logs/log.model.ts',
                'admin/logs/logs.component.ts',
                { file: 'admin/logs/logs.component.html', method: 'processHtml' },
                'admin/logs/logs.service.ts',
                { file: 'admin/metrics/metrics.route.ts', method: 'processJs' },
                'admin/metrics/metrics.module.ts',
                'admin/metrics/metrics.component.ts',
                { file: 'admin/metrics/metrics.component.html', method: 'processHtml', template: true },
                'admin/metrics/metrics.service.ts',
                'admin/metrics/metrics.model.ts',
                'admin/metrics/jvm-memory/jvm-memory.component.ts',
                { file: 'admin/metrics/jvm-memory/jvm-memory.component.html', method: 'processHtml', template: true },
                'admin/metrics/jvm-threads/jvm-threads.component.ts',
                { file: 'admin/metrics/jvm-threads/jvm-threads.component.html', method: 'processHtml', template: true },
                'admin/metrics/metrics-cache/metrics-cache.component.ts',
                { file: 'admin/metrics/metrics-cache/metrics-cache.component.html', method: 'processHtml', template: true },
                'admin/metrics/metrics-datasource/metrics-datasource.component.ts',
                { file: 'admin/metrics/metrics-datasource/metrics-datasource.component.html', method: 'processHtml', template: true },
                'admin/metrics/metrics-endpoints-requests/metrics-endpoints-requests.component.ts',
                {
                    file: 'admin/metrics/metrics-endpoints-requests/metrics-endpoints-requests.component.html',
                    method: 'processHtml',
                    template: true,
                },
                'admin/metrics/metrics-garbagecollector/metrics-garbagecollector.component.ts',
                {
                    file: 'admin/metrics/metrics-garbagecollector/metrics-garbagecollector.component.html',
                    method: 'processHtml',
                    template: true,
                },
                'admin/metrics/metrics-modal-threads/metrics-modal-threads.component.ts',
                { file: 'admin/metrics/metrics-modal-threads/metrics-modal-threads.component.html', method: 'processHtml', template: true },
                'admin/metrics/metrics-request/metrics-request.component.ts',
                { file: 'admin/metrics/metrics-request/metrics-request.component.html', method: 'processHtml', template: true },
                'admin/metrics/metrics-system/metrics-system.component.ts',
                { file: 'admin/metrics/metrics-system/metrics-system.component.html', method: 'processHtml', template: true },
            ],
        },
        {
            condition: generator => generator.websocket === 'spring-websocket',
            path: ANGULAR_DIR,
            templates: [
                { file: 'admin/tracker/tracker.route.ts', method: 'processJs' },
                'admin/tracker/tracker.module.ts',
                'admin/tracker/tracker.component.ts',
                { file: 'admin/tracker/tracker.component.html', method: 'processHtml' },
                'core/tracker/tracker-activity.model.ts',
                'core/tracker/tracker.service.ts',
            ],
        },
        {
            condition: generator => !generator.skipUserManagement,
            path: ANGULAR_DIR,
            templates: [
                { file: 'admin/user-management/user-management.route.ts', method: 'processJs' },
                'admin/user-management/user-management.module.ts',
                'admin/user-management/user-management.component.ts',
                { file: 'admin/user-management/user-management.component.html', method: 'processHtml' },
                'admin/user-management/user-management-detail.component.ts',
                { file: 'admin/user-management/user-management-detail.component.html', method: 'processHtml' },
                'admin/user-management/user-management-update.component.ts',
                { file: 'admin/user-management/user-management-update.component.html', method: 'processHtml' },
                'admin/user-management/user-management-delete-dialog.component.ts',
                { file: 'admin/user-management/user-management-delete-dialog.component.html', method: 'processHtml' },
            ],
        },
        {
            condition: generator => generator.applicationType === 'gateway' && generator.serviceDiscoveryType,
            path: ANGULAR_DIR,
            templates: [
                { file: 'admin/gateway/gateway.route.ts', method: 'processJs' },
                'admin/gateway/gateway.module.ts',
                'admin/gateway/gateway-route.model.ts',
                'admin/gateway/gateway.component.ts',
                { file: 'admin/gateway/gateway.component.html', method: 'processHtml' },
                'admin/gateway/gateway-routes.service.ts',
            ],
        },
    ],
    angularCore: [
        {
            path: ANGULAR_DIR,
            templates: [
                'core/core.module.ts',
                'core/user/account.model.ts',
                'core/user/authority.model.ts',
                'core/util/data-util.service.ts',
                'core/util/parse-links.service.ts',
                'core/util/alert.service.ts',

                // config
                'core/config/uib-pagination.config.ts',
                'core/config/dayjs.ts',
                'core/config/datepicker-adapter.ts',
                'core/config/font-awesome-icons.ts',
                'core/config/error.constants.ts',
                'core/config/input.constants.ts',
                'core/config/pagination.constants.ts',

                // interceptors
                'core/interceptor/error-handler.interceptor.ts',
                'core/interceptor/notification.interceptor.ts',
                'core/interceptor/auth-expired.interceptor.ts',
                'core/interceptor/index.ts',

                // request
                'core/request/request-util.ts',
                'core/request/request.model.ts',

                // event-manager
                'core/event-manager/event-manager.service.ts',
                'core/event-manager/event-with-content.model.ts',
            ],
        },
        {
            condition: generator => generator.authenticationType === 'jwt',
            path: ANGULAR_DIR,
            templates: ['core/interceptor/auth.interceptor.ts'],
        },
        {
            condition: generator => !generator.skipUserManagement || generator.authenticationType === 'oauth2',
            path: ANGULAR_DIR,
            templates: ['core/user/user.service.ts', 'core/user/user.model.ts'],
        },
        {
            condition: generator => generator.enableTranslation,
            path: ANGULAR_DIR,
            templates: ['core/config/language.constants.ts', 'core/config/translation.config.ts'],
        },
    ],
    angularShared: [
        {
            path: ANGULAR_DIR,
            templates: [
                'shared/shared.module.ts',
                'shared/shared-libs.module.ts',
                'shared/duration.pipe.ts',
                'shared/sort/sort.directive.ts',
                'shared/sort/sort-by.directive.ts',
                'shared/item-count.component.ts',
                // alert service code
                'shared/alert/alert.component.ts',
                'shared/alert/alert-error.component.ts',
                'shared/alert/alert-error.model.ts',
            ],
        },
        {
            condition: generator => generator.enableTranslation,
            path: ANGULAR_DIR,
            templates: ['shared/find-language-from-key.pipe.ts', 'shared/translate.directive.ts'],
        },
    ],
    angularAuthService: [
        {
            path: ANGULAR_DIR,
            templates: [
                'core/auth/csrf.service.ts',
                'core/auth/state-storage.service.ts',
                'shared/has-any-authority.directive.ts',
                'core/auth/account.service.ts',
                'core/auth/user-route-access.service.ts',
            ],
        },
        {
            condition: generator => generator.authenticationType === 'jwt' || generator.authenticationType === 'uaa',
            path: ANGULAR_DIR,
            templates: ['core/auth/auth-jwt.service.ts'],
        },
        {
            condition: generator => generator.authenticationType === 'session' || generator.authenticationType === 'oauth2',
            path: ANGULAR_DIR,
            templates: ['core/auth/auth-session.service.ts'],
        },
    ],
    clientTestFw: [
        {
            path: CLIENT_TEST_SRC_DIR,
            templates: [
                'jest.conf.js',
                'spec/app/admin/configuration/configuration.component.spec.ts',
                'spec/app/admin/configuration/configuration.service.spec.ts',
                'spec/app/admin/health/health.component.spec.ts',
                'spec/app/admin/logs/logs.component.spec.ts',
                'spec/app/admin/logs/logs.service.spec.ts',
                'spec/app/admin/metrics/metrics.component.spec.ts',
                'spec/app/admin/metrics/metrics.service.spec.ts',
                'spec/app/core/user/account.service.spec.ts',
                'spec/app/core/event-manager/event-manager.service.spec.ts',
                'spec/app/core/util/data-util.service.spec.ts',
                'spec/app/core/util/parse-links.service.spec.ts',
                'spec/app/core/util/alert.service.spec.ts',
                'spec/app/home/home.component.spec.ts',
                'spec/app/layouts/main/main.component.spec.ts',
                'spec/app/layouts/navbar/navbar.component.spec.ts',
                'spec/app/shared/alert/alert.component.spec.ts',
                'spec/app/shared/alert/alert-error.component.spec.ts',
                'spec/app/shared/sort/sort.directive.spec.ts',
                'spec/app/shared/sort/sort-by.directive.spec.ts',
                'spec/app/shared/item-count.component.spec.ts',
            ],
        },
        {
            condition: generator => generator.enableTranslation,
            path: CLIENT_TEST_SRC_DIR,
            templates: ['spec/app/shared/translate.directive.spec.ts'],
        },
        {
            condition: generator => !generator.skipUserManagement,
            path: CLIENT_TEST_SRC_DIR,
            templates: [
                'spec/app/account/activate/activate.component.spec.ts',
                'spec/app/account/password/password.component.spec.ts',
                'spec/app/account/password/password-strength-bar.component.spec.ts',
                'spec/app/account/password-reset/init/password-reset-init.component.spec.ts',
                'spec/app/account/password-reset/finish/password-reset-finish.component.spec.ts',
                'spec/app/account/register/register.component.spec.ts',
                'spec/app/account/settings/settings.component.spec.ts',
            ],
        },
        {
            condition: generator => generator.authenticationType !== 'oauth2',
            path: CLIENT_TEST_SRC_DIR,
            templates: ['spec/app/login/login.component.spec.ts'],
        },
        {
            condition: generator => !generator.skipUserManagement,
            path: CLIENT_TEST_SRC_DIR,
            templates: [
                'spec/app/admin/user-management/user-management.component.spec.ts',
                'spec/app/admin/user-management/user-management-detail.component.spec.ts',
                'spec/app/admin/user-management/user-management-update.component.spec.ts',
                'spec/app/admin/user-management/user-management-delete-dialog.component.spec.ts',
                // user service tests
                'spec/app/core/user/user.service.spec.ts',
            ],
        },
        {
            condition: generator => generator.authenticationType === 'session' && !generator.skipUserManagement,
            path: CLIENT_TEST_SRC_DIR,
            templates: ['spec/app/account/sessions/sessions.component.spec.ts'],
        },
        {
            condition: generator => generator.protractorTests,
            path: CLIENT_TEST_SRC_DIR,
            templates: [
                'e2e/account/account.spec.ts',
                'e2e/admin/administration.spec.ts',
                'e2e/page-objects/jhi-page-objects.ts',
                'protractor.conf.js',
            ],
        },
        {
            condition: generator => generator.protractorTests,
            templates: ['tsconfig.e2e.json'],
        },
    ],
};

module.exports = {
    writeFiles,
    files,
};

function writeFiles() {
    // write angular 2.x and above files
    this.writeFilesToDisk(files, 'angular');
}
