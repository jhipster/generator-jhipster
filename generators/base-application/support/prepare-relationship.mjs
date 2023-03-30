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
import pluralize from 'pluralize';

import {
  databaseTypes,
  entityOptions,
  reservedKeywords,
  validations,
  checkAndReturnRelationshipOnValue,
} from '../../../jdl/jhipster/index.mjs';
import { upperFirstCamelCase } from '../../base/support/string.mjs';
import { getJoinTableName, hibernateSnakeCase } from '../../server/support/index.mjs';
import { stringifyApplicationData } from './debug.mjs';

const { isReservedTableName } = reservedKeywords;
const { NEO4J, NO: DATABASE_NO } = databaseTypes;
const { MapperTypes } = entityOptions;
const {
  Validations: { REQUIRED },
} = validations;

const { MAPSTRUCT } = MapperTypes;

function _derivedProperties(relationship) {
  _.defaults(relationship, {
    relationshipOneToOne: relationship.relationshipType === 'one-to-one',
    relationshipOneToMany: relationship.relationshipType === 'one-to-many',
    relationshipManyToOne: relationship.relationshipType === 'many-to-one',
    relationshipManyToMany: relationship.relationshipType === 'many-to-many',
    otherEntityUser: relationship.otherEntityName === 'user',
  });
}

function _defineOnUpdateAndOnDelete(relationship, generator) {
  relationship.onDelete = checkAndReturnRelationshipOnValue(relationship.options?.onDelete, generator);
  relationship.onUpdate = checkAndReturnRelationshipOnValue(relationship.options?.onUpdate, generator);
}

