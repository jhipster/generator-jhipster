/**
 * Copyright 2013-2024 the original author or authors from the JHipster project.
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
import type { Entity } from '../../lib/types/application/entity.js';
import type { ApplicationType } from '../../lib/types/application/application.js';

export interface AngularEntity extends Entity {
  /**
   * generates a value for a primary key type
   * @param primaryKey the primary key attribute (or its type) of the entity
   * @param index an index to add salt to the value
   * @param wrapped if the value should be within quotes
   * @returns {string|number|string}
   */
  generateTestEntityId: (primaryKey: any, index?: number, wrapped?: boolean) => any;
  /**
   * @private
   * Create a angular form path getter method of reference.
   *
   * @param {object} reference
   * @param {string[]} prefix
   * @return {string}
   */
  buildAngularFormPath: (reference: any, prefix?: never[]) => string;
  /**
   * @private
   * Generate a test entity instance with faked values.
   *
   * @param {any} references - references to other entities.
   * @param {any} additionalFields - additional fields to add to the entity or with default values that overrides generated values.
   */
  generateTypescriptTestEntity: (references: any, additionalFields: any) => string;
  /**
   * @private
   * Generate a test entity, for the PK references (when the PK is a composite, derived key)
   *
   * @param {any} primaryKey - primary key definition.
   * @param {number} [index] - index of the primary key sample, pass undefined for a random key.
   */
  generateTestEntityPrimaryKey: (primaryKey: any, index: any) => string;
  /**
   * Returns the typescript import section of enums referenced by all fields of the entity.
   * @param fields returns the import of enums that are referenced by the fields
   * @returns {typeImports:Map} the fields that potentially contains some enum types
   */
  generateEntityClientEnumImports: (fields: any) => Map<any, any>;
  entityAngularAuthorities?: string;
  entityAngularReadAuthorities?: string;
}

export type AngularApplication = {
  angularLocaleId: string;
  frontendEntities: any[];
  /**
   * Get the typescript type of a non-composite primary key
   * @param primaryKey the primary key of the entity
   * @returns {string} the typescript type.
   */
  getTypescriptKeyType: (primaryKey: any) => 'string' | 'number';
} & ApplicationType<AngularEntity>;
