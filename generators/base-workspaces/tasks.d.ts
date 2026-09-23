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

import type { TaskParamWithControl, TaskParamWithSource, TaskTypes, TaskTypes as BaseTaskTypes } from '../base/tasks.ts';
import type { Source as BaseSource } from '../base/types.d.ts';
import type { Application as BaseSimpleApplicationApplication } from '../base-simple-application/types.d.ts';

import type { Deployment as BaseWorkspacesDeployment } from './types.d.ts';

export type TaskParamWithApplications<A extends BaseSimpleApplicationApplication = BaseSimpleApplicationApplication> =
  TaskParamWithControl & {
    applications: A[];
  };

/**
 * The deployment context is loaded from the configuration in the loading workspaces priority, so it is only passed
 * to the tasks from there on: prompting and configuring workspaces tasks read `jhipsterConfig` instead.
 */
export type TaskParamWithDeployment<
  D extends BaseWorkspacesDeployment,
  A extends BaseSimpleApplicationApplication = BaseSimpleApplicationApplication,
> = TaskParamWithApplications<A> & {
  deployment: D;
};

export type Tasks<
  D extends BaseWorkspacesDeployment = BaseWorkspacesDeployment,
  S extends BaseSource = BaseSource,
  A extends BaseSimpleApplicationApplication = BaseSimpleApplicationApplication,
> = Merge<
  BaseTaskTypes<S>,
  {
    PromptingWorkspacesTaskParam: TaskParamWithControl & TaskParamWithApplications<A>;
    ConfiguringWorkspacesTaskParam: TaskParamWithControl & TaskParamWithApplications<A>;
    LoadingWorkspacesTaskParam: TaskParamWithControl & TaskParamWithDeployment<D, A>;
    PreparingWorkspacesTaskParam: TaskParamWithControl & TaskParamWithDeployment<D, A>;
    DefaultTaskParam: TaskTypes['DefaultTaskParam'] & TaskParamWithDeployment<D, A>;
    WritingTaskParam: TaskParamWithControl & TaskParamWithDeployment<D, A>;
    PostWritingTaskParam: TaskParamWithSource<S> & TaskParamWithDeployment<D, A>;
    InstallTaskParam: TaskTypes['InstallTaskParam'] & TaskParamWithDeployment<D, A>;
    PostInstallTaskParam: TaskTypes['PostInstallTaskParam'] & TaskParamWithDeployment<D, A>;
    EndTaskParam: TaskTypes['EndTaskParam'] & TaskParamWithDeployment<D, A>;
  }
>;
