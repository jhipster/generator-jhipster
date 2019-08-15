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

const _ = require('lodash');
const logger = require('../utils/objects/logger');
const { camelCase, lowerFirst } = require('../utils/string_utils');
const merge = require('../utils/object_utils').merge;
const JSONEntity = require('../core/jhipster/json_entity');
const { GATEWAY } = require('../core/jhipster/application_types');
const FieldTypes = require('../core/jhipster/field_types');
const { MANY_TO_MANY, MANY_TO_ONE, ONE_TO_MANY, ONE_TO_ONE } = require('../core/jhipster/relationship_types');
const { CASSANDRA, NO } = require('../core/jhipster/database_types');
const formatComment = require('../utils/format_utils').formatComment;
const dateFormatForLiquibase = require('../utils/format_utils').dateFormatForLiquibase;
const { FILTER, NO_FLUENT_METHOD, SKIP_CLIENT, SKIP_SERVER } = require('../core/jhipster/unary_options');
const {
  Options: { ANGULAR_SUFFIX, MICROSERVICE, SEARCH_ENGINE, DTO }
} = require('../core/jhipster/binary_options');
const { UNIQUE, REQUIRED } = require('../core/jhipster/validations');
const serviceClassOptionValue = require('../core/jhipster/binary_options').Values.service.SERVICE_CLASS;
const { JPA_DERIVED_IDENTIFIER } = require('../core/jhipster/relationship_options');

const USER = 'User';

let entities;
let isType;
let jdlObject;

module.exports = {
  parse
};

/**
 * Converts a JDLObject to ready-to-be exported JSON entities.
 * @param args the configuration object, keys:
 *        - jdlObject, the JDLObject to convert to JSON
 *        - databaseType
 *        - applicationType
 * @returns {*} entities that can be exported to JSON.
 */
function parse(args) {
  const merged = merge(defaults(), args);
  if (!args || !merged.jdlObject || !args.databaseType) {
    throw new Error('The JDL object and the database type are both mandatory.');
  }
  if (merged.applicationType !== GATEWAY) {
    checkNoSQLModeling({
      applicationName: args.baseName,
      jdlObject: merged.jdlObject,
      applicationDatabaseType: args.databaseType
    });
  }
  init(merged);
  initializeEntities();
  setOptions();
  fillEntities();
  setApplicationToEntities();
  return entities;
}

function defaults() {
  return {};
}

function checkNoSQLModeling({ applicationName, jdlObject, applicationDatabaseType }) {
  if (applicationDatabaseType === NO) {
    return;
  }
  if (applicationDatabaseType === CASSANDRA && jdlObject.getRelationshipQuantity(applicationName) !== 0) {
    throw new Error("Cassandra entities don't have relationships.");
  }
}

function init(args) {
  if (jdlObject) {
    resetState();
  }
  jdlObject = args.jdlObject;
  entities = {};
  if (args.applicationType === GATEWAY) {
    isType = () => true;
  } else {
    isType = FieldTypes.getIsType(args.databaseType, () => resetState());
  }
}

function resetState() {
  jdlObject = null;
  entities = null;
  isType = null;
}

function initializeEntities() {
  for (let i = 0, entityNames = jdlObject.getEntityNames(); i < entityNames.length; i++) {
    const entityName = entityNames[i];
    const jdlEntity = jdlObject.getEntity(entityName);
    /*
     * If the user adds a 'User' entity we consider it as the already
     * created JHipster User entity and none of its fields and ownerside
     * relationships will be considered.
     */
    if (entityName.toLowerCase() === USER.toLowerCase()) {
      logger.warn(
        "An Entity name 'User' was used: 'User' is an" +
          ' entity created by default by JHipster. All relationships toward' +
          ' it will be kept but any attributes and relationships from it' +
          ' will be disregarded.'
      );
    } else {
      entities[entityName] = new JSONEntity({
        entityName,
        entityTableName: _.snakeCase(jdlEntity.tableName),
        changelogDate: dateFormatForLiquibase({ increment: i }),
        javadoc: formatComment(jdlEntity.comment)
      });
    }
  }
}

function setOptions() {
  const options = jdlObject.getOptions();
  for (let i = 0; i < options.length; i++) {
    const option = options[i];
    if (option.entityNames.size === 1 && option.entityNames.has('*')) {
      option.setEntityNames(
        jdlObject
          .getEntityNames()
          .filter(
            entityName => !option.excludedNames.has(entityName) && entityName.toLowerCase() !== USER.toLowerCase()
          )
      );
    }
    setEntityNamesOptions(option);
  }
}

