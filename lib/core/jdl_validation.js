'use strict';

const merge = require('../utils/object_utils').merge,
    isNilOrEmpty = require('../utils/string_utils').isNilOrEmpty,
    VALIDATIONS = require('./jhipster/validations');

class JDLValidation {
  constructor(args) {
    var merged = merge(defaults(), args);
    this.name = merged.name;
    this.value = merged.value;
  }

  static isValid(validation) {
    return validation != null && !isNilOrEmpty(validation.name)
        && VALIDATIONS.exists(validation.name)
        && (VALIDATIONS.needsValue(validation.name) !== isNilOrEmpty(validation.value));
  }

  toString() {
    var string = `${this.name}`;
    if (this.value) {
      string += `(${this.value})`;
    }
    return string;
  }
}

module.exports = JDLValidation;

function defaults() {
  return {
    name: 'required',
    value: ''
  };
}
