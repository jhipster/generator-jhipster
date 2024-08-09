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
import CoreGenerator from '../../base-core/generator.js';
import { WriteFileBlock, WriteFileSection } from '../../base/api.js';
import { GeneratorDefinition } from '../generator.js';

export function asWriteFilesSection<Data = GeneratorDefinition['writingTaskParam']['application']>(
  section: WriteFileSection<CoreGenerator, Data>,
) {
  return section;
}

export function asWriteFilesBlock<Data = GeneratorDefinition['writingTaskParam']['application']>(
  section: WriteFileBlock<CoreGenerator, Data>,
) {
  return section;
}

export function asInitializingTask(task: (this: CoreGenerator, params: GeneratorDefinition['initializingTaskParam']) => void) {
  return task;
}

export function asPromptingTask(task: (this: CoreGenerator, params: GeneratorDefinition['promptingTaskParam']) => void) {
  return task;
}

export function asConfiguringTask(task: (this: CoreGenerator, params: GeneratorDefinition['configuringTaskParam']) => void) {
  return task;
}

export function asComposingTask(task: (this: CoreGenerator, params: GeneratorDefinition['composingTaskParam']) => void) {
  return task;
}

export function asLoadingTask(task: (this: CoreGenerator, params: GeneratorDefinition['loadingTaskParam']) => void) {
  return task;
}

export function asPreparingTask(task: (this: CoreGenerator, params: GeneratorDefinition['preparingTaskParam']) => void) {
  return task;
}

export function asPostPreparingTask(task: (this: CoreGenerator, params: GeneratorDefinition['postPreparingTaskParam']) => void) {
  return task;
}

export function asPreparingEachEntityTask(
  task: (this: CoreGenerator, params: GeneratorDefinition['preparingEachEntityTaskParam']) => void,
) {
  return task;
}

export function asPreparingEachEntityFieldTask(
  task: (this: CoreGenerator, params: GeneratorDefinition['preparingEachEntityFieldTaskParam']) => void,
) {
  return task;
}

export function asPreparingEachEntityRelationshipTask(
  task: (this: CoreGenerator, params: GeneratorDefinition['preparingEachEntityRelationshipTaskParam']) => void,
) {
  return task;
}

export function asPostPreparingEachEntityTask(
  task: (this: CoreGenerator, params: GeneratorDefinition['postPreparingEachEntityTaskParam']) => void,
) {
  return task;
}

export function asDefaultTask(task: (this: CoreGenerator, params: GeneratorDefinition['defaultTaskParam']) => void) {
  return task;
}

export function asWritingTask(task: (this: CoreGenerator, params: GeneratorDefinition['writingTaskParam']) => void) {
  return task;
}

export function asWritingEntitiesTask(task: (this: CoreGenerator, params: GeneratorDefinition['writingEntitiesTaskParam']) => void) {
  return task;
}

export function asPostWritingTask(task: (this: CoreGenerator, params: GeneratorDefinition['postWritingTaskParam']) => void) {
  return task;
}

export function asPostWritingEntitiesTask(
  task: (this: CoreGenerator, params: GeneratorDefinition['postWritingEntitiesTaskParam']) => void,
) {
  return task;
}

export function asInstallTask(task: (this: CoreGenerator, params: GeneratorDefinition['installTaskParam']) => void) {
  return task;
}

export function asEndTask(task: (this: CoreGenerator, params: GeneratorDefinition['endTaskParam']) => void) {
  return task;
}
