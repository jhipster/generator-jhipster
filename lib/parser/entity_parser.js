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
const camelCase = require('../utils/string_utils').camelCase;
const merge = require('../utils/object_utils').merge;
const FieldTypes = require('../core/jhipster/field_types');
const RelationshipTypes = require('../core/jhipster/relationship_types').RELATIONSHIP_TYPES;
const DatabaseTypes = require('../core/jhipster/database_types');
const formatComment = require('../utils/format_utils').formatComment;
const dateFormatForLiquibase = require('../utils/format_utils').dateFormatForLiquibase;
const UnaryOptions = require('../core/jhipster/unary_options').UNARY_OPTIONS;
const BinaryOptions = require('../core/jhipster/binary_options').BINARY_OPTIONS;
const serviceClassOptionValue = require('../core/jhipster/binary_options').BINARY_OPTION_VALUES.service.SERVICE_CLASS;
const BuildException = require('../exceptions/exception_factory').BuildException;
const exceptions = require('../exceptions/exception_factory').exceptions;
const winston = require('winston');

const USER = 'User';

let entities;
let isType;
let jdlObject;

module.exports = {
  parse
};

/**
 * Keys of args:
 *   - jdlObject,
 *   - databaseType,
 *   - applicationType
 */
function parse(args) {
  const merged = merge(defaults(), args);
  if (!args || !merged.jdlObject || !args.databaseType) {
    throw new BuildException(
      exceptions.NullPointer,
      'The JDL object and the database type are both mandatory.');
  }
  if (merged.applicationType !== 'gateway') {
    checkNoSQLModeling(merged.jdlObject, args.databaseType);
  }
  init(merged, args.databaseType);
  initializeEntities();
  setOptions();
  fillEntities();
  return entities;
}

function init(args, databaseType, applicationType) {
  if (jdlObject) {
    resetState();
  }
  jdlObject = args.jdlObject;
  entities = {};
  if (applicationType !== 'gateway') {
    isType = () => true;
  } else {
    isType = FieldTypes.getIsType(databaseType, () => resetState());
  }
}

function resetState() {
  jdlObject = null;
  entities = null;
  isType = null;
}

function checkNoSQLModeling(passedJdlObject, passedDatabaseType) {
  if (passedJdlObject.relationships.size !== 0 && !DatabaseTypes.isSql(passedDatabaseType)) {
    throw new BuildException(
      exceptions.NoSQLModeling, 'NoSQL entities don\'t have relationships.');
  }
}


function initializeEntities() {
  for (let i = 0, entityNames = Object.keys(jdlObject.entities); i < entityNames.length; i++) {
    const entityName = entityNames[i];
    const jdlEntity = jdlObject.entities[entityName];
    /*
     * If the user adds a 'User' entity we consider it as the already
     * created JHipster User entity and none of its fields and ownerside
     * relationships will be considered.
     */
    if (entityName.toLowerCase() === USER.toLowerCase()) {
      winston.warn('Warning:  An Entity name \'User\' was used: \'User\' is an' +
        ' entity created by default by JHipster. All relationships toward' +
        ' it will be kept but any attributes and relationships from it' +
        ' will be disregarded.');
    } else {
      entities[entityName] = { // todo: make a builder/factory instead!
        fluentMethods: true,
        relationships: [],
        fields: [],
        changelogDate: dateFormatForLiquibase({ increment: i }),
        javadoc: formatComment(jdlEntity.comment),
        entityTableName: _.snakeCase(jdlEntity.tableName),
        dto: 'no',
        pagination: 'no',
        service: 'no',
        jpaMetamodelFiltering: false
      };
    }
  }
}

function setOptions() {
  const options = jdlObject.getOptions();
  for (let i = 0; i < options.length; i++) {
    const option = options[i];
    if (option.entityNames.size() === 1 && option.entityNames.has('*')) {
      option.entityNames = _.filter(
        Object.keys(jdlObject.entities),
        entityName =>
          !option.excludedNames.has(entityName) && entityName.toLowerCase() !== USER.toLowerCase()
      );
    }
    setEntityNamesOptions(option);
  }
}

