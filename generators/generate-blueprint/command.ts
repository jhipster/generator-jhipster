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
import { GENERATOR_INIT } from '../generator-list.js';
import {
  ADDITIONAL_SUB_GENERATORS,
  ALL_GENERATORS,
  ALL_PRIORITIES,
  CLI_OPTION,
  DYNAMIC,
  GENERATE_SNAPSHOTS,
  JS,
  LINK_JHIPSTER_DEPENDENCY,
  LOCAL_BLUEPRINT_OPTION,
  SUB_GENERATORS,
} from './constants.js';

const command = {
  configs: {
    caret: {
      cli: {
        description: 'Use caret in package.json engines',
        type: Boolean,
      },
      scope: 'storage',
    },
    gitDependency: {
      cli: {
        description: 'Use git dependency (eg: github:jhipster/generator-jhipster#main)',
        type: String,
      },
      scope: 'generator',
    },
    cliName: {
      cli: {
        description: 'CLI name',
        type: String,
      },
      scope: 'storage',
    },
    recreatePackageLock: {
      description: 'Recreate package lock',
      cli: {
        type: Boolean,
      },
      scope: 'generator',
    },
    skipWorkflows: {
      description: 'Skip github workflows',
      cli: {
        type: Boolean,
      },
      scope: 'generator',
    },
    ignoreExistingGenerators: {
      description: 'Ignore existing generators',
      cli: {
        type: Boolean,
      },
      scope: 'generator',
    },
    githubRepository: {
      cli: {
        description: 'Github Repository',
        type: String,
      },
      scope: 'storage',
    },
    githubWorkflows: {
      cli: {
        description: 'Generate github workflows',
        type: Boolean,
      },
      scope: 'storage',
    },
  },
  options: {
    [GENERATE_SNAPSHOTS]: {
      description: 'Generate test snapshots',
      type: Boolean,
    },
    [LINK_JHIPSTER_DEPENDENCY]: {
      description: 'Link JHipster dependency for testing',
      type: Boolean,
      hide: true,
    },
    [SUB_GENERATORS]: {
      description: 'Sub generators to generate',
      type: Array,
      scope: 'storage',
    },
    [ADDITIONAL_SUB_GENERATORS]: {
      description: 'Comma separated additional sub generators to generate',
      type: String,
      scope: 'storage',
    },
    [DYNAMIC]: {
      description: 'Generate dynamic generators (advanced)',
      type: Boolean,
      scope: 'storage',
    },
    [JS]: {
      description: 'Use js extension',
      type: Boolean,
      scope: 'storage',
    },
    [LOCAL_BLUEPRINT_OPTION]: {
      description: 'Generate a local blueprint',
      type: Boolean,
      scope: 'storage',
    },
    [CLI_OPTION]: {
      description: 'Generate a cli for the blueprint',
      type: Boolean,
      scope: 'storage',
    },
    [ALL_GENERATORS]: {
      description: 'Generate every sub generator',
      type: Boolean,
      scope: 'generator',
    },
    [ALL_PRIORITIES]: {
      description: 'Generate every priority',
      type: Boolean,
    },
  },
  import: [GENERATOR_INIT],
} as const satisfies JHipsterCommandDefinition;

export default command;
