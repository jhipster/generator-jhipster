'use strict';

const merge = require('../utils/object_utils').merge,
  isNilOrEmpty = require('../utils/string_utils').isNilOrEmpty,
  JDLEntity = require('./jdl_entity'),
  Set = require('../utils/objects/set'),
  ErrorCases = require('../exceptions/error_cases').ErrorCases,
  buildException = require('../exceptions/exception_factory').buildException,
  exceptions = require('../exceptions/exception_factory').exceptions;

class AbstractJDLOption {
  constructor(args) {
    const merged = merge(defaults(), args);
    if (!merged.name) {
      throw new buildException(exceptions.NullPointer, "The option's name must be passed.");
    }
    this.name = merged.name;
    this.entityNames = new Set(merged.entityNames);
    if (this.entityNames.size() === 0) {
      this.entityNames.add('*');
    }
    this.excludedNames = new Set(merged.excludedNames);
  }

  addEntity(entity) {
    const errors = JDLEntity.checkValidity(entity);
    if (errors.length !== 0) {
      throw new buildException(
        exceptions.InvalidObject,
        `The passed entity must be valid.\nErrors: ${errors.join(', ')}`);
    }
    if (this.excludedNames.has(entity.name)) {
      return false;
    }
    if (this.entityNames.has('*')) {
      this.entityNames.remove('*');
    }
    return this.entityNames.add(entity.name);
  }

  excludeEntity(entity) {
    const errors = JDLEntity.checkValidity(entity);
    if (errors.length !== 0) {
      throw new buildException(
        exceptions.InvalidObject,
        `The passed entity must be valid.\nErrors: ${errors.join(', ')}`);
    }
    if (this.entityNames.has(entity.name)) {
      return false;
    }
    return this.excludedNames.add(entity.name);
  }

  getType() {
    throw new buildException(exceptions.UnsupportedOperation);
  }

  static checkValidity(object) {
    const errors = [];
    if (!object) {
      errors.push(ErrorCases.options.NoOption);
      return errors;
    }
    if (isNilOrEmpty(object.name)) {
      errors.push(ErrorCases.options.NoName);
    }
    if (!object.entityNames) {
      errors.push(ErrorCases.options.NoEntityNames);
    }
    if (object.entityNames && object.entityNames.has(null)) {
      errors.push(ErrorCases.options.NilInEntityNames);
    }
    if (!object.excludedNames) {
      errors.push(ErrorCases.options.NoExcludedNames);
    }
    if (object.excludedNames && object.excludedNames.has(null)) {
      errors.push(ErrorCases.options.NilInExcludedNames);
    }
    try {
      object.getType();
    } catch (error) {
      errors.push(ErrorCases.options.NoType);
    }
    return errors;
  }

  static isValid(object) {
    const errors = this.checkValidity(object);
    return errors.length === 0;
  }
}

module.exports = AbstractJDLOption;

function defaults() {
  return {
    entityNames: new Set(['*']),
    excludedNames: new Set()
  };
}
