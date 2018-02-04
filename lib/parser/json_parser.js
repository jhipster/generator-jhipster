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

const _ = require('lodash');
const JDLObject = require('../core/jdl_object');
const JDLEntity = require('../core/jdl_entity');
const JDLField = require('../core/jdl_field');
const JDLValidation = require('../core/jdl_validation');
const JDLEnum = require('../core/jdl_enum');
const JDLRelationship = require('../core/jdl_relationship');
const JDLUnaryOption = require('../core/jdl_unary_option');
const JDLBinaryOption = require('../core/jdl_binary_option');
const FieldTypes = require('../core/jhipster/field_types');
const RelationshipTypes = require('../core/jhipster/relationship_types').RELATIONSHIP_TYPES;
const UnaryOptions = require('../core/jhipster/unary_options').UNARY_OPTIONS;
const BinaryOptions = require('../core/jhipster/binary_options').BINARY_OPTIONS;
const BuildException = require('../exceptions/exception_factory').BuildException;
const exceptions = require('../exceptions/exception_factory').exceptions;

module.exports = {
  parseEntities,
  parseServerOptions
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
function parseEntities(entities, jdl) {
  if (!entities) {
    throw new BuildException(exceptions.NullPointer, 'Entities have to be passed to be converted.');
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
  return configuration.jdl.options.has(UnaryOptions.SKIP_USER_MANAGEMENT);
}

function addEntities() {
  for (let i = 0, entityNames = Object.keys(configuration.entities); i < entityNames.length; i++) {
    addEntity(entityNames[i]);
  }
}

function addEntity(entityName) {
  if (entityName === USER && !configuration.skipUserManagement) {
    throw new BuildException(
      exceptions.IllegalName,
      'User entity name is reserved if skipUserManagement is not set.');
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
  entity.fields.forEach((field) => {
    jdlEntity.addField(convertJSONToJDLField(field));
  });
}

function convertJSONToJDLField(field) {
  const jdlField = new JDLField({
    name: _.lowerFirst(field.fieldName),
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
    return FieldTypes.COMMON_DB_TYPES[`${fieldTypeBlobContent.toUpperCase()}_BLOB`];
  }
  return null;
}

function addValidations(jdlField, field) {
  field.fieldValidateRules.forEach((rule) => {
    jdlField.addValidation(convertJSONToJDLValidation(rule, field));
  });
}

function convertJSONToJDLValidation(rule, field) {
  return new JDLValidation({
    name: rule,
    value: field[`fieldValidateRules${_.upperFirst(rule)}`]
  });
}

function addEnumsToJDL(entity) {
  entity.fields.forEach((field) => {
    if (field.fieldValues !== undefined) {
      configuration.jdl.addEnum(new JDLEnum({
        name: field.fieldType,
        values: field.fieldValues.split(',')
      }));
    }
  });
}

/*
 * Adds relationships for entities to JDL.
 * The jdl passed must contain the jdl entities concerned by the relationships
 */
function addRelationshipsToJDL() {
  for (let i = 0, entityNames = Object.keys(configuration.entities); i < entityNames.length; i++) {
    dealWithRelationships(
      configuration.entities[entityNames[i]].relationships,
      entityNames[i]
    );
  }
}

function dealWithRelationships(relationships, entityName) {
  relationships.forEach((relationship) => {
    const jdlRelationship = getRelationship(relationship, entityName);
    if (jdlRelationship) {
      configuration.jdl.addRelationship(jdlRelationship);
    }
  });
}

function getInjectedFieldInFrom(relationship) {
  return relationship.relationshipName
    + (relationship.otherEntityField && relationship.otherEntityField !== 'id'
      ? `(${relationship.otherEntityField})`
      : '');
}

// TODO: refactor this.
function getRelationship(relationship, entityName) {
  let type;
  let injectedFieldInTo;
  let isInjectedFieldInToRequired = false;
  let commentInTo;
  let otherEntity;
  let toJdlEntity;

  if (relationship.otherEntityName.toLowerCase() === USER.toLowerCase() && !configuration.skipUserManagement) {
    toJdlEntity = USER_ENTITY;
  } else {
    otherEntity = configuration.entities[_.upperFirst(relationship.otherEntityName)];
    if (!otherEntity) {
      return;
    }
    toJdlEntity = configuration.jdl.entities[_.upperFirst(relationship.otherEntityName)];

    for (let i = 0; i < otherEntity.relationships.length; i++) {
      const relationship2 = otherEntity.relationships[i];
      if (_.upperFirst(relationship2.otherEntityName) === entityName
        && relationship2.otherEntityRelationshipName === relationship.relationshipName) {
        // Bidirectional relationship
        injectedFieldInTo = relationship2.relationshipName;
        if (relationship2.otherEntityField !== undefined && relationship2.otherEntityField !== 'id') {
          injectedFieldInTo += `(${relationship2.otherEntityField})`;
        }
        if (relationship2.relationshipValidateRules) {
          isInjectedFieldInToRequired = true;
        }
        commentInTo = relationship2.javadoc;
        break;
      }
    }
  }
  if (relationship.relationshipType === 'many-to-one') {
    if (injectedFieldInTo) {
      // This is a bidirectional relationship so consider it as a OneToMany
      return new JDLRelationship({ // eslint-disable-line consistent-return
        from: configuration.jdl.entities[_.upperFirst(relationship.otherEntityName)],
        to: configuration.jdl.entities[entityName],
        type: RelationshipTypes.ONE_TO_MANY,
        injectedFieldInFrom: injectedFieldInTo,
        injectedFieldInTo: getInjectedFieldInFrom(relationship),
        isInjectedFieldInFromRequired: isInjectedFieldInToRequired,
        isInjectedFieldInToRequired: relationship.relationshipValidateRules,
        commentInFrom: commentInTo,
        commentInTo: relationship.javadoc
      });
    }
    // Unidirectional ManyToOne
    type = RelationshipTypes.MANY_TO_ONE;
  } else if (relationship.relationshipType === 'one-to-one' && relationship.ownerSide === true) {
    type = RelationshipTypes.ONE_TO_ONE;
  } else if (relationship.relationshipType === 'many-to-many' && relationship.ownerSide === true) {
    type = RelationshipTypes.MANY_TO_MANY;
  }
  if (type) {
    return new JDLRelationship({ // eslint-disable-line consistent-return
      from: configuration.jdl.entities[entityName],
      to: toJdlEntity,
      type,
      injectedFieldInFrom: getInjectedFieldInFrom(relationship),
      injectedFieldInTo,
      isInjectedFieldInFromRequired: relationship.relationshipValidateRules,
      isInjectedFieldInToRequired,
      commentInFrom: relationship.javadoc,
      commentInTo
    });
  }
}

// TODO: refactor this.
function addEntityOptionsToJDL(entity, entityName) {
  if (entity.fluentMethods === false) {
    configuration.jdl.addOption(
      new JDLUnaryOption(
        {
          name: UnaryOptions.NO_FLUENT_METHOD,
          entityNames: [entityName]
        }
      )
    );
  }
  [BinaryOptions.DTO, BinaryOptions.PAGINATION, BinaryOptions.SERVICE, BinaryOptions.SEARCH_ENGINE].forEach((option) => {
    if (entity[option] && entity[option] !== 'no') {
      configuration.jdl.addOption(
        new JDLBinaryOption(
          {
            name: option,
            value: entity[option],
            entityNames: [entityName]
          }
        )
      );
    }
  });
  // angularSuffix in BINARY_OPTIONS, angularJSSuffix in Json
  if (entity.angularJSSuffix !== undefined) {
    configuration.jdl.addOption(
      new JDLBinaryOption(
        {
          name: BinaryOptions.ANGULAR_SUFFIX,
          value: entity.angularJSSuffix,
          entityNames: [entityName]
        }
      )
    );
  }
  // microservice in BINARY_OPTIONS, microserviceName in Json
  if (entity.microserviceName !== undefined) {
    configuration.jdl.addOption(
      new JDLBinaryOption(
        {
          name: BinaryOptions.MICROSERVICE,
          value: entity.microserviceName,
          entityNames: [entityName]
        }
      )
    );
  }
  if (entity.jpaMetamodelFiltering === true) {
    configuration.jdl.addOption(
      new JDLUnaryOption(
        {
          name: UnaryOptions.FILTER,
          entityNames: [entityName]
        }
      )
    );
  }
}

/**
 * Parses the jhipster configuration into JDL.
 * @param jhConfig the jhipster config ('generator-jhipster' in .yo-rc.json)
 * @param jdl {JDLObject} to which the parsed options are added. If undefined a new JDLObject is created.
 * @returns {JDLObject} the JDLObject
 */
function parseServerOptions(jhConfig, jdl) {
  if (!jdl) {
    jdl = new JDLObject();
  }
  [UnaryOptions.SKIP_CLIENT, UnaryOptions.SKIP_SERVER, UnaryOptions.SKIP_USER_MANAGEMENT].forEach((option) => {
    if (jhConfig[option] === true) {
      jdl.addOption(new JDLUnaryOption({
        name: option,
        value: jhConfig[option]
      }));
    }
  });
  return jdl;
}
