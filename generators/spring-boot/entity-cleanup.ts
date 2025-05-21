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
import { asWritingEntitiesTask } from '../base-application/support/task-type-inference.js';
import type {
  Entity as DeprecatedEntity,
  Field as DeprecatedField,
  Relationship as DeprecatedRelationship,
} from '../../lib/types/application/index.js';
import type { PrimaryKey as DeprecatedPrimarykey } from '../../lib/types/application/entity.js';
import type { ApplicationType } from '../../lib/types/application/application.js';

/**
 * Removes server files that where generated in previous JHipster versions and therefore
 * need to be removed.
 *
 * @param {import('../base/index.js')} this - reference to generator
 * @param {Object} application
 * @param {Object} entity
 */
export const cleanupOldFiles = asWritingEntitiesTask<
  DeprecatedField,
  DeprecatedPrimarykey<DeprecatedField>,
  DeprecatedRelationship<any>,
  DeprecatedEntity<DeprecatedField, DeprecatedPrimarykey<DeprecatedField>, DeprecatedRelationship<any>>,
  ApplicationType<DeprecatedField, DeprecatedPrimarykey<DeprecatedField>, DeprecatedRelationship<any>>,
  any
>(function cleanupOldFiles({ application: { packageFolder, srcMainJava, srcTestJava, searchEngineElasticsearch }, control, entities }) {
  if (control.isJhipsterVersionLessThan('7.6.1')) {
    if (searchEngineElasticsearch) {
      this.removeFile(`${srcMainJava}${packageFolder}/repository/search/SortToFieldSortBuilderConverter.java`);
    }
  }
  if (control.isJhipsterVersionLessThan('7.7.1')) {
    this.removeFile(`${srcMainJava}${packageFolder}/repository/search/SortToSortBuilderListConverter.java`);
    for (const { entityClass, entityAbsoluteFolder } of entities.filter(entity => !entity.skipServer)) {
      this.removeFile(`${srcTestJava}${entityAbsoluteFolder}/repository/search/${entityClass}SearchRepositoryMockConfiguration.java`);
    }
  }
});
