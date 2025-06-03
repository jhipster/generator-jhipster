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
import type { JHipsterCommandDefinition } from '../../lib/command/types.js';
import { parseCreationTimestamp } from './support/timestamp.js';

const command = {
  configs: {
    useVersionPlaceholders: {
      description: 'replace mutable versions with placeholders',
      cli: {
        type: Boolean,
        env: 'VERSION_PLACEHOLDERS',
        hide: true,
      },
      scope: 'generator',
    },
    skipChecks: {
      description: 'Check the status of the required tools',
      cli: {
        type: Boolean,
      },
      scope: 'generator',
    },
    experimental: {
      description:
        'Enable experimental features. Please note that these features may be unstable and may undergo breaking changes at any time',
      cli: {
        type: Boolean,
      },
      scope: 'generator',
    },
    blueprints: {
      description:
        'A comma separated list of one or more generator blueprints to use for the sub generators, e.g. --blueprints kotlin,vuejs',
      cli: {
        type: String,
      },
      scope: 'none',
    },
    disableBlueprints: {
      description: 'Disable blueprints support',
      cli: {
        type: Boolean,
      },
      scope: 'generator',
    },
    debugEnabled: {
      description: 'Enable debugger',
      cli: {
        name: 'debug',
        type: Boolean,
        alias: 'd',
      },
      scope: 'generator',
    },
    reproducible: {
      description: 'Try to reproduce changelog',
      cli: {
        type: Boolean,
      },
      scope: 'none',
    },
    ignoreNeedlesError: {
      description: 'Ignore needles failures',
      cli: {
        type: Boolean,
        hide: true,
      },
      scope: 'generator',
    },
    clientPackageManager: {
      description: 'Force an unsupported client package manager',
      cli: {
        type: String,
      },
      scope: 'storage',
    },
    ignoreErrors: {
      description: "Don't fail on prettier errors.",
      cli: {
        type: Boolean,
      },
      scope: 'none',
    },
    creationTimestamp: {
      description: 'Project creation timestamp (used for reproducible builds)',
      cli: {
        type: parseCreationTimestamp,
      },
      scope: 'storage',
    },
    blueprint: {
      description: 'DEPRECATED: Specify a generator blueprint to use for the sub generators',
      internal: {
        type: Array,
      },
      scope: 'none',
    },
    jdlDefinition: {
      internal: true,
      scope: 'none',
    },
  },
} as const satisfies JHipsterCommandDefinition;

export default command;
