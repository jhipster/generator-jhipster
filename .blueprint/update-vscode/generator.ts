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

import BaseGenerator from '../../generators/base-core/index.ts';
import { getPackageRoot } from '../../lib/index.ts';
import { getWorkflowSamples } from '../generate-sample/support/get-workflow-samples.ts';

export default class extends BaseGenerator {
  async beforeQueue() {
    await this.composeWithJHipster('bootstrap');
  }

  get [BaseGenerator.WRITING]() {
    return this.asAnyTaskGroup({
      async generateVscodeLaunch() {
        const vscodeLaunch = join(getPackageRoot(), '.vscode/launch.json');

        const baseFile: { version: string; inputs: any[]; configurations: any } = {
          version: '0.2.0',
          inputs: [],
          configurations: [
            {
              type: 'node',
              request: 'launch',
              internalConsoleOptions: 'neverOpen',
              name: 'update vscode launch.json',
              // eslint-disable-next-line no-template-curly-in-string
              program: '${workspaceFolder}/bin/jhipster.cjs',
              args: ['update-vscode'],
              console: 'integratedTerminal',
            },
          ],
        };

        const workflows = getWorkflowSamples();
        for (const [workflowName, samples] of Object.entries(workflows)) {
          baseFile.inputs.push({
            id: `${workflowName}Sample`,
            type: 'pickString',
            description: 'Sample to be generated',
            options: Object.keys(samples),
          });
          baseFile.configurations.push({
            type: 'node',
            request: 'launch',
            internalConsoleOptions: 'neverOpen',
            name: `generate sample from ${workflowName} workflow`,
            // eslint-disable-next-line no-template-curly-in-string
            program: '${workspaceFolder}/bin/jhipster.cjs',
            args: ['generate-sample', `\${input:${workflowName}Sample}`, '--global'],
            console: 'integratedTerminal',
          });
        }

        this.writeDestinationJSON(vscodeLaunch, baseFile);
      },
    });
  }
}
