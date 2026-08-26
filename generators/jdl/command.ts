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

const command = {
  arguments: {
    jdlFiles: {
      type: Array,
    },
  },
  configs: {
    entrypointGenerator: {
      description: 'Entrypoint generator to be used',
      cli: {
        type: String,
        hide: true,
      },
      scope: 'generator',
    },
    interactive: {
      description:
        'Generate multiple applications in series so that questions can be interacted with. This is the default when there is an existing application configuration in any of the folders',
      cli: {
        type: Boolean,
      },
      scope: 'generator',
    },
    jsonOnly: {
      description: 'Generate only the JSON files and skip entity regeneration',
      cli: {
        type: Boolean,
      },
      scope: 'generator',
    },
    ignoreApplication: {
      description: 'Ignores application generation',
      cli: {
        type: Boolean,
      },
      scope: 'generator',
    },
    ignoreDeployments: {
      description: 'Ignores deployments generation',
      cli: {
        type: Boolean,
      },
      scope: 'generator',
    },
    skipSampleRepository: {
      description: 'Disable fetching sample files when the file is not a URL',
      cli: {
        type: Boolean,
      },
      scope: 'generator',
    },
    inline: {
      description: 'Pass JDL content inline. Argument can be skipped when passing this',
      cli: {
        type: String,
        env: 'JHI_JDL',
      },
      scope: 'generator',
    },
    skipUserManagement: {
      description: 'Skip the user management module during app generation',
      cli: {
        type: Boolean,
      },
      scope: 'generator',
    },
  },
  import: ['workspaces'],
} as const satisfies JHipsterCommandDefinition;

export default command;
