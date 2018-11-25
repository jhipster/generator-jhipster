/**
 * Copyright 2013-2018 the original author or authors from the JHipster project.
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
const { FILTER, NO_FLUENT_METHOD, SKIP_USER_MANAGEMENT } = require('../core/jhipster/unary_options');
const {
  ANGULAR_SUFFIX,
  CLIENT_ROOT_FOLDER,
  DTO,
  MICROSERVICE,
  PAGINATION,
  SEARCH_ENGINE,
  SERVICE
} = require('../core/jhipster/binary_options').Options;
const { lowerFirst, upperFirst } = require('../utils/string_utils');

module.exports = {
  convertEntitiesToJDL
};

const USER = 'User';
const USER_ENTITY = new JDLEntity({ name: USER });

const configuration = {
  entities: null,
  jdl: new JDLObject(),
  skipUserManagement: false
};

/**
 * Converts the JSON entities into JDL.
 * @param entities the entities in plain JS format.
 * @param jdl {JDLObject} the base JDLObject to use as conversion result.
 * @returns {*} the updated JDLObject.
 */
function convertEntitiesToJDL(entities, jdl) {
  if (!entities) {
    throw new Error('Entities have to be passed to be converted.');
  }
  init(entities, jdl);
  addEntities();
  addRelationshipsToJDL();
  return configuration.jdl;
}

function init(entities, jdl) {
  configuration.entities = entities;
  configuration.jdl = jdl || configuration.jdl;
  configuration.skipUserManagement = hasSkipUserManagement();
}

function hasSkipUserManagement() {
  return configuration.jdl.options.has(SKIP_USER_MANAGEMENT);
}

function addEntities() {
  Object.keys(configuration.entities).forEach(entityName => {
    addEntity(entityName);
  });
}

function addEntity(entityName) {
  if (entityName === USER && !configuration.skipUserManagement) {
    throw new Error('User entity name is reserved if skipUserManagement is not set.');
  }
  const entity = configuration.entities[entityName];
  configuration.jdl.addEntity(convertJSONToJDLEntity(entity, entityName));
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

function getTypeForBlob(fieldTypeBlobContent) {
  if (['image', 'any', 'text'].includes(fieldTypeBlobContent)) {
    return CommonDBTypes[`${fieldTypeBlobContent.toUpperCase()}_BLOB`];
  }
  return null;
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
      configuration.jdl.addEnum(
        new JDLEnum({
          name: field.fieldType,
          values: field.fieldValues.split(',')
        })
      );
    }
  });
}

/*
 * Adds relationships for entities to JDL.
 * The jdl passed must contain the jdl entities concerned by the relationships
 */
function addRelationshipsToJDL() {
  for (let i = 0, entityNames = Object.keys(configuration.entities); i < entityNames.length; i++) {
    dealWithRelationships(configuration.entities[entityNames[i]].relationships, entityNames[i]);
  }
}

function dealWithRelationships(relationships, entityName) {
  if (!relationships) {
    return;
  }
  relationships.forEach(relationship => {
    const jdlRelationship = getRelationship(relationship, entityName);
    if (jdlRelationship) {
      configuration.jdl.addRelationship(jdlRelationship);
    }
  });
}

function getRelationship(relationship, entityName) {
  const relationshipConfiguration = {
    type: null,
    injectedFieldInTo: null,
    isInjectedFieldInToRequired: false,
    commentInTo: null,
    otherEntity: null,
    toJdlEntity: null
  };

  if (shouldHandleUserEntity(relationship)) {
    relationshipConfiguration.toJdlEntity = USER_ENTITY;
  } else {
    relationshipConfiguration.otherEntity = configuration.entities[upperFirst(relationship.otherEntityName)];
    if (!relationshipConfiguration.otherEntity) {
      return;
    }
    setUpRelationshipConfiguration(relationship, entityName, relationshipConfiguration);
  }
  if (relationship.relationshipType === 'many-to-one') {
    if (relationshipConfiguration.injectedFieldInTo) {
      // This is a bidirectional relationship so consider it as a OneToMany
      // eslint-disable-next-line consistent-return
      return getBidirectionalOneToManyRelationship(relationship, entityName, relationshipConfiguration);
    }
    // Unidirectional ManyToOne
    relationshipConfiguration.type = MANY_TO_ONE;
  } else if (relationship.relationshipType === 'one-to-one' && relationship.ownerSide === true) {
    relationshipConfiguration.type = ONE_TO_ONE;
  } else if (relationship.relationshipType === 'many-to-many' && relationship.ownerSide === true) {
    relationshipConfiguration.type = MANY_TO_MANY;
  }
  if (relationshipConfiguration.type) {
    // eslint-disable-next-line consistent-return
    return getDefaultRelationship(relationship, entityName, relationshipConfiguration);
  }
}

