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
import type { ApplicationObjectConfig } from '../../../base-application/objects.ts';

/** What a changelog does to its entity: creates it, changes it or removes it. */
export type ChangelogOperation = 'create' | 'update' | 'remove';

/**
 * A changelog of an entity, an object of the application of type `changelog` named `<changelogDate>_<entityName>`: what a
 * changelog of the entity is written from, the former state of the entity the entity of the changelog before it.
 */
export type EntityChangelogObject = ApplicationObjectConfig & {
  type: 'changelog';
  changelogDate: string;
  entityName: string;
  operation: ChangelogOperation;
  /**
   * The entity as the changelog leaves it, the final properties of its database schema: the last changelog of the entity only,
   * the state the next one compares to, the changelogs being written once; none for a removal.
   */
  entity?: Record<string, any>;
  /** The entity before the changelog, the entity of the changelog before it: an update or a removal of this generation only, never recorded. */
  previousEntity?: Record<string, any>;
  /** The properties of the table of the entity the changelog changes, its fields and its relationships aside, like entityTableName: an update only. */
  changedProperties?: string[];
  /** The fields and the relationships the changelog adds, removes or changes in the database schema, by name: an update only. */
  addedFields?: string[];
  removedFields?: string[];
  changedFields?: string[];
  addedRelationships?: string[];
  removedRelationships?: string[];
  /**
   * The relationships changed in their type, their other entity, their side or whether they are part of the primary key:
   * their foreign key or join table recreated.
   */
  recreatedRelationships?: string[];
  /** The relationships changed only in their other properties, like onDelete and onUpdate. */
  optionsChangedRelationships?: string[];
  /** Written by hand, never by the generator: the fields the changelog renames, from their former name to their new one. */
  renamedFields?: Record<string, string>;
  /** Written by hand, never by the generator: the relationships the changelog renames, from their former name to their new one. */
  renamedRelationships?: Record<string, string>;
};
