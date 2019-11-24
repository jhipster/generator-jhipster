/**
 * Copyright 2013-2019 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see http://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const JDLObject = require('../core/jdl_object');
const JDLEntity = require('../core/jdl_entity');
const JDLField = require('../core/jdl_field');
const JDLValidation = require('../core/jdl_validation');
const JDLEnum = require('../core/jdl_enum');
const JDLRelationship = require('../core/jdl_relationship');
const JDLUnaryOption = require('../core/jdl_unary_option');
const JDLBinaryOption = require('../core/jdl_binary_option');
const { CommonDBTypes } = require('../core/jhipster/field_types');
const { ONE_TO_ONE, ONE_TO_MANY, MANY_TO_ONE, MANY_TO_MANY } = require('../core/jhipster/relationship_types');
const { JPA_DERIVED_IDENTIFIER } = require('../core/jhipster/relationship_options');
const { FILTER, NO_FLUENT_METHOD, READ_ONLY, SKIP_USER_MANAGEMENT } = require('../core/jhipster/unary_options');
const {
  ANGULAR_SUFFIX,
  CLIENT_ROOT_FOLDER,
  DTO,
  MICROSERVICE,
  PAGINATION,
  SEARCH,
  SERVICE
} = require('../core/jhipster/binary_options').Options;
const { lowerFirst, upperFirst } = require('../utils/string_utils');

module.exports = {
  convertEntitiesToJDL
};

const USER_ENTITY_NAME = 'User';
const USER_ENTITY = new JDLEntity({ name: USER_ENTITY_NAME });

let entities;
let jdlObject;
let skippedUserManagement;

/**
 * Convert the passed entities (parsed from JSON files) to a JDL object.
 * @param {Object} params - an object containing the entities and relevant options.
 * @param {Map<string, Object>} params.entities - a Map having for keys the entity names and values the JSON entity files.
 * @param {boolean} params.skippedUserManagement - whether management of the User entity by JHipster is skipped.
 * @return {JDLObject} the parsed entities in the JDL form.
 */
function convertEntitiesToJDL(params) {
  if (!params.entities) {
    throw new Error('Entities have to be passed to be converted.');
  }
  init(params);
  addEntities();
  addRelationshipsToJDL();
  return jdlObject;
}

function init(params) {
  entities = params.entities;
  jdlObject = new JDLObject();
  skippedUserManagement = params.skippedUserManagement;
}

function addEntities() {
  entities.forEach((entity, entityName) => {
    addEntity(entity, entityName);
  });
}

function addEntity(entity, entityName) {
  if (entityName === USER_ENTITY_NAME && !skippedUserManagement) {
    throw new Error(`User entity name is reserved if ${SKIP_USER_MANAGEMENT} is not set.`);
  }
  jdlObject.addEntity(convertJSONToJDLEntity(entity, entityName));
  addEnumsToJDL(entity);
  addEntityOptionsToJDL(entity, entityName);
}

function convertJSONToJDLEntity(entity, entityName) {
  const jdlEntity = new JDLEntity({
    name: entityName,
    tableName: entity.entityTableName,
    comment: entity.javadoc
  });
  addFields(jdlEntity, entity);
  return jdlEntity;
}

function addFields(jdlEntity, entity) {
  entity.fields.forEach(field => {
    jdlEntity.addField(convertJSONToJDLField(field));
  });
}

function convertJSONToJDLField(field) {
  const jdlField = new JDLField({
    name: lowerFirst(field.fieldName),
    type: field.fieldType,
    comment: field.javadoc
  });
  if (jdlField.type === 'byte[]') {
    jdlField.type = getTypeForBlob(field.fieldTypeBlobContent);
  }
  if (field.fieldValidateRules) {
    addValidations(jdlField, field);
  }
  return jdlField;
}

function getTypeForBlob(blobContentType) {
  if (['image', 'any', 'text'].includes(blobContentType)) {
    return CommonDBTypes[`${blobContentType.toUpperCase()}_BLOB`];
  }
  throw new Error(`Unrecognised blob type: '${blobContentType}'`);
}

function addValidations(jdlField, field) {
  field.fieldValidateRules.forEach(rule => {
    jdlField.addValidation(convertJSONToJDLValidation(rule, field));
  });
}

function convertJSONToJDLValidation(rule, field) {
  return new JDLValidation({
    name: rule,
    value: field[`fieldValidateRules${upperFirst(rule)}`]
  });
}

function addEnumsToJDL(entity) {
  entity.fields.forEach(field => {
    if (field.fieldValues !== undefined) {
      jdlObject.addEnum(
        new JDLEnum({
          name: field.fieldType,
          values: getEnumValuesFromString(field.fieldValues)
        })
      );
    }
  });
}

