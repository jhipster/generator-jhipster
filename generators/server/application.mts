/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
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
import { JHipsterApplicationDefinition } from '../base/api.mjs';
import { normalizePathEnd } from '../base/support/path.mjs';
import { CLIENT_MAIN_SRC_DIR, CLIENT_TEST_SRC_DIR, SERVER_MAIN_RES_DIR, SERVER_MAIN_SRC_DIR, SERVER_TEST_RES_DIR, SERVER_TEST_SRC_DIR } from '../generator-constants.mjs';
import { GENERATOR_GRADLE, GENERATOR_PROJECT_NAME } from '../generator-list.mjs';

const command: JHipsterApplicationDefinition = {
  config: {
    srcMainJava: { defaultValue: SERVER_MAIN_SRC_DIR },
    srcMainResources: { defaultValue: SERVER_MAIN_RES_DIR },
    srcMainWebapp: { defaultValue: CLIENT_MAIN_SRC_DIR },
    srcTestJava: { defaultValue: SERVER_TEST_SRC_DIR },
    srcTestResources: { defaultValue: SERVER_TEST_RES_DIR },
    srcTestJavascript: { defaultValue: CLIENT_TEST_SRC_DIR },

    packageName: {
      defaultValue: 'com.mycompany.myapp',
    },
    packageFolder: {},
    serverPort: {},
    buildTool: {},
    databaseType: {},
    devDatabaseType: {},
    prodDatabaseType: {},
    incrementalChangelog: {},
    reactive: {},
    searchEngine: {},
    cacheProvider: {},
    enableHibernateCache: {},
    serviceDiscoveryType: {},
    enableSwaggerCodegen: {},
    messageBroker: {},
    websocket: {},
    embeddableLaunchScript: {},
  },
  prepareApplication: application => {
    if (!application.packageFolder) {
      application.packageFolder = `${application.packageName.replace(/\./g, '/')}/`;
    } else {
      application.packageFolder = normalizePathEnd(application.packageFolder);
    }
  },
  import: [GENERATOR_PROJECT_NAME],
  conditionalImport: application => {
    const imports = [];
    const { buildTool, enableTranslation, databaseType, messageBroker, searchEngine } = this.jhipsterConfigWithDefaults;
    if (buildTool === GRADLE) {
      imports.push(GENERATOR_GRADLE);
    } else if (buildTool === MAVEN) {
      imports.push(GENERATOR_MAVEN);
    }

    imports.push(GENERATOR_DOCKER);

    // We don't expose client/server to cli, composing with languages is used for test purposes.
    if (enableTranslation) {
      imports.push(GENERATOR_LANGUAGES);
    }
    if (databaseType === SQL) {
      imports.push(GENERATOR_LIQUIBASE);
    } else if (databaseType === CASSANDRA) {
      imports.push(GENERATOR_CASSANDRA);
    } else if (databaseType === COUCHBASE) {
      imports.push(GENERATOR_COUCHBASE);
    } else if (databaseType === MONGODB) {
      imports.push(GENERATOR_MONGODB);
    }
    if (messageBroker === KAFKA) {
      imports.push(GENERATOR_KAFKA);
    }
    if (searchEngine === ELASTICSEARCH) {
      imports.push(GENERATOR_ELASTICSEARCH);
    }
  }

};

export default command;
