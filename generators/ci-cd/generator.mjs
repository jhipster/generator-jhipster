/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
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
import _ from 'lodash';
import chalk from 'chalk';

import BaseApplicationGenerator from '../base-application/index.mjs';

import prompts from './prompts.mjs';
import statistics from '../statistics.cjs';
import { NODE_VERSION, SERVER_MAIN_RES_DIR, JAVA_VERSION } from '../generator-constants.mjs';
import { GENERATOR_BOOTSTRAP_APPLICATION, GENERATOR_CI_CD } from '../generator-list.mjs';
import { buildToolTypes, clientFrameworkTypes } from '../../jdl/jhipster/index.mjs';

const { MAVEN, GRADLE } = buildToolTypes;
const { REACT } = clientFrameworkTypes;

/**
 * @class
 * @extends {BaseApplicationGenerator<import('../server/types.mjs').SpringBootApplication>}
 */
export default class CiCdGenerator extends BaseApplicationGenerator {
  constructor(args, options, features) {
    super(args, options, features);

    // Automatically configure Travis
    this.option('autoconfigure-travis', {
      type: Boolean,
      defaults: false,
      description: 'Automatically configure Travis',
    });

    // Automatically configure Jenkins
    this.option('autoconfigure-jenkins', {
      type: Boolean,
      defaults: false,
      description: 'Automatically configure Jenkins',
    });

    // Automatically configure Gitlab
    this.option('autoconfigure-gitlab', {
      type: Boolean,
      defaults: false,
      description: 'Automatically configure Gitlab',
    });

    // Automatically configure Azure
    this.option('autoconfigure-azure', {
      type: Boolean,
      defaults: false,
      description: 'Automatically configure Azure',
    });

    // Automatically configure GitHub Actions
    this.option('autoconfigure-github', {
      type: Boolean,
      defaults: false,
      description: 'Automatically configure GitHub Actions',
    });

    // Automatically configure CircleCI
    this.option('autoconfigure-circle', {
      type: Boolean,
      defaults: false,
      description: 'Automatically configure CircleCI',
    });
  }

