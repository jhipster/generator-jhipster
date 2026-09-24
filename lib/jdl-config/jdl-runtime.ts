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

import { createRuntime } from '../jdl/core/runtime.ts';
import type { JDLDefinitions } from '../jdl/core/types/parsing.ts';
import type { JDLRuntime } from '../jdl/core/types/runtime.ts';
import { CommonDBValidations, fieldTypesValues } from '../jhipster/field-types.ts';
import type { ResolveGeneratorDependenciesOptions } from '../resolver/generator-dependencies.ts';

import { getDefaultJDLEntityConfig } from './jdl-entity-config.ts';
import { getDefaultJDLRelationshipConfig } from './jdl-relationship-config.ts';
import {
  buildJDLApplicationConfig,
  getDefaultJDLApplicationConfig,
  getDefaultJDLDeploymentConfig,
  lookupJDLConfigsFrom,
} from './jhipster-jdl-config.ts';

/**
 * Obtain this installation's definitions without putting generator lookup in the parser.
 * Pass the environment's getGeneratorMeta and selected blueprintNamespaces to include blueprint commands.
 * Custom lookups are not cached: a blueprint's definitions cannot leak into another tool's runtime.
 */
export const getDefaultJDLDefinitions = (lookup?: ResolveGeneratorDependenciesOptions): JDLDefinitions => ({
  application: lookup ? buildJDLApplicationConfig(lookupJDLConfigsFrom('app', lookup)) : getDefaultJDLApplicationConfig(),
  deployment: {
    ...(lookup ? buildJDLApplicationConfig(lookupJDLConfigsFrom('deployment', lookup)) : getDefaultJDLDeploymentConfig()),
    required: ['deploymentType'],
  },
  namespaceConfigOption: 'blueprints',
  entity: getDefaultJDLEntityConfig(),
  relationship: getDefaultJDLRelationshipConfig(),
  namePattern: /[a-zA-Z_][a-zA-Z_\-\d]*/,
  names: {
    constant: /^[A-Z_]+$/,
    entity: /^[A-Z][A-Za-z0-9]*$/,
    field: /^[A-Za-z][A-Za-z0-9]*$/,
    type: /^[A-Z][A-Za-z0-9]*$/,
    enum: /^[A-Z][A-Za-z0-9]*$/,
    enumValue: /^[A-Z]\w*$/,
    enumValueValue: /^[A-Za-z]\w*$/,
    injectedField: /^[A-Za-z][A-Za-z0-9]*$/,
    method: /^[A-Za-z][A-Za-z0-9-_]*$/,
    path: /^"([^/]+).*"$/,
  },
  validations: {
    required: { type: 'flag' },
    unique: { type: 'flag' },
    minlength: { type: 'number', integer: true },
    maxlength: { type: 'number', integer: true },
    minbytes: { type: 'number', integer: true },
    maxbytes: { type: 'number', integer: true },
    min: { type: 'number' },
    max: { type: 'number' },
    pattern: { type: 'pattern' },
  },
  fieldTypes: Object.fromEntries(
    Object.values(fieldTypesValues).map(type => [
      type,
      { validations: [...((CommonDBValidations as Record<string, ReadonlySet<string>>)[type] ?? [])] },
    ]),
  ),
  enumValidations: [...CommonDBValidations.Enum],
});

/**
 * A runtime from the JHipster definitions, the ones not passed: the application and deployment options of the
 * generators, the entity and relationship option statements.
 */
export const createJDLRuntime = (definitions: Partial<JDLDefinitions> = {}): JDLRuntime =>
  createRuntime({
    ...getDefaultJDLDefinitions(),
    ...definitions,
  });

let defaultRuntime: JDLRuntime;
/** The runtime from the JHipster definitions. */
export const getDefaultRuntime = (): JDLRuntime => {
  defaultRuntime ??= createJDLRuntime();
  return defaultRuntime;
};
