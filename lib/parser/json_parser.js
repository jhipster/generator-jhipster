'use strict';

const _ = require('lodash'),
    JDLObject = require('../core/jdl_object'),
    JDLEntity = require('../core/jdl_entity'),
    JDLField = require('../core/jdl_field'),
    JDLValidation = require('../core/jdl_validation'),
    JDLEnum = require('../core/jdl_enum'),
    JDLRelationship = require('../core/jdl_relationship'),
    JDLRelationships = require('../core/jdl_relationships'),
    JDLUnaryOption = require('../core/jdl_unary_option'),
    JDLBinaryOption = require('../core/jdl_binary_option'),
    Validations = require('../core/jhipster/validations'),
    RelationshipTypes = require('../core/jhipster/relationship_types').RELATIONSHIP_TYPES,
    UnaryOptions = require('../core/jhipster/unary_options').UNARY_OPTIONS,
    BinaryOptions = require('../core/jhipster/binary_options').BINARY_OPTIONS;

module.exports = {
  parseEntities: parseEntities,
  parseServerOptions: parseServerOptions
}

/*
 * Parses the json entities into JDL
 * entities: json map with entity name as key and entity definition as value
 * jdl: JDLObject to which the parsed entities are added. If undefined a new JDLObject is created.
 * returns the JDLObject
 */
function parseEntities(entities, jdl) {
  if (!entities) {
    throw new buildException(
      exceptions.NullPointer,
      'Entities have to be passed to be converted.');
  }
  if (jdl === undefined) {
      jdl = new JDLObject();
  }
  if (!jdl) {
    throw new buildException(
      exceptions.NullPointer,
      'The JDLObject passed cannot be null.');
  }
  for (let i = 0, entityNames = Object.keys(entities); i < entityNames.length; i++) {
    let entityName = entityNames[i];
    let entity = entities[entityName];
    jdl.addEntity(jsonToJDLEntity(entity, entityName));
    addEnumsToJDL(jdl, entity);
    addEntityOptionsToJDL(jdl, entity, entityName);
  }
  addRelationshipsToJDL(jdl, entities);
  return jdl;
}

/*
 * Parses the yo-rc.json into JDL
 * yoRcJson: a yo-rc.json content containing a jhipster app configuration
 * jdl: JDLObject to which the parsed options are added. If undefined a new JDLObject is created.
 * returns the JDLObject
 */
function parseServerOptions(yoRcJson, jdl) {
  if (jdl === undefined) {
      jdl = new JDLObject();
  }
  if (!jdl) {
    throw new buildException(
      exceptions.NullPointer,
      'The JDLObject passed cannot be null.');
  }
  for (let option of [UnaryOptions.SKIP_CLIENT, UnaryOptions.SKIP_SERVER])
  if (yoRcJson['generator-jhipster'][option] === true) {
    jdl.addOption( new JDLUnaryOption({name: option, value: yoRcJson['generator-jhipster'][option]}) );
  }
  return jdl;
}

function jsonToJDLEntity(entity, entityName) {
  var jdlEntity = new JDLEntity( {name : entityName, tableName: entity.entityTableName, comment: entity.javadoc});
  entity.fields.forEach(
    field => jdlEntity.addField( jsonToJDLField(field) )
  );
  return jdlEntity;
}

function jsonToJDLField(field) {
  var jdlField = new JDLField( { name: _.lowerFirst(field.fieldName), type: field.fieldType, comment: field.javadoc});
  if(field.fieldValidateRules) {
    field.fieldValidateRules.forEach( rule => jdlField.addValidation( jsonToJDLValidation (rule, field) ));
  }
  return jdlField;
}

function jsonToJDLValidation(rule, field) {
  var ruleValueKey = 'fieldValidateRules' + _.upperFirst(rule);
  return new JDLValidation( {name: rule, value: field[ruleValueKey]} );
}

function addEnumsToJDL(jdl, entity) {
  var enums = [];
  for (let field of entity.fields) {
    if (field.fieldValues !== undefined) {
      jdl.addEnum( new JDLEnum({ name: field.fieldType, values: field.fieldValues.split(',') }) );
    }
  }
}

/*
 * Adds relationships for entites to JDL.
 * The jdl passed must contain the jdl entities concerned by the relationships
 */
