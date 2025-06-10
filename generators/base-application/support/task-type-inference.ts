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
import type { TaskTypes as BaseTasks } from '../../base/tasks.js';
import type { TaskTypes } from '../tasks.js';
import type CoreGenerator from '../../base-core/generator.js';
import type { WriteFileSection } from '../../base-core/api.js';
import type { Application as BaseApplicationApplication, Entity as BaseApplicationEntity } from '../types.js';

import type { ApplicationAll } from '../application-properties-all.js';
import type { EntityAll } from '../entity-all.js';

export function asWriteFilesSection<Data = ApplicationAll<EntityAll>>(section: WriteFileSection<Data>) {
  return section;
}

export function asPromptingTask<const G extends CoreGenerator = CoreGenerator>(
  task: (this: G, params: BaseTasks['PromptingTaskParam']) => void,
) {
  return task;
}

export function asPostPreparingEachEntityTask<
  E extends BaseApplicationEntity = EntityAll,
  A extends BaseApplicationApplication<E> = ApplicationAll<E & EntityAll>,
  const G extends CoreGenerator = CoreGenerator,
>(task: (this: G, params: TaskTypes<E, A>['PostPreparingEachEntityTaskParam']) => void) {
  return task;
}

export function asWritingTask<
  E extends BaseApplicationEntity = EntityAll,
  A extends BaseApplicationApplication<E> = ApplicationAll<E & EntityAll>,
  const G extends CoreGenerator = CoreGenerator,
>(task: (this: G, params: TaskTypes<E, A>['WritingTaskParam']) => void) {
  return task;
}

export function asWritingEntitiesTask<
  E extends BaseApplicationEntity = EntityAll,
  A extends BaseApplicationApplication<E> = ApplicationAll<E & EntityAll>,
  const G extends CoreGenerator = CoreGenerator,
>(task: (this: G, params: TaskTypes<E, A>['WritingEntitiesTaskParam']) => void) {
  return task;
}

export function asPostWritingTask<
  E extends BaseApplicationEntity = EntityAll,
  A extends BaseApplicationApplication<E> = ApplicationAll<E & EntityAll>,
  const G extends CoreGenerator = CoreGenerator,
>(task: (this: G, params: TaskTypes<E, A>['PostWritingTaskParam']) => void) {
  return task;
}

export function asPostWritingEntitiesTask<
  E extends BaseApplicationEntity = EntityAll,
  A extends BaseApplicationApplication<E> = ApplicationAll<E & EntityAll>,
  const G extends CoreGenerator = CoreGenerator,
>(task: (this: G, params: TaskTypes<E, A>['PostWritingEntitiesTaskParam']) => void) {
  return task;
}