function setEntityNamesOptions(option) {
  option.entityNames.forEach(entityName => {
    switch (option.name) {
      case SKIP_CLIENT:
      case SKIP_SERVER:
        entities[entityName][option.name] = true;
        break;
      case DTO:
        entities[entityName][option.name] = option.value;
        addServiceIfNeedBe(
          entityName,
          `The DTO option has been detected to be set for ${entityName}, the '${serviceClassOptionValue}' ` +
            "value for the 'service' is gonna be set for this entity if no other value has been set."
        );
        break;
      case MICROSERVICE:
        entities[entityName].microserviceName = option.value;
        break;
      case NO_FLUENT_METHOD:
        entities[entityName].fluentMethods = false;
        break;
      case ANGULAR_SUFFIX:
        entities[entityName].angularJSSuffix = option.value;
        break;
      case FILTER:
        entities[entityName].jpaMetamodelFiltering = true;
        addServiceIfNeedBe(
          entityName,
          `JPAMetaModelFiltering has been detected for ${entityName}, the '${serviceClassOptionValue}' ` +
            "value for the 'service' is gonna be set for this entity if no other value has been set."
        );
        break;
      default:
        entities[entityName][option.name] = option.value;
    }
  });
  option.excludedNames.forEach(entityName => {
    if (option.name === SEARCH_ENGINE) {
      entities[entityName].searchEngine = false;
    }
  });
}

function addServiceIfNeedBe(entityName, message) {
  logger.info(message);
  if (entities[entityName].service === 'no') {
    entities[entityName].service = serviceClassOptionValue;
  }
}

function fillEntities() {
  for (let i = 0, entityNames = jdlObject.getEntityNames(); i < entityNames.length; i++) {
    const entityName = entityNames[i];

    if (entityName.toLowerCase() !== USER.toLowerCase()) {
      setFieldsOfEntity(entityName);
      setRelationshipOfEntity(entityName);
    }
  }
}

function setFieldsOfEntity(entityName) {
  for (let i = 0, fieldNames = Object.keys(jdlObject.getEntity(entityName).fields); i < fieldNames.length; i++) {
    const fieldName = fieldNames[i];
    const jdlField = jdlObject.getEntity(entityName).fields[fieldName];
    const fieldData = {
      fieldName: camelCase(fieldName)
    };
    const comment = formatComment(jdlField.comment);
    if (comment) {
      fieldData.javadoc = comment;
    }
    if (jdlObject.isEntityInMicroservice(entityName) || isType(jdlField.type)) {
      fieldData.fieldType = jdlField.type;
    }
    if (jdlObject.getEnum(jdlField.type)) {
      fieldData.fieldType = jdlField.type;
      fieldData.fieldValues = jdlObject.getEnum(jdlField.type).getValuesAsString();
    }
    if (fieldData.fieldType && fieldData.fieldType.includes('Blob')) {
      setBlobFieldData(fieldData);
    }
    if (!fieldData.fieldType) {
      throw new Error(
        `No valable field type could be resolved for field '${fieldData.fieldName}' of ` +
          `entity '${entityName}', got '${jdlField.type}'.`
      );
    }
    setValidationsOfField(jdlField, fieldData);
    entities[entityName].addField(fieldData);
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
    if (validation.name !== REQUIRED && validation.name !== UNIQUE) {
      fieldData[`fieldValidateRules${_.capitalize(validation.name)}`] = validation.value;
    }
  }
}

function setRelationshipOfEntity(entityName) {
  const relatedRelationships = getRelatedRelationships(entityName, jdlObject.relationships);
  setSourceAssociationsForClass(relatedRelationships, entityName);
  setDestinationAssociationsForClass(relatedRelationships, entityName);
}

function getRelatedRelationships(entityName, relationships) {
  const relatedRelationships = {
    from: [],
    to: []
  };
  relationships.forEach(jdlRelationship => {
    if (jdlRelationship.from === entityName) {
      relatedRelationships.from.push(jdlRelationship);
    }
    if (jdlRelationship.to === entityName && jdlRelationship.injectedFieldInTo) {
      relatedRelationships.to.push(jdlRelationship);
    }
  });
  return relatedRelationships;
}

