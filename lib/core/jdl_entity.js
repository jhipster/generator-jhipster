'use strict';

const merge = require('../utils/object_utils').merge,
    isNilOrEmpty = require('../utils/string_utils').isNilOrEmpty,
    buildException = require('../exceptions/exception_factory').buildException,
    exceptions = require('../exceptions/exception_factory').exceptions,
    JDLField = require('./jdl_field');

class JDLEntity {
  constructor(args) {
    var merged = merge(defaults(), args);
    if (isNilOrEmpty(merged.name)) {
      throw new buildException(
          exceptions.NullPointer,
          'The name is mandatory to create an entity.');
    }
    this.name = merged.name;
    this.tableName = merged.tableName || merged.name;
    this.fields = merged.fields;
    this.comment = merged.comment;
  }

  addField(field) {
    if (!JDLField.isValid(field)) {
      throw new buildException(exceptions.InvalidObject, 'The passed field must be valid.');
    }
    this.fields[field.name] = field;
  }

  static isValid(entity) {
    if (entity == null || isNilOrEmpty(entity.name)
        || isNilOrEmpty(entity.tableName) || !('fields' in entity)) {
      return false;
    }
    for (let i = 0; i < entity.fields.length; i++) {
      if (!JDLField.isValid(entity.fields[i])) {
        return false;
      }
    }
    return true;
  }

  toString() {
    var string = '';
    if (this.comment) {
      string += '/**\n' + this.comment.split('\n').map( line => ` * ${line}\n` ).join('') + ` */\n`;
    }
    string += `entity ${this.name} (${this.tableName})`;
    if (Object.keys(this.fields).length !== 0) {
      string += ` {\n${formatFieldObjects(this.fields)}\n}`;
    }
    return string;
  }
}

module.exports = JDLEntity;

function defaults() {
  return {
    fields: {}
  };
}

function formatFieldObjects(jdlFieldObjects) {
  var string = '';
  for (let jdlField in jdlFieldObjects) {
    if (jdlFieldObjects.hasOwnProperty(jdlField)) {
      string += `${formatFieldObject(jdlFieldObjects[jdlField])}`;
    }
  }
  string = `${string.slice(0, string.length - 2)}`;
  return string;
}

function formatFieldObject(jdlFieldObject) {
  var string = '';
  let lines = jdlFieldObject.toString().split('\n');
  for (let j = 0; j < lines.length; j++) {
    string += `  ${lines[j]}\n`;
  }
  string = `${string.slice(0, string.length - 1)},\n`;
  return string;
}
