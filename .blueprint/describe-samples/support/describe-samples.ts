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
import { existsSync, readFileSync } from 'node:fs';
import { relative } from 'node:path';

import {
  type GitHubMatrix,
  type GitHubMatrixGroup,
  type WorkflowSample,
  convertToGitHubMatrix,
  getGithubSamplesGroup,
} from '../../../lib/ci/index.ts';
import { getPackageRoot } from '../../../lib/index.ts';
import { getWorkflowNames, getWorkflowSamples, isDaily } from '../../generate-sample/support/get-workflow-samples.ts';
import { type ResolvedSample, resolveSample } from '../../generate-sample/support/resolve-sample.ts';
import { workflowChoices } from '../../github-build-matrix/command.ts';
import { devServerMatrix } from '../../github-build-matrix/samples/dev-server.ts';
import { buildWorkflowMatrix } from '../../github-build-matrix/support/workflow-matrix.ts';

const packageRoot = getPackageRoot();
const relativeToRoot = (file: string) => relative(packageRoot, file);

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
];

export type SampleDescription = {
  name: string;
  workflow: string;
  jobName: string;
  disabled?: boolean;
  sonar?: boolean;
  generator: 'jdl' | 'app';
  /** How the sample is generated: workflow samples run `generate-sample <name>`, group samples pass a sample path and args. */
  command: string;
  yoRcFile?: string;
  config?: Record<string, unknown>;
  entitiesSample?: string;
  entityFiles: string[];
  /** `jdl-entity` value of the workflow sample. */
  jdlEntity?: string;
  jdlEntityFiles: string[];
  /** `jdl-samples` value of the workflow sample. */
  jdlSamples?: string;
  jdlSampleFiles: string[];
  generatorOptions?: Record<string, unknown>;
  args?: string;
  environment?: string;
  war?: boolean;
  matrix: { os: string; node: string; java: string };
};

const readConfig = (yoRcFile: string | undefined): Record<string, unknown> | undefined => {
  if (!yoRcFile || !existsSync(yoRcFile)) return undefined;
  const config = JSON.parse(readFileSync(yoRcFile, 'utf8'))['generator-jhipster'] ?? {};
  return Object.fromEntries(CONFIG_KEYS.filter(key => config[key] !== undefined).map(key => [key, config[key]]));
};

const matrixOf = (item: GitHubMatrix | undefined) => ({
  os: item?.os ?? '',
  node: item?.['node-version'] ?? '',
  java: item?.['java-version'] ?? '',
});

const describeResolved = (
  resolved: ResolvedSample,
  workflow: string,
  item: GitHubMatrix | undefined,
  command: string,
): SampleDescription => {
  const { sample } = resolved;
  return {
    name: resolved.name,
    workflow,
    jobName: item?.['job-name'] ?? sample?.['job-name'] ?? resolved.name,
    disabled: sample?.disabled ? true : undefined,
    sonar: sample?.['sonar-analyse'] === 'true' ? true : undefined,
    generator: resolved.generator,
    command,
    yoRcFile: resolved.yoRcFile ? relativeToRoot(resolved.yoRcFile) : undefined,
    config: readConfig(resolved.yoRcFile),
    entitiesSample: resolved.entitiesSample,
    entityFiles: resolved.entityFiles.map(relativeToRoot),
    jdlEntity: sample?.['jdl-entity'],
    jdlEntityFiles: resolved.jdlEntityFiles.map(relativeToRoot),
    jdlSamples: sample?.['jdl-samples'],
    jdlSampleFiles: resolved.jdlSampleFiles.map(relativeToRoot),
    generatorOptions: sample?.generatorOptions,
    args: sample?.['extra-args'],
    environment: resolved.profile,
    war: resolved.war || undefined,
    matrix: matrixOf(item),
  };
};

/** Java version the jhipster-daily-builds workflows pass to `jhipster/actions/setup-runner`. */
const DAILY_BUILDS_JAVA_VERSION = '25';

/** Samples of the json workflows (`workflow-samples/<workflow>.json`), with the matrix values the workflow computes. */
const describeWorkflowSamples = (workflow: string): SampleDescription[] => {
  const samples: WorkflowSample[] = Object.values(getWorkflowSamples([workflow])[workflow]);
  const group = buildWorkflowMatrix(
    isDaily(workflow) ? samples.map(sample => ({ ...sample, 'java-version': DAILY_BUILDS_JAVA_VERSION })) : samples,
  );
  const matrix = convertToGitHubMatrix(group, { randomEnvironment: !isDaily(workflow) });
  return samples.map(sample => {
    const jobName = sample['job-name'] ?? sample.name;
    const item = matrix.include.find(entry => entry.sample === jobName);
    const resolved = resolveSample(sample.name);
    return describeResolved(resolved, workflow, item, `jhipster generate-sample ${sample.name}`);
  });
};

