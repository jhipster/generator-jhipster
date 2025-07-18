import type { ApplicationAll } from '../lib/types/application-properties-all.d.ts';
import type { ConfigAll } from '../lib/types/application-config-all.d.ts';
import type { OptionsAll } from '../lib/types/application-options-all.d.ts';
import type { SourceAll } from '../lib/types/source-all.d.ts';
import type { EntityAll } from '../lib/types/entity-all.d.ts';
import BaseApplicationGenerator from './base-application/index.ts';
export {
  JHIPSTER_DOCUMENTATION_URL,
  JHIPSTER_DOCUMENTATION_ARCHIVE_PATH,
  GENERATOR_JHIPSTER,
  JHIPSTER_CONFIG_DIR,
  RECOMMENDED_NODE_VERSION,
  RECOMMENDED_JAVA_VERSION,
  JAVA_COMPATIBLE_VERSIONS,
  JHIPSTER_DEPENDENCIES_VERSION,
  SERVER_MAIN_SRC_DIR as JAVA_MAIN_SOURCES_DIR,
  SERVER_MAIN_RES_DIR as JAVA_MAIN_RESOURCES_DIR,
  SERVER_TEST_SRC_DIR as JAVA_TEST_SOURCES_DIR,
  SERVER_TEST_RES_DIR as JAVA_SERVER_TEST_RESOURCES_DIR,
  CLIENT_MAIN_SRC_DIR as JAVA_WEBAPP_SOURCES_DIR,
  CLIENT_TEST_SRC_DIR as JAVA_JAVASCRIPT_TEST_DIR,
  JAVA_DOCKER_DIR,
  TEMPLATES_DOCKER_DIR,
  SERVER_MAIN_SRC_DIR as TEMPLATES_MAIN_SOURCES_DIR,
  SERVER_MAIN_RES_DIR as TEMPLATES_MAIN_RESOURCES_DIR,
  SERVER_TEST_SRC_DIR as TEMPLATES_TEST_SOURCES_DIR,
  SERVER_TEST_RES_DIR as TEMPLATES_TEST_RESOURCES_DIR,
  CLIENT_MAIN_SRC_DIR as TEMPLATES_WEBAPP_SOURCES_DIR,
  CLIENT_TEST_SRC_DIR as TEMPLATES_JAVASCRIPT_TEST_DIR,
} from './generator-constants.js';

export * from './type-utils.js';

export type { JHipsterCommandDefinition } from '../lib/command/index.js';

class BaseApplicationGeneratorAll extends BaseApplicationGenerator<
  EntityAll,
  ApplicationAll<EntityAll>,
  ConfigAll,
  OptionsAll,
  SourceAll
> {}

export { default as GeneratorBase } from './base/index.js';
export { default as GeneratorBaseCore } from './base-core/index.js';
export { BaseApplicationGeneratorAll as GeneratorBaseApplication };
