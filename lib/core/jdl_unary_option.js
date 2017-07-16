

const AbstractJDLOption = require('./abstract_jdl_option');
const UNARY_OPTIONS = require('./jhipster/unary_options');
const BuildException = require('../exceptions/exception_factory').BuildException;
const exceptions = require('../exceptions/exception_factory').exceptions;

/**
 * For flags such as skipServer, skipClient, etc.
 */
class JDLUnaryOption extends AbstractJDLOption {
  constructor(args) {
    super(args);
    if (!UNARY_OPTIONS.exists(this.name)) {
      throw new BuildException(exceptions.IllegalArgument, `The option's name must be valid, got '${this.name}'.`);
    }
  }

  getType() {
    return 'UNARY';
  }

  toString() {
    const entityNames = this.entityNames.join(', ');
    entityNames.slice(1, entityNames.length - 1);
    const firstPart = `${this.name} for ${entityNames}`;
    if (this.excludedNames.size() === 0) {
      return firstPart;
    }
    const excludedNames = this.excludedNames.join(', ');
    excludedNames.slice(1, this.excludedNames.length - 1);
    return `${firstPart} except ${excludedNames}`;
  }

  static isValid(option) {
    return AbstractJDLOption.isValid(option);
  }
}

module.exports = JDLUnaryOption;
