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
import type { TaskTypes } from '../tasks.js';
import type { WriteFileSection } from '../../base-core/types.js';
import type {
  BaseApplicationApplication,
  BaseApplicationEntity,
  BaseApplicationField,
  BaseApplicationPrimaryKey,
  BaseApplicationRelationship,
} from '../types.js';
import type BaseApplicationGenerator from '../generator.js';

export function asWriteFilesSection<
  F extends BaseApplicationField,
  PK extends BaseApplicationPrimaryKey<F>,
  R extends BaseApplicationRelationship<any>,
  E extends BaseApplicationEntity<F, PK, R>,
  A = BaseApplicationApplication<F, PK, R, E>,
>(section: WriteFileSection<A, any>) {
  return section;
}

export function asPromptingTask<
  F extends BaseApplicationField,
  PK extends BaseApplicationPrimaryKey<F>,
  R extends BaseApplicationRelationship<any>,
  E extends BaseApplicationEntity<F, PK, R>,
  A extends BaseApplicationApplication<F, PK, R, E>,
  G extends BaseApplicationGenerator<any, F, PK, R, E, A, any, any, any, any, any, any>,
>(task: (this: G, params: TaskTypes<F, PK, R, E, A, any, any>['PromptingTaskParam']) => void) {
  return task;
}

export function asPostPreparingEachEntityTask<
  F extends BaseApplicationField,
  PK extends BaseApplicationPrimaryKey<F>,
  R extends BaseApplicationRelationship<any>,
  E extends BaseApplicationEntity<F, PK, R>,
  A extends BaseApplicationApplication<F, PK, R, E>,
  G extends BaseApplicationGenerator<any, F, PK, R, E, A, any, any, any, any, any, any>,
>(task: (this: G, params: TaskTypes<F, PK, R, E, A, any, any>['PostPreparingEachEntityTaskParam']) => void) {
  return task;
}

export function asWritingTask<
  F extends BaseApplicationField,
  PK extends BaseApplicationPrimaryKey<F>,
  R extends BaseApplicationRelationship<any>,
  E extends BaseApplicationEntity<F, PK, R>,
  A extends BaseApplicationApplication<F, PK, R, E>,
  G extends BaseApplicationGenerator<any, F, PK, R, E, A, any, any, any, any, any, any>,
>(task: (this: G, params: TaskTypes<F, PK, R, E, A, any, any>['WritingTaskParam']) => void) {
  return task;
}

export function asWritingEntitiesTask<
  F extends BaseApplicationField,
  PK extends BaseApplicationPrimaryKey<F>,
  R extends BaseApplicationRelationship<any>,
  E extends BaseApplicationEntity<F, PK, R>,
  A extends BaseApplicationApplication<F, PK, R, E>,
  G extends BaseApplicationGenerator<any, F, PK, R, E, A, any, any, any, any, any, any>,
>(task: (this: G, params: TaskTypes<F, PK, R, E, A, any, any>['WritingEntitiesTaskParam']) => void) {
  return task;
}

export function asPostWritingTask<
  F extends BaseApplicationField,
  PK extends BaseApplicationPrimaryKey<F>,
  R extends BaseApplicationRelationship<any>,
  E extends BaseApplicationEntity<F, PK, R>,
  A extends BaseApplicationApplication<F, PK, R, E>,
  G extends BaseApplicationGenerator<any, F, PK, R, E, A, any, any, any, any, any, any>,
>(task: (this: G, params: TaskTypes<F, PK, R, E, A, any, any>['PostWritingTaskParam']) => void) {
  return task;
}

export function asPostWritingEntitiesTask<
  F extends BaseApplicationField,
  PK extends BaseApplicationPrimaryKey<F>,
  R extends BaseApplicationRelationship<any>,
  E extends BaseApplicationEntity<F, PK, R>,
  A extends BaseApplicationApplication<F, PK, R, E>,
  G extends BaseApplicationGenerator<any, F, PK, R, E, A, any, any, any, any, any, any>,
>(task: (this: G, params: TaskTypes<F, PK, R, E, A, any, any>['PostWritingEntitiesTaskParam']) => void) {
  return task;
}
