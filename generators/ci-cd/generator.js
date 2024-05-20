/**
 * Copyright 2013-2024 the original author or authors from the JHipster project.
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
/* eslint-disable consistent-return */
import chalk from 'chalk';

import BaseApplicationGenerator from '../base-application/index.js';
import { clientFrameworkTypes } from '../../jdl/jhipster/index.js';
import { createPomStorage } from '../maven/support/pom-store.js';
import command from './command.js';
import { loadConfig, loadDerivedConfig } from '../../lib/internal/config-def.js';

const { REACT } = clientFrameworkTypes;

export default class CiCdGenerator extends BaseApplicationGenerator {
  insideDocker;

  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnBootstrapApplication();
    }
  }

  // Public API method used by the getter and also by Blueprints
  get initializing() {
    return this.asInitializingTaskGroup({
      sayHello() {
        this.log.log(chalk.white('🚀 Welcome to the JHipster CI/CD Sub-Generator 🚀'));
      },

      getConfig() {
        this.parseJHipsterCommand(command);
      },
    });
  }

  get [BaseApplicationGenerator.INITIALIZING]() {
    return this.delegateTasksToBlueprint(() => this.initializing);
  }

  // Public API method used by the getter and also by Blueprints
  get prompting() {
    return this.asPromptingTaskGroup({
      async prompting() {
        await this.prompt(this.prepareQuestions(command.configs));
      },
    });
  }

  get [BaseApplicationGenerator.PROMPTING]() {
    return this.delegateTasksToBlueprint(() => this.prompting);
  }

  // Public API method used by the getter and also by Blueprints
  get loading() {
    return {
      loadSharedConfig({ application }) {
        loadConfig.call(this, command.configs, { application });
      },
    };
  }

  get [BaseApplicationGenerator.LOADING]() {
    return this.delegateTasksToBlueprint(() => this.loading);
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      setTemplateConstants({ application }) {
        loadDerivedConfig(command.configs, { application });

        if (application.ciCdIntegrations === undefined) {
          application.ciCdIntegrations = [];
        }
        application.gitLabIndent = application.sendBuildToGitlab ? '    ' : '';
        application.indent = application.insideDocker ? '    ' : '';
        application.indent += application.gitLabIndent;
        if (application.clientFramework === REACT) {
          application.frontTestCommand = 'test-ci';
        } else {
          application.frontTestCommand = 'test';
        }
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING]() {
    return this.delegateTasksToBlueprint(() => this.preparing);
  }

  // Public API method used by the getter and also by Blueprints
  get writing() {
    return this.asWritingTaskGroup({
      async writeFiles({ application }) {
        await this.writeFiles({
          blocks: [
            {
              condition: ctx => ctx.ciCdJenkins,
              templates: [
                {
                  sourceFile: 'jenkins/Jenkinsfile',
                  destinationFile: 'Jenkinsfile',
                },
                {
                  sourceFile: 'jenkins/jenkins.yml',
                  destinationFile: `${application.dockerServicesDir}jenkins.yml`,
                },
                {
                  sourceFile: 'jenkins/idea.gdsl',
                  destinationFile: `${application.srcMainResources}idea.gdsl`,
                },
              ],
            },
            {
              condition: ctx => ctx.ciCdGitlab,
              templates: ['.gitlab-ci.yml'],
            },
            {
              condition: ctx => ctx.ciCdCircle,
              templates: ['.circleci/config.yml'],
            },
            {
              condition: ctx => ctx.ciCdTravis,
              templates: ['.travis.yml'],
            },
            {
              condition: ctx => ctx.ciCdAzure,
              templates: ['azure-pipelines.yml'],
            },
            {
              condition: ctx => ctx.ciCdGithub,
              templates: ['.github/workflows/main.yml'],
            },
          ],
          context: application,
        });

        if (application.ciCdIntegrations.includes('publishDocker')) {
          this.writeFile('docker-registry.yml.ejs', `${application.dockerServicesDir}docker-registry.yml`);
        }
      },
    });
  }

  get [BaseApplicationGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  // Public API method used by the getter and also by Blueprints
  get postWriting() {
    return this.asPostWritingTaskGroup({
      postWriting({ application }) {
        if (application.ciCdIntegrations.includes('deploy')) {
          if (application.buildToolMaven) {
            createPomStorage(this).addDistributionManagement({
              releasesId: application.artifactoryReleasesId,
              releasesUrl: application.artifactoryReleasesUrl,
              snapshotsId: application.artifactorySnapshotsId,
              snapshotsUrl: application.artifactorySnapshotsUrl,
            });
          } else if (application.buildToolGradle) {
            // TODO: add support here
            // this.addGradleDistributionManagement(this.artifactoryId, this.artifactoryName);
            this.log.warn('No support for Artifactory yet, when using Gradle.\n');
          }
        }
      },
    });
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }
}
