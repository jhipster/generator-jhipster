/**
 * Copyright 2013-2022 the original author or authors from the JHipster project.
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
const _ = require('lodash');
const chalk = require('chalk');

const BaseBlueprintGenerator = require('../generator-base-blueprint');
const { INITIALIZING_PRIORITY, PROMPTING_PRIORITY, CONFIGURING_PRIORITY, LOADING_PRIORITY, WRITING_PRIORITY } =
  require('../../lib/constants/priorities.cjs').compat;
const { defaultConfig } = require('../generator-defaults');
const prompts = require('./prompts');
const statistics = require('../statistics');
const constants = require('../generator-constants');
const { MAVEN, GRADLE } = require('../../jdl/jhipster/build-tool-types');
const { GENERATOR_CI_CD } = require('../generator-list');

const REACT = constants.SUPPORTED_CLIENT_FRAMEWORKS.REACT;

module.exports = class extends BaseBlueprintGenerator {
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

  async _postConstruct() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints(GENERATOR_CI_CD);
    }
  }

  // Public API method used by the getter and also by Blueprints
  _initializing() {
    return {
      validateFromCli() {
        this.checkInvocationFromCLI();
      },

      sayHello() {
        this.log(chalk.white('🚀 Welcome to the JHipster CI/CD Sub-Generator 🚀'));
      },

      getSharedConfig() {
        this.loadAppConfig();
        this.loadClientConfig();
        this.loadServerConfig();
        this.loadPlatformConfig();
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
        this.NODE_VERSION = constants.NODE_VERSION;
        this.NPM_VERSION = constants.NPM_VERSION;
      },

      getConstants() {
        this.DOCKER_DIR = constants.DOCKER_DIR;
        this.SERVER_MAIN_RES_DIR = constants.SERVER_MAIN_RES_DIR;
        this.DOCKER_JENKINS = constants.DOCKER_JENKINS;
        this.ANGULAR = constants.SUPPORTED_CLIENT_FRAMEWORKS.ANGULAR;
        this.JAVA_VERSION = constants.JAVA_VERSION;
      },
    };
  }

  get [INITIALIZING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._initializing();
  }

  // Public API method used by the getter and also by Blueprints
  _prompting() {
    return {
      askPipeline: prompts.askPipeline,
      askIntegrations: prompts.askIntegrations,
    };
  }

  get [PROMPTING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._prompting();
  }

  // Public API method used by the getter and also by Blueprints
  _configuring() {
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

  get [CONFIGURING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._configuring();
  }

  _loadCiCdConfig(config = _.defaults({}, this.jhipsterConfig, defaultConfig), dest = this) {
    dest.cicdIntegrations = dest.cicdIntegrations || config.cicdIntegrations || [];
    dest.cicdIntegrationsSnyk = dest.cicdIntegrations.includes('snyk');
    dest.cicdIntegrationsSonar = dest.cicdIntegrations.includes('sonar');
    dest.cicdIntegrationsHeroku = dest.cicdIntegrations.includes('heroku');
    dest.cicdIntegrationsDeploy = dest.cicdIntegrations.includes('deploy');
    dest.cicdIntegrationsPublishDocker = dest.cicdIntegrations.includes('publishDocker');
    dest.cicdIntegrationsCypressDashboard = dest.cicdIntegrations.includes('cypressDashboard');
  }

  // Public API method used by the getter and also by Blueprints
  _loading() {
    return {
      loadSharedConfig() {
        this.loadAppConfig();
        this.loadDerivedAppConfig();
        this.loadClientConfig();
        this.loadDerivedClientConfig();
        this.loadServerConfig();
        this.loadTranslationConfig();
        this._loadCiCdConfig();
        this.loadPlatformConfig();
      },
    };
  }

  get [LOADING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._loading();
  }

  // Public API method used by the getter and also by Blueprints
  _writing() {
    return {
      writeFiles() {
        if (this.pipeline === 'jenkins') {
          this.template('jenkins/Jenkinsfile.ejs', 'Jenkinsfile');
          this.template('jenkins/jenkins.yml.ejs', `${this.DOCKER_DIR}jenkins.yml`);
          this.template('jenkins/idea.gdsl', `${this.SERVER_MAIN_RES_DIR}idea.gdsl`);
        }
        if (this.pipeline === 'gitlab') {
          this.template('.gitlab-ci.yml.ejs', '.gitlab-ci.yml');
        }
        if (this.pipeline === 'circle') {
          this.template('circle.yml.ejs', '.circleci/config.yml');
        }
        if (this.pipeline === 'travis') {
          this.template('travis.yml.ejs', '.travis.yml');
        }
        if (this.pipeline === 'azure') {
          this.template('azure-pipelines.yml.ejs', 'azure-pipelines.yml');
        }
        if (this.pipeline === 'github') {
          this.template('github-actions.yml.ejs', '.github/workflows/main.yml');
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
          this.template('docker-registry.yml.ejs', `${this.DOCKER_DIR}docker-registry.yml`);
        }
      },
    };
  }

  get [WRITING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._writing();
  }
};
