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

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { WorkflowSample, WorkflowSamples } from '../../../lib/ci/index.ts';
import { testIntegrationFolder } from '../../constants.ts';

const WORKFLOW_NAMES = ['angular', 'react', 'vue', 'daily-ms-oauth2', 'daily-neo4j'];
export const DAILY_PREFIX = 'daily-';

export const isDaily = (workflow: string): boolean => workflow.startsWith(DAILY_PREFIX);

export const getWorkflowSamples = (workflows: string[] = WORKFLOW_NAMES): Record<string, Record<string, WorkflowSample>> =>
  Object.fromEntries(
    workflows.map(workflow => [
      workflow,
      Object.fromEntries(
        (JSON.parse(readFileSync(join(testIntegrationFolder, `workflow-samples/${workflow}.json`)).toString()) as WorkflowSamples).include
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
