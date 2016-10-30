'use strict';

const fs = require('fs'),
    _ = require('lodash'),
    camelCase = require('../utils/string_utils').camelCase,
    merge = require('../utils/object_utils').merge,
    FieldTypes = require('../core/jhipster/field_types'),
    RelationshipTypes = require('../core/jhipster/relationship_types').RELATIONSHIP_TYPES,
    DatabaseTypes = require('../core/jhipster/database_types'),
    formatComment = require('../utils/format_utils').formatComment,
    dateFormatForLiquibase = require('../utils/format_utils').dateFormatForLiquibase,
    UnaryOptions = require('../core/jhipster/unary_options').UNARY_OPTIONS,
    BinaryOptions = require('../core/jhipster/binary_options').BINARY_OPTIONS,
    buildException = require('../exceptions/exception_factory').buildException,
    exceptions = require('../exceptions/exception_factory').exceptions;

const USER = 'User';

var entities;
var isType;
var jdlObject;

module.exports = {
  parse: parse
};

/**
 * Keys of args:
 *   - jdlObject,
 *   - databaseType,
 */
function parse(args) {
  var merged = merge(defaults(), args);
  if (!args || !merged.jdlObject || !args.databaseType) {
    throw new buildException(
        exceptions.NullPointer,
        'The JDL object and the database type are both mandatory.');
  }
  checkNoSQLModeling(merged.jdlObject, args.databaseType);
  init(merged, args.databaseType);
  initializeEntities();
  setOptions();
  fillEntities();
  return entities;
}

function init(args, databaseType) {
  if (jdlObject) {
    resetState();
  }
  jdlObject = args.jdlObject;
  entities = {};
  isType = FieldTypes.getIsType(databaseType, function () {
    resetState();
  });
}

function resetState() {
  jdlObject = null;
  entities = null;
  isType = null;
}

function checkNoSQLModeling(passedJdlObject, passedDatabaseType) {
  if (passedJdlObject.relationships.size !== 0 && !DatabaseTypes.isSql(passedDatabaseType)) {
    throw new buildException(
        exceptions.NoSQLModeling, "NoSQL entities don't have relationships.");
  }
}


function initializeEntities() {
  for (let i = 0, entityNames = Object.keys(jdlObject.entities); i < entityNames.length; i++) {
    let entityName = entityNames[i],
    jdlEntity = jdlObject.entities[entityName];
    /*
     * If the user adds a 'User' entity we consider it as the already
     * created JHipster User entity and none of its fields and ownerside
     * relationships will be considered.
     */
    if (entityName.toLowerCase() === USER.toLowerCase()) {
      console.warn("Warning:  An Entity name 'User' was used: 'User' is an" +
        ' entity created by default by JHipster. All relationships toward' +
        ' it will be kept but any attributes and relationships from it' +
        ' will be disregarded.');
    } else {
      entities[entityName] = { // todo: make a builder/factory instead!
        fluentMethods: true,
        relationships: [],
        fields: [],
        changelogDate: dateFormatForLiquibase(i),
        javadoc: formatComment(jdlEntity.comment),
        entityTableName: _.snakeCase(jdlEntity.tableName),
        dto: 'no',
        pagination: 'no',
        service: 'no'
      };
    }
  }
}

function setOptions() {
  for (let i = 0; i < jdlObject.options.length; i++) {
    let option = jdlObject.options[i];
    if (option.getType() === 'UNARY' && option.name !== UnaryOptions.NO_FLUENT_METHOD) {
      continue;
    }
    if (option.entityNames.size() === 1 && option.entityNames.has('*')) {
      option.entityNames = Object.keys(jdlObject.entities).filter(function (entityName) {
        return !option.excludedNames.has(entityName) && entityName.toLowerCase() !== USER.toLowerCase();
      });
    }
    option.entityNames.forEach(function (entityName) {
      if (option.name === BinaryOptions.MICROSERVICE) {
        entities[entityName]['microserviceName'] = option.value;
      } else if (option.name === UnaryOptions.NO_FLUENT_METHOD) {
        entities[entityName]['fluentMethods'] = false;
      } else if (option.name === BinaryOptions.ANGULAR_SUFFIX) {
        entities[entityName]['angularJSSuffix'] = option.value;
      } else {
        entities[entityName][option.name] = option.value;
      }
    });
  }
}

