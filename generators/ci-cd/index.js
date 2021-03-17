/**
 * Copyright 2013-2021 the original author or authors from the JHipster project.
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
const { defaultConfig } = require('../generator-defaults');
const prompts = require('./prompts');
const BaseBlueprintGenerator = require('../generator-base-blueprint');
const statistics = require('../statistics');
const packagejs = require('../../package.json');
const constants = require('../generator-constants');
const { OptionNames } = require('../../jdl/jhipster/application-options');
const { MAVEN, GRADLE } = require('../../jdl/jhipster/build-tool-types');

const {
  BASE_NAME,
  APPLICATION_TYPE,
  DATABASE_TYPE,
  PROD_DATABASE_TYPE,
  SKIP_CLIENT,
  SKIP_SERVER,
  CLIENT_PACKAGE_MANAGER,
  BUILD_TOOL,
  REACTIVE,
  CLIENT_FRAMEWORK,
  TEST_FRAMEWORKS,
  CACHE_PROVIDER,
} = OptionNames;

const REACT = constants.SUPPORTED_CLIENT_FRAMEWORKS.REACT;

let useBlueprints;

module.exports = class extends BaseBlueprintGenerator {
  constructor(args, opts) {
    super(args, opts);

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

    useBlueprints = !this.fromBlueprint && this.instantiateBlueprints('ci-cd');
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
      getConfig() {
        this.jhipsterVersion = packagejs.version;
        const configuration = this.config;
        this.baseName = configuration.get(BASE_NAME);
        this.dasherizedBaseName = _.kebabCase(this.baseName);
        this.applicationType = configuration.get(APPLICATION_TYPE);
        this.databaseType = configuration.get(DATABASE_TYPE);
        this.prodDatabaseType = configuration.get(PROD_DATABASE_TYPE);
        this.skipClient = configuration.get(SKIP_CLIENT);
        this.skipServer = configuration.get(SKIP_SERVER);
        this.clientPackageManager = configuration.get(CLIENT_PACKAGE_MANAGER);
        this.buildTool = configuration.get(BUILD_TOOL);
        this.reactive = configuration.get(REACTIVE);
        this.herokuAppName = configuration.get('herokuAppName');
        if (this.herokuAppName === undefined) {
          this.herokuAppName = _.kebabCase(this.baseName);
        }
        this.clientFramework = configuration.get(CLIENT_FRAMEWORK);
        this.testFrameworks = configuration.get(TEST_FRAMEWORKS);
        this.cacheProvider = configuration.get(CACHE_PROVIDER);
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
      },
    };
  }

  get initializing() {
    if (useBlueprints) return;
    return this._initializing();
  }

  // Public API method used by the getter and also by Blueprints
  _prompting() {
    return {
      askPipeline: prompts.askPipeline,
      askIntegrations: prompts.askIntegrations,
    };
  }

  get prompting() {
    if (useBlueprints) return;
    return this._prompting();
  }

  // Public API method used by the getter and also by Blueprints
  _configuring() {
    return {
      insight() {
        if (this.abort) return;
        statistics.sendSubGenEvent('generator', 'ci-cd');
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

  get configuring() {
    if (useBlueprints) return;
    return this._configuring();
  }

  _loadPlatformConfig(config = _.defaults({}, this.jhipsterConfig, defaultConfig), dest = this) {
    super.loadPlatformConfig(config, dest);
    dest.cicdIntegrationsSnyk = config.cicdIntegrations || [];
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
        this.loadClientConfig();
        this.loadServerConfig();
        this.loadTranslationConfig();
        this._loadPlatformConfig();
      },
    };
  }

  get loading() {
    if (useBlueprints) return;
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
          this.template('github-actions.yml.ejs', '.github/workflows/github-actions.yml');
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

  get writing() {
    if (useBlueprints) return;
    return this._writing();
  }
};
