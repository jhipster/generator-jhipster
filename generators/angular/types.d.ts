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
import type {
  Application as ClientApplication,
  Entity as ClientEntity,
  Field as ClientField,
  Relationship as ClientRelationship,
} from '../client/types.d.ts';

export type { Config, Features, Options, Source } from '../client/types.d.ts';

export type AngularFieldClientConstant = {
  /** Exported constant name. */
  angularConstantName: string;
  /** Import path of the constant. */
  angularConstantImportPath: string;
  /** TypeScript type of a single value. */
  angularConstantTsType: string;
  /** Expression that evaluates to the list of values. */
  angularConstantValues: string;
  /** Pipe used to display a value. */
  angularConstantLabelPipe?: { name: string; importName: string; importPath: string };
};

export type Field = ClientField & {
  fieldTsDefaultValue?: string;
  defaultValue?: string;
  fieldValidateRulesPatternAngular?: string;
  /** Client constant backing a `clientConstantsAsValues` field. */
  angularFieldClientConstant?: AngularFieldClientConstant;
  /** Singular form of the field name, used to name items of collection fields. */
  angularFieldNameSingular?: string;
  /**
   * The form shows two values of the field as a single empty one, an unchecked box for null and false, an empty text for null and '':
   * the form service keeps the one of the edited entity.
   */
  angularFormKeepsEmptyValue?: boolean;
  /**
   * The update form shows the error the server gives for the field: a field neither hidden nor read-only, but an
   * auto-generated id. Angular skips the errors of a read-only field, so a server error marks only these ones.
   */
  angularShowsServerError?: boolean;
};

export type Relationship = ClientRelationship & {
  relationshipShouldUsePick?: boolean;
  /** The update form shows the error the server gives for the relationship, see `angularShowsServerError` of a field. */
  angularShowsServerError?: boolean;
};

export interface Entity<F extends Field = Field, R extends Relationship = Relationship> extends ClientEntity<F, R> {
  entityAngularAuthorities?: string;
  entityAngularReadAuthorities?: string;
  angularEntityListRequiresTranslationPipe?: boolean;
  angularEntityDetailsRequiresTranslationPipe?: boolean;
  angularEntityUpdateRequiresTranslationPipe?: boolean;
  /** A field of the entity keeps its empty value in the form, see `angularFormKeepsEmptyValue`. */
  angularFormKeepsEmptyValues?: boolean;
  /** The properties whose server error the update form shows, the fields and relationships with `angularShowsServerError`. */
  angularServerErrorProperties?: string[];
  /** The sample with the data of every field, its dates written as the strings of the REST API like the model types them. */
  angularTsSampleWithFullData?: string;
  /** The sample with the data of the required fields, its dates written as the strings of the REST API. */
  angularTsSampleWithRequiredData?: string;
  /** The sample with the data of some fields, its dates written as the strings of the REST API. */
  angularTsSampleWithPartialData?: string;
  /** The sample of a new entity, its dates written as the strings of the REST API. */
  angularTsSampleWithNewData?: string;
  /** The names of the properties of the primary key, as a union of string literal types, like `'orderId' | 'lineCode'`. */
  angularPrimaryKeyNames?: string;
}

export type Application<E extends Entity = Entity> = {
  /** @experimental to be replaced with needles */
  angularEntities?: E[];
  angularLocaleId?: string;

  // Common properties
  communicationSpringWebsocket?: boolean;
} & ClientApplication<E>;
