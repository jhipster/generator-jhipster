'use strict';

const fs = require('fs'),
    _ = require('lodash'),
    buildException = require('../exceptions/exception_factory').buildException,
    exceptions = require('../exceptions/exception_factory').exceptions,
    BinaryOptions = require('../core/jhipster/binary_options'),
    formatComment = require('../utils/format_utils').formatComment,
    JDLParser = require('../dsl/jdl_parser');

module.exports = {
  convertToJson: convertToJson
};

const USER = 'User';

let entitiesToSuppress;
let databaseTypes;
let parsedData;
let entities;
let onDiskEntities;

/* Convert an intermediate object to JHipster compatible json */
function convertToJson(intermediateData, databaseType, force) {
  if (!intermediateData || !databaseType) {
    throw new buildException(
        exceptions.NullPointer,
        'The parsed data and database types are mandatory.');
  }
  /* convert parsed JDL content to an intermediate form */
  parsedData = JDLParser.parse(intermediateData, databaseType);
  console.log(parsedData);
  checkNoSQLModeling(databaseType);
  entitiesToSuppress = [];
  entities = {};
  // cache for the the entities read on the disk
  onDiskEntities = {};

  /*var scheduledClasses = jdlObject.classes;
  if (parsedData.userClassId) {
    scheduledClasses = filterScheduledClasses(parsedData.userClassId, scheduledClasses);
  }*/

  createEntities();
  /*if (!force) {
    scheduledClasses = creator.filterOutUnchangedEntities(scheduledClasses);
  }*/

  return entities;
}


function createEntities() {
  initializeEntities();

  Object.keys(parsedData.entities).forEach(function (entityName) {

    /*
     * If the user adds a 'User' entity we consider it as the already
     * created JHipster User entity and none of its fields and ownerside
     * relationships will be considered.
     */
    if (parsedData.entities[entityName].name.toLowerCase() === USER.toLowerCase()) {
      console.warn(
              "Warning:  An Entity called 'User' was defined: 'User' is an" +
              ' entity created by default by JHipster. All relationships toward' +
              ' it will be kept but all attributes and relationships from it' +
              ' will be disregarded.');
      entitiesToSuppress.push(entityName);
    }
    //setFieldsOfEntity(entityName);
    //setRelationshipOfEntity(entityName);
  });

  entitiesToSuppress.forEach(function (entity) {
    delete entities[entity];
  });

};

/**
 * Initialize all Entities with default values
 */
function initializeEntities() {
  onDiskEntities = readJSON(Object.keys(parsedData.entities));

  Object.keys(parsedData.entities).forEach(function (classId, index) {
    var initializedEntity = {
      relationships: [],
      fields: [],
      changelogDate: getChangelogDate(classId, index),
      dto: getOption(classId, BinaryOptions.BINARY_OPTIONS.DTO),
      pagination: getOption(classId, BinaryOptions.BINARY_OPTIONS.PAGINATION),
      service: getOption(classId, BinaryOptions.BINARY_OPTIONS.SERVICE),
      microserviceName: getOption(classId, BinaryOptions.BINARY_OPTIONS.MICROSERVICE),
      searchEngine: getOption(classId, BinaryOptions.BINARY_OPTIONS.SEARCH_ENGINE),
      angularJSSuffix: getOption(classId, BinaryOptions.BINARY_OPTIONS.ANGULAR_SUFFIX),
      javadoc: formatComment(parsedData.entities[classId].comment),
      entityTableName: _.snakeCase(parsedData.entities[classId].tableName)
    };

    entities[classId] = initializedEntity;
  });
};

/**
 * get the specified option for an entity if any.
 * @param{String} classId  the id of the class to check for.
 * @param{String} optionType the option type to fetch.
 */
function getOption(classId, optionType) {
  let val;
  parsedData.options.forEach(function (option) {
    if(optionType === option.name) {
      if (option.entityNames.has(classId) || (option.entityNames.has('*') && !option.excludedNames.has(classId))) {
        val = option.value;
      }
    }
  });
  return val;
}

