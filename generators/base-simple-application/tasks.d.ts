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
import type { Merge, OmitIndexSignature, Simplify } from 'type-fest';
import type { TaskTypes as BaseTaskTypes, TaskParamWithControl, TaskParamWithSource } from '../base/tasks.js';
import type {
  Application as BaseSimpleApplicationApplication,
  Control as BaseSimpleApplicationControl,
  Source as BaseSimpleApplicationSource,
} from './types.d.ts';

export type ApplicationDefaultsTaskParam<A> = {
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

export type TaskParamWithApplication<
  C extends BaseSimpleApplicationControl = BaseSimpleApplicationControl,
  A extends BaseSimpleApplicationApplication = BaseSimpleApplicationApplication,
> = TaskParamWithControl<C> & {
  application: A;
};

export type SimpleTaskTypes<
  C extends BaseSimpleApplicationControl = BaseSimpleApplicationControl,
  A extends BaseSimpleApplicationApplication = BaseSimpleApplicationApplication,
  S extends BaseSimpleApplicationSource = BaseSimpleApplicationSource,
> = Merge<
  BaseTaskTypes<C, S>,
  {
    BootstrapApplicationTaskParam: TaskParamWithControl<C> & ApplicationDefaultsTaskParam<A>;
    LoadingTaskParam: TaskParamWithApplication<C, A> & ApplicationDefaultsTaskParam<A>;
    PreparingTaskParam: TaskParamWithSource<C, S> & TaskParamWithApplication<C, A> & ApplicationDefaultsTaskParam<A>;
    PostPreparingTaskParam: TaskParamWithSource<C, S> & TaskParamWithApplication<C, A>;
    DefaultTaskParam: TaskParamWithApplication<C, A>;
    WritingTaskParam: TaskParamWithApplication<C, A>;
    PostWritingTaskParam: TaskParamWithSource<C, S> & TaskParamWithApplication<C, A>;
    PreConflictsTaskParam: TaskParamWithApplication<C, A>;
    InstallTaskParam: TaskParamWithApplication<C, A>;
    PostInstallTaskParam: TaskParamWithApplication<C, A>;
    EndTaskParam: TaskParamWithApplication<C, A>;
  }
>;
