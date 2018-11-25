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
    this.optionSize = 0;
  }

  addOption(option) {
    const errors = AbstractJDLOption.checkValidity(option);
    if (errors.length !== 0) {
      throw new Error(`The passed option is invalid and can't be added.\nErrors: ${errors.join(', ')}`);
    }
    this.optionSize++;
    if (option.getType() === 'UNARY') {
      addUnaryOption(this.options, option);
      return;
    }
    addBinaryOption(this.options, option);
  }

  getOptions() {
    const options = [];
    Object.values(this.options).forEach(item => {
      if (item.getType && item.getType() === 'UNARY') {
        options.push(item);
        return;
      }
      Object.values(item).forEach(option => options.push(option));
    });
    return options;
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
    return !!this.options[optionName] || this.getOptions().filter(option => option.name === optionName).length !== 0;
  }

  size() {
    return this.optionSize;
  }

  forEach(passedFunction, thisArg) {
    if (!passedFunction) {
      return;
    }
    this.getOptions().forEach(jdlOption => {
      passedFunction.call(thisArg, jdlOption);
    });
  }

  toString() {
    if (this.optionSize === 0) {
      return '';
    }
    const options = this.getOptions();
    return options.map(jdlOption => `${jdlOption.toString()}`).join('\n');
  }
}

function addUnaryOption(options, optionToAdd) {
  const key = optionToAdd.name;
  if (!options[key]) {
    options[key] = optionToAdd;
    return;
  }
  options[key].addEntitiesFromAnotherOption(optionToAdd);
}

function addBinaryOption(options, optionToAdd) {
  const { name, value } = optionToAdd;

  if (!options[name]) {
    options[name] = {
      [value]: optionToAdd
    };
  } else if (!options[name][value]) {
    options[name][value] = optionToAdd;
  } else {
    options[name][value].addEntitiesFromAnotherOption(optionToAdd);
  }
}

module.exports = JDLOptions;
