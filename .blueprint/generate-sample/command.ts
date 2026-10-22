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
import { join } from 'node:path';
import process from 'node:process';

import type { JHipsterCommandDefinition } from '../../lib/command/index.ts';
import { defaultSamplesFolder } from '../constants.ts';
import { describeSampleGroups } from '../describe-samples/support.ts';

/** The choice of the samples of every workflow. */
const ALL_WORKFLOWS = '*';

const command = {
  configs: {
    workflow: {
      description: 'Workflow of the sample, to choose it from',
      cli: {
        type: String,
      },
      prompt: gen => ({
        when: !gen.sampleName && !gen.workflow,
        type: 'select',
        message: 'Which workflow is the sample of?',
        choices: () => [{ name: 'All workflows', value: ALL_WORKFLOWS }, ...Object.keys(describeSampleGroups())],
        default: ALL_WORKFLOWS,
      }),
      scope: 'generator',
    },
    sampleName: {
      argument: {
        type: String,
      },
      prompt: gen => ({
        when: !gen.sampleName,
        type: 'select',
        message: 'Which sample do you want to generate?',
        choices: answers => {
          const groups = describeSampleGroups();
          const workflow = answers.workflow ?? gen.workflow ?? ALL_WORKFLOWS;
          return workflow === ALL_WORKFLOWS ? Object.values(groups).flatMap(group => group.samples) : groups[workflow].samples;
        },
      }),
      scope: 'generator',
    },
    global: {
      cli: {
        type: Boolean,
        description: 'Generate in global samples folder',
      },
      configure: gen => {
        if (gen.global && !gen.projectFolder) {
          gen.projectFolder = join(gen._globalConfig.get('samplesFolder') ?? defaultSamplesFolder, gen.sampleName);
        }
      },
      scope: 'generator',
    },
    projectFolder: {
      cli: {
        type: String,
        description: 'Folder to generate the sample',
        env: 'JHI_FOLDER_APP',
      },
      configure: gen => {
        if (!gen.projectFolder) {
          gen.projectFolder = process.cwd();
        }
      },
      scope: 'generator',
    },
    sampleOnly: {
      cli: {
        type: Boolean,
      },
      description: 'Copy sample to destination only',
      scope: 'generator',
    },
  },
  import: ['app', 'workspaces', 'generate-blueprint'],
} as const satisfies JHipsterCommandDefinition<any>;

export default command;
