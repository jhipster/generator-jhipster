/**
 * Copyright 2013-2024 the original author or authors from the JHipster project.
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
import { asWritingTask } from '../base-application/support/index.js';
import { clientApplicationTemplatesBlock, clientRootTemplatesBlock, clientSrcTemplatesBlock } from '../client/support/files.js';

export const files = {
  jhipsterProject: [
    {
      templates: ['README.md.jhi.client.angular'],
    },
  ],
  common: [
    clientRootTemplatesBlock({
      templates: [
        { sourceFile: 'eslint.config.js.jhi.angular', destinationFile: ctx => `${ctx.eslintConfigFile}.jhi.angular` },
        'ngsw-config.json',
        'package.json',
        'tsconfig.json',
        'tsconfig.app.json',
        'tsconfig.spec.json',
        'jest.conf.js',
      ],
    }),
  ],
  webpack: [
    clientRootTemplatesBlock({
      condition: ctx => ctx.clientBundlerWebpack,
      templates: [
        'angular.json',
        'webpack/environment.js',
        'webpack/proxy.conf.js',
        'webpack/webpack.custom.js',
        'webpack/logo-jhipster.png',
      ],
    }),
  ],
  esbuild: [
    clientRootTemplatesBlock({
      condition: ctx => ctx.clientBundlerExperimentalEsbuild,
      templates: [
        { sourceFile: 'angular.json.esbuild', destinationFile: 'angular.json' },
        'postcss.config.json',
        'proxy.conf.json',
        'build-plugins/define-esbuild.mjs',
        'build-plugins/swagger-esbuild.mjs',
        'build-plugins/swagger-middleware.mjs',
      ],
    }),
    clientRootTemplatesBlock({
      condition: ctx => ctx.clientBundlerExperimentalEsbuild && ctx.enableTranslation,
      templates: ['build-plugins/i18n-esbuild.mjs'],
    }),
    clientSrcTemplatesBlock({
      condition: ctx => ctx.clientBundlerExperimentalEsbuild && ctx.enableTranslation,
      templates: ['i18n/index.ts'],
    }),
  ],
  sass: [
    {
      ...clientSrcTemplatesBlock(),
      templates: [
        'content/scss/_bootstrap-variables.scss',
        'content/scss/global.scss',
        'content/scss/vendor.scss',
        'environments/environment.ts',
        'environments/environment.development.ts',
      ],
    },
  ],
  angularApp: [
    {
      ...clientSrcTemplatesBlock(),
      templates: ['main.ts', 'bootstrap.ts', 'declarations.d.ts'],
    },
    {
      ...clientApplicationTemplatesBlock(),
      templates: ['app.config.ts', 'app.component.ts', 'app.routes.ts', 'app-page-title-strategy.ts'],
    },
  ],
  microfrontend: [
    clientRootTemplatesBlock({
      condition: generator => generator.clientBundlerWebpack && generator.microfrontend,
      templates: ['webpack/webpack.microfrontend.js'],
    }),
    {
      condition: generator => generator.microfrontend && generator.applicationTypeGateway,
      ...clientApplicationTemplatesBlock(),
      templates: ['core/microfrontend/index.ts'],
    },
  ],
  angularMain: [
    {
      ...clientApplicationTemplatesBlock(),
      templates: [
        // entities
        'entities/entity-navbar-items.ts',
        'entities/entity.routes.ts',
        // home module
        'home/home.component.ts',
        'home/home.component.html',
        // layouts
        'layouts/profiles/page-ribbon.component.ts',
        'layouts/profiles/profile.service.ts',
        'layouts/profiles/profile-info.model.ts',
        'layouts/main/main.component.ts',
        'layouts/main/main.component.html',
        'layouts/navbar/navbar-item.model.d.ts',
        'layouts/navbar/navbar.component.ts',
        'layouts/navbar/navbar.component.html',
        'layouts/footer/footer.component.ts',
        'layouts/footer/footer.component.html',
        'layouts/error/error.route.ts',
        'layouts/error/error.component.ts',
        'layouts/error/error.component.html',
        // login
        'login/login.service.ts',
      ],
    },
    {
      condition: generator => generator.enableTranslation,
      ...clientApplicationTemplatesBlock(),
      templates: ['layouts/navbar/active-menu.directive.ts'],
    },
    {
      ...clientApplicationTemplatesBlock(),
      templates: ['layouts/profiles/page-ribbon.component.scss', 'layouts/navbar/navbar.component.scss', 'home/home.component.scss'],
    },
    // login
    {
      ...clientApplicationTemplatesBlock(),
      condition: generator => !generator.authenticationTypeOauth2,
      templates: ['login/login.component.ts', 'login/login.component.html', 'login/login.model.ts'],
    },
    {
      ...clientApplicationTemplatesBlock(),
      condition: generator => generator.authenticationTypeOauth2,
      templates: ['login/logout.model.ts'],
    },
  ],
  angularAccountModule: [
    {
      ...clientApplicationTemplatesBlock(),
      condition: generator => generator.generateUserManagement,
      templates: [
        'account/account.route.ts',
        'account/activate/activate.route.ts',
        'account/activate/activate.component.ts',
        'account/activate/activate.component.html',
        'account/activate/activate.service.ts',
        'account/password/password.route.ts',
        'account/password/password-strength-bar/password-strength-bar.component.ts',
        'account/password/password-strength-bar/password-strength-bar.component.html',
        'account/password/password-strength-bar/password-strength-bar.component.scss',
        'account/password/password.component.ts',
        'account/password/password.component.html',
        'account/password/password.service.ts',
        'account/register/register.route.ts',
        'account/register/register.component.ts',
        'account/register/register.component.html',
        'account/register/register.service.ts',
        'account/register/register.model.ts',
        'account/password-reset/init/password-reset-init.route.ts',
        'account/password-reset/init/password-reset-init.component.ts',
        'account/password-reset/init/password-reset-init.component.html',
        'account/password-reset/init/password-reset-init.service.ts',
        'account/password-reset/finish/password-reset-finish.route.ts',
        'account/password-reset/finish/password-reset-finish.component.ts',
        'account/password-reset/finish/password-reset-finish.component.html',
        'account/password-reset/finish/password-reset-finish.service.ts',
        'account/settings/settings.route.ts',
        'account/settings/settings.component.ts',
        'account/settings/settings.component.html',
      ],
    },
    {
      condition: generator => generator.authenticationTypeSession && generator.generateUserManagement,
      ...clientApplicationTemplatesBlock(),
      templates: [
        'account/sessions/sessions.route.ts',
        'account/sessions/session.model.ts',
        'account/sessions/sessions.component.ts',
        'account/sessions/sessions.component.html',
        'account/sessions/sessions.service.ts',
      ],
    },
  ],
  angularAdminModule: [
    {
      condition: generator => !generator.applicationTypeMicroservice,
      ...clientApplicationTemplatesBlock(),
      templates: [
        'admin/admin.routes.ts',
        'admin/docs/docs.component.ts',
        'admin/docs/docs.component.html',
        'admin/docs/docs.component.scss',
      ],
    },
    {
      condition: generator => generator.withAdminUi,
      ...clientApplicationTemplatesBlock(),
      templates: [
        // admin modules
        'admin/configuration/configuration.component.ts',
        'admin/configuration/configuration.component.html',
        'admin/configuration/configuration.service.ts',
        'admin/configuration/configuration.model.ts',
        'admin/health/health.component.ts',
        'admin/health/health.component.html',
        'admin/health/modal/health-modal.component.ts',
        'admin/health/modal/health-modal.component.html',
        'admin/health/health.service.ts',
        'admin/health/health.model.ts',
        'admin/logs/log.model.ts',
        'admin/logs/logs.component.ts',
        'admin/logs/logs.component.html',
        'admin/logs/logs.service.ts',
        'admin/metrics/metrics.component.ts',
        'admin/metrics/metrics.component.html',
        'admin/metrics/metrics.service.ts',
        'admin/metrics/metrics.model.ts',
        'admin/metrics/blocks/jvm-memory/jvm-memory.component.ts',
        'admin/metrics/blocks/jvm-memory/jvm-memory.component.html',
        'admin/metrics/blocks/jvm-threads/jvm-threads.component.ts',
        'admin/metrics/blocks/jvm-threads/jvm-threads.component.html',
        'admin/metrics/blocks/metrics-cache/metrics-cache.component.ts',
        'admin/metrics/blocks/metrics-cache/metrics-cache.component.html',
        'admin/metrics/blocks/metrics-datasource/metrics-datasource.component.ts',
        'admin/metrics/blocks/metrics-datasource/metrics-datasource.component.html',
        'admin/metrics/blocks/metrics-endpoints-requests/metrics-endpoints-requests.component.ts',
        'admin/metrics/blocks/metrics-endpoints-requests/metrics-endpoints-requests.component.html',
        'admin/metrics/blocks/metrics-garbagecollector/metrics-garbagecollector.component.ts',
        'admin/metrics/blocks/metrics-garbagecollector/metrics-garbagecollector.component.html',
        'admin/metrics/blocks/metrics-modal-threads/metrics-modal-threads.component.ts',
        'admin/metrics/blocks/metrics-modal-threads/metrics-modal-threads.component.html',
        'admin/metrics/blocks/metrics-request/metrics-request.component.ts',
        'admin/metrics/blocks/metrics-request/metrics-request.component.html',
        'admin/metrics/blocks/metrics-system/metrics-system.component.ts',
        'admin/metrics/blocks/metrics-system/metrics-system.component.html',
      ],
    },
    {
      condition: generator => generator.communicationSpringWebsocket,
      ...clientSrcTemplatesBlock(),
      templates: ['sockjs-client.polyfill.ts'],
    },
    {
      condition: generator => generator.communicationSpringWebsocket,
      ...clientApplicationTemplatesBlock(),
      templates: [
        'admin/tracker/tracker.component.ts',
        'admin/tracker/tracker.component.html',
        'core/tracker/tracker-activity.model.ts',
        'core/tracker/tracker.service.ts',
      ],
    },
    {
      condition: ctx => ctx.applicationTypeGateway && ctx.gatewayServicesApiAvailable,
      ...clientApplicationTemplatesBlock(),
      templates: [
        'admin/gateway/gateway-route.model.ts',
        'admin/gateway/gateway.component.ts',
        'admin/gateway/gateway.component.html',
        'admin/gateway/gateway-routes.service.ts',
      ],
    },
  ],
  angularCore: [
    {
      ...clientApplicationTemplatesBlock(),
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
        'config/navigation.constants.ts',
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
      condition: generator => generator.authenticationTypeJwt,
      ...clientApplicationTemplatesBlock(),
      templates: ['core/interceptor/auth.interceptor.ts'],
    },
    {
      condition: generator => generator.enableTranslation,
      ...clientApplicationTemplatesBlock(),
      templates: ['config/language.constants.ts', 'config/translation.config.ts'],
    },
  ],
  angularShared: [
    {
      ...clientApplicationTemplatesBlock(),
      templates: [
        'shared/shared.module.ts',
        'shared/date/index.ts',
        'shared/date/duration.pipe.ts',
        'shared/date/format-medium-date.pipe.ts',
        'shared/date/format-medium-datetime.pipe.ts',
        'shared/sort/index.ts',
        'shared/sort/sort-by.directive.ts',
        'shared/sort/sort-by.directive.spec.ts',
        'shared/sort/sort-state.ts',
        'shared/sort/sort.directive.spec.ts',
        'shared/sort/sort.directive.ts',
        'shared/sort/sort.service.spec.ts',
        'shared/sort/sort.service.ts',
        'shared/pagination/index.ts',
        'shared/pagination/item-count.component.ts',
        // alert service code
        'shared/alert/alert.component.ts',
        'shared/alert/alert.component.html',
        'shared/alert/alert-error.component.ts',
        'shared/alert/alert-error.component.html',
        'shared/alert/alert-error.model.ts',
        // filtering options
        'shared/filter/index.ts',
        'shared/filter/filter.component.html',
        'shared/filter/filter.component.ts',
        'shared/filter/filter.model.spec.ts',
        'shared/filter/filter.model.ts',
      ],
    },
    {
      condition: generator => generator.enableTranslation,
      ...clientApplicationTemplatesBlock(),
      templates: [
        'shared/language/index.ts',
        'shared/language/translation.module.ts',
        'shared/language/find-language-from-key.pipe.ts',
        'shared/language/translate.directive.ts',
      ],
    },
  ],
  angularAuthService: [
    {
      ...clientApplicationTemplatesBlock(),
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
      condition: generator => generator.authenticationTypeJwt,
      ...clientApplicationTemplatesBlock(),
      templates: ['core/auth/auth-jwt.service.ts', 'core/auth/auth-jwt.service.spec.ts'],
    },
    {
      condition: generator => generator.authenticationUsesCsrf,
      ...clientApplicationTemplatesBlock(),
      templates: ['core/auth/auth-session.service.ts'],
    },
    {
      condition: generator => generator.authenticationTypeSession && generator.communicationSpringWebsocket,
      ...clientApplicationTemplatesBlock(),
      templates: ['core/auth/csrf.service.ts'],
    },
  ],
  clientTestFw: [
    {
      condition: generator => generator.withAdminUi,
      ...clientApplicationTemplatesBlock(),
      templates: [
        'admin/configuration/configuration.component.spec.ts',
        'admin/configuration/configuration.service.spec.ts',
        'admin/health/modal/health-modal.component.spec.ts',
        'admin/health/health.component.spec.ts',
        'admin/health/health.service.spec.ts',
        'admin/logs/logs.component.spec.ts',
        'admin/logs/logs.service.spec.ts',
        'admin/metrics/metrics.component.spec.ts',
        'admin/metrics/metrics.service.spec.ts',
        'admin/metrics/blocks/metrics-modal-threads/metrics-modal-threads.component.spec.ts',
      ],
    },
    {
      ...clientApplicationTemplatesBlock(),
      templates: [
        'shared/auth/has-any-authority.directive.spec.ts',
        'core/util/event-manager.service.spec.ts',
        'core/util/data-util.service.spec.ts',
        'core/util/parse-links.service.spec.ts',
        'core/util/alert.service.spec.ts',
        'home/home.component.spec.ts',
        'layouts/main/main.component.spec.ts',
        'layouts/navbar/navbar.component.spec.ts',
        'layouts/profiles/page-ribbon.component.spec.ts',
        'shared/alert/alert.component.spec.ts',
        'shared/alert/alert-error.component.spec.ts',
        'shared/date/format-medium-date.pipe.spec.ts',
        'shared/date/format-medium-datetime.pipe.spec.ts',
        'shared/pagination/item-count.component.spec.ts',
      ],
    },
    {
      condition: generator => generator.enableTranslation,
      ...clientApplicationTemplatesBlock(),
      templates: ['shared/language/translate.directive.spec.ts'],
    },
    {
      condition: generator => generator.generateUserManagement,
      ...clientApplicationTemplatesBlock(),
      templates: [
        'account/activate/activate.component.spec.ts',
        'account/activate/activate.service.spec.ts',
        'account/password/password.component.spec.ts',
        'account/password/password.service.spec.ts',
        'account/password/password-strength-bar/password-strength-bar.component.spec.ts',
        'account/password-reset/init/password-reset-init.component.spec.ts',
        'account/password-reset/init/password-reset-init.service.spec.ts',
        'account/password-reset/finish/password-reset-finish.component.spec.ts',
        'account/password-reset/finish/password-reset-finish.service.spec.ts',
        'account/register/register.component.spec.ts',
        'account/register/register.service.spec.ts',
        'account/settings/settings.component.spec.ts',
      ],
    },
    {
      condition: generator => !generator.authenticationTypeOauth2,
      ...clientApplicationTemplatesBlock(),
      templates: ['login/login.component.spec.ts'],
    },
    {
      condition: generator => generator.authenticationTypeSession && generator.generateUserManagement,
      ...clientApplicationTemplatesBlock(),
      templates: ['account/sessions/sessions.component.spec.ts'],
    },
  ],
};

export const writeFiles = asWritingTask(async function writeFiles({ application }) {
  if (!application.clientFrameworkAngular) return;

  await this.writeFiles({
    sections: files,
    context: application,
  });
});
