/**
 * Copyright 2013-2019 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const fs = require('fs');
const exec = require('child_process').exec;
const chalk = require('chalk');
const BaseGenerator = require('../generator-base');
const statistics = require('../statistics');

// Global constants
const constants = require('../generator-constants');

// Local constants
const AZURE_WEBAPP_MAVEN_PLUGIN_VERSION = '1.8.0';
const AZURE_WEBAPP_RUNTIME = 'JAVA|11-java11';
const AZURE_APP_INSIGHTS_STARTER_VERSION = '2.5.1';

module.exports = class extends BaseGenerator {
    constructor(args, opts) {
        super(args, opts);
        // This adds support for a `--from-cli` flag
        this.option('from-cli', {
            desc: 'Indicates the command is run from JHipster CLI',
            type: Boolean,
            defaults: false
        });
        this.option('skip-build', {
            desc: 'Skips building the application',
            type: Boolean,
            defaults: false
        });

        this.option('skip-deploy', {
            desc: 'Skips deployment to Azure App Service',
            type: Boolean,
            defaults: false
        });

        this.option('skip-insights', {
            desc: 'Skips configuration of Azure Application Insights',
            type: Boolean,
            defaults: false
        });

        this.azureSpringCloudSkipBuild = this.options['skip-build'];
        this.azureSpringCloudSkipDeploy = this.options['skip-deploy'] || this.options['skip-build'];
        this.azureSpringCloudSkipInsights = this.options['skip-insights'];
        this.registerPrettierTransform();
    }

    initializing() {
        if (!this.options['from-cli']) {
            this.warning(
                `Deprecated: JHipster seems to be invoked using Yeoman command. Please use the JHipster CLI. Run ${chalk.red(
                    'jhipster <command>'
                )} instead of ${chalk.red('yo jhipster:<command>')}`
            );
        }
        this.log(chalk.bold('Azure App Service configuration is starting'));
        this.env.options.appPath = this.config.get('appPath') || constants.CLIENT_MAIN_SRC_DIR;
        this.baseName = this.config.get('baseName');
        this.packageName = this.config.get('packageName');
        this.packageFolder = this.config.get('packageFolder');
        this.authenticationType = this.config.get('authenticationType');
        this.jwtSecretKey = this.config.get('jwtSecretKey');
        this.cacheProvider = this.config.get('cacheProvider') || this.config.get('hibernateCache') || 'no';
        this.enableHibernateCache = this.config.get('enableHibernateCache') && !['no', 'memcached'].includes(this.cacheProvider);
        this.databaseType = this.config.get('databaseType');
        this.prodDatabaseType = this.config.get('prodDatabaseType');
        this.searchEngine = this.config.get('searchEngine');
        this.angularAppName = this.getAngularAppName();
        this.buildTool = this.config.get('buildTool');
        this.applicationType = this.config.get('applicationType');
        this.serviceDiscoveryType = this.config.get('serviceDiscoveryType');
        this.azureAppServiceResourceGroupName = ''; // This is not saved, as it is better to get the Azure default variable
        this.azureAppServicePlan = this.config.get('azureAppServicePlan');
        this.azureAppServiceName = this.config.get('azureAppServiceName');
        this.azureApplicationInsightsName = this.config.get('azureApplicationInsightsName');
        this.azureAppServiceDeploymentType = this.config.get('azureAppServiceDeploymentType');
        this.azureAppInsightsInstrumentationKey = '';
        this.azureGroupId = '';
    }

    get prompting() {
        return {
            checkBuildTool() {
                if (this.abort) return;
                const done = this.async();
                if (this.buildTool !== 'maven') {
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
                            azureAppServiceResourceGroupName: null
                        });
                        this.abort = true;
                        this.error('Could not retrieve your Azure default configuration.');
                    } else {
                        const json = JSON.parse(stdout);
                        Object.keys(json).forEach(key => {
                            if (json[key].name === 'group') {
                                this.azureAppServiceResourceGroupName = json[key].value;
                            }
                        });
                        if (this.azureAppServiceResourceGroupName === '') {
                            this.log(
                                `Your default Azure resource group is not set up. We recommend doing it using the command 
                                '${chalk.yellow('az configure --defaults group=<resource group name>')}`
                            );
                            this.azureAppServiceResourceGroupName = '';
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
                        default: this.azureAppServiceResourceGroupName
                    },
                    {
                        type: 'input',
                        name: 'azureAppServicePlan',
                        message: 'Azure App Service plan name:',
                        default: this.azureAppServicePlan || `${this.baseName}-plan`
                    },
                    {
                        type: 'input',
                        name: 'azureApplicationInsightsName',
                        message: 'Azure Application Insights instance name:',
                        default: this.azureApplicationInsightsName || `${this.baseName}-insights`
                    },
                    {
                        type: 'input',
                        name: 'azureAppServiceName',
                        message: 'Azure App Service application name:',
                        default: this.azureAppServiceName || this.baseName
                    }
                ];

                this.prompt(prompts).then(props => {
                    this.azureAppServiceResourceGroupName = props.azureAppServiceResourceGroupName;
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
                                name: 'Build and deploy locally'
                            },
                            {
                                value: 'github-action',
                                name: 'Build and deploy using GitHub Actions'
                            }
                        ],
                        default: 0
                    }
                ];

                this.prompt(prompts).then(props => {
                    this.azureAppServiceDeploymentType = props.azureAppServiceDeploymentType;
                    done();
                });
            }
        };
    }

    get configuring() {
        return {
            saveConfig() {
                if (this.abort) return;
                this.config.set({
                    azureAppServicePlan: this.azureAppServicePlan,
                    azureApplicationInsightsName: this.azureApplicationInsightsName,
                    azureAppServiceName: this.azureAppServiceName,
                    azureAppServiceDeploymentType: this.azureAppServiceDeploymentType
                });
            }
        };
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
                                    `az appservice plan create --name ${this.azureAppServicePlan} --is-linux --sku B1 --resource-group ${this.azureAppServiceResourceGroupName}`,
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
                const done = this.async();
                this.log(chalk.bold('\nAdding Azure Web App Maven plugin'));
                if (this.buildTool === 'maven') {
                    this.render('pom-plugin.xml.ejs', rendered => {
                        this.addMavenPlugin(
                            'com.microsoft.azure',
                            'azure-webapp-maven-plugin',
                            AZURE_WEBAPP_MAVEN_PLUGIN_VERSION,
                            rendered
                        );
                    });
                }
                done();
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
                                `az monitor app-insights component create --app ${this.azureApplicationInsightsName} --resource-group ${this.azureAppServiceResourceGroupName}`,
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
                this.addMavenDependency(
                    'com.microsoft.azure',
                    'applicationinsights-spring-boot-starter',
                    AZURE_APP_INSIGHTS_STARTER_VERSION
                );
                this.log(`The Application Insights instrumentation key used is: '${chalk.bold(this.azureAppInsightsInstrumentationKey)}'`);
                done();
            },

            copyAzureAppServiceFiles() {
                if (this.abort) return;
                const done = this.async();
                this.log(chalk.bold('\nCreating Azure App Service deployment files'));
                this.template('application-azure.yml.ejs', `${constants.SERVER_MAIN_RES_DIR}/config/application-azure.yml`);
                if (this.azureAppServiceDeploymentType === 'github-action') {
                    this.template('github/workflows/azure-app-service.yml.ejs', '.github/workflows/azure-app-service.yml');
                }
                this.conflicter.resolve(err => {
                    done();
                });
            }
        };
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
                        const gitCommitCmd =
                            'git commit -m "Add Azure App Service files with automated GitHub Action deployment" --allow-empty';

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
                                        this.log(
                                            chalk.bold(chalk.green('Congratulations, automated deployment with GitHub Action is set up!'))
                                        );
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
            }
        };
    }
};
