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
import type { GitHubMatrixGroup, GitHubMatrixGroupItem, WorkflowSample } from '../../../lib/ci/index.ts';

export type WorkflowMatrixOptions = {
  /** Backend tests are skipped when false, unless the sample runs sonar. */
  enableBackendTests?: boolean;
  /** Frontend tests are skipped when false, unless the sample runs sonar. */
  enableFrontendTests?: boolean;
  /** Only the sonar samples are kept. */
  sonarOnly?: boolean;
  /** Skip the generated code comparison of the sonar samples. */
  skipSonarCompare?: boolean;
};

/**
 * Convert the samples of a client workflow (`workflow-samples/<workflow>.json`) to the GitHub matrix group the
 * workflow runs, the mapping shared by the build matrix and the samples description.
 */
export const buildWorkflowMatrix = (
  samples: WorkflowSample[],
  { enableBackendTests = true, enableFrontendTests = true, sonarOnly = false, skipSonarCompare = false }: WorkflowMatrixOptions = {},
): GitHubMatrixGroup =>
  Object.fromEntries(
    samples
      .filter(sample => !sonarOnly || sample['sonar-analyse'])
      .map((sample): [string, GitHubMatrixGroupItem] => {
        const { 'job-name': jobName = sample.name, 'sonar-analyse': sonarAnalyse, generatorOptions } = sample;
        const enableSonar = sonarAnalyse === 'true';
        const workspaces = generatorOptions?.workspaces ? 'true' : 'false';
        if (enableSonar && workspaces === 'true') {
          throw new Error('Sonar is not supported with workspaces');
        }
        return [
          jobName,
          {
            'skip-compare': `${skipSonarCompare && enableSonar}`,
            // Force tests if sonar is enabled
            'skip-backend-tests': `${!(enableBackendTests || enableSonar)}`,
            // Force tests if sonar is enabled
            'skip-frontend-tests': `${!(enableFrontendTests || enableSonar)}`,
            'gradle-cache': generatorOptions?.workspaces || jobName.includes('gradle') ? true : undefined,
            ...sample,
            sample: sample.name ?? jobName,
            workspaces,
            disabled: Boolean(sample.disabled),
          },
        ];
      }),
  );
