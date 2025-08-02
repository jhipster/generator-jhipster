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

import BinaryOptions from '../built-in-options/binary-options.ts';
import { join } from '../utils/set-utils.ts';

import type { JDLOptionParams } from './abstract-jdl-option.js';
import AbstractJDLOption from './abstract-jdl-option.ts';

/**
 * For options like the DTO, the service, etc.
 */
export default class JDLBinaryOption extends AbstractJDLOption {
  value: string;

  constructor(args: JDLOptionParams & { value: string }) {
    super(args);
    if (typeof args.value !== 'string') {
      throw new Error('A binary option must have a value.');
    }
    this.value = args.value;
  }

  getType(): string {
    return 'BINARY';
  }

  toString(): string {
    const entityNames = join(this.entityNames, ', ');
    entityNames.slice(1, entityNames.length - 1);
    let optionName = this.name;
    if (this.name === BinaryOptions.Options.PAGINATION) {
      optionName = 'paginate';
    }
    const firstPart = `${optionName} ${entityNames} with ${this.value}`;
    if (this.excludedNames.size === 0) {
      return firstPart;
    }
    const excludedNames = join(this.excludedNames, ', ');
    excludedNames.slice(1, this.excludedNames.size - 1);
    return `${firstPart} except ${excludedNames}`;
  }
}
