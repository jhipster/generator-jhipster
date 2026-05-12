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

import BaseApplicationGenerator from '../../base-simple-application/index.ts';
import type { Application as CiCdApplication } from '../types.ts';

import type { CiCdProvider } from './providers.ts';

const ciCdTemplates = {
  azure: ['azure-pipelines.yml'],
  circle: ['.circleci/config.yml'],
  github: ['.github/workflows/main.yml'],
  gitlab: ['.gitlab-ci.yml'],
  jenkins: [
    {
      sourceFile: 'jenkins/Jenkinsfile',
      destinationFile: 'Jenkinsfile',
    },
    {
      sourceFile: 'jenkins/jenkins.yml',
      destinationFile: (ctx: CiCdApplication) => `${ctx.dockerServicesDir}jenkins.yml`,
    },
    {
      sourceFile: 'jenkins/idea.gdsl',
      destinationFile: (ctx: CiCdApplication) => `${ctx.srcMainResources}idea.gdsl`,
    },
  ],
  travis: ['.travis.yml'],
} as const satisfies Record<CiCdProvider, readonly any[]>;

export abstract class BaseCiCdGenerator extends BaseApplicationGenerator<CiCdApplication> {
  readonly provider?: CiCdProvider;

  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    await this.dependsOnBootstrap('ci-cd');
    await this.dependsOnJHipster('jhipster:ci-cd:common');
  }

  get writing() {
    return this.asWritingTaskGroup({
      async writeFiles({ application }) {
        if (!this.provider) {
          return;
        }

        const rootTemplatesPath = this.fetchFromInstalledJHipster('ci-cd/templates');
        await this.writeFiles({
          rootTemplatesPath,
          blocks: [{ templates: [...ciCdTemplates[this.provider]] }],
          context: application,
        });
      },
    });
  }

  get [BaseApplicationGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  shouldAskForPrompts() {
    return true;
  }
}
