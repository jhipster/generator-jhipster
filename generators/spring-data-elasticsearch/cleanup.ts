import { asWritingTask } from '../base-application/support/task-type-inference.js';
import type {
  Entity as DeprecatedEntity,
  Field as DeprecatedField,
  Relationship as DeprecatedRelationship,
} from '../../lib/types/application/index.js';
import type { PrimaryKey as DeprecatedPrimarykey } from '../../lib/types/application/entity.js';
import type { ApplicationType } from '../../lib/types/application/application.js';

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
export default asWritingTask<
  DeprecatedField,
  DeprecatedPrimarykey<DeprecatedField>,
  DeprecatedRelationship<any>,
  DeprecatedEntity<DeprecatedField, DeprecatedPrimarykey<DeprecatedField>, DeprecatedRelationship<any>>,
  ApplicationType<DeprecatedField, DeprecatedPrimarykey<DeprecatedField>, DeprecatedRelationship<any>>,
  any
>(function cleanupElasticsearchFilesTask({ application, control }) {
  if (control.isJhipsterVersionLessThan('4.0.0')) {
    this.removeFile(`${application.javaPackageSrcDir}config/ElasticSearchConfiguration.java`);
  }
  if (control.isJhipsterVersionLessThan('5.2.2')) {
    this.removeFile(`${application.javaPackageSrcDir}config/ElasticsearchConfiguration.java`);
  }
  if (control.isJhipsterVersionLessThan('7.0.0-beta.0')) {
    this.removeFile(`${application.javaPackageTestDir}config/ElasticsearchTestConfiguration.java`);
  }
  if (control.isJhipsterVersionLessThan('7.7.1')) {
    if (application.generateUserManagement) {
      this.removeFile(`${application.javaPackageTestDir}repository/search/UserSearchRepositoryMockConfiguration.java`);
    }
  }
  if (control.isJhipsterVersionLessThan('7.9.3')) {
    if (application.reactive) {
      this.removeFile(`${application.javaPackageTestDir}config/ElasticsearchReactiveTestConfiguration.java`);
    }
  }
});
