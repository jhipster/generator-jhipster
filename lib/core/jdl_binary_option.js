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
const BinaryOptions = require('./jhipster/binary_options');

/**
 * For options like the DTO, the service, etc.
 */
class JDLBinaryOption extends AbstractJDLOption {
  constructor(args) {
    super(args);
    if (!BinaryOptions.exists(this.name, args.value)) {
      let valueText = `value '${args.value}'`;
      if (!args.value) {
        valueText = 'no value';
      }
      throw new Error(
        `The option's name and value must be valid to create an option, got ${valueText} for '${this.name}'.`
      );
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
    if (this.name === BinaryOptions.Options.PAGINATION) {
      optionName = 'paginate';
    } else if (this.name === BinaryOptions.Options.SEARCH_ENGINE) {
      optionName = 'search';
    }
    const firstPart = `${optionName} ${entityNames} with ${this.value}`;
    if (this.excludedNames.size === 0) {
      return firstPart;
    }
    const excludedNames = this.excludedNames.join(', ');
    excludedNames.slice(1, this.excludedNames.length - 1);
    return `${firstPart} except ${excludedNames}`;
  }

  static isValid(option) {
    return AbstractJDLOption.isValid(option) && BinaryOptions.exists(option.name, option.value);
  }
}

module.exports = JDLBinaryOption;
