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
import BaseSimpleApplicationGenerator from '../../../base-simple-application/index.ts';
import { createPomStorage } from '../../../java-simple-application/generators/maven/support/pom-store.ts';
import type { Application as CiCdApplication } from '../../types.ts';

export default class CommonGenerator extends BaseSimpleApplicationGenerator<CiCdApplication> {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnBootstrap('ci-cd');
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

  get [BaseSimpleApplicationGenerator.PREPARING]() {
    return this.delegateTasksToBlueprint(() => this.preparing);
  }

  get writing() {
    return this.asWritingTaskGroup({
      async writeFiles({ application }) {
        if (application.ciCdIntegrations?.includes('publishDocker')) {
          await this.writeFiles({
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

  get [BaseSimpleApplicationGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  get postWriting() {
    return this.asPostWritingTaskGroup({
      postWriting({ application }) {
        if (!application.ciCdIntegrations?.includes('deploy')) {
          return;
        }

        if (application.buildTool === 'maven') {
          createPomStorage(this, { sortFile: false }).addDistributionManagement({
            releasesId: application.artifactoryReleasesId!,
            releasesUrl: application.artifactoryReleasesUrl!,
            snapshotsId: application.artifactorySnapshotsId!,
            snapshotsUrl: application.artifactorySnapshotsUrl!,
          });
        } else if (application.buildTool === 'gradle') {
          this.log.warn('No support for Artifactory yet, when using Gradle.\n');
        }
      },
    });
  }

  get [BaseSimpleApplicationGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }
}
