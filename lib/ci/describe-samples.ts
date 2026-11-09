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
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, dirname, extname, join, relative, resolve } from 'node:path';

import { parse } from '../jdl/core/parsing/index.ts';
import { getDefaultRuntime } from '../jdl-config/jdl-runtime.ts';

import { getGithubSamplesGroup, getGithubSamplesGroups } from './github-group.ts';
import { type GitHubMatrix, type GitHubMatrixGroup, type GitHubMatrixGroupItem, convertToGitHubMatrix } from './github-matrix.ts';

/** The `.yo-rc.json` keys worth showing in a sample description. */
const CONFIG_KEYS = [
  'applicationType',
  'clientFramework',
  'clientBundler',
  'microfrontend',
  'authenticationType',
  'databaseType',
  'prodDatabaseType',
  'devDatabaseType',
  'reactive',
  'buildTool',
  'cacheProvider',
  'enableHibernateCache',
  'searchEngine',
  'messageBroker',
  'serviceDiscoveryType',
  'websocket',
  'testFrameworks',
  'enableTranslation',
  'languages',
  'cypressCoverage',
  'cypressAudit',
  'graalvmSupport',
];

/** A jdl of a sample: a file, or the content of an inline jdl. */
export type SampleJDL = { file: string } | { content: string };

/** A sample: what generates it, the files it copies, and what its CI job runs it with. */
export type SampleDescription = {
  name: string;
  /** The workflow, or samples group, of the sample. */
  workflow: string;
  /** The job name the sample defines, the sample name by default, without the environment its CI job name appends. */
  jobName: string;
  disabled?: boolean;
  sonar?: boolean;
  /** The generator the sample is generated with: the jdl one from its jdl, the app one from its `.yo-rc.json`. */
  generator: 'jdl' | 'app';
  /**
   * The command generating the sample: `jdl` for a jdl sample, with its jdl files as arguments; the `defaultCommand` of
   * the `.yo-rc.json` of an app sample, `app` by default.
   */
  defaultCommand: string;
  /** The files copied to the project but the jdl ones: the path in the project, relative to it, to the source file. */
  files: Record<string, string>;
  /** The jdl the sample is generated from, by their name in the project: a source file, or an inline jdl. */
  jdls: Record<string, SampleJDL>;
  /** The configuration of the application worth showing. */
  config?: Record<string, unknown>;
  generatorOptions?: Record<string, unknown>;
  environment?: string;
  war?: boolean;
  /** The entity set of the `.jhipster` files, `jdl-entity` and `jdl-samples` values of a workflow sample. */
  entitiesSample?: string;
  jdlEntity?: string;
  jdlSamples?: string;
  matrix: { os: string; node: string; java: string };
};

/** A file of the project of a sample: its destination in the project, and the file it is copied from or its contents. */
export type SampleFile = { destination: string } & ({ source: string } | { contents: string });

/**
 * The files of the project of a sample: the files it copies, like its `.yo-rc.json` and its `.jhipster` entities, and its
 * jdl files, from their source in the root; then each inline jdl as a file of its own, `inline-<n>.jdl`, with its contents.
 */
export const extractSampleFiles = (sample: Pick<SampleDescription, 'files' | 'jdls'>, { root }: { root: string }): SampleFile[] => {
  const jdls = Object.entries(sample.jdls);
  return [
    ...Object.entries(sample.files).map(([destination, source]) => ({ destination, source: resolve(root, source) })),
    ...jdls.flatMap(([destination, jdl]) => ('file' in jdl ? [{ destination, source: resolve(root, jdl.file) }] : [])),
    ...jdls
      .flatMap(([, jdl]) => ('content' in jdl ? [jdl.content] : []))
      .map((contents, index) => ({ destination: `inline-${index + 1}.jdl`, contents })),
  ];
};

const isDirectory = (path: string): boolean => {
  try {
    return statSync(path).isDirectory();
  } catch {
    return false;
  }
};

/**
 * The files a source copies to the project, by destination: a file by its name, a folder with its content. The sources
 * are relative to the root.
 */
export const copiedFilesOf = (root: string, source: string): [string, string][] => {
  const path = join(root, source);
  if (!isDirectory(path)) return [[basename(source), source]];
  return readdirSync(path, { recursive: true, withFileTypes: true })
    .filter(entry => entry.isFile())
    .map(entry => {
      const file = join(entry.parentPath, entry.name);
      return [relative(path, file), relative(root, file)];
    });
};