/**
 * If the entity already have a json file we get the changelogDate in it
 * else we create the changelogDate with liquibase date format
 * @param{String} classId  the id of the class to set the changelogDate property
 * @param{Integer} increment the optional increment in the timestamp?
 * @return the date on liquibase format
 */
function getChangelogDate(classId, increment) {
  if (onDiskEntities[classId]) {
    return onDiskEntities[classId].changelogDate;
  }
  return dateFormatForLiquibase(increment);
};

/**
 * fill the fields of the current entity
 * param{String} classId the id of the current entity
 */
function setFieldsOfEntity(classId) {
  this.parsedData.classes[classId].fields.forEach(function (fieldId) {
    var fieldData = {
      fieldId: this.entities[classId].fields.length + 1,
      fieldName: _.camelCase(this.parsedData.getField(fieldId).name),
      javadoc: formatComment(this.parsedData.getField(fieldId).comment)
    };

    if (this.parsedData.types[this.parsedData.getField(fieldId).type]) {
      fieldData.fieldType = this.parsedData.getType(this.parsedData.getField(fieldId).type).name;
    } else if (this.parsedData.getEnum(this.parsedData.getField(fieldId).type)) {
      fieldData.fieldType = this.parsedData.getEnum(this.parsedData.getField(fieldId).type).name;
      fieldData.fieldValues = this.parsedData.getEnum(this.parsedData.getField(fieldId).type).values.join(',');
    }

    if (fieldData.fieldType === 'ImageBlob') {
      fieldData.fieldType = 'byte[]';
      fieldData.fieldTypeBlobContent = 'image';
    } else if (fieldData.fieldType === 'Blob' || fieldData.fieldType === 'AnyBlob') {
      fieldData.fieldType = 'byte[]';
      fieldData.fieldTypeBlobContent = 'any';
    }

    this.setValidationsOfField(fieldData, fieldId);
    this.entities[classId].fields.push(fieldData);
  }, this);
};

/**
 * Gets a fields and adds the related validations.
 * @param {Object} field the field.
 * @param {String} fieldId the field's id.
 */
function setValidationsOfField(field, fieldId) {
  if (this.parsedData.getField(fieldId).validations.length === 0) {
    return;
  }
  field.fieldValidateRules = [];

  this.parsedData.getField(fieldId).validations.forEach(function (validationId) {
    var validation = this.parsedData.getValidation(validationId);
    field.fieldValidateRules.push(validation.name);
    if (validation.name !== 'required') {
      field['fieldValidateRules' + _.capitalize(validation.name)] =
          validation.value;
    }
  }, this);

};

