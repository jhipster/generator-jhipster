import type { Merge, OmitIndexSignature, Simplify } from 'type-fest';

import type { Storage } from 'yeoman-generator';
import type { TaskTypes as BaseTaskTypes, TaskParamWithControl, TaskParamWithSource } from '../base/tasks.js';
import type { BaseControl } from '../base/types.js';
import type {
  BaseApplicationApplication,
  BaseApplicationControl,
  BaseApplicationEntity,
  BaseApplicationField,
  BaseApplicationPrimaryKey,
  BaseApplicationRelationship,
  BaseApplicationSources,
} from './types.js';
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

type EntityToLoad<
  F extends BaseApplicationField,
  PK extends BaseApplicationPrimaryKey<F>,
  R extends BaseApplicationRelationship<any>,
  E extends BaseApplicationEntity<F, PK, R>,
> = {
  entityName: string;
  /** Entity storage */
  entityStorage: Storage;
  /** Proxy object for the entitystorage */
  entityConfig: E;
  /** Initial entity object */
  entityBootstrap: E;
};

type EntityTaskParam<
  F extends BaseApplicationField,
  PK extends BaseApplicationPrimaryKey<F>,
  R extends BaseApplicationRelationship<any>,
  E extends BaseApplicationEntity<F, PK, R>,
> = {
  entity: E;
  entityName: string;
  description: string;
};

type ApplicationDefaultsTaskParam<
  F extends BaseApplicationField,
  PK extends BaseApplicationPrimaryKey<F>,
  R extends BaseApplicationRelationship<any>,
  E extends BaseApplicationEntity<F, PK, R>,
  A extends BaseApplicationApplication<F, PK, R, E>,
