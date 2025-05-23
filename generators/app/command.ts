/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
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
import type { JHipsterCommandDefinition } from '../../lib/command/index.js';
import {
  GENERATOR_BOOTSTRAP,
  GENERATOR_BOOTSTRAP_APPLICATION_BASE,
  GENERATOR_CLIENT,
  GENERATOR_COMMON,
  GENERATOR_CYPRESS,
  GENERATOR_GIT,
  GENERATOR_LANGUAGES,
  GENERATOR_SERVER,
} from '../generator-list.js';

const command = {
  options: {
    defaults: {
      description: 'Execute jhipster with default config',
      type: Boolean,
      scope: 'none',
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
    pkType: {
      description: 'Default primary key type (beta)',
      type: String,
      scope: 'storage',
    },
  },
  configs: {
    testFrameworks: {
      description: 'Test frameworks to be generated',
      cli: {
        type: Array,
      },
      configure(gen, value) {
        if (value) {
          gen.jhipsterConfig.testFrameworks = [...new Set([...(gen.jhipsterConfig.testFrameworks || []), ...value])];
        }
      },
      scope: 'none',
    },
  },
  import: [
    'base',
    'base-application',
    GENERATOR_BOOTSTRAP,
    GENERATOR_BOOTSTRAP_APPLICATION_BASE,
    GENERATOR_COMMON,
    GENERATOR_SERVER,
    GENERATOR_CLIENT,
    GENERATOR_GIT,
    GENERATOR_CYPRESS,
    GENERATOR_LANGUAGES,
  ],
} as const satisfies JHipsterCommandDefinition;

export default command;
