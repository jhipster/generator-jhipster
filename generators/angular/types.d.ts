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
  /** Typescript type of a single value. */
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
};

export type Relationship = ClientRelationship & {
  relationshipShouldUsePick?: boolean;
};

export interface Entity<F extends Field = Field, R extends Relationship = Relationship> extends ClientEntity<F, R> {
  /**
   * @experimental to be replaced with a calculated property
   * Returns the typescript import section of enums referenced by all fields of the entity.
   * @param fields returns the import of enums that are referenced by the fields
   * @returns {typeImports:Map} the fields that potentially contains some enum types
   */
  generateEntityClientEnumImports?: (fields: any) => Map<any, any>;
  entityAngularAuthorities?: string;
  entityAngularReadAuthorities?: string;
  angularEntityListRequiresTranslationPipe?: boolean;
  angularEntityDetailsRequiresTranslationPipe?: boolean;
  angularEntityUpdateRequiresTranslationPipe?: boolean;
}

export type Application<E extends Entity = Entity> = {
  /** @experimental to be replaced with needles */
  angularEntities?: E[];
  angularLocaleId?: string;

  // Common properties
  communicationSpringWebsocket?: boolean;
} & ClientApplication<E>;
