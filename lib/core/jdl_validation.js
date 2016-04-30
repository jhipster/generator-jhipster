'use strict';

const merge = require('../utils/object_utils').merge,
    isNilOrEmpty = require('../utils/string_utils').isNilOrEmpty;

class JDLValidation {
  constructor(args) {
    var merged = merge(defaults(), args);
    this.name = merged.name;
    this.value = merged.value;
  }

  static isValid(validation) {
    return validation != null && !isNilOrEmpty(validation.name);
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
