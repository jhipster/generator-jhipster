'use strict';

const AbstractJDLOption = require('./abstract_jdl_option');

const UNARY_OPTIONS = {
  SKIP_CLIENT: 'skipClient',
  SKIP_SERVER: 'skipServer'
};

/**
 * For flags such as skipServer, skipClient, etc.
 */
class JDLUnaryOption extends AbstractJDLOption {
  constructor(args) {
    super(args)
  }

  toString() {
    var entityNames = this.entityNames.join(', ');
    entityNames.slice(1, entityNames.length - 1);
    var excludedNames = this.excludedNames.join(', ');
    excludedNames.slice(1, this.excludedNames.length - 1);
    return `${this.name} for ${entityNames} except ${excludedNames}`;
  }

  static isValid(option) {
    return AbstractJDLOption.isValid(option);
  }
}

module.exports = {
  JDLUnaryOption: JDLUnaryOption,
  UNARY_OPTIONS: UNARY_OPTIONS
};
