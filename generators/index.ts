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
} from './generator-constants.js';

export * from './type-utils.ts';

export type { JHipsterCommandDefinition } from '../lib/command/index.ts';

class BaseApplicationGeneratorAll extends BaseApplicationGenerator<
  EntityAll,
  ApplicationAll<EntityAll>,
  ConfigAll,
  OptionsAll,
  SourceAll
> {}

export { default as GeneratorBase } from './base/index.ts';
export { default as GeneratorBaseCore } from './base-core/index.ts';
export { BaseApplicationGeneratorAll as GeneratorBaseApplication };
