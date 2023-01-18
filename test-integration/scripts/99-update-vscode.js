#!/usr/bin/env node
import { writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

import getWorkflowSamples from './lib/get-workflow-samples.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const vscodeLaunch = join(__dirname, '../../.vscode/launch.json');

const baseFile = {
  version: '0.2.0',
  configurations: [
    {
      type: 'node',
      request: 'launch',
      internalConsoleOptions: 'neverOpen',
      name: 'update vscode launch',
      program: '${workspaceFolder}/test-integration/scripts/99-update-vscode.js',
      runtimeArgs: ['--loader=@node-loaders/esbuild'],
      console: 'integratedTerminal',
    },
    {
      command: 'npx --no open-cli ${workspaceFolder}/../jhipster-samples; exit 0',
      name: 'open generated jhipster samples folder',
      request: 'launch',
      type: 'node-terminal',
    },
  ],
};

const samples = getWorkflowSamples();
baseFile.configurations.push(
  ...Object.keys(samples)
    .map(sample => [
      {
        type: 'node',
        request: 'launch',
        internalConsoleOptions: 'neverOpen',
        name: `generate ${sample} sample`,
        program: '${workspaceFolder}/test-integration/scripts/12-generate-sample.js',
        runtimeArgs: ['--loader=@node-loaders/esbuild'],
        args: [sample],
        console: 'integratedTerminal',
      },
    ])
    .flat()
);

writeFileSync(vscodeLaunch, JSON.stringify(baseFile, null, 2));
