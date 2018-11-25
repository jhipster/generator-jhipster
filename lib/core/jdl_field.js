/**
 * Copyright 2013-2018 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see http://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const merge = require('../utils/object_utils').merge;
const ErrorCases = require('../exceptions/error_cases').ErrorCases;
const JDLValidation = require('./jdl_validation');
const ReservedKeyWord = require('../core/jhipster/reserved_keywords');

const isReservedFieldName = ReservedKeyWord.isReservedFieldName;

const checkValidation = validation => {
  const errors = JDLValidation.checkValidity(validation);
  if (errors.length !== 0) {
    const name = validation && validation.name ? `'${validation.name}' ` : '';
    throw new Error(
      `The passed validation ${name}must be valid to be added to the field.\nErrors: ${errors.join(', ')}`
    );
  }
};

class JDLField {
  constructor(args) {
    const merged = merge(defaults(), args);
    if (!merged.name || !merged.type) {
      throw new Error('The field name and type are mandatory to create a field.');
    }
    if (isReservedFieldName(merged.name)) {
      throw new Error(`The field name cannot be a reserved keyword, got: ${merged.name}.`);
    }
    this.name = merged.name;
    this.type = merged.type;
    this.comment = merged.comment;

    /**
     * key: the validation's name, value: the validation object
     */
    Object.values(merged.validations).forEach(checkValidation);
    this.validations = merged.validations;
  }

  addValidation(validation) {
    checkValidation(validation);
    this.validations[validation.name] = validation;
  }

  static checkValidity(field) {
    const errors = [];
    if (!field) {
      errors.push(ErrorCases.fields.NoField);
      return errors;
    }
    if (!field.name) {
      errors.push(ErrorCases.fields.NoName);
    } else if (isReservedFieldName(field.name)) {
      errors.push(ErrorCases.fields.ReservedWordAsName);
    }
    if (!field.type) {
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
      string += `/**\n${this.comment
        .split('\n')
        .map(line => ` * ${line}\n`)
        .join('')} */\n`;
    }
    string += `${this.name} ${this.type}`;
    Object.keys(this.validations).forEach(validationName => {
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