function shouldHandleUserEntity(relationship) {
  return relationship.otherEntityName.toLowerCase() === USER.toLowerCase() && !configuration.skipUserManagement;
}

function setUpRelationshipConfiguration(relationship, entityName, relationshipConfiguration) {
  relationshipConfiguration.toJdlEntity = configuration.jdl.entities[upperFirst(relationship.otherEntityName)];
  for (let i = 0; i < relationshipConfiguration.otherEntity.relationships.length; i++) {
    const relationship2 = relationshipConfiguration.otherEntity.relationships[i];
    if (
      upperFirst(relationship2.otherEntityName) === entityName &&
      relationship2.otherEntityRelationshipName === relationship.relationshipName
    ) {
      // Bidirectional relationship
      relationshipConfiguration.injectedFieldInTo = relationship2.relationshipName;
      if (!!relationship2.otherEntityField && relationship2.otherEntityField !== 'id') {
        relationshipConfiguration.injectedFieldInTo += `(${relationship2.otherEntityField})`;
      }
      relationshipConfiguration.isInjectedFieldInToRequired = !!relationship2.relationshipValidateRules;
      relationshipConfiguration.commentInTo = relationship2.javadoc;
      break;
    }
  }
}

function getDefaultRelationship(relationship, entityName, relationshipConfiguration) {
  return new JDLRelationship({
    // eslint-disable-line consistent-return
    from: entityName,
    to: relationshipConfiguration.toJdlEntity.name,
    type: relationshipConfiguration.type,
    injectedFieldInFrom: getInjectedFieldInFrom(relationship),
    injectedFieldInTo: relationshipConfiguration.injectedFieldInTo,
    isInjectedFieldInFromRequired: relationship.relationshipValidateRules,
    isInjectedFieldInToRequired: relationshipConfiguration.isInjectedFieldInToRequired,
    commentInFrom: relationship.javadoc,
    commentInTo: relationshipConfiguration.commentInTo
  });
}

function getBidirectionalOneToManyRelationship(relationship, entityName, relationshipConfiguration) {
  return new JDLRelationship({
    from: upperFirst(relationship.otherEntityName),
    to: entityName,
    type: ONE_TO_MANY,
    injectedFieldInFrom: relationshipConfiguration.injectedFieldInTo,
    injectedFieldInTo: getInjectedFieldInFrom(relationship),
    isInjectedFieldInFromRequired: relationshipConfiguration.isInjectedFieldInToRequired,
    isInjectedFieldInToRequired: relationship.relationshipValidateRules,
    commentInFrom: relationshipConfiguration.commentInTo,
    commentInTo: relationship.javadoc
  });
}

function getInjectedFieldInFrom(relationship) {
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
  [DTO, PAGINATION, SERVICE, SEARCH_ENGINE].forEach(option => {
    if (entity[option] && entity[option] !== 'no') {
      addBinaryOptionToJDL(option, entity[option], entityName);
    }
  });
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
  if (entity.clientRootFolder) {
    addBinaryOptionToJDL(CLIENT_ROOT_FOLDER, entity.clientRootFolder, entityName);
  }
}

function addUnaryOptionToJDL(unaryOption, entityName) {
  configuration.jdl.addOption(
    new JDLUnaryOption({
      name: unaryOption,
      entityNames: [entityName]
    })
  );
}

function addBinaryOptionToJDL(binaryOption, value, entityName) {
  configuration.jdl.addOption(
    new JDLBinaryOption({
      name: binaryOption,
      value,
      entityNames: [entityName]
    })
  );
}
