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
import { asWriteFilesSection, asWritingTask } from '../base-application/support/index.js';
import { clientApplicationTemplatesBlock, clientRootTemplatesBlock } from '../client/support/files.js';
import type { Application as ClientApplication, Entity as ClientEntity } from '../client/types.js';

export const files = asWriteFilesSection({
  common: [
    clientRootTemplatesBlock({
      templates: [
        { sourceFile: 'eslint.config.js.jhi.react', destinationFile: ctx => `${ctx.eslintConfigFile}.jhi.react` },
        'package.json',
        'tsconfig.json',
        'tsconfig.test.json',
        'jest.conf.js',
        'webpack/environment.js',
        'webpack/webpack.common.js',
        'webpack/webpack.dev.js',
        'webpack/webpack.prod.js',
        'webpack/utils.js',
        'webpack/logo-jhipster.png',
      ],
    }),
  ],
  sass: [
    clientRootTemplatesBlock({
      templates: ['postcss.config.js'],
    }),
  ],
  reactApp: [
    {
      ...clientApplicationTemplatesBlock(),
      templates: [
        'app.tsx',
        'index.tsx',
        'routes.tsx',
        'setup-tests.ts',
        'typings.d.ts',
        'config/constants.ts',
        'config/dayjs.ts',
        'config/axios-interceptor.ts',
        'config/error-middleware.ts',
        'config/logger-middleware.ts',
        'config/notification-middleware.ts',
        'config/store.ts',
        'config/icon-loader.ts',
      ],
    },
    {
      condition: generator => generator.enableTranslation,
      ...clientApplicationTemplatesBlock(),
      templates: ['config/translation.ts'],
    },
    {
      condition: generator => generator.communicationSpringWebsocket,
      ...clientApplicationTemplatesBlock(),
      templates: ['config/websocket-middleware.ts'],
    },
    {
      ...clientApplicationTemplatesBlock(),
      templates: ['app.scss', '_bootstrap-variables.scss'],
    },
  ],
  reactEntities: [
    {
      ...clientApplicationTemplatesBlock(),
      templates: ['entities/reducers.ts', 'entities/menu.tsx', 'entities/routes.tsx'],
    },
  ],
  reactMain: [
    {
      ...clientApplicationTemplatesBlock(),
      templates: ['modules/home/home.tsx', 'modules/login/logout.tsx'],
    },
    {
      condition: generator => !generator.authenticationTypeOauth2,
      ...clientApplicationTemplatesBlock(),
      templates: ['modules/login/login.tsx', 'modules/login/login-modal.tsx'],
    },
    {
      condition: generator => generator.authenticationTypeOauth2,
      ...clientApplicationTemplatesBlock(),
      templates: ['modules/login/login-redirect.tsx'],
    },
    {
      ...clientApplicationTemplatesBlock(),
      templates: ['modules/home/home.scss'],
    },
  ],
  reducers: [
    {
      ...clientApplicationTemplatesBlock(),
      templates: [
        'shared/reducers/index.ts',
        'shared/reducers/reducer.utils.ts',
        'shared/reducers/authentication.ts',
        'shared/reducers/application-profile.ts',
      ],
    },
    {
      condition: generator => generator.enableTranslation,
      ...clientApplicationTemplatesBlock(),
      templates: ['shared/reducers/locale.ts'],
    },
    {
      condition: generator => generator.authenticationTypeOauth2,
      ...clientApplicationTemplatesBlock(),
      templates: ['shared/reducers/user-management.ts'],
    },
  ],
  accountModule: [
    {
      condition: generator => generator.generateUserManagement,
      ...clientApplicationTemplatesBlock(),
      templates: [
        'modules/account/index.tsx',
        'modules/account/activate/activate.tsx',
        'modules/account/password/password.tsx',
        'modules/account/register/register.tsx',
        'modules/account/password-reset/init/password-reset-init.tsx',
        'modules/account/password-reset/finish/password-reset-finish.tsx',
        'modules/account/settings/settings.tsx',
        'modules/account/register/register.reducer.ts',
        'modules/account/activate/activate.reducer.ts',
        'modules/account/password-reset/password-reset.reducer.ts',
        'modules/account/password/password.reducer.ts',
        'modules/account/settings/settings.reducer.ts',
      ],
    },
    {
      condition: generator => generator.authenticationTypeSession && generator.generateUserManagement,
      ...clientApplicationTemplatesBlock(),
      templates: ['modules/account/sessions/sessions.tsx', 'modules/account/sessions/sessions.reducer.ts'],
    },
  ],
  adminModule: [
    {
      ...clientApplicationTemplatesBlock(),
      templates: [
        'modules/administration/index.tsx',
        'modules/administration/administration.reducer.ts',
        'modules/administration/docs/docs.tsx',
        'modules/administration/docs/docs.scss',
      ],
    },
    {
      condition: generator => generator.withAdminUi,
      ...clientApplicationTemplatesBlock(),
      templates: [
        'modules/administration/configuration/configuration.tsx',
        'modules/administration/health/health.tsx',
        'modules/administration/health/health-modal.tsx',
        'modules/administration/logs/logs.tsx',
        'modules/administration/metrics/metrics.tsx',
      ],
    },
    {
      condition: generator => generator.communicationSpringWebsocket,
      ...clientApplicationTemplatesBlock(),
      templates: ['modules/administration/tracker/tracker.tsx'],
    },
    {
      condition: generator => generator.generateUserManagement,
      ...clientApplicationTemplatesBlock(),
      templates: [
        'modules/administration/user-management/index.tsx',
        'modules/administration/user-management/user-management.tsx',
        'modules/administration/user-management/user-management-update.tsx',
        'modules/administration/user-management/user-management-detail.tsx',
        'modules/administration/user-management/user-management-delete-dialog.tsx',
        'modules/administration/user-management/user-management.reducer.ts',
      ],
    },
    {
      condition: ctx => ctx.applicationTypeGateway && ctx.gatewayServicesApiAvailable,
      ...clientApplicationTemplatesBlock(),
      templates: ['modules/administration/gateway/gateway.tsx'],
    },
  ],
  reactShared: [
    {
      ...clientApplicationTemplatesBlock(),
      templates: [
        // layouts
        'shared/layout/footer/footer.tsx',
        'shared/layout/header/header.tsx',
        'shared/layout/header/header-components.tsx',
        'shared/layout/menus/index.ts',
        'shared/layout/menus/admin.tsx',
        'shared/layout/menus/account.tsx',
        'shared/layout/menus/entities.tsx',
        'shared/layout/menus/menu-components.tsx',
        'shared/layout/menus/menu-item.tsx',
        'shared/layout/password/password-strength-bar.tsx',
        // util
        'shared/util/date-utils.ts',
        'shared/util/pagination.constants.ts',
        'shared/util/entity-utils.ts',
        // components
        'shared/auth/private-route.tsx',
        'shared/error/error-boundary.tsx',
        'shared/error/error-boundary-routes.tsx',
        'shared/error/page-not-found.tsx',
        'shared/DurationFormat.tsx',
        // model
        'shared/model/user.model.ts',
      ],
    },
    {
      condition: generator => generator.enableTranslation,
      ...clientApplicationTemplatesBlock(),
      templates: ['shared/layout/menus/locale.tsx'],
    },
    {
      condition: generator => generator.authenticationTypeOauth2,
      ...clientApplicationTemplatesBlock(),
      templates: ['shared/util/url-utils.ts'],
    },
    {
      condition: generator => generator.authenticationTypeSession && generator.communicationSpringWebsocket,
      ...clientApplicationTemplatesBlock(),
      templates: ['shared/util/cookie-utils.ts'],
    },
    {
      ...clientApplicationTemplatesBlock(),
      templates: [
        'shared/layout/header/header.scss',
        'shared/layout/footer/footer.scss',
        'shared/layout/password/password-strength-bar.scss',
      ],
    },
  ],
  microfrontend: [
    clientRootTemplatesBlock({
      condition: generator => generator.microfrontend,
      templates: ['webpack/webpack.microfrontend.js.jhi.react'],
    }),
    {
      condition: generator => generator.microfrontend,
      ...clientApplicationTemplatesBlock(),
      templates: ['main.tsx', 'shared/error/error-loading.tsx'],
    },
  ],
  clientTestFw: [
    {
      ...clientApplicationTemplatesBlock(),
      templates: [
        'config/axios-interceptor.spec.ts',
        'config/notification-middleware.spec.ts',
        'shared/reducers/application-profile.spec.ts',
        'shared/reducers/authentication.spec.ts',
        'shared/util/entity-utils.spec.ts',
        'shared/auth/private-route.spec.tsx',
        'shared/error/error-boundary.spec.tsx',
        'shared/error/error-boundary-routes.spec.tsx',
        'shared/layout/header/header.spec.tsx',
        'shared/layout/menus/account.spec.tsx',
        'modules/administration/administration.reducer.spec.ts',
      ],
    },
    {
      condition: generator => generator.generateUserManagement,
      ...clientApplicationTemplatesBlock(),
      templates: [
        // 'spec/app/modules/account/register/register.spec.tsx',
        'modules/account/register/register.reducer.spec.ts',
        'modules/account/activate/activate.reducer.spec.ts',
        'modules/account/password/password.reducer.spec.ts',
        'modules/account/settings/settings.reducer.spec.ts',
      ],
    },
    {
      condition: generator => generator.generateUserManagement,
      ...clientApplicationTemplatesBlock(),
      templates: ['modules/administration/user-management/user-management.reducer.spec.ts'],
    },
    {
      condition: generator => generator.enableTranslation,
      ...clientApplicationTemplatesBlock(),
      templates: ['shared/reducers/locale.spec.ts'],
    },
    {
      condition: generator => generator.authenticationTypeOauth2,
      ...clientApplicationTemplatesBlock(),
      templates: ['shared/reducers/user-management.spec.ts'],
    },
  ],
});

export const writeFiles = asWritingTask<ClientEntity, ClientApplication<ClientEntity>>(async function writeFiles({ application }) {
  if (!application.clientFrameworkReact) return;

  await this.writeFiles({
    sections: files,
    context: application,
  });
});
