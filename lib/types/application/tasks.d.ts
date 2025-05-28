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
import type { Merge, OmitIndexSignature, Simplify } from 'type-fest';
import type { Entity as BaseEntity } from '../base/entity.js';
import type { GetFieldType, GetRelationshipType } from '../utils/entity-utils.ts';
import type { TaskTypes as BaseTaskTypes, TaskParamWithControl, TaskParamWithSource } from '../../../generators/base/tasks.js';
import type { Application as SimpleApplication } from '../../../generators/base-simple-application/index.js';
import type { Entity } from './entity.js';
import type { ApplicationType, BaseApplicationSource } from './application.js';

type ApplicationDefaultsTaskParam<A> = {
  /**
   * Parameter properties accepts:
   * - functions: receives the application and the return value is set at the application property.
   * - non functions: application property will receive the property in case current value is undefined.
   *
   * Applies each object in order.
   *
   * @example
   * // application = { prop: 'foo-bar', prop2: 'foo2' }
   * applicationDefaults(
   *   application,
   *   { prop: 'foo', prop2: ({ prop }) => prop + 2 },
   *   { prop: ({ prop }) => prop + '-bar', prop2: 'won\'t override' },
   * );
   */
  applicationDefaults: (
    ...defaults: Simplify<
      OmitIndexSignature<{
        [Key in keyof (Partial<A> & { __override__?: boolean })]?: Key extends '__override__'
          ? boolean
          : Key extends keyof A
            ? A[Key] | ((ctx: A) => A[Key])
            : never;
      }>
    >[]
  ) => void;
};

type TaskParamWithApplication<A = ApplicationType<Entity>> = TaskParamWithControl & {
  application: A;
};

type TaskParamWithEntities<E = Entity, A = ApplicationType<E>> = TaskParamWithApplication<A> & {
  entities: E[];
};

type ConfiguringEachEntityTaskParam<E = Entity, A = ApplicationType<E>> = TaskParamWithApplication<A> & {
  entityName: string;
  /** Entity storage */
  entityStorage: Storage;
  /** Proxy object for the entitystorage */
  entityConfig: BaseEntity & Record<string, any>;
};

type EntityToLoad = {
  entityName: string;
  /** Entity storage */
  entityStorage: Storage;
  /** Proxy object for the entitystorage */
  entityConfig: BaseEntity;
  /** Initial entity object */
  entityBootstrap: Entity;
};

type LoadingEntitiesTaskParam<E = Entity, A = ApplicationType<E>> = TaskParamWithApplication<A> & {
  entitiesToLoad: EntityToLoad[];
};

type EntityTaskParam<E = Entity> = {
  entity: E;
  entityName: string;
  description: string;
};

type PreparingEachEntityTaskParam<E = Entity, A = ApplicationType<E>> = TaskParamWithApplication<A> & EntityTaskParam<E>;

type PreparingEachEntityFieldTaskParam<E = Entity, A = ApplicationType<E>> = PreparingEachEntityTaskParam<E, A> & {
  field: GetFieldType<E>;
  fieldName: string;
};

type PreparingEachEntityRelationshipTaskParam<E = Entity, A = ApplicationType<E>> = PreparingEachEntityTaskParam<E, A> & {
  relationship: GetRelationshipType<E>;
  relationshipName: string;
};

type PostWritingEntitiesTaskParam<E = Entity, A = ApplicationType<E>> = TaskParamWithEntities<E, A> &
  TaskParamWithSource<BaseApplicationSource>;

export type SimpleTaskTypes<A = SimpleApplication> = Merge<
  BaseTaskTypes,
  {
    BootstrapApplicationTaskParam: TaskParamWithControl & ApplicationDefaultsTaskParam<A>;
    LoadingTaskParam: TaskParamWithApplication<A> & ApplicationDefaultsTaskParam<A>;
    PreparingTaskParam: TaskParamWithSource<BaseApplicationSource> & TaskParamWithApplication<A> & ApplicationDefaultsTaskParam<A>;
    PostPreparingTaskParam: TaskParamWithSource<BaseApplicationSource> & TaskParamWithApplication<A>;
    DefaultTaskParam: TaskParamWithApplication<A>;
    WritingTaskParam: TaskParamWithApplication<A>;
    PostWritingTaskParam: TaskParamWithSource<BaseApplicationSource> & TaskParamWithApplication<A>;
    PreConflictsTaskParam: TaskParamWithApplication<A>;
    InstallTaskParam: TaskParamWithApplication<A>;
    PostInstallTaskParam: TaskParamWithApplication<A>;
    EndTaskParam: TaskParamWithApplication<A>;
  }
>;

export type TaskTypes<E = Entity, A = ApplicationType<E>> = SimpleTaskTypes<A> & {
  ConfiguringEachEntityTaskParam: ConfiguringEachEntityTaskParam<E, A>;
  LoadingEntitiesTaskParam: LoadingEntitiesTaskParam<E, A>;
  PreparingEachEntityTaskParam: PreparingEachEntityTaskParam<E, A>;
  PreparingEachEntityFieldTaskParam: PreparingEachEntityFieldTaskParam<E, A>;
  PreparingEachEntityRelationshipTaskParam: PreparingEachEntityRelationshipTaskParam<E, A>;
  PostPreparingEachEntityTaskParam: PreparingEachEntityTaskParam<E, A>;
  DefaultTaskParam: TaskParamWithEntities<E, A>;
  WritingEntitiesTaskParam: TaskParamWithEntities<E, A>;
  PostWritingEntitiesTaskParam: PostWritingEntitiesTaskParam<E, A>;
};
