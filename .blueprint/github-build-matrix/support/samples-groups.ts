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
import { githubSamplesGroupOf } from '../../../lib/ci/github-group.ts';
import type { GitHubMatrixGroup } from '../../../lib/ci/index.ts';
import devserver from '../samples/devserver.ts';
import dockerComposeIntegration from '../samples/docker-compose-integration.ts';
import graalvm from '../samples/graalvm.ts';

/**
 * The samples groups defined by code (`samples/<group>.ts`), imported statically so they are read synchronously, each
 * sample tagged with its group like `getGithubSamplesGroup` does. A spec checks it lists every group of the folder.
 */
export const samplesGroups: Record<string, GitHubMatrixGroup> = Object.fromEntries(
  Object.entries({
    devserver,
    'docker-compose-integration': dockerComposeIntegration,
    graalvm,
  }).map(([group, samples]) => [group, githubSamplesGroupOf(group, samples)]),
);
