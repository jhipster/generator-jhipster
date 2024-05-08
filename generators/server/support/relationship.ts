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

import { Entity } from '../../../jdl/converters/types.js';
import { addOtherRelationship } from '../../base-application/support/index.js';
import { ValidationResult } from '../../base/api.js';
import { databaseTypes } from '../../../jdl/index.js';
import { MANY_TO_MANY, ONE_TO_MANY, ONE_TO_ONE, RelationshipTypes } from '../../entity/support/index.js';

const { NO: NO_DATABASE, SQL, NEO4J } = databaseTypes;

// eslint-disable-next-line import/prefer-default-export
export const addEntitiesOtherRelationships = (entities: Entity[]): ValidationResult => {
  const result: { warning: string[] } = { warning: [] };
  for (const entity of entities.filter(entity => !entity.builtIn)) {
    for (const relationship of entity.relationships ?? []) {
      if (
        !relationship.otherRelationship &&
        (relationship.otherEntityRelationshipName ||
          relationship.relationshipType === RelationshipTypes[MANY_TO_MANY] ||
          // OneToOne back reference is required due to filtering
          (relationship.relationshipType === RelationshipTypes[ONE_TO_ONE] && entity.databaseType === SQL) ||
          (relationship.relationshipType === RelationshipTypes[ONE_TO_MANY] &&
            entity.databaseType !== NEO4J &&
            entity.databaseType !== NO_DATABASE))
      ) {
        if (relationship.otherEntity.builtIn) {
          result.warning.push(
            `Ignoring '${entity.name}' definitions as it is using a built-in Entity '${relationship.otherEntityName}': 'otherEntityRelationshipName' is set with value '${relationship.otherEntityRelationshipName}' at relationship '${relationship.relationshipName}' but no back-reference was found`,
          );
        } else {
          relationship.otherRelationship = addOtherRelationship(entity, relationship.otherEntity, relationship);
        }
      }
    }
  }
  return result;
};
