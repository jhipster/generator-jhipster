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

const AbstractJDLOption = require('./abstract_jdl_option');

class JDLOptions {
  constructor() {
    this.options = {};
  }

  addOption(option) {
    const errors = AbstractJDLOption.checkValidity(option);
    if (errors.length !== 0) {
      throw new Error(`The passed option is invalid and can't be added.\nErrors: ${errors.join(', ')}`);
    }
    const key = getOptionKey(option);
    if (!this.options[key]) {
      this.options[key] = option;
      return;
    }
    this.options[key].addEntitiesFromAnotherOption(option);
  }

  getOptions() {
    return Object.values(this.options);
  }

  getOptionsForName(optionName) {
    if (!optionName) {
      return [];
    }
    return this.getOptions().filter(option => option.name === optionName);
  }

  has(optionName) {
    if (!optionName) {
      return false;
    }
    return (
      !!this.options[optionName] || Object.keys(this.options).filter(option => option.includes(optionName)).length !== 0
    );
  }

  size() {
    return Object.keys(this.options).length;
  }

  forEach(passedFunction, thisArg) {
    if (!passedFunction) {
      return;
    }
    Object.values(this.options).forEach(jdlOption => {
      passedFunction.call(thisArg, jdlOption);
    });
  }

  toString() {
    if (Object.keys(this.options).length === 0) {
      return '';
    }
    return Object.values(this.options)
      .map(jdlOption => `${jdlOption.toString()}`)
      .join('\n');
  }
}

function getOptionKey(option) {
  return option.getType() === 'UNARY' ? option.name : `${option.name}_${option.value}`;
}

module.exports = JDLOptions;
