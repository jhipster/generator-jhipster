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

import { describeGithubSamples, formatSample } from './describe-samples.ts';
import { getGithubSample, getGithubSamples, getGithubSamplesGroup, getGithubSamplesGroups } from './github-group.ts';

const fixtures = join(import.meta.dirname, '__test-support__/samples-groups');
const valid = join(fixtures, 'valid');
const fileAndFolder = join(fixtures, 'file-and-folder');

describe('ci samples groups', () => {
  describe('getGithubSamplesGroups', () => {
    it('does not list the sample folder of a group as a group', async () => {
      expect(await getGithubSamplesGroups(valid)).toEqual(['custom', 'inline']);
    });
    it('lists a group defined by a file and a folder once', async () => {
      expect(await getGithubSamplesGroups(fileAndFolder)).toEqual(['folder', 'samples']);
    });
  });

  describe('getGithubSamples', () => {
    it('gives each sample with its group', async () => {
      const samples = await getGithubSamples(valid);
      expect(Object.fromEntries(Object.entries(samples).map(([name, { group }]) => [name, group]))).toEqual({
        'custom-jdl': 'custom',
        'custom-yo-rc': 'custom',
        'inline-jdl': 'inline',
      });
    });
    it('fails for a sample name two groups share', async () => {
      await expect(getGithubSamples(join(fixtures, 'duplicated'))).rejects.toThrow(
        'Sample same is defined by the first and second samples groups',
      );
    });
  });

  describe('getGithubSample', () => {
    it('finds a sample by its name across the groups', async () => {
      expect(await getGithubSample(valid, 'custom-jdl')).toEqual({
        group: 'custom',
        sample: expect.objectContaining({ 'samples-group': 'custom', 'sample-file': 'app-jdl' }),
      });
    });
    it('finds a sample in the given group', async () => {
      expect(await getGithubSample(valid, 'app-yo-rc', 'files')).toEqual({
        group: 'files',
        sample: { 'samples-group': 'files', 'sample-type': 'yo-rc' },
      });
    });
    it('fails for a sample the given group does not define', async () => {
      await expect(getGithubSample(valid, 'custom-jdl', 'files')).rejects.toThrow(
        'Sample custom-jdl not found in the files samples group, samples: app-jdl, app-yo-rc',
      );
    });
    it('fails for an unknown sample', async () => {
      await expect(getGithubSample(valid, 'constructor')).rejects.toThrow('Sample constructor not found in the samples groups');
    });
    it('fails for a sample name two groups share', async () => {
      await expect(getGithubSample(join(fixtures, 'duplicated'), 'same')).rejects.toThrow('defined by the first and second samples groups');
    });
  });

  describe('getGithubSamplesGroup', () => {
    it('refuses a group outside its folder', async () => {
      await expect(getGithubSamplesGroup(valid, '../duplicated/first')).rejects.toThrow('is not inside');
    });
  });

  describe('describeGithubSamples', () => {
    it('describes the samples of every group', async () => {
      const samples = await describeGithubSamples({ samplesGroupFolder: valid, root: fixtures });
      expect(
        samples.map(({ name, config, generatorOptions, matrix, ...sample }) => ({
          name,
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
    it('describes a sample of a sample-type the contract does not define by its file', async () => {
      const samples = await describeGithubSamples({ samplesGroupFolder: fileAndFolder, groups: ['samples'], root: fixtures });
      expect(samples).toMatchObject([
        {
          name: 'custom-type',
          jobName: 'custom type (macos)',
          matrix: { os: 'macos-latest' },
          generator: 'custom',
          sampleType: 'jdl-ejs',
          sampleFile: 'file-and-folder/samples/app.jdl.ejs',
        },
      ]);
      expect(formatSample(samples[0])).toContain('jdl-ejs sample: file-and-folder/samples/app.jdl.ejs');
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
          files: {},
          jdls: {},
          matrix: { os: matrix!.os, node: '', java: '' },
        }),
      });
      expect(samples.map(({ name, jobName }) => ({ name, jobName }))).toEqual([{ name: 'inline-jdl', jobName: 'inline-jdl-job' }]);
    });
  });
});