/** The files and the jdl of a sample from the files it copies, by destination, and its inline jdl, by name. */
export const sampleFilesOf = (
  copies: [string, string][],
  inlineJDLs: Record<string, string> = {},
): Pick<SampleDescription, 'files' | 'jdls'> => ({
  files: Object.fromEntries(copies.filter(([destination]) => extname(destination) !== '.jdl')),
  jdls: Object.fromEntries([
    ...Object.entries(inlineJDLs).map(([name, content]) => [name, { content }] as [string, SampleJDL]),
    ...copies
      .filter(([destination]) => extname(destination) === '.jdl')
      .map(([destination, file]) => [destination, { file }] as [string, SampleJDL]),
  ]),
});

const pickConfig = (config: Record<string, unknown>): Record<string, unknown> =>
  Object.fromEntries(CONFIG_KEYS.filter(key => config[key] !== undefined).map(key => [key, config[key]]));

/** The command of the `.yo-rc.json` file of an app sample: its `defaultCommand`, `app` by default. */
export const readSampleDefaultCommand = (yoRcFile: string | undefined): string => {
  if (!yoRcFile || !existsSync(yoRcFile)) return 'app';
  return JSON.parse(readFileSync(yoRcFile, 'utf8'))['generator-jhipster']?.defaultCommand ?? 'app';
};

/** The configuration of a `.yo-rc.json` file worth showing. */
export const readSampleConfig = (yoRcFile: string | undefined): Record<string, unknown> | undefined => {
  if (!yoRcFile || !existsSync(yoRcFile)) return undefined;
  return pickConfig(JSON.parse(readFileSync(yoRcFile, 'utf8'))['generator-jhipster'] ?? {});
};

/** The configuration the first application of a JDL declares, worth showing. */
export const readSampleJDLConfig = (jdl: string): Record<string, unknown> | undefined => {
  try {
    // The config as the jdl writes it, parsed only: describing a sample writes no file, and tells nothing about its jdl,
    // its warnings, a deprecated option for instance, are not logged.
    const { applications } = parse(jdl, getDefaultRuntime(), { onWarning: () => {} });
    return pickConfig(applications[0]?.config ?? {});
  } catch {
    // A template JDL completed by the generator options.
    return undefined;
  }
};

export const sampleMatrixOf = (item: GitHubMatrix | undefined): SampleDescription['matrix'] => ({
  os: item?.os ?? '',
  node: item?.['node-version'] ?? '',
  java: item?.['java-version'] ?? '',
});

export type DescribeGithubSamplesOptions = {
  /** The folder of the samples groups. */
  samplesGroupFolder: string;
  /** The groups to describe, every group of the folder when omitted. */
  groups?: string[];
  /** The folder the described files are relative to. */
  root: string;
  /** Describes a sample the contract does not define, like a sample folder given with its arguments. */
  describeSample?: (sample: {
    name: string;
    group: string;
    item: GitHubMatrixGroupItem;
    matrix: GitHubMatrix | undefined;
  }) => SampleDescription | undefined;
  /** The samples to describe, by name, every sample when omitted: the matrix of the group is the same. */
  filter?: (name: string) => boolean;
};

/**
 * Describe the samples of a samples group already loaded: a sample is generated from an inline `jdl`, or from the `jdl`
 * or `yo-rc` (`sample-type`) file `sample-file` (the sample name by default) of the `sample-folder` (the group by
 * default) of the samples groups folder.
 */
export const describeGithubSamplesGroup = ({
  samplesGroupFolder,
  group,
  samples,
  root,
  describeSample,
  filter,
}: Omit<DescribeGithubSamplesOptions, 'groups'> & { group: string; samples: GitHubMatrixGroup }): SampleDescription[] => {
  const relativeToRoot = (file: string) => relative(root, file);
  const descriptions: SampleDescription[] = [];
  const matrix = convertToGitHubMatrix(samples);
  for (const [name, item] of Object.entries(samples)) {
    if (filter && !filter(name)) continue;
    const entry = matrix.include.find(candidate => candidate['job-name'] === name);
    const custom = describeSample?.({ name, group, item, matrix: entry });
    if (custom) {
      descriptions.push(custom);
      continue;
    }
    const base = {
      name,
      workflow: group,
      jobName: name,
      disabled: item.disabled ? true : undefined,
      generatorOptions: item.generatorOptions,
      matrix: sampleMatrixOf(entry),
    };
    const sampleFile = join(samplesGroupFolder, item['sample-folder'] ?? group, item['sample-file'] ?? name);
    let description: SampleDescription;
    if (item.jdl) {
      description = {
        ...base,
        generator: 'jdl',
        defaultCommand: 'jdl',
        ...sampleFilesOf([], { [`${name}.jdl`]: item.jdl }),
        config: readSampleJDLConfig(item.jdl),
      };
    } else if (item['sample-type'] === 'jdl') {
      description = {
        ...base,
        generator: 'jdl',
        defaultCommand: 'jdl',
        ...sampleFilesOf([[basename(`${sampleFile}.jdl`), relativeToRoot(`${sampleFile}.jdl`)]]),
        config: readSampleJDLConfig(readFileSync(`${sampleFile}.jdl`, 'utf8')),
      };
    } else if (item['sample-type'] === 'yo-rc') {
      // A yo-rc sample copies every file of its folder.
      description = {
        ...base,
        generator: 'app',
        defaultCommand: readSampleDefaultCommand(join(sampleFile, '.yo-rc.json')),
        ...sampleFilesOf(copiedFilesOf(root, relativeToRoot(sampleFile))),
        config: readSampleConfig(join(sampleFile, '.yo-rc.json')),
      };
    } else {
      throw new Error(`Sample ${name} of the ${group} samples group has no jdl, nor a jdl or yo-rc sample-type`);
    }
    descriptions.push(description);
  }
  return descriptions;
};

