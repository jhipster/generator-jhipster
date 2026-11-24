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
import { lowerFirst, upperFirst } from '../../../lib/utils/string-utils.ts';
import type { ValidationResult } from '../../base-core/api.d.ts';
import type {
  Application as BaseApplicationApplication,
  Entity as BaseApplicationEntity,
  Relationship as BaseApplicationRelationship,
  RelationshipWithEntity,
} from '../types.ts';

import { stringifyApplicationData } from './debug.ts';
import { findEntityInEntities } from './entity.ts';

const { NO: NO_DATABASE, SQL, NEO4J } = databaseTypes;

/**
 * The version from which a back reference without a name is named after its relationship, see `backReferenceName`.
 * A build of main records `9.4.1-snapshot`, which sorts below `9.4.1`, so its applications are not taken for older ones.
 */
export const DERIVED_BACK_REFERENCE_NAME_VERSION = '9.4.1-snapshot';

/** Whether the application on the disk names the back references after the entity: written by a version older than 9.4.1. */
export const hasLegacyBackReferenceNames = (control: { isJhipsterVersionLessThan(version: string): boolean }): boolean =>
  control.isJhipsterVersionLessThan(DERIVED_BACK_REFERENCE_NAME_VERSION);

/**
 * Whether a relationship without `otherEntityRelationshipName` gets a back reference on the other entity: a many-to-many,
 * a one-to-one of a SQL entity (for its filters), and a one-to-many of an entity with a database that has it.
 */
export const relationshipAddsBackReference = (relationshipType: string, databaseType?: string): boolean =>
  relationshipType === 'many-to-many' ||
  (relationshipType === 'one-to-one' && databaseType === SQL) ||
  (relationshipType === 'one-to-many' && databaseType !== NEO4J && databaseType !== NO_DATABASE);

/**
 * Up to 9.4.0 the back reference of a relationship without `otherEntityRelationshipName` was named after the entity, `order`
 * for `Order{publisher} to Member`. Saves that name as the `backReferenceName` option of each such relationship of an
 * application written by such a version, so its fields and columns keep their names; the relationships added later get the
 * derived name. Two of them to the same entity stopped the generation, so they keep no name. Only the relationships
 * `generated` tells are saved, the ones the older version generated, not the ones added since. Returns whether it saved any.
 */
export const saveLegacyBackReferenceNames = (
  entity: { name: string; databaseType?: string; relationships?: BaseApplicationRelationship[] },
  databaseType = entity.databaseType,
  generated: (relationship: BaseApplicationRelationship) => boolean = () => true,
): boolean => {
  const legacyName = lowerFirst(entity.name);
  const relationships = (entity.relationships ?? []).filter(
    relationship =>
      generated(relationship) &&
      !relationship.otherEntityRelationshipName &&
      relationship.options?.backReferenceName === undefined &&
      // A built-in entity gets no back reference.
      !(relationship as { relationshipWithBuiltInEntity?: boolean }).relationshipWithBuiltInEntity &&
      relationshipAddsBackReference(relationship.relationshipType, databaseType),
  );
  const toSave = relationships.filter(
    relationship =>
      relationships.filter(other => other.otherEntityName === relationship.otherEntityName).length === 1 &&
      // The name is already saved for another relationship to that entity.
      !entity.relationships!.some(
        other => other.otherEntityName === relationship.otherEntityName && other.options?.backReferenceName === legacyName,
      ),
  );
  for (const relationship of toSave) {
    relationship.options = { ...relationship.options, backReferenceName: legacyName };
  }
  return toSave.length > 0;
};

export const otherRelationshipType = (relationshipType: string): string => relationshipType.split('-').reverse().join('-');