function addRelationshipsToJDL(jdl, entities) {
  for (let i = 0, entityNames = Object.keys(entities); i < entityNames.length; i++) {
    let entityName = entityNames[i];
    let entity = entities[entityName];
    for (let relationship of entity.relationships) {
      let type;
      let injectedFieldInFrom = relationship.relationshipName;
      if (relationship.otherEntityField !== undefined && relationship.otherEntityField !== 'id') {
        injectedFieldInFrom += '(' + relationship.otherEntityField + ')';
      }
      let injectedFieldInTo;
      let isInjectedFieldInToRequired;
      let otherEntity = entities[_.upperFirst(relationship.otherEntityName)];
      if (otherEntity === undefined) {
        continue;
      }
      for (let relationship2 of otherEntity.relationships) {
        if (_.upperFirst(relationship2.otherEntityName) === entityName
            && relationship2.otherEntityRelationshipName === relationship.relationshipName) {
          // Bidirectional relationship
          injectedFieldInTo = relationship2.relationshipName;
          if (relationship2.otherEntityField !== undefined && relationship2.otherEntityField !== 'id') {
            injectedFieldInTo += '(' + relationship2.otherEntityField + ')';
          }
          if (relationship2.relationshipValidateRules) {
            isInjectedFieldInToRequired = true;
          }
        }
      }
      if (relationship.relationshipType === 'one-to-one' && relationship.ownerSide === true) {
        type = RelationshipTypes.ONE_TO_ONE;
      }
      if (relationship.relationshipType === 'many-to-many' && relationship.ownerSide === true) {
        type = RelationshipTypes.MANY_TO_MANY;
      }
      if (relationship.relationshipType === 'many-to-one') {
        if (injectedFieldInTo !== undefined) {
          // This is a bidirectional relationship so consider it as a OneToMany
          jdl.addRelationship( new JDLRelationship( {
            from: jdl.entities[_.upperFirst(relationship.otherEntityName)],
            to: jdl.entities[entityName],
            type: RelationshipTypes.ONE_TO_MANY,
            injectedFieldInFrom: injectedFieldInTo,
            injectedFieldInTo: injectedFieldInFrom,
            isInjectedFieldInFromRequired: isInjectedFieldInToRequired,
            isInjectedFieldInToRequired: relationship.relationshipValidateRules
          }));
        } else {
          // Unidirectional ManyToOne
          type = RelationshipTypes.MANY_TO_ONE;
        }
      }
      if (type !== undefined) {
        jdl.addRelationship( new JDLRelationship( {
          from: jdl.entities[entityName],
          to: jdl.entities[_.upperFirst(relationship.otherEntityName)],
          type: type,
          injectedFieldInFrom: injectedFieldInFrom,
          injectedFieldInTo: injectedFieldInTo,
          isInjectedFieldInFromRequired: relationship.relationshipValidateRules,
          isInjectedFieldInToRequired: isInjectedFieldInToRequired
        }));
      }
    }
  }
}

function addEntityOptionsToJDL(jdl, entity, entityName) {
  if (entity.fluentMethods === false) {
    jdl.addOption( new JDLUnaryOption({name: UnaryOptions.NO_FLUENT_METHOD, entityNames: [entityName]}) );
  }
  for (let option of [BinaryOptions.DTO, BinaryOptions.PAGINATION, BinaryOptions.SERVICE, BinaryOptions.SEARCH_ENGINE ] ) {
    if (entity[option] && entity[option] !== 'no') {
      jdl.addOption( new JDLBinaryOption({name: option, value: entity[option], entityNames: [entityName]}) );
    }
  }
  // angularSuffix in BINARY_OPTIONS, angularJSSuffix in Json
  if (entity.angularJSSuffix !== undefined) {
    jdl.addOption( new JDLBinaryOption({name: BinaryOptions.ANGULAR_SUFFIX, value: entity.angularJSSuffix, entityNames: [entityName]}) );
  }
  // microservice in BINARY_OPTIONS, microserviceName in Json
  if (entity.microserviceName !== undefined) {
    jdl.addOption( new JDLBinaryOption({name: BinaryOptions.MICROSERVICE, value: entity.microserviceName, entityNames: [entityName]}) );
  }
}
