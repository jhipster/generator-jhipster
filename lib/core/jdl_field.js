/**
 * Copyright 2013-2019 the original author or authors from the JHipster project.
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

const { isReservedFieldName } = require('../core/jhipster/reserved_keywords');
const ValidationValidator = require('../exceptions/validation_validator');
const { merge } = require('../utils/object_utils');

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
    this.validationValidator = new ValidationValidator();

    /**
     * key: the validation's name, value: the validation object
     */
    Object.values(merged.validations).forEach(validation => this.validationValidator.validate(validation));
    this.validations = merged.validations;
    this.options = merged.options;
  }

  addValidation(validation) {
    try {
      this.validationValidator.validate(validation);
    } catch (error) {
      throw new Error(`Can't add invalid validation. ${error}`);
    }
    this.validations[validation.name] = validation;
  }

  forEachValidation(functionToApply) {
    if (!functionToApply) {
      throw new Error('A function must be passed to iterate over validations');
    }
    Object.values(this.validations).forEach(functionToApply);
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
    validations: {},
    options: {}
  };
}
