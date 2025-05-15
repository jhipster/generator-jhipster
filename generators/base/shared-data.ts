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
import { defaults } from 'lodash-es';
import type { MemFsEditor } from 'mem-fs-editor';
import { create } from 'mem-fs-editor';
import type { ApplicationType, BaseApplicationSource } from '../../lib/types/application/application.js';
import type { Entity } from '../../lib/types/application/entity.js';
import type { Entity as BaseEntity } from '../../lib/types/base/entity.js';
import type { Control } from './types.js';

export default class SharedData<EntityType extends BaseEntity = Entity, Application = ApplicationType> {
  _storage: any;
  _editor: MemFsEditor;
  _log: any;
  _logCwd: string;

  constructor(storage: any, { memFs, log, logCwd }, initialControl: Partial<Control> = {}) {
    if (!storage) {
      throw new Error('Storage is required for SharedData');
    }

    this._editor = create(memFs);
    this._log = log;
    this._logCwd = logCwd;

    // Backward compatibility sharedData
    this._storage = storage;

    defaults(this._storage, {
      sharedDeployment: {},
      sharedEntities: {},
      sharedApplication: {},
      sharedSource: {},
      control: initialControl,
      props: {},
    });

    defaults(this._storage.sharedApplication, {
      nodeDependencies: {},
      customizeTemplatePaths: [],
      user: undefined,
    });
  }

  getSource(): BaseApplicationSource {
    return this._storage.sharedSource;
  }

  getApplication(): Application {
    if (!this._storage.sharedApplication) throw new Error('Shared application not loaded');
    return this._storage.sharedApplication;
  }

  getDeployment(): Application {
    if (!this._storage.sharedDeployment) throw new Error('Shared application not loaded');
    return this._storage.sharedDeployment;
  }

  setEntity(entityName: string, entity: { name: string } & Partial<EntityType>): void {
    this._storage.sharedEntities[entityName] = entity;
  }

  hasEntity(entityName: string): boolean {
    return Boolean(this._storage.sharedEntities[entityName]);
  }

  getEntity(entityName: string): EntityType {
    const entity = this._storage.sharedEntities[entityName];
    if (!entity) {
      throw new Error(`Entity definition not loaded for ${entityName}`);
    }
    return entity;
  }

  getEntities(entityNames = Object.keys(this._storage.sharedEntities)): { entityName: string; entity: EntityType }[] {
    return entityNames.map(entityName => ({ entityName, entity: this.getEntity(entityName) }));
  }

  getEntitiesMap(): Record<string, EntityType> {
    return this._storage.sharedEntities;
  }
}
