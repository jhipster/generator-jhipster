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
import { relative } from 'node:path';

import {
  type BaseSampleDescription,
  type GitHubMatrix,
  type SampleDescription,
  type WorkflowSample,
  convertToGitHubMatrix,
  describeGithubSamples,
  readSampleConfig,
  sampleMatrixOf,
} from '../../../lib/ci/index.ts';
import { getPackageRoot } from '../../../lib/index.ts';
import { getWorkflowNames, getWorkflowSamples, isDaily } from '../../generate-sample/support/get-workflow-samples.ts';
import { type ResolvedSample, resolveSample } from '../../generate-sample/support/resolve-sample.ts';
import { workflowChoices } from '../../github-build-matrix/command.ts';
import { buildDailyWorkflowMatrix, buildWorkflowMatrix } from '../../github-build-matrix/support/workflow-matrix.ts';

export { type SampleDescription, formatSample, formatSamplesList } from '../../../lib/ci/index.ts';

const packageRoot = getPackageRoot();
const relativeToRoot = (file: string) => relative(packageRoot, file);

const describeResolved = (
  resolved: ResolvedSample,
  workflow: string,
  item: GitHubMatrix | undefined,
  command: string,
): SampleDescription => {
  const { sample } = resolved;
  const base: BaseSampleDescription = {
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
  };
  if (resolved.generator === 'jdl') {
    return {
      ...base,
      generator: 'jdl',
      jdlSamples: sample?.['jdl-samples'],
      jdlSampleFiles: resolved.jdlSampleFiles.map(relativeToRoot),
    };
  }
  return {
    ...base,
    generator: 'app',
    yoRcFile: resolved.yoRcFile ? relativeToRoot(resolved.yoRcFile) : undefined,
    config: readSampleConfig(resolved.yoRcFile),
    entitiesSample: resolved.entitiesSample,
    entityFiles: resolved.entityFiles.map(relativeToRoot),
    jdlEntity: sample?.['jdl-entity'],
    jdlEntityFiles: resolved.jdlEntityFiles.map(relativeToRoot),
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
const describeGroupSamples = (workflow: string, samplesFolder: string): Promise<SampleDescription[]> =>
  describeGithubSamples({
    samplesGroupFolder: samplesFolder,
    groups: [workflow],
    root: packageRoot,
    describeSample: ({ name, item, matrix }) => {
      if (item.jdl) return undefined;
      const samplePath = item.sample ?? name;
      const resolved = resolveSample(samplePath.replace(/^samples\//, ''));
      const args = item.args ?? '';
      const description = describeResolved(resolved, workflow, matrix, `jhipster generate-sample ${samplePath} ${args}`.trim());
      if (description.generator === 'jdl') return { ...description, name, jobName: name, args: args || undefined };
      return {
        ...description,
        name,
        jobName: name,
        args: args || undefined,
        // Group samples generate from the `.yo-rc.json` folder and the args; the workflow entity sets do not apply.
        entitiesSample: /--entities-sample (\S+)/.exec(args)?.[1],
        entityFiles: [],
        jdlEntity: undefined,
        jdlEntityFiles: [],
      };
    },
  });

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
