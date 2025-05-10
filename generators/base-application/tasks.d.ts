import type { Merge } from 'type-fest';

import type { Storage } from 'yeoman-generator';
import type { TaskTypes as BaseTaskTypes, TaskParamWithControl, TaskParamWithSource } from '../base/tasks.js';
import type { BaseApplication, BaseControl } from '../base/types.js';
import type { ApplicationDefaultsTaskParam, EntityTaskParam, EntityToLoad } from '../../lib/types/application/tasks.js';

import type { Entity as BaseEntity } from '../../lib/types/base/entity.js';
import type { GetFieldType, GetRelationshipType } from '../../lib/types/utils/entity-utils.js';
import type { BaseApplicationControl, BaseApplicationEntity, BaseApplicationSources } from './types.js';
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
type TaskParamWithApplication<
  E extends BaseApplicationEntity,
  BA extends BaseApplication<E>,
  A extends BaseApplicationSources<E, BA>,
  C extends BaseApplicationControl,
> = TaskParamWithControl<C> & {
  application: A;
};
type TaskParamWithEntities<
  E extends BaseApplicationEntity,
  BA extends BaseApplication<E>,
  A extends BaseApplicationSources<E, BA>,
  C extends BaseApplicationControl,
> = TaskParamWithApplication<E, BA, A, C> & {
  entities: E[];
};

type TaskParamWithApplicationDefaults<
  E extends BaseApplicationEntity,
  BA extends BaseApplication<E>,
  A extends BaseApplicationSources<E, BA>,
  C extends BaseApplicationControl,
> = TaskParamWithControl<C> & TaskParamWithApplication<E, BA, A, C> & ApplicationDefaultsTaskParam<E, A>;

type PreparingTaskParam<
  E extends BaseApplicationEntity,
  BA extends BaseApplication<E>,
  A extends BaseApplicationSources<E, BA>,
  C extends BaseApplicationControl,
> = TaskParamWithApplicationDefaults<E, BA, A, C> & TaskParamWithSource<C>;

type ConfiguringEachEntityTaskParam<
  E extends BaseApplicationEntity,
  BA extends BaseApplication<E>,
  A extends BaseApplicationSources<E, BA>,
  C extends BaseApplicationControl,
> = TaskParamWithApplication<E, BA, A, C> & {
  entityName: string;
  /** Entity storage */
  entityStorage: Storage;
  /** Proxy object for the entitystorage */
  entityConfig: BaseEntity & Record<string, any>;
};

type LoadingEntitiesTaskParam<
  E extends BaseApplicationEntity,
  BA extends BaseApplication<E>,
  A extends BaseApplicationSources<E, BA>,
  C extends BaseApplicationControl,
> = TaskParamWithApplication<E, BA, A, C> & {
  entitiesToLoad: EntityToLoad[];
};

type PreparingEachEntityTaskParam<
  E extends BaseApplicationEntity,
  BA extends BaseApplication<E>,
  A extends BaseApplicationSources<E, BA>,
  C extends BaseApplicationControl,
> = TaskParamWithApplication<E, BA, A, C> & EntityTaskParam<E>;

type PreparingEachEntityFieldTaskParam<
  E extends BaseApplicationEntity,
  BA extends BaseApplication<E>,
  A extends BaseApplicationSources<E, BA>,
  C extends BaseApplicationControl,
> = PreparingEachEntityTaskParam<E, BA, A, C> & {
  field: GetFieldType<E>;
  fieldName: string;
};

type PreparingEachEntityRelationshipTaskParam<
  E extends BaseApplicationEntity,
  BA extends BaseApplication<E>,
  A extends BaseApplicationSources<E, BA>,
  C extends BaseApplicationControl,
> = PreparingEachEntityTaskParam<E, BA, A, C> & {
  relationship: GetRelationshipType<E>;
  relationshipName: string;
};

type WritingTaskParam<
  E extends BaseApplicationEntity,
  BA extends BaseApplication<E>,
  A extends BaseApplicationSources<E, BA>,
  C extends BaseApplicationControl,
> = TaskParamWithApplication<E, BA, A, C> & {
  configChanges?: Record<string, { newValue: any; oldValue: any }>;
};

type PostWritingTaskParam<
  E extends BaseApplicationEntity,
  BA extends BaseApplication<E>,
  A extends BaseApplicationSources<E, BA>,
  C extends BaseApplicationControl,
> = TaskParamWithApplication<E, BA, A, C> & TaskParamWithSource<C, BA>;

type PostWritingEntitiesTaskParam<
  E extends BaseApplicationEntity,
  BA extends BaseApplication<E>,
  A extends BaseApplicationSources<E, BA>,
  C extends BaseApplicationControl,
> = TaskParamWithEntities<E, BA, A, C> & TaskParamWithSource<C, BA>;

export type TaskTypes<
  E extends BaseApplicationEntity,
  BA extends BaseApplication<E>,
  A extends BaseApplicationSources<E, BA>,
  C extends BaseControl,
> = Merge<
  BaseTaskTypes<C>,
  {
    LoadingTaskParam: TaskParamWithApplicationDefaults<E, BA, A, C>;
    PreparingTaskParam: PreparingTaskParam<E, BA, A, C>;
    ConfiguringEachEntityTaskParam: ConfiguringEachEntityTaskParam<E, BA, A, C>;
    LoadingEntitiesTaskParam: LoadingEntitiesTaskParam<E, BA, A, C>;
    PreparingEachEntityTaskParam: PreparingEachEntityTaskParam<E, BA, A, C>;
    PreparingEachEntityFieldTaskParam: PreparingEachEntityFieldTaskParam<E, BA, A, C>;
    PreparingEachEntityRelationshipTaskParam: PreparingEachEntityRelationshipTaskParam<E, BA, A, C>;
    PostPreparingEachEntityTaskParam: PreparingEachEntityTaskParam<E, BA, A, C>;
    PostPreparingTaskParam: TaskParamWithSource<C, BA> & TaskParamWithApplication<E, BA, A, C>;
    DefaultTaskParam: TaskParamWithEntities<E, BA, A, C>;
    WritingTaskParam: WritingTaskParam<E, BA, A, C>;
    WritingEntitiesTaskParam: TaskParamWithEntities<E, BA, A, C>;
    PostWritingTaskParam: PostWritingTaskParam<E, BA, A, C>;
    PostWritingEntitiesTaskParam: PostWritingEntitiesTaskParam<E, BA, A, C>;
    PreConflictsTaskParam: TaskParamWithApplication<E, BA, A, C>;
    InstallTaskParam: TaskParamWithApplication<E, BA, A, C>;
    PostInstallTaskParam: TaskParamWithApplication<E, BA, A, C>;
    EndTaskParam: TaskParamWithApplication<E, BA, A, C>;
  }
>;
