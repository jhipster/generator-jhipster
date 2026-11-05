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

import type { ReactAddedApplicationProperties } from './application.ts';

export type { Config, Features, Options, Relationship, Source } from '../client/types.d.ts';

/** A client constant backing the values of a `clientConstantsAsValues` field. */
export type ReactFieldClientConstant = {
  /** Import statement of the constant. */
  reactConstantImport: string;
  /** Expression that evaluates to the list of values. */
  reactConstantValues: string;
};

export type Field = ClientField & {
  reactFieldClientConstant?: ReactFieldClientConstant;
  /** The validation pattern of the field, as the content of a regular expression literal. */
  fieldValidateRulesPatternReact?: string;
  /** The validation pattern of the field, as the content of a single-quoted string. */
  fieldValidateRulesPatternReactString?: string;
};

export interface Entity<F extends ClientField = Field, R extends ClientRelationship = ClientRelationship> extends ClientEntity<F, R> {
  /** The path of the entity in the state of the store. */
  entityReactState?: string;
}

export type Application<E extends ClientEntity = Entity> = ClientApplication<E> & ReactAddedApplicationProperties;
