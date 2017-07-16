

const AbstractJDLOption = require('./abstract_jdl_option');
const BINARY_OPTIONS = require('./jhipster/binary_options');
const BuildException = require('../exceptions/exception_factory').BuildException;
const exceptions = require('../exceptions/exception_factory').exceptions;

/**
 * For options like the DTO, the service, etc.
 */
class JDLBinaryOption extends AbstractJDLOption {
  constructor(args) {
    super(args);
    if (!BINARY_OPTIONS.exists(this.name, args.value)) {
      let valueText = `value '${args.value}'`;
      if (!args.value) {
        valueText = 'no value';
      }
      throw new BuildException(
        exceptions.IllegalArgument,
        `The option's name and value must be valid, got ${valueText} for '${this.name}'.`);
    }
    this.value = args.value;
  }

  getType() {
    return 'BINARY';
  }

  toString() {
    const entityNames = this.entityNames.join(', ');
    entityNames.slice(1, entityNames.length - 1);
    let optionName = this.name;
    if (this.name === BINARY_OPTIONS.BINARY_OPTIONS.PAGINATION) {
      optionName = 'paginate';
    } else if (this.name === BINARY_OPTIONS.BINARY_OPTIONS.SEARCH_ENGINE) {
      optionName = 'search';
    }
    const firstPart = `${optionName} ${entityNames} with ${this.value}`;
    if (this.excludedNames.size() === 0) {
      return firstPart;
    }
    const excludedNames = this.excludedNames.join(', ');
    excludedNames.slice(1, this.excludedNames.length - 1);
    return `${firstPart} except ${excludedNames}`;
  }

  static isValid(option) {
    return AbstractJDLOption.isValid(option) && BINARY_OPTIONS.exists(option.name, option.value);
  }
}

module.exports = JDLBinaryOption;
