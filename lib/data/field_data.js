'use strict';

const merge = require('../helpers/helper').merge;

/**
 * The class holding field data.
 */
class FieldData {
  constructor(values) {
    var merged = merge(defaults(), values);
    this.name = merged.name;
    this.type = merged.type;
    this.comment = merged.comment;
    this.validations = merged.validations;
  }

  /**
   * Adds a validation to the field.
   * @param {Object} validation the validation to add.
   * @return {FieldData} this modified class.
   */
  addValidation(validation) {
    this.validations.push(validation);
    return this;
  }
}

module.exports = FieldData;

function defaults() {
  return {
    name: '',
    type: '',
    comment: '',
    validations: []
  };
}
