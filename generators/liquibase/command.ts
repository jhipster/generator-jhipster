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

const command = {
  options: {
    skipFakeData: {
      description: 'Skip generation of fake data for development',
      type: Boolean,
      scope: 'storage',
    },
    recreateInitialChangelog: {
      description: 'Recreate the initial database changelog based on the current config',
      type: Boolean,
      scope: 'none',
    },
    skipDbChangelog: {
      description: 'Skip the generation of database migrations',
      type: Boolean,
      scope: 'none',
    },
  },
  configs: {
    incrementalChangelog: {
      cli: {
        description: 'Creates incremental database changelogs',
        type: Boolean,
      },
      jdl: {
        type: 'boolean',
        tokenType: 'BOOLEAN',
      },
      scope: 'storage',
    },
  },
} as const satisfies JHipsterCommandDefinition;

export default command;
