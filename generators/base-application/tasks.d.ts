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
import type { Storage } from 'yeoman-generator';
import type { TaskParamWithSource } from '../base/tasks.js';
import type { SimpleTaskTypes, TaskParamWithApplication } from '../base-simple-application/tasks.js';
import type { Entity } from './entity-all.js';
import type { Application as BaseApplication, Source as BaseSource, Control } from './types.js';
import type { ApplicationAll } from './application-properties-all.js';
import type { SourceAll } from './source-all.d.ts';

type GetRelationshipType<E> = E extends { relationships: (infer R)[] } ? R : never;
type GetFieldType<E> = E extends { fields: (infer F)[] } ? F : never;

type TaskParamWithEntities<C extends Control, E extends Entity, A extends BaseApplication> = TaskParamWithApplication<C, A> & {
  entities: E[];
};

type ConfiguringEachEntityTaskParam<
  C extends Control = Control,
  E extends Entity = Entity,
  A extends BaseApplication = ApplicationAll<E>,
> = TaskParamWithApplication<C, A> & {
  entityName: string;
  /** Entity storage */
  entityStorage: Storage;
  /** Proxy object for the entitystorage */
  entityConfig: Partial<E> & Record<string, any>;
};

type EntityToLoad<E> = {
  entityName: string;
  /** Entity storage */
  entityStorage: Storage;
  /** Proxy object for the entitystorage */
  entityConfig: Partial<E>;
  /** Initial entity object */
  entityBootstrap: E;
};

type LoadingEntitiesTaskParam<C extends Control, E extends Entity, A extends BaseApplication> = TaskParamWithApplication<C, A> & {
  entitiesToLoad: EntityToLoad<E>[];
};

type EntityTaskParam<E> = {
  entity: E;
  entityName: string;
  description: string;
};

type PreparingEachEntityTaskParam<
  C extends Control = Control,
  E extends Entity = Entity,
  A extends BaseApplication = ApplicationAll<E>,
> = TaskParamWithApplication<C, A> & EntityTaskParam<E>;

type PreparingEachEntityFieldTaskParam<
  C extends Control = Control,
  E extends Entity = Entity,
  A extends BaseApplication = ApplicationAll<E>,
> = PreparingEachEntityTaskParam<C, E, A> & {
  field: GetFieldType<E>;
  fieldName: string;
};

type PreparingEachEntityRelationshipTaskParam<
  C extends Control = Control,
  E extends Entity = Entity,
  A extends BaseApplication = ApplicationAll<E>,
> = PreparingEachEntityTaskParam<C, E, A> & {
  relationship: GetRelationshipType<E>;
  relationshipName: string;
};

type PostWritingEntitiesTaskParam<
  C extends Control = Control,
  E extends Entity = Entity,
  A extends BaseApplication = ApplicationAll<E>,
  S extends BaseSource = SourceAll,
> = TaskParamWithEntities<C, E, A> & TaskParamWithSource<C, S>;

export type TaskTypes<
  C extends Control = Control,
  E extends Entity = Entity,
  A extends BaseApplication = ApplicationAll<E>,
  S extends BaseSource = SourceAll,
> = SimpleTaskTypes<C, A, S> & {
  ConfiguringEachEntityTaskParam: ConfiguringEachEntityTaskParam<C, E, A>;
  LoadingEntitiesTaskParam: LoadingEntitiesTaskParam<C, E, A>;
  PreparingEachEntityTaskParam: PreparingEachEntityTaskParam<C, E, A>;
  PreparingEachEntityFieldTaskParam: PreparingEachEntityFieldTaskParam<C, E, A>;
  PreparingEachEntityRelationshipTaskParam: PreparingEachEntityRelationshipTaskParam<C, E, A>;
  PostPreparingEachEntityTaskParam: PreparingEachEntityTaskParam<C, E, A>;
  DefaultTaskParam: TaskParamWithEntities<C, E, A>;
  WritingEntitiesTaskParam: TaskParamWithEntities<C, E, A>;
  PostWritingEntitiesTaskParam: PostWritingEntitiesTaskParam<C, E, A, S>;
};
