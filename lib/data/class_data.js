'use strict';

const merge = require('../helpers/helper').merge;

/**
 * The class holding class data.
 */
class ClassData {
  constructor(values) {
    var merged = merge(defaults(), values);
    this.name = merged.name;
    this.tableName = merged.tableName || this.name;
    this.fields = merged.fields;
    this.comment = merged.comment;
    this.dto = merged.dto;
    this.pagination = merged.pagination;
    this.service = merged.service;
    if (merged.microserviceName) {
      this.microserviceName = merged.microserviceName;
    }
    if (merged.searchEngine) {
      this.searchEngine = merged.searchEngine;
    }
  }

  /**
   * Adds a field to the class.
   * @param {Object} field the field to add.
   * @return {ClassData} this modified class.
   */
  addField(field) {
    this.fields.push(field);
    return this;
  }
}

module.exports = ClassData;

function defaults() {
  return {
    name: '',
    tableName: '',
    fields: [],
    comment: '',
    dto: 'no',
    pagination: 'no',
    service: 'no'
  };
}
