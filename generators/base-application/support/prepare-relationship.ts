// @ts-nocheck
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
import { lowerFirst, startCase, upperFirst } from 'lodash-es';
import pluralize from 'pluralize';

import { checkAndReturnRelationshipOnValue, databaseTypes, entityOptions, validations } from '../../../lib/jhipster/index.js';
import { getJoinTableName, hibernateSnakeCase } from '../../server/support/index.js';
import { mutateData } from '../../../lib/utils/object.js';
import type CoreGenerator from '../../base-core/generator.js';
import type { Relationship } from '../../../lib/types/application/relationship.js';
import type { Entity } from '../../../lib/types/application/entity.js';
import { prepareProperty } from './prepare-property.js';
import { stringifyApplicationData } from './debug.js';

const { NEO4J, NO: DATABASE_NO } = databaseTypes;
const { MapperTypes } = entityOptions;
const {
  Validations: { REQUIRED },
} = validations;

const { MAPSTRUCT } = MapperTypes;

function _defineOnUpdateAndOnDelete(relationship: Relationship, generator: CoreGenerator) {
  relationship.onDelete = checkAndReturnRelationshipOnValue(relationship.options?.onDelete, generator);
  relationship.onUpdate = checkAndReturnRelationshipOnValue(relationship.options?.onUpdate, generator);
}

