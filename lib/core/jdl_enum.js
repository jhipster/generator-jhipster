'use strict';

const merge = require('../utils/object_utils').merge,
    isNilOrEmpty = require('../utils/string_utils').isNilOrEmpty,
    buildException = require('../exceptions/exception_factory').buildException,
    exceptions = require('../exceptions/exception_factory').exceptions,
    Set = require('../utils/objects/set');

class JDLEnum {
  constructor(args) {
    var merged = merge(defaults(), args);
    if (!merged.name) {
      throw new buildException(
          exceptions.NullPointer,
          "The enum's name must be passed.");
    }
    this.comment = merged.comment;
    this.name = merged.name;
    this.values = new Set(merged.values);
  }

  addValue(value) {
    if (!value) {
      throw new buildException(
          exceptions.NullPointer,
          'A valid value must be passed, got nil.');
    }
    this.values.add(value.toString());
  }

  static isValid(object) {
    return object != null && !isNilOrEmpty(object.name);
  }

  toString() {
    var comment = '';
    if (this.comment) {
      comment += `/**\n * ${this.comment}\n */`;
    }
    return `${comment}\nenum ${this.name} {\n  ${this.values.join(',\n  ')}\n}`;
  }
}

module.exports = JDLEnum;

function defaults() {
  return {
    values: new Set()
  };
}
