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
    command,
    generatorOptions: sample?.generatorOptions,
    args: sample?.['extra-args'],
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
    return describeResolved(resolved, workflow, item, `jhipster generate-sample ${sample.name}`);
  });
};

/** Samples of the group workflows (`github-build-matrix/samples/<workflow>.ts`), a sample folder given with its args. */
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
      return { ...describeResolved(resolved, workflow, matrix, `jhipster generate-sample ${name}`), name, jobName: name };
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