function setSourceAssociationsForClass(relatedRelationships, entityName) {
  relatedRelationships.from.forEach(relatedRelationship => {
    const otherSplitField = extractField(relatedRelationship.injectedFieldInTo);
    const relationship = {
      relationshipType: _.kebabCase(relatedRelationship.type),
      otherEntityName: camelCase(relatedRelationship.to),
      otherEntityRelationshipName: lowerFirst(otherSplitField.relationshipName) || camelCase(relatedRelationship.from)
    };
    if (relatedRelationship.isInjectedFieldInFromRequired) {
      relationship.relationshipValidateRules = REQUIRED;
    }
    if (relatedRelationship.commentInFrom) {
      relationship.javadoc = relatedRelationship.commentInFrom;
    }
    const splitField = extractField(relatedRelationship.injectedFieldInFrom);
    if (relatedRelationship.type === ONE_TO_ONE) {
      relationship.relationshipName = camelCase(splitField.relationshipName) || camelCase(relatedRelationship.to);
      relationship.otherEntityField = lowerFirst(splitField.otherEntityField);
      relationship.ownerSide = true;
      if (relatedRelationship.options.has(JPA_DERIVED_IDENTIFIER)) {
        relationship.useJPADerivedIdentifier = true;
      }
    } else if (relatedRelationship.type === ONE_TO_MANY) {
      relationship.relationshipName = camelCase(splitField.relationshipName || relatedRelationship.to);
      if (!relatedRelationship.injectedFieldInTo) {
        relationship.otherEntityRelationshipName = lowerFirst(relatedRelationship.from);
        const otherSideRelationship = {
          relationshipName: camelCase(relatedRelationship.from),
          otherEntityName: camelCase(relatedRelationship.from),
          relationshipType: _.kebabCase(MANY_TO_ONE),
          otherEntityField: lowerFirst(otherSplitField.otherEntityField)
        };
        relatedRelationship.type = MANY_TO_ONE;
        entities[relatedRelationship.to].addRelationship(otherSideRelationship);
      }
    } else if (relatedRelationship.type === MANY_TO_ONE && relatedRelationship.injectedFieldInFrom) {
      relationship.relationshipName = camelCase(splitField.relationshipName);
      relationship.otherEntityField = lowerFirst(splitField.otherEntityField);
    } else if (relatedRelationship.type === MANY_TO_MANY) {
      relationship.relationshipName = camelCase(splitField.relationshipName || relatedRelationship.to);
      relationship.otherEntityField = lowerFirst(splitField.otherEntityField);

      relationship.ownerSide = true;
    }
    entities[entityName].addRelationship(relationship);
  });
}

function setDestinationAssociationsForClass(relatedRelationships, entityName) {
  relatedRelationships.to.forEach(relatedRelationship => {
    const relationshipType = relatedRelationship.type === ONE_TO_MANY ? MANY_TO_ONE : relatedRelationship.type;
    const otherSplitField = extractField(relatedRelationship.injectedFieldInFrom);
    const relationship = {
      relationshipType: _.kebabCase(relationshipType),
      otherEntityName: camelCase(relatedRelationship.from),
      otherEntityRelationshipName: lowerFirst(otherSplitField.relationshipName) || camelCase(relatedRelationship.to)
    };
    if (relatedRelationship.isInjectedFieldInToRequired) {
      relationship.relationshipValidateRules = REQUIRED;
    }
    if (relatedRelationship.commentInTo) {
      relationship.javadoc = relatedRelationship.commentInTo;
    }
    const splitField = extractField(relatedRelationship.injectedFieldInTo);
    if (relatedRelationship.type === ONE_TO_ONE) {
      relationship.relationshipName = camelCase(splitField.relationshipName);
      relationship.ownerSide = false;
    } else if (relatedRelationship.type === ONE_TO_MANY) {
      relatedRelationship.injectedFieldInTo =
        relatedRelationship.injectedFieldInTo || lowerFirst(relatedRelationship.from);
      relationship.relationshipName = camelCase(splitField.relationshipName || relatedRelationship.from);
      relationship.otherEntityField = lowerFirst(splitField.otherEntityField);
    } else if (relatedRelationship.type === MANY_TO_ONE && relatedRelationship.injectedFieldInTo) {
      relationship.relationshipName = camelCase(splitField.relationshipName);
      relationship.relationshipType = 'one-to-many';
    } else if (relatedRelationship.type === MANY_TO_MANY) {
      relationship.relationshipName = camelCase(splitField.relationshipName);
      relationship.otherEntityField = lowerFirst(splitField.otherEntityField);
      relationship.ownerSide = false;
    }
    entities[entityName].addRelationship(relationship);
  });
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
    const chunks = field
      .replace('(', '/')
      .replace(')', '')
      .split('/');
    splitField.relationshipName = chunks[0];
    if (chunks.length > 1) {
      splitField.otherEntityField = chunks[1];
    }
  }
  return splitField;
}

function setApplicationToEntities() {
  if (jdlObject.getApplicationQuantity() === 0) {
    makeEntitiesBeGeneratedEverywhere();
    return;
  }
  makeEntitiesBeGeneratedInSomeApplications();
}

function makeEntitiesBeGeneratedEverywhere() {
  Object.keys(entities).forEach(entityName => {
    entities[entityName].applications = '*';
  });
}

function makeEntitiesBeGeneratedInSomeApplications() {
  jdlObject.forEachApplication(jdlApplication => {
    jdlApplication.forEachEntityName(entity => {
      entities[entity].applications.push(jdlApplication.config.baseName);
    });
  });
}
