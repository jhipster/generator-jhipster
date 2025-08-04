/*
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
import type { SimpleTask } from '../../base/tasks.ts';
import type CoreGenerator from '../../base-core/generator.ts';
import type BaseWorkspacesGenerator from '../generator.ts';
import type { Tasks } from '../tasks.ts';
import type { Deployment, Source, WorkspacesApplication } from '../types.ts';

export function asWritingWorkspacesTask<const G extends CoreGenerator = BaseWorkspacesGenerator>(
  task: SimpleTask<G, Tasks<Deployment, Source, WorkspacesApplication>['WritingTaskParam']>,
): SimpleTask<any, Tasks<Deployment, Source, WorkspacesApplication>['WritingTaskParam']> {
  return task;
}

export function asPromptingWorkspacesTask<const G extends CoreGenerator = BaseWorkspacesGenerator>(
  task: SimpleTask<G, Tasks<Deployment, Source, WorkspacesApplication>['PromptingWorkspacesTaskParam']>,
): SimpleTask<any, Tasks<Deployment, Source, WorkspacesApplication>['PromptingWorkspacesTaskParam']> {
  return task;
}

export function asPreparingWorkspacesTask<const G extends CoreGenerator = BaseWorkspacesGenerator>(
  task: SimpleTask<G, Tasks<Deployment, Source, WorkspacesApplication>['PreparingWorkspacesTaskParam']>,
): SimpleTask<any, Tasks<Deployment, Source, WorkspacesApplication>['PreparingWorkspacesTaskParam']> {
  return task;
}
