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

import CoreGenerator from '../base-core/index.js';
import { CLIENT_WEBPACK_DIR } from '../generator-constants.js';
import { GeneratorDefinition } from '../base-application/generator.js';

/**
 * Removes files that where generated in previous JHipster versions and therefore
 * need to be removed.
 */
// eslint-disable-next-line import/prefer-default-export
export default function cleanupOldFilesTask(this: CoreGenerator, { application }: GeneratorDefinition['writingTaskParam']) {
  if (this.isJhipsterVersionLessThan('3.2.0')) {
    // removeFile and removeFolder methods should be called here for files and folders to cleanup
    this.removeFile(`${application.clientSrcDir}app/components/form/uib-pager.config.js`);
    this.removeFile(`${application.clientSrcDir}app/components/form/uib-pagination.config.js`);
  }
  if (this.isJhipsterVersionLessThan('3.11.0')) {
    this.removeFile(`${application.clientSrcDir}app/layouts/navbar/active-link.directive.js`);
  }
  if (this.isJhipsterVersionLessThan('4.11.1')) {
    this.removeFile(`${application.clientSrcDir}app/app.main-aot.ts`);
  }
  if (this.isJhipsterVersionLessThan('5.0.0')) {
    this.removeFile(`${application.clientSrcDir}app//app.route.ts`);
    this.removeFile(`${application.clientSrcDir}app/shared/auth/account.service.ts`);
    this.removeFile(`${application.clientSrcDir}app/shared/auth/auth-jwt.service.ts`);
    this.removeFile(`${application.clientSrcDir}app/shared/auth/auth-session.service.ts`);
    this.removeFile(`${application.clientSrcDir}app/shared/auth/csrf.service.ts`);
    this.removeFile(`${application.clientSrcDir}app/shared/auth/state-storage.service.ts`);
    this.removeFile(`${application.clientSrcDir}app/shared/auth/user-route-access-service.ts`);
    this.removeFile(`${application.clientSrcDir}app/shared/language/language.constants.ts`);
    this.removeFile(`${application.clientSrcDir}app/shared/language/language.helper.ts`);
    this.removeFile(`${application.clientSrcDir}app/shared/login/login-modal.service.ts`);
    this.removeFile(`${application.clientSrcDir}app/shared/login/login.service.ts`);
    this.removeFile(`${application.clientSrcDir}app/shared/model/base-entity.ts`);
    this.removeFile(`${application.clientSrcDir}app/shared/model/request-util.ts`);
    this.removeFile(`${application.clientSrcDir}app/shared/user/account.model.ts`);
    this.removeFile(`${application.clientSrcDir}app/shared/user/user.model.ts`);
    this.removeFile(`${application.clientSrcDir}app/shared/user/user.service.ts`);
    this.removeFile(`${application.clientSrcDir}app/admin/user-management/user-management-dialog.component.ts`);
    this.removeFile(`${application.clientSrcDir}app/admin/user-management/user-modal.service.ts`);
    this.removeFile(`${application.clientSrcDir}app/admin/user-management/user-modal.service.ts`);

    this.removeFile(`${application.clientTestDir}spec/app/shared/user/user.service.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/admin/user-management/user-management-dialog.component.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/entry.ts`);
    this.removeFile(`${application.clientTestDir}karma.conf.js`);
  }
  if (this.isJhipsterVersionLessThan('5.8.0')) {
    this.removeFile(`${application.clientSrcDir}app/admin/metrics/metrics-modal.component.html`);
    this.removeFile(`${application.clientSrcDir}app/admin/metrics/metrics-modal.component.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/admin/metrics/metrics-modal.component.spec.ts`);
  }
  if (this.isJhipsterVersionLessThan('6.0.0')) {
    this.removeFolder(`${application.clientSrcDir}app/shared/layout/header/menus`);
    this.removeFolder(`${application.clientTestDir}spec/app/shared/layout/header/menus`);
  }
  if (this.isJhipsterVersionLessThan('6.3.0')) {
    this.removeFile(`${application.clientSrcDir}app/account/index.ts`);
    this.removeFile(`${application.clientSrcDir}app/admin/index.ts`);
    this.removeFile(`${application.clientSrcDir}app/core/index.ts`);
    this.removeFile(`${application.clientSrcDir}app/home/index.ts`);
    this.removeFile(`${application.clientSrcDir}app/layouts/index.ts`);
    this.removeFile(`${application.clientSrcDir}app/shared/index.ts`);
    this.removeFile(`${application.clientSrcDir}app/shared/shared-common.module.ts`);
  }
  if (this.isJhipsterVersionLessThan('6.4.0')) {
    this.removeFile(`${application.clientSrcDir}app/admin/admin.route.ts`);
    this.removeFile(`${application.clientSrcDir}app/admin/admin.module.ts`);
  }
  if (this.isJhipsterVersionLessThan('6.6.1')) {
    this.removeFile(`${application.clientSrcDir}app/core/language/language.helper.ts`);
  }
  if (this.isJhipsterVersionLessThan('6.8.0')) {
    this.removeFile(`${application.clientSrcDir}app/tsconfig-aot.json`);
  }
  if (this.isJhipsterVersionLessThan('7.0.0-beta.0')) {
    this.removeFile(`${application.clientSrcDir}app/account/password/password-strength-bar.component.ts`);
    this.removeFile(`${application.clientSrcDir}app/account/password/password-strength-bar.scss`);
    this.removeFile(`${application.clientSrcDir}app/admin/docs/docs.scss`);
    this.removeFile(`${application.clientSrcDir}app/home/home.scss`);
    this.removeFile(`${application.clientSrcDir}app/layouts/navbar/navbar.scss`);
    this.removeFile(`${application.clientSrcDir}app/layouts/profiles/page-ribbon.scss`);
    this.removeFile(`${application.clientSrcDir}app/admin/audits/audit-application.model.ts`);
    this.removeFile(`${application.clientSrcDir}app/admin/audits/audit.model.ts`);
    this.removeFile(`${application.clientSrcDir}app/admin/audits/audits.component.html`);
    this.removeFile(`${application.clientSrcDir}app/admin/audits/audits.component.ts`);
    this.removeFile(`${application.clientSrcDir}app/admin/audits/audits.route.ts`);
    this.removeFile(`${application.clientSrcDir}app/admin/audits/audits.module.ts`);
    this.removeFile(`${application.clientSrcDir}app/admin/audits/audits.service.ts`);
    this.removeFile(`${application.clientSrcDir}app/admin/health/health-modal.component.ts`);
    this.removeFile(`${application.clientSrcDir}app/admin/health/health-modal.component.html`);
    this.removeFile(`${application.clientSrcDir}app/admin/user-management/user-management-delete-dialog.component.ts`);
    this.removeFile(`${application.clientSrcDir}app/admin/user-management/user-management-delete-dialog.component.html`);
    this.removeFile(`${application.clientSrcDir}app/admin/user-management/user-management-detail.component.ts`);
    this.removeFile(`${application.clientSrcDir}app/admin/user-management/user-management-detail.component.html`);
    this.removeFile(`${application.clientSrcDir}app/admin/user-management/user-management.component.ts`);
    this.removeFile(`${application.clientSrcDir}app/admin/user-management/user-management.component.html`);
    this.removeFile(`${application.clientSrcDir}app/admin/user-management/user-management-update.component.ts`);
    this.removeFile(`${application.clientSrcDir}app/admin/user-management/user-management-update.component.html`);
    this.removeFile(`${application.clientSrcDir}app/entities/entity.module.ts`);
    this.removeFile(`${application.clientSrcDir}app/shared/util/datepicker-adapter.ts`);
    this.removeFile(`${application.clientSrcDir}app/shared/login/login.component.ts`);
    this.removeFile(`${application.clientSrcDir}app/shared/login/login.component.html`);
    this.removeFile(`${application.clientSrcDir}app/core/auth/user-route-access-service.ts`);
    if (!application.authenticationTypeSession || !(application as any).communicationSpringWebsocket) {
      this.removeFile(`${application.clientSrcDir}app/core/auth/csrf.service.ts`);
    }
    this.removeFolder(`${application.clientSrcDir}app/core/login`);
    this.removeFolder(`${application.clientSrcDir}app/blocks`);
    this.removeFile(`${application.clientSrcDir}app/core/date/datepicker-adapter.ts`);
    this.removeFile(`${application.clientSrcDir}app/core/icons/font-awesome-icons.ts`);
    this.removeFile(`${application.clientSrcDir}app/core/language/language.constants.ts`);
    this.removeFile(`${application.clientSrcDir}app/shared/constants/authority.constants.ts`);
    this.removeFile(`${application.clientSrcDir}app/shared/constants/error.constants.ts`);
    this.removeFile(`${application.clientSrcDir}app/shared/constants/input.constants.ts`);
    this.removeFile(`${application.clientSrcDir}app/shared/constants/pagination.constants.ts`);
    this.removeFile(`${application.clientSrcDir}app/shared/util/request-util.ts`);
    this.removeFile(`${application.clientSrcDir}app/core/core.module.ts`);
    this.removeFile(`${application.clientSrcDir}app/vendor.ts`);
    this.removeFile(`${application.clientSrcDir}app/app.main.ts`);
    this.removeFile(`${application.clientSrcDir}app/polyfills.ts`);
    this.removeFile(`${CLIENT_WEBPACK_DIR}webpack.common.js`);
    this.removeFile(`${CLIENT_WEBPACK_DIR}webpack.dev.js`);
    this.removeFile(`${CLIENT_WEBPACK_DIR}webpack.prod.js`);
    this.removeFile(`${CLIENT_WEBPACK_DIR}utils.js`);
    this.removeFile('tsconfig.base.json');
    this.removeFile('postcss.config.js');
    this.removeFile('proxy.conf.json');
    this.removeFile('tslint.json');

    // unreleased files and folders cleanup for v7 developers
    this.removeFile(`${application.clientSrcDir}app/shared/duration.pipe.ts`);
    this.removeFile(`${application.clientSrcDir}app/shared/find-language-from-key.pipe.ts`);
    this.removeFile(`${application.clientSrcDir}app/shared/translate.directive.ts`);
    this.removeFile(`${application.clientSrcDir}app/core/user/authority.model.ts`);
    this.removeFolder(`${application.clientSrcDir}app/core/config`);
    this.removeFolder(`${application.clientSrcDir}app/core/event-manager`);
    this.removeFolder(`${application.clientSrcDir}app/admin/metrics/jvm-memory`);
    this.removeFolder(`${application.clientSrcDir}app/admin/metrics/jvm-threads`);
    this.removeFolder(`${application.clientSrcDir}app/admin/metrics/metrics-cache`);
    this.removeFolder(`${application.clientSrcDir}app/admin/metrics/metrics-datasource`);
    this.removeFolder(`${application.clientSrcDir}app/admin/metrics/metrics-endpoints-requests`);
    this.removeFolder(`${application.clientSrcDir}app/admin/metrics/metrics-garbagecollector`);
    this.removeFolder(`${application.clientSrcDir}app/admin/metrics/metrics-modal-threads`);
    this.removeFolder(`${application.clientSrcDir}app/admin/metrics/metrics-request`);
    this.removeFolder(`${application.clientSrcDir}app/admin/metrics/metrics-system`);
    this.removeFile(`${application.clientSrcDir}app/shared/has-any-authority.directive.ts`);
    this.removeFile(`${application.clientSrcDir}app/shared/item-count.component.ts`);
    this.removeFile(`${application.clientSrcDir}app/shared/item-count.component.spec.ts`);

    // test files removal from old location
    // a) deleted before moving tests next to files they are testing
    this.removeFile(`${application.clientTestDir}spec/app/account/password/password-strength-bar.component.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/admin/user-management/user-management-delete-dialog.component.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/admin/user-management/user-management-detail.component.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/admin/user-management/user-management.component.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/admin/user-management/user-management-update.component.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/core/login/login-modal.component.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/core/login/login-modal.service.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/core/user/account.service.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/admin/audits/audits.component.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/admin/audits/audits.service.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/shared/login/login.component.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/test.module.ts`);
    this.removeFile(`${application.clientTestDir}jest.ts`);
    this.removeFile(`${application.clientTestDir}jest-global-mocks.ts`);
    this.removeFile(`${application.clientTestDir}spec/helpers/mock-account.service.ts`);
    this.removeFile(`${application.clientTestDir}spec/helpers/mock-active-modal.service.ts`);
    this.removeFile(`${application.clientTestDir}spec/helpers/mock-alert.service.ts`);
    this.removeFile(`${application.clientTestDir}spec/helpers/mock-event-manager.service.ts`);
    this.removeFile(`${application.clientTestDir}spec/helpers/mock-language.service.ts`);
    this.removeFile(`${application.clientTestDir}spec/helpers/mock-login-modal.service.ts`);
    this.removeFile(`${application.clientTestDir}spec/helpers/mock-login.service.ts`);
    this.removeFile(`${application.clientTestDir}spec/helpers/mock-route.service.ts`);
    this.removeFile(`${application.clientTestDir}spec/helpers/mock-state-storage.service.ts`);
    this.removeFile(`${application.clientTestDir}spec/helpers/mock-tracker.service.ts`);
    this.removeFile(`${application.clientTestDir}spec/helpers/spyobject.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/shared/translate.directive.spec.ts`);
    this.removeFolder(`${application.clientTestDir}spec/app/core/event-manager`);
    // b) deleted while moving tests next to files they are testing
    this.removeFile(`${application.clientTestDir}spec/app/account/activate/activate.component.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/account/password-reset/finish/password-reset-finish.component.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/account/password-reset/init/password-reset-init.component.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/account/password/password-strength-bar/password-strength-bar.component.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/account/password/password.component.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/account/register/register.component.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/account/sessions/sessions.component.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/account/settings/settings.component.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/admin/configuration/configuration.component.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/admin/configuration/configuration.service.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/admin/health/health.component.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/admin/logs/logs.component.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/admin/logs/logs.service.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/admin/metrics/metrics.component.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/admin/metrics/metrics.service.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/admin/user-management/delete/user-management-delete-dialog.component.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/admin/user-management/detail/user-management-detail.component.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/admin/user-management/list/user-management.component.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/admin/user-management/update/user-management-update.component.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/core/auth/account.service.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/core/user/user.service.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/core/util/alert.service.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/core/util/data-util.service.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/core/util/event-manager.service.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/core/util/parse-links.service.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/home/home.component.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/layouts/main/main.component.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/layouts/navbar/navbar.component.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/login/login.component.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/shared/alert/alert-error.component.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/shared/alert/alert.component.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/shared/date/format-medium-date.pipe.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/shared/date/format-medium-datetime.pipe.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/shared/item-count.component.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/shared/language/translate.directive.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/shared/sort/sort-by.directive.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/shared/sort/sort.directive.spec.ts`);
    this.removeFile(`${application.clientTestDir}jest.conf.js`);
  }
  if (this.isJhipsterVersionLessThan('7.0.0-beta.1')) {
    this.removeFile(`${application.clientSrcDir}app/core/user/account.model.ts`);
    this.removeFile(`${application.clientSrcDir}app/core/user/user.model.ts`);
    this.removeFile(`${application.clientSrcDir}app/core/user/user.service.ts`);
    this.removeFile(`${application.clientSrcDir}app/core/user/user.service.spec.ts`);
  }
  if (this.isJhipsterVersionLessThan('7.0.0-beta.2')) {
    this.removeFile(`${application.clientSrcDir}app/core/config/config.service.ts`);
    this.removeFile(`${application.clientSrcDir}app/core/config/config.service.spec.ts`);
    this.removeFile('.npmrc');
  }
  if (this.isJhipsterVersionLessThan('7.1.1')) {
    this.removeFile('.npmrc');
  }

  if (this.isJhipsterVersionLessThan('7.6.1')) {
    this.removeFile(`${application.clientSrcDir}content/scss/rtl.scss`);
  }
  if (this.isJhipsterVersionLessThan('7.10.0')) {
    this.removeFile('.browserslistrc');
    this.removeFile(`${application.clientSrcDir}polyfills.ts`);
    this.removeFile(`${application.clientSrcDir}app/admin/user-management/user-management.module.ts`);
    this.removeFile(`${application.clientSrcDir}app/admin/metrics/metrics.module.ts`);
    this.removeFile(`${application.clientSrcDir}app/admin/logs/logs.module.ts`);
    this.removeFile(`${application.clientSrcDir}app/admin/health/health.module.ts`);
    this.removeFile(`${application.clientSrcDir}app/admin/gateway/gateway.module.ts`);
    this.removeFile(`${application.clientSrcDir}app/admin/docs/docs.module.ts`);
    this.removeFile(`${application.clientSrcDir}app/admin/configuration/configuration.module.ts`);
    this.removeFile(`${application.clientSrcDir}app/home/home.module.ts`);
    this.removeFile(`${application.clientSrcDir}app/home/home.route.ts`);
    this.removeFile(`${application.clientSrcDir}app/admin/configuration/configuration.route.ts`);
    this.removeFile(`${application.clientSrcDir}app/admin/docs/docs.route.ts`);
    this.removeFile(`${application.clientSrcDir}app/admin/gateway/gateway.route.ts`);
    this.removeFile(`${application.clientSrcDir}app/admin/health/health.route.ts`);
    this.removeFile(`${application.clientSrcDir}app/admin/logs/logs.route.ts`);
    this.removeFile(`${application.clientSrcDir}app/admin/metrics/metrics.route.ts`);
    this.removeFile(`${application.clientSrcDir}app/layouts/navbar/navbar.route.ts`);
    this.removeFile(`${application.clientSrcDir}app/shared/shared-libs.module.ts`);
    this.removeFile(`${application.clientSrcDir}app/shared/shared-libs.module.ts`);
    this.removeFile(`${application.clientSrcDir}app/login/login.module.ts`);
    this.removeFile(`${application.clientSrcDir}app/login/login.route.ts`);
    this.removeFile(`${application.clientSrcDir}app/admin/tracker/tracker.route.ts`);
    this.removeFile(`${application.clientSrcDir}app/admin/tracker/tracker.module.ts`);
    this.removeFile(`${application.clientSrcDir}app/account/account.module.ts`);
  }
  if (this.isJhipsterVersionLessThan('8.0.1')) {
    this.removeFile(`${application.clientSrcDir}app/layouts/main/main.module.ts`);
    this.removeFile(`${application.clientSrcDir}app/admin/admin-routing.module.ts`);
    this.removeFile(`${application.clientSrcDir}app/app.module.ts`);
    this.removeFile(`${application.clientSrcDir}app/app-routing.module.ts`);
    this.removeFile(`${application.clientSrcDir}app/entities/entity-routing.module.ts`);
  }
  if (this.isJhipsterVersionLessThan('8.1.1')) {
    this.removeFile(`${application.clientSrcDir}app/entities/user/user.service.ts`);
    this.removeFile(`${application.clientSrcDir}app/entities/user/user.service.spec.ts`);
  }
}
