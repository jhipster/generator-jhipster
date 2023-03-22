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

import _ from 'lodash';

import { Relationship, Entity } from '../../../jdl/converters/types.js';
import { findEntityInEntities } from './entity.mjs';

export const findOtherRelationshipInRelationships = (relationship: Relationship, inRelationships: Relationship[]) => {
  return inRelationships.find(otherRelationship => {
    return relationship.relationshipName === otherRelationship.otherEntityRelationshipName;
  });
};

export const loadEntitiesOtherSide = (entities: Entity[]) => {
  for (const entity of entities) {
    for (const relationship of entity.relationships ?? []) {
      const otherEntity = findEntityInEntities(relationship.otherEntityName, entities);
      if (!otherEntity) {
        throw new Error(`Error at entity ${entity.name}: could not find the entity ${relationship.otherEntityName}`);
      }
      relationship.otherEntity = otherEntity;
      relationship.otherRelationship = findOtherRelationshipInRelationships(relationship, otherEntity.relationships ?? []);
    }
  }
};

export const addOtherRelationship = (entity: Entity, otherEntity: Entity, relationship: Relationship) => {
  relationship.otherEntityRelationshipName = relationship.otherEntityRelationshipName ?? _.lowerFirst(entity.name);
  const otherRelationship: Relationship = {
    otherEntity: entity,
    otherEntityName: relationship.otherEntityRelationshipName as string,
    ownerSide: !relationship.ownerSide,
    otherEntityRelationshipName: relationship.relationshipName,
    relationshipName: relationship.otherEntityRelationshipName as string,
    relationshipType: relationship.relationshipType.split('-').reverse().join('-'),
  };
  otherEntity.relationships = otherEntity.relationships ?? [];
  otherEntity.relationships.push(otherRelationship);
  return otherRelationship;
};
