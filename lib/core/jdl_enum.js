

const merge = require('../utils/object_utils').merge;
const isNilOrEmpty = require('../utils/string_utils').isNilOrEmpty;
const BuildException = require('../exceptions/exception_factory').BuildException;
const exceptions = require('../exceptions/exception_factory').exceptions;
const ErrorCases = require('../exceptions/error_cases').ErrorCases;
const Set = require('../utils/objects/set');

class JDLEnum {
  constructor(args) {
    const merged = merge(defaults(), args);
    if (!merged.name) {
      throw new BuildException(
        exceptions.NullPointer,
        'The enum\'s name must be passed.');
    }
    this.comment = merged.comment;
    this.name = merged.name;
    this.values = new Set(merged.values);
  }

  addValue(value) {
    if (!value) {
      throw new BuildException(
        exceptions.NullPointer,
        'A valid value must be passed, got nil.');
    }
    this.values.add(value.toString());
  }

  static checkValidity(object) {
    const errors = [];
    if (!object) {
      errors.push(ErrorCases.enums.NoEnum);
      return errors;
    }
    if (isNilOrEmpty(object.name)) {
      errors.push(ErrorCases.enums.NoName);
    }
    return errors;
  }

  /**
   * Deprecated
   */
  static isValid(object) {
    const errors = this.checkValidity(object);
    return errors.length === 0;
  }

  toString() {
    let comment = '';
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
