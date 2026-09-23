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
import { ALPHABETIC_LOWER_PATTERN, ALPHANUMERIC_PATTERN, ALPHANUMERIC_UNDERSCORE_PATTERN, PATH_PATTERN } from '../../lib/constants/jdl.ts';

/**
 * Deployment options shared by every deployment type. The prompts still live in the deployment generators; the
 * declarations give the generators their defaults and derived properties, and the deployment JDL definitions, which
 * are derived from the `deployment` command and what it imports.
 */
const command = {
  configs: {
    appsFolders: {
      description: 'Folders of the applications to deploy',
      cli: { type: Array, hide: true },
      jdl: {
        type: 'list',
        tokenType: 'list',
        tokenValuePattern: ALPHANUMERIC_UNDERSCORE_PATTERN,
      },
      default: [],
      scope: 'storage',
    },
    clusteredDbApps: {
      description: 'Applications using a clustered database',
      cli: { type: Array, hide: true },
      jdl: {
        type: 'list',
        tokenType: 'list',
        tokenValuePattern: ALPHANUMERIC_PATTERN,
      },
      default: [],
      scope: 'storage',
    },
    directoryPath: {
      description: 'Root directory of the applications to deploy',
      cli: { type: String, hide: true },
      jdl: {
        type: 'string',
        tokenType: 'STRING',
        tokenValuePattern: PATH_PATTERN,
      },
      default: '../',
      scope: 'storage',
    },
    monitoring: {
      description: 'Monitoring solution to deploy',
      cli: { type: String, hide: true },
      jdl: {
        type: 'string',
        tokenType: 'NAME',
        tokenValuePattern: ALPHABETIC_LOWER_PATTERN,
      },
      choices: ['no', 'prometheus'],
      default: 'no',
      scope: 'storage',
    },
    serviceDiscoveryType: {
      description: 'Service discovery of the applications to deploy',
      cli: { type: String, hide: true },
      // Declared by spring-boot too, a keyword of both grammars, with the same derived property names.
      jdl: { type: 'string', tokenType: 'NAME', tokenValuePattern: ALPHABETIC_LOWER_PATTERN },
      choices: ['consul', 'eureka', 'no'],
      internal: {
        alias: 'serviceDiscovery',
        type: String,
      },
      default: 'consul',
      scope: 'storage',
    },
  },
} as const satisfies JHipsterCommandDefinition;

export default command;