/** Describe the samples of the samples groups of a folder (see describeGithubSamplesGroup). */
export const describeGithubSamples = async ({
  samplesGroupFolder,
  groups,
  ...options
}: DescribeGithubSamplesOptions): Promise<SampleDescription[]> => {
  const descriptions: SampleDescription[] = [];
  for (const group of groups ?? (await getGithubSamplesGroups(samplesGroupFolder))) {
    const { samples } = await getGithubSamplesGroup(samplesGroupFolder, group);
    descriptions.push(...describeGithubSamplesGroup({ ...options, samplesGroupFolder, group, samples }));
  }
  return descriptions;
};

const table = (rows: string[][]): string => {
  const widths = rows[0].map((_cell, column) => Math.max(...rows.map(row => row[column].length)));
  return rows
    .map(row =>
      row
        .map((cell, column) => cell.padEnd(widths[column]))
        .join('  ')
        .trimEnd(),
    )
    .join('\n');
};

/** The folder of the `.yo-rc.json` file of a sample, its app sample. */
const appSampleOf = (sample: SampleDescription): string =>
  sample.files['.yo-rc.json'] ? basename(dirname(sample.files['.yo-rc.json'])) : '';

export const formatSamplesList = (samples: SampleDescription[]): string =>
  table([
    ['workflow', 'sample', 'job', 'app sample', 'entities', 'jdl', 'os', 'node', 'java'],
    ...samples.map(sample => [
      sample.workflow,
      sample.name + (sample.disabled ? ' (disabled)' : ''),
      sample.jobName,
      sample.generator === 'jdl' ? 'jdl' : appSampleOf(sample),
      sample.entitiesSample ?? '',
      (sample.generator === 'app' ? sample.jdlEntity : sample.jdlSamples) ?? '',
      sample.matrix.os,
      sample.matrix.node,
      sample.matrix.java,
    ]),
  ]);

export const formatSample = (sample: SampleDescription): string => {
  const lines = [`${sample.name} (${sample.workflow} workflow, job ${sample.jobName}${sample.disabled ? ', disabled' : ''})`];
  lines.push(`environment: ${sample.matrix.os}, node ${sample.matrix.node}, java ${sample.matrix.java}`);
  if (sample.environment || sample.war) {
    lines.push(`profile: ${sample.environment ?? ''}${sample.war ? ' (war)' : ''}`.trim());
  }
  lines.push(`command: ${sample.defaultCommand}`);
  if (sample.generatorOptions) lines.push(`generator options: ${JSON.stringify(sample.generatorOptions)}`);
  if (sample.config) {
    const configurationFile = sample.files['.yo-rc.json'];
    lines.push('', `configuration${configurationFile ? ` (${configurationFile})` : ''}:`);
    for (const [key, value] of Object.entries(sample.config)) {
      lines.push(`  ${key}: ${Array.isArray(value) ? value.join(', ') : String(value)}`);
    }
  }
  const files = Object.entries(sample.files);
  if (files.length > 0) {
    lines.push('', `files${sample.entitiesSample ? ` (entities ${sample.entitiesSample})` : ''}:`);
    lines.push(...files.map(([destination, source]) => `  ${destination}: ${source}`));
  } else if (sample.entitiesSample) {
    lines.push('', `entities: ${sample.entitiesSample}`);
  }
  const jdls = Object.entries(sample.jdls);
  const jdlFiles = jdls.flatMap(([name, jdl]) => ('file' in jdl ? [`  ${name}: ${jdl.file}`] : []));
  if (jdlFiles.length > 0) lines.push('', 'jdl:', ...jdlFiles);
  for (const [name, jdl] of jdls) {
    if ('content' in jdl) lines.push('', `jdl ${name}:`, ...jdl.content.split('\n').map(line => `  ${line}`));
  }
  return lines.join('\n');
};
