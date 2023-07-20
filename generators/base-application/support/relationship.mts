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
import { ValidationResult } from '../../base/api.mjs';
import { stringifyApplicationData } from './debug.mjs';
import { findEntityInEntities } from './entity.mjs';

const { upperFirst, lowerFirst } = _;

export const otherRelationshipType = relationshipType => relationshipType.split('-').reverse().join('-');

export const findOtherRelationshipInRelationships = (entityName: string, relationship: Relationship, inRelationships: Relationship[]) => {
  return inRelationships.find(otherRelationship => {
    if (upperFirst(otherRelationship.otherEntityName) !== entityName) {
      return false;
    }

    if (relationship.otherEntityRelationshipName) {
      return relationship.otherEntityRelationshipName === otherRelationship.relationshipName;
    }
    if (otherRelationship.otherEntityRelationshipName) {
      return otherRelationship.otherEntityRelationshipName === relationship.relationshipName;
    }

    return false;
  });
};

export const loadEntitiesAnnotations = (entities: Entity[]) => {
  for (const entity of entities) {
    // Load field annotations
    for (const field of entity.fields ?? []) {
      if (field.options) {
        Object.assign(field, field.options);
      }
    }

    // Load relationships annotations
    for (const relationship of entity.relationships ?? []) {
      if (relationship.options) {
        Object.assign(relationship, relationship.options);
      }
    }
  }
};

export const loadEntitiesOtherSide = (entities: Entity[]): ValidationResult => {
  const result: { warning: string[] } = { warning: [] };
  for (const entity of entities) {
    for (const relationship of entity.relationships ?? []) {
      const otherEntity = findEntityInEntities(upperFirst(relationship.otherEntityName), entities);
      if (!otherEntity) {
        throw new Error(`Error at entity ${entity.name}: could not find the entity ${relationship.otherEntityName}`);
      }
      otherEntity.otherRelationships = otherEntity.otherRelationships || [];
      otherEntity.otherRelationships.push(relationship);

      relationship.otherEntity = otherEntity;
      const otherRelationship = findOtherRelationshipInRelationships(entity.name, relationship, otherEntity.relationships ?? []);
      if (otherRelationship) {
        relationship.otherRelationship = otherRelationship;
        otherRelationship.otherEntityRelationshipName = otherRelationship.otherEntityRelationshipName ?? relationship.relationshipName;
        relationship.otherEntityRelationshipName = relationship.otherEntityRelationshipName ?? otherRelationship.relationshipName;
        if (
          otherRelationship.otherEntityRelationshipName !== relationship.relationshipName ||
          relationship.otherEntityRelationshipName !== otherRelationship.relationshipName
        ) {
          throw new Error(
            `Error at entity ${entity.name}: relationship name is not synchronized ${stringifyApplicationData(
              relationship,
            )} with ${stringifyApplicationData(relationship.otherRelationship)}`,
          );
        }
        if (relationship.relationshipType !== otherRelationshipType(relationship.otherRelationship.relationshipType)) {
          throw new Error(
            `Error at entity ${entity.name}: relationship type is not synchronized ${stringifyApplicationData(
              relationship,
            )} with ${stringifyApplicationData(otherRelationship)}`,
          );
        }
      }
    }
  }
  return result;
};

export const addOtherRelationship = (entity: Entity, otherEntity: Entity, relationship: Relationship) => {
  relationship.otherEntityRelationshipName = relationship.otherEntityRelationshipName ?? lowerFirst(entity.name);
  const otherRelationship: Relationship = {
    otherEntity: entity,
    otherEntityName: lowerFirst(entity.name),
    ownerSide: !relationship.ownerSide,
    otherEntityRelationshipName: relationship.relationshipName,
    relationshipName: relationship.otherEntityRelationshipName as string,
    relationshipType: otherRelationshipType(relationship.relationshipType),
    otherRelationship: relationship,
  };
  otherEntity.relationships = otherEntity.relationships ?? [];
  otherEntity.relationships.push(otherRelationship);
  return otherRelationship;
};
