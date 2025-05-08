import CoreSharedData from '../base-core/shared-data.js';
import type { BaseApplication, BaseApplicationSource, BaseControl, BaseEntity } from './types.js';

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
export default class BaseSharedData<
  Entity extends BaseEntity,
  ApplicationSource extends BaseApplicationSource,
  Application extends BaseApplication<any>,
  Control extends BaseControl,
> extends CoreSharedData<ApplicationSource, Control> {
  getApplication(): Application {
    if (!this._storage.sharedApplication) throw new Error('Shared application not loaded');
    return this._storage.sharedApplication;
  }
  setEntity(entityName: string, entity: { name: string } & Partial<Entity>): void {
    this._storage.sharedEntities[entityName] = entity;
  }

  hasEntity(entityName: string): boolean {
    return Boolean(this._storage.sharedEntities[entityName]);
  }

  getEntity(entityName: string): Entity {
    const entity = this._storage.sharedEntities[entityName];
    if (!entity) {
      throw new Error(`Entity definition not loaded for ${entityName}`);
    }
    return entity;
  }

  getEntities(entityNames = Object.keys(this._storage.sharedEntities)): { entityName: string; entity: Entity }[] {
    return entityNames.map(entityName => ({ entityName, entity: this.getEntity(entityName) }));
  }

  getEntitiesMap(): Record<string, Entity> {
    return this._storage.sharedEntities;
  }
}