function setEntityNamesOptions(option) {
  option.entityNames.forEach((entityName) => {
    switch (option.name) {
    case UnaryOptions.SKIP_CLIENT:
    case UnaryOptions.SKIP_SERVER:
      entities[entityName][option.name] = true;
      break;
    case BinaryOptions.MICROSERVICE:
      entities[entityName].microserviceName = option.value;
      break;
    case UnaryOptions.NO_FLUENT_METHOD:
      entities[entityName].fluentMethods = false;
      break;
    case BinaryOptions.ANGULAR_SUFFIX:
      entities[entityName].angularJSSuffix = option.value;
      break;
    case UnaryOptions.FILTER:
      entities[entityName].jpaMetamodelFiltering = true;
      addServiceIfNeedBe(entityName);
      break;
    default:
      entities[entityName][option.name] = option.value;
    }
  });
}

function addServiceIfNeedBe(entityName) {
  winston.info(
    `JPAMetaModelFiltering has been detected for ${entityName}, the '${serviceClassOptionValue}' `
    + 'value for the \'service\' is gonna be set for this entity if no other value has been set.');
  if (entities[entityName].service === 'no') {
    entities[entityName].service = serviceClassOptionValue;
  }
}

function defaults() {
  return {};
}

function fillEntities() {
  for (let i = 0, entityNames = Object.keys(jdlObject.entities); i < entityNames.length; i++) {
    const entityName = entityNames[i];

    if (entityName.toLowerCase() !== USER.toLowerCase()) {
      setFieldsOfEntity(entityName);
      setRelationshipOfEntity(entityName);
    }
  }
}

function setFieldsOfEntity(entityName) {
  for (let i = 0, fieldNames = Object.keys(jdlObject.entities[entityName].fields); i < fieldNames.length; i++) {
    const fieldName = fieldNames[i];
    const jdlField = jdlObject.entities[entityName].fields[fieldName];
    const fieldData = {
      fieldName: camelCase(fieldName)
    };
    const comment = formatComment(jdlField.comment);
    if (comment) {
      fieldData.javadoc = comment;
    }
    if (isType(jdlField.type)) {
      fieldData.fieldType = jdlField.type;
    }
    if (jdlObject.enums[jdlField.type]) {
      fieldData.fieldType = jdlField.type;
      fieldData.fieldValues = jdlObject.enums[jdlField.type].values.join(',');
    }
    if (fieldData.fieldType.includes('Blob')) {
      setBlobFieldData(fieldData);
    }
    setValidationsOfField(jdlField, fieldData);
    entities[entityName].fields.push(fieldData);
  }
}

function setBlobFieldData(fieldData) {
  switch (fieldData.fieldType) {
  case 'ImageBlob':
    fieldData.fieldTypeBlobContent = 'image';
    break;
  case 'Blob':
  case 'AnyBlob':
    fieldData.fieldTypeBlobContent = 'any';
    break;
  case 'TextBlob':
    fieldData.fieldTypeBlobContent = 'text';
    break;
  default:
  }
  fieldData.fieldType = 'byte[]';
}

function setValidationsOfField(jdlField, fieldData) {
  if (Object.keys(jdlField.validations).length === 0) {
    return;
  }
  fieldData.fieldValidateRules = [];
  for (let i = 0, validationNames = Object.keys(jdlField.validations); i < validationNames.length; i++) {
    const validation = jdlField.validations[validationNames[i]];
    fieldData.fieldValidateRules.push(validation.name);
    if (validation.name !== 'required') {
      fieldData[`fieldValidateRules${_.capitalize(validation.name)}`] = validation.value;
    }
  }
}

