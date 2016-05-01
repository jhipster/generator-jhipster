'use strict';

const merge = require('../utils/object_utils').merge,
    isNilOrEmpty = require('../utils/string_utils').isNilOrEmpty;

/**
 * For each name: if the value is true, then the validation must have a value.
 */
const NAMES = {
  required: false,
  min: true,
  max: true,
  minlength: true,
  maxlength: true,
  pattern: true,
  minbytes: true,
  maxbytes: true
};

class JDLValidation {
  constructor(args) {
    var merged = merge(defaults(), args);
    this.name = merged.name;
    this.value = merged.value;
  }

  static isValid(validation) {
    return validation != null && !isNilOrEmpty(validation.name)
        && validation.name in NAMES
        && (NAMES[validation.name] === 'value' in validation);
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
    value: null
  };
}
