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
import { join } from 'node:path';

import type { WorkflowSample, WorkflowSamples } from '../../../lib/ci/index.ts';
import { testIntegrationFolder } from '../../constants.ts';

const workflowSamplesFolder = join(testIntegrationFolder, 'workflow-samples');
export const DAILY_PREFIX = 'daily-';

export const isDaily = (workflow: string): boolean => workflow.startsWith(DAILY_PREFIX);

/**
 * Workflows with a `workflow-samples/<workflow>.json` file: the client workflows of this repository first, then the
 * `daily-` workflows of jhipster-daily-builds.
 */
export const getWorkflowNames = (): string[] => {
  const workflows = readdirSync(workflowSamplesFolder)
    .filter(file => file.endsWith('.json'))
    .map(file => file.slice(0, -'.json'.length))
    .sort();
  return [...workflows.filter(workflow => !isDaily(workflow)), ...workflows.filter(isDaily)];
};

export const getWorkflowSamples = (workflows: string[] = getWorkflowNames()): Record<string, Record<string, WorkflowSample>> =>
  Object.fromEntries(
    workflows.map(workflow => [
      workflow,
      Object.fromEntries(
        (JSON.parse(readFileSync(join(workflowSamplesFolder, `${workflow}.json`)).toString()) as WorkflowSamples).include
          .map(sample =>
            isDaily(workflow) ?
              {
                ...sample,
                name: `${DAILY_PREFIX}${sample.name}`,
                'app-sample': `${DAILY_PREFIX}${sample['app-sample'] ?? sample.name}`,
              }
            : sample,
          )
          .map(sample => [sample.name, sample]),
      ),
    ]),
  );

export default (workflows?: string[]) =>
  Object.fromEntries(Object.values(getWorkflowSamples(workflows)).flatMap(workflowSamples => Object.entries(workflowSamples)));
