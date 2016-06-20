'use strict';

const merge = require('../utils/object_utils').merge,
    isNilOrEmpty = require('../utils/string_utils').isNilOrEmpty,
    JDLEntity = require('./jdl_entity'),
    Set = require('../utils/objects/set'),
    buildException = require('../exceptions/exception_factory').buildException,
    exceptions = require('../exceptions/exception_factory').exceptions;

class AbstractJDLOption {
  constructor(args) {
    var merged = merge(defaults(), args);
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
    if (!entity) {
      throw new buildException(exceptions.NullPointer, 'The entity can not be nil.');
    }
    if (!JDLEntity.isValid(entity)) {
      throw new buildException(exceptions.InvalidObject, 'The passed entity must be valid.');
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
    if (!entity) {
      throw new buildException(exceptions.NullPointer, 'The entity can not be nil.');
    }
    if (!JDLEntity.isValid(entity)) {
      throw new buildException(exceptions.InvalidObject, 'The passed entity must be valid.');
    }
    if (this.entityNames.has(entity.name)) {
      return false;
    }
    return this.excludedNames.add(entity.name);
  }

  getType() {
    throw new buildException(exceptions.UnsupportedOperation);
  }

  static isValid(object) {
    return object != null && !isNilOrEmpty(object.name) && object.entityNames != null && !object.entityNames.has(null)
        && object.excludedNames != null && !object.excludedNames.has(null);
  }
}

module.exports = AbstractJDLOption;

function defaults() {
  return {
    entityNames: new Set(['*']),
    excludedNames: new Set()
  };
}
