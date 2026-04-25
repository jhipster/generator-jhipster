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

import type { Config as BaseApplicationConfig } from '../../base-application/types.d.ts';
import BaseApplicationGenerator from '../../base-simple-application/index.ts';
import { createPomStorage } from '../../java-simple-application/generators/maven/support/pom-store.ts';
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

export const applyCiCdDeployConfiguration = (generator: BaseApplicationGenerator<CiCdApplication>, application: CiCdApplication) => {
  if (!application.ciCdIntegrations?.includes('deploy')) {
    return;
  }

  if (application.buildTool === 'maven') {
    createPomStorage(generator, { sortFile: false }).addDistributionManagement({
      releasesId: application.artifactoryReleasesId!,
      releasesUrl: application.artifactoryReleasesUrl!,
      snapshotsId: application.artifactorySnapshotsId!,
      snapshotsUrl: application.artifactorySnapshotsUrl!,
    });
  } else if (application.buildTool === 'gradle') {
    generator.log.warn('No support for Artifactory yet, when using Gradle.\n');
  }
};

export abstract class BaseCiCdGenerator extends BaseApplicationGenerator<CiCdApplication> {
  readonly provider?: CiCdProvider;

  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    await this.dependsOnBootstrap('ci-cd');

    if (!this.delegateToBlueprint) {
      if (this.provider) {
        await this.dependsOnBootstrap('app');
      } else if (this.options.commandName === 'ci-cd') {
        const { backendType = 'Java' } = this.jhipsterConfig as BaseApplicationConfig;
        if (['Java', 'SpringBoot'].includes(backendType)) {
          await this.dependsOnBootstrap('java');
        }
      } else {
        await this.dependsOnBootstrap('base-application');
      }
    }
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      preparing({ applicationDefaults }) {
        applicationDefaults({
          gitLabIndent: ({ sendBuildToGitlab }) => (sendBuildToGitlab ? '    ' : ''),
          indent: ({ insideDocker, gitLabIndent }) => {
            let indent = insideDocker ? '    ' : '';
            indent += gitLabIndent;
            return indent;
          },
          cypressTests: ({ testFrameworks }) => testFrameworks?.includes('cypress') ?? false,
        });
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING]() {
    return this.delegateTasksToBlueprint(() => this.preparing);
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

        if (application.ciCdIntegrations?.includes('publishDocker')) {
          await this.writeFiles({
            rootTemplatesPath,
            templates: [
              {
                sourceFile: 'docker-registry.yml.ejs',
                destinationFile: `${application.dockerServicesDir}docker-registry.yml`,
              },
            ],
            context: application,
          });
        }
      },
    });
  }

  get [BaseApplicationGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  get postWriting() {
    return this.asPostWritingTaskGroup({
      postWriting({ application }) {
        if (!this.provider || this.options.commandName === 'ci-cd') {
          return;
        }
        applyCiCdDeployConfiguration(this, application);
      },
    });
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }

  shouldAskForPrompts() {
    return true;
  }
}
