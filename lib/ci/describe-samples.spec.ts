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
import { describe, exnode, expect, it } from 'expect-node';
import { join } from 'node:path';

import jdlLogger from '../jdl/core/utils/objects/logger.ts';

import {
  describeGithubSamples,
  extractSampleFiles,
  formatSample,
  readSampleDefaultCommand,
  readSampleJDLConfig,
} from './describe-samples.ts';
import { getGithubSamples, getGithubSamplesGroup } from './github-group.ts';

const fixtures = join(import.meta.dirname, '__test-support__/samples-groups');
const valid = join(fixtures, 'valid');

describe('ci samples groups', () => {
  describe('extractSampleFiles', () => {
    it('gives the copied files and the jdl files by their source, then each inline jdl as a file', () => {
      expect(
        extractSampleFiles(
          {
            files: { '.yo-rc.json': 'samples/app/.yo-rc.json', '.jhipster/Foo.json': 'samples/app/.jhipster/Foo.json' },
            jdls: {
              'app.jdl': { content: 'application {}' },
              'entities.jdl': { file: 'samples/entities.jdl' },
              'other.jdl': { content: 'entity Bar' },
            },
          },
          { root: '/root' },
        ),
      ).toEqual([
        { destination: '.yo-rc.json', source: '/root/samples/app/.yo-rc.json' },
        { destination: '.jhipster/Foo.json', source: '/root/samples/app/.jhipster/Foo.json' },
        { destination: 'entities.jdl', source: '/root/samples/entities.jdl' },
        { destination: 'inline-1.jdl', contents: 'application {}' },
        { destination: 'inline-2.jdl', contents: 'entity Bar' },
      ]);
    });
  });

  describe('readSampleJDLConfig', () => {
    it('reads the config of a jdl without logging its warnings', () => {
      const warn = exnode.spyOn(jdlLogger, 'warn');
      try {
        expect(
          readSampleJDLConfig('application { config { baseName foo buildTool gradle } entities A }\nentity A\npaginate A with pagination'),
        ).toEqual({ buildTool: 'gradle' });
        expect(warn).not.toHaveBeenCalled();
      } finally {
        warn.mockRestore();
      }
    });
  });

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
      const samples = await describeGithubSamples({ samplesGroupFolder: valid, root: fixtures });
      expect(
        samples.map(({ name, config, generatorOptions, matrix, ...sample }) => ({
          name,
          config,
          generatorOptions,
          os: matrix.os,
          generator: sample.generator,
          defaultCommand: sample.defaultCommand,
          files: sample.files,
          jdls: sample.jdls,
        })),
      ).toMatchInlineSnapshot(`
[
  {
    "config": {
      "clientFramework": "vue",
    },
    "defaultCommand": "jdl",
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
    "defaultCommand": "spring-boot",
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
      "clientFramework": "vue",
    },
    "defaultCommand": "jdl",
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
    "config": {
      "clientFramework": "react",
    },
    "defaultCommand": "spring-boot",
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
    "config": {
      "buildTool": "gradle",
    },
    "defaultCommand": "jdl",
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
          defaultCommand: 'app',
          files: {},
          jdls: {},
          matrix: { os: matrix!.os, node: '', java: '' },
        }),
      });
      expect(samples.map(({ name, jobName }) => ({ name, jobName }))).toEqual([{ name: 'inline-jdl', jobName: 'inline-jdl-job' }]);
    });
    it('gives the command of an app sample, app without a defaultCommand', async () => {
      const samples = await describeGithubSamples({ samplesGroupFolder: valid, groups: ['custom'], root: fixtures });
      expect(formatSample(samples.find(({ name }) => name === 'custom-yo-rc')!)).toContain('command: spring-boot');
      expect(readSampleDefaultCommand(join(valid, 'files/missing/.yo-rc.json'))).toBe('app');
    });
  });
});
