const AbstractJDLOption = require('./abstract_jdl_option');
const BuildException = require('../exceptions/exception_factory').BuildException;
const exceptions = require('../exceptions/exception_factory').exceptions;

class JDLOptions {
  constructor() {
    this.options = {};
  }

  addOption(option) {
    const errors = AbstractJDLOption.checkValidity(option);
    if (errors.length !== 0) {
      throw new BuildException(
        exceptions.InvalidObject,
        `The passed options is invalid'.\nErrors: ${errors.join(', ')}`);
    }
    const key = getOptionKey(option);
    if (!this.options[key]) {
      this.options[key] = option;
      return;
    }
    this.options[key].addEntitiesFromAnotherOption(option);
  }

  getOptions() {
    return Object.keys(this.options).map(optionKey => this.options[optionKey]);
  }

  has(optionName) {
    if (!optionName || optionName.length === 0) {
      return false;
    }
    return !!this.options[optionName]
      || Object.keys(this.options).filter(option => option.indexOf(optionName) !== -1).length !== 0;
  }

  toString() {
    if (Object.keys(this.options).length === 0) {
      return '';
    }
    return Object.keys(this.options)
      .map(optionKey => `${this.options[optionKey].toString()}`)
      .join('\n');
  }
}

function getOptionKey(option) {
  return (option.getType() === 'UNARY') ? option.name : `${option.name}_${option.value}`;
}

module.exports = JDLOptions;
