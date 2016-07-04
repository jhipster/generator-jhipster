'use strict';

const fs = require('fs'),
    _ = require('lodash'),
    merge = require('../utils/object_utils').merge,
    RelationshipTypes = require('../core/jhipster/relationship_types').RELATIONSHIP_TYPES,
    formatComment = require('../utils/format_utils').formatComment,
    dateFormatForLiquibase = require('../utils/format_utils').dateFormatForLiquibase,
    buildException = require('../exceptions/exception_factory').buildException,
    exceptions = require('../exceptions/exception_factory').exceptions;

const USER = 'user';

var entitiesToSuppress;
var listDTO;
var listPagination;
var listService;
var microserviceNames;
var entities;
var onDiskEntities;
var searchEngines;
var databaseType;
var jdlObject;

module.exports = {
  parse: parse
};

/**
 * Keys of args:
 *   - jdlObject,
 *   - databaseTypes,
 *   - listDTO,
 *   - listPagination,
 *   - listService,
 *   - microserviceNames,
 *   - searchEngines.
 */
function parse(args) {
  var merged = merge(defaults(), args);
  if (!merged.jdlObject || !merged.databaseType) {
    throw new buildException(
        exceptions.NullPointer,
        'The JDL object and the database type are both mandatory.');
  }
  checkNoSQLModeling(merged.jdlObject, merged.databaseType);
  init(merged);
  readJSONFiles();
  initializeEntities();
  setOptions();
  fillEntities();
  return entities;
}

function init(args) {
  if (jdlObject) {
    resetState();
  }
  entitiesToSuppress = [];
  databaseType = args.databaseType;
  jdlObject = args.jdlObject;
  entities = {};
  onDiskEntities = {};
}

function resetState() {
  entitiesToSuppress = null;
  databaseType = null;
  jdlObject = null;
  entities = null;
  onDiskEntities = null;
}

function checkNoSQLModeling(passedJdlObject, passedDatabaseType) {
  if (passedJdlObject.relationships.size !== 0 && passedDatabaseType !== 'sql') {
    throw new buildException(
        exceptions.NoSQLModeling, "NoSQL entities don't have relationships.");
  }
}

function readJSONFiles() {
  for (let i = 0, entityNames = Object.keys(jdlObject.entities); i < entityNames.length; i++) {
    let file = `.jhipster/${entityNames[i]}.json`;
    if (fs.statSync(file).isFile()) {
      onDiskEntities[entityNames[i]] = JSON.parse(fs.readFileSync(file, 'utf8'));
    }
  }
}

function initializeEntities() {
  for (let i = 0, entityNames = Object.keys(jdlObject.entities); i < entityNames.length; i++) {
    let initializedEntity = { // todo: make a builder/factory instead!
      relationships: [],
      fields: [],
      changelogDate: dateFormatForLiquibase(i),
      javadoc: formatComment(jdlObject.entities(entityNames[i]).comment),
      entityTableName: _.snakeCase(jdlObject.entities(entityNames[i]).tableName)
    };
    entities[entityNames[i]] = initializedEntity;
  }
}

function setOptions() {
  for (let i = 0; i < jdlObject.options.length; i++) {
    let option = jdlObject.options[i];
    if (option.getType() === 'UNARY') {
      continue;
    }
    if (option.entityNames.length === 1 && option.entityNames[0] === '*') {
      option.entityNames = Object.keys(jdlObject.entities).filter(function(entityName) {
        return option.excludedNames.indexOf(entityName) === -1;
      });
    }
    for (let j = 0; j < option.entityNames.length; j++) {
      entities[option.entityNames[j]][option.name] = option.value;
    }
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
      relatedRelationships.from.push(relationshipsArray[i].from);
    }
    if (relationshipsArray[i].to.name === entityName && relationshipsArray[i].injectedFieldInTo) {
      relatedRelationships.to.push(relationshipsArray[i].to);
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
  var relatedAssociations = getRelatedRelationships(entityName, jdlObject.relationships);
  setSourceAssociationsForClass(relatedAssociations, entityName);
  setDestinationAssociationsForClass(relatedAssociations, entityName);
}

function setSourceAssociationsForClass(relatedAssociations, entityName) {
  for (let i = 0; i < relatedAssociations.from.length; i++) {
    let otherSplitField;
    let splitField;
    let relatedRelationship = relatedAssociations.from[i];
    let relationship = {
      relationshipType: relatedRelationship.type
    };
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
        entities[relatedRelationship.to].relationships.push(otherSideRelationship);
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

function setDestinationAssociationsForClass(relatedAssociations, entityName) {
  for (let i = 0; i < relatedAssociations.to.length; i++) {
    let splitField;
    let otherSplitField;
    let association = relatedAssociations.to[i];
    let relationship = {
      relationshipType: (association.type === RelationshipTypes.ONE_TO_MANY ? RelationshipTypes.MANY_TO_ONE : association.type)
    };
    if (association.type === RelationshipTypes.ONE_TO_ONE) {
      splitField = extractField(association.injectedFieldInTo);
      otherSplitField = extractField(association.injectedFieldInFrom);
      relationship.relationshipName = _.camelCase(splitField.relationshipName);
      relationship.otherEntityName = _.lowerFirst(_.camelCase(association.from.name));
      relationship.ownerSide = false;
      relationship.otherEntityRelationshipName = _.lowerFirst(otherSplitField.relationshipName);
    } else if (association.type === RelationshipTypes.ONE_TO_MANY) {
      association.injectedFieldInTo = association.injectedFieldInTo || _.lowerFirst(association.from);
      splitField = extractField(association.injectedFieldInTo);
      relationship.relationshipName = _.lowerFirst(_.camelCase(splitField.relationshipName || association.from.name));
      relationship.otherEntityName = _.lowerFirst(_.camelCase(association.from.name));
      relationship.otherEntityField = _.lowerFirst(splitField.otherEntityField);
    } else if (association.type === RelationshipTypes.MANY_TO_ONE && association.injectedFieldInTo) {
      splitField = extractField(association.injectedFieldInTo);
      relationship.relationshipName = _.camelCase(splitField.relationshipName);
      relationship.otherEntityName = _.lowerFirst(_.camelCase(association.from.name));
      relationship.otherEntityField = _.lowerFirst(splitField.otherEntityField);
    } else if (association.type === RelationshipTypes.MANY_TO_MANY) {
      splitField = extractField(association.injectedFieldInTo);
      relationship.relationshipName = _.camelCase(splitField.relationshipName);
      relationship.otherEntityName = _.lowerFirst(_.camelCase(association.from.name));
      relationship.ownerSide = false;
      relationship.otherEntityRelationshipName = _.lowerFirst(extractField(association.injectedFieldInFrom).relationshipName);
    }
    entities[entityName].relationships.push(relationship);
  }
}
