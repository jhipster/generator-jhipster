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
import type { JHipsterCommandDefinition } from '../../lib/command/index.ts';
import { ALPHANUMERIC_PATTERN, JHI_PREFIX_NAME_PATTERN } from '../../lib/constants/jdl.ts';

const command = {
  configs: {
    jhipsterVersion: {
      description: 'JHipster version the application was generated with',
      // Stamped by the generator, not an option: declared for the jdl to keep reading it until it is dropped.
      jdl: {
        type: 'string',
        tokenType: 'STRING',
        quoted: true,
        deprecated: 'it is stamped by the generator, do not set it in JDL; it will be removed in JHipster v10',
      },
      scope: 'none',
    },
    jhiPrefix: {
      cli: {
        description: 'Add prefix before services, controllers and states name',
        type: String,
      },
      jdl: {
        type: 'string',
        tokenType: 'NAME',
        tokenValuePattern: JHI_PREFIX_NAME_PATTERN,
      },
      scope: 'storage',
    },
    entitySuffix: {
      cli: {
        description: 'Add suffix after entities name',
        type: String,
      },
      jdl: {
        type: 'string',
        tokenType: 'NAME',
        tokenValuePattern: ALPHANUMERIC_PATTERN,
      },
      scope: 'storage',
    },
    dtoSuffix: {
      cli: {
        description: 'Add suffix after dtos name',
        type: String,
      },
      jdl: {
        type: 'string',
        tokenType: 'NAME',
        tokenValuePattern: ALPHANUMERIC_PATTERN,
      },
      scope: 'storage',
    },
    pkType: {
      cli: {
        description: 'Default primary key type (beta)',
        type: String,
      },
      scope: 'storage',
    },
    testFrameworks: {
      description: 'Test frameworks to be generated',
      cli: {
        type: Array,
      },
      jdl: {
        type: 'list',
        tokenType: 'list',
        tokenValuePattern: ALPHANUMERIC_PATTERN,
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
    'bootstrap',
    'jhipster:base-application:bootstrap',
    'jhipster:jdl:bootstrap',
    'common',
    'server',
    'client',
    'git',
    'cypress',
    'playwright',
    'languages',
  ],
} as const satisfies JHipsterCommandDefinition<any>;

export default command;
