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
import deploymentCommand from '../deployment/command.ts';

const command = {
  configs: {
    appsFolders: {
      // the same option as the deployment one - the applications added to the workspace/deployment - and it is
      // declared once in base-workspaces, which both extend. Only the root the paths are relative to differs: the
      // monorepository parent here, the deployment directory there. Spread so a single declaration carries the jdl spec.
      ...deploymentCommand.configs.appsFolders,
      cli: {
        name: 'workspacesFolders',
        type: Array,
        default: [],
      },
      description: 'Folders to use as monorepository workspace',
      scope: 'storage',
    },
    entrypointGenerator: {
      description: 'Entrypoint generator to be used',
      cli: {
        type: String,
        hide: true,
      },
      scope: 'generator',
    },
    workspaces: {
      cli: {
        type: Boolean,
      },
      description: 'Generate workspaces for multiples applications',
      scope: 'generator',
    },
    generateApplications: {
      cli: {
        type: Function,
        hide: true,
      },
      scope: 'generator',
    },
    generateWith: {
      cli: {
        type: String,
        default: 'app',
        hide: true,
      },
      scope: 'generator',
    },
  },
  import: ['git'],
} as const satisfies JHipsterCommandDefinition;

export default command;