  async beforeQueue() {
    await this.dependsOnJHipster(GENERATOR_BOOTSTRAP_APPLICATION);
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints(GENERATOR_CI_CD);
    }
  }

  // Public API method used by the getter and also by Blueprints
  get initializing() {
    return {
      sayHello() {
        this.log(chalk.white('🚀 Welcome to the JHipster CI/CD Sub-Generator 🚀'));
      },

      getSharedConfig() {
        this.loadAppConfig();
        this.loadServerConfig();

        this.loadDerivedAppConfig();
        this.loadDerivedServerConfig();
      },

      getConfig() {
        const configuration = this.config;
        this.dasherizedBaseName = _.kebabCase(this.baseName);
        this.herokuAppName = configuration.get('herokuAppName');
        if (this.herokuAppName === undefined) {
          this.herokuAppName = _.kebabCase(this.baseName);
        }
        this.autoconfigureTravis = this.options.autoconfigureTravis;
        this.autoconfigureJenkins = this.options.autoconfigureJenkins;
        this.autoconfigureGitlab = this.options.autoconfigureGitlab;
        this.autoconfigureAzure = this.options.autoconfigureAzure;
        this.autoconfigureGithub = this.options.autoconfigureGithub;
        this.autoconfigureCircleCI = this.options.autoconfigureCircle;
        this.abort = false;
      },

      initConstants() {
        this.NODE_VERSION = NODE_VERSION;
      },

      getConstants() {
        this.SERVER_MAIN_RES_DIR = SERVER_MAIN_RES_DIR;
        this.JAVA_VERSION = JAVA_VERSION;
      },
    };
  }

  get [BaseApplicationGenerator.INITIALIZING]() {
    return this.delegateTasksToBlueprint(() => this.initializing);
  }

  // Public API method used by the getter and also by Blueprints
  get prompting() {
    return {
      askPipeline: prompts.askPipeline,
      askIntegrations: prompts.askIntegrations,
    };
  }

  get [BaseApplicationGenerator.PROMPTING]() {
    return this.delegateTasksToBlueprint(() => this.prompting);
  }

  // Public API method used by the getter and also by Blueprints
  get configuring() {
    return {
      insight() {
        if (this.abort) return;
        statistics.sendSubGenEvent('generator', GENERATOR_CI_CD);
      },
      setTemplateConstants() {
        if (this.abort) return;
        if (this.cicdIntegrations === undefined) {
          this.cicdIntegrations = [];
        }
        this.gitLabIndent = this.sendBuildToGitlab ? '    ' : '';
        this.indent = this.insideDocker ? '    ' : '';
        this.indent += this.gitLabIndent;
        if (this.clientFramework === REACT) {
          this.frontTestCommand = 'test-ci';
        } else {
          this.frontTestCommand = 'test';
        }
      },
    };
  }

  get [BaseApplicationGenerator.CONFIGURING]() {
    return this.delegateTasksToBlueprint(() => this.configuring);
  }

  _loadCiCdConfig(config = this.jhipsterConfigWithDefaults, dest = this) {
    dest.cicdIntegrations = dest.cicdIntegrations || config.cicdIntegrations || [];
    dest.cicdIntegrationsSnyk = dest.cicdIntegrations.includes('snyk');
    dest.cicdIntegrationsSonar = dest.cicdIntegrations.includes('sonar');
    dest.cicdIntegrationsHeroku = dest.cicdIntegrations.includes('heroku');
    dest.cicdIntegrationsDeploy = dest.cicdIntegrations.includes('deploy');
    dest.cicdIntegrationsPublishDocker = dest.cicdIntegrations.includes('publishDocker');
    dest.cicdIntegrationsCypressDashboard = dest.cicdIntegrations.includes('cypressDashboard');
  }

  // Public API method used by the getter and also by Blueprints
  get loading() {
    return {
      loadSharedConfig() {
        this._loadCiCdConfig();
      },
    };
  }

  get [BaseApplicationGenerator.LOADING]() {
    return this.delegateTasksToBlueprint(() => this.loading);
  }

  // Public API method used by the getter and also by Blueprints
  get writing() {
    return this.asWritingTaskGroup({
      async writeFiles({ application }) {
        Object.assign(this, application);
        if (this.pipeline === 'jenkins') {
          await this.writeFiles({
            rootTemplatesPath: 'jenkins',
            blocks: [
              {
                templates: [
                  {
                    sourceFile: 'Jenkinsfile',
                    destinationFile: 'Jenkinsfile',
                  },
                  {
                    sourceFile: 'jenkins.yml',
                    destinationFile: `${application.dockerServicesDir}jenkins.yml`,
                  },
                  {
                    sourceFile: 'idea.gdsl',
                    destinationFile: `${application.srcMainResources}idea.gdsl`,
                  },
                ],
              },
            ],
            context: this,
          });
        }
        if (this.pipeline === 'gitlab') {
          this.writeFile('.gitlab-ci.yml.ejs', '.gitlab-ci.yml');
        }
        if (this.pipeline === 'circle') {
          this.writeFile('circle.yml.ejs', '.circleci/config.yml');
        }
        if (this.pipeline === 'travis') {
          this.writeFile('travis.yml.ejs', '.travis.yml');
        }
        if (this.pipeline === 'azure') {
          this.writeFile('azure-pipelines.yml.ejs', 'azure-pipelines.yml');
        }
        if (this.pipeline === 'github') {
          this.writeFile('github-actions.yml.ejs', '.github/workflows/main.yml');
        }

        if (this.cicdIntegrations.includes('deploy')) {
          if (this.buildTool === MAVEN) {
            this.addMavenDistributionManagement(
              this.artifactorySnapshotsId,
              this.artifactorySnapshotsUrl,
              this.artifactoryReleasesId,
              this.artifactoryReleasesUrl
            );
          } else if (this.buildTool === GRADLE) {
            // TODO: add support here
            // this.addGradleDistributionManagement(this.artifactoryId, this.artifactoryName);
            this.warning('No support for Artifactory yet, when using Gradle.\n');
          }
        }

        if (this.cicdIntegrations.includes('publishDocker')) {
          this.writeFile('docker-registry.yml.ejs', `${application.dockerServicesDir}docker-registry.yml`);
        }
      },
    });
  }

  get [BaseApplicationGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }
}
