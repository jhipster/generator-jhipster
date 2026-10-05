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

import BaseGenerator from '../../generators/base-core/index.ts';
import { getGithubOutputFile, setGithubTaskOutput } from '../../lib/ci/index.ts';

import type { eventNameChoices, workflowChoices } from './command.ts';
import { buildMatrix } from './support/build-matrix.ts';
import { allChanges } from './support/git-changes.ts';

export default class extends BaseGenerator {
  workflow!: (typeof workflowChoices)[number] | `daily-${string}`;
  eventName?: (typeof eventNameChoices)[number];
  matrix!: string;

  get [BaseGenerator.WRITING]() {
    return this.asAnyTaskGroup({
      async buildMatrix() {
        // Push events requires a base commit for diff. Diff cannot be checked by @~1 if PR was merged with a rebase.
        const useChanges = this.eventName === 'pull_request';
        const matrix = await buildMatrix({
          workflow: this.workflow,
          changes: useChanges ? undefined : allChanges(),
          samplesFolder: this.templatePath('../samples/'),
          useVersionPlaceholders: this.useVersionPlaceholders,
          warn: message => this.log.warn(message),
        });
        this.matrix = JSON.stringify(matrix, null, 2);
        const githubOutputFile = getGithubOutputFile();
        this.log.info('matrix', this.matrix);
        if (githubOutputFile) {
          setGithubTaskOutput('matrix', this.matrix);
        }
      },
    });
  }
}