function getEnumValuesFromString(valuesAsString) {
  return valuesAsString.split(',').map(fieldValue => {
    // if fieldValue looks like ENUM_VALUE (something)
    if (fieldValue.includes('(')) {
      const [key, value] = fieldValue
        .replace(/^(\w+)\s\((\w+)\)$/, (match, key, value) => `${key},${value}`)
        .split(',');
      return {
        key,
        value
      };
    }
    return { key: fieldValue };
  });
}

/*
 * Adds relationships for entities to JDL.
 * The jdl passed must contain the jdl entities concerned by the relationships
 */
function addRelationshipsToJDL() {
  entities.forEach((entity, entityName) => {
    dealWithRelationships(entity.relationships, entityName);
  });
}

function dealWithRelationships(relationships, entityName) {
  if (!relationships) {
    return;
  }
  relationships.forEach(relationship => {
    const jdlRelationship = getRelationship(relationship, entityName);
    if (jdlRelationship) {
      jdlObject.addRelationship(jdlRelationship);
    }
  });
}

function getRelationship(relationship, entityName) {
  let relationshipConfiguration = {
    sourceEntity: null,
    destinationEntity: null,
    type: null,
    injectedFieldInSourceEntity: null,
    injectedFieldInDestinationEntity: null,
    injectedFieldInDestinationIsRequired: false,
    injectedFieldInSourceIsRequired: false,
    commentForSourceEntity: null,
    commentForDestinationEntity: null,
    destinationEntityAsJDLEntity: null,
    options: {}
  };

  const sourceEntitySideAttributes = getSourceEntitySideAttributes(entityName, relationship);
  relationshipConfiguration = {
    ...relationshipConfiguration,
    ...sourceEntitySideAttributes
  };

  relationshipConfiguration.options = getRelationshipOptions(relationship);

  if (shouldHandleUserEntity(relationship)) {
    relationshipConfiguration.destinationEntityAsJDLEntity = USER_ENTITY;
  } else {
    const destinationEntity = upperFirst(relationship.otherEntityName);
    relationshipConfiguration.destinationEntity = entities.get(destinationEntity);
    relationshipConfiguration.destinationEntityAsJDLEntity = jdlObject.getEntity(destinationEntity);
    if (!relationshipConfiguration.destinationEntity) {
      return undefined;
    }
    const isEntityTheDestinationSideEntity = (otherEntityName, otherEntityRelationshipName) =>
      otherEntityName === entityName && otherEntityRelationshipName === relationship.relationshipName;
    const destinationSideAttributes = getDestinationEntitySideAttributes(
      isEntityTheDestinationSideEntity,
      relationshipConfiguration.destinationEntity.relationships
    );
    relationshipConfiguration = {
      ...relationshipConfiguration,
      ...destinationSideAttributes
    };
  }
  if (relationship.relationshipType === 'many-to-one') {
    if (relationshipConfiguration.injectedFieldInDestinationEntity) {
      // This is a bidirectional relationship so consider it as a OneToMany
      return getBidirectionalOneToManyRelationship(relationshipConfiguration);
    }
    // Unidirectional ManyToOne
    relationshipConfiguration.type = MANY_TO_ONE;
  } else if (relationship.relationshipType === 'one-to-one' && relationship.ownerSide === true) {
    relationshipConfiguration.type = ONE_TO_ONE;
  } else if (relationship.relationshipType === 'many-to-many' && relationship.ownerSide === true) {
    relationshipConfiguration.type = MANY_TO_MANY;
  }
  if (relationshipConfiguration.type) {
    return getDefaultRelationship(relationshipConfiguration);
  }
  return undefined;
}

function shouldHandleUserEntity(relationship) {
  return relationship.otherEntityName.toLowerCase() === USER_ENTITY_NAME.toLowerCase() && !skippedUserManagement;
}

function getSourceEntitySideAttributes(entityName, relationship) {
  return {
    sourceEntity: entityName,
    injectedFieldInSourceEntity: getInjectedFieldInSourceEntity(relationship),
    injectedFieldInSourceIsRequired: relationship.relationshipValidateRules,
    commentForSourceEntity: relationship.javadoc
  };
}

