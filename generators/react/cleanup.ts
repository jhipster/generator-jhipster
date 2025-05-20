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

import { asWritingTask } from '../base-application/support/task-type-inference.js';
import type {
  Entity as DeprecatedEntity,
  Field as DeprecatedField,
  Relationship as DeprecatedRelationship,
} from '../../lib/types/application/index.js';
import type { PrimaryKey as DeprecatedPrimarykey } from '../../lib/types/application/entity.js';
import type { ApplicationType } from '../../lib/types/application/application.js';

/**
 * Removes files that where generated in previous JHipster versions and therefore
 * need to be removed.
 */
export default asWritingTask<
  DeprecatedField,
  DeprecatedPrimarykey<DeprecatedField>,
  DeprecatedRelationship<any>,
  DeprecatedEntity<DeprecatedField, DeprecatedPrimarykey<DeprecatedField>, DeprecatedRelationship<any>>,
  ApplicationType<DeprecatedField, DeprecatedPrimarykey<DeprecatedField>, DeprecatedRelationship<any>>,
  any
>(function cleanupOldFilesTask({ application, control }) {
  if (control.isJhipsterVersionLessThan('6.3.0')) {
    this.removeFile('tslint.json');
  }
  if (control.isJhipsterVersionLessThan('7.0.0-beta.0')) {
    this.removeFile(`${application.clientSrcDir}app/modules/administration/audits/audits.tsx`);
    this.removeFile(`${application.clientTestDir}spec/enzyme-setup.ts`);
  }
  if (control.isJhipsterVersionLessThan('7.0.0-beta.1')) {
    this.removeFile(`${application.clientTestDir}jest.conf.js`);
    this.removeFile(`${application.clientTestDir}spec/icons-mock.ts`);
    this.removeFile(`${application.clientTestDir}spec/storage-mock.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/utils.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/config/axios-interceptor.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/config/notification-middleware.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/shared/reducers/application-profile.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/shared/reducers/authentication.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/shared/util/entity-utils.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/shared/auth/private-route.spec.tsx`);
    this.removeFile(`${application.clientTestDir}spec/app/shared/error/error-boundary.spec.tsx`);
    this.removeFile(`${application.clientTestDir}spec/app/shared/error/error-boundary-route.spec.tsx`);
    this.removeFile(`${application.clientTestDir}spec/app/shared/layout/header/header.spec.tsx`);
    this.removeFile(`${application.clientTestDir}spec/app/shared/layout/menus/account.spec.tsx`);
    this.removeFile(`${application.clientTestDir}spec/app/modules/administration/administration.reducer.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/modules/account/register/register.reducer.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/modules/account/activate/activate.reducer.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/modules/account/password/password.reducer.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/modules/account/settings/settings.reducer.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/modules/administration/user-management/user-management.reducer.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/shared/reducers/locale.spec.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/shared/reducers/user-management.spec.ts`);
  }
  if (control.isJhipsterVersionLessThan('7.1.0')) {
    this.removeFile(`${application.clientSrcDir}app/shared/reducers/action-type.util.ts`);
    this.removeFile(`${application.clientSrcDir}app/config/devtools.tsx`);
  }

  if (control.isJhipsterVersionLessThan('7.4.0') && application.enableI18nRTL) {
    this.removeFile(`${application.clientSrcDir}content/scss/rtl.scss`);
  }
  if (control.isJhipsterVersionLessThan('7.4.1')) {
    this.removeFile('.npmrc');
  }
  if (control.isJhipsterVersionLessThan('7.7.1')) {
    this.removeFile(`${application.clientSrcDir}app/entities/index.tsx`);
  }
  if (control.isJhipsterVersionLessThan('7.8.2')) {
    this.removeFile(`${application.clientSrcDir}app/shared/error/error-boundary-route.tsx`);
    this.removeFile(`${application.clientSrcDir}app/shared/error/error-boundary-route.spec.tsx`);
  }
  if (control.isJhipsterVersionLessThan('7.9.3')) {
    this.removeFile(`${application.clientSrcDir}app/config/translation-middleware.ts`);
  }
});
