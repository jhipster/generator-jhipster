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

import { readFileSync, readdirSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { extname, isAbsolute, join, relative, resolve } from 'node:path';

import { type GitHubMatrixGroup, getUnknownGitHubMatrixGroupProperties } from './github-matrix.ts';

/** Loads a samples group synchronously: Node requires an ES module without top-level await. */
const requireGroup = createRequire(import.meta.url);

/** The samples groups of the content of a folder: its `.json`, `.js` and `.ts` modules and its folders, the `_` ones left out. */
const samplesGroupNames = (samplesFolderContent: string[], keepExtensions: boolean): string[] =>
  samplesFolderContent
    .filter(sample => !sample.startsWith('_') && ['.json', '.js', '.ts', ''].includes(extname(sample)))
    .map(sample => (keepExtensions ? sample : sample.split('.')[0]));

export const getGithubSamplesGroups = async (samplesGroupFolder: string, keepExtensions = false): Promise<string[]> =>
  samplesGroupNames(await readdir(samplesGroupFolder), keepExtensions);

/** The samples groups of a folder, read synchronously, like getGithubSamplesGroups. */
export const getGithubSamplesGroupsSync = (samplesGroupFolder: string, keepExtensions = false): string[] =>
  samplesGroupNames(readdirSync(samplesGroupFolder), keepExtensions);

/** A samples group is read from inside its folder: a group given by the command line cannot load another module. */
const assertGroupInFolder = (samplesGroupFolder: string, group: string): void => {
  const groupPath = relative(samplesGroupFolder, resolve(samplesGroupFolder, group));
  if (!groupPath || groupPath.startsWith('..') || isAbsolute(groupPath)) {
    throw new Error(`Samples group ${group} is not inside ${samplesGroupFolder}`);
  }
};

/** The samples of a group defined by code (a `.js` or `.ts` module), each tagged with its group. */
export const githubSamplesGroupOf = (group: string, samples: GitHubMatrixGroup = {}): GitHubMatrixGroup =>
  Object.fromEntries(Object.entries(samples).map(([sample, value]) => [sample, { ...value, 'samples-group': group }]));

/**
 * The samples of a group defined by a folder, read synchronously: each `.jdl` file or `.yo-rc.json` folder is a sample,
 * with the options of the `samples.json` file of the folder.
 */
export const getGithubSamplesFolderGroup = (samplesGroupFolder: string, group: string): GitHubMatrixGroup => {
  assertGroupInFolder(samplesGroupFolder, group);
  const samplesFolderContent = readdirSync(join(samplesGroupFolder, group));
  // Support jdl files and folder (with .yo-rc.json files)
  const samples: GitHubMatrixGroup = Object.fromEntries(
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
    const jsonSamples = JSON.parse(readFileSync(join(samplesGroupFolder, group, 'samples.json')).toString()) as GitHubMatrixGroup;
    for (const [sample, value] of Object.entries(jsonSamples)) {
      if (!samples[sample]) {
        throw new Error(`Sample ${sample} not found in ${group}`);
      }
      samples[sample] = { ...samples[sample], ...value };
    }
  }
  return samples;
};

/** The samples of a group defined by a `.json` file, each tagged with its group. */
const jsonSamplesGroupOf = (group: string, jsonFile: string): GitHubMatrixGroup =>
  Object.fromEntries(
    Object.entries(JSON.parse(jsonFile) as GitHubMatrixGroup).map(([sample, value]) => [sample, { ...value, 'samples-group': group }]),
  );

/** The extension of the module defining a group, none for a group defined by a folder. */
const samplesGroupExtension = (samplesFolderContent: string[], group: string): string | undefined =>
  ['js', 'ts', 'json'].find(ext => samplesFolderContent.includes(`${group}.${ext}`));

/** The warnings of the samples of a group: the properties no job of the matrix takes. */
const samplesGroupWarnings = (group: string, samples: GitHubMatrixGroup): string[] => {
  const unknownProperties = getUnknownGitHubMatrixGroupProperties(samples);
  return unknownProperties.length ? [`Unknown properties in ${group}: ${unknownProperties.join(', ')}`] : [];
};

export const getGithubSamplesGroup = async (
  samplesGroupFolder: string,
  group: string,
): Promise<{ samples: GitHubMatrixGroup; warnings: string[] }> => {
  assertGroupInFolder(samplesGroupFolder, group);
  let samples: GitHubMatrixGroup = {};
  const samplesFolderContent = await getGithubSamplesGroups(samplesGroupFolder, true);
  const groupExt = samplesGroupExtension(samplesFolderContent, group);
  if (groupExt === 'js' || groupExt === 'ts') {
    const jsGroup: { default?: GitHubMatrixGroup } = await import(join(samplesGroupFolder, `${group}.${groupExt}`));
    // A module without default export defines no sample.
    samples = githubSamplesGroupOf(group, jsGroup.default);
  } else if (groupExt === 'json') {
    samples = jsonSamplesGroupOf(group, (await readFile(join(samplesGroupFolder, `${group}.json`))).toString());
  } else if (samplesFolderContent.includes(group)) {
    samples = getGithubSamplesFolderGroup(samplesGroupFolder, group);
  }
  return { samples, warnings: samplesGroupWarnings(group, samples) };
};

/**
 * The samples of a group, read synchronously, like getGithubSamplesGroup: its `.js` or `.ts` module is loaded with
 * require, which Node does for an ES module without top-level await, so a group awaiting at its top level fails with
 * ERR_REQUIRE_ASYNC_MODULE. For the tools that cannot await, like the support module of a `.blueprint`, which
 * yeoman-environment loads with require.
 *
 * Such a group takes the whole reading with it, not only itself: a caller that reads every group of a folder as its
 * module is loaded, as the support of the build matrix does, gets no group at all, and the matrix of the CI with them.
 */
export const getGithubSamplesGroupSync = (
  samplesGroupFolder: string,
  group: string,
): { samples: GitHubMatrixGroup; warnings: string[] } => {
  assertGroupInFolder(samplesGroupFolder, group);
  let samples: GitHubMatrixGroup = {};
  const samplesFolderContent = getGithubSamplesGroupsSync(samplesGroupFolder, true);
  const groupExt = samplesGroupExtension(samplesFolderContent, group);
  if (groupExt === 'js' || groupExt === 'ts') {
    const jsGroup = requireGroup(join(samplesGroupFolder, `${group}.${groupExt}`)) as { default?: GitHubMatrixGroup };
    // A module without default export defines no sample.
    samples = githubSamplesGroupOf(group, jsGroup.default);
  } else if (groupExt === 'json') {
    samples = jsonSamplesGroupOf(group, readFileSync(join(samplesGroupFolder, `${group}.json`)).toString());
  } else if (samplesFolderContent.includes(group)) {
    samples = getGithubSamplesFolderGroup(samplesGroupFolder, group);
  }
  return { samples, warnings: samplesGroupWarnings(group, samples) };
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
