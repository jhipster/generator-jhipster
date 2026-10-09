/**
 * Copyright 2013-2026 the original author or authors from the JHipster project.
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

import type { MutateDataParam } from '../../lib/utils/object.ts';
import type { TaskParamWithSource } from '../base/tasks.ts';
import type { SimpleTaskTypes, TaskParamWithApplication } from '../base-simple-application/tasks.ts';

import type {
  Application as BaseApplicationApplication,
  Entity as BaseApplicationEntity,
  Source as BaseApplicationSource,
} from './types.ts';

type GetRelationshipType<E> = E extends { relationships: (infer R)[] } ? R : never;
type GetFieldType<E> = E extends { fields: (infer F)[] } ? F : never;

type TaskParamWithEntities<E extends BaseApplicationEntity, A extends BaseApplicationApplication<E>> = TaskParamWithApplication<A> & {
  entities: E[];
};

type ConfiguringEachEntityTaskParam<
  E extends BaseApplicationEntity,
  A extends BaseApplicationApplication<E>,
> = TaskParamWithApplication<A> & {
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

type LoadingEntitiesTaskParam<E extends BaseApplicationEntity, A extends BaseApplicationApplication<E>> = TaskParamWithApplication<A> & {
  entitiesToLoad: EntityToLoad<E>[];
};

type EntityTaskParam<E> = {
  entity: E;
  entityName: string;
  description: string;
};

type PreparingEachEntityTaskParam<E extends BaseApplicationEntity, A extends BaseApplicationApplication<E>> = TaskParamWithApplication<A> &
  EntityTaskParam<E>;

export type EntityDefaultsTaskParam<E extends BaseApplicationEntity = BaseApplicationEntity> = {
  /**
   * Sets the defaults of the entity, as `applicationDefaults` does for the application: a property the entity already has,
   * from its file, an annotation of the jdl or a previous task, is kept. Parameter properties accepts:
   * - functions: receives the entity and the return value is set at the entity property.
   * - non functions: entity property will receive the property in case current value is undefined.
   *
   * Applies each object in order.
   *
   * @example
   * // entity = { name: 'Foo', entityUrl: 'custom' }
   * entityDefaults(
   *   { entityUrl: ({ name }) => kebabCase(name), entityPage: ({ entityUrl }) => `${entityUrl}-page` },
   * );
   * // entity = { name: 'Foo', entityUrl: 'custom', entityPage: 'custom-page' }
   */
  entityDefaults: (...defaults: MutateDataParam<E>[]) => void;
};

export type FieldDefaultsTaskParam<F extends object> = {
  /** Sets the defaults of the field, as `entityDefaults` does for the entity: a value the field already has is kept. */
  fieldDefaults: (...defaults: MutateDataParam<F>[]) => void;
};

export type RelationshipDefaultsTaskParam<R extends object> = {
  /**
   * Sets the defaults of the relationship, as `entityDefaults` does for the entity: a value the relationship already has
   * is kept.
   */
  relationshipDefaults: (...defaults: MutateDataParam<R>[]) => void;
};

type PreparingEachEntityFieldTaskParam<
  E extends BaseApplicationEntity,
  A extends BaseApplicationApplication<E>,
> = PreparingEachEntityTaskParam<E, A> & {
  field: GetFieldType<E>;
  fieldName: string;
};

type PreparingEachEntityRelationshipTaskParam<
  E extends BaseApplicationEntity,
  A extends BaseApplicationApplication<E>,
> = PreparingEachEntityTaskParam<E, A> & {
  relationship: GetRelationshipType<E>;
  relationshipName: string;
};

type PostWritingEntitiesTaskParam<
  E extends BaseApplicationEntity,
  A extends BaseApplicationApplication<E>,
  S extends BaseApplicationSource,
> = TaskParamWithEntities<E, A> & TaskParamWithSource<S>;

export type TaskTypes<
  E extends BaseApplicationEntity,
  A extends BaseApplicationApplication<E>,
  S extends BaseApplicationSource = BaseApplicationSource,
> = SimpleTaskTypes<A, S> & {
  ConfiguringEachEntityTaskParam: ConfiguringEachEntityTaskParam<E, A>;
  LoadingEntitiesTaskParam: LoadingEntitiesTaskParam<E, A>;
  PreparingEachEntityTaskParam: PreparingEachEntityTaskParam<E, A> & EntityDefaultsTaskParam<E>;
  PreparingEachEntityFieldTaskParam: PreparingEachEntityFieldTaskParam<E, A> & FieldDefaultsTaskParam<GetFieldType<E>>;
  PreparingEachEntityRelationshipTaskParam: PreparingEachEntityRelationshipTaskParam<E, A> &
    RelationshipDefaultsTaskParam<GetRelationshipType<E>>;
  PostPreparingEachEntityTaskParam: PreparingEachEntityTaskParam<E, A>;
  DefaultTaskParam: TaskParamWithEntities<E, A>;
  WritingEntitiesTaskParam: TaskParamWithEntities<E, A>;
  PostWritingEntitiesTaskParam: PostWritingEntitiesTaskParam<E, A, S>;
};
