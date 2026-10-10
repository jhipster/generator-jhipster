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
import { describe, expect, it } from 'esmocha';
import { join } from 'node:path';

import { describeGithubSamples } from './describe-samples.ts';
import { getGithubSamples, getGithubSamplesGroup } from './github-group.ts';

const fixtures = join(import.meta.dirname, '__test-support__/samples-groups');
const valid = join(fixtures, 'valid');

describe('ci samples groups', () => {
  describe('getGithubSamples', () => {
    it('gives each sample with its group', async () => {
      const samples = await getGithubSamples(valid);
      expect(Object.fromEntries(Object.entries(samples).map(([name, { group }]) => [name, group]))).toEqual({
        'custom-jdl': 'custom',
        'custom-yo-rc': 'custom',
        'app-jdl': 'files',
        'app-yo-rc': 'files',
        'inline-jdl': 'inline',
      });
    });
    it('fails for a sample name two groups share', async () => {
      await expect(getGithubSamples(join(fixtures, 'duplicated'))).rejects.toThrow(
        'Sample same is defined by the first and second samples groups',
      );
    });
  });

  describe('getGithubSamplesGroup', () => {
    it('refuses a group outside its folder', async () => {
      await expect(getGithubSamplesGroup(valid, '../duplicated/first')).rejects.toThrow('is not inside');
    });
  });

  describe('describeGithubSamples', () => {
    it('describes the samples of every group', async () => {
      const samples = await describeGithubSamples({ samplesGroupFolder: valid, root: fixtures, cli: './cli/cli.cjs' });
      expect(
        samples.map(({ name, command, config, generatorOptions, matrix, ...sample }) => ({
          name,
          command,
          config,
          generatorOptions,
          os: matrix.os,
          generator: sample.generator,
          files: sample.files,
          jdls: sample.jdls,
        })),
      ).toMatchInlineSnapshot(`
[
  {
    "command": "./cli/cli.cjs generate-sample 'custom-jdl'",
    "config": {
      "clientFramework": "vue",
    },
    "files": {},
    "generator": "jdl",
    "generatorOptions": {
      "skipClient": true,
    },
    "jdls": {
      "app-jdl.jdl": {
        "file": "valid/files/app-jdl.jdl",
      },
    },
    "name": "custom-jdl",
    "os": "ubuntu-latest",
  },
  {
    "command": "./cli/cli.cjs generate-sample 'custom-yo-rc'",
    "config": {
      "clientFramework": "react",
    },
    "files": {
      ".yo-rc.json": "valid/files/app-yo-rc/.yo-rc.json",
    },
    "generator": "app",
    "generatorOptions": undefined,
    "jdls": {},
    "name": "custom-yo-rc",
    "os": "macos-latest",
  },
  {
    "command": "./cli/cli.cjs generate-sample 'app-jdl'",
    "config": {
      "clientFramework": "vue",
    },
    "files": {},
    "generator": "jdl",
    "generatorOptions": undefined,
    "jdls": {
      "app-jdl.jdl": {
        "file": "valid/files/app-jdl.jdl",
      },
    },
    "name": "app-jdl",
    "os": "ubuntu-latest",
  },
  {
    "command": "./cli/cli.cjs generate-sample 'app-yo-rc'",
    "config": {
      "clientFramework": "react",
    },
    "files": {
      ".yo-rc.json": "valid/files/app-yo-rc/.yo-rc.json",
    },
    "generator": "app",
    "generatorOptions": undefined,
    "jdls": {},
    "name": "app-yo-rc",
    "os": "ubuntu-latest",
  },
  {
    "command": "./cli/cli.cjs generate-sample 'inline-jdl'",
    "config": {
      "buildTool": "gradle",
    },
    "files": {},
    "generator": "jdl",
    "generatorOptions": undefined,
    "jdls": {
      "inline-jdl.jdl": {
        "content": "application { config { baseName inline buildTool gradle } }",
      },
    },
    "name": "inline-jdl",
    "os": "ubuntu-latest",
  },
]
`);
    });
    it('describes a sample with the describeSample hook', async () => {
      const samples = await describeGithubSamples({
        samplesGroupFolder: valid,
        groups: ['inline'],
        root: fixtures,
        describeSample: ({ name, group, matrix }) => ({
          name,
          workflow: group,
          jobName: `${name}-job`,
          generator: 'app',
          command: 'custom',
          files: {},
          jdls: {},
          matrix: { os: matrix!.os, node: '', java: '' },
        }),
      });
      expect(samples.map(({ name, jobName, command }) => ({ name, jobName, command }))).toEqual([
        { name: 'inline-jdl', jobName: 'inline-jdl-job', command: 'custom' },
      ]);
    });
  });
});