export const findOtherRelationshipInRelationships = (
  entityName: string,
  relationship: BaseApplicationRelationship,
  inRelationships: BaseApplicationRelationship[],
): BaseApplicationRelationship | undefined => {
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

export const loadEntitiesAnnotations = (entities: BaseApplicationEntity[]): void => {
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

export const loadEntitiesOtherSide = (
  entities: BaseApplicationEntity[],
  { application }: { application?: BaseApplicationApplication } = {},
): ValidationResult => {
  const result: { warning: string[] } = { warning: [] };
  for (const entity of entities) {
    if (entity.embedded && entity.relationships) {
      // Relationships with embedded entities are unidirectional: an embedded entity has no back reference to the entity embedding it.
      entity.relationships = entity.relationships.filter(relationship => {
        const otherEntity = findEntityInEntities(upperFirst(relationship.otherEntityName), entities);
        if (!otherEntity || !findOtherRelationshipInRelationships(entity.name, relationship, otherEntity.relationships ?? [])) {
          return true;
        }
        result.warning.push(
          `Ignoring the relationship '${relationship.relationshipName}' of the embedded entity '${entity.name}': relationships with embedded entities are unidirectional`,
        );
        return false;
      });
    }
  }
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
      otherEntity.otherRelationships ||= [];
      otherEntity.otherRelationships.push(relationship);

      relationship.otherEntity = otherEntity;
      const otherRelationship = findOtherRelationshipInRelationships(entity.name, relationship, otherEntity.relationships ?? []);
      if (otherRelationship) {
        relationship.otherRelationship = otherRelationship as RelationshipWithEntity<BaseApplicationRelationship, BaseApplicationEntity>;
        otherRelationship.otherEntityRelationshipName ??= relationship.relationshipName;
        relationship.otherEntityRelationshipName ??= otherRelationship.relationshipName;
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

export const addOtherRelationship = <const R extends BaseApplicationRelationship>(
  entity: BaseApplicationEntity,
  otherEntity: BaseApplicationEntity,
  relationship: R,
): RelationshipWithEntity<R, BaseApplicationEntity> => {
  // Named after the relationship alone, `orderAsPublisher` for `Order{publisher} to Member`: adding, removing or reordering the
  // other relationships never renames it. The name an older version derived is kept, see `saveLegacyBackReferenceNames`.
  relationship.otherEntityRelationshipName ??=
    (relationship.options?.backReferenceName as string | undefined) ??
    `${lowerFirst(entity.name)}As${upperFirst(relationship.relationshipName)}`;
  const otherRelationship = {
    otherEntityName: lowerFirst(entity.name),
    otherEntityRelationshipName: relationship.relationshipName,
    relationshipName: relationship.otherEntityRelationshipName,
    relationshipType: otherRelationshipType(relationship.relationshipType),
    otherEntity: entity,
    ownerSide: !relationship.ownerSide,
    otherRelationship: relationship,
  } as any;
  otherEntity.relationships ??= [];
  otherEntity.relationships.push(otherRelationship);
  return otherRelationship;
};

/** Whether a relationship needs the other side whatever the database: the one it names, and the one of a many-to-many. */
export const needsOtherRelationship = (_entity: BaseApplicationEntity, relationship: BaseApplicationRelationship): boolean =>
  Boolean(relationship.otherEntityRelationshipName) || relationship.relationshipType === 'many-to-many';

/**
 * Adds the other side of the relationships of the entities that need it and miss it, a built-in entity at the other side
 * being left as it is with a warning.
 */
export const addEntitiesOtherRelationships = (
  entities: BaseApplicationEntity[],
  needsIt: (
    entity: BaseApplicationEntity,
    relationship: RelationshipWithEntity<BaseApplicationRelationship, BaseApplicationEntity>,
  ) => boolean = needsOtherRelationship,
): ValidationResult => {
  const result: { warning: string[] } = { warning: [] };
  for (const entity of entities.filter(entity => !entity.builtIn)) {
    for (const relationship of entity.relationships ?? []) {
      if (!relationship.otherRelationship && !relationship.otherEntity.embedded && needsIt(entity, relationship)) {
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
