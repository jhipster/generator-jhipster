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
import fs from 'fs';
import { exec } from 'child_process';
import chalk from 'chalk';
import runAsync from 'run-async';

import BaseGenerator from '../base/index.mjs';

import statistics from '../statistics.mjs';

import { JAVA_VERSION, CLIENT_MAIN_SRC_DIR, SERVER_MAIN_RES_DIR } from '../generator-constants.mjs';

import { cacheTypes, buildToolTypes } from '../../jdl/jhipster/index.mjs';
import { GENERATOR_AZURE_SPRING_CLOUD } from '../generator-list.mjs';
import { mavenProfile } from './templates.mjs';
import { createPomStorage } from '../maven/support/pom-store.mjs';
import { getFrontendAppName } from '../base/support/index.mjs';
import { buildApplication } from '../base-docker/utils.mjs';

const { MEMCACHED } = cacheTypes;

const NO_CACHE_PROVIDER = cacheTypes.NO;

const { MAVEN } = buildToolTypes;
/* eslint-disable consistent-return */
export default class AzureSpringCloudGenerator extends BaseGenerator {
  constructor(args, options, features) {
    super(args, options, features);

    this.option('skip-build', {
      description: 'Skips building the application',
      type: Boolean,
      default: false,
    });

    this.option('skip-deploy', {
      description: 'Skips deployment to Azure Spring Cloud',
      type: Boolean,
      default: false,
    });

    this.azureSpringCloudSkipBuild = this.options.skipBuild;
    this.azureSpringCloudSkipDeploy = this.options.skipDeploy || this.options.skipBuild;
  }

  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints(GENERATOR_AZURE_SPRING_CLOUD);
    }
  }

  get initializing() {
    return {
      sayHello() {
        this.log.log(chalk.bold('Azure Spring Cloud configuration is starting'));
      },
      getSharedConfig() {
        this.loadAppConfig();
        this.loadServerConfig();
        this.loadPlatformConfig();

        this.loadDerivedAppConfig();
        this.loadDerivedServerConfig();
        this.loadDerivedPlatformConfig();
      },
      getConfig() {
        this.env.options.appPath = this.config.get('appPath') || CLIENT_MAIN_SRC_DIR;
        this.cacheProvider = this.cacheProvider || NO_CACHE_PROVIDER;
        this.enableHibernateCache = this.enableHibernateCache && ![NO_CACHE_PROVIDER, MEMCACHED].includes(this.cacheProvider);
        this.frontendAppName = getFrontendAppName({ baseName: this.jhipsterConfig.baseName });
        this.azureSpringCloudResourceGroupName = ''; // This is not saved, as it is better to get the Azure default variable
        this.azureSpringCloudServiceName = ''; // This is not saved, as it is better to get the Azure default variable
        this.azureSpringCloudAppName = this.config.get('azureSpringCloudAppName');
        this.azureSpringCloudDeploymentType = this.config.get('azureSpringCloudDeploymentType');
      },
      loadConstants() {
        this.JAVA_VERSION = JAVA_VERSION;
      },
    };
  }

  get [BaseGenerator.INITIALIZING]() {
    return this.delegateTasksToBlueprint(() => this.initializing);
  }

  get prompting() {
    return {
      checkBuildTool: runAsync(function () {
        if (this.abort) return;
        const done = this.async();
        if (this.buildTool !== MAVEN) {
          this.log.error('Sorry, this sub-generator only works with Maven projects for the moment.');
          this.abort = true;
        }
        done();
      }),

      checkInstallation: runAsync(function () {
        if (this.abort) return;
        const done = this.async();

        exec('az --version', err => {
          if (err) {
            this.log.error(
              `You don't have the Azure CLI installed.
Download it from:
${chalk.red('https://docs.microsoft.com/en-us/cli/azure/install-azure-cli/?WT.mc_id=generator-jhipster-judubois')}`,
            );
            this.abort = true;
          }
          done();
        });
      }),

      checkExtensionInstallation: runAsync(function () {
        if (this.abort) return;
        const done = this.async();

        exec('az extension show --name spring-cloud', err => {
          if (err) {
            this.log.error(
              `You don't have the Azure Spring Cloud extension installed in your Azure CLI.
Install it by running:
${chalk.red('az extension add --name spring-cloud')}`,
            );
            this.abort = true;
          }
          done();
        });
      }),

      checkClusterAvailability: runAsync(function () {
        if (this.abort) return;
        const done = this.async();

        exec('az spring-cloud app list', err => {
          if (err) {
            this.log.error(`${chalk.red('Your Azure Spring Cloud cluster is not available!')}\n ${err}`);
            this.abort = true;
          }
          done();
        });
      }),

      getAzureSpringCloudDefaults: runAsync(function () {
        if (this.abort) return;
        const done = this.async();
        exec('az configure --list-defaults true', (err, stdout) => {
          if (err) {
            this.config.set({
              azureSpringCloudResourceGroupName: null,
            });
            this.abort = true;
            this.log.error('Could not retrieve your Azure default configuration.');
          } else {
            const json = JSON.parse(stdout);
            Object.keys(json).forEach(key => {
              if (json[key].name === 'group') {
                this.azureSpringCloudResourceGroupName = json[key].value;
              }
              if (json[key].name === 'spring-cloud') {
                this.azureSpringCloudServiceName = json[key].value;
              }
            });
            if (this.azureSpringCloudResourceGroupName === '') {
              this.log.verboseInfo(
                `Your default Azure resource group is not set up. We recommend doing it using the command
                                '${chalk.yellow('az configure --defaults group=<resource group name>')}`,
              );
              this.azureSpringCloudResourceGroupName = '';
            }
            if (this.azureSpringCloudServiceName === '') {
              this.log.verboseInfo(
                `Your default Azure Spring Cloud service name is not set up. We recommend doing it using the command
                                '${chalk.yellow('az configure --defaults spring-cloud=<service instance name>')}`,
              );
              this.azureSpringCloudServiceName = '';
            }
          }
          done();
        });
      }),

      askForazureSpringCloudVariables: runAsync(function () {
        if (this.abort) return;
        const done = this.async();

        const prompts = [
          {
            type: 'input',
            name: 'azureSpringCloudResourceGroupName',
            message: 'Azure resource group name:',
            default: this.azureSpringCloudResourceGroupName,
          },
          {
            type: 'input',
            name: 'azureSpringCloudServiceName',
            message: 'Azure Spring Cloud service name (the name of your cluster):',
            default: this.azureSpringCloudServiceName,
          },
          {
            type: 'input',
            name: 'azureSpringCloudAppName',
            message: 'Azure Spring Cloud application name:',
            default: this.azureSpringCloudAppName || this.baseName,
          },
        ];

        this.prompt(prompts).then(props => {
          this.azureSpringCloudResourceGroupName = props.azureSpringCloudResourceGroupName;
          this.azureSpringCloudServiceName = props.azureSpringCloudServiceName;
          this.azureSpringCloudAppName = props.azureSpringCloudAppName;
          done();
        });
      }),

      askForAzureDeployType: runAsync(function () {
        if (this.abort) return;
        const done = this.async();
        const prompts = [
          {
            type: 'list',
            name: 'azureSpringCloudDeploymentType',
            message: 'Which type of deployment do you want ?',
            choices: [
              {
                value: 'local',
                name: 'Build and deploy locally',
              },
              {
                value: 'github-action',
                name: 'Build and deploy using GitHub Actions',
              },
            ],
            default: 0,
          },
        ];

        this.prompt(prompts).then(props => {
          this.azureSpringCloudDeploymentType = props.azureSpringCloudDeploymentType;
          done();
        });
      }),
    };
  }

  get [BaseGenerator.PROMPTING]() {
    return this.delegateTasksToBlueprint(() => this.prompting);
  }

  get configuring() {
    return {
      saveConfig() {
        if (this.abort) return;
        this.config.set({
          azureSpringCloudAppName: this.azureSpringCloudAppName,
          azureSpringCloudDeploymentType: this.azureSpringCloudDeploymentType,
        });
      },
    };
  }

  get [BaseGenerator.CONFIGURING]() {
    return this.delegateTasksToBlueprint(() => this.configuring);
  }

  get default() {
    return {
      insight() {
        statistics.sendSubGenEvent('generator', GENERATOR_AZURE_SPRING_CLOUD);
      },

      azureSpringCloudAppCreate: runAsync(function () {
        if (this.abort) return;
        const done = this.async();
        exec(
          `az spring-cloud app show --resource-group ${this.azureSpringCloudResourceGroupName} \
--service ${this.azureSpringCloudServiceName} --name ${this.azureSpringCloudAppName}`,
          err => {
            if (err) {
              this.log.log(chalk.bold('Application does not exist yet, creating it...'));
              exec(
                `az spring-cloud app create --resource-group ${this.azureSpringCloudResourceGroupName} \
            --service ${this.azureSpringCloudServiceName} --name ${this.azureSpringCloudAppName}`,
                err => {
                  if (err) {
                    this.abort = true;
                    this.log.error(`Application creation failed! Here is the error: ${err}`);
                  } else {
                    this.log.log(`${chalk.green(chalk.bold('Success!'))} Your application has been created.`);
                  }
                  done();
                },
              );
            } else {
              this.log.log(chalk.bold('Application already exists, using it.'));
              done();
            }
          },
        );
      }),
    };
  }

  get [BaseGenerator.DEFAULT]() {
    return this.delegateTasksToBlueprint(() => this.default);
  }

  get loading() {
    return {
      derivedProperties() {
        this.isPackageNameJhipsterTech = this.packageName !== 'tech.jhipster';
        this.loadDerivedServerConfig();
        this.loadDerivedPlatformConfig();
        this.loadDerivedAppConfig();
      },
    };
  }

  get [BaseGenerator.LOADING]() {
    return this.delegateTasksToBlueprint(() => this.loading);
  }

  get writing() {
    return {
      copyAzureSpringCloudFiles() {
        if (this.abort) return;
        this.log.log(chalk.bold('\nCreating Azure Spring Cloud deployment files'));
        this.writeFile('application-azure.yml.ejs', `${SERVER_MAIN_RES_DIR}/config/application-azure.yml`);
        this.writeFile('bootstrap-azure.yml.ejs', `${SERVER_MAIN_RES_DIR}/config/bootstrap-azure.yml`);
        if (this.azureSpringCloudDeploymentType === 'github-action') {
          this.writeFile('github/workflows/azure-spring-cloud.yml.ejs', '.github/workflows/azure-spring-cloud.yml');
        }
      },

      addAzureSpringCloudMavenProfile() {
        if (this.abort) return;
        if (this.buildTool === MAVEN) {
          this.addMavenProfile('azure', mavenProfile());
        }
      },
    };
  }

  get [BaseGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  get end() {
    return {
      gitHubAction: runAsync(function () {
        if (this.abort) return;
        if (this.azureSpringCloudDeploymentType === 'local') return;
        const done = this.async();

        try {
          this.log.verboseInfo('Test if Git is configured on your project...');
          fs.lstatSync('.git');
          this.log.log(chalk.bold('\nUsing existing Git repository'));
        } catch (e) {
          // An exception is thrown if the folder doesn't exist
          this.log.error(
            `${chalk.red('Git is not set up on your project!')}
You need a GitHub project correctly configured in order to use GitHub Actions.`,
          );
          this.abort = true;
          return;
        }
        const gitAddCmd = 'git add .';
        this.log.log(chalk.bold('\nAdding Azure Spring Cloud files to the Git repository'));
        this.log.log(chalk.cyan(gitAddCmd));
        exec(gitAddCmd, (err, stdout, stderr) => {
          if (err) {
            this.abort = true;
            this.log.error(err);
          } else {
            const line = stderr.toString().trimRight();
            if (line.trim().length !== 0) this.log.verboseInfo(line);
            this.log.log(chalk.bold('\nCommitting Azure Spring Cloud files'));
            const gitCommitCmd = 'git commit -m "Add Azure Spring Cloud files with automated GitHub Action deployment" --allow-empty';

            this.log.log(chalk.cyan(gitCommitCmd));
            exec(gitCommitCmd, (err, stdout, stderr) => {
              if (err) {
                this.abort = true;
                this.log.error(err);
              } else {
                const line = stderr.toString().trimRight();
                if (line.trim().length !== 0) this.log.verboseInfo(line);
                this.log.log(chalk.bold('\nPushing Azure Spring Cloud files'));
                const gitPushCmd = 'git push';
                this.log.log(chalk.cyan(gitPushCmd));
                exec(gitPushCmd, (err, stdout, stderr) => {
                  if (err) {
                    this.abort = true;
                    this.log.error(err);
                  } else {
                    const line = stderr.toString().trimRight();
                    if (line.trim().length !== 0) this.log.verboseInfo(line);
                    this.log.log(chalk.bold(chalk.green('Congratulations, automated deployment with GitHub Action is set up!')));
                    this.log.verboseInfo(
                      `For the deployment to succeed, you will need to configure a ${chalk.bold('AZURE_CREDENTIALS')} secret in GitHub.
Read the documentation at https://github.com/microsoft/azure-spring-cloud-training/blob/master/11-configure-ci-cd/README.md
for more detailed information.`,
                    );
                    done();
                  }
                });
              }
            });
          }
        });
      }),

      productionBuild: runAsync(function () {
        if (this.abort) return;
        if (this.azureSpringCloudDeploymentType === 'github-action') return;
        if (this.azureSpringCloudSkipBuild) return;

        const done = this.async();
        this.log.log(chalk.bold('\nBuilding application'));

        const child = buildApplication(this.buildTool, 'prod,azure', false, err => {
          if (err) {
            this.abort = true;
            this.log.error(err);
          }
          done();
        });

        this.buildCmd = child.buildCmd;

        child.stdout.on('data', data => {
          process.stdout.write(data.toString());
        });
      }),

      productionDeploy: runAsync(function () {
        if (this.abort) return;
        if (this.azureSpringCloudDeploymentType === 'github-action') return;
        if (this.azureSpringCloudSkipDeploy) return;

        const done = this.async();
        this.log.log(chalk.bold('\nDeploying application...'));
        let buildDir = 'target';
        if (this.buildTool === 'gradle') {
          buildDir = 'build/libs';
        }
        exec(
          `az spring-cloud app deploy --resource-group ${this.azureSpringCloudResourceGroupName} \
--service ${this.azureSpringCloudServiceName} --name ${this.azureSpringCloudAppName} \
--jar-path ${buildDir}/*.jar`,
          (err, stdout) => {
            if (err) {
              this.abort = true;
              this.log.error(`Deployment failed!\n ${err}`);
            } else {
              const json = JSON.parse(stdout);
              this.log.log(`${chalk.green(chalk.bold('Success!'))} Your application has been deployed.`);
              this.log.verboseInfo(`Provisioning state: ${chalk.bold(json.properties.provisioningState)}`);
              this.log.verboseInfo(`Application status  : ${chalk.bold(json.properties.status)}`);
            }
            done();
          },
        );
      }),
    };
  }

  get [BaseGenerator.END]() {
    return this.delegateTasksToBlueprint(() => this.end);
  }

  /**
   * @private
   * Add a new Maven profile.
   *
   * @param {string} profileId - profile ID
   * @param {string} other - explicit other thing: build, dependencies...
   */
  addMavenProfile(profileId, other) {
    createPomStorage(this).addProfile({ id: profileId, content: other });
  }
}
