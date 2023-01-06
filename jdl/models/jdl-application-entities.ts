/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
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

import { join } from '../utils/set-utils.js';

export default class JDLApplicationEntities {
  entityNames: Set<string>;

  /**
   * Creates a new instance.
   * @param entityNames - the entity names.
   */
  constructor(entityNames: string[] = []) {
    this.entityNames = new Set(entityNames);
  }

  add(entityName) {
    if (!entityName) {
      throw new Error('An entity name has to be passed so as to be added.');
    }
    this.entityNames.add(entityName);
  }

  addEntityNames(entityNames = []) {
    const filteredNames = entityNames.filter(entityName => !!entityName);
    this.entityNames = new Set([...this.entityNames, ...filteredNames]);
  }

  has(entityName) {
    return this.entityNames.has(entityName);
  }

  forEach(passedFunction) {
    if (!passedFunction) {
      return;
    }
    this.entityNames.forEach(entityName => {
      passedFunction(entityName);
    });
  }

  toArray() {
    return Array.from(this.entityNames);
  }

  size() {
    return this.entityNames.size;
  }

  toString(indent = 0) {
    if (this.entityNames.size === 0) {
      return '';
    }
    const spaceBefore = ' '.repeat(indent);
    return `${spaceBefore}entities ${join(this.entityNames, ', ')}`;
  }
}
