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
const { replaceVueTranslations } = require('./transform-vue.cjs');
const constants = require('../generator-constants');
const { OAUTH2, SESSION } = require('../../jdl/jhipster/authentication-types');
const { SPRING_WEBSOCKET } = require('../../jdl/jhipster/websocket-types');
const { GATEWAY } = require('../../jdl/jhipster/application-types');

const { CLIENT_MAIN_SRC_DIR, CLIENT_TEST_SRC_DIR, VUE_DIR } = constants;

const vueFiles = {
  _: {
    transform: [replaceVueTranslations],
  },
  common: [
    {
      templates: [
        'package.json',
        'tsconfig.json',
        'tsconfig.spec.json',
        '.postcssrc.js',
        '.eslintrc.js',
        'webpack/config.js',
        'webpack/webpack.common.js',
        'webpack/webpack.dev.js',
        'webpack/webpack.prod.js',
        'webpack/vue.utils.js',
      ],
    },
    {
      condition: generator => generator.protractorTests,
      templates: ['tsconfig.e2e.json'],
    },
  ],
  entities: [
    {
      path: VUE_DIR,
      templates: [
        'entities/entities.component.ts',
        'entities/entities.vue',
        'entities/entities-menu.component.ts',
        'entities/entities-menu.vue',
        'router/entities.ts',
      ],
    },
  ],
  microfrontend: [
    {
      condition: generator => generator.microfrontend,
      templates: ['webpack/webpack.microfrontend.js.jhi.vue'],
    },
    {
      condition: generator => generator.microfrontend,
      path: VUE_DIR,
      templates: ['index.ts'],
    },
    {
      condition: generator => generator.microfrontend,
      path: CLIENT_TEST_SRC_DIR,
      templates: [
        'spec/app/microfrontends/entities-menu.component.ts',
        'spec/app/microfrontends/entities-menu.vue',
        'spec/app/microfrontends/entities-router.ts',
      ],
    },
    {
      condition: generator => generator.applicationTypeMicroservice,
      path: CLIENT_TEST_SRC_DIR,
      templates: ['spec/app/entities/entities-menu.spec.ts'],
    },
  ],
  sass: [
    {
      path: CLIENT_MAIN_SRC_DIR,
      templates: ['content/scss/_bootstrap-variables.scss', 'content/scss/global.scss', 'content/scss/vendor.scss'],
    },
  ],
  vueApp: [
    {
      path: VUE_DIR,
      templates: [
        'app.vue',
        'app.component.ts',
        'shims-vue.d.ts',
        'constants.ts',
        'declarations.d.ts',
        'main.ts',
        'shared/alert/alert.service.ts',
        'shared/config/axios-interceptor.ts',
        'shared/config/config.ts',
        'shared/config/config-bootstrap-vue.ts',
        'shared/config/dayjs.ts',
        'shared/config/store/account-store.ts',
        'shared/security/authority.ts',
        'router/index.ts',
        'router/admin.ts',
        'router/pages.ts',
      ],
    },
  ],
  i18n: [
    {
      condition: generator => generator.enableTranslation,
      path: VUE_DIR,
      templates: ['locale/translation.service.ts', 'shared/config/formatter.ts', 'shared/config/store/translation-store.ts'],
    },
  ],
  sharedVueApp: [
    {
      path: VUE_DIR,
      templates: [
        'core/home/home.vue',
        'core/home/home.component.ts',
        'core/error/error.vue',
        'core/error/error.component.ts',
        'core/jhi-footer/jhi-footer.vue',
        'core/jhi-footer/jhi-footer.component.ts',
        'core/jhi-navbar/jhi-navbar.vue',
        'core/jhi-navbar/jhi-navbar.component.ts',
        'core/ribbon/ribbon.vue',
        'core/ribbon/ribbon.component.ts',
        'shared/date/filters.ts',
        'shared/sort/jhi-sort-indicator.component.ts',
        'shared/sort/jhi-sort-indicator.vue',
        'shared/sort/sorts.ts',
        'shared/data/data-utils.service.ts',
        'shared/jhi-item-count.component.ts',
        'shared/jhi-item-count.vue',
        'shared/model/user.model.ts',
      ],
    },
  ],
  accountModule: [
    {
      path: VUE_DIR,
      templates: ['account/account.service.ts'],
    },
    {
      condition: generator => generator.authenticationType !== OAUTH2,
      path: VUE_DIR,
      templates: [
        'account/login-form/login-form.vue',
        'account/login-form/login-form.component.ts',
        'account/login.service.ts',
        'router/account.ts',
      ],
    },
    {
      condition: generator => !generator.skipUserManagement,
      path: VUE_DIR,
      templates: [
        'account/change-password/change-password.vue',
        'account/change-password/change-password.component.ts',
        'account/register/register.vue',
        'account/register/register.component.ts',
        'account/register/register.service.ts',
        'account/reset-password/init/reset-password-init.vue',
        'account/reset-password/init/reset-password-init.component.ts',
        'account/reset-password/finish/reset-password-finish.vue',
        'account/reset-password/finish/reset-password-finish.component.ts',
        'account/settings/settings.vue',
        'account/settings/settings.component.ts',
        'account/activate/activate.component.ts',
        'account/activate/activate.service.ts',
        'account/activate/activate.vue',
      ],
    },
    {
      condition: generator => generator.authenticationType === SESSION && !this.skipUserManagement,
      path: VUE_DIR,
      templates: ['account/sessions/sessions.vue', 'account/sessions/sessions.component.ts'],
    },
    {
      condition: generator => generator.authenticationType === OAUTH2,
      path: VUE_DIR,
      templates: ['account/login.service.ts'],
    },
  ],
  adminModule: [
    {
      path: VUE_DIR,
      templates: ['admin/docs/docs.vue', 'admin/docs/docs.component.ts'],
    },
    {
      path: VUE_DIR,
      condition: generator => generator.withAdminUi,
      templates: [
        'admin/configuration/configuration.vue',
        'admin/configuration/configuration.component.ts',
        'admin/configuration/configuration.service.ts',
        'admin/health/health.vue',
        'admin/health/health.component.ts',
        'admin/health/health-modal.vue',
        'admin/health/health-modal.component.ts',
        'admin/health/health.service.ts',
        'admin/logs/logs.vue',
        'admin/logs/logs.component.ts',
        'admin/logs/logs.service.ts',
        'admin/metrics/metrics.vue',
        'admin/metrics/metrics.component.ts',
        'admin/metrics/metrics.service.ts',
        'admin/metrics/metrics-modal.vue',
        'admin/metrics/metrics-modal.component.ts',
      ],
    },
    {
      condition: generator => generator.websocket === SPRING_WEBSOCKET,
      path: VUE_DIR,
      templates: ['admin/tracker/tracker.vue', 'admin/tracker/tracker.component.ts', 'admin/tracker/tracker.service.ts'],
    },
    {
      condition: generator => !generator.skipUserManagement,
      path: VUE_DIR,
      templates: [
        'admin/user-management/user-management.vue',
        'admin/user-management/user-management.component.ts',
        'admin/user-management/user-management-view.vue',
        'admin/user-management/user-management-view.component.ts',
        'admin/user-management/user-management-edit.vue',
        'admin/user-management/user-management-edit.component.ts',
        'admin/user-management/user-management.service.ts',
      ],
    },
    {
      condition: generator => generator.applicationType === GATEWAY && generator.serviceDiscoveryAny,
      path: VUE_DIR,
      templates: ['admin/gateway/gateway.vue', 'admin/gateway/gateway.component.ts', 'admin/gateway/gateway.service.ts'],
    },
    {
      condition: generator => !generator.skipUserManagement || generator.authenticationType === OAUTH2,
      path: VUE_DIR,
      templates: ['entities/user/user.service.ts'],
    },
  ],
  clientTestConfig: [
    {
      path: CLIENT_TEST_SRC_DIR,
      templates: ['jest.conf.js'],
    },
  ],
  clientTestFw: [
    {
      path: CLIENT_TEST_SRC_DIR,
      templates: [
        'jest.conf.js',
        'spec/app/account/account.service.spec.ts',
        'spec/app/core/home/home.component.spec.ts',
        'spec/app/core/error/error.component.spec.ts',
        'spec/app/core/jhi-navbar/jhi-navbar.component.spec.ts',
        'spec/app/core/ribbon/ribbon.component.spec.ts',
        'spec/app/shared/alert/alert.service.spec.ts',
        'spec/app/shared/config/axios-interceptor.spec.ts',
        'spec/app/shared/data/data-utils.service.spec.ts',
        'spec/app/shared/sort/sorts.spec.ts',
      ],
    },
    {
      path: CLIENT_TEST_SRC_DIR,
      condition: generator => generator.withAdminUi,
      templates: [
        'spec/app/admin/configuration/configuration.component.spec.ts',
        'spec/app/admin/health/health.component.spec.ts',
        'spec/app/admin/health/health-modal.component.spec.ts',
        'spec/app/admin/health/health.service.spec.ts',
        'spec/app/admin/logs/logs.component.spec.ts',
        'spec/app/admin/metrics/metrics.component.spec.ts',
        'spec/app/admin/metrics/metrics-modal.component.spec.ts',
      ],
    },
    {
      condition: generator => generator.enableTranslation,
      path: CLIENT_TEST_SRC_DIR,
      templates: ['spec/app/shared/config/formatter.spec.ts'],
    },
    {
      condition: generator => generator.authenticationType === OAUTH2,
      path: CLIENT_TEST_SRC_DIR,
      templates: ['spec/app/account/login.service.spec.ts'],
    },
    {
      condition: generator => generator.authenticationType !== OAUTH2,
      path: CLIENT_TEST_SRC_DIR,
      templates: ['spec/app/account/login-form/login-form.component.spec.ts'],
    },
    {
      condition: generator => generator.authenticationType === SESSION && !generator.skipUserManagement,
      path: CLIENT_TEST_SRC_DIR,
      templates: ['spec/app/account/sessions/sessions.component.spec.ts', 'spec/app/account/login.service.spec.ts'],
    },
    {
      condition: generator => !generator.skipUserManagement,
      path: CLIENT_TEST_SRC_DIR,
      templates: [
        'spec/app/account/change-password/change-password.component.spec.ts',
        'spec/app/account/register/register.component.spec.ts',
        'spec/app/account/reset-password/init/reset-password-init.component.spec.ts',
        'spec/app/account/reset-password/finish/reset-password-finish.component.spec.ts',
        'spec/app/account/settings/settings.component.spec.ts',
        'spec/app/account/activate/activate.component.spec.ts',
      ],
    },
    {
      condition: generator => generator.websocket === SPRING_WEBSOCKET,
      path: CLIENT_TEST_SRC_DIR,
      templates: ['spec/app/admin/tracker/tracker.component.spec.ts', 'spec/app/admin/tracker/tracker.service.spec.ts'],
    },
    {
      condition: generator => !generator.skipUserManagement,
      path: CLIENT_TEST_SRC_DIR,
      templates: [
        'spec/app/admin/user-management/user-management.component.spec.ts',
        'spec/app/admin/user-management/user-management-view.component.spec.ts',
        'spec/app/admin/user-management/user-management-edit.component.spec.ts',
      ],
    },
    {
      condition: generator => generator.applicationType === GATEWAY && generator.serviceDiscoveryAny,
      path: CLIENT_TEST_SRC_DIR,
      templates: ['spec/app/admin/gateway/gateway.component.spec.ts'],
    },
    {
      condition: generator => generator.protractorTests,
      path: CLIENT_TEST_SRC_DIR,
      templates: [
        'e2e/modules/account/account.spec.ts',
        'e2e/modules/administration/administration.spec.ts',
        'e2e/util/utils.ts',
        'e2e/page-objects/navbar-page.ts',
        'e2e/page-objects/signin-page.ts',
        'e2e/page-objects/alert-page.ts',
        'e2e/page-objects/administration-page.ts',
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

function cleanup() {
  if (!this.clientFrameworkVue) return;

  if (this.isJhipsterVersionLessThan('7.3.1')) {
    this.removeFile('webpack/env.js');
    this.removeFile('webpack/dev.env.js');
    this.removeFile('webpack/prod.env.js');
    this.removeFile('webpack/utils.js');
    this.removeFile('webpack/loader.conf.js');
  }

  if (this.isJhipsterVersionLessThan('7.4.2')) {
    this.removeFile(`${VUE_DIR}entities/user/user.oauth2.service.ts`);
  }
}

function writeFiles() {
  return this.writeFiles({
    sections: vueFiles,
    rootTemplatesPath: 'vue',
  });
}

module.exports = {
  files: vueFiles,
  cleanup,
  writeFiles,
};
