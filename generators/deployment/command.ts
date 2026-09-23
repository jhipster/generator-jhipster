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
import type { JHipsterCommandDefinition } from '../../lib/command/types.ts';
import { ALPHABETIC_DASH_LOWER_PATTERN } from '../../lib/constants/jdl.ts';

/**
 * The deployment JDL definitions are derived from the commands, the way the application ones are from `app`: the
 * options of this generator and of what it imports. The options shared by every deployment type are declared by
 * `base-workspaces`, reached through the deployment generators.
 */
const command = {
  // The deployment types it delegates to: their options are the ones of a deployment, like `app` has the ones of what
  // it composes, and the deployment JDL definitions are the options reached from here.
  import: ['docker-compose', 'kubernetes'],
  configs: {
    deploymentType: {
      description: 'Deployment type',
      cli: { type: String, hide: true },
      jdl: {
        type: 'string',
        tokenType: 'NAME',
        tokenValuePattern: ALPHABETIC_DASH_LOWER_PATTERN,
      },
      choices: ['docker-compose', 'kubernetes'],
      scope: 'storage',
    },
  },
} as const satisfies JHipsterCommandDefinition;

export default command;
