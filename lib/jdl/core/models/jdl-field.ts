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

import { upperFirst } from 'lodash-es';

import { merge } from '../utils/object-utils.ts';

import type AbstractJDLOption from './abstract-jdl-option.js';
import type JDLValidation from './jdl-validation.js';

export default class JDLField {
  name: string;
  type: string;
  comment?: string | undefined;
  validations: Record<string, JDLValidation>;
  options: Record<string, AbstractJDLOption | boolean | string | number | string[] | boolean[] | number[]>;

  constructor(args: Partial<JDLField>) {
    const merged: Partial<JDLField> = merge(defaults(), args);
    if (!merged.name || !merged.type) {
      throw new Error('The field name and type are mandatory to create a field.');
    }
    this.name = merged.name;
    this.type = merged.type;
    this.comment = merged.comment;
    this.validations = merged.validations ?? {};
    this.options = merged.options ?? {};
  }

  addValidation(validation: JDLValidation) {
    if (!validation) {
      throw new Error("Can't add a nil JDL validation to the JDL field.");
    }
    this.validations[validation.name] = validation;
  }

  forEachValidation(functionToApply: (validation: JDLValidation) => void) {
    if (!functionToApply) {
      throw new Error('A function must be passed to iterate over validations');
    }
    Object.values(this.validations).forEach(functionToApply);
  }

  validationQuantity() {
    return Object.keys(this.validations).length;
  }

  forEachOption(
    functionToApply: (value: [string, AbstractJDLOption | boolean | number | string | string[] | boolean[] | number[]]) => void,
  ) {
    if (!functionToApply) {
      throw new Error('A function must be passed to iterate over options');
    }
    Object.entries(this.options).forEach(functionToApply);
  }

  optionQuantity() {
    return Object.keys(this.options).length;
  }

  toString(): string {
    let string = '';
    if (this.comment) {
      string += `/**\n${this.comment
        .split('\n')
        .map(line => ` * ${line}\n`)
        .join('')} */\n`;
    }
    Object.entries(this.options ?? {}).forEach(([key, value]) => {
      key = upperFirst(key);
      if (value === true) {
        string += `@${key}\n`;
      } else if (typeof value === 'string') {
        string += `@${key}("${value}")\n`;
      } else {
        string += `@${key}(${value})\n`;
      }
    });
    string += `${this.name} ${this.type}`;
    Object.keys(this.validations).forEach(validationName => {
      string += ` ${this.validations[validationName].toString()}`;
    });
    return string;
  }
}

function defaults(): Pick<JDLField, 'validations' | 'options'> {
  return {
    validations: {},
    options: {},
  };
}
