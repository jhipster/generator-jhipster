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
import type { Entity as EntityAll } from '../base-application/entity-all.js';
import type { Field as FieldAll } from '../base-application/field-all.js';
import type { Relationship as RelationshipAll } from '../base-application/relationship-all.js';
import type { ApplicationAll } from '../base-application/application-properties-all.js';
import type { Field as BaseApplicationField, Relationship as BaseApplicationRelationship } from '../base-application/types.js';

export interface Entity<F extends BaseApplicationField = FieldAll, R extends BaseApplicationRelationship = RelationshipAll>
  extends EntityAll<F, R> {
  /**
   * @experimental to be replaced with a calculated property
   * Returns the typescript import section of enums referenced by all fields of the entity.
   * @param fields returns the import of enums that are referenced by the fields
   * @returns {typeImports:Map} the fields that potentially contains some enum types
   */
  generateEntityClientEnumImports?: (fields: any) => Map<any, any>;
  entityAngularAuthorities?: string;
  entityAngularReadAuthorities?: string;
}

export type Application = {
  /** @experimental to be replaced with needles */
  angularEntities?: Entity[];
  angularLocaleId: string;
} & ApplicationAll<Entity>;
