'use strict';

const Types = require('./types'),
    buildException = require('../exceptions/exception_factory').buildException,
    exceptions = require('../exceptions/exception_factory').exceptions;

var AbstractMappedTypes = module.exports = function () {
};

// inheritance stuff
AbstractMappedTypes.prototype = Object.create(Types.prototype);
AbstractMappedTypes.prototype.constructor = Types;

/**
 * Method implementation from Type.
 */
AbstractMappedTypes.prototype.getTypes = function () {
  return Object.keys(this.types);
};

/**
 * Method implementation from Type.
 */
AbstractMappedTypes.prototype.getValidationsForType = function (type) {
  if (!this.contains(type)) {
    throw new buildException(
        exceptions.WrongDatabaseType,
        `The passed type '${type}' is not supported.`);
  }
  return this.types[type];
};
