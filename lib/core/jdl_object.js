'use strict';

const Set = require('../utils/objects/set'),
    JDLEntity = require('./jdl_entity'),
    JDLEnum = require('./jdl_enum'),
    JDLRelationship = require('./jdl_relationship'),
    JDLRelationships = require('./jdl_relationships'),
    JDLUnaryOption = require('./jdl_unary_option'),
    JDLBinaryOption = require('./jdl_binary_option'),
    buildException = require('../exceptions/exception_factory').buildException,
    exceptions = require('../exceptions/exception_factory').exceptions;

class JDLObject {
  constructor() {
    this.entities = {};
    this.enums = {};
    this.relationships = new JDLRelationships();
    this.options = [];
  }

  /**
   * Adds or replaces an entity.
   * @param entity the entity to add.
   */
  addEntity(entity) {
    if (!JDLEntity.isValid(entity)) {
      throw new buildException(exceptions.InvalidObject, 'The entity must be valid in order to be added.');
    }
    this.entities[entity.name] = entity;
  }

  /**
   * Adds or replaces an enum.
   * @param enumToAdd the enum to add.
   */
  addEnum(enumToAdd) {
    if (!JDLEnum.isValid(enumToAdd)) {
      throw new buildException(exceptions.InvalidObject, 'The enum must be valid in order to be added.');
    }
    this.enums[enumToAdd.name] = enumToAdd;
  }

  addRelationship(relationship) {
    if (!JDLRelationship.isValid(relationship)) {
      throw new buildException(exceptions.InvalidObject, 'The relationship must be valid in order to be added.');
    }
    this.relationships.add(relationship);
  }

  addOption(option) {
    if (!option) {
      throw new buildException(exceptions.NullPointer, 'The passed option must not be nil and be valid.');
    }
    if (!('getType' in option) || (option.getType() !== 'UNARY' && option.getType() !== 'BINARY')) {
      throw new buildException(exceptions.InvalidObject, 'The passed object is invalid');
    }
    if ((option.getType() === 'UNARY' && JDLUnaryOption.isValid(option))
        || (option.getType() === 'BINARY' && JDLBinaryOption.isValid(option))) {
      this.options.push(option);
    }
  }

  toString() {
    var string = '';
    string += `${entitiesToString(this.entities)}\n`;
    string += `${enumsToString(this.enums)}\n`;
    string += `${relationshipsToString(this.relationships)}\n`;
    string += `${optionsToString(this.options)}`;
    return string;
  }
}

function entitiesToString(entities) {
  var string = '';
  for (let entityName in entities) {
    if (entities.hasOwnProperty(entityName)) {
      string += `${entities[entityName].toString()}\n`;
    }
  }
  return string.slice(0, string.length - 1);
}
function enumsToString(enums) {
  var string = '';
  for (let enumName in enums) {
    if (enums.hasOwnProperty(enumName)) {
      string += `${enums[enumName].toString()}\n`;
    }
  }
  return string;
}
function relationshipsToString(relationships) {
  return `${relationships.toString()}\n`;
}
function optionsToString(options) {
  var string = '';
  for (let i = 0; i < options.length; i++) {
    string += `${options[i].toString()}\n`;
  }
  return string;
}

module.exports = JDLObject;
