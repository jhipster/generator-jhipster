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

import { lowerFirst, upperFirst } from 'lodash-es';

import type { ValidationResult } from '../../base-core/index.js';
import type { Entity } from '../entity-all.js';
import type { Relationship } from '../relationship-all.js';
import type { RelationshipWithEntity } from '../types.js';
import { findEntityInEntities } from './entity.js';
import { stringifyApplicationData } from './debug.js';

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

export const loadEntitiesOtherSide = (entities: Entity[], { application }: { application?: any } = {}): ValidationResult => {
  const result: { warning: string[] } = { warning: [] };
  for (const entity of entities) {
    for (const relationship of entity.relationships ?? []) {
      const otherEntity = findEntityInEntities(upperFirst(relationship.otherEntityName), entities);
      if (!otherEntity) {
        if (upperFirst(relationship.otherEntityName) === 'User') {
          const errors: string[] = [];
          if (!application || application.authenticationTypeOauth2) {
            errors.push("oauth2 applications with database and '--sync-user-with-idp' option");
          }
          if (!application?.authenticationTypeOauth2) {
            errors.push('jwt and session authentication types in monolith or gateway applications with database');
          }
          throw new Error(`Error at entity ${entity.name}: relationships with built-in User entity is supported in ${errors}.`);
        }
        throw new Error(`Error at entity ${entity.name}: could not find the entity ${relationship.otherEntityName}`);
      }
      otherEntity.otherRelationships = otherEntity.otherRelationships || [];
      otherEntity.otherRelationships.push(relationship);

      relationship.otherEntity = otherEntity;
      const otherRelationship = findOtherRelationshipInRelationships(entity.name, relationship, otherEntity.relationships ?? []);
      if (otherRelationship) {
        relationship.otherRelationship = otherRelationship as any;
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

export const addOtherRelationship = (
  entity: Entity,
  otherEntity: Entity,
  relationship: Relationship,
): RelationshipWithEntity<Relationship, Entity> => {
  relationship.otherEntityRelationshipName = relationship.otherEntityRelationshipName ?? lowerFirst(entity.name);
  const otherRelationship = {
    otherEntityName: lowerFirst(entity.name),
    otherEntityRelationshipName: relationship.relationshipName,
    relationshipName: relationship.otherEntityRelationshipName as string,
    relationshipType: otherRelationshipType(relationship.relationshipType),
    otherEntity: entity,
    ownerSide: !relationship.ownerSide,
    otherRelationship: relationship,
  } as any;
  otherEntity.relationships = otherEntity.relationships ?? [];
  otherEntity.relationships.push(otherRelationship);
  return otherRelationship;
};
