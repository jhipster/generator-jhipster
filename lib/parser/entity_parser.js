'use strict';

const fs = require('fs'),
    _ = require('lodash'),
    merge = require('../utils/object_utils').merge,
    FieldTypes = require('../core/jhipster/field_types'),
    RelationshipTypes = require('../core/jhipster/relationship_types').RELATIONSHIP_TYPES,
    DatabaseTypes = require('../core/jhipster/database_types').Types,
    formatComment = require('../utils/format_utils').formatComment,
    dateFormatForLiquibase = require('../utils/format_utils').dateFormatForLiquibase,
    buildException = require('../exceptions/exception_factory').buildException,
    exceptions = require('../exceptions/exception_factory').exceptions;

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
  switch (databaseType) { // todo: make a method from this code!
    case 'sql':
      isType = FieldTypes.isSQLType;
      break;
    case 'mongodb':
      isType = FieldTypes.isMongoDBType;
      break;
    case 'cassandra':
      isType = FieldTypes.isCassandraType;
      break;
    default:
      resetState();
      throw new buildException(
          exceptions.IllegalArgument,
          "The passed database type must either be 'sql', 'mongodb', or 'cassandra'");
  }
}

function resetState() {
  jdlObject = null;
  entities = null;
  isType = null;
}

function checkNoSQLModeling(passedJdlObject, passedDatabaseType) {
  if (passedJdlObject.relationships.size !== 0 && passedDatabaseType !== DatabaseTypes.sql) {
    throw new buildException(
        exceptions.NoSQLModeling, "NoSQL entities don't have relationships.");
  }
}


function initializeEntities() {
  for (let i = 0, entityNames = Object.keys(jdlObject.entities); i < entityNames.length; i++) {
    entities[entityNames[i]] = { // todo: make a builder/factory instead!
      relationships: [],
      fields: [],
      changelogDate: dateFormatForLiquibase(i),
      javadoc: formatComment(jdlObject.entities[entityNames[i]].comment),
      entityTableName: _.snakeCase(jdlObject.entities[entityNames[i]].tableName),
      dto: 'no',
      pagination: 'no',
      service: 'no'
    };
  }
}

function setOptions() {
  for (let i = 0; i < jdlObject.options.length; i++) {
    let option = jdlObject.options[i];
    if (option.getType() === 'UNARY') {
      continue;
    }
    if (option.entityNames.size() === 1 && option.entityNames.has('*')) {
      option.entityNames = Object.keys(jdlObject.entities).filter(function (entityName) {
        return !option.excludedNames.has(entityName);
      });
    }
    option.entityNames.forEach(function (entityName) {
      entities[entityName][option.name] = option.value;
    });
  }
}

function defaults() {
  return {};
}

function fillEntities() {
  for (let i = 0, entityNames = Object.keys(jdlObject.entities); i < entityNames.length; i++) {
    setFieldsOfEntity(entityNames[i]);
    setRelationshipOfEntity(entityNames[i]);
  }
}