export default function prepareRelationship(
  entityWithConfig: Entity,
  relationship: Relationship<Omit<Entity, 'relationships'>>,
  generator: CoreGenerator,
  ignoreMissingRequiredRelationship = false,
) {
  const entityName = entityWithConfig.name;
  const { otherEntityName, relationshipSide, relationshipType, relationshipName } = relationship;

  if (!relationship.otherEntity) {
    throw new Error(
      `Error at entity ${entityName}: could not find the entity of the relationship ${stringifyApplicationData(relationship)}`,
    );
  }
  const otherEntityData = relationship.otherEntity;
  if (!relationship.otherEntityField && otherEntityData.primaryKey) {
    relationship.otherEntityField = otherEntityData.primaryKey.name;
  }

  // Prepare basic relationship data
  Object.assign(relationship, {
    relationshipLeftSide: relationshipSide === 'left',
    relationshipRightSide: relationshipSide === 'right',
    collection: relationshipType === 'one-to-many' || relationshipType === 'many-to-many',
    relationshipOneToOne: relationshipType === 'one-to-one',
    relationshipOneToMany: relationshipType === 'one-to-many',
    relationshipManyToOne: relationshipType === 'many-to-one',
    relationshipManyToMany: relationshipType === 'many-to-many',
    otherEntityUser: otherEntityName === 'user',
  });

  const { collection, relationshipLeftSide, relationshipManyToOne, relationshipOneToMany, relationshipOneToOne, relationshipManyToMany } =
    relationship;

  // Prepare property name
  mutateData(relationship, {
    __override__: false,
    relationshipFieldName: lowerFirst(relationshipName),
    relationshipFieldNamePlural: ({ relationshipFieldName }) => pluralize(relationshipFieldName),
    relationshipNamePlural: pluralize(relationshipName),
    relationshipNameCapitalized: upperFirst(relationshipName),
    relationshipNameHumanized: startCase(relationshipName),

    propertyName: ({ relationshipFieldName, relationshipFieldNamePlural }) =>
      collection ? relationshipFieldNamePlural : relationshipFieldName,
  });

  prepareProperty(relationship);

  mutateData(relationship, {
    __override__: false,
    // Other entity properties
    otherEntityNamePlural: pluralize(otherEntityName),
    otherEntityNameCapitalized: upperFirst(otherEntityName),

    // let ownerSide true when type is 'many-to-one' for convenience.
    // means that this side should control the reference.
    ownerSide: relationship.otherEntity.embedded || relationshipManyToOne || (relationshipLeftSide && !relationshipOneToMany),
    persistableRelationship: ({ ownerSide }) => ownerSide!,
    relationshipUpdateBackReference: ({ ownerSide, relationshipRightSide, otherEntity }) =>
      !otherEntity.embedded && (entityWithConfig.databaseType === NEO4J ? relationshipRightSide : !ownerSide),

    // DB properties
    columnName: hibernateSnakeCase(relationshipName),
    columnNamePrefix: relationship.id && relationshipOneToOne ? '' : `${hibernateSnakeCase(relationshipName)}_`,
    shouldWriteJoinTable: ({ ownerSide }) => entityWithConfig.databaseType === 'sql' && relationshipManyToMany && ownerSide,
    joinTable: ({ shouldWriteJoinTable }) =>
      shouldWriteJoinTable
        ? {
            name: getJoinTableName(entityWithConfig.entityTableName, relationshipName, {
              prodDatabaseType: entityWithConfig.prodDatabaseType,
            }).value,
          }
        : undefined,
  });

  relationship.otherSideReferenceExists = false;

  relationship.otherEntityIsEmbedded = otherEntityData.embedded;

  // Look for fields at the other other side of the relationship
  const otherRelationship = relationship.otherRelationship;
  if (otherRelationship) {
    relationship.otherSideReferenceExists = true;
  } else if (
    !ignoreMissingRequiredRelationship &&
    !relationship.otherEntity.embedded &&
    !relationship.relationshipIgnoreBackReference &&
    entityWithConfig.databaseType !== NEO4J &&
    entityWithConfig.databaseType !== DATABASE_NO &&
    (relationshipOneToMany || !relationship.ownerSide)
  ) {
    if (otherEntityData.builtInUser) {
      throw new Error(`Error at entity ${entityName}: relationships with built-in User cannot have back reference`);
    }
    throw new Error(
      `Error at entity ${entityName}: could not find the other side of the relationship ${stringifyApplicationData(relationship)}`,
    );
  } else {
    generator.debug(`Entity ${entityName}: Could not find the other side of the relationship ${stringifyApplicationData(relationship)}`);
  }

  if (relationship.otherEntityField) {
    relationship.relatedField = otherEntityData.fields.find(field => field.fieldName === relationship.otherEntityField);

    if (relationship.relatedField) {
      relationship.relatedField.relatedByOtherEntity = true;
    }
  }
  if (!relationship.relatedField && !otherEntityData.embedded) {
    Object.defineProperty(relationship, 'relatedField', {
      get() {
        if (!otherEntityData.primaryKey) {
          throw new Error(
            `Error at entity ${entityName}: could not find the related field for the relationship ${relationship.relationshipName}`,
          );
        }
        const { otherEntityField } = relationship;
        const fields = otherEntityData.primaryKey.derived ? otherEntityData.primaryKey.derivedFields : otherEntityData.primaryKey.fields;
        if (otherEntityField) {
          const relatedField = fields.find(field => field.fieldName === otherEntityField);
          if (!relatedField) {
            throw new Error(
              `Error at entity ${entityName}: could not find the related field ${otherEntityField} for the relationship ${relationshipName}`,
            );
          }
          return relatedField;
        }
        return fields[0];
      },
    });
  }

  if (relationship.otherEntityRelationshipName !== undefined || relationship.otherRelationship) {
    // TODO remove at v9.
    mutateData(relationship, {
      otherEntityRelationshipName: ({ otherRelationship, otherEntityRelationshipName }) =>
        lowerFirst(otherRelationship?.relationshipName ?? otherEntityRelationshipName),
      otherEntityRelationshipNamePlural: ({ otherEntityRelationshipName }) => pluralize(otherEntityRelationshipName),
      otherEntityRelationshipNameCapitalized: ({ otherEntityRelationshipName }) => upperFirst(otherEntityRelationshipName),
      otherEntityRelationshipNameCapitalizedPlural: ({ otherEntityRelationshipNameCapitalized }) =>
        pluralize(otherEntityRelationshipNameCapitalized),
    });
  }

  mutateData(relationship, {
    relationshipNameCapitalizedPlural:
      relationship.relationshipName.length > 1
        ? pluralize(relationship.relationshipNameCapitalized)
        : upperFirst(pluralize(relationship.relationshipName)),
    otherEntityNameCapitalizedPlural: pluralize(relationship.otherEntityNameCapitalized),
  });

  if (entityWithConfig.dto === MAPSTRUCT) {
    if (otherEntityData.dto !== MAPSTRUCT && !otherEntityData.builtInUser) {
      generator.log.warn(
        `Entity ${entityName}: this entity has the DTO option, and it has a relationship with entity "${otherEntityName}" that doesn't have the DTO option. This will result in an error.`,
      );
    }
  }

  mutateData(relationship, {
    otherEntityTableName: otherEntityData.entityTableName,
    otherEntityAngularName: otherEntityData.entityAngularName,
    otherEntityStateName: otherEntityData.entityStateName,
    otherEntityFileName: otherEntityData.entityFileName,
    otherEntityFolderName: otherEntityData.entityFileName,
    jpaMetamodelFiltering: otherEntityData.jpaMetamodelFiltering,
    unique: relationship.id || (relationship.ownerSide && relationshipOneToOne),
  });

  const otherEntityClientRootFolder = otherEntityData.clientRootFolder || otherEntityData.microserviceName || '';
  if (entityWithConfig.skipUiGrouping || !otherEntityClientRootFolder) {
    relationship.otherEntityClientRootFolder = '';
  } else {
    relationship.otherEntityClientRootFolder = `${otherEntityClientRootFolder}/`;
  }
  if (otherEntityClientRootFolder) {
    if (entityWithConfig.clientRootFolder === otherEntityClientRootFolder) {
      relationship.otherEntityModulePath = relationship.otherEntityFolderName;
    } else {
      relationship.otherEntityModulePath = `${
        entityWithConfig.entityParentPathAddition ? `${entityWithConfig.entityParentPathAddition}/` : ''
      }${otherEntityClientRootFolder}/${relationship.otherEntityFolderName}`;
    }
    relationship.otherEntityModelName = `${otherEntityClientRootFolder}/${relationship.otherEntityFileName}`;
    relationship.otherEntityPath = `${otherEntityClientRootFolder}/${relationship.otherEntityFolderName}`;
  } else {
    relationship.otherEntityModulePath = `${
      entityWithConfig.entityParentPathAddition ? `${entityWithConfig.entityParentPathAddition}/` : ''
    }${relationship.otherEntityFolderName}`;
    relationship.otherEntityModelName = relationship.otherEntityFileName;
    relationship.otherEntityPath = relationship.otherEntityFolderName;
  }

  if (relationship.relationshipValidateRules?.includes(REQUIRED)) {
    if (entityName.toLowerCase() === relationship.otherEntityName.toLowerCase()) {
      generator.log.warn(`Error at entity ${entityName}: required relationships to the same entity are not supported.`);
    } else {
      relationship.relationshipValidate = relationship.relationshipRequired = true;
    }
  }
  relationship.nullable = !(relationship.relationshipValidate === true && relationship.relationshipRequired);

  relationship.reference = relationshipToReference(entityWithConfig, relationship);

  _defineOnUpdateAndOnDelete(relationship, generator);

  return relationship;
}

function relationshipToReference(entity, relationship, pathPrefix = []) {
  const collection = relationship.collection;
  const name = collection ? relationship.relationshipNamePlural : relationship.relationshipName;
  const reference = {
    id: relationship.id,
    entity,
    relationship,
    owned: relationship.ownerSide,
    collection,
    doc: relationship.documentation,
    get propertyJavadoc() {
      return relationship.relationshipJavadoc;
    },
    get propertyApiDescription() {
      return relationship.relationshipApiDescription;
    },
    name,
    nameCapitalized: collection ? relationship.relationshipNameCapitalizedPlural : relationship.relationshipNameCapitalized,
    get type() {
      return relationship.otherEntity.primaryKey ? relationship.otherEntity.primaryKey.type : undefined;
    },
    path: [...pathPrefix, name],
  };
  return reference;
}
