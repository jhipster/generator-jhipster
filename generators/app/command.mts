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
import { JHipsterCommandDefinition } from '../base/api.mjs';
import {
  GENERATOR_BOOTSTRAP,
  GENERATOR_CLIENT,
  GENERATOR_COMMON,
  GENERATOR_CYPRESS,
  GENERATOR_GIT,
  GENERATOR_SERVER,
} from '../generator-list.mjs';

const command: JHipsterCommandDefinition = {
  options: {
    defaults: {
      description: 'Execute jhipster with default config',
      type: Boolean,
    },
    applicationType: {
      description: 'Application type to generate',
      type: String,
      scope: 'storage',
    },
    skipClient: {
      description: 'Skip the client-side application generation',
      type: Boolean,
      scope: 'storage',
    },
    skipServer: {
      description: 'Skip the server-side application generation',
      type: Boolean,
      scope: 'storage',
    },
    skipCommitHook: {
      description: 'Skip adding husky commit hooks',
      type: Boolean,
      scope: 'storage',
    },
    skipUserManagement: {
      description: 'Skip the user management module during app generation',
      type: Boolean,
      scope: 'storage',
    },
    skipCheckLengthOfIdentifier: {
      description: 'Skip check the length of the identifier, only for recent Oracle databases that support 30+ characters metadata',
      type: Boolean,
      scope: 'storage',
    },
    skipFakeData: {
      description: 'Skip generation of fake data for development',
      type: Boolean,
      scope: 'storage',
    },
    jhiPrefix: {
      description: 'Add prefix before services, controllers and states name',
      type: String,
      scope: 'storage',
    },
    entitySuffix: {
      description: 'Add suffix after entities name',
      type: String,
      scope: 'storage',
    },
    dtoSuffix: {
      description: 'Add suffix after dtos name',
      type: String,
      scope: 'storage',
    },
    authenticationType: {
      name: 'auth',
      description: 'Provide authentication type for the application when skipping server side generation',
      type: String,
      scope: 'storage',
    },
    db: {
      description: 'Provide DB name for the application when skipping server side generation',
      type: String,
    },
    blueprint: {
      description: 'DEPRECATED: Specify a generator blueprint to use for the sub generators',
      type: Array,
    },
    blueprints: {
      description:
        'A comma separated list of one or more generator blueprints to use for the sub generators, e.g. --blueprints kotlin,vuejs',
      type: String,
    },
    incrementalChangelog: {
      description: 'Creates incremental database changelogs',
      type: Boolean,
      scope: 'storage',
    },
    recreateInitialChangelog: {
      description: 'Recreate the initial database changelog based on the current config',
      type: Boolean,
    },
    ignoreErrors: {
      description: "Don't fail on prettier errors.",
      type: Boolean,
    },
    nativeLanguage: {
      alias: 'n',
      description: 'Set application native language',
      type: String,
      required: false,
    },
    enableTranslation: {
      description: 'Enable translation',
      type: Boolean,
      required: false,
      scope: 'storage',
    },
    language: {
      alias: 'l',
      description: 'Language to be added to application (existing languages are not removed)',
      type: Array,
    },
    pkType: {
      description: 'Default primary key type (beta)',
      type: String,
      scope: 'storage',
    },
    clientPackageManager: {
      description: 'Force an unsupported client package manager',
      type: String,
      scope: 'storage',
    },
    microfrontend: {
      description: 'Force generation of experimental microfrontend support',
      type: Boolean,
      scope: 'storage',
    },
    testFrameworks: {
      description: 'Test frameworks to be generated',
      type: Array,
    },
  },
  loadGeneratorOptions: true,
  import: [GENERATOR_BOOTSTRAP, GENERATOR_SERVER, GENERATOR_CLIENT, GENERATOR_COMMON, GENERATOR_GIT, GENERATOR_CYPRESS],
};

export default command;
