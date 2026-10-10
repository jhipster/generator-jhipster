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
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import {
  type GitHubMatrixGroup,
  type GitHubMatrixOutput,
  type WorkflowSamples,
  convertToGitHubMatrix,
  getGithubSamplesGroup,
} from '../../../lib/ci/index.ts';
import { githubSamplesGroupFolder, testIntegrationFolder } from '../../constants.ts';
import { isDaily } from '../../generate-sample/support/get-workflow-samples.ts';
import { devServerMatrix } from '../samples/devserver.ts';

import { type Changes, type GitChangesOptions, getGitChanges } from './git-changes.ts';
import { BUILD_JHIPSTER_BOM, JHIPSTER_BOM_BRANCH, JHIPSTER_BOM_CICD_VERSION } from './integration-test-constants.ts';
import { buildDailyWorkflowMatrix, buildWorkflowMatrix } from './workflow-matrix.ts';

export type BuildMatrixOptions = Pick<GitChangesOptions, 'revisions' | 'baseDir'> & {
  /** The workflow whose matrix is built: a group workflow, a json workflow or a `daily-` workflow. */
  workflow: string;
  /** The changes, see `detectChanges` and `allChanges`; by default the git changes of `revisions` (`@~1`). */
  changes?: Changes;
  /** The `github-build-matrix/samples` folder of the group workflows. */
  samplesFolder?: string;
  /** Replace the versions by placeholders, for snapshots. */
  useVersionPlaceholders?: boolean;
  warn?: (message: string) => void;
};

/**
 * The samples a workflow runs for some changes: the rules of the ci.
 *
 * The `generators` workflow returns its jobs with their `disabled` flag instead of a matrix.
 */
export const buildMatrix = async ({
  workflow,
  revisions,
  baseDir,
  changes,
  samplesFolder = githubSamplesGroupFolder,
  useVersionPlaceholders,
  warn = () => {},
}: BuildMatrixOptions): Promise<GitHubMatrixOutput | GitHubMatrixGroup> => {
  changes ??= await getGitChanges({ revisions, baseDir });
  const { base, common, devBlueprint, client, e2e, generateBlueprint, graalvm, java, workspaces, springBootDefaults } = changes;
  const hasWorkflowChanges = (changes as Record<string, boolean>)[`${workflow}Workflow`];

  /** The samples of the group of the workflow, without their jdl: the workflow generates each one with generate-sample. */
  const getGroupMatrix = async (): Promise<GitHubMatrixGroup> => {
    const { samples, warnings } = await getGithubSamplesGroup(samplesFolder, workflow);
    if (warnings.length) {
      warn(warnings.join('\n'));
    }
    return Object.fromEntries(Object.entries(samples).map(([name, { jdl: _jdl, ...sample }]) => [name, sample]));
  };

  let matrix: GitHubMatrixGroup = {};
  let convertToGitHubMatrixInclude = true;
  let randomEnvironment = false;
  switch (workflow) {
    case 'docker-compose-integration': {
      matrix = await getGroupMatrix();
      break;
    }
    case 'generators': {
      convertToGitHubMatrixInclude = false;
      matrix = {
        'database-changelog': {
          disabled: !springBootDefaults,
        },
        'generate-blueprint': {
          disabled: !generateBlueprint && !devBlueprint && !base,
        },
        graalvm: {
          disabled: !graalvm && !changes.graalvmWorkflow,
        },
      };
      break;
    }
    case 'graalvm': {
      if (hasWorkflowChanges || java || graalvm) {
        matrix = await getGroupMatrix();
      }
      break;
    }
    case 'devserver': {
      if (devBlueprint || hasWorkflowChanges || client || e2e) {
        matrix = { ...devServerMatrix.angular, ...devServerMatrix.react, ...devServerMatrix.vue };
      } else {
        for (const client of ['angular', 'react', 'vue']) {
          if ((changes as Record<string, boolean>)[client]) {
            Object.assign(matrix, (devServerMatrix as Record<string, GitHubMatrixGroup>)[client]);
          }
        }
      }
      break;
    }
    case 'angular':
    case 'react':
    case 'vue': {
      const hasClientFrameworkChanges = changes[workflow];
      const hasSonarPrChanges = changes.sonarPr && workflow === 'angular';
      const enableAllTests = base || common || hasWorkflowChanges || devBlueprint;
      const enableBackendTests = enableAllTests || java;
      const enableFrontendTests = enableAllTests || client || hasClientFrameworkChanges;
      const enableE2eTests = enableBackendTests || enableFrontendTests || e2e || workspaces;
      const enableAnyTest = enableE2eTests;

      randomEnvironment = true;
      if (enableAnyTest || hasSonarPrChanges) {
        const content = await readFile(join(testIntegrationFolder, `workflow-samples/${workflow}.json`));
        const parsed: WorkflowSamples = JSON.parse(content.toString());
        matrix = buildWorkflowMatrix(parsed.include, {
          enableBackendTests,
          enableFrontendTests,
          sonarOnly: !enableAnyTest,
          skipSonarCompare: changes.sonarPr,
        });
      }
      break;
    }
    default: {
      if (isDaily(workflow)) {
        matrix = buildDailyWorkflowMatrix(workflow);
      }
      break;
    }
  }

  // New jobs: the ones of a group are the objects of its module, shared by every reader of the group.
  matrix = Object.fromEntries(
    Object.entries(matrix).map(([name, job]) => [
      name,
      {
        ...job,
        'build-jhipster-bom': BUILD_JHIPSTER_BOM,
        'jhipster-bom-branch': BUILD_JHIPSTER_BOM ? JHIPSTER_BOM_BRANCH : undefined,
        'jhipster-bom-cicd-version': BUILD_JHIPSTER_BOM ? JHIPSTER_BOM_CICD_VERSION : undefined,
      },
    ]),
  );

  return convertToGitHubMatrixInclude ? convertToGitHubMatrix(matrix, { randomEnvironment, useVersionPlaceholders }) : matrix;
};
