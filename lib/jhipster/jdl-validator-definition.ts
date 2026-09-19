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

import {
  ALPHABETIC,
  ALPHABETIC_LOWER,
  ALPHANUMERIC,
  ALPHANUMERIC_DASH,
  ALPHANUMERIC_UNDERSCORE,
} from '../jdl/core/built-in-options/validation-patterns.ts';
import type { JDLValidatorOption } from '../jdl/core/types/parsing.ts';

const JHI_PREFIX_NAME_PATTERN = /^[A-Za-z][A-Za-z0-9-_]*$/;
const JWT_SECRET_KEY_PATTERN = /^\S+$/;
const REMEMBER_ME_KEY_PATTERN = /^\S+$/;
const BASIC_NPM_PACKAGE_NAME_PATTERN = /^(@[a-z0-9-][a-z0-9-._]*\/)?[a-z0-9-][a-z0-9-._]*$/;

export const builtInConfigPropsValidations: Record<string, JDLValidatorOption> = {
  APPLICATION_TYPE: {
    type: 'NAME',
    pattern: ALPHABETIC_LOWER,
    msg: 'applicationType property',
  },
  AUTHENTICATION_TYPE: {
    type: 'NAME',
    pattern: ALPHANUMERIC,
    msg: 'authenticationType property',
  },
  BASE_NAME: {
    type: 'NAME',
    pattern: ALPHANUMERIC_UNDERSCORE,
    msg: 'baseName property',
  },
  BLUEPRINT: {
    type: 'NAME',
    pattern: BASIC_NPM_PACKAGE_NAME_PATTERN,
    msg: 'blueprint property',
  },
  BLUEPRINTS: {
    type: 'list',
    pattern: BASIC_NPM_PACKAGE_NAME_PATTERN,
    msg: 'blueprints property',
  },
  BUILD_TOOL: {
    type: 'NAME',
    pattern: ALPHANUMERIC,
    msg: 'buildTool property',
  },
  ENTITY_SUFFIX: {
    type: 'NAME',
    pattern: ALPHANUMERIC,
    msg: 'entitySuffix property',
  },
  DTO_SUFFIX: {
    type: 'NAME',
    pattern: ALPHANUMERIC,
    msg: 'dtoSuffix property',
  },
  ENABLE_SWAGGER_CODEGEN: { type: 'BOOLEAN' },
  FRONT_END_BUILDER: {
    type: 'NAME',
    pattern: ALPHABETIC,
    msg: 'frontendBuilder property',
  },
  GATEWAY_SERVER_PORT: { type: 'INTEGER' },
  JHIPSTER_VERSION: { type: 'STRING' },
  JHI_PREFIX: {
    type: 'NAME',
    pattern: JHI_PREFIX_NAME_PATTERN,
    msg: 'jhiPrefix property',
  },
  JWT_SECRET_KEY: {
    type: 'STRING',
    pattern: JWT_SECRET_KEY_PATTERN,
    msg: 'JWT secret key property',
  },
  REMEMBER_ME_KEY: {
    type: 'STRING',
    pattern: REMEMBER_ME_KEY_PATTERN,
    msg: 'rememberMeKey property',
  },
  SEARCH_ENGINE: {
    type: 'NAME',
    pattern: ALPHANUMERIC,
    msg: 'searchEngine property',
  },
  SERVER_PORT: { type: 'INTEGER' },
  SERVICE_DISCOVERY_TYPE: {
    type: 'NAME',
    pattern: ALPHABETIC_LOWER,
    msg: 'serviceDiscoveryType property',
  },
  SKIP_CLIENT: { type: 'BOOLEAN' },
  SKIP_SERVER: { type: 'BOOLEAN' },
  SKIP_USER_MANAGEMENT: { type: 'BOOLEAN' },
  TEST_FRAMEWORKS: {
    type: 'list',
    pattern: ALPHANUMERIC,
    msg: 'testFrameworks property',
  },
  WEBSOCKET: {
    type: 'NAME',
    pattern: ALPHANUMERIC_DASH,
    msg: 'websocket property',
  },
  ENABLE_GRADLE_DEVELOCITY: { type: 'BOOLEAN' },
  GRADLE_DEVELOCITY_HOST: {
    type: 'STRING',
    pattern: JWT_SECRET_KEY_PATTERN,
    msg: 'gradleDevelocityHost property',
  },
};