> = {
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
type TaskParamWithApplication<
  F extends BaseApplicationField,
  PK extends BaseApplicationPrimaryKey<F>,
  R extends BaseApplicationRelationship<any>,
  E extends BaseApplicationEntity<F, PK, R>,
  A extends BaseApplicationApplication<F, PK, R, E>,
  C extends BaseApplicationControl,
> = TaskParamWithControl<C> & {
  application: A;
};
type TaskParamWithEntities<
  F extends BaseApplicationField,
  PK extends BaseApplicationPrimaryKey<F>,
  R extends BaseApplicationRelationship<any>,
  E extends BaseApplicationEntity<F, PK, R>,
  A extends BaseApplicationApplication<F, PK, R, E>,
  C extends BaseApplicationControl,
> = TaskParamWithApplication<F, PK, R, E, A, C> & {
  entities: E[];
};

type TaskParamWithApplicationDefaults<
  F extends BaseApplicationField,
  PK extends BaseApplicationPrimaryKey<F>,
  R extends BaseApplicationRelationship<any>,
  E extends BaseApplicationEntity<F, PK, R>,
  A extends BaseApplicationApplication<F, PK, R, E>,
  C extends BaseApplicationControl,
> = TaskParamWithControl<C> & TaskParamWithApplication<F, PK, R, E, A, C> & ApplicationDefaultsTaskParam<F, PK, R, E, A>;

type PreparingTaskParam<
  F extends BaseApplicationField,
  PK extends BaseApplicationPrimaryKey<F>,
  R extends BaseApplicationRelationship<any>,
  E extends BaseApplicationEntity<F, PK, R>,
  A extends BaseApplicationApplication<F, PK, R, E>,
  S extends BaseApplicationSources<F, PK, R, E, A>,
  C extends BaseApplicationControl,
> = TaskParamWithApplicationDefaults<F, PK, R, E, A, C> & TaskParamWithSource<C, S>;

type ConfiguringEachEntityTaskParam<
  F extends BaseApplicationField,
  PK extends BaseApplicationPrimaryKey<F>,
  R extends BaseApplicationRelationship<any>,
  E extends BaseApplicationEntity<F, PK, R>,
  A extends BaseApplicationApplication<F, PK, R, E>,
  C extends BaseApplicationControl,
> = TaskParamWithApplication<F, PK, R, E, A, C> & {
  entityName: string;
  /** Entity storage */
  entityStorage: Storage;
  /** Proxy object for the entitystorage */
  entityConfig: E & Record<string, any>;
};

type LoadingEntitiesTaskParam<
  F extends BaseApplicationField,
  PK extends BaseApplicationPrimaryKey<F>,
  R extends BaseApplicationRelationship<any>,
  E extends BaseApplicationEntity<F, PK, R>,
  A extends BaseApplicationApplication<F, PK, R, E>,
  C extends BaseApplicationControl,
> = TaskParamWithApplication<F, PK, R, E, A, C> & {
  entitiesToLoad: EntityToLoad<F, PK, R, E>[];
};

type PreparingEachEntityTaskParam<
  F extends BaseApplicationField,
  PK extends BaseApplicationPrimaryKey<F>,
  R extends BaseApplicationRelationship<any>,
  E extends BaseApplicationEntity<F, PK, R>,
  A extends BaseApplicationApplication<F, PK, R, E>,
  C extends BaseApplicationControl,
> = TaskParamWithApplication<F, PK, R, E, A, C> & EntityTaskParam<F, PK, R, E>;

type PreparingEachEntityFieldTaskParam<
  F extends BaseApplicationField,
  PK extends BaseApplicationPrimaryKey<F>,
  R extends BaseApplicationRelationship<any>,
  E extends BaseApplicationEntity<F, PK, R>,
  A extends BaseApplicationApplication<F, PK, R, E>,
  C extends BaseApplicationControl,
> = PreparingEachEntityTaskParam<F, PK, R, E, A, C> & {
  field: F;
  fieldName: string;
};

type PreparingEachEntityRelationshipTaskParam<
  F extends BaseApplicationField,
  PK extends BaseApplicationPrimaryKey<F>,
  R extends BaseApplicationRelationship<any>,
  E extends BaseApplicationEntity<F, PK, R>,
  A extends BaseApplicationApplication<F, PK, R, E>,
  C extends BaseApplicationControl,
> = PreparingEachEntityTaskParam<F, PK, R, E, A, C> & {
  relationship: R;
  relationshipName: string;
};

type WritingTaskParam<
  F extends BaseApplicationField,
  PK extends BaseApplicationPrimaryKey<F>,
  R extends BaseApplicationRelationship<any>,
  E extends BaseApplicationEntity<F, PK, R>,
  A extends BaseApplicationApplication<F, PK, R, E>,
  C extends BaseApplicationControl,
> = TaskParamWithApplication<F, PK, R, E, A, C> & {
  configChanges?: Record<string, { newValue: any; oldValue: any }>;
};

type PostWritingTaskParam<
  F extends BaseApplicationField,
  PK extends BaseApplicationPrimaryKey<F>,
  R extends BaseApplicationRelationship<any>,
  E extends BaseApplicationEntity<F, PK, R>,
  A extends BaseApplicationApplication<F, PK, R, E>,
  S extends BaseApplicationSources<F, PK, R, E, A>,
  C extends BaseApplicationControl,
> = TaskParamWithApplication<F, PK, R, E, A, C> & TaskParamWithSource<C, S>;

type PostWritingEntitiesTaskParam<
  F extends BaseApplicationField,
  PK extends BaseApplicationPrimaryKey<F>,
  R extends BaseApplicationRelationship<any>,
  E extends BaseApplicationEntity<F, PK, R>,
  A extends BaseApplicationApplication<F, PK, R, E>,
  S extends BaseApplicationSources<F, PK, R, E, A>,
  C extends BaseApplicationControl,
> = TaskParamWithEntities<F, PK, R, E, A, C> & TaskParamWithSource<C, S>;

export type TaskTypes<
  F extends BaseApplicationField,
  PK extends BaseApplicationPrimaryKey<F>,
  R extends BaseApplicationRelationship<any>,
  E extends BaseApplicationEntity<F, PK, R>,
  A extends BaseApplicationApplication<F, PK, R, E>,
  S extends BaseApplicationSources<F, PK, R, E, A>,
  C extends BaseControl,
> = Merge<
  BaseTaskTypes<C, S>,
  {
    LoadingTaskParam: TaskParamWithApplicationDefaults<F, PK, R, E, A, C>;
    PreparingTaskParam: PreparingTaskParam<F, PK, R, E, A, S, C>;
    ConfiguringEachEntityTaskParam: ConfiguringEachEntityTaskParam<F, PK, R, E, A, C>;
    LoadingEntitiesTaskParam: LoadingEntitiesTaskParam<F, PK, R, E, A, C>;
    PreparingEachEntityTaskParam: PreparingEachEntityTaskParam<F, PK, R, E, A, C>;
    PreparingEachEntityFieldTaskParam: PreparingEachEntityFieldTaskParam<F, PK, R, E, A, C>;
    PreparingEachEntityRelationshipTaskParam: PreparingEachEntityRelationshipTaskParam<F, PK, R, E, A, C>;
    PostPreparingEachEntityTaskParam: PreparingEachEntityTaskParam<F, PK, R, E, A, C>;
    PostPreparingTaskParam: TaskParamWithSource<C, S> & TaskParamWithApplication<F, PK, R, E, A, C>;
    DefaultTaskParam: TaskParamWithEntities<F, PK, R, E, A, C>;
    WritingTaskParam: WritingTaskParam<F, PK, R, E, A, C>;
    WritingEntitiesTaskParam: TaskParamWithEntities<F, PK, R, E, A, C>;
    PostWritingTaskParam: PostWritingTaskParam<F, PK, R, E, A, S, C>;
    PostWritingEntitiesTaskParam: PostWritingEntitiesTaskParam<F, PK, R, E, A, S, C>;
    PreConflictsTaskParam: TaskParamWithApplication<F, PK, R, E, A, C>;
    InstallTaskParam: TaskParamWithApplication<F, PK, R, E, A, C>;
    PostInstallTaskParam: TaskParamWithApplication<F, PK, R, E, A, C>;
    EndTaskParam: TaskParamWithApplication<F, PK, R, E, A, C>;
  }
>;
