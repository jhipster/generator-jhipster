/**
 * Copyright 2013-2020 the original author or authors from the JHipster project.
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
const JSONEntity = require('../core/jhipster/json_entity');
const { getTableNameFromEntityName } = require('../core/jhipster/entity_table_name_creator');
const { GATEWAY } = require('../core/jhipster/application_types');
const { MANY_TO_MANY, MANY_TO_ONE, ONE_TO_MANY, ONE_TO_ONE } = require('../core/jhipster/relationship_types');
const { CASSANDRA, NO } = require('../core/jhipster/database_types');
const { formatComment } = require('../utils/format_utils');
const { formatDateForLiquibase } = require('../utils/format_utils');
const {
  FILTER,
  NO_FLUENT_METHOD,
  READ_ONLY,
  EMBEDDED,
  SKIP_CLIENT,
  SKIP_SERVER
} = require('../core/jhipster/unary_options');
const { UNIQUE, REQUIRED } = require('../core/jhipster/validations');
const { JPA_DERIVED_IDENTIFIER } = require('../core/jhipster/relationship_options');
const BinaryOptions = require('../core/jhipster/binary_options');

const {
  Options: { ANGULAR_SUFFIX, MICROSERVICE, SEARCH, DTO }
} = BinaryOptions;
const serviceClassOptionValue = BinaryOptions.Values.service.SERVICE_CLASS;

const USER = 'User';
const AUTHORITY = 'Authority';

let entities;
let jdlObject;

module.exports = {
  parse
};

/**
 * @deprecated
 * Deprecated, use JDLWithoutApplicationToJSONConverter or JDLWithApplicationsToJSONConverter instead.
 * Converts a JDLObject to ready-to-be exported JSON entities.
 * @param {Object} args - the configuration object, keys:
 * @param {JDLObject} args.jdlObject - the JDLObject to convert to JSON
 * @param {String} args.baseName - the application's name
 * @param {String} args.databaseType - the database type
 * @param {applicationType} args.applicationType - the application's type
 * @param {Date} args.creationTimestamp - the creation timestamp, for entities
 * @returns {Object} entities that can be exported to JSON
 */
function parse(args = {}) {
  if (!args.jdlObject || !args.databaseType) {
    throw new Error('The JDL object and the database type are both mandatory.');
  }
  if (args.applicationType !== GATEWAY) {
    checkNoSQLModeling({
      applicationName: args.baseName,
      jdlObject: args.jdlObject,
      applicationDatabaseType: args.databaseType
    });
  }
  init(args);
  initializeEntities(args.creationTimestamp);
  setOptions();
  fillEntities();
  setApplicationToEntities();
  return entities;
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
}

function resetState() {
  jdlObject = null;
  entities = null;
}

function initializeEntities(creationTimestamp = new Date()) {
  jdlObject.forEachEntity((jdlEntity, index) => {
    const entityName = jdlEntity.name;
    const builtInEntities = [USER.toLowerCase(), AUTHORITY.toLowerCase()];
    /*
     * If the user adds a 'User' entity we consider it as the already
     * created JHipster User entity and none of its fields and owner-side
     * relationships will be considered.
     */
    if (builtInEntities.includes(entityName.toLowerCase())) {
      logger.warn(
        `An Entity name '${entityName}' was used: '${entityName}' is an entity created by default by JHipster.` +
          ' All relationships toward  it will be kept but any attributes and relationships from it will be disregarded.'
      );
      return;
    }
    entities[entityName] = new JSONEntity({
      entityName,
      entityTableName: getTableNameFromEntityName(jdlEntity.tableName),
      changelogDate: formatDateForLiquibase({ date: new Date(creationTimestamp), increment: index + 1 }),
      javadoc: formatComment(jdlEntity.comment)
    });
  });
}

function setOptions() {
  jdlObject.forEachOption(jdlOption => {
    if (jdlOption.entityNames.size === 1 && jdlOption.entityNames.has('*')) {
      jdlOption.setEntityNames(
        jdlObject
          .getEntityNames()
          .filter(
            entityName => !jdlOption.excludedNames.has(entityName) && entityName.toLowerCase() !== USER.toLowerCase()
          )
      );
    }
    setEntityNamesOptions(jdlOption);
  });
}

