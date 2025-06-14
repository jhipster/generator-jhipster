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
import type { Tasks } from '../tasks.js';
import type CoreGenerator from '../../base-core/generator.js';
import type { Source } from '../types.js';
import type BaseWorkspacesGenerator from '../generator.js';

export function asWritingTask<S extends Source = Source, const G extends CoreGenerator = CoreGenerator>(
  task: (this: G, params: Tasks<any, any, S>['WritingTaskParam']) => void,
) {
  return task;
}
export function asPromptingWorkspacesTask<S extends Source = Source, const G extends BaseWorkspacesGenerator = BaseWorkspacesGenerator>(
  task: (this: G, params: Tasks<any, any, S>['PromptingWorkspacesTaskParam']) => void,
) {
  return task;
}
