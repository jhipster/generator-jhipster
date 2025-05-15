import BaseSharedData from '../base/shared-data.js';
import type { BaseApplicationApplication, BaseApplicationControl, BaseApplicationEntity, BaseApplicationSources } from './types.js';

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
export default class BaseApplicationSharedData<
  Entity extends BaseApplicationEntity,
  Application extends BaseApplicationApplication<Entity>,
  Source extends BaseApplicationSources<Entity, Application>,
  Control extends BaseApplicationControl,
> extends BaseSharedData<Entity, Application, Source, Control> {
  setEntity(entityName: string, entity: Partial<Entity> & { name: string }): void {
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
