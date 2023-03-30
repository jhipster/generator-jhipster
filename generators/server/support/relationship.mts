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

import { Entity } from '../../../jdl/converters/types.js';
import { addOtherRelationship } from '../../base-application/support/index.mjs';
import { ValidationResult } from '../../base/api.mjs';

// eslint-disable-next-line import/prefer-default-export
export const addEntitiesOtherRelationships = (entities: Entity[]): ValidationResult => {
  const result: { warning: string[] } = { warning: [] };
  for (const entity of entities) {
    for (const relationship of entity.relationships ?? []) {
      if (
        !relationship.otherRelationship &&
        (relationship.relationshipType === 'many-to-many' ||
          // OneToOne back reference is required due to filtering
          relationship.relationshipType === 'one-to-one' ||
          (relationship.relationshipType === 'one-to-many' && entity.databaseType !== 'neo4j' && entity.databaseType !== 'no'))
      ) {
        if (relationship.otherEntity.builtIn) {
          result.warning.push(
            `Ignoring '${entity.name}' definitions as it is using a built-in Entity '${relationship.otherEntityName}': 'otherEntityRelationshipName' is set with value '${relationship.otherEntityRelationshipName}' at relationship '${relationship.relationshipName}' but no back-reference was found`
          );
        } else {
          relationship.otherRelationship = addOtherRelationship(entity, relationship.otherEntity, relationship);
        }
      }
    }
  }
  return result;
};