function setEntityNamesOptions(jdlOption) {
  jdlOption.entityNames.forEach(entityName => {
    switch (jdlOption.name) {
      case SKIP_CLIENT:
      case SKIP_SERVER:
      case READ_ONLY:
      case EMBEDDED:
        entities[entityName][jdlOption.name] = true;
        break;
      case DTO:
        entities[entityName][jdlOption.name] = jdlOption.value;
        logger.info(
          `The DTO jdlOption has been detected to be set for ${entityName}, the '${serviceClassOptionValue}' ` +
            "value for the 'service' is gonna be set for this entity if no other value has been set."
        );
        if (entities[entityName].service === 'no') {
          entities[entityName].service = serviceClassOptionValue;
        }
        break;
      case MICROSERVICE:
        entities[entityName].microserviceName = jdlOption.value;
        break;
      case NO_FLUENT_METHOD:
        entities[entityName].fluentMethods = false;
        break;
      case ANGULAR_SUFFIX:
        entities[entityName].angularJSSuffix = jdlOption.value;
        break;
      case SEARCH:
        entities[entityName].searchEngine = jdlOption.value;
        break;
      case FILTER:
        entities[entityName].jpaMetamodelFiltering = true;
        logger.info(
          `JPAMetaModelFiltering has been detected for ${entityName}, the '${serviceClassOptionValue}' ` +
            "value for the 'service' is gonna be set for this entity if no other value has been set."
        );
        if (entities[entityName].service === 'no') {
          entities[entityName].service = serviceClassOptionValue;
        }
        break;
      default:
        entities[entityName][jdlOption.name] = jdlOption.value || true;
    }
  });
  jdlOption.excludedNames.forEach(entityName => {
    if (jdlOption.name === SEARCH) {
      entities[entityName].searchEngine = false;
    }
  });
}

function fillEntities() {
  jdlObject.forEachEntity(entity => {
    if (entity.name.toLowerCase() !== USER.toLowerCase()) {
      setFieldsOfEntity(entity.name);
      setRelationshipOfEntity(entity.name);
    }
  });
}

function setFieldsOfEntity(entityName) {
  jdlObject.getEntity(entityName).forEachField(jdlField => {
    const fieldData = {
      fieldName: camelCase(jdlField.name)
    };
    const comment = formatComment(jdlField.comment);
    if (comment) {
      fieldData.javadoc = comment;
    }
    fieldData.fieldType = jdlField.type;
    if (jdlObject.getEnum(jdlField.type)) {
      fieldData.fieldType = jdlField.type;
      fieldData.fieldValues = jdlObject.getEnum(jdlField.type).getValuesAsString();
    }
    if (fieldData.fieldType && fieldData.fieldType.includes('Blob')) {
      setBlobFieldData(fieldData);
    }
    if (!fieldData.fieldType) {
      throw new Error(
        `No valid field type could be resolved for field '${fieldData.fieldName}' of ` +
          `entity '${entityName}', got '${jdlField.type}'.`
      );
    }
    setValidationsOfField(jdlField, fieldData);
    setOptionsForField(jdlField, fieldData);
    entities[entityName].addField(fieldData);
  });
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
  if (jdlField.validationQuantity() === 0) {
    return;
  }
  fieldData.fieldValidateRules = [];
  jdlField.forEachValidation(validation => {
    fieldData.fieldValidateRules.push(validation.name);
    if (validation.name !== REQUIRED && validation.name !== UNIQUE) {
      fieldData[`fieldValidateRules${_.capitalize(validation.name)}`] = validation.value;
    }
  });
}

function setOptionsForField(jdlField, fieldData) {
  if (jdlField.optionQuantity() === 0) {
    return;
  }
  fieldData.options = {};
  jdlField.forEachOption(([key, value]) => {
    fieldData.options[key] = value;
  });
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
      if (!relatedRelationship.injectedFieldInTo) {
        relationship.otherEntityRelationshipName = lowerFirst(relatedRelationship.from);
        const otherSideRelationship = {
          relationshipName: camelCase(relatedRelationship.from),
          otherEntityName: camelCase(relatedRelationship.from),
          relationshipType: _.kebabCase(MANY_TO_MANY),
          otherEntityField: lowerFirst(otherSplitField.otherEntityField),
          otherEntityRelationshipName: lowerFirst(relatedRelationship.to),
          ownerSide: false
        };
        relatedRelationship.type = MANY_TO_MANY;
        if (
          relatedRelationship.to.toLowerCase() !== USER.toLowerCase() &&
          relatedRelationship.to.toLowerCase() !== AUTHORITY.toLowerCase()
        ) {
          entities[relatedRelationship.to].addRelationship(otherSideRelationship);
        }
      }
      relationship.ownerSide = true;
    }
    setOptionsForRelationship(relatedRelationship, relationship);
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
    setOptionsForRelationship(relatedRelationship, relationship);
    entities[entityName].addRelationship(relationship);
  });
}

function setOptionsForRelationship(relatedRelationship, relationship) {
  if (relatedRelationship.options) {
    Object.entries(relatedRelationship.options).forEach(([key, value]) => {
      if (key === JPA_DERIVED_IDENTIFIER) {
        if (relationship.ownerSide) {
          relationship.useJPADerivedIdentifier = value;
        }
      } else {
        if (!relationship.options) {
          relationship.options = {};
        }
        relationship.options[key] = value;
      }
    });
  }
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
    const baseName = jdlApplication.getConfigurationOptionValue('baseName');
    jdlApplication.forEachEntityName(entity => {
      entities[entity].applications.push(baseName);
    });
  });
}
