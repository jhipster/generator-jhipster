'use strict';

const merge = require('../utils/object_utils').merge;

class JDLValidation {
  constructor(args) {
    var merged = merge(defaults(), args);
    this.name = merged.name;
    this.value = merged.value;
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
