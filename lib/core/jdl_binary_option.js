'use strict';

const AbstractJDLOption = require('./abstract_jdl_option'),
    BINARY_OPTIONS = require('./jhipster/binary_options'),
    isNilOrEmpty = require('../utils/string_utils').isNilOrEmpty,
    buildException = require('../exceptions/exception_factory').buildException,
    exceptions = require('../exceptions/exception_factory').exceptions;

/**
 * For options like the DTO, the service, etc.
 */
class JDLBinaryOption extends AbstractJDLOption {
  constructor(args) {
    super(args);
    if (!BINARY_OPTIONS.exists(this.name, args.value)) {
      throw new buildException(exceptions.IllegalArgument, "The option's name and value must be valid.");
    }
    if (isNilOrEmpty(args.value)) {
      throw new buildException(exceptions.NullPointer, "The option's value must be passed.");
    }
    this.value = args.value;
  }

  toString() {
    var entityNames = this.entityNames.join(', ');
    entityNames.slice(1, entityNames.length - 1);
    var excludedNames = this.excludedNames.join(', ');
    excludedNames.slice(1, this.excludedNames.length - 1);
    return `${this.name} with ${this.value} for ${entityNames} except ${excludedNames}`;
  }

  static isValid(option) {
    return AbstractJDLOption.isValid(option) && BINARY_OPTIONS.exists(option.name, option.value);
  }
}

module.exports = JDLBinaryOption;
