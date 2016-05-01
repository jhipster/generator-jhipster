'use strict';

const merge = require('../utils/object_utils').merge,
    isNilOrEmpty = require('../utils/string_utils').isNilOrEmpty,
    buildException = require('../exceptions/exception_factory').buildException,
    exceptions = require('../exceptions/exception_factory').exceptions;

class JDLEntity {
  constructor(args) {
    var merged = merge(defaults(), args);
    if (isNilOrEmpty(merged.name)) {
      throw new buildException(
          exceptions.NullPointer,
          'The name is mandatory to create an entity');
    }
    this.name = merged.name;
    this.tableName = merged.tableName || merged.name;
    this.fields = merged.fields;
    this.comment = merged.comment;
  }

  static isValid(entity) {
    return entity != null && !isNilOrEmpty(entity.name)
        && !isNilOrEmpty(entity.tableName) && 'fields' in entity;
  }

  toString() {
    var string = '';
    if (this.comment) {
      string += `/**\n * ${this.comment}\n */\n`;
    }
    string += `entity ${this.name} (${this.tableName})`;
    if (this.fields.length !== 0) {
      string += ` {\n${formatFieldObjects(this.fields)}`;
    }
    return string;
  }
}

module.exports = JDLEntity;

function defaults() {
  return {
    fields: [],
    comment: null
  };
}

function formatFieldObjects(jdlFieldObjects) {
  var string = '';
  for (let i = 0; i < jdlFieldObjects.length; i++) {
    string += `${formatFieldObject(jdlFieldObjects[i])}`;
  }
  string = `${string.slice(0, string.length - 2)}\n}`;
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