function setFieldsOfEntity(entityName) {
  for (let i = 0, fieldNames = Object.keys(jdlObject.entities[entityName].fields); i < fieldNames.length; i++) {
    let jdlField = jdlObject.entities[entityName].fields[fieldNames[i]];
    let fieldData = {
      fieldName: _.camelCase(fieldNames[i])
    };
    let comment = formatComment(jdlField.comment);
    if (comment) {
      fieldData.comment = comment;
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
    if (relationshipsArray[i].from.name === entityName) {
      relatedRelationships.from.push(relationshipsArray[i]);
    }
    if (relationshipsArray[i].to.name === entityName && relationshipsArray[i].injectedFieldInTo) {
      relatedRelationships.to.push(relationshipsArray[i]);
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
      relationshipType: relatedRelationship.type
    };
    if (relatedRelationship.isInjectedFieldInFromRequired) {
      relationship.relationshipValidateRules = 'required';
    }
    if (relatedRelationship.type === RelationshipTypes.ONE_TO_ONE) {
      splitField = extractField(relatedRelationship.injectedFieldInFrom);
      relationship.relationshipName = _.camelCase(splitField.relationshipName);
      relationship.otherEntityName = _.lowerFirst(_.camelCase(relatedRelationship.to.name));
      relationship.otherEntityField = _.lowerFirst(splitField.otherEntityField);
      relationship.ownerSide = true;
      relationship.otherEntityRelationshipName = _.lowerFirst(relatedRelationship.injectedFieldInTo || relatedRelationship.from.name);
    } else if (relatedRelationship.type === RelationshipTypes.ONE_TO_MANY) {
      splitField = extractField(relatedRelationship.injectedFieldInFrom);
      otherSplitField = extractField(relatedRelationship.injectedFieldInTo);
      relationship.relationshipName = _.lowerFirst(_.camelCase(splitField.relationshipName || relatedRelationship.to.name));
      relationship.otherEntityName = _.lowerFirst(_.camelCase(relatedRelationship.to.name));
      relationship.otherEntityRelationshipName = _.lowerFirst(otherSplitField.relationshipName);
      if (!relatedRelationship.injectedFieldInTo) {
        relationship.otherEntityRelationshipName = _.lowerFirst(relatedRelationship.from.name);
        otherSplitField = extractField(relatedRelationship.injectedFieldInTo);
        let otherSideRelationship = {
          relationshipName: _.camelCase(_.lowerFirst(relatedRelationship.from.name)),
          otherEntityName: _.lowerFirst(_.camelCase(relatedRelationship.from.name)),
          relationshipType: RelationshipTypes.MANY_TO_ONE,
          otherEntityField: _.lowerFirst(otherSplitField.otherEntityField)
        };
        relatedRelationship.type = RelationshipTypes.MANY_TO_ONE;
        entities[relatedRelationship.to.name].relationships.push(otherSideRelationship);
      }
    } else if (relatedRelationship.type === RelationshipTypes.MANY_TO_ONE && relatedRelationship.injectedFieldInFrom) {
      splitField = extractField(relatedRelationship.injectedFieldInFrom);
      relationship.relationshipName = _.camelCase(splitField.relationshipName);
      relationship.otherEntityName = _.lowerFirst(_.camelCase(relatedRelationship.to.name));
      relationship.otherEntityField = _.lowerFirst(splitField.otherEntityField);
    } else if (relatedRelationship.type === RelationshipTypes.MANY_TO_MANY) {
      splitField = extractField(relatedRelationship.injectedFieldInFrom);
      relationship.relationshipName = _.camelCase(splitField.relationshipName);
      relationship.otherEntityName = _.lowerFirst(_.camelCase(relatedRelationship.to.name));
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
    let relationship = {
      relationshipType: (relatedRelationship.type === RelationshipTypes.ONE_TO_MANY ? RelationshipTypes.MANY_TO_ONE : relatedRelationship.type)
    };
    if (relatedRelationship.isInjectedFieldInToRequired) {
      relationship.relationshipValidateRules = 'required';
    }
    if (relatedRelationship.type === RelationshipTypes.ONE_TO_ONE) {
      splitField = extractField(relatedRelationship.injectedFieldInTo);
      otherSplitField = extractField(relatedRelationship.injectedFieldInFrom);
      relationship.relationshipName = _.camelCase(splitField.relationshipName);
      relationship.otherEntityName = _.lowerFirst(_.camelCase(relatedRelationship.from.name));
      relationship.ownerSide = false;
      relationship.otherEntityRelationshipName = _.lowerFirst(otherSplitField.relationshipName);
    } else if (relatedRelationship.type === RelationshipTypes.ONE_TO_MANY) {
      relatedRelationship.injectedFieldInTo = relatedRelationship.injectedFieldInTo || _.lowerFirst(relatedRelationship.from);
      splitField = extractField(relatedRelationship.injectedFieldInTo);
      relationship.relationshipName = _.lowerFirst(_.camelCase(splitField.relationshipName || relatedRelationship.from.name));
      relationship.otherEntityName = _.lowerFirst(_.camelCase(relatedRelationship.from.name));
      relationship.otherEntityField = _.lowerFirst(splitField.otherEntityField);
    } else if (relatedRelationship.type === RelationshipTypes.MANY_TO_ONE && relatedRelationship.injectedFieldInTo) {
      splitField = extractField(relatedRelationship.injectedFieldInTo);
      relationship.relationshipName = _.camelCase(splitField.relationshipName);
      relationship.otherEntityName = _.lowerFirst(_.camelCase(relatedRelationship.from.name));
      relationship.otherEntityField = _.lowerFirst(splitField.otherEntityField);
    } else if (relatedRelationship.type === RelationshipTypes.MANY_TO_MANY) {
      splitField = extractField(relatedRelationship.injectedFieldInTo);
      relationship.relationshipName = _.camelCase(splitField.relationshipName);
      relationship.otherEntityName = _.lowerFirst(_.camelCase(relatedRelationship.from.name));
      relationship.ownerSide = false;
      relationship.otherEntityRelationshipName = _.lowerFirst(extractField(relatedRelationship.injectedFieldInFrom).relationshipName);
    }
    entities[entityName].relationships.push(relationship);
  }
}
