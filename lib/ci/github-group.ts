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

import { readFile, readdir } from 'node:fs/promises';
import { extname, isAbsolute, join, relative, resolve } from 'node:path';

import { type GitHubMatrixGroup, getUnknownGitHubMatrixGroupProperties } from './github-matrix.ts';

export const getGithubSamplesGroups = async (samplesGroupFolder: string, keepExtensions = false): Promise<string[]> => {
  const samplesFolderContent = await readdir(samplesGroupFolder);
  return samplesFolderContent
    .filter(sample => !sample.startsWith('_') && ['.json', '.js', '.ts', ''].includes(extname(sample)))
    .map(sample => (keepExtensions ? sample : sample.split('.')[0]));
};

/** A samples group is read from inside its folder: a group given by the command line cannot load another module. */
const assertGroupInFolder = (samplesGroupFolder: string, group: string): void => {
  const groupPath = relative(samplesGroupFolder, resolve(samplesGroupFolder, group));
  if (!groupPath || groupPath.startsWith('..') || isAbsolute(groupPath)) {
    throw new Error(`Samples group ${group} is not inside ${samplesGroupFolder}`);
  }
};

export const getGithubSamplesGroup = async (
  samplesGroupFolder: string,
  group: string,
): Promise<{ samples: GitHubMatrixGroup; warnings: string[] }> => {
  assertGroupInFolder(samplesGroupFolder, group);
  const warnings: string[] = [];
  let samples: GitHubMatrixGroup = {};
  const samplesFolderContent = await getGithubSamplesGroups(samplesGroupFolder, true);
  const groupExt = ['js', 'ts', 'json'].find(ext => samplesFolderContent.includes(`${group}.${ext}`));
  if (groupExt === 'js' || groupExt === 'ts') {
    const jsGroup: { default?: GitHubMatrixGroup } = await import(join(samplesGroupFolder, `${group}.${groupExt}`));
    // A module without default export defines no sample.
    samples = Object.fromEntries(
      Object.entries(jsGroup.default ?? {}).map(([sample, value]) => [sample, { ...value, 'samples-group': group }]),
    );
  } else if (groupExt === 'json') {
    const jsonFile = await readFile(join(samplesGroupFolder, `${group}.json`));
    samples = Object.fromEntries(
      Object.entries(JSON.parse(jsonFile.toString()) as GitHubMatrixGroup).map(([sample, value]) => [
        sample,
        { ...value, 'samples-group': group },
      ]),
    );
  } else if (samplesFolderContent.includes(group)) {
    const samplesFolderContent = await readdir(join(samplesGroupFolder, group));
    if (samplesFolderContent.length > 0) {
      // Support jdl files and folder (with .yo-rc.json files)
      samples = Object.fromEntries(
        samplesFolderContent
          .filter(sample => ['', '.jdl'].includes(extname(sample)))
          .map(sample => [
            sample.replace('.jdl', ''),
            {
              'samples-group': group,
              'sample-type': extname(sample) === '.jdl' ? 'jdl' : 'yo-rc',
            },
          ]),
      );
      if (samplesFolderContent.includes('samples.json')) {
        const jsonFile = await readFile(join(samplesGroupFolder, group, 'samples.json'));
        const jsonSamples = JSON.parse(jsonFile.toString()) as GitHubMatrixGroup;
        for (const [sample, value] of Object.entries(jsonSamples)) {
          if (!samples[sample]) {
            throw new Error(`Sample ${sample} not found in ${group}`);
          }
          samples[sample] = { ...samples[sample], ...value };
        }
      }
    }
  }
  const unknownProperties = getUnknownGitHubMatrixGroupProperties(samples);
  if (unknownProperties.length) {
    warnings.push(`Unknown properties in ${group}: ${unknownProperties.join(', ')}`);
  }
  return { samples, warnings };
};

export type GithubSample = { group: string; sample: GitHubMatrixGroup[string] };

/**
 * The samples of every group of a folder, by name: a sample name is unique across the groups, so a sample is generated
 * by its name alone.
 */
export const getGithubSamples = async (samplesGroupFolder: string): Promise<Record<string, GithubSample>> => {
  const samples: Record<string, GithubSample> = {};
  for (const group of await getGithubSamplesGroups(samplesGroupFolder)) {
    for (const [name, sample] of Object.entries((await getGithubSamplesGroup(samplesGroupFolder, group)).samples)) {
      if (samples[name]) {
        throw new Error(`Sample ${name} is defined by the ${samples[name].group} and ${group} samples groups`);
      }
      samples[name] = { group, sample };
    }
  }
  return samples;
};
