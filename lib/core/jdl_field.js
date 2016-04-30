'use strict';

const merge = require('../utils/object_utils').merge,
    buildException = require('../exceptions/exception_factory').buildException,
    exceptions = require('../exceptions/exception_factory').exceptions;

class JDLField {
  constructor(args) {
    var merged = merge(defaults(), args);
    if (!merged.name || !merged.type) {
      throw new buildException(
          exceptions.NullPointer,
          'The field name and type are mandatory.');
    }
    this.name = merged.name;
    this.type = merged.type;
    this.comment = merged.comment;

    /**
     * key: the validation's name, value: the validation object
     */
    this.validations = merged.validations;
  }

  static isValid(field) {
    return field != null && field.name != null && field.type != null;
  }

  toString() {
    var string = '';
    if (this.comment) {
      string += `/**\n * ${this.comment}\n */\n`;
    }
    string += `${this.name} ${this.type}`;
    for (let validationName in this.validations) {
      if (this.validations.hasOwnProperty(validationName)) {
        string += ` ${this.validations[validationName].toString()}`;
      }
    }
    return string;
  }
}

module.exports = JDLField;

function defaults() {
  return {
    comment: '',
    validations: {}
  };
}
