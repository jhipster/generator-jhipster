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
