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
import type { TaskTypes as BaseTaskTypes, TaskParamWithControl, TaskParamWithSource, TaskTypes } from '../base/tasks.js';
import type { Source as BaseWorkspacesSource, Application as SimpleApplication } from '../base-simple-application/types.d.ts';

export type TaskParamWithApplications<A, W, D> = TaskParamWithControl & {
  applications: A;
  deployment: D;
  workspaces: W;
};

export type Tasks<S = BaseWorkspacesSource, A = SimpleApplication, W = any, D = any> = Merge<
  BaseTaskTypes,
  {
    WritingTaskParam: TaskParamWithApplications<A[], W, D>;
    LoadingTaskParam: TaskTypes['LoadingTaskParam'] & { applications: A[] };
    PreparingTaskParam: TaskParamWithSource<S> & { applications: A[] };
    PostPreparingTaskParam: TaskParamWithSource<S> & { applications: A[] };
    DefaultTaskParam: TaskTypes['DefaultTaskParam'] & { applications: A[] };
    PostWritingTaskParam: TaskParamWithSource<S> & { applications: A[] };
    InstallTaskParam: TaskTypes['InstallTaskParam'] & { applications: A[] };
    PostInstallTaskParam: TaskTypes['PostInstallTaskParam'] & { applications: A[] };
    EndTaskParam: TaskTypes['EndTaskParam'] & { applications: A[] };
  }
>;