function getRelatedRelationships(entityName, relationships) {
  const relatedRelationships = {
    from: [],
    to: []
  };
  const relationshipsArray = relationships.toArray();
  for (let i = 0; i < relationshipsArray.length; i++) {
    const relationship = relationshipsArray[i];
    if (relationship.from.name === entityName) {
      relatedRelationships.from.push(relationship);
    }
    if (relationship.to.name === entityName && relationship.injectedFieldInTo) {
      relatedRelationships.to.push(relationship);
    }
  }
  return relatedRelationships;
}

/**
 * Parses the string "<relationshipName>(<otherEntityField>)"
 * @param{String} field
 * @return{Object} where 'relationshipName' is the relationship name and
 *                'otherEntityField' is the other entity field name
 */
function extractField(field) {
  const splitField = {
    otherEntityField: 'id', // id by default
    relationshipName: ''
  };
  if (field) {
    const chunks = field.replace('(', '/').replace(')', '').split('/');
    splitField.relationshipName = chunks[0];
    if (chunks.length > 1) {
      splitField.otherEntityField = chunks[1];
    }
  }
  return splitField;
}

function setRelationshipOfEntity(entityName) {
  const relatedRelationships = getRelatedRelationships(entityName, jdlObject.relationships);
  setSourceAssociationsForClass(relatedRelationships, entityName);
  setDestinationAssociationsForClass(relatedRelationships, entityName);
}

function setSourceAssociationsForClass(relatedRelationships, entityName) {
  for (let i = 0; i < relatedRelationships.from.length; i++) {
    let otherSplitField;
    let splitField;
    const relatedRelationship = relatedRelationships.from[i];
    const relationship = {
      relationshipType: _.kebabCase(relatedRelationship.type)
    };
    if (relatedRelationship.isInjectedFieldInFromRequired) {
      relationship.relationshipValidateRules = 'required';
    }
    if (relatedRelationship.commentInFrom) {
      relationship.javadoc = relatedRelationship.commentInFrom;
    }
    if (relatedRelationship.type === RelationshipTypes.ONE_TO_ONE) {
      splitField = extractField(relatedRelationship.injectedFieldInFrom);
      relationship.relationshipName = camelCase(splitField.relationshipName);
      relationship.otherEntityName = camelCase(relatedRelationship.to.name);
      relationship.otherEntityField = _.lowerFirst(splitField.otherEntityField);
      relationship.ownerSide = true;
      relationship.otherEntityRelationshipName = _.lowerFirst(relatedRelationship.injectedFieldInTo || relatedRelationship.from.name);
    } else if (relatedRelationship.type === RelationshipTypes.ONE_TO_MANY) {
      splitField = extractField(relatedRelationship.injectedFieldInFrom);
      otherSplitField = extractField(relatedRelationship.injectedFieldInTo);
      relationship.relationshipName = camelCase(splitField.relationshipName || relatedRelationship.to.name);
      relationship.otherEntityName = camelCase(relatedRelationship.to.name);
      relationship.otherEntityRelationshipName = _.lowerFirst(otherSplitField.relationshipName);
      if (!relatedRelationship.injectedFieldInTo) {
        relationship.otherEntityRelationshipName = _.lowerFirst(relatedRelationship.from.name);
        otherSplitField = extractField(relatedRelationship.injectedFieldInTo);
        const otherSideRelationship = {
          relationshipName: camelCase(relatedRelationship.from.name),
          otherEntityName: camelCase(relatedRelationship.from.name),
          relationshipType: _.kebabCase(RelationshipTypes.MANY_TO_ONE),
          otherEntityField: _.lowerFirst(otherSplitField.otherEntityField)
        };
        relatedRelationship.type = RelationshipTypes.MANY_TO_ONE;
        entities[relatedRelationship.to.name].relationships.push(otherSideRelationship);
      }
    } else if (relatedRelationship.type === RelationshipTypes.MANY_TO_ONE && relatedRelationship.injectedFieldInFrom) {
      splitField = extractField(relatedRelationship.injectedFieldInFrom);
      relationship.relationshipName = camelCase(splitField.relationshipName);
      relationship.otherEntityName = camelCase(relatedRelationship.to.name);
      relationship.otherEntityField = _.lowerFirst(splitField.otherEntityField);
    } else if (relatedRelationship.type === RelationshipTypes.MANY_TO_MANY) {
      splitField = extractField(relatedRelationship.injectedFieldInFrom);
      relationship.otherEntityRelationshipName = _.lowerFirst(extractField(relatedRelationship.injectedFieldInTo).relationshipName);
      relationship.relationshipName = camelCase(splitField.relationshipName);
      relationship.otherEntityName = camelCase(relatedRelationship.to.name);
      relationship.otherEntityField = _.lowerFirst(splitField.otherEntityField);
      relationship.ownerSide = true;
    }
    entities[entityName].relationships.push(relationship);
  }
}

