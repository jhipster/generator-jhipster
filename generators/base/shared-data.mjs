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
import assert from 'assert';

/**
 * @template {import('../bootstrap-application-base/types.js').BaseApplication} ApplicationType
 */
export default class SharedData {
  constructor(storage) {
    if (!storage) {
      throw new Error('Storage is required for SharedData');
    }
    this._configDefaultValues = {};
    this._configChoices = {};

    // Backward compatibility sharedData
    this._storage = storage;
    this._storage.sharedEntities = this._storage.sharedEntities || {};
    this._storage.sharedApplication = this._storage.sharedApplication || {};
    this._storage.sharedSource = this._storage.sharedSource || {};
    this._storage.sharedData = this._storage.sharedData || {};
  }

  getSource() {
    return this._storage.sharedSource;
  }

  /**
   * @returns {import('./types.mjs').Control}
   */
  getControl() {
    return this._storage.sharedData;
  }

  /**
   * @returns {ApplicationType}
   */
  getApplication() {
    if (!this._storage.sharedApplication) throw new Error('Shared application not loaded');
    return this._storage.sharedApplication;
  }

  setEntity(entityName, entity) {
    this._storage.sharedEntities[entityName] = entity;
  }

  hasEntity(entityName) {
    return Boolean(this._storage.sharedEntities[entityName]);
  }

  getEntity(entityName) {
    const entity = this._storage.sharedEntities[entityName];
    if (!entity) {
      throw new Error(`Entity definition not loaded for ${entityName}`);
    }
    return entity;
  }

  getEntities(entityNames = Object.keys(this._storage.sharedEntities)) {
    return entityNames.map(entityName => ({ entityName, entity: this.getEntity(entityName) }));
  }

  getEntitiesMap() {
    return this._storage.sharedEntities;
  }
}
