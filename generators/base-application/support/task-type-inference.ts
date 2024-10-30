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
import type { ApplicationType } from '../../../lib/types/application/application.js';
import type { TaskTypes } from '../../../lib/types/application/tasks.js';
import type CoreGenerator from '../../base-core/generator.js';
import type { WriteFileBlock, WriteFileSection } from '../../base/api.js';
import type { Entity } from '../../../lib/types/application/entity.js';

export function asWriteFilesSection<Data = ApplicationType<Entity>>(section: WriteFileSection<Data>) {
  return section;
}

export function asWriteFilesBlock<Data = ApplicationType<Entity>>(section: WriteFileBlock<Data>) {
  return section;
}

export function asInitializingTask<E = Entity, A = ApplicationType<E>, const G extends CoreGenerator = CoreGenerator>(
  task: (this: G, params: TaskTypes<E, A>['InitializingTaskParam']) => void,
) {
  return task;
}

export function asPromptingTask<E = Entity, A = ApplicationType<E>, const G extends CoreGenerator = CoreGenerator>(
  task: (this: G, params: TaskTypes<E, A>['PromptingTaskParam']) => void,
) {
  return task;
}

export function asConfiguringTask<E = Entity, A = ApplicationType<E>, const G extends CoreGenerator = CoreGenerator>(
  task: (this: G, params: TaskTypes<E, A>['ConfiguringTaskParam']) => void,
) {
  return task;
}

export function asComposingTask<E = Entity, A = ApplicationType<E>, const G extends CoreGenerator = CoreGenerator>(
  task: (this: G, params: TaskTypes<E, A>['ComposingTaskParam']) => void,
) {
  return task;
}

export function asLoadingTask<E = Entity, A = ApplicationType<E>, const G extends CoreGenerator = CoreGenerator>(
  task: (this: G, params: TaskTypes<E, A>['LoadingTaskParam']) => void,
) {
  return task;
}

export function asPreparingTask<E = Entity, A = ApplicationType<E>, const G extends CoreGenerator = CoreGenerator>(
  task: (this: G, params: TaskTypes<E, A>['PreparingTaskParam']) => void,
) {
  return task;
}

export function asPostPreparingTask<E = Entity, A = ApplicationType<E>, const G extends CoreGenerator = CoreGenerator>(
  task: (this: G, params: TaskTypes<E, A>['PostPreparingTaskParam']) => void,
) {
  return task;
}

export function asPreparingEachEntityTask<E = Entity, A = ApplicationType<E>, const G extends CoreGenerator = CoreGenerator>(
  task: (this: G, params: TaskTypes<E, A>['PreparingEachEntityTaskParam']) => void,
) {
  return task;
}

export function asPreparingEachEntityFieldTask<E = Entity, A = ApplicationType<E>, const G extends CoreGenerator = CoreGenerator>(
  task: (this: G, params: TaskTypes<E, A>['PreparingEachEntityFieldTaskParam']) => void,
) {
  return task;
}

export function asPreparingEachEntityRelationshipTask<E = Entity, A = ApplicationType<E>, const G extends CoreGenerator = CoreGenerator>(
  task: (this: G, params: TaskTypes<E, A>['PreparingEachEntityRelationshipTaskParam']) => void,
) {
  return task;
}

export function asPostPreparingEachEntityTask<E = Entity, A = ApplicationType<E>, const G extends CoreGenerator = CoreGenerator>(
  task: (this: G, params: TaskTypes<E, A>['PostPreparingEachEntityTaskParam']) => void,
) {
  return task;
}

export function asDefaultTask<E = Entity, A = ApplicationType<E>, const G extends CoreGenerator = CoreGenerator>(
  task: (this: G, params: TaskTypes<E, A>['DefaultTaskParam']) => void,
) {
  return task;
}

export function asWritingTask<E = Entity, A = ApplicationType<E>, const G extends CoreGenerator = CoreGenerator>(
  task: (this: G, params: TaskTypes<E, A>['WritingTaskParam']) => void,
) {
  return task;
}

export function asWritingEntitiesTask<E = Entity, A = ApplicationType<E>, const G extends CoreGenerator = CoreGenerator>(
  task: (this: G, params: TaskTypes<E, A>['WritingEntitiesTaskParam']) => void,
) {
  return task;
}

export function asPostWritingTask<E = Entity, A = ApplicationType<E>, const G extends CoreGenerator = CoreGenerator>(
  task: (this: G, params: TaskTypes<E, A>['PostWritingTaskParam']) => void,
) {
  return task;
}

export function asPostWritingEntitiesTask<E = Entity, A = ApplicationType<E>, const G extends CoreGenerator = CoreGenerator>(
  task: (this: G, params: TaskTypes<E, A>['PostWritingEntitiesTaskParam']) => void,
) {
  return task;
}

export function asInstallTask<E = Entity, A = ApplicationType<E>, const G extends CoreGenerator = CoreGenerator>(
  task: (this: G, params: TaskTypes<E, A>['InstallTaskParam']) => void,
) {
  return task;
}

export function asEndTask<E = Entity, A = ApplicationType<E>, const G extends CoreGenerator = CoreGenerator>(
  task: (this: G, params: TaskTypes<E, A>['EndTaskParam']) => void,
) {
  return task;
}