function setDestinationAssociationsForClass(relatedRelationships, entityName) {
  for (let i = 0; i < relatedRelationships.to.length; i++) {
    let splitField;
    let otherSplitField;
    const relatedRelationship = relatedRelationships.to[i];
    const relationshipType = relatedRelationship.type === RelationshipTypes.ONE_TO_MANY ? RelationshipTypes.MANY_TO_ONE : relatedRelationship.type;
    const relationship = {
      relationshipType: _.kebabCase(relationshipType)
    };
    if (relatedRelationship.isInjectedFieldInToRequired) {
      relationship.relationshipValidateRules = 'required';
    }
    if (relatedRelationship.commentInTo) {
      relationship.javadoc = relatedRelationship.commentInTo;
    }
    if (relatedRelationship.type === RelationshipTypes.ONE_TO_ONE) {
      splitField = extractField(relatedRelationship.injectedFieldInTo);
      otherSplitField = extractField(relatedRelationship.injectedFieldInFrom);
      relationship.relationshipName = camelCase(splitField.relationshipName);
      relationship.otherEntityName = camelCase(relatedRelationship.from.name);
      relationship.ownerSide = false;
      relationship.otherEntityRelationshipName = _.lowerFirst(otherSplitField.relationshipName);
    } else if (relatedRelationship.type === RelationshipTypes.ONE_TO_MANY) {
      relatedRelationship.injectedFieldInTo = relatedRelationship.injectedFieldInTo || _.lowerFirst(relatedRelationship.from);
      splitField = extractField(relatedRelationship.injectedFieldInTo);
      relationship.relationshipName = camelCase(splitField.relationshipName || relatedRelationship.from.name);
      relationship.otherEntityName = camelCase(relatedRelationship.from.name);
      relationship.otherEntityField = _.lowerFirst(splitField.otherEntityField);
    } else if (relatedRelationship.type === RelationshipTypes.MANY_TO_ONE && relatedRelationship.injectedFieldInTo) {
      splitField = extractField(relatedRelationship.injectedFieldInTo);
      relationship.relationshipName = camelCase(splitField.relationshipName);
      relationship.otherEntityName = camelCase(relatedRelationship.from.name);
      relationship.relationshipType = 'one-to-many';
      otherSplitField = extractField(relatedRelationship.injectedFieldInFrom);
      relationship.otherEntityRelationshipName = _.lowerFirst(otherSplitField.relationshipName);
    } else if (relatedRelationship.type === RelationshipTypes.MANY_TO_MANY) {
      splitField = extractField(relatedRelationship.injectedFieldInTo);
      relationship.relationshipName = camelCase(splitField.relationshipName);
      relationship.otherEntityName = camelCase(relatedRelationship.from.name);
      relationship.ownerSide = false;
      relationship.otherEntityRelationshipName = _.lowerFirst(extractField(relatedRelationship.injectedFieldInFrom).relationshipName);
    }
    entities[entityName].relationships.push(relationship);
  }
}
