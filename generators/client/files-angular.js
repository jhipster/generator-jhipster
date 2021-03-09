/**
 * Copyright 2013-2021 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const constants = require('../generator-constants');

const { CLIENT_MAIN_SRC_DIR, CLIENT_TEST_SRC_DIR, ANGULAR_DIR } = constants;
const { OAUTH2, SESSION, JWT } = require('../../jdl/jhipster/authentication-types');
const { GATEWAY } = require('../../jdl/jhipster/application-types');
const { SPRING_WEBSOCKET } = require('../../jdl/jhipster/websocket-types');
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
        'jest.conf.js',
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
  angularApp: [
    {
      path: CLIENT_MAIN_SRC_DIR,
      templates: ['main.ts', 'polyfills.ts'],
    },
    {
      path: ANGULAR_DIR,
      templates: ['app.module.ts', 'app-routing.module.ts', 'app.constants.ts'],
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
      templates: ['layouts/profiles/page-ribbon.component.scss', 'layouts/navbar/navbar.component.scss', 'home/home.component.scss'],
    },
    // login
    {
      path: ANGULAR_DIR,
      condition: generator => generator.authenticationType !== OAUTH2,
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
      condition: generator => generator.authenticationType === OAUTH2,
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
        'account/password/password-strength-bar/password-strength-bar.component.ts',
        { file: 'account/password/password-strength-bar/password-strength-bar.component.html', method: 'processHtml' },
        'account/password/password-strength-bar/password-strength-bar.component.scss',
        'account/password/password.component.ts',
        { file: 'account/password/password.component.html', method: 'processHtml' },
        'account/password/password.service.ts',
        { file: 'account/register/register.route.ts', method: 'processJs' },
        'account/register/register.component.ts',
        { file: 'account/register/register.component.html', method: 'processHtml' },
        'account/register/register.service.ts',
        'account/register/register.model.ts',
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
      condition: generator => generator.authenticationType === SESSION && !generator.skipUserManagement,
      path: ANGULAR_DIR,
      templates: [
        { file: 'account/sessions/sessions.route.ts', method: 'processJs' },
        'account/sessions/session.model.ts',
        'account/sessions/sessions.component.ts',
        { file: 'account/sessions/sessions.component.html', method: 'processHtml' },
        'account/sessions/sessions.service.ts',
      ],
    },
  ],
  angularAdminModule: [
    {
      path: ANGULAR_DIR,
      templates: [
        { file: 'admin/admin-routing.module.ts', method: 'processJs' },
        { file: 'admin/docs/docs.route.ts', method: 'processJs' },
        { file: 'admin/docs/docs.module.ts', method: 'processJs' },
        { file: 'admin/docs/docs.component.ts', method: 'processJs' },
        'admin/docs/docs.component.html',
        'admin/docs/docs.component.scss',
      ],
    },
    {
      condition: generator => generator.withAdminUi,
      path: ANGULAR_DIR,
      templates: [
        // admin modules
        { file: 'admin/configuration/configuration.route.ts', method: 'processJs' },
        'admin/configuration/configuration.module.ts',
        'admin/configuration/configuration.component.ts',
        { file: 'admin/configuration/configuration.component.html', method: 'processHtml' },
        'admin/configuration/configuration.service.ts',
        'admin/configuration/configuration.model.ts',
        { file: 'admin/health/health.route.ts', method: 'processJs' },
        'admin/health/health.module.ts',
        'admin/health/health.component.ts',
        { file: 'admin/health/health.component.html', method: 'processHtml' },
        'admin/health/modal/health-modal.component.ts',
        { file: 'admin/health/modal/health-modal.component.html', method: 'processHtml' },
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
        'admin/metrics/blocks/jvm-memory/jvm-memory.component.ts',
        { file: 'admin/metrics/blocks/jvm-memory/jvm-memory.component.html', method: 'processHtml', template: true },
        'admin/metrics/blocks/jvm-threads/jvm-threads.component.ts',
        { file: 'admin/metrics/blocks/jvm-threads/jvm-threads.component.html', method: 'processHtml', template: true },
        'admin/metrics/blocks/metrics-cache/metrics-cache.component.ts',
        {
          file: 'admin/metrics/blocks/metrics-cache/metrics-cache.component.html',
          method: 'processHtml',
          template: true,
        },
        'admin/metrics/blocks/metrics-datasource/metrics-datasource.component.ts',
        {
          file: 'admin/metrics/blocks/metrics-datasource/metrics-datasource.component.html',
          method: 'processHtml',
          template: true,
        },
        'admin/metrics/blocks/metrics-endpoints-requests/metrics-endpoints-requests.component.ts',
        {
          file: 'admin/metrics/blocks/metrics-endpoints-requests/metrics-endpoints-requests.component.html',
          method: 'processHtml',
          template: true,
        },
        'admin/metrics/blocks/metrics-garbagecollector/metrics-garbagecollector.component.ts',
        {
          file: 'admin/metrics/blocks/metrics-garbagecollector/metrics-garbagecollector.component.html',
          method: 'processHtml',
          template: true,
        },
        'admin/metrics/blocks/metrics-modal-threads/metrics-modal-threads.component.ts',
        {
          file: 'admin/metrics/blocks/metrics-modal-threads/metrics-modal-threads.component.html',
          method: 'processHtml',
          template: true,
        },
        'admin/metrics/blocks/metrics-request/metrics-request.component.ts',
        {
          file: 'admin/metrics/blocks/metrics-request/metrics-request.component.html',
          method: 'processHtml',
          template: true,
        },
        'admin/metrics/blocks/metrics-system/metrics-system.component.ts',
        {
          file: 'admin/metrics/blocks/metrics-system/metrics-system.component.html',
          method: 'processHtml',
          template: true,
        },
      ],
    },
    {
      condition: generator => generator.websocket === SPRING_WEBSOCKET,
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
        'admin/user-management/user-management.model.ts',
        'admin/user-management/list/user-management.component.ts',
        { file: 'admin/user-management/list/user-management.component.html', method: 'processHtml' },
        'admin/user-management/detail/user-management-detail.component.ts',
        { file: 'admin/user-management/detail/user-management-detail.component.html', method: 'processHtml' },
        'admin/user-management/update/user-management-update.component.ts',
        { file: 'admin/user-management/update/user-management-update.component.html', method: 'processHtml' },
        'admin/user-management/delete/user-management-delete-dialog.component.ts',
        { file: 'admin/user-management/delete/user-management-delete-dialog.component.html', method: 'processHtml' },
        'admin/user-management/service/user-management.service.ts',
      ],
    },
    {
      condition: generator => generator.applicationType === GATEWAY && generator.serviceDiscoveryType,
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
        'core/config/application-config.service.ts',
        'core/config/application-config.service.spec.ts',

        'core/util/data-util.service.ts',
        'core/util/parse-links.service.ts',
        'core/util/alert.service.ts',
        'core/util/event-manager.service.ts',
        'core/util/operators.spec.ts',
        'core/util/operators.ts',

        // config
        'config/uib-pagination.config.ts',
        'config/dayjs.ts',
        'config/datepicker-adapter.ts',
        'config/font-awesome-icons.ts',
        'config/error.constants.ts',
        'config/input.constants.ts',
        'config/pagination.constants.ts',
        'config/authority.constants.ts',

        // interceptors
        'core/interceptor/error-handler.interceptor.ts',
        'core/interceptor/notification.interceptor.ts',
        'core/interceptor/auth-expired.interceptor.ts',
        'core/interceptor/index.ts',

        // request
        'core/request/request-util.ts',
        'core/request/request.model.ts',
      ],
    },
    {
      condition: generator => generator.authenticationType === JWT,
      path: ANGULAR_DIR,
      templates: ['core/interceptor/auth.interceptor.ts'],
    },
    {
      condition: generator => !generator.skipUserManagement || generator.authenticationType === OAUTH2,
      path: ANGULAR_DIR,
      templates: ['entities/user/user.service.ts', 'entities/user/user.service.spec.ts', 'entities/user/user.model.ts'],
    },
    {
      condition: generator => generator.enableTranslation,
      path: ANGULAR_DIR,
      templates: ['config/language.constants.ts', 'config/translation.config.ts'],
    },
  ],
  angularShared: [
    {
      path: ANGULAR_DIR,
      templates: [
        'shared/shared.module.ts',
        'shared/shared-libs.module.ts',
        'shared/date/duration.pipe.ts',
        'shared/date/format-medium-date.pipe.ts',
        'shared/date/format-medium-datetime.pipe.ts',
        'shared/sort/sort.directive.ts',
        'shared/sort/sort-by.directive.ts',
        'shared/pagination/item-count.component.ts',
        // alert service code
        'shared/alert/alert.component.ts',
        'shared/alert/alert.component.html',
        'shared/alert/alert-error.component.ts',
        'shared/alert/alert-error.component.html',
        'shared/alert/alert-error.model.ts',
      ],
    },
    {
      condition: generator => generator.enableTranslation,
      path: ANGULAR_DIR,
      templates: ['shared/language/find-language-from-key.pipe.ts', 'shared/language/translate.directive.ts'],
    },
  ],
  angularAuthService: [
    {
      path: ANGULAR_DIR,
      templates: [
        'core/auth/state-storage.service.ts',
        'shared/auth/has-any-authority.directive.ts',
        'core/auth/account.model.ts',
        'core/auth/account.service.ts',
        'core/auth/account.service.spec.ts',
        'core/auth/user-route-access.service.ts',
      ],
    },
    {
      condition: generator => generator.authenticationType === JWT,
      path: ANGULAR_DIR,
      templates: ['core/auth/auth-jwt.service.ts', 'core/auth/auth-jwt.service.spec.ts'],
    },
    {
      condition: generator => generator.authenticationType === SESSION || generator.authenticationType === OAUTH2,
      path: ANGULAR_DIR,
      templates: ['core/auth/auth-session.service.ts'],
    },
    {
      condition: generator => generator.authenticationType === SESSION && generator.websocket === SPRING_WEBSOCKET,
      path: ANGULAR_DIR,
      templates: ['core/auth/csrf.service.ts'],
    },
  ],
  clientTestFw: [
    {
      condition: generator => generator.withAdminUi,
      path: ANGULAR_DIR,
      templates: [
        'admin/configuration/configuration.component.spec.ts',
        'admin/configuration/configuration.service.spec.ts',
        'admin/health/health.component.spec.ts',
        'admin/logs/logs.component.spec.ts',
        'admin/logs/logs.service.spec.ts',
        'admin/metrics/metrics.component.spec.ts',
        'admin/metrics/metrics.service.spec.ts',
      ],
    },
    {
      path: ANGULAR_DIR,
      templates: [
        'shared/auth/has-any-authority.directive.spec.ts',
        'core/util/event-manager.service.spec.ts',
        'core/util/data-util.service.spec.ts',
        'core/util/parse-links.service.spec.ts',
        'core/util/alert.service.spec.ts',
        'home/home.component.spec.ts',
        'layouts/main/main.component.spec.ts',
        'layouts/navbar/navbar.component.spec.ts',
        'shared/alert/alert.component.spec.ts',
        'shared/alert/alert-error.component.spec.ts',
        'shared/date/format-medium-date.pipe.spec.ts',
        'shared/date/format-medium-datetime.pipe.spec.ts',
        'shared/sort/sort.directive.spec.ts',
        'shared/sort/sort-by.directive.spec.ts',
        'shared/pagination/item-count.component.spec.ts',
      ],
    },
    {
      condition: generator => generator.enableTranslation,
      path: ANGULAR_DIR,
      templates: ['shared/language/translate.directive.spec.ts'],
    },
    {
      condition: generator => !generator.skipUserManagement,
      path: ANGULAR_DIR,
      templates: [
        'account/activate/activate.component.spec.ts',
        'account/password/password.component.spec.ts',
        'account/password/password-strength-bar/password-strength-bar.component.spec.ts',
        'account/password-reset/init/password-reset-init.component.spec.ts',
        'account/password-reset/finish/password-reset-finish.component.spec.ts',
        'account/register/register.component.spec.ts',
        'account/settings/settings.component.spec.ts',
      ],
    },
    {
      condition: generator => generator.authenticationType !== OAUTH2,
      path: ANGULAR_DIR,
      templates: ['login/login.component.spec.ts'],
    },
    {
      condition: generator => !generator.skipUserManagement,
      path: ANGULAR_DIR,
      templates: [
        'admin/user-management/list/user-management.component.spec.ts',
        'admin/user-management/detail/user-management-detail.component.spec.ts',
        'admin/user-management/update/user-management-update.component.spec.ts',
        'admin/user-management/delete/user-management-delete-dialog.component.spec.ts',
        'admin/user-management/service/user-management.service.spec.ts',
      ],
    },
    {
      condition: generator => generator.authenticationType === SESSION && !generator.skipUserManagement,
      path: ANGULAR_DIR,
      templates: ['account/sessions/sessions.component.spec.ts'],
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
  return this.writeFilesToDisk(files, 'angular');
}
