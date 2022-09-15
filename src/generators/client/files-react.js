/**
 * Copyright 2013-2022 the original author or authors from the JHipster project.
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
const { replaceReactTranslations } = require('./transform-react.cjs');
const { SPRING_WEBSOCKET } = require('../../jdl/jhipster/websocket-types');
const { OAUTH2, SESSION } = require('../../jdl/jhipster/authentication-types');
const { GATEWAY } = require('../../jdl/jhipster/application-types');
const constants = require('../generator-constants');

const { CLIENT_MAIN_SRC_DIR, CLIENT_TEST_SRC_DIR, REACT_DIR } = constants;

const files = {
  _: {
    transform: [replaceReactTranslations],
  },
  common: [
    {
      templates: [
        'package.json',
        '.eslintrc.json',
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
    },
    {
      condition: generator => generator.protractorTests,
      templates: ['tsconfig.e2e.json'],
    },
  ],
  sass: [
    {
      templates: ['postcss.config.js'],
    },
  ],
  reactApp: [
    {
      path: REACT_DIR,
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
      path: REACT_DIR,
      templates: ['config/translation.ts'],
    },
    {
      condition: generator => generator.websocket === SPRING_WEBSOCKET,
      path: REACT_DIR,
      templates: ['config/websocket-middleware.ts'],
    },
    {
      path: REACT_DIR,
      templates: ['app.scss', '_bootstrap-variables.scss'],
    },
  ],
  reactEntities: [
    {
      path: REACT_DIR,
      templates: ['entities/reducers.ts', 'entities/menu.tsx', 'entities/routes.tsx'],
    },
  ],
  reactMain: [
    {
      path: REACT_DIR,
      templates: ['modules/home/home.tsx', 'modules/login/logout.tsx'],
    },
    {
      condition: generator => generator.authenticationType !== OAUTH2,
      path: REACT_DIR,
      templates: ['modules/login/login.tsx', 'modules/login/login-modal.tsx'],
    },
    {
      condition: generator => generator.authenticationType === OAUTH2,
      path: REACT_DIR,
      templates: ['modules/login/login-redirect.tsx'],
    },
    {
      path: REACT_DIR,
      templates: ['modules/home/home.scss'],
    },
  ],
  reducers: [
    {
      path: REACT_DIR,
      templates: [
        'shared/reducers/index.ts',
        'shared/reducers/reducer.utils.ts',
        'shared/reducers/authentication.ts',
        'shared/reducers/application-profile.ts',
      ],
    },
    {
      condition: generator => generator.enableTranslation,
      path: REACT_DIR,
      templates: ['shared/reducers/locale.ts'],
    },
    {
      condition: generator => generator.authenticationType === OAUTH2,
      path: REACT_DIR,
      templates: ['shared/reducers/user-management.ts'],
    },
  ],
  accountModule: [
    {
      condition: generator => !generator.skipUserManagement,
      path: REACT_DIR,
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
      condition: generator => generator.authenticationType === SESSION && !generator.skipUserManagement,
      path: REACT_DIR,
      templates: ['modules/account/sessions/sessions.tsx', 'modules/account/sessions/sessions.reducer.ts'],
    },
  ],
  adminModule: [
    {
      path: REACT_DIR,
      templates: [
        'modules/administration/index.tsx',
        'modules/administration/administration.reducer.ts',
        'modules/administration/docs/docs.tsx',
        'modules/administration/docs/docs.scss',
      ],
    },
    {
      condition: generator => generator.withAdminUi,
      path: REACT_DIR,
      templates: [
        'modules/administration/configuration/configuration.tsx',
        'modules/administration/health/health.tsx',
        'modules/administration/health/health-modal.tsx',
        'modules/administration/logs/logs.tsx',
        'modules/administration/metrics/metrics.tsx',
      ],
    },
    {
      condition: generator => generator.websocket === SPRING_WEBSOCKET,
      path: REACT_DIR,
      templates: ['modules/administration/tracker/tracker.tsx'],
    },
    {
      condition: generator => !generator.skipUserManagement,
      path: REACT_DIR,
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
      condition: generator => generator.applicationType === GATEWAY && generator.serviceDiscoveryAny,
      path: REACT_DIR,
      templates: ['modules/administration/gateway/gateway.tsx'],
    },
  ],
  reactShared: [
    {
      path: REACT_DIR,
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
      path: REACT_DIR,
      templates: ['shared/layout/menus/locale.tsx'],
    },
    {
      condition: generator => generator.authenticationType === OAUTH2,
      path: REACT_DIR,
      templates: ['shared/util/url-utils.ts'],
    },
    {
      condition: generator => generator.authenticationType === SESSION && generator.websocket === SPRING_WEBSOCKET,
      path: REACT_DIR,
      templates: ['shared/util/cookie-utils.ts'],
    },
    {
      path: REACT_DIR,
      templates: [
        'shared/layout/header/header.scss',
        'shared/layout/footer/footer.scss',
        'shared/layout/password/password-strength-bar.scss',
      ],
    },
  ],
  microfrontend: [
    {
      condition: generator => generator.microfrontend,
      templates: ['webpack/webpack.microfrontend.js.jhi.react'],
    },
    {
      condition: generator => generator.microfrontend,
      path: REACT_DIR,
      templates: ['main.tsx', 'shared/error/error-loading.tsx'],
    },
    {
      condition: generator => generator.microfrontend && generator.applicationTypeGateway,
      path: CLIENT_MAIN_SRC_DIR,
      templates: ['microfrontends/entities-menu.tsx', 'microfrontends/entities-routes.tsx'],
    },
  ],
  clientTestFw: [
    {
      path: REACT_DIR,
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
      condition: generator => !generator.skipUserManagement,
      path: REACT_DIR,
      templates: [
        // 'spec/app/modules/account/register/register.spec.tsx',
        'modules/account/register/register.reducer.spec.ts',
        'modules/account/activate/activate.reducer.spec.ts',
        'modules/account/password/password.reducer.spec.ts',
        'modules/account/settings/settings.reducer.spec.ts',
      ],
    },
    {
      condition: generator => !generator.skipUserManagement,
      path: REACT_DIR,
      templates: ['modules/administration/user-management/user-management.reducer.spec.ts'],
    },
    {
      condition: generator => generator.enableTranslation,
      path: REACT_DIR,
      templates: ['shared/reducers/locale.spec.ts'],
    },
    {
      condition: generator => generator.skipUserManagement && generator.authenticationType === OAUTH2,
      path: REACT_DIR,
      templates: ['shared/reducers/user-management.spec.ts'],
    },
    {
      condition: generator => generator.protractorTests,
      path: CLIENT_TEST_SRC_DIR,
      templates: [
        'e2e/modules/account/account.spec.ts',
        'e2e/modules/administration/administration.spec.ts',
        'e2e/util/utils.ts',
        'e2e/page-objects/base-component.ts',
        'e2e/page-objects/navbar-page.ts',
        'e2e/page-objects/signin-page.ts',
        'protractor.conf.js',
      ],
    },
    {
      condition: generator => generator.protractorTests && !generator.skipUserManagement,
      path: CLIENT_TEST_SRC_DIR,
      templates: ['e2e/page-objects/password-page.ts', 'e2e/page-objects/settings-page.ts', 'e2e/page-objects/register-page.ts'],
    },
  ],
};

module.exports = {
  writeFiles,
  files,
  cleanup,
};

function cleanup() {
  if (!this.clientFrameworkReact) return;

  if (this.isJhipsterVersionLessThan('7.4.0') && this.enableI18nRTL) {
    this.removeFile(`${CLIENT_MAIN_SRC_DIR}content/scss/rtl.scss`);
  }
  if (this.isJhipsterVersionLessThan('7.4.1')) {
    this.removeFile('.npmrc');
  }
  if (this.isJhipsterVersionLessThan('7.7.1')) {
    this.removeFile(`${CLIENT_MAIN_SRC_DIR}app/entities/index.tsx`);
  }
  if (this.isJhipsterVersionLessThan('7.8.2')) {
    this.removeFile(`${CLIENT_MAIN_SRC_DIR}app/shared/error/error-boundary-route.tsx`);
    this.removeFile(`${CLIENT_MAIN_SRC_DIR}app/shared/error/error-boundary-route.spec.tsx`);
  }
  if (this.isJhipsterVersionLessThan('7.9.3')) {
    this.removeFile(`${CLIENT_MAIN_SRC_DIR}app/config/translation-middleware.ts`);
  }
}

function writeFiles() {
  return this.writeFiles({
    sections: files,
    rootTemplatesPath: 'react',
  });
}