function getRelatedAssociations(classId, associationIds, associations) {
  var relationships = {
    from: [],
    to: []
  };
  associationIds.forEach(function (associationId) {
    var association = associations[associationId];
    if (association.from === classId) {
      relationships.from.push(associationId);
    }
    if (association.to === classId && association.injectedFieldInTo) {
      relationships.to.push(associationId);
    }
  }, this);
  return relationships;
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

function setRelationshipOfEntity(classId) {
  var associations = getRelatedAssociations(
      classId,
      Object.keys(this.parsedData.associations),
      this.parsedData.associations);
  associations.from.forEach(function (associationId) {
    var otherSplitField;
    var splitField;
    var association = this.parsedData.getAssociation(associationId);
    association_helper.checkValidityOfAssociation(
        association,
        this.parsedData.getClass(association.from).name,
        this.parsedData.getClass(association.to).name);
    var relationship = {
      relationshipId: this.entities[classId].relationships.length + 1,
      relationshipType: association.type
    };
    if (association.type === cardinalities.ONE_TO_ONE) {
      splitField = extractField(association.injectedFieldInFrom);
      relationship.relationshipName = _.camelCase(splitField.relationshipName);
      relationship.otherEntityName = _.lowerFirst(_.camelCase(this.parsedData.getClass(association.to).name));
      relationship.otherEntityField = _.lowerFirst(splitField.otherEntityField);
      relationship.ownerSide = true;
      relationship.otherEntityRelationshipName = _.lowerFirst(association.injectedFieldInTo || this.parsedData.getClass(association.from).name);
    } else if (association.type === cardinalities.ONE_TO_MANY) {
      splitField = extractField(association.injectedFieldInFrom);
      otherSplitField = extractField(association.injectedFieldInTo);
      relationship.relationshipName = _.lowerFirst(_.camelCase(splitField.relationshipName || this.parsedData.getClass(association.to).name));
      relationship.otherEntityName = _.lowerFirst(_.camelCase(this.parsedData.getClass(association.to).name));
      relationship.otherEntityRelationshipName = _.lowerFirst(otherSplitField.relationshipName);
      if (!association.injectedFieldInTo) {
        relationship.otherEntityRelationshipName = _.lowerFirst(this.parsedData.getClass(association.from).name);
        otherSplitField = extractField(association.injectedFieldInTo);
        var otherSideRelationship = {
          relationshipId: this.entities[association.to].relationships.length + 1,
          relationshipName: _.camelCase(_.lowerFirst(this.parsedData.getClass(association.from).name)),
          otherEntityName: _.lowerFirst(_.camelCase(this.parsedData.getClass(association.from).name)),
          relationshipType: cardinalities.MANY_TO_ONE,
          otherEntityField: _.lowerFirst(otherSplitField.otherEntityField)
        };
        association.type = cardinalities.MANY_TO_ONE;
        this.entities[association.to].relationships.push(otherSideRelationship);
      }
    } else if (association.type === cardinalities.MANY_TO_ONE && association.injectedFieldInFrom) {
      splitField = extractField(association.injectedFieldInFrom);
      relationship.relationshipName = _.camelCase(splitField.relationshipName);
      relationship.otherEntityName = _.lowerFirst(_.camelCase(this.parsedData.getClass(association.to).name));
      relationship.otherEntityField = _.lowerFirst(splitField.otherEntityField);
    } else if (association.type === cardinalities.MANY_TO_MANY) {
      splitField = extractField(association.injectedFieldInFrom);
      relationship.relationshipName = _.camelCase(splitField.relationshipName);
      relationship.otherEntityName = _.lowerFirst(_.camelCase(this.parsedData.getClass(association.to).name));
      relationship.otherEntityField = _.lowerFirst(splitField.otherEntityField);
      relationship.ownerSide = true;
    }
    this.entities[classId].relationships.push(relationship);
  }, this);
  associations.to.forEach(function (associationId) {
    var splitField;
    var otherSplitField;
    var association = this.parsedData.getAssociation(associationId);
    var relationship = {
      relationshipId: this.entities[classId].relationships.length + 1,
      relationshipType: (association.type === cardinalities.ONE_TO_MANY ? cardinalities.MANY_TO_ONE : association.type)
    };
    if (association.type === cardinalities.ONE_TO_ONE) {
      splitField = extractField(association.injectedFieldInTo);
      otherSplitField = extractField(association.injectedFieldInFrom);
      relationship.relationshipName = _.camelCase(splitField.relationshipName);
      relationship.otherEntityName = _.lowerFirst(_.camelCase(this.parsedData.getClass(association.from).name));
      relationship.ownerSide = false;
      relationship.otherEntityRelationshipName = _.lowerFirst(otherSplitField.relationshipName);
    } else if (association.type === cardinalities.ONE_TO_MANY) {
      association.injectedFieldInTo = association.injectedFieldInTo || _.lowerFirst(association.from);
      splitField = extractField(association.injectedFieldInTo);
      relationship.relationshipName = _.lowerFirst(_.camelCase(splitField.relationshipName || this.parsedData.getClass(association.from).name));
      relationship.otherEntityName = _.lowerFirst(_.camelCase(this.parsedData.getClass(association.from).name));
      relationship.otherEntityField = _.lowerFirst(splitField.otherEntityField);
    } else if (association.type === cardinalities.MANY_TO_ONE && association.injectedFieldInTo) {
      splitField = extractField(association.injectedFieldInTo);
      relationship.relationshipName = _.camelCase(splitField.relationshipName);
      relationship.otherEntityName = _.lowerFirst(_.camelCase(this.parsedData.getClass(association.from).name));
      relationship.otherEntityField = _.lowerFirst(splitField.otherEntityField);
    } else if (association.type === cardinalities.MANY_TO_MANY) {
      splitField = extractField(association.injectedFieldInTo);
      relationship.relationshipName = _.camelCase(splitField.relationshipName);
      relationship.otherEntityName = _.lowerFirst(_.camelCase(this.parsedData.getClass(association.from).name));
      relationship.ownerSide = false;
      relationship.otherEntityRelationshipName = _.lowerFirst(extractField(association.injectedFieldInFrom).relationshipName);
    }
    this.entities[classId].relationships.push(relationship);
  }, this);
};

/**
 * For each class in classesToRead, reads the corresponding JSON in .jhipster.
 * @param{array} classesToRead all the classes we want to read.
 * @return {object} the read entities.
 */
function readJSON(classesToRead) {
  var entitiesRead = {};
  classesToRead.forEach(function (classToRead) {
    var file = '.jhipster/' + parsedData.entities[classToRead].name + '.json';

    if (onDiskEntities[classToRead]) {
      entitiesRead[classToRead] = onDiskEntities[classToRead];
    } else if (fs.existsSync(file)) {
      entitiesRead[classToRead] = JSON.parse(fs.readFileSync(file, 'utf8'));
    }
  });
  return entitiesRead;
}

/**
 * @param{Array} classList  the classes we want to create a JSON for
 * Return an object map of all the entity in classList
 */
function getEntitiesMap(classList) {
  var entitiesMap = {};
  for (var k in entities) {
    if (this.entities.hasOwnProperty(k) && classList.indexOf(k) !== -1) {
      entitiesMap[this.parsedData.getClass(k).name] = this.entities[k];
    }
  }
  return entitiesMap;
};

/**
 * @param{Array} classList  the classes we want to create a JSON for
 * Write a JSON file for each entity in classList in the .jhipster folder
 */
function writeJSON(classList) {
  if (!fs.existsSync('.jhipster')) {
    fs.mkdirSync('.jhipster');
  }

  for (var k in this.entities) {
    if (this.entities.hasOwnProperty(k) && classList.indexOf(k) !== -1) {
      var file = '.jhipster/' + this.parsedData.getClass(k).name + '.json';
      fs.writeFileSync(file, JSON.stringify(this.entities[k], null, 4));
    }
  }
};

/**
 * Removes all unchanged entities.
 * @param {Array} entities all the entities to filter.
 * @returns {Array} the changed entities.
 */
function filterOutUnchangedEntities(entities) {
  var onDiskEntities = this.readJSON(entities);
  return entities.filter(function (id) {
    var currEntity = onDiskEntities[id];
    var newEntity = this.entities[id];
    if (!currEntity) {
      return true;
    }
    return !areJHipsterEntitiesEqual(currEntity, newEntity);
  }, this);
};

/*
 * Throws an error if the user declared relationships when using a NoSQL database
 */
function checkNoSQLModeling(databaseType) {
  if (databaseType !== 'sql'
      && parsedData.relationships.size() !== 0) {
    throw new buildException(
        exceptions.NoSQLModeling, "NoSQL entities don't have relationships.");
  }
}

function dateFormatForLiquibase(increment) {
  var now = new Date();
  var now_utc = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
  var year = '' + now_utc.getFullYear();
  var month = '' + (now_utc.getMonth() + 1);
  if (month.length === 1) {
    month = '0' + month;
  }
  var day = '' + now_utc.getDate();
  if (day.length === 1) {
    day = '0' + day;
  }
  var hour = '' + now_utc.getHours();
  if (hour.length === 1) {
    hour = '0' + hour;
  }
  var minute = '' + now_utc.getMinutes();
  if (minute.length === 1) {
    minute = '0' + minute;
  }
  var second = '' + (now_utc.getSeconds() + increment) % 60;
  if (second.length === 1) {
    second = '0' + second;
  }
  return year + '' + month + '' + day + '' + hour + '' + minute + '' + second;
}

function filterScheduledClasses(classToFilter, scheduledClasses) {
  return scheduledClasses.filter(function(element) {
    return element !== classToFilter;
  });
}
