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

import { databaseTypes } from '../../../lib/jhipster/index.ts';
import {
  addEntitiesOtherRelationships as addBaseEntitiesOtherRelationships,
  needsOtherRelationship,
} from '../../base-application/support/relationship.ts';
import type { Entity as BaseApplicationEntity } from '../../base-application/types.ts';
import type { ValidationResult } from '../../base-core/api.d.ts';

const { NO: NO_DATABASE, SQL, NEO4J } = databaseTypes;

/**
 * @deprecated the base application adds the other side every database needs, the database bootstrap the one of the
 * relationships of its database: `addEntitiesOtherRelationships` of `generators/base-application/support`.
 */
export const addEntitiesOtherRelationships = (entities: BaseApplicationEntity[]): ValidationResult =>
  addBaseEntitiesOtherRelationships(
    entities,
    (entity, relationship) =>
      needsOtherRelationship(entity, relationship) ||
      // OneToOne back reference is required due to filtering
      (relationship.relationshipType === 'one-to-one' && entity.databaseType === SQL) ||
      (relationship.relationshipType === 'one-to-many' && entity.databaseType !== NEO4J && entity.databaseType !== NO_DATABASE),
  );
