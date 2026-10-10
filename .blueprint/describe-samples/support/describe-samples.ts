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
import { basename, relative } from 'node:path';

import { copiedFilesOf, describeGithubSamplesGroup, sampleFilesOf } from '../../../lib/ci/describe-samples.ts';
import {
  type GitHubMatrix,
  type SampleDescription,
  type WorkflowSample,
  convertToGitHubMatrix,
  readSampleConfig,
  sampleMatrixOf,
} from '../../../lib/ci/index.ts';
import { getPackageRoot } from '../../../lib/index.ts';
import { githubSamplesGroupFolder } from '../../constants.ts';
import { getWorkflowNames, getWorkflowSamples, isDaily } from '../../generate-sample/support/get-workflow-samples.ts';
import { type ResolvedSample, groupWorkflowSample, resolveSample } from '../../generate-sample/support/resolve-sample.ts';
import { workflowChoices } from '../../github-build-matrix/command.ts';
import { samplesGroups } from '../../github-build-matrix/support/samples-groups.ts';
import { buildDailyWorkflowMatrix, buildWorkflowMatrix } from '../../github-build-matrix/support/workflow-matrix.ts';

export { type SampleDescription, formatSample, formatSamplesList } from '../../../lib/ci/index.ts';
export type { SampleJDL } from '../../../lib/ci/describe-samples.ts';

const packageRoot = getPackageRoot();
const relativeToRoot = (file: string) => relative(packageRoot, file);

/** The files generate-sample copies to the project for a resolved sample, by destination. */
const copiedFilesOfResolved = (resolved: ResolvedSample): [string, string][] => {
  if (resolved.generator === 'jdl') {
    return resolved.jdlSampleFiles.flatMap(file => copiedFilesOf(packageRoot, relativeToRoot(file)));
  }
  return [
    ...(resolved.yoRcFile ? [['.yo-rc.json', relativeToRoot(resolved.yoRcFile)] as [string, string]] : []),
    ...resolved.entityFiles.map(file => [`.jhipster/${basename(file)}`, relativeToRoot(file)] as [string, string]),
    ...resolved.jdlEntityFiles.flatMap(file => copiedFilesOf(packageRoot, relativeToRoot(file))),
  ];
};

const describeResolved = (resolved: ResolvedSample, workflow: string, item: GitHubMatrix | undefined): SampleDescription => {
  const { sample } = resolved;
  return {
    name: resolved.name,
    workflow,
    jobName: item?.['job-name'] ?? sample?.['job-name'] ?? resolved.name,
    disabled: sample?.disabled ? true : undefined,
    sonar: sample?.['sonar-analyse'] === 'true' ? true : undefined,
    generatorOptions: sample?.generatorOptions,
    environment: resolved.profile,
    war: resolved.war || undefined,
    matrix: sampleMatrixOf(item),
    generator: resolved.generator,
    ...sampleFilesOf(copiedFilesOfResolved(resolved)),
    ...(resolved.generator === 'jdl' ?
      { jdlSamples: sample?.['jdl-samples'] }
    : {
        config: readSampleConfig(resolved.yoRcFile),
        entitiesSample: resolved.entitiesSample,
        jdlEntity: sample?.['jdl-entity'],
      }),
  };
};

/** Samples of the json workflows (`workflow-samples/<workflow>.json`), with the matrix values the workflow computes. */
const describeWorkflowSamples = (workflow: string): SampleDescription[] => {
  const samples: WorkflowSample[] = Object.values(getWorkflowSamples([workflow])[workflow]);
  const group = isDaily(workflow) ? buildDailyWorkflowMatrix(workflow) : buildWorkflowMatrix(samples);
  const matrix = convertToGitHubMatrix(group, { randomEnvironment: !isDaily(workflow) });
  return samples.map(sample => {
    const jobName = sample['job-name'] ?? sample.name;
    const item = matrix.include.find(entry => entry.sample === jobName);
    const resolved = resolveSample(sample.name);
    return describeResolved(resolved, workflow, item);
  });
};

