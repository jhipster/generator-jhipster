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
import _ from 'lodash';
import fs from 'fs';
import { exec } from 'child_process';
import chalk from 'chalk';
import BaseGenerator from '../base/index.mjs';

import statistics from '../statistics.cjs';
import generatorDefaults from '../generator-defaults.mjs';

// Global constants
import { JAVA_VERSION, SERVER_MAIN_RES_DIR } from '../generator-constants.mjs';

import { GENERATOR_AZURE_APP_SERVICE } from '../generator-list.mjs';
import { buildToolTypes } from '../../jdl/jhipster/index.mjs';
import { mavenPluginConfiguration } from './templates.mjs';

const { defaultConfig } = generatorDefaults;
const { MAVEN } = buildToolTypes;
// Local constants
const AZURE_WEBAPP_MAVEN_PLUGIN_VERSION = '1.8.0';
const AZURE_WEBAPP_RUNTIME = 'JAVA|11-java11';
const AZURE_APP_INSIGHTS_STARTER_VERSION = '2.5.1';

/* eslint-disable consistent-return */
export default class AzureAppServiceGenerator extends BaseGenerator {
  constructor(args, options, features) {
    super(args, options, features);

    this.option('skip-build', {
      desc: 'Skips building the application',
      type: Boolean,
      defaults: false,
    });

    this.option('skip-deploy', {
      desc: 'Skips deployment to Azure App Service',
      type: Boolean,
      defaults: false,
    });

    this.option('skip-insights', {
      desc: 'Skips configuration of Azure Application Insights',
      type: Boolean,
      defaults: false,
    });

    this.azureSpringCloudSkipBuild = this.options.skipBuild;
    this.azureSpringCloudSkipDeploy = this.options.skipDeploy || this.options.skipBuild;
    this.azureSpringCloudSkipInsights = this.options.skipInsights;
  }

  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints(GENERATOR_AZURE_APP_SERVICE);
    }
  }

  get initializing() {
    return {
      sayHello() {
        this.log(chalk.bold('Azure App Service configuration is starting'));
      },
      getSharedConfig() {
        this.loadAppConfig();
        this.loadServerConfig();
      },
      getConfig() {
        this.azureAppServiceResourceGroupName = ''; // This is not saved, as it is better to get the Azure default variable
        this.azureLocation = this.config.get('azureLocation');
        this.azureAppServicePlan = this.config.get('azureAppServicePlan');
        this.azureAppServiceName = this.config.get('azureAppServiceName');
        this.azureApplicationInsightsName = this.config.get('azureApplicationInsightsName');
        this.azureAppServiceDeploymentType = this.config.get('azureAppServiceDeploymentType');
        this.azureAppInsightsInstrumentationKey = '';
        this.azureGroupId = '';
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
      checkBuildTool() {
        if (this.abort) return;
        const done = this.async();
        if (this.buildTool !== MAVEN) {
          this.error('Sorry, this sub-generator only works with Maven projects for the moment.');
          this.abort = true;
        }
        done();
      },

      checkInstallation() {
        if (this.abort) return;
        const done = this.async();

        exec('az --version', err => {
          if (err) {
            this.error(
              `You don't have the Azure CLI installed.
Download it from:
${chalk.red('https://docs.microsoft.com/en-us/cli/azure/install-azure-cli/?WT.mc_id=generator-jhipster-judubois')}`
            );
            this.abort = true;
          }
          done();
        });
      },

      getAzureAppServiceDefaults() {
        if (this.abort) return;
        const done = this.async();
        exec('az configure --list-defaults true', (err, stdout) => {
          if (err) {
            this.config.set({
              azureAppServiceResourceGroupName: null,
              azureLocation: 'eastus',
            });
            this.abort = true;
            this.error('Could not retrieve your Azure default configuration.');
          } else {
            const json = JSON.parse(stdout);
            Object.keys(json).forEach(key => {
              if (json[key].name === 'group') {
                this.azureAppServiceResourceGroupName = json[key].value;
              }
              if (json[key].name === 'location') {
                this.azureLocation = json[key].value;
              }
            });
            if (this.azureAppServiceResourceGroupName === '') {
              this.log(
                `Your default Azure resource group is not set up. We recommend doing it using the command
                                '${chalk.yellow('az configure --defaults group=<resource group name>')}`
              );
              this.azureAppServiceResourceGroupName = '';
            }
            if (this.azureLocation === '') {
              this.azureLocation = 'eastus';
            }
          }
          done();
        });
      },

      askForazureAppServiceVariables() {
        if (this.abort) return;
        const done = this.async();

        const prompts = [
          {
            type: 'input',
            name: 'azureAppServiceResourceGroupName',
            message: 'Azure resource group name:',
            default: this.azureAppServiceResourceGroupName,
          },
          {
            type: 'input',
            name: 'azureLocation',
            message: 'Azure location:',
            default: this.azureLocation,
          },
          {
            type: 'input',
            name: 'azureAppServicePlan',
            message: 'Azure App Service plan name:',
            default: this.azureAppServicePlan || `${this.baseName}-plan`,
          },
          {
            type: 'input',
            name: 'azureApplicationInsightsName',
            message: 'Azure Application Insights instance name:',
            default: this.azureApplicationInsightsName || `${this.baseName}-insights`,
          },
          {
            type: 'input',
            name: 'azureAppServiceName',
            message: 'Azure App Service application name:',
            default: this.azureAppServiceName || this.baseName,
          },
        ];

        this.prompt(prompts).then(props => {
          this.azureAppServiceResourceGroupName = props.azureAppServiceResourceGroupName;
          this.azureLocation = props.azureLocation;
          this.azureAppServicePlan = props.azureAppServicePlan;
          this.azureApplicationInsightsName = props.azureApplicationInsightsName;
          this.azureAppServiceName = props.azureAppServiceName;
          done();
        });
      },

      askForAzureDeployType() {
        if (this.abort) return;
        const done = this.async();
        const prompts = [
          {
            type: 'list',
            name: 'azureAppServiceDeploymentType',
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
          this.azureAppServiceDeploymentType = props.azureAppServiceDeploymentType;
          done();
        });
      },
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
          azureAppServicePlan: this.azureAppServicePlan,
          azureApplicationInsightsName: this.azureApplicationInsightsName,
          azureAppServiceName: this.azureAppServiceName,
          azureAppServiceDeploymentType: this.azureAppServiceDeploymentType,
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
        statistics.sendSubGenEvent('generator', 'azure-app-service');
      },

      checkAzureGroupId() {
        if (this.abort) return;
        const done = this.async();
        this.log(chalk.bold(`\nChecking Azure resource group '${this.azureAppServiceResourceGroupName}'...`));
        exec(`az group show --name ${this.azureAppServiceResourceGroupName}`, (err, stdout) => {
          if (err) {
            this.abort = true;
            this.error('Could not retrieve your Azure resource group information, it is probably not configured.');
          } else {
            const json = JSON.parse(stdout);
            this.azureGroupId = json.id;
          }
          done();
        });
      },

      azureAzureAppServicePlanCreate() {
        if (this.abort) return;
        const done = this.async();
        this.log(chalk.bold(`\nChecking Azure App Service plan '${this.azureAppServicePlan}'...`));
        let servicePlanAlreadyExists = false;
        exec(`az appservice plan list --resource-group ${this.azureAppServiceResourceGroupName}`, (err, stdout, stderr) => {
          if (err) {
            this.abort = true;
            this.error('Could not list your Azure App Service plans');
          } else {
            const json = JSON.parse(stdout);
            if (json.filter(currentPlan => currentPlan.name === this.azureAppServicePlan).length > 0) {
              this.log(`Service plan '${this.azureAppServicePlan}' already exists, using it`);
              servicePlanAlreadyExists = true;
            }
            try {
              if (!servicePlanAlreadyExists) {
                this.log(`Service plan '${this.azureAppServicePlan}' doesn't exist, creating it...`);
                exec(
                  `az appservice plan create --name ${this.azureAppServicePlan} --is-linux --sku B1 --resource-group ${this.azureAppServiceResourceGroupName} --location ${this.azureLocation}`,
                  err => {
                    if (err) {
                      this.abort = true;
                      this.error('Could not create the Azure App Service plan');
                      this.log(err);
                      done();
                    } else {
                      this.log(chalk.green(`Service plan '${this.azureAppServicePlan}' created!`));
                      this.log(`Service plan '${this.azureAppServicePlan}' uses the 'B1' (basic small) pricing tier, \
which is free for the first 30 days`);
                      done();
                    }
                  }
                );
              } else {
                done();
              }
            } catch (e) {
              this.log(e);
              this.abort = true;
              this.error('Could not manage the Azure App Service plan');
            }
          }
        });
      },

      azureAzureAppServiceCreate() {
        if (this.abort) return;
        const done = this.async();
        this.log(chalk.bold(`\nChecking Azure App Service '${this.azureAppServiceName}'...`));
        exec(`az webapp list --query "[]" --resource-group ${this.azureAppServiceResourceGroupName}`, (err, stdout, stderr) => {
          if (err) {
            this.abort = true;
            this.error('Could not list your Azure App Service instances');
          } else {
            const json = JSON.parse(stdout);
            let applicationAlreadyExists = false;
            if (json.filter(currentApp => currentApp.name === this.azureAppServiceName).length > 0) {
              this.log(`Application '${this.azureAppServiceName}' already exists, using it`);
              applicationAlreadyExists = true;
            }
            try {
              if (!applicationAlreadyExists) {
                this.log(`Application '${this.azureAppServiceName}' doesn't exist, creating it...`);
                exec(
                  `az webapp create --name ${this.azureAppServiceName} --runtime "${AZURE_WEBAPP_RUNTIME}" --plan ${this.azureAppServicePlan} \
                                            --resource-group ${this.azureAppServiceResourceGroupName}`,
                  err => {
                    if (err) {
                      this.abort = true;
                      this.error('Could not create the Web application');
                      this.log(err);
                      done();
                    } else {
                      this.log(chalk.green(`Web application '${this.azureAppServiceName}' created!`));
                      done();
                    }
                  }
                );
              } else {
                done();
              }
            } catch (e) {
              this.log(e);
              this.abort = true;
              this.error('Could not manage the Azure App Service Web application');
            }
          }
        });
      },

      azureAzureAppServiceConfig() {
        if (this.abort) return;
        const done = this.async();
        this.log(`Configuring Azure App Service '${this.azureAppServiceName}'...`);
        this.log("Enabling 'prod' and 'azure' Spring Boot profiles");
        exec(
          `az webapp config appsettings set --resource-group ${this.azureAppServiceResourceGroupName} --name ${this.azureAppServiceName} --settings SPRING_PROFILES_ACTIVE=prod,azure`,
          (err, stdout) => {
            if (err) {
              this.abort = true;
              this.error('Could not configure Azure App Service instance');
            }
            done();
          }
        );
      },

      addAzureAppServiceMavenPlugin() {
        if (this.abort) return;
        this.log(chalk.bold('\nAdding Azure Web App Maven plugin'));
        if (this.buildTool === MAVEN) {
          this.addMavenPlugin(
            'com.microsoft.azure',
            'azure-webapp-maven-plugin',
            AZURE_WEBAPP_MAVEN_PLUGIN_VERSION,
            mavenPluginConfiguration(this)
          );
        }
      },

      checkAzureApplicationInsightsExtension() {
        if (this.abort) return;
        if (this.azureSpringCloudSkipInsights) return;
        const done = this.async();
        this.log(chalk.bold('\nAzure Application Insights configuration'));
        this.log('Checking Azure Application Insights CLI extension...');
        exec('az extension show --name application-insights', err => {
          if (err) {
            this.log('The Azure Application Insights CLI extension is NOT installed, installing it...');
            exec('az extension add --name application-insights', err => {
              if (!err) {
                this.log(chalk.green('The Azure Application Insights CLI extension is installed!'));
              } else {
                this.log(err);
                this.abort = true;
                this.error('Could not install the Azure Application Insights extension');
              }
              done();
            });
          } else {
            this.log('The Azure Application Insights CLI extension is already installed');
            done();
          }
        });
      },

      configureAzureApplicationInsights() {
        if (this.abort) return;
        if (this.azureSpringCloudSkipInsights) return;
        const done = this.async();
        this.log('Checking Azure Application Insights instance...');
        exec(
          `az monitor app-insights component show --app ${this.azureApplicationInsightsName} --resource-group ${this.azureAppServiceResourceGroupName}`,
          (err, stdout) => {
            if (err) {
              this.log('Azure Application Insights instance does not exist, creating it...');
              exec(
                `az monitor app-insights component create --app ${this.azureApplicationInsightsName} --resource-group ${this.azureAppServiceResourceGroupName} --location ${this.azureLocation}`,
                (err, stdout) => {
                  if (err) {
                    this.log(err);
                    this.abort = true;
                    this.error('Could not create the Azure Application Insights instance');
                  } else {
                    this.log(chalk.green('The Azure Application Insights instance is created!'));
                    const json = JSON.parse(stdout);
                    this.azureAppInsightsInstrumentationKey = json.instrumentationKey;
                  }
                  done();
                }
              );
            } else {
              this.log('The Azure Application Insights instance already exists, using it');
              const json = JSON.parse(stdout);
              this.azureAppInsightsInstrumentationKey = json.instrumentationKey;
              done();
            }
          }
        );
      },

      addAzureApplicationInsightsDependency() {
        if (this.abort) return;
        if (this.azureSpringCloudSkipInsights) return;
        const done = this.async();
        this.log('Adding Azure Application Insights support in the Web Application');
        this.addMavenDependency('com.microsoft.azure', 'applicationinsights-spring-boot-starter', AZURE_APP_INSIGHTS_STARTER_VERSION);
        this.log(`The Application Insights instrumentation key used is: '${chalk.bold(this.azureAppInsightsInstrumentationKey)}'`);
        done();
      },
    };
  }

  get [BaseGenerator.DEFAULT]() {
    return this.delegateTasksToBlueprint(() => this.default);
  }

  _computeDerivedConfig(config = _.defaults({}, this.jhipsterConfig, defaultConfig), dest = this) {
    this.loadAppConfig(config, dest);
    this.loadServerConfig(config, dest);

    this.loadDerivedAppConfig(dest);
    this.loadDerivedServerConfig(dest, dest);
    dest.azureAppInsightsInstrumentationKeyEmpty = config.azureAppInsightsInstrumentationKey === '';
  }

  // Public API method used by the getter and also by Blueprints
  get loading() {
    return {
      loadSharedConfig() {
        this._computeDerivedConfig();
      },
    };
  }

  get [BaseGenerator.LOADING]() {
    return this.delegateTasksToBlueprint(() => this.loading);
  }

  get writing() {
    return {
      writeFiles() {
        if (this.abort) return;
        this.log(chalk.bold('\nCreating Azure App Service deployment files'));
        this.writeFile('application-azure.yml.ejs', `${SERVER_MAIN_RES_DIR}/config/application-azure.yml`);
        if (this.azureAppServiceDeploymentType === 'github-action') {
          this.writeFile('github/workflows/azure-app-service.yml.ejs', '.github/workflows/azure-app-service.yml');
        }
      },
    };
  }

  get [BaseGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  get end() {
    return {
      gitHubAction() {
        if (this.abort) return;
        if (this.azureAppServiceDeploymentType === 'local') return;
        const done = this.async();

        try {
          this.log('Test if Git is configured on your project...');
          fs.lstatSync('.git');
          this.log(chalk.bold('\nUsing existing Git repository'));
        } catch (e) {
          // An exception is thrown if the folder doesn't exist
          this.error(
            `${chalk.red('Git is not set up on your project!')}
You need a GitHub project correctly configured in order to use GitHub Actions.`
          );
          this.abort = true;
          return;
        }
        const gitAddCmd = 'git add .';
        this.log(chalk.bold('\nAdding Azure App Service files to the Git repository'));
        this.log(chalk.cyan(gitAddCmd));
        exec(gitAddCmd, (err, stdout, stderr) => {
          if (err) {
            this.abort = true;
            this.error(err);
          } else {
            const line = stderr.toString().trimRight();
            if (line.trim().length !== 0) this.log(line);
            this.log(chalk.bold('\nCommitting Azure App Service files'));
            const gitCommitCmd = 'git commit -m "Add Azure App Service files with automated GitHub Action deployment" --allow-empty';

            this.log(chalk.cyan(gitCommitCmd));
            exec(gitCommitCmd, (err, stdout, stderr) => {
              if (err) {
                this.abort = true;
                this.error(err);
              } else {
                const line = stderr.toString().trimRight();
                if (line.trim().length !== 0) this.log(line);
                this.log(chalk.bold('\nPushing Azure App Service files'));
                const gitPushCmd = 'git push';
                this.log(chalk.cyan(gitPushCmd));
                exec(gitPushCmd, (err, stdout, stderr) => {
                  if (err) {
                    this.abort = true;
                    this.error(err);
                  } else {
                    const line = stderr.toString().trimRight();
                    if (line.trim().length !== 0) this.log(line);
                    this.log(chalk.bold(chalk.green('Congratulations, automated deployment with GitHub Action is set up!')));
                    this.log(
                      `For the deployment to succeed, you will need to configure a ${chalk.bold(
                        'AZURE_CREDENTIALS'
                      )} secret in GitHub. Type the following command to generate one for the current Azure Web Application:`
                    );
                    this.log(
                      chalk.bold(
                        `'az ad sp create-for-rbac --name http://${this.azureAppServiceName} --role contributor --scopes ${this.azureGroupId} --sdk-auth'`
                      )
                    );
                    done();
                  }
                });
              }
            });
          }
        });
      },

      productionBuild() {
        if (this.abort) return;
        if (this.azureAppServiceDeploymentType === 'github-action') return;
        if (this.azureSpringCloudSkipBuild) return;

        const done = this.async();
        this.log(chalk.bold('\nBuilding application'));

        const child = this.buildApplication(this.buildTool, 'prod', false, err => {
          if (err) {
            this.abort = true;
            this.error(err);
          }
          done();
        });

        this.buildCmd = child.buildCmd;

        child.stdout.on('data', data => {
          process.stdout.write(data.toString());
        });
      },

      productionDeploy() {
        if (this.abort) return;
        if (this.azureAppServiceDeploymentType === 'github-action') return;
        if (this.azureSpringCloudSkipDeploy) return;

        const done = this.async();
        this.log(chalk.bold('\nDeploying application...'));

        const child = this.runJavaBuildCommand(this.buildTool, 'prod', 'azure-webapp:deploy', err => {
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
      },
    };
  }

  get [BaseGenerator.END]() {
    return this.delegateTasksToBlueprint(() => this.end);
  }
}
