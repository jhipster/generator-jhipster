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
import type { Entity } from '../../lib/types/application/entity.js';
import type { Source as BaseSource } from './types.js';
import type { ApplicationAll, SourceAll } from './types-all.js';

type GetRelationshipType<E> = E extends { relationships: (infer R)[] } ? R : never;
type GetFieldType<E> = E extends { fields: (infer F)[] } ? F : never;

type TaskParamWithEntities<E, A> = TaskParamWithApplication<A> & {
  entities: E[];
};

type ConfiguringEachEntityTaskParam<E = Entity, A = ApplicationAll<E>> = TaskParamWithApplication<A> & {
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

type LoadingEntitiesTaskParam<E, A> = TaskParamWithApplication<A> & {
  entitiesToLoad: EntityToLoad<E>[];
};

type EntityTaskParam<E> = {
  entity: E;
  entityName: string;
  description: string;
};

type PreparingEachEntityTaskParam<E = Entity, A = ApplicationAll<E>> = TaskParamWithApplication<A> & EntityTaskParam<E>;

type PreparingEachEntityFieldTaskParam<E = Entity, A = ApplicationAll<E>> = PreparingEachEntityTaskParam<E, A> & {
  field: GetFieldType<E>;
  fieldName: string;
};

type PreparingEachEntityRelationshipTaskParam<E = Entity, A = ApplicationAll<E>> = PreparingEachEntityTaskParam<E, A> & {
  relationship: GetRelationshipType<E>;
  relationshipName: string;
};

type PostWritingEntitiesTaskParam<E = Entity, A = ApplicationAll<E>, Source extends BaseSource = SourceAll> = TaskParamWithEntities<E, A> &
  TaskParamWithSource<Source>;

export type TaskTypes<E = Entity, A = ApplicationAll<E>, S extends BaseSource = SourceAll> = SimpleTaskTypes<A, S> & {
  ConfiguringEachEntityTaskParam: ConfiguringEachEntityTaskParam<E, A>;
  LoadingEntitiesTaskParam: LoadingEntitiesTaskParam<E, A>;
  PreparingEachEntityTaskParam: PreparingEachEntityTaskParam<E, A>;
  PreparingEachEntityFieldTaskParam: PreparingEachEntityFieldTaskParam<E, A>;
  PreparingEachEntityRelationshipTaskParam: PreparingEachEntityRelationshipTaskParam<E, A>;
  PostPreparingEachEntityTaskParam: PreparingEachEntityTaskParam<E, A>;
  DefaultTaskParam: TaskParamWithEntities<E, A>;
  WritingEntitiesTaskParam: TaskParamWithEntities<E, A>;
  PostWritingEntitiesTaskParam: PostWritingEntitiesTaskParam<E, A, S>;
};
