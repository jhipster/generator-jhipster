

const merge = require('../utils/object_utils').merge;
const isNilOrEmpty = require('../utils/string_utils').isNilOrEmpty;
const BuildException = require('../exceptions/exception_factory').BuildException;
const exceptions = require('../exceptions/exception_factory').exceptions;
const ErrorCases = require('../exceptions/error_cases').ErrorCases;
const JDLValidation = require('./jdl_validation');

class JDLField {
  constructor(args) {
    const merged = merge(defaults(), args);
    if (isNilOrEmpty(merged.name) || isNilOrEmpty(merged.type)) {
      throw new BuildException(
        exceptions.NullPointer,
        'The field name and type are mandatory.');
    }
    this.name = merged.name;
    this.type = merged.type;
    this.comment = merged.comment;

    /**
     * key: the validation's name, value: the validation object
     */
    this.validations = merged.validations;
  }

  addValidation(validation) {
    const errors = JDLValidation.checkValidity(validation);
    if (errors.length !== 0) {
      throw new BuildException(
        exceptions.InvalidObject,
        `The passed validation must be valid.\nErrors: ${errors.join(', ')}`);
    }
    this.validations[validation.name] = validation;
  }

  static checkValidity(field) {
    const errors = [];
    if (!field) {
      errors.push(ErrorCases.fields.NoField);
      return errors;
    }
    if (isNilOrEmpty(field.name)) {
      errors.push(ErrorCases.fields.NoName);
    }
    if (isNilOrEmpty(field.type)) {
      errors.push(ErrorCases.fields.NoType);
    }
    if (field.validations) {
      for (let i = 0; i < field.validations.length; i++) {
        const validationErrors = JDLValidation.checkValidity(field.validations[i]);
        if (validationErrors.length !== 0) {
          errors.push(`For validation #${i + 1}: ${validationErrors}`);
        }
      }
      JDLValidation.checkValidity(field.validations);
    }

    return errors;
  }

  /**
   * Deprecated
   */
  static isValid(field) {
    const errors = this.checkValidity(field);
    return errors.length === 0;
  }

  toString() {
    let string = '';
    if (this.comment) {
      string += `/**\n${this.comment.split('\n').map(line => ` * ${line}\n`).join('')} */\n`;
    }
    string += `${this.name} ${this.type}`;
    Object.keys(this.validations).forEach((validationName) => {
      string += ` ${this.validations[validationName].toString()}`;
    });
    return string;
  }
}

module.exports = JDLField;

function defaults() {
  return {
    validations: {}
  };
}