/** Samples of the group workflows (`github-build-matrix/samples/<workflow>.ts`), generated from a sample path and args. */
const describeGroupSamples = async (workflow: string, samplesFolder: string): Promise<SampleDescription[]> => {
  let group: GitHubMatrixGroup;
  if (workflow === 'devserver') {
    group = { ...devServerMatrix.angular, ...devServerMatrix.react, ...devServerMatrix.vue };
  } else {
    group = (await getGithubSamplesGroup(samplesFolder, workflow)).samples;
  }
  const matrix = convertToGitHubMatrix(group);
  return Object.entries(group).map(([name, item]) => {
    const entry = matrix.include.find(candidate => candidate['job-name'] === name);
    const samplePath = item.sample ?? name;
    const resolved = resolveSample(samplePath.replace(/^samples\//, ''));
    const args = item.args ?? '';
    return {
      ...describeResolved(resolved, workflow, entry, `jhipster generate-sample ${samplePath} ${args}`.trim()),
      name,
      jobName: name,
      args: args || undefined,
      // Group samples generate from the `.yo-rc.json` folder and the args; the workflow entity sets do not apply.
      entitiesSample: /--entities-sample (\S+)/.exec(args)?.[1],
      entityFiles: [],
      jdlEntity: undefined,
      jdlEntityFiles: [],
    };
  });
};

/** Workflows defined by a `workflow-samples/<workflow>.json` file. */
const JSON_WORKFLOWS = new Set(getWorkflowNames());

/** Every described workflow: the group workflows of this repository, then the `daily-` workflows of jhipster-daily-builds. */
export const WORKFLOWS = [...workflowChoices.filter(workflow => workflow !== 'generators'), ...getWorkflowNames().filter(isDaily)];

/**
 * Describe the CI samples: what each job generates and the environment it runs on.
 */
export const describeSamples = async ({
  workflow,
  samplesFolder,
}: {
  workflow?: string;
  samplesFolder: string;
}): Promise<SampleDescription[]> => {
  const workflows = workflow ? [workflow] : WORKFLOWS;
  const descriptions: SampleDescription[] = [];
  for (const currentWorkflow of workflows) {
    descriptions.push(
      ...(JSON_WORKFLOWS.has(currentWorkflow) ?
        describeWorkflowSamples(currentWorkflow)
      : await describeGroupSamples(currentWorkflow, samplesFolder)),
    );
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

export const formatSamplesList = (samples: SampleDescription[]): string =>
  table([
    ['workflow', 'sample', 'job', 'app sample', 'entities', 'jdl', 'os', 'node', 'java'],
    ...samples.map(sample => [
      sample.workflow,
      sample.name + (sample.disabled ? ' (disabled)' : ''),
      sample.jobName,
      sample.yoRcFile?.split('/').slice(-2, -1)[0] ?? (sample.generator === 'jdl' ? 'jdl' : ''),
      sample.entitiesSample ?? '',
      sample.jdlEntity ?? sample.jdlSamples ?? '',
      sample.matrix.os,
      sample.matrix.node,
      sample.matrix.java,
    ]),
  ]);

export const formatSample = (sample: SampleDescription): string => {
  const lines = [`${sample.name} (${sample.workflow} workflow, job ${sample.jobName}${sample.disabled ? ', disabled' : ''})`];
  lines.push(`command: ${sample.command}`);
  lines.push(`environment: ${sample.matrix.os}, node ${sample.matrix.node}, java ${sample.matrix.java}`);
  if (sample.environment || sample.war) {
    lines.push(`profile: ${sample.environment ?? ''}${sample.war ? ' (war)' : ''}`.trim());
  }
  if (sample.generatorOptions) lines.push(`generator options: ${JSON.stringify(sample.generatorOptions)}`);
  if (sample.args) lines.push(`args: ${sample.args}`);
  if (sample.yoRcFile) lines.push('', `configuration (${sample.yoRcFile}):`);
  for (const [key, value] of Object.entries(sample.config ?? {})) {
    lines.push(`  ${key}: ${Array.isArray(value) ? value.join(', ') : String(value)}`);
  }
  if (sample.entityFiles.length > 0) {
    lines.push('', `entities (${sample.entitiesSample}):`, ...sample.entityFiles.map(file => `  ${file}`));
  } else if (sample.entitiesSample) {
    lines.push('', `entities: ${sample.entitiesSample}`);
  }
  if (sample.jdlEntityFiles.length > 0) lines.push('', 'jdl entities:', ...sample.jdlEntityFiles.map(file => `  ${file}`));
  if (sample.jdlSampleFiles.length > 0) lines.push('', 'jdl samples:', ...sample.jdlSampleFiles.map(file => `  ${file}`));
  return lines.join('\n');
};
