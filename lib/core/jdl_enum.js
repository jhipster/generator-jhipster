'use strict';

const merge = require('../utils/object_utils').merge,
    buildException = require('../exceptions/exception_factory').buildException,
    exceptions = require('../exceptions/exception_factory').exceptions;

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
    this.values = merged.values;
  }

  addValue(value) {
    if (!value) {
      throw new buildException(
          exceptions.NullPointer,
          'A valid value must be passed, got nil.');
    }
    this.values.push(value.toString());
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
    values: []
  };
}
