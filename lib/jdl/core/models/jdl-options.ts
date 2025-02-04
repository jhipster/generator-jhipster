/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import type JDLBinaryOption from './jdl-binary-option.js';
import type JDLUnaryOption from './jdl-unary-option.js';
import type AbstractJDLOption from './abstract-jdl-option.js';

export default class JDLOptions {
  options: Record<string, AbstractJDLOption>;
  optionSize: number;

  constructor() {
    this.options = {};
    this.optionSize = 0;
  }

  addOption(option: AbstractJDLOption): void {
    if (!option?.getType) {
      throw new Error("Can't add nil option.");
    }
    if (option.getType() === 'UNARY') {
      addUnaryOption(this.options, option as JDLUnaryOption);
    } else {
      addBinaryOption(this.options, option as JDLBinaryOption);
    }
    this.optionSize++;
  }

  getOptions(): AbstractJDLOption[] {
    const options: any[] = [];
    Object.values(this.options).forEach(item => {
      if (item.getType && item.getType() === 'UNARY') {
        options.push(item);
        return;
      }
      Object.values(item).forEach(option => options.push(option));
    });
    return options;
  }

  getOptionsForName(optionName: string): AbstractJDLOption[] {
    if (!optionName) {
      return [];
    }
    return this.getOptions().filter(option => option.name === optionName);
  }

  has(optionName?: string): boolean {
    if (!optionName) {
      return false;
    }
    return !!this.options[optionName] || this.getOptions().filter(option => option.name === optionName).length !== 0;
  }

  size(): number {
    return this.optionSize;
  }

  forEach(passedFunction: (option: AbstractJDLOption) => void, thisArg?: any) {
    if (!passedFunction) {
      return;
    }
    this.getOptions().forEach(jdlOption => {
      passedFunction.call(thisArg, jdlOption);
    });
  }

  toString(indent = 0): string {
    if (this.optionSize === 0) {
      return '';
    }
    const options = this.getOptions();
    const spaceBeforeEachOption = ' '.repeat(indent);
    return options.map(jdlOption => `${spaceBeforeEachOption}${jdlOption.toString()}`).join('\n');
  }
}

function addUnaryOption(options: Record<string, JDLUnaryOption | JDLBinaryOption>, optionToAdd: JDLUnaryOption): void {
  const key = optionToAdd.name;
  if (!options[key]) {
    options[key] = optionToAdd;
    return;
  }
  options[key].addEntitiesFromAnotherOption(optionToAdd);
}

function addBinaryOption(options: Record<string, any>, optionToAdd: JDLBinaryOption): void {
  const { name, value } = optionToAdd;

  if (!options[name]) {
    options[name] = {
      [value]: optionToAdd,
    };
  } else if (!options[name][value]) {
    options[name][value] = optionToAdd;
  } else {
    options[name][value].addEntitiesFromAnotherOption(optionToAdd);
  }
}
