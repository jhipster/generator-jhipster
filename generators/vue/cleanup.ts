/**
 * Copyright 2013-2026 the original author or authors from the JHipster project.
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

import { asWritingTask } from '../base-application/support/task-type-inference.ts';
import type { Application as ClientApplication, Entity as ClientEntity } from '../client/types.ts';

/**
 * Removes files that were generated in previous JHipster versions and therefore
 * need to be removed.
 */
export default asWritingTask<ClientEntity, ClientApplication>(async function cleanupOldFilesTask({ application, control }) {
  if (control.isJhipsterVersionLessThan('7.0.0-beta.0')) {
    this.removeFile(`${application.clientSrcDir}app/admin/audits/audits.component.ts`);
    this.removeFile(`${application.clientSrcDir}app/admin/audits/audits.service.ts`);
    this.removeFile(`${application.clientSrcDir}app/admin/audits/audits.vue`);
    this.removeFile(`${application.clientTestDir}spec/app/admin/audits/audits.component.spec.ts`);
  }
  if (control.isJhipsterVersionLessThan('7.0.2')) {
    this.removeFile('config/index.js');
    this.removeFile('config/dev.env.js');
    this.removeFile('config/prod.env.js');
  }
  if (control.isJhipsterVersionLessThan('7.0.1')) {
    this.removeFile('.npmrc');
  }

  if (control.isJhipsterVersionLessThan('7.3.1')) {
    this.removeFile('webpack/env.js');
    this.removeFile('webpack/dev.env.js');
    this.removeFile('webpack/prod.env.js');
    this.removeFile('webpack/utils.js');
    this.removeFile('webpack/loader.conf.js');
  }

  if (control.isJhipsterVersionLessThan('7.4.2')) {
    this.removeFile(`${application.clientSrcDir}app/entities/user/user.oauth2.service.ts`);
  }
  if (control.isJhipsterVersionLessThan('7.10.1')) {
    this.removeFile('tsconfig.spec.json');
    this.removeFile(`${application.clientSrcDir}app/shared/config/formatter.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/shared/config/formatter.spec.ts`);
    this.removeFile(`${application.clientSrcDir}app/shared/date/filters.ts`);
    this.removeFile(`${application.clientTestDir}jest.conf.js`);
    this.removeFile(`${application.clientTestDir}spec/setup.js`);
  }
  if (control.isJhipsterVersionLessThan('8.0.0-beta.3')) {
    this.removeFile(`${application.clientTestDir}spec/setup.ts`);
    this.removeFile(`${application.clientTestDir}spec/tsconfig.json`);
    this.removeFile(`${application.clientTestDir}spec/app/account/account.service.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/core/home/home.component.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/core/error/error.component.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/core/jhi-navbar/jhi-navbar.component.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/core/ribbon/ribbon.component.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/shared/alert/alert.service.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/shared/config/axios-interceptor.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/shared/data/data-utils.service.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/shared/sort/sorts.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/admin/configuration/configuration.component.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/admin/health/health.component.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/admin/health/health-modal.component.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/admin/health/health.service.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/admin/logs/logs.component.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/admin/metrics/metrics.component.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/admin/metrics/metrics-modal.component.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/account/login.service.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/account/login-form/login-form.component.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/account/sessions/sessions.component.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/account/change-password/change-password.component.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/account/register/register.component.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/account/reset-password/init/reset-password-init.component.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/account/reset-password/finish/reset-password-finish.component.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/account/settings/settings.component.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/account/activate/activate.component.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/admin/tracker/tracker.component.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/admin/tracker/tracker.service.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/admin/user-management/user-management.component.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/admin/user-management/user-management-view.component.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/admin/user-management/user-management-edit.component.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/admin/gateway/gateway.component.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/entities/entities-menu.spec.ts`);
  }
  if (control.isJhipsterVersionLessThan('8.0.0-beta.4') && !application.microfrontend) {
    this.removeFile('.eslintrc.js');
    this.removeFile('tsconfig.test.json');
    this.removeFile('webpack/config.js');
    this.removeFile('webpack/vue.utils.js');
    this.removeFile('webpack/webpack.common.js');
    this.removeFile('webpack/webpack.dev.js');
    this.removeFile('webpack/webpack.prod.js');
  }
  if (control.isJhipsterVersionLessThan('8.1.1')) {
    this.removeFile('vite.config.ts');
    this.removeFile('vitest.config.ts');
  }

  await control.cleanupFiles({
    '8.10.1': [
      [application.authenticationTypeJwt, `${application.clientSrcDir}app/account/login.service.ts`],
      [application.authenticationTypeJwt, `${application.clientSrcDir}app/account/login.service.spec.ts`],
    ],
    '9.5.0': [
      `${application.clientSrcDir}app/admin/user-management/user-management.vue`,
      `${application.clientSrcDir}app/admin/user-management/user-management.component.ts`,
      `${application.clientSrcDir}app/admin/user-management/user-management.component.spec.ts`,
      `${application.clientSrcDir}app/admin/user-management/user-management-view.vue`,
      `${application.clientSrcDir}app/admin/user-management/user-management-view.component.ts`,
      `${application.clientSrcDir}app/admin/user-management/user-management-view.component.spec.ts`,
      `${application.clientSrcDir}app/admin/user-management/user-management-edit.vue`,
      `${application.clientSrcDir}app/admin/user-management/user-management-edit.component.ts`,
      `${application.clientSrcDir}app/admin/user-management/user-management-edit.component.spec.ts`,
      `${application.clientSrcDir}app/admin/user-management/user-management.service.ts`,
      `${application.clientSrcDir}app/shared/model/user.model.ts`,
      `${application.clientSrcDir}app/shared/model/user.model.spec.ts`,
      `${application.clientSrcDir}app/router/entities.ts`,
      `${application.clientSrcDir}app/core/home/home.vue`,
      `${application.clientSrcDir}app/core/home/home.component.ts`,
      `${application.clientSrcDir}app/core/home/home.component.spec.ts`,
      `${application.clientSrcDir}app/core/error/error.vue`,
      `${application.clientSrcDir}app/core/error/error.component.ts`,
      `${application.clientSrcDir}app/core/error/error.component.spec.ts`,
      `${application.clientSrcDir}app/core/error/error-loading.vue`,
      `${application.clientSrcDir}app/core/error/error-loading.spec.ts`,
      `${application.clientSrcDir}app/core/jhi-footer/jhi-footer.vue`,
      `${application.clientSrcDir}app/core/jhi-footer/jhi-footer.component.ts`,
      `${application.clientSrcDir}app/core/jhi-navbar/jhi-navbar.vue`,
      `${application.clientSrcDir}app/core/jhi-navbar/jhi-navbar.component.ts`,
      `${application.clientSrcDir}app/core/jhi-navbar/jhi-navbar.component.spec.ts`,
      `${application.clientSrcDir}app/core/ribbon/ribbon.vue`,
      `${application.clientSrcDir}app/core/ribbon/ribbon.component.ts`,
      `${application.clientSrcDir}app/core/ribbon/ribbon.component.spec.ts`,
      `${application.clientSrcDir}app/shared/config/axios-interceptor.ts`,
      `${application.clientSrcDir}app/shared/config/axios-interceptor.spec.ts`,
      `${application.clientSrcDir}app/shared/config/config.ts`,
      `${application.clientSrcDir}app/shared/config/config-bootstrap-vue.ts`,
      `${application.clientSrcDir}app/shared/config/dayjs.ts`,
      `${application.clientSrcDir}app/shared/config/languages.ts`,
      `${application.clientSrcDir}app/shared/config/store/account-store.ts`,
      `${application.clientSrcDir}app/shared/config/store/translation-store.ts`,
      `${application.clientSrcDir}app/shared/config/store/translation-store.spec.ts`,
      `${application.clientSrcDir}app/store.ts`,
      `${application.clientSrcDir}app/shared/composables/date-format.ts`,
      `${application.clientSrcDir}app/shared/composables/date-format.spec.ts`,
      `${application.clientSrcDir}app/shared/composables/entity-remove.ts`,
      `${application.clientSrcDir}app/shared/composables/entity-remove.spec.ts`,
      `${application.clientSrcDir}app/shared/composables/index.ts`,
      `${application.clientSrcDir}app/shared/composables/validation.ts`,
      `${application.clientSrcDir}app/shared/composables/validation.spec.ts`,
      `${application.clientSrcDir}app/shared/data/data-utils.service.ts`,
      `${application.clientSrcDir}app/shared/data/data-utils.service.spec.ts`,
      `${application.clientSrcDir}app/shared/computables/arrays.ts`,
      `${application.clientSrcDir}app/shared/computables/arrays.spec.ts`,
      `${application.clientSrcDir}app/shared/computables/index.ts`,
      `${application.clientSrcDir}app/locale/translation.service.ts`,
      `${application.clientSrcDir}app/shared/sort/jhi-sort-indicator.component.ts`,
      `${application.clientSrcDir}app/shared/sort/jhi-sort-indicator.vue`,
      `${application.clientSrcDir}app/shared/sort/sorts.ts`,
      `${application.clientSrcDir}app/shared/sort/sorts.spec.ts`,
      `${application.clientSrcDir}app/shared/jhi-item-count.component.ts`,
      `${application.clientSrcDir}app/shared/jhi-item-count.vue`,
      `${application.clientSrcDir}app/shared/testing/stubs.ts`,
    ],
  });
});
