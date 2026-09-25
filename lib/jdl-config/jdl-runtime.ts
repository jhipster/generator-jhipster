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

import { createRuntime } from '../jdl/core/parsing/runtime.ts';
import type { JDLDefinitions } from '../jdl/core/parsing/types/parsing.ts';
import type { JDLRuntime } from '../jdl/core/parsing/types/runtime.ts';

import { getDefaultJDLEntityConfig } from './jdl-entity-config.ts';
import { getDefaultJDLFieldTypesConfig } from './jdl-field-types-config.ts';
import { getDefaultJDLRelationshipConfig } from './jdl-relationship-config.ts';
import { jhipsterSemanticRules } from './jdl-semantic-rules.ts';
import { getDefaultJDLValidationConfig } from './jdl-validation-config.ts';
import { getDefaultJDLApplicationConfig, getDefaultJDLDeploymentConfig } from './jhipster-jdl-config.ts';

/**
 * The JHipster definitions: the application and deployment options of the generators, the entity and relationship
 * option statements, the field validations and types, and the semantic rules of JHipster.
 */
export const getDefaultJDLDefinitions = (): Required<JDLDefinitions> => ({
  application: getDefaultJDLApplicationConfig(),
  deployment: getDefaultJDLDeploymentConfig(),
  entity: getDefaultJDLEntityConfig(),
  relationship: getDefaultJDLRelationshipConfig(),
  validation: getDefaultJDLValidationConfig(),
  fieldTypes: getDefaultJDLFieldTypesConfig(),
  rules: jhipsterSemanticRules,
});

/** A runtime from the JHipster definitions, the ones not passed. */
export const createJDLRuntime = (definitions: Partial<JDLDefinitions> = {}): JDLRuntime => {
  const defaults = getDefaultJDLDefinitions();
  return createRuntime({
    application: definitions.application ?? defaults.application,
    deployment: definitions.deployment ?? defaults.deployment,
    entity: definitions.entity ?? defaults.entity,
    relationship: definitions.relationship ?? defaults.relationship,
    validation: definitions.validation ?? defaults.validation,
    fieldTypes: definitions.fieldTypes ?? defaults.fieldTypes,
    rules: definitions.rules ?? defaults.rules,
  });
};

let defaultRuntime: JDLRuntime;
/** The runtime from the JHipster definitions. */
export const getDefaultRuntime = (): JDLRuntime => {
  defaultRuntime ??= createJDLRuntime();
  return defaultRuntime;
};
