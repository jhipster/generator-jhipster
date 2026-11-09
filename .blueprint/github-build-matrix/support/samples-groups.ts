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
import { getGithubSamplesGroupSync, getGithubSamplesGroupsSync } from '../../../lib/ci/github-group.ts';
import type { GitHubMatrixGroup } from '../../../lib/ci/index.ts';
import { githubSamplesGroupFolder } from '../../constants.ts';

/**
 * The samples groups of the `samples` folder, read synchronously (this module is loaded with require, so it cannot await
 * the import of each group), each sample tagged with its group: a new group is a new file of that folder, listed nowhere
 * else.
 */
export const samplesGroups: Record<string, GitHubMatrixGroup> = Object.fromEntries(
  getGithubSamplesGroupsSync(githubSamplesGroupFolder).map(group => [
    group,
    getGithubSamplesGroupSync(githubSamplesGroupFolder, group).samples,
  ]),
);
