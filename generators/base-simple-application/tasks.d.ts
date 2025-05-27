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
import type { Merge } from 'type-fest';
import type { ApplicationDefaultsTaskParam, TaskParamWithApplication } from '../base-application/tasks.js';
import type {
  BaseApplicationApplication,
  BaseApplicationControl,
  BaseApplicationEntity,
  BaseApplicationField,
  BaseApplicationPrimaryKey,
  BaseApplicationRelationship,
  BaseApplicationSources,
} from '../base-application/types.js';
import type { TaskTypes as BaseTaskTypes, TaskParamWithSource } from '../base/tasks.js';

export type SimpleTaskTypes<
  F extends BaseApplicationField,
  PK extends BaseApplicationPrimaryKey<F>,
  R extends BaseApplicationRelationship<any>,
  E extends BaseApplicationEntity<F, PK, R>,
  A extends BaseApplicationApplication,
  S extends BaseApplicationSources<F, PK, R, E, A>,
  C extends BaseApplicationControl,
> = Merge<
  BaseTaskTypes<C, S>,
  {
    LoadingTaskParam: TaskParamWithApplication<A, C> & ApplicationDefaultsTaskParam<A>;
    PreparingTaskParam: TaskParamWithSource<C, S> & TaskParamWithApplication<A, C> & ApplicationDefaultsTaskParam<A>;
    PostPreparingTaskParam: TaskParamWithSource<C, S> & TaskParamWithApplication<A, C>;
    DefaultTaskParam: TaskParamWithApplication<A, C>;
    WritingTaskParam: TaskParamWithApplication<A, C>;
    PostWritingTaskParam: TaskParamWithSource<C, S> & TaskParamWithApplication<A, C>;
    PreConflictsTaskParam: TaskParamWithApplication<A, C>;
    InstallTaskParam: TaskParamWithApplication<A, C>;
    PostInstallTaskParam: TaskParamWithApplication<A, C>;
    EndTaskParam: TaskParamWithApplication<A, C>;
  }
>;
