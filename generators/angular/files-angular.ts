/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
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
import { asWriteFilesSection, asWritingTask } from '../base-application/support/index.ts';
import { clientApplicationTemplatesBlock, clientRootTemplatesBlock, clientSrcTemplatesBlock } from '../client/support/files.ts';

import type { Application as AngularApplication, Entity as AngularEntity } from './types.ts';

export const files = asWriteFilesSection({
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
      ],
    }),
    clientRootTemplatesBlock({
      condition: ctx => ctx.enableTranslation && ctx.enableI18nRTL,
      templates: ['postcss.config.json'],
    }),
  ],
  jest: [
    clientRootTemplatesBlock({
      condition: ctx => ctx.clientTestFrameworkJest,
      templates: ['jest.conf.js'],
    }),
  ],
  vitest: [
    clientSrcTemplatesBlock({
      condition: ctx => ctx.clientTestFrameworkVitest,
      templates: ['default-test-providers.ts'],
    }),
  ],
  webpack: [
    clientRootTemplatesBlock({
      condition: ctx => ctx.clientBundlerWebpack,
      templates: [
        'angular.json',
        'webpack/environment.js',
        'webpack/package.json',
        'webpack/proxy.conf.js',
        'webpack/webpack.custom.js',
        'webpack/logo-jhipster.png',
      ],
    }),
  ],
  esbuild: [
    clientRootTemplatesBlock({
      condition: ctx => ctx.clientBundlerEsbuild,
      templates: [
        { sourceFile: 'angular.json.esbuild', destinationFile: 'angular.json' },
        'proxy.config.mjs',
        'build-plugins/define-esbuild.ts',
        'build-plugins/package.json',
      ],
    }),
    clientRootTemplatesBlock({
      condition: ctx => ctx.clientBundlerEsbuild && ctx.enableTranslation,
      templates: ['build-plugins/i18n-esbuild.ts'],
    }),
    clientSrcTemplatesBlock({
      condition: ctx => ctx.clientBundlerEsbuild && ctx.enableTranslation,
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
      templates: ['app.config.ts', 'app.ts', 'app.routes.ts', 'app-page-title-strategy.ts'],
    },
  ],
  microfrontend: [
    clientRootTemplatesBlock({
      condition: generator => generator.clientBundlerWebpack && generator.microfrontend,
      templates: ['webpack/webpack.microfrontend.js'],
    }),
    clientApplicationTemplatesBlock({
      condition: data => data.microfrontend && data.applicationTypeGateway,
      templates: ['core/microfrontend/index.ts'],
    }),
    clientApplicationTemplatesBlock({
      condition: data => data.microfrontend && data.applicationTypeMicroservice,
      templates: ['entities/entity-navbar-items.ts'],
    }),
  ],
  angularMain: [
    {
      ...clientApplicationTemplatesBlock(),
      templates: [
        // entities
        'entities/entity.routes.ts',
        // home module
        'home/home.ts',
        'home/home.html',
        // layouts
        'layouts/profiles/page-ribbon.ts',
        'layouts/profiles/profile.service.ts',
        'layouts/profiles/profile-info.model.ts',
        'layouts/main/main.ts',
        'layouts/main/main.html',
        'layouts/navbar/navbar-item.model.d.ts',
        'layouts/navbar/navbar.ts',
        'layouts/navbar/navbar.html',
        'layouts/footer/footer.ts',
        'layouts/footer/footer.html',
        'layouts/error/error.route.ts',
        'layouts/error/error.ts',
        'layouts/error/error.html',
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
      templates: ['layouts/profiles/page-ribbon.scss', 'layouts/navbar/navbar.scss', 'home/home.scss'],
    },
    // login
    {
      ...clientApplicationTemplatesBlock(),
      condition: generator => !generator.authenticationTypeOauth2,
      templates: ['login/login.ts', 'login/login.html', 'login/login.model.ts'],
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
        'account/activate/activate.ts',
        'account/activate/activate.html',
        'account/activate/activate.service.ts',
        'account/password/password.route.ts',
        'account/password/password-strength-bar/password-strength-bar.ts',
        'account/password/password-strength-bar/password-strength-bar.html',
        'account/password/password-strength-bar/password-strength-bar.scss',
        'account/password/password.ts',
        'account/password/password.html',
        'account/password/password.service.ts',
        'account/register/register.route.ts',
        'account/register/register.ts',
        'account/register/register.html',
        'account/register/register.service.ts',
        'account/register/register.model.ts',
        'account/password-reset/init/password-reset-init.route.ts',
        'account/password-reset/init/password-reset-init.ts',
        'account/password-reset/init/password-reset-init.html',
        'account/password-reset/init/password-reset-init.service.ts',
        'account/password-reset/finish/password-reset-finish.route.ts',
        'account/password-reset/finish/password-reset-finish.ts',
        'account/password-reset/finish/password-reset-finish.html',
        'account/password-reset/finish/password-reset-finish.service.ts',
        'account/settings/settings.route.ts',
        'account/settings/settings.ts',
        'account/settings/settings.html',
      ],
    },
    {
      condition: generator => generator.authenticationTypeSession && generator.generateUserManagement,
      ...clientApplicationTemplatesBlock(),
      templates: [
        'account/sessions/sessions.route.ts',
        'account/sessions/session.model.ts',
        'account/sessions/sessions.ts',
        'account/sessions/sessions.html',
        'account/sessions/sessions.service.ts',
      ],
    },
  ],
  angularAdminModule: [
    {
      condition: generator => !generator.applicationTypeMicroservice,
      ...clientApplicationTemplatesBlock(),
      templates: ['admin/admin.routes.ts', 'admin/docs/docs.ts', 'admin/docs/docs.html', 'admin/docs/docs.scss'],
    },
    {
      condition: generator => generator.withAdminUi,
      ...clientApplicationTemplatesBlock(),
      templates: [
        // admin modules
        'admin/configuration/configuration.ts',
        'admin/configuration/configuration.html',
        'admin/configuration/configuration.service.ts',
        'admin/configuration/configuration.model.ts',
        'admin/health/health.ts',
        'admin/health/health.html',
        'admin/health/modal/health-modal.ts',
        'admin/health/modal/health-modal.html',
        'admin/health/health.service.ts',
        'admin/health/health.model.ts',
        'admin/logs/log.model.ts',
        'admin/logs/logs.ts',
        'admin/logs/logs.html',
        'admin/logs/logs.service.ts',
        'admin/metrics/metrics.ts',
        'admin/metrics/metrics.html',
        'admin/metrics/metrics.service.ts',
        'admin/metrics/metrics.model.ts',
        'admin/metrics/blocks/jvm-memory/jvm-memory.ts',
        'admin/metrics/blocks/jvm-memory/jvm-memory.html',
        'admin/metrics/blocks/jvm-threads/jvm-threads.ts',
        'admin/metrics/blocks/jvm-threads/jvm-threads.html',
        'admin/metrics/blocks/metrics-cache/metrics-cache.ts',
        'admin/metrics/blocks/metrics-cache/metrics-cache.html',
        'admin/metrics/blocks/metrics-datasource/metrics-datasource.ts',
        'admin/metrics/blocks/metrics-datasource/metrics-datasource.html',
        'admin/metrics/blocks/metrics-endpoints-requests/metrics-endpoints-requests.ts',
        'admin/metrics/blocks/metrics-endpoints-requests/metrics-endpoints-requests.html',
        'admin/metrics/blocks/metrics-garbagecollector/metrics-garbagecollector.ts',
        'admin/metrics/blocks/metrics-garbagecollector/metrics-garbagecollector.html',
        'admin/metrics/blocks/metrics-modal-threads/metrics-modal-threads.ts',
        'admin/metrics/blocks/metrics-modal-threads/metrics-modal-threads.html',
        'admin/metrics/blocks/metrics-request/metrics-request.ts',
        'admin/metrics/blocks/metrics-request/metrics-request.html',
        'admin/metrics/blocks/metrics-system/metrics-system.ts',
        'admin/metrics/blocks/metrics-system/metrics-system.html',
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
        'admin/tracker/tracker.ts',
        'admin/tracker/tracker.html',
        'core/tracker/tracker-activity.model.ts',
        'core/tracker/tracker.service.ts',
      ],
    },
    {
      condition: ctx => ctx.applicationTypeGateway && ctx.gatewayServicesApiAvailable,
      ...clientApplicationTemplatesBlock(),
      templates: [
        'admin/gateway/gateway-route.model.ts',
        'admin/gateway/gateway.ts',
        'admin/gateway/gateway.html',
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
        'shared/pagination/item-count.ts',
        // alert service code
        'shared/alert/alert.ts',
        'shared/alert/alert.html',
        'shared/alert/alert-error.ts',
        'shared/alert/alert-error.html',
        'shared/alert/alert-error.model.ts',
        // filtering options
        'shared/filter/index.ts',
        'shared/filter/filter.html',
        'shared/filter/filter.ts',
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
        'admin/configuration/configuration.spec.ts',
        'admin/configuration/configuration.service.spec.ts',
        'admin/health/modal/health-modal.spec.ts',
        'admin/health/health.spec.ts',
        'admin/health/health.service.spec.ts',
        'admin/logs/logs.spec.ts',
        'admin/logs/logs.service.spec.ts',
        'admin/metrics/metrics.spec.ts',
        'admin/metrics/metrics.service.spec.ts',
        'admin/metrics/blocks/metrics-modal-threads/metrics-modal-threads.spec.ts',
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
        'home/home.spec.ts',
        'layouts/main/main.spec.ts',
        'layouts/navbar/navbar.spec.ts',
        'layouts/profiles/page-ribbon.spec.ts',
        'shared/alert/alert.spec.ts',
        'shared/alert/alert-error.spec.ts',
        'shared/date/format-medium-date.pipe.spec.ts',
        'shared/date/format-medium-datetime.pipe.spec.ts',
        'shared/pagination/item-count.spec.ts',
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
        'account/activate/activate.spec.ts',
        'account/activate/activate.service.spec.ts',
        'account/password/password.spec.ts',
        'account/password/password.service.spec.ts',
        'account/password/password-strength-bar/password-strength-bar.spec.ts',
        'account/password-reset/init/password-reset-init.spec.ts',
        'account/password-reset/init/password-reset-init.service.spec.ts',
        'account/password-reset/finish/password-reset-finish.spec.ts',
        'account/password-reset/finish/password-reset-finish.service.spec.ts',
        'account/register/register.spec.ts',
        'account/register/register.service.spec.ts',
        'account/settings/settings.spec.ts',
      ],
    },
    {
      condition: generator => !generator.authenticationTypeOauth2,
      ...clientApplicationTemplatesBlock(),
      templates: ['login/login.spec.ts'],
    },
    {
      condition: generator => generator.authenticationTypeSession && generator.generateUserManagement,
      ...clientApplicationTemplatesBlock(),
      templates: ['account/sessions/sessions.spec.ts'],
    },
  ],
});

export const writeFiles = asWritingTask<AngularEntity, AngularApplication<AngularEntity>>(async function writeFiles({ application }) {
  if (!application.clientFrameworkAngular) return;

  await this.writeFiles({
    sections: files,
    context: application,
  });
});
