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
import type { Merge } from 'type-fest';

import type { MutateDataParam } from '../../lib/utils/object.ts';
import type { TaskParamWithControl, TaskParamWithSource, TaskTypes as BaseTaskTypes } from '../base/tasks.ts';

import type { Application as BaseSimpleApplicationApplication, Source as BaseSimpleApplicationSource } from './types.d.ts';

export type ApplicationDefaultsTaskParam<A extends BaseSimpleApplicationApplication = BaseSimpleApplicationApplication> = {
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
  applicationDefaults: (...defaults: MutateDataParam<A>[]) => void;
};

export type TaskParamWithApplication<A extends BaseSimpleApplicationApplication = BaseSimpleApplicationApplication> =
  TaskParamWithControl & {
    application: A;
  };

export type SimpleTaskTypes<
  A extends BaseSimpleApplicationApplication = BaseSimpleApplicationApplication,
  S extends BaseSimpleApplicationSource = BaseSimpleApplicationSource,
> = Merge<
  BaseTaskTypes<S>,
  {
    BootstrapApplicationTaskParam: TaskParamWithControl & ApplicationDefaultsTaskParam<A>;
    LoadingTaskParam: TaskParamWithApplication<A> & ApplicationDefaultsTaskParam<A>;
    PreparingTaskParam: TaskParamWithSource<S> & TaskParamWithApplication<A> & ApplicationDefaultsTaskParam<A>;
    PostPreparingTaskParam: TaskParamWithSource<S> & TaskParamWithApplication<A>;
    DefaultTaskParam: TaskParamWithApplication<A>;
    WritingTaskParam: TaskParamWithApplication<A>;
    PostWritingTaskParam: TaskParamWithSource<S> & TaskParamWithApplication<A>;
    PreConflictsTaskParam: TaskParamWithApplication<A>;
    InstallTaskParam: TaskParamWithApplication<A>;
    PostInstallTaskParam: TaskParamWithApplication<A>;
    EndTaskParam: TaskParamWithApplication<A>;
  }
>;
