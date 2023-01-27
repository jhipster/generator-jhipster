/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
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

import { ANGULAR_DIR, REACT_DIR, VUE_DIR, CLIENT_WEBPACK_DIR, DOCKER_DIR } from './generator-constants.mjs';
import { clientFrameworkTypes, authenticationTypes } from '../jdl/jhipster/index.mjs';

const { ANGULAR, REACT, VUE } = clientFrameworkTypes;
const { OAUTH2, SESSION } = authenticationTypes;

/**
 * Removes files that where generated in previous JHipster versions and therefore
 * need to be removed.
 *
 * WARNING this only removes files created by the main generator. Each sub-generator
 * should clean-up its own files: see the `cleanup` method in entity/index.js for cleaning
 * up entities.
 *
 * @param {any} generator - reference to generator
 */
// eslint-disable-next-line import/prefer-default-export
export function cleanupOldFiles(generator, data) {
  if (generator.isJhipsterVersionLessThan('3.2.0')) {
    // removeFile and removeFolder methods should be called here for files and folders to cleanup
    generator.removeFile(`${ANGULAR_DIR}components/form/uib-pager.config.js`);
    generator.removeFile(`${ANGULAR_DIR}components/form/uib-pagination.config.js`);
  }
  if (generator.isJhipsterVersionLessThan('3.11.0')) {
    generator.removeFile(`${data.clientSrcDir}app/layouts/navbar/active-link.directive.js`);
  }
  if (generator.isJhipsterVersionLessThan('4.11.1')) {
    generator.removeFile(`${data.clientSrcDir}app/app.main-aot.ts`);
  }
  if (generator.isJhipsterVersionLessThan('4.13.1')) {
    generator.config.delete('hibernateCache');
  }
  if (generator.isJhipsterVersionLessThan('5.0.0')) {
    generator.removeFile(`${ANGULAR_DIR}/app.route.ts`);
    generator.removeFile(`${ANGULAR_DIR}shared/auth/account.service.ts`);
    generator.removeFile(`${ANGULAR_DIR}shared/auth/auth-jwt.service.ts`);
    generator.removeFile(`${ANGULAR_DIR}shared/auth/auth-session.service.ts`);
    generator.removeFile(`${ANGULAR_DIR}shared/auth/csrf.service.ts`);
    generator.removeFile(`${ANGULAR_DIR}shared/auth/state-storage.service.ts`);
    generator.removeFile(`${ANGULAR_DIR}shared/auth/user-route-access-service.ts`);
    generator.removeFile(`${ANGULAR_DIR}shared/language/language.constants.ts`);
    generator.removeFile(`${ANGULAR_DIR}shared/language/language.helper.ts`);
    generator.removeFile(`${ANGULAR_DIR}shared/login/login-modal.service.ts`);
    generator.removeFile(`${ANGULAR_DIR}shared/login/login.service.ts`);
    generator.removeFile(`${ANGULAR_DIR}shared/model/base-entity.ts`);
    generator.removeFile(`${ANGULAR_DIR}shared/model/request-util.ts`);
    generator.removeFile(`${ANGULAR_DIR}shared/user/account.model.ts`);
    generator.removeFile(`${ANGULAR_DIR}shared/user/user.model.ts`);
    generator.removeFile(`${ANGULAR_DIR}shared/user/user.service.ts`);
    generator.removeFile(`${ANGULAR_DIR}admin/user-management/user-management-dialog.component.ts`);
    generator.removeFile(`${ANGULAR_DIR}admin/user-management/user-modal.service.ts`);
    generator.removeFile(`${ANGULAR_DIR}admin/user-management/user-modal.service.ts`);

    generator.removeFile(`${data.clientTestDir}spec/app/shared/user/user.service.spec.ts`);
    generator.removeFile(`${data.clientTestDir}spec/app/admin/user-management/user-management-dialog.component.spec.ts`);
    generator.removeFile(`${data.clientTestDir}spec/entry.ts`);
    generator.removeFile(`${data.clientTestDir}karma.conf.js`);
  }
  if (generator.isJhipsterVersionLessThan('5.8.0')) {
    generator.removeFile(`${ANGULAR_DIR}admin/metrics/metrics-modal.component.html`);
    generator.removeFile(`${ANGULAR_DIR}admin/metrics/metrics-modal.component.ts`);
    generator.removeFile(`${data.clientTestDir}spec/app/admin/metrics/metrics-modal.component.spec.ts`);
  }
  if (
    generator.isJhipsterVersionLessThan('5.2.2') &&
    generator.authenticationType === OAUTH2 &&
    generator.applicationType === 'microservice'
  ) {
    generator.removeFolder(`${DOCKER_DIR}realm-config`);
    generator.removeFile(`${DOCKER_DIR}keycloak.yml`);
  }
  if (generator.isJhipsterVersionLessThan('6.0.0')) {
    generator.removeFolder(`${data.clientSrcDir}app/shared/layout/header/menus`);
    generator.removeFolder(`${data.clientTestDir}spec/app/shared/layout/header/menus`);
  }
  if (generator.isJhipsterVersionLessThan('6.1.0')) {
    generator.config.delete('blueprint');
    generator.config.delete('blueprintVersion');
  }
  if (generator.isJhipsterVersionLessThan('6.3.0') && generator.jhipsterConfig.clientFramework === ANGULAR) {
    generator.removeFile(`${ANGULAR_DIR}account/index.ts`);
    generator.removeFile(`${ANGULAR_DIR}admin/index.ts`);
    generator.removeFile(`${ANGULAR_DIR}core/index.ts`);
    generator.removeFile(`${ANGULAR_DIR}home/index.ts`);
    generator.removeFile(`${ANGULAR_DIR}layouts/index.ts`);
    generator.removeFile(`${ANGULAR_DIR}shared/index.ts`);
    generator.removeFile(`${ANGULAR_DIR}shared/shared-common.module.ts`);
  }
  if (generator.isJhipsterVersionLessThan('6.3.0') && generator.jhipsterConfig.clientFramework === REACT) {
    generator.removeFile('tslint.json');
  }
  if (generator.isJhipsterVersionLessThan('6.4.0') && generator.jhipsterConfig.clientFramework === ANGULAR) {
    generator.removeFile(`${ANGULAR_DIR}admin/admin.route.ts`);
    generator.removeFile(`${ANGULAR_DIR}admin/admin.module.ts`);
  }
  if (generator.isJhipsterVersionLessThan('6.6.1') && generator.jhipsterConfig.clientFramework === ANGULAR) {
    generator.removeFile(`${ANGULAR_DIR}core/language/language.helper.ts`);
  }
  if (generator.isJhipsterVersionLessThan('6.8.0') && generator.jhipsterConfig.clientFramework === ANGULAR) {
    generator.removeFile(`${ANGULAR_DIR}tsconfig-aot.json`);
  }
  if (generator.isJhipsterVersionLessThan('7.0.0-beta.0') && generator.jhipsterConfig) {
    if (generator.jhipsterConfig.clientFramework === ANGULAR) {
      generator.removeFile(`${ANGULAR_DIR}account/password/password-strength-bar.component.ts`);
      generator.removeFile(`${ANGULAR_DIR}account/password/password-strength-bar.scss`);
      generator.removeFile(`${ANGULAR_DIR}admin/docs/docs.scss`);
      generator.removeFile(`${ANGULAR_DIR}home/home.scss`);
      generator.removeFile(`${ANGULAR_DIR}layouts/navbar/navbar.scss`);
      generator.removeFile(`${ANGULAR_DIR}layouts/profiles/page-ribbon.scss`);
      generator.removeFile(`${ANGULAR_DIR}admin/audits/audit-data.model.ts`);
      generator.removeFile(`${ANGULAR_DIR}admin/audits/audit.model.ts`);
      generator.removeFile(`${ANGULAR_DIR}admin/audits/audits.component.html`);
      generator.removeFile(`${ANGULAR_DIR}admin/audits/audits.component.ts`);
      generator.removeFile(`${ANGULAR_DIR}admin/audits/audits.route.ts`);
      generator.removeFile(`${ANGULAR_DIR}admin/audits/audits.module.ts`);
      generator.removeFile(`${ANGULAR_DIR}admin/audits/audits.service.ts`);
      generator.removeFile(`${ANGULAR_DIR}admin/health/health-modal.component.ts`);
      generator.removeFile(`${ANGULAR_DIR}admin/health/health-modal.component.html`);
      generator.removeFile(`${ANGULAR_DIR}admin/user-management/user-management-delete-dialog.component.ts`);
      generator.removeFile(`${ANGULAR_DIR}admin/user-management/user-management-delete-dialog.component.html`);
      generator.removeFile(`${ANGULAR_DIR}admin/user-management/user-management-detail.component.ts`);
      generator.removeFile(`${ANGULAR_DIR}admin/user-management/user-management-detail.component.html`);
      generator.removeFile(`${ANGULAR_DIR}admin/user-management/user-management.component.ts`);
      generator.removeFile(`${ANGULAR_DIR}admin/user-management/user-management.component.html`);
      generator.removeFile(`${ANGULAR_DIR}admin/user-management/user-management-update.component.ts`);
      generator.removeFile(`${ANGULAR_DIR}admin/user-management/user-management-update.component.html`);
      generator.removeFile(`${ANGULAR_DIR}entities/entity.module.ts`);
      generator.removeFile(`${ANGULAR_DIR}shared/util/datepicker-adapter.ts`);
      generator.removeFile(`${ANGULAR_DIR}shared/login/login.component.ts`);
      generator.removeFile(`${ANGULAR_DIR}shared/login/login.component.html`);
      generator.removeFile(`${ANGULAR_DIR}core/auth/user-route-access-service.ts`);
      if (generator.jhipsterConfig.authenticationType !== SESSION || generator.jhipsterConfig.websocket !== 'spring-websocket') {
        generator.removeFile(`${ANGULAR_DIR}core/auth/csrf.service.ts`);
      }
      generator.removeFolder(`${ANGULAR_DIR}core/login`);
      generator.removeFolder(`${ANGULAR_DIR}blocks`);
      generator.removeFile(`${ANGULAR_DIR}core/date/datepicker-adapter.ts`);
      generator.removeFile(`${ANGULAR_DIR}core/icons/font-awesome-icons.ts`);
      generator.removeFile(`${ANGULAR_DIR}core/language/language.constants.ts`);
      generator.removeFile(`${ANGULAR_DIR}shared/constants/authority.constants.ts`);
      generator.removeFile(`${ANGULAR_DIR}shared/constants/error.constants.ts`);
      generator.removeFile(`${ANGULAR_DIR}shared/constants/input.constants.ts`);
      generator.removeFile(`${ANGULAR_DIR}shared/constants/pagination.constants.ts`);
      generator.removeFile(`${ANGULAR_DIR}shared/util/request-util.ts`);
      generator.removeFile(`${ANGULAR_DIR}core/core.module.ts`);
      generator.removeFile(`${ANGULAR_DIR}vendor.ts`);
      generator.removeFile(`${ANGULAR_DIR}app.main.ts`);
      generator.removeFile(`${ANGULAR_DIR}polyfills.ts`);
      generator.removeFile(`${CLIENT_WEBPACK_DIR}webpack.common.js`);
      generator.removeFile(`${CLIENT_WEBPACK_DIR}webpack.dev.js`);
      generator.removeFile(`${CLIENT_WEBPACK_DIR}webpack.prod.js`);
      generator.removeFile(`${CLIENT_WEBPACK_DIR}utils.js`);
      generator.removeFile('tsconfig.base.json');
      generator.removeFile('postcss.config.js');
      generator.removeFile('proxy.conf.json');
      generator.removeFile('tslint.json');

      // unreleased files and folders cleanup for v7 developers
      generator.removeFile(`${ANGULAR_DIR}shared/duration.pipe.ts`);
      generator.removeFile(`${ANGULAR_DIR}shared/find-language-from-key.pipe.ts`);
      generator.removeFile(`${ANGULAR_DIR}shared/translate.directive.ts`);
      generator.removeFile(`${ANGULAR_DIR}core/user/authority.model.ts`);
      generator.removeFolder(`${ANGULAR_DIR}core/config`);
      generator.removeFolder(`${ANGULAR_DIR}core/event-manager`);
      generator.removeFolder(`${ANGULAR_DIR}admin/metrics/jvm-memory`);
      generator.removeFolder(`${ANGULAR_DIR}admin/metrics/jvm-threads`);
      generator.removeFolder(`${ANGULAR_DIR}admin/metrics/metrics-cache`);
      generator.removeFolder(`${ANGULAR_DIR}admin/metrics/metrics-datasource`);
      generator.removeFolder(`${ANGULAR_DIR}admin/metrics/metrics-endpoints-requests`);
      generator.removeFolder(`${ANGULAR_DIR}admin/metrics/metrics-garbagecollector`);
      generator.removeFolder(`${ANGULAR_DIR}admin/metrics/metrics-modal-threads`);
      generator.removeFolder(`${ANGULAR_DIR}admin/metrics/metrics-request`);
      generator.removeFolder(`${ANGULAR_DIR}admin/metrics/metrics-system`);
      generator.removeFile(`${ANGULAR_DIR}shared/has-any-authority.directive.ts`);
      generator.removeFile(`${ANGULAR_DIR}shared/item-count.component.ts`);
      generator.removeFile(`${ANGULAR_DIR}shared/item-count.component.spec.ts`);

      // test files removal from old location
      // a) deleted before moving tests next to files they are testing
      generator.removeFile(`${data.clientTestDir}spec/app/account/password/password-strength-bar.component.spec.ts`);
      generator.removeFile(`${data.clientTestDir}spec/app/admin/user-management/user-management-delete-dialog.component.spec.ts`);
      generator.removeFile(`${data.clientTestDir}spec/app/admin/user-management/user-management-detail.component.spec.ts`);
      generator.removeFile(`${data.clientTestDir}spec/app/admin/user-management/user-management.component.spec.ts`);
      generator.removeFile(`${data.clientTestDir}spec/app/admin/user-management/user-management-update.component.spec.ts`);
      generator.removeFile(`${data.clientTestDir}spec/app/core/login/login-modal.component.spec.ts`);
      generator.removeFile(`${data.clientTestDir}spec/app/core/login/login-modal.service.spec.ts`);
      generator.removeFile(`${data.clientTestDir}spec/app/core/user/account.service.spec.ts`);
      generator.removeFile(`${data.clientTestDir}spec/app/admin/audits/audits.component.spec.ts`);
      generator.removeFile(`${data.clientTestDir}spec/app/admin/audits/audits.service.spec.ts`);
      generator.removeFile(`${data.clientTestDir}spec/app/shared/login/login.component.spec.ts`);
      generator.removeFile(`${data.clientTestDir}spec/test.module.ts`);
      generator.removeFile(`${data.clientTestDir}jest.ts`);
      generator.removeFile(`${data.clientTestDir}jest-global-mocks.ts`);
      generator.removeFile(`${data.clientTestDir}spec/helpers/mock-account.service.ts`);
      generator.removeFile(`${data.clientTestDir}spec/helpers/mock-active-modal.service.ts`);
      generator.removeFile(`${data.clientTestDir}spec/helpers/mock-alert.service.ts`);
      generator.removeFile(`${data.clientTestDir}spec/helpers/mock-event-manager.service.ts`);
      generator.removeFile(`${data.clientTestDir}spec/helpers/mock-language.service.ts`);
      generator.removeFile(`${data.clientTestDir}spec/helpers/mock-login-modal.service.ts`);
      generator.removeFile(`${data.clientTestDir}spec/helpers/mock-login.service.ts`);
      generator.removeFile(`${data.clientTestDir}spec/helpers/mock-route.service.ts`);
      generator.removeFile(`${data.clientTestDir}spec/helpers/mock-state-storage.service.ts`);
      generator.removeFile(`${data.clientTestDir}spec/helpers/mock-tracker.service.ts`);
      generator.removeFile(`${data.clientTestDir}spec/helpers/spyobject.ts`);
      generator.removeFile(`${data.clientTestDir}spec/app/shared/translate.directive.spec.ts`);
      generator.removeFolder(`${data.clientTestDir}spec/app/core/event-manager`);
      // b) deleted while moving tests next to files they are testing
      generator.removeFile(`${data.clientTestDir}spec/app/account/activate/activate.component.spec.ts`);
      generator.removeFile(`${data.clientTestDir}spec/app/account/password-reset/finish/password-reset-finish.component.spec.ts`);
      generator.removeFile(`${data.clientTestDir}spec/app/account/password-reset/init/password-reset-init.component.spec.ts`);
      generator.removeFile(`${data.clientTestDir}spec/app/account/password/password-strength-bar/password-strength-bar.component.spec.ts`);
      generator.removeFile(`${data.clientTestDir}spec/app/account/password/password.component.spec.ts`);
      generator.removeFile(`${data.clientTestDir}spec/app/account/register/register.component.spec.ts`);
      generator.removeFile(`${data.clientTestDir}spec/app/account/sessions/sessions.component.spec.ts`);
      generator.removeFile(`${data.clientTestDir}spec/app/account/settings/settings.component.spec.ts`);
      generator.removeFile(`${data.clientTestDir}spec/app/admin/configuration/configuration.component.spec.ts`);
      generator.removeFile(`${data.clientTestDir}spec/app/admin/configuration/configuration.service.spec.ts`);
      generator.removeFile(`${data.clientTestDir}spec/app/admin/health/health.component.spec.ts`);
      generator.removeFile(`${data.clientTestDir}spec/app/admin/logs/logs.component.spec.ts`);
      generator.removeFile(`${data.clientTestDir}spec/app/admin/logs/logs.service.spec.ts`);
      generator.removeFile(`${data.clientTestDir}spec/app/admin/metrics/metrics.component.spec.ts`);
      generator.removeFile(`${data.clientTestDir}spec/app/admin/metrics/metrics.service.spec.ts`);
      generator.removeFile(`${data.clientTestDir}spec/app/admin/user-management/delete/user-management-delete-dialog.component.spec.ts`);
      generator.removeFile(`${data.clientTestDir}spec/app/admin/user-management/detail/user-management-detail.component.spec.ts`);
      generator.removeFile(`${data.clientTestDir}spec/app/admin/user-management/list/user-management.component.spec.ts`);
      generator.removeFile(`${data.clientTestDir}spec/app/admin/user-management/update/user-management-update.component.spec.ts`);
      generator.removeFile(`${data.clientTestDir}spec/app/core/auth/account.service.spec.ts`);
      generator.removeFile(`${data.clientTestDir}spec/app/core/user/user.service.spec.ts`);
      generator.removeFile(`${data.clientTestDir}spec/app/core/util/alert.service.spec.ts`);
      generator.removeFile(`${data.clientTestDir}spec/app/core/util/data-util.service.spec.ts`);
      generator.removeFile(`${data.clientTestDir}spec/app/core/util/event-manager.service.spec.ts`);
      generator.removeFile(`${data.clientTestDir}spec/app/core/util/parse-links.service.spec.ts`);
      generator.removeFile(`${data.clientTestDir}spec/app/home/home.component.spec.ts`);
      generator.removeFile(`${data.clientTestDir}spec/app/layouts/main/main.component.spec.ts`);
      generator.removeFile(`${data.clientTestDir}spec/app/layouts/navbar/navbar.component.spec.ts`);
      generator.removeFile(`${data.clientTestDir}spec/app/login/login.component.spec.ts`);
      generator.removeFile(`${data.clientTestDir}spec/app/shared/alert/alert-error.component.spec.ts`);
      generator.removeFile(`${data.clientTestDir}spec/app/shared/alert/alert.component.spec.ts`);
      generator.removeFile(`${data.clientTestDir}spec/app/shared/date/format-medium-date.pipe.spec.ts`);
      generator.removeFile(`${data.clientTestDir}spec/app/shared/date/format-medium-datetime.pipe.spec.ts`);
      generator.removeFile(`${data.clientTestDir}spec/app/shared/item-count.component.spec.ts`);
      generator.removeFile(`${data.clientTestDir}spec/app/shared/language/translate.directive.spec.ts`);
      generator.removeFile(`${data.clientTestDir}spec/app/shared/sort/sort-by.directive.spec.ts`);
      generator.removeFile(`${data.clientTestDir}spec/app/shared/sort/sort.directive.spec.ts`);
      generator.removeFile(`${data.clientTestDir}jest.conf.js`);
    } else if (generator.jhipsterConfig.clientFramework === REACT) {
      generator.removeFile(`${REACT_DIR}modules/administration/audits/audits.tsx`);
      generator.removeFile(`${data.clientTestDir}spec/enzyme-setup.ts`);
    } else if (generator.jhipsterConfig.clientFramework === VUE) {
      generator.removeFile(`${VUE_DIR}admin/audits/audits.component.ts`);
      generator.removeFile(`${VUE_DIR}admin/audits/audits.service.ts`);
      generator.removeFile(`${VUE_DIR}admin/audits/audits.vue`);
      generator.removeFile(`${data.clientTestDir}spec/app/admin/audits/audits.component.spec.ts`);
    }
  }

  if (generator.isJhipsterVersionLessThan('7.0.0-beta.1') && generator.jhipsterConfig) {
    if (generator.jhipsterConfig.clientFramework === ANGULAR) {
      generator.removeFile(`${ANGULAR_DIR}core/user/account.model.ts`);
      generator.removeFile(`${ANGULAR_DIR}core/user/user.model.ts`);
      generator.removeFile(`${ANGULAR_DIR}core/user/user.service.ts`);
      generator.removeFile(`${ANGULAR_DIR}core/user/user.service.spec.ts`);
    } else if (generator.jhipsterConfig.clientFramework === REACT) {
      generator.removeFile(`${data.clientTestDir}jest.conf.js`);
      generator.removeFile(`${data.clientTestDir}spec/icons-mock.ts`);
      generator.removeFile(`${data.clientTestDir}spec/storage-mock.ts`);
      generator.removeFile(`${data.clientTestDir}spec/app/utils.ts`);
      generator.removeFile(`${data.clientTestDir}spec/app/config/axios-interceptor.spec.ts`);
      generator.removeFile(`${data.clientTestDir}spec/app/config/notification-middleware.spec.ts`);
      generator.removeFile(`${data.clientTestDir}spec/app/shared/reducers/application-profile.spec.ts`);
      generator.removeFile(`${data.clientTestDir}spec/app/shared/reducers/authentication.spec.ts`);
      generator.removeFile(`${data.clientTestDir}spec/app/shared/util/entity-utils.spec.ts`);
      generator.removeFile(`${data.clientTestDir}spec/app/shared/auth/private-route.spec.tsx`);
      generator.removeFile(`${data.clientTestDir}spec/app/shared/error/error-boundary.spec.tsx`);
      generator.removeFile(`${data.clientTestDir}spec/app/shared/error/error-boundary-route.spec.tsx`);
      generator.removeFile(`${data.clientTestDir}spec/app/shared/layout/header/header.spec.tsx`);
      generator.removeFile(`${data.clientTestDir}spec/app/shared/layout/menus/account.spec.tsx`);
      generator.removeFile(`${data.clientTestDir}spec/app/modules/administration/administration.reducer.spec.ts`);
      generator.removeFile(`${data.clientTestDir}spec/app/modules/account/register/register.reducer.spec.ts`);
      generator.removeFile(`${data.clientTestDir}spec/app/modules/account/activate/activate.reducer.spec.ts`);
      generator.removeFile(`${data.clientTestDir}spec/app/modules/account/password/password.reducer.spec.ts`);
      generator.removeFile(`${data.clientTestDir}spec/app/modules/account/settings/settings.reducer.spec.ts`);
      generator.removeFile(`${data.clientTestDir}spec/app/modules/administration/user-management/user-management.reducer.spec.ts`);
      generator.removeFile(`${data.clientTestDir}spec/app/shared/reducers/locale.spec.ts`);
      generator.removeFile(`${data.clientTestDir}spec/app/shared/reducers/user-management.spec.ts`);
    }
  }

  if (generator.isJhipsterVersionLessThan('7.0.0-beta.2') && generator.jhipsterConfig) {
    if (generator.jhipsterConfig.clientFramework === ANGULAR) {
      generator.removeFile(`${ANGULAR_DIR}core/config/config.service.ts`);
      generator.removeFile(`${ANGULAR_DIR}core/config/config.service.spec.ts`);
      generator.removeFile('.npmrc');
    }
  }

  if (generator.isJhipsterVersionLessThan('7.0.1') && generator.jhipsterConfig) {
    if (generator.jhipsterConfig.clientFramework === VUE) {
      generator.removeFile('.npmrc');
    }
  }
  if (generator.isJhipsterVersionLessThan('7.0.2') && generator.jhipsterConfig) {
    if (generator.jhipsterConfig.clientFramework === VUE) {
      generator.removeFile('config/index.js');
      generator.removeFile('config/dev.env.js');
      generator.removeFile('config/prod.env.js');
    }
  }
  if (generator.isJhipsterVersionLessThan('7.1.0') && generator.jhipsterConfig) {
    if (generator.jhipsterConfig.clientFramework === REACT) {
      generator.removeFile(`${REACT_DIR}shared/reducers/action-type.util.ts`);
      generator.removeFile(`${REACT_DIR}config/devtools.tsx`);
    }
  }
  if (generator.isJhipsterVersionLessThan('7.1.1') && generator.jhipsterConfig) {
    if (generator.jhipsterConfig.clientFramework === ANGULAR) {
      generator.removeFile('.npmrc');
    }
  }
}