/** Samples of the group workflows (`github-build-matrix/samples/<workflow>.ts`). */
const describeGroupSamples = (workflow: string): SampleDescription[] =>
  describeGithubSamplesGroup({
    samplesGroupFolder: githubSamplesGroupFolder,
    group: workflow,
    samples: samplesGroups[workflow] ?? {},
    root: packageRoot,
    describeSample: ({ name, item, matrix }) => {
      if (item.jdl) return undefined;
      // A sample generated from a `.yo-rc.json` folder, by its name only, like generate-sample resolves it.
      const resolved = resolveSample(name, { sample: groupWorkflowSample(name, { group: workflow, sample: item }) });
      return { ...describeResolved(resolved, workflow, matrix), name, jobName: name };
    },
  });

/** Workflows defined by a `workflow-samples/<workflow>.json` file. */
const JSON_WORKFLOWS = new Set(getWorkflowNames());

/** Every described workflow: the group workflows of this repository, then the `daily-` workflows of jhipster-daily-builds. */
export const WORKFLOWS = [...workflowChoices.filter(workflow => workflow !== 'generators'), ...getWorkflowNames().filter(isDaily)];

/**
 * Describe the CI samples: what each job generates and the environment it runs on.
 */
export const describeSamples = ({ workflow }: { workflow?: string } = {}): SampleDescription[] => {
  const workflows = workflow ? [workflow] : WORKFLOWS;
  const descriptions: SampleDescription[] = [];
  for (const currentWorkflow of workflows) {
    descriptions.push(
      ...(JSON_WORKFLOWS.has(currentWorkflow) ? describeWorkflowSamples(currentWorkflow) : describeGroupSamples(currentWorkflow)),
    );
  }
  return descriptions;
};

/** A samples group, a workflow, with the names of its samples; an object, to grow with more data. */
export type SampleGroupSummary = {
  samples: string[];
};

/** A sample, generated by its name only (`jhipster generate-sample <name>`): the files and the jdl generate-sample copies to the project. */
export type SampleSummary = Pick<SampleDescription, 'workflow' | 'jobName' | 'disabled' | 'files' | 'jdls'>;

/** The samples of a samples group by name; an object, to grow with more data. */
export type SampleGroupDescription = {
  samples: Record<string, SampleSummary>;
};

const summaryOf = ({ workflow, jobName, disabled, files, jdls }: SampleDescription): SampleSummary => ({
  workflow,
  jobName,
  disabled,
  files,
  jdls,
});

/** The samples of a samples group, a workflow, by name. */
export const describeSampleGroup = (group: string): SampleGroupDescription => {
  if (!WORKFLOWS.includes(group)) {
    throw new Error(`Samples group ${group} not found, expected one of ${WORKFLOWS.join(', ')}`);
  }
  const samples = describeSamples({ workflow: group });
  return { samples: Object.fromEntries(samples.map(sample => [sample.name, summaryOf(sample)])) };
};

/** The samples groups, the workflows, by name, with the names of their samples. */
export const describeSampleGroups = (): Record<string, SampleGroupSummary> => {
  const groups: Record<string, SampleGroupSummary> = {};
  for (const name of WORKFLOWS) {
    groups[name] = { samples: Object.keys(describeSampleGroup(name).samples) };
  }
  return groups;
};

/** A sample, by its name or its job name, the names being unique across the samples groups. */
export const describeSample = (name: string): SampleSummary => {
  const samples = describeSamples();
  const sample = samples.find(description => description.name === name || description.jobName === name);
  if (!sample) {
    // The names, so the caller, an AI agent too, can correct the name by itself.
    throw new Error(`Sample ${name} not found, expected one of ${samples.map(description => description.name).join(', ')}`);
  }
  return summaryOf(sample);
};
