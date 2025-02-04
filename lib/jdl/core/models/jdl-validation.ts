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

import { merge } from '../utils/object-utils.js';
import { validations } from '../built-in-options/index.js';

const {
  Validations: { REQUIRED, PATTERN },
} = validations;

export default class JDLValidation {
  name: string;
  value?: string | number | RegExp | boolean;

  constructor(args: Partial<JDLValidation>) {
    const merged = merge(defaults(), args);
    this.name = merged.name!;
    this.value = merged.value;
  }

  toString() {
    let string = `${this.name}`;
    if (this.value || this.value === 0) {
      string += `(${formatValidationValue(this.name, this.value)})`;
    }
    return string;
  }
}

function defaults(): JDLValidation {
  return {
    name: REQUIRED,
    value: '',
  };
}

function formatValidationValue(name: string, value: string | number | RegExp | boolean) {
  if (name === PATTERN) {
    return getPatternValidationValue(value);
  }
  return value;
}

function getPatternValidationValue(value: string | number | RegExp | boolean) {
  if (value instanceof RegExp) {
    return value.toString();
  }
  return `/${value}/`;
}
