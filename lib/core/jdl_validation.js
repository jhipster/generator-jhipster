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

const merge = require('../utils/object_utils').merge;
const ErrorCases = require('../exceptions/error_cases').ErrorCases;
const Validations = require('./jhipster/validations');

class JDLValidation {
  constructor(args) {
    const merged = merge(defaults(), args);
    this.name = merged.name;
    this.value = merged.value;
  }

  static checkValidity(validation) {
    const errors = [];
    if (!validation) {
      errors.push(ErrorCases.validations.NoValidation);
      return errors;
    }
    if (!validation.name) {
      errors.push(ErrorCases.validations.NoName);
    }
    if (!Validations.exists(validation.name)) {
      errors.push(ErrorCases.validations.WrongValidation);
    }
    if (Validations.needsValue(validation.name) && typeof validation.value === 'undefined') {
      errors.push(ErrorCases.validations.NoValue);
    }
    return errors;
  }

  static isValid(validation) {
    const errors = this.checkValidity(validation);
    return errors.length === 0;
  }

  toString() {
    let string = `${this.name}`;
    if (this.value || this.value === 0) {
      string += `(${formatValidationValue(this.name, this.value)})`;
    }
    return string;
  }
}

module.exports = JDLValidation;

function defaults() {
  return {
    name: 'required',
    value: ''
  };
}

function formatValidationValue(name, value) {
  if (name === Validations.PATTERN) {
    return getPatternValidationValue(value);
  }
  return value;
}

function getPatternValidationValue(value) {
  if (value instanceof RegExp) {
    return value.toString();
  }
  return `/${value}/`;
}
