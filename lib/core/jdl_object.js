

const JDLEntity = require('./jdl_entity');
const JDLEnum = require('./jdl_enum');
const JDLRelationship = require('./jdl_relationship');
const JDLRelationships = require('./jdl_relationships');
const JDLAbstractRelationship = require('./abstract_jdl_option');
const JDLUnaryOption = require('./jdl_unary_option');
const JDLBinaryOption = require('./jdl_binary_option');
const BuildException = require('../exceptions/exception_factory').BuildException;
const exceptions = require('../exceptions/exception_factory').exceptions;

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
    const errors = JDLEntity.checkValidity(entity);
    if (errors.length !== 0) {
      throw new BuildException(
        exceptions.InvalidObject,
        `The entity must be valid in order to be added.\nErrors: ${errors.join(', ')}`);
    }
    this.entities[entity.name] = entity;
  }

  /**
   * Adds or replaces an enum.
   * @param enumToAdd the enum to add.
   */
  addEnum(enumToAdd) {
    const errors = JDLEnum.checkValidity(enumToAdd);
    if (errors.length !== 0) {
      throw new BuildException(
        exceptions.InvalidObject,
        `The enum must be valid in order to be added.\nErrors: ${errors.join(', ')}`);
    }
    this.enums[enumToAdd.name] = enumToAdd;
  }

  addRelationship(relationship) {
    const errors = JDLRelationship.checkValidity(relationship);
    if (errors.length !== 0) {
      throw new BuildException(
        exceptions.InvalidObject,
        `The relationship must be valid in order to be added.\nErrors: ${errors.join(', ')}`);
    }
    this.relationships.add(relationship);
  }

  addOption(option) {
    const errors = JDLAbstractRelationship.checkValidity(option);
    if (errors.length !== 0) {
      throw new BuildException(
        exceptions.InvalidObject,
        `The option must be valid in order to be added.\nErrors: ${errors.join(', ')}`);
    }
    if ((option.getType() === 'UNARY' && JDLUnaryOption.isValid(option))
      || (option.getType() === 'BINARY' && JDLBinaryOption.isValid(option))) {
      this.options.push(option);
    }
  }

  toString() {
    let string = '';
    string += `${entitiesToString(this.entities)}\n`;
    string += `${enumsToString(this.enums)}\n`;
    string += `${relationshipsToString(this.relationships)}\n`;
    string += `${optionsToString(this.options)}`;
    return string;
  }
}

function entitiesToString(entities) {
  let string = '';
  Object.keys(entities).forEach((entityName) => {
    string += `${entities[entityName].toString()}\n`;
  });
  return string.slice(0, string.length - 1);
}
function enumsToString(enums) {
  let string = '';
  Object.keys(enums).forEach((enumName) => {
    string += `${enums[enumName].toString()}\n`;
  });
  return string;
}
function relationshipsToString(relationships) {
  return `${relationships.toString()}\n`;
}
function optionsToString(options) {
  let string = '';
  for (let i = 0; i < options.length; i++) {
    string += `${options[i].toString()}\n`;
  }
  return string;
}

module.exports = JDLObject;