function getDestinationEntitySideAttributes(isEntityTheDestinationSideEntity, destinationEntityRelationships) {
  const foundDestinationSideEntity = destinationEntityRelationships.find(destinationEntityFromRelationship => {
    return isEntityTheDestinationSideEntity(
      upperFirst(destinationEntityFromRelationship.otherEntityName),
      destinationEntityFromRelationship.otherEntityRelationshipName
    );
  });
  if (!foundDestinationSideEntity) {
    return {};
  }
  // Bidirectional relationship
  let injectedFieldInDestinationEntity = foundDestinationSideEntity.relationshipName;
  if (!!foundDestinationSideEntity.otherEntityField && foundDestinationSideEntity.otherEntityField !== 'id') {
    injectedFieldInDestinationEntity += `(${foundDestinationSideEntity.otherEntityField})`;
  }
  const injectedFieldInDestinationIsRequired = !!foundDestinationSideEntity.relationshipValidateRules;
  const commentForDestinationEntity = foundDestinationSideEntity.javadoc;
  return {
    injectedFieldInDestinationEntity,
    injectedFieldInDestinationIsRequired,
    commentForDestinationEntity
  };
}

function getRelationshipOptions(relationship) {
  const options = relationship.options || {};
  if (relationship.useJPADerivedIdentifier) {
    options[JPA_DERIVED_IDENTIFIER] = true;
  }
  return options;
}

function getDefaultRelationship(relationshipConfiguration) {
  return new JDLRelationship({
    from: relationshipConfiguration.sourceEntity,
    to: relationshipConfiguration.destinationEntityAsJDLEntity.name,
    type: relationshipConfiguration.type,
    injectedFieldInFrom: relationshipConfiguration.injectedFieldInSourceEntity,
    injectedFieldInTo: relationshipConfiguration.injectedFieldInDestinationEntity,
    isInjectedFieldInFromRequired: relationshipConfiguration.injectedFieldInSourceIsRequired,
    isInjectedFieldInToRequired: relationshipConfiguration.injectedFieldInDestinationIsRequired,
    commentInFrom: relationshipConfiguration.commentForSourceEntity,
    commentInTo: relationshipConfiguration.commentForDestinationEntity,
    options: relationshipConfiguration.options
  });
}

// Based on a ManyToOne relationship, we determine the OneToMany relationship.
function getBidirectionalOneToManyRelationship(relationshipConfiguration) {
  return new JDLRelationship({
    from: relationshipConfiguration.destinationEntityAsJDLEntity.name,
    to: relationshipConfiguration.sourceEntity,
    type: ONE_TO_MANY,
    injectedFieldInFrom: relationshipConfiguration.injectedFieldInDestinationEntity,
    injectedFieldInTo: relationshipConfiguration.injectedFieldInSourceEntity,
    isInjectedFieldInFromRequired: relationshipConfiguration.injectedFieldInDestinationIsRequired,
    isInjectedFieldInToRequired: relationshipConfiguration.injectedFieldInSourceIsRequired,
    commentInFrom: relationshipConfiguration.commentForDestinationEntity,
    commentInTo: relationshipConfiguration.commentForSourceEntity,
    options: relationshipConfiguration.options
  });
}

function getInjectedFieldInSourceEntity(relationship) {
  return (
    relationship.relationshipName +
    (relationship.otherEntityField && relationship.otherEntityField !== 'id'
      ? `(${relationship.otherEntityField})`
      : '')
  );
}

function addEntityOptionsToJDL(entity, entityName) {
  if (entity.fluentMethods === false) {
    addUnaryOptionToJDL(NO_FLUENT_METHOD, entityName);
  }
  [DTO, PAGINATION, SERVICE].forEach(option => {
    if (entity[option] && entity[option] !== 'no') {
      addBinaryOptionToJDL(option, entity[option], entityName);
    }
  });
  if (entity.searchEngine) {
    addBinaryOptionToJDL(SEARCH, entity.searchEngine, entityName);
  }
  // angularSuffix in BinaryOptions, angularJSSuffix in Json
  if (entity.angularJSSuffix) {
    addBinaryOptionToJDL(ANGULAR_SUFFIX, entity.angularJSSuffix, entityName);
  }
  // microservice in BinaryOptions, microserviceName in Json
  if (entity.microserviceName !== undefined) {
    addBinaryOptionToJDL(MICROSERVICE, entity.microserviceName, entityName);
  }
  if (entity.jpaMetamodelFiltering === true) {
    addUnaryOptionToJDL(FILTER, entityName);
  }
  if (entity.readOnly === true) {
    addUnaryOptionToJDL(READ_ONLY, entityName);
  }
  if (entity.clientRootFolder) {
    addBinaryOptionToJDL(CLIENT_ROOT_FOLDER, entity.clientRootFolder, entityName);
  }
}

function addUnaryOptionToJDL(unaryOption, entityName) {
  jdlObject.addOption(
    new JDLUnaryOption({
      name: unaryOption,
      entityNames: [entityName]
    })
  );
}

function addBinaryOptionToJDL(binaryOption, value, entityName) {
  jdlObject.addOption(
    new JDLBinaryOption({
      name: binaryOption,
      value,
      entityNames: [entityName]
    })
  );
}
