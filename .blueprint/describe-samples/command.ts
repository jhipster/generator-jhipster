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
import { getWorkflowNames, isDaily } from '../generate-sample/support/get-workflow-samples.ts';
import { workflowChoices } from '../github-build-matrix/command.ts';

export default {
  configs: {
    sampleName: {
      description: 'Sample or job name to describe, lists every sample when omitted',
      argument: {
        type: String,
      },
      scope: 'generator',
    },
    workflow: {
      description: 'Only the samples of a workflow',
      cli: {
        type: String,
      },
      choices: [...workflowChoices, ...getWorkflowNames().filter(isDaily)],
      scope: 'generator',
    },
    json: {
      description: 'Print the description as json',
      cli: {
        type: Boolean,
      },
      scope: 'generator',
    },
  },
} as const satisfies JHipsterCommandDefinition;