export default function prepareRelationship(entityWithConfig, relationship, generator, ignoreMissingRequiredRelationship) {
  const entityName = entityWithConfig.name;
  const otherEntityName = relationship.otherEntityName;
  const jhiTablePrefix = entityWithConfig.jhiTablePrefix || hibernateSnakeCase(entityWithConfig.jhiPrefix);

  if (!relationship.otherEntity) {
    throw new Error(
      `Error at entity ${entityName}: could not find the entity of the relationship ${stringifyApplicationData(relationship)}`
    );
  }
  const otherEntityData = relationship.otherEntity;
  if (!relationship.otherEntityField && otherEntityData.primaryKey) {
    relationship.otherEntityField = otherEntityData.primaryKey.name;
  }

  _.defaults(relationship, {
    // let ownerSide true when type is 'many-to-one' for convenience.
    // means that this side should control the reference.
    ownerSide: relationship.ownerSide || relationship.relationshipType === 'many-to-one',
    collection: relationship.relationshipType === 'one-to-many' || relationship.relationshipType === 'many-to-many',
  });

  relationship.otherSideReferenceExists = false;

  relationship.otherEntityIsEmbedded = otherEntityData.embedded;

  // Look for fields at the other other side of the relationship
  if (otherEntityData.relationships) {
    const otherRelationship = relationship.otherRelationship;
    if (otherRelationship) {
      relationship.otherSideReferenceExists = true;
      _.defaults(relationship, {
        otherRelationship,
        otherEntityRelationshipName: otherRelationship.relationshipName,
        otherEntityRelationshipNamePlural: otherRelationship.relationshipNamePlural,
        otherEntityRelationshipNameCapitalized: otherRelationship.relationshipNameCapitalized,
        otherEntityRelationshipNameCapitalizedPlural: relationship.relationshipNameCapitalizedPlural,
      });
    } else if (
      !ignoreMissingRequiredRelationship &&
      entityWithConfig.databaseType !== NEO4J &&
      entityWithConfig.databaseType !== DATABASE_NO &&
      (relationship.relationshipType === 'one-to-many' || relationship.ownerSide === false)
    ) {
      throw new Error(
        `Error at entity ${entityName}: could not find the other side of the relationship ${stringifyApplicationData(relationship)}`
      );
    } else {
      generator.debug(`Entity ${entityName}: Could not find the other side of the relationship ${stringifyApplicationData(relationship)}`);
    }
  }

  relationship.relatedField = otherEntityData.fields.find(field => field.fieldName === relationship.otherEntityField);
  if (!relationship.relatedField && otherEntityData.primaryKey && otherEntityData.primaryKey.derived) {
    Object.defineProperty(relationship, 'relatedField', {
      get() {
        return otherEntityData.primaryKey.derivedFields.find(field => field.fieldName === relationship.otherEntityField);
      },
    });
  }
  if (relationship.relatedField) {
    relationship.otherEntityFieldCapitalized = relationship.relatedField.fieldNameCapitalized;
    relationship.relatedField.relatedByOtherEntity = true;
  } else {
    relationship.otherEntityFieldCapitalized = _.upperFirst(relationship.otherEntityField);
  }

  if (relationship.otherEntityRelationshipName !== undefined) {
    _.defaults(relationship, {
      otherEntityRelationshipNamePlural: pluralize(relationship.otherEntityRelationshipName),
      otherEntityRelationshipNameCapitalized: _.upperFirst(relationship.otherEntityRelationshipName),
    });
    _.defaults(relationship, {
      otherEntityRelationshipNameCapitalizedPlural: pluralize(relationship.otherEntityRelationshipNameCapitalized),
    });
  }

  const relationshipName = relationship.relationshipName;
  _.defaults(relationship, {
    relationshipNamePlural: pluralize(relationshipName),
    relationshipFieldName: _.lowerFirst(relationshipName),
    relationshipNameCapitalized: _.upperFirst(relationshipName),
    relationshipNameHumanized: _.startCase(relationshipName),
    columnName: hibernateSnakeCase(relationshipName),
    columnNamePrefix: relationship.id && relationship.relationshipType === 'one-to-one' ? '' : `${hibernateSnakeCase(relationshipName)}_`,
    otherEntityNamePlural: pluralize(otherEntityName),
    otherEntityNameCapitalized: _.upperFirst(otherEntityName),
    otherEntityTableName:
      otherEntityData.entityTableName ||
      hibernateSnakeCase(otherEntityData.builtInUser ? `${jhiTablePrefix}_${otherEntityName}` : otherEntityName),
  });

  _.defaults(relationship, {
    relationshipFieldNamePlural: pluralize(relationship.relationshipFieldName),
    relationshipNameCapitalizedPlural:
      relationship.relationshipName.length > 1
        ? pluralize(relationship.relationshipNameCapitalized)
        : _.upperFirst(pluralize(relationship.relationshipName)),
    otherEntityNameCapitalizedPlural: pluralize(relationship.otherEntityNameCapitalized),
  });

  _.defaults(relationship, {
    propertyName: relationship.collection ? relationship.relationshipFieldNamePlural : relationship.relationshipFieldName,
  });

  if (entityWithConfig.dto === MAPSTRUCT) {
    if (otherEntityData.dto !== MAPSTRUCT && !otherEntityData.builtInUser) {
      generator.logger.warn(
        `Entity ${entityName}: this entity has the DTO option, and it has a relationship with entity "${otherEntityName}" that doesn't have the DTO option. This will result in an error.`
      );
    }
  }

  if (entityWithConfig.prodDatabaseType) {
    if (isReservedTableName(relationship.otherEntityTableName, entityWithConfig.prodDatabaseType) && jhiTablePrefix) {
      const otherEntityTableName = relationship.otherEntityTableName;
      relationship.otherEntityTableName = `${jhiTablePrefix}_${otherEntityTableName}`;
    }
  }

  if (relationship.otherEntityAngularName === undefined) {
    if (otherEntityData.builtInUser) {
      relationship.otherEntityAngularName = 'User';
    } else {
      const otherEntityAngularSuffix = otherEntityData ? otherEntityData.angularJSSuffix || '' : '';
      relationship.otherEntityAngularName = _.upperFirst(relationship.otherEntityName) + upperFirstCamelCase(otherEntityAngularSuffix);
    }
  }

  _.defaults(relationship, {
    otherEntityStateName: _.kebabCase(relationship.otherEntityAngularName),
    jpaMetamodelFiltering: otherEntityData.jpaMetamodelFiltering,
    unique: relationship.id || (relationship.ownerSide && relationship.relationshipType === 'one-to-one'),
  });

  if (!otherEntityData.builtInUser) {
    _.defaults(relationship, {
      otherEntityFileName: _.kebabCase(relationship.otherEntityAngularName),
      otherEntityFolderName: _.kebabCase(relationship.otherEntityAngularName),
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
  }

  if (relationship.relationshipValidateRules && relationship.relationshipValidateRules.includes(REQUIRED)) {
    if (entityName.toLowerCase() === relationship.otherEntityName.toLowerCase()) {
      generator.logger.warn(`Error at entity ${entityName}: required relationships to the same entity are not supported.`);
    } else {
      relationship.relationshipValidate = relationship.relationshipRequired = true;
    }
  }
  relationship.nullable = !(relationship.relationshipValidate === true && relationship.relationshipRequired);

  relationship.shouldWriteJoinTable = relationship.relationshipType === 'many-to-many' && relationship.ownerSide;
  if (relationship.shouldWriteJoinTable) {
    relationship.joinTable = {
      name: getJoinTableName(entityWithConfig.entityTableName, relationship.relationshipName, {
        prodDatabaseType: entityWithConfig.prodDatabaseType,
      }).value,
    };
  }

  relationship.reference = relationshipToReference(entityWithConfig, relationship);

  _defineOnUpdateAndOnDelete(relationship, generator);

  _derivedProperties(relationship);

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
    doc: relationship.javaDoc,
    name,
    nameCapitalized: collection ? relationship.relationshipNameCapitalizedPlural : relationship.relationshipNameCapitalized,
    get type() {
      return relationship.otherEntity.primaryKey ? relationship.otherEntity.primaryKey.type : undefined;
    },
    path: [...pathPrefix, name],
  };
  return reference;
}