function defaults() {
  return {};
}

function fillEntities() {
  for (let i = 0, entityNames = Object.keys(jdlObject.entities); i < entityNames.length; i++) {
    let entityName = entityNames[i];

    if (entityName.toLowerCase() !== USER.toLowerCase()) {
      setFieldsOfEntity(entityName);
      setRelationshipOfEntity(entityName);
    }
  }
}

function setFieldsOfEntity(entityName) {
  for (let i = 0, fieldNames = Object.keys(jdlObject.entities[entityName].fields); i < fieldNames.length; i++) {
    let fieldName = fieldNames[i],
    jdlField = jdlObject.entities[entityName].fields[fieldName];
    let fieldData = {
      fieldName: camelCase(fieldName)
    };
    let comment = formatComment(jdlField.comment);
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
    if (fieldData.fieldType === 'ImageBlob') {
      fieldData.fieldType = 'byte[]';
      fieldData.fieldTypeBlobContent = 'image';
    } else if (fieldData.fieldType === 'Blob' || fieldData.fieldType === 'AnyBlob') {
      fieldData.fieldType = 'byte[]';
      fieldData.fieldTypeBlobContent = 'any';
    } else if (fieldData.fieldType === 'TextBlob') {
      fieldData.fieldType = 'byte[]';
      fieldData.fieldTypeBlobContent = 'text';
    }
    setValidationsOfField(jdlField, fieldData);
    entities[entityName].fields.push(fieldData);
  }
}

function setValidationsOfField(jdlField, fieldData) {
  if (Object.keys(jdlField.validations).length === 0) {
    return;
  }
  fieldData.fieldValidateRules = [];
  for (let i = 0, validationNames = Object.keys(jdlField.validations); i < validationNames.length; i++) {
    let validation = jdlField.validations[validationNames[i]];
    fieldData.fieldValidateRules.push(validation.name);
    if (validation.name !== 'required') {
      fieldData[`fieldValidateRules${_.capitalize(validation.name)}`] = validation.value;
    }
  }
}

function getRelatedRelationships(entityName, relationships) {
  var relatedRelationships = {
    from: [],
    to: []
  };
  var relationshipsArray = relationships.toArray();
  for (let i = 0; i < relationshipsArray.length; i++) {
    let relationship = relationshipsArray[i];
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
  var splitField = {
    otherEntityField: 'id', // id by default
    relationshipName: ''
  };
  if (field) {
    var chunks = field.replace('(', '/').replace(')', '').split('/');
    splitField.relationshipName = chunks[0];
    if (chunks.length > 1) {
      splitField.otherEntityField = chunks[1];
    }
  }
  return splitField;
}

function setRelationshipOfEntity(entityName) {
  var relatedRelationships = getRelatedRelationships(entityName, jdlObject.relationships);
  setSourceAssociationsForClass(relatedRelationships, entityName);
  setDestinationAssociationsForClass(relatedRelationships, entityName);
}

function setSourceAssociationsForClass(relatedRelationships, entityName) {
  for (let i = 0; i < relatedRelationships.from.length; i++) {
    let otherSplitField;
    let splitField;
    let relatedRelationship = relatedRelationships.from[i];
    let relationship = {
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
        let otherSideRelationship = {
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
    let relatedRelationship = relatedRelationships.to[i];
    let relationshipType = relatedRelationship.type === RelationshipTypes.ONE_TO_MANY ? RelationshipTypes.MANY_TO_ONE : relatedRelationship.type;
    let relationship = {
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
