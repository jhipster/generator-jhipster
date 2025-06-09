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
import type { Application as BaseSimpleApplicationApplication } from '../base-simple-application/types.d.ts';
import type { Source as BaseSource } from '../base/types.d.ts';
import type { Workspaces } from './types.js';

export type TaskParamWithApplications<
  D,
  W extends Workspaces = Workspaces,
  A extends BaseSimpleApplicationApplication = BaseSimpleApplicationApplication,
> = TaskParamWithControl & {
  applications: A[];
  deployment: D;
  workspaces: W;
};

export type Tasks<
  D = any,
  W extends Workspaces = Workspaces,
  S extends BaseSource = BaseSource,
  A extends BaseSimpleApplicationApplication = BaseSimpleApplicationApplication,
> = Merge<
  BaseTaskTypes<S>,
  {
    WritingTaskParam: TaskParamWithControl & TaskParamWithApplications<D, W, A>;
    PromptingWorkspacesTaskParam: TaskParamWithControl & TaskParamWithApplications<D, W, A>;
    ConfiguringWorkspacesTaskParam: TaskParamWithControl & TaskParamWithApplications<D, W, A>;
    LoadingWorkspacesTaskParam: TaskParamWithControl & TaskParamWithApplications<D, W, A>;
    PreparingWorkspacesTaskParam: TaskParamWithControl & TaskParamWithApplications<D, W, A>;
    DefaultTaskParam: TaskTypes['DefaultTaskParam'] & TaskParamWithApplications<D, W, A>;
    PostWritingTaskParam: TaskParamWithSource<S> & TaskParamWithApplications<D, W, A>;
    InstallTaskParam: TaskTypes['InstallTaskParam'] & TaskParamWithApplications<D, W, A>;
    PostInstallTaskParam: TaskTypes['PostInstallTaskParam'] & TaskParamWithApplications<D, W, A>;
    EndTaskParam: TaskTypes['EndTaskParam'] & TaskParamWithApplications<D, W, A>;
  }
>;
