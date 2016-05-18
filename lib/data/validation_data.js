'use strict';

const merge = require('../helpers/helper').merge;

/**
 * The class holding validation data.
 */
class ValidationData {
  constructor(values) {
    var merged = merge(defaults(), values);
    this.name = merged.name;
    this.value = merged.value;
  }
}

module.exports = ValidationData;

function defaults() {
  return {
    name: '',
    value: null
  };
}
