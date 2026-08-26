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

import type { ApplicationAll, EntityAll } from '../lib/types/application-all.ts';
import type { ConfigAll, OptionsAll } from '../lib/types/command-all.ts';
import type { SourceAll } from '../lib/types/source-all.d.ts';

import BaseApplicationGenerator from './base-application/index.ts';
export {
  CLIENT_MAIN_SRC_DIR as JAVA_WEBAPP_SOURCES_DIR,
  CLIENT_MAIN_SRC_DIR as TEMPLATES_WEBAPP_SOURCES_DIR,
  CLIENT_TEST_SRC_DIR as JAVA_JAVASCRIPT_TEST_DIR,
  CLIENT_TEST_SRC_DIR as TEMPLATES_JAVASCRIPT_TEST_DIR,
  GENERATOR_JHIPSTER,
  JAVA_COMPATIBLE_VERSIONS,
  JAVA_DOCKER_DIR,
  JHIPSTER_CONFIG_DIR,
  JHIPSTER_DEPENDENCIES_VERSION,
  RECOMMENDED_JAVA_VERSION,
  RECOMMENDED_NODE_VERSION,
  SERVER_MAIN_RES_DIR as JAVA_MAIN_RESOURCES_DIR,
  SERVER_MAIN_RES_DIR as TEMPLATES_MAIN_RESOURCES_DIR,
  SERVER_MAIN_SRC_DIR as JAVA_MAIN_SOURCES_DIR,
  SERVER_MAIN_SRC_DIR as TEMPLATES_MAIN_SOURCES_DIR,
  SERVER_TEST_RES_DIR as JAVA_SERVER_TEST_RESOURCES_DIR,
  SERVER_TEST_RES_DIR as TEMPLATES_TEST_RESOURCES_DIR,
  SERVER_TEST_SRC_DIR as JAVA_TEST_SOURCES_DIR,
  SERVER_TEST_SRC_DIR as TEMPLATES_TEST_SOURCES_DIR,
  TEMPLATES_DOCKER_DIR,
} from './generator-constants.ts';

export * from './type-utils.ts';

export type { JHipsterCommandDefinition } from '../lib/command/index.ts';

class BaseApplicationGeneratorAll extends BaseApplicationGenerator<EntityAll, ApplicationAll, ConfigAll, OptionsAll, SourceAll> {}

export { default as GeneratorBase } from './base/index.ts';
export { default as GeneratorBaseCore } from './base-core/index.ts';
export { BaseApplicationGeneratorAll as GeneratorBaseApplication };
