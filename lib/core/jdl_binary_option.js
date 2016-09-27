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
    this.value = args.value;
  }

  getType() {
    return 'BINARY';
  }

  toString() {
    var entityNames = this.entityNames.join(', ');
    entityNames.slice(1, entityNames.length - 1);
    var optionName = this.name;
    if (this.name === BINARY_OPTIONS.BINARY_OPTIONS.PAGINATION) {
      optionName = 'paginate';
    } else if (this.name === BINARY_OPTIONS.BINARY_OPTIONS.SEARCH_ENGINE){
      optionName  = 'search';
    }
    var firstPart = `${optionName} ${entityNames} with ${this.value}`;
    if (this.excludedNames.size() === 0) {
      return firstPart;
    }
    var excludedNames = this.excludedNames.join(', ');
    excludedNames.slice(1, this.excludedNames.length - 1);
    return `${firstPart} except ${excludedNames}`;
  }

  static isValid(option) {
    return AbstractJDLOption.isValid(option) && BINARY_OPTIONS.exists(option.name, option.value);
  }
}

module.exports = JDLBinaryOption;
