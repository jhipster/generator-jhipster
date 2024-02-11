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

import { databaseTypes, entityOptions, validations, checkAndReturnRelationshipOnValue } from '../../../jdl/jhipster/index.js';
import { getJoinTableName, hibernateSnakeCase } from '../../server/support/index.js';
import { stringifyApplicationData } from './debug.js';
import { mutateData } from '../../base/support/config.js';

const { NEO4J, NO: DATABASE_NO } = databaseTypes;
const { MapperTypes } = entityOptions;
const {
  Validations: { REQUIRED },
} = validations;

const { MAPSTRUCT } = MapperTypes;

function _defineOnUpdateAndOnDelete(relationship, generator) {
  relationship.onDelete = checkAndReturnRelationshipOnValue(relationship.options?.onDelete, generator);
  relationship.onUpdate = checkAndReturnRelationshipOnValue(relationship.options?.onUpdate, generator);
}

export default function prepareRelationship(entityWithConfig, relationship, generator, ignoreMissingRequiredRelationship) {
  const entityName = entityWithConfig.name;
  const { relationshipSide, relationshipType, otherEntityName, relationshipName } = relationship;

  if (!relationship.otherEntity) {
    throw new Error(
      `Error at entity ${entityName}: could not find the entity of the relationship ${stringifyApplicationData(relationship)}`,
    );
  }
  const otherEntityData = relationship.otherEntity;
  if (!relationship.otherEntityField && otherEntityData.primaryKey) {
    relationship.otherEntityField = otherEntityData.primaryKey.name;
  }

  Object.assign(relationship, {
    relationshipLeftSide: relationshipSide === 'left',
    relationshipRightSide: relationshipSide === 'right',
    collection: relationshipType === 'one-to-many' || relationshipType === 'many-to-many',
    relationshipOneToOne: relationshipType === 'one-to-one',
    relationshipOneToMany: relationshipType === 'one-to-many',
    relationshipManyToOne: relationshipType === 'many-to-one',
    relationshipManyToMany: relationshipType === 'many-to-many',
    otherEntityUser: otherEntityData.builtInUser,
  });

  mutateData(relationship, {
    __override__: false,
    relationshipCollection: ({ collection }) => collection,
    otherEntityIsEmbedded: otherEntityData.embedded,

    relationshipNamePlural: pluralize(relationshipName),
    relationshipFieldName: lowerFirst(relationshipName),
    relationshipFieldNamePlural: ({ relationshipFieldName }) => pluralize(relationshipFieldName),
    relationshipReferenceField: data => (data.collection ? data.relationshipFieldNamePlural : data.relationshipFieldName),

    relationshipNameCapitalized: upperFirst(relationshipName),
    relationshipNameHumanized: startCase(relationshipName),
    relationshipNameCapitalizedPlural: data => upperFirst(data.relationshipNamePlural),

    propertyName: data => (data.collection ? data.relationshipFieldNamePlural : data.relationshipFieldName),
    propertyNameCapitalized: ({ propertyName, propertyNameCapitalized }) => propertyNameCapitalized ?? upperFirst(propertyName),

    otherEntityNamePlural: ({ otherEntityName }) => pluralize(otherEntityName),
    otherEntityNameCapitalized: ({ otherEntityName }) => upperFirst(otherEntityName),
    otherEntityNameCapitalizedPlural: data => upperFirst(data.otherEntityNamePlural),

    jpaMetamodelFiltering: otherEntityData.jpaMetamodelFiltering,
    unique: relationship.id || (relationship.ownerSide && relationshipType === 'one-to-one'),

    relationshipRequired: data => data.relationshipValidateRules?.includes(REQUIRED),
    relationshipValidate: data => data.relationshipRequired,

    // let ownerSide true when type is 'many-to-one' for convenience.
    // means that this side should control the reference.
    ownerSide: ({ ownerSide, relationshipLeftSide, relationshipManyToOne, relationshipOneToMany }) =>
      ownerSide ?? (relationshipManyToOne || (relationshipLeftSide && !relationshipOneToMany)),
    persistableRelationship: ({ ownerSide }) => ownerSide,
    bagRelationship: data => !otherEntityData.embedded && data.persistableRelationship && data.collection,
    relationshipEagerLoad: data =>
      !data.otherEntity.embedded &&
      (data.bagRelationship ||
        entityWithConfig.eagerLoad ||
        // Fetch relationships if otherEntityField differs otherwise the id is enough
        (data.persistableRelationship && otherEntityData.primaryKey.name !== data.otherEntityField)),
    relationshipUpdateBackReference: ({ relationshipUpdateBackReference, ownerSide, relationshipRightSide }) =>
      relationshipUpdateBackReference ?? (entityWithConfig.databaseType === 'neo4j' ? relationshipRightSide : !ownerSide),

    nullable: data => !(data.relationshipValidate === true && relationship.relationshipRequired),
  });

  // server side
  mutateData(relationship, {
    __override__: false,
    columnName: hibernateSnakeCase(relationshipName),
    columnNamePrefix: data => (data.id && relationshipType === 'one-to-one' ? '' : `${hibernateSnakeCase(relationshipName)}_`),

    otherEntityTableName: otherEntityData.entityTableName,
    shouldWriteJoinTable: data => relationshipType === 'many-to-many' && data.ownerSide,
    joinTable: data =>
      data.shouldWriteJoinTable ? { name: getJoinTableName(entityWithConfig.entityTableName, relationshipName).value } : undefined,
  });

  // client side
  mutateData(relationship, {
    __override__: false,
    otherEntityAngularName: data => data.otherEntity.entityAngularName,
    otherEntityStateName: data => data.otherEntity.otherEntityStateName,
    otherEntityFileName: data => data.otherEntity.otherEntityFileName,
    otherEntityFolderName: data => data.otherEntity.otherEntityFolderName,
  });

  // Look for fields at the other other side of the relationship
  const otherRelationship = relationship.otherRelationship;
  relationship.otherSideReferenceExists = Boolean(otherRelationship);

  if (otherRelationship) {
    mutateData(relationship, {
      __override__: false,
      otherEntityRelationshipName: otherRelationship.relationshipName,

      // Other relationship derived properties may not be initialized yet, user our own values.
      otherEntityRelationshipNamePlural: data => pluralize(data.otherEntityRelationshipName),
      otherEntityRelationshipNameCapitalized: data => upperFirst(data.otherEntityRelationshipName),
      otherEntityRelationshipNameCapitalizedPlural: data => upperFirst(data.otherEntityRelationshipNamePlural),
    });
  } else if (
    !ignoreMissingRequiredRelationship &&
    !relationship.relationshipIgnoreBackReference &&
    entityWithConfig.databaseType !== NEO4J &&
    entityWithConfig.databaseType !== DATABASE_NO &&
    (relationshipType === 'one-to-many' || relationship.ownerSide === false)
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

  relationship.relatedField = otherEntityData.fields.find(field => field.fieldName === relationship.otherEntityField);
  if (relationship.relatedField) {
    relationship.otherEntityFieldCapitalized = relationship.relatedField.fieldNameCapitalized;
    relationship.relatedField.relatedByOtherEntity = true;
  } else {
    relationship.otherEntityFieldCapitalized = upperFirst(relationship.otherEntityField);
  }
  if (!relationship.relatedField && otherEntityData.primaryKey && otherEntityData.primaryKey.derived) {
    Object.defineProperty(relationship, 'relatedField', {
      get() {
        return otherEntityData.primaryKey.derivedFields.find(field => field.fieldName === relationship.otherEntityField);
      },
    });
  }

  if (entityWithConfig.dto === MAPSTRUCT) {
    if (otherEntityData.dto !== MAPSTRUCT && !otherEntityData.builtInUser) {
      generator.log.warn(
        `Entity ${entityName}: this entity has the DTO option, and it has a relationship with entity "${otherEntityName}" that doesn't have the DTO option. This will result in an error.`,
      );
    }
  }

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

  if (entityWithConfig === otherEntityData) {
    throw new Error(`Error at entity ${entityName}: required relationships to the same entity are not supported.`);
  }

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
