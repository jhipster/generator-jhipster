#!/usr/bin/env node
import { writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

import { getWorkflowSamples } from './lib/get-workflow-samples.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const vscodeLaunch = join(__dirname, '../../.vscode/launch.json');

const baseFile = {
  version: '0.2.0',
  inputs: [],
  configurations: [
    {
      type: 'node',
      request: 'launch',
      internalConsoleOptions: 'neverOpen',
      name: 'update vscode launch.json',
      program: '${workspaceFolder}/test-integration/scripts/99-update-vscode.js',
      console: 'integratedTerminal',
    },
    {
      command: 'npx --no open-cli ${workspaceFolder}/../jhipster-samples; exit 0',
      name: 'open generated samples folder',
      request: 'launch',
      type: 'node-terminal',
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
    program: '${workspaceFolder}/test-integration/scripts/12-generate-sample.js',
    args: [`\${input:${workflowName}Sample}`],
    console: 'integratedTerminal',
  });
}

writeFileSync(vscodeLaunch, JSON.stringify(baseFile, null, 2));
