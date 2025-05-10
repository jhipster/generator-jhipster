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

import type { ServerEntity } from '../../../generators/server/types.js';
import type { Field as BaseField } from '../base/field.js';
import type { PartialAngularEntity } from '../../../generators/angular/types-partial.js';
import type { BaseApplicationEntity, BaseApplicationPrimaryKey } from '../../../generators/base-application/types.js';
import type { Field } from './field.js';
import type { Relationship } from './relationship.js';

export type PrimaryKey<F extends BaseField = Field> = BaseApplicationPrimaryKey<F> & {
  name: string;
  derivedFields: F[];
  derived: boolean;
  javaValueGenerator?: string;
  javaBuildSpecification?: string;

  tsSampleValues?: (string | number)[];
  javaSampleValues?: string[];
};

export interface Entity<F extends Field = Field, PK extends PrimaryKey<F> = PrimaryKey<F>, R extends Relationship<any> = Relationship<any>>
  extends BaseApplicationEntity<F, PK, R>,
    ServerEntity,
    PartialAngularEntity {
  annotations?: Record<string, string>;
  /** @experimental */
  auditableEntity?: boolean;
  skipClient?: boolean;
  builtIn?: boolean;
  builtInUser?: boolean;
  builtInAuthority?: boolean;

  hasCyclicRequiredRelationship?: boolean;

  entityJavadoc?: string;

  entityAbsoluteClass: string;
  entityAbsoluteFolder: string;

  /** Generate only the model at client side for relationships. */
  entityClientModelOnly?: boolean;

  entityJavaFilterableProperties: any[];
  entityJavaCustomFilters: any[];

  /**
   * Any relationship is required or id
   */
  anyRelationshipIsRequired: boolean;

  propertyJavaFilteredType?: string;

  tsSampleWithPartialData?: string;
  tsSampleWithRequiredData?: string;
  tsSampleWithFullData?: string;
  tsSampleWithNewData?: string;
  tsPrimaryKeySamples?: string[];

  applicationType?: string;
  microfrontend?: boolean;
}

export interface UserEntity extends Entity {
  hasImageField?: boolean;
  adminUserDto?: string;
}
