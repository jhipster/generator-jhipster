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

const constants = require('../generator-constants');

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

        this.azureSpringCloudSkipBuild = this.options['skip-build'];
        this.azureSpringCloudSkipDeploy = this.options['skip-deploy'] || this.options['skip-build'];
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
        this.azureSpringCloudResourceGroupName = ''; // This is not saved, as it is better to get the Azure default variable
        this.azureAppServicePlan = this.config.get('azureAppServicePlan');
        this.azureAppServiceName = this.config.get('azureAppServiceName');
        this.azureAppServiceDeploymentType = this.config.get('azureAppServiceDeploymentType');
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
                            azureSpringCloudResourceGroupName: null
                        });
                        this.abort = true;
                        this.error('Could not retrieve your Azure default configuration.');
                    } else {
                        const json = JSON.parse(stdout);
                        Object.keys(json).forEach(key => {
                            if (json[key].name === 'group') {
                                this.azureSpringCloudResourceGroupName = json[key].value;
                            }
                        });
                        if (this.azureSpringCloudResourceGroupName === '') {
                            this.log(
                                `Your default Azure resource group is not set up. We recommend doing it using the command 
                                '${chalk.yellow('az configure --defaults group=<resource group name>')}`
                            );
                            this.azureSpringCloudResourceGroupName = '';
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
                        name: 'azureSpringCloudResourceGroupName',
                        message: 'Azure resource group name:',
                        default: this.azureSpringCloudResourceGroupName
                    },
                    {
                        type: 'input',
                        name: 'azureAppServicePlan',
                        message: 'Azure App Service plan name:',
                        default: this.azureAppServicePlan || this.baseName + 'Plan'
                    },
                    {
                        type: 'input',
                        name: 'azureAppServiceName',
                        message: 'Azure App Service application name:',
                        default: this.azureAppServiceName || this.baseName
                    }
                ];

                this.prompt(prompts).then(props => {
                    this.azureSpringCloudResourceGroupName = props.azureSpringCloudResourceGroupName;
                    this.azureAppServicePlan = props.azureAppServicePlan;
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

            azureAzureAppServicePlanCreate() {
                if (this.abort) return;
                const done = this.async();
                this.log(chalk.bold(`\nChecking Azure App Service plan '${this.azureAppServicePlan}'...`));
                exec(
                    `az appservice plan list --resource-group ${this.azureSpringCloudResourceGroupName}`,
                    (err, stdout) => {
                        if (err) {
                            this.abort = true;
                            this.error('Could not list your Azure App Service plans');
                        } else {
                            const json = JSON.parse(stdout);
                            let servicePlanAlreadyExists = false;
                            try {
                                for (let i = 0; i < json.length; i++) {
                                    let currentPlan = json[i];
                                    Object.keys(currentPlan).forEach(key => {
                                        if (key === 'name') {
                                            if (this.azureAppServicePlan == currentPlan[key]) {
                                                this.log(`Service plan '${this.azureAppServicePlan}' already exists, using it`);
                                                servicePlanAlreadyExists = true;
                                            }
                                        }
                                    });
                                }
                            
                                if (!servicePlanAlreadyExists) {
                                    this.log(`Service plan '${this.azureAppServicePlan}' doesn't exist, creating it...`);
                                    exec(
                                        `az appservice plan create --name ${this.azureAppServicePlan} --sku B1 --resource-group ${this.azureSpringCloudResourceGroupName}`, (err, stdout) => {
                                            if (err) {
                                                this.abort = true;
                                                this.error('Could not create the Azure App Service plan');
                                            } else {
                                                this.log(chalk.green(`Service plan ${this.azureAppServicePlan} created`));
                                                this.log(`Service plan ${this.azureAppServicePlan} uses the 'B1' (basic small) pricing tier, \
                                                    which is free for the first 30 days`);
                                            }
                                        });
                                }
                            } catch (e) {
                                this.log(e);
                                this.abort = true;
                                this.error('Could not manage the Azure App Service plan');
                            }
                        }
                        done();
                    }
                );
            },

            azureAzureAppServiceCreate() {
                if (this.abort) return;
                const done = this.async();
                this.log(chalk.bold(`\nChecking Azure App Service '${this.azureAppServiceName}'...`));
                exec(
                    `az webapp list --query "[]" --resource-group ${this.azureSpringCloudResourceGroupName}`,
                    (err, stdout) => {
                        if (err) {
                            this.abort = true;
                            this.error('Could not list your Azure App Service instances');
                        } else {
                            const json = JSON.parse(stdout);
                            let applicationAlreadyExists = false;
                            try {
                                for (let i = 0; i < json.length; i++) {
                                    let currentApp = json[i];
                                    Object.keys(currentApp).forEach(key => {
                                        if (key === 'name') {
                                            if (this.azureAppServiceName == currentApp[key]) {
                                                this.log(`Application '${this.azureAppServiceName}' already exists, using it`);
                                                applicationAlreadyExists = true;
                                            }
                                        }
                                    });
                                }
                            
                                if (!applicationAlreadyExists) {
                                    this.log(`Application '${this.azureAppServiceName}' doesn't exist, creating it...`);
                                    exec(
                                        `az webapp create --name ${this.azureAppServiceName} --plan ${this.azureAppServicePlan} --resource-group ${this.azureSpringCloudResourceGroupName}`, (err, stdout) => {
                                            if (err) {
                                                this.abort = true;
                                                this.error('Could not create the Web application');
                                            } else {
                                                this.log(chalk.green(`Web application ${this.azureAppServiceName} created`));
                                            }
                                        });
                                }
                            } catch (e) {
                                this.log(e);
                                this.abort = true;
                                this.error('Could not manage the Azure App Service Web application');
                            }
                        }
                        done();
                    }
                );
            },

            copyAzureAppServiceFiles() {
                if (this.abort) return;
                const done = this.async();
                this.log(chalk.bold('\nCreating Azure App Service deployment files'));
                this.template('application-azure.yml.ejs', `${constants.SERVER_MAIN_RES_DIR}/config/application-azure.yml`);
                this.template('bootstrap-azure.yml.ejs', `${constants.SERVER_MAIN_RES_DIR}/config/bootstrap-azure.yml`);
                if (this.azureAppServiceDeploymentType === 'github-action') {
                    this.template('github/workflows/azure-spring-cloud.yml.ejs', '.github/workflows/azure-spring-cloud.yml');
                }
                this.conflicter.resolve(err => {
                    done();
                });
            },

            addAzureSpringCloudMavenProfile() {
                if (this.abort) return;
                const done = this.async();
                if (this.buildTool === 'maven') {
                    this.render('pom-profile.xml.ejs', profile => {
                        this.addMavenProfile('azure', `            ${profile.toString().trim()}`);
                    });
                }
                done();
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
                this.log(chalk.bold('\nAdding Azure Spring Cloud files to the Git repository'));
                this.log(chalk.cyan(gitAddCmd));
                exec(gitAddCmd, (err, stdout, stderr) => {
                    if (err) {
                        this.abort = true;
                        this.error(err);
                    } else {
                        const line = stderr.toString().trimRight();
                        if (line.trim().length !== 0) this.log(line);
                        this.log(chalk.bold('\nCommitting Azure Spring Cloud files'));
                        const gitCommitCmd =
                            'git commit -m "Add Azure Spring Cloud files with automated GitHub Action deployment" --allow-empty';

                        this.log(chalk.cyan(gitCommitCmd));
                        exec(gitCommitCmd, (err, stdout, stderr) => {
                            if (err) {
                                this.abort = true;
                                this.error(err);
                            } else {
                                const line = stderr.toString().trimRight();
                                if (line.trim().length !== 0) this.log(line);
                                this.log(chalk.bold('\nPushing Azure Spring Cloud files'));
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
                                            )} secret in GitHub.
Read the documentation at https://github.com/microsoft/azure-spring-cloud-training/blob/master/11-configure-ci-cd/README.md
for more detailed information.`
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

                const child = this.buildApplication(this.buildTool, 'prod,azure', false, err => {
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

                exec(
                    `az spring-cloud app deploy --resource-group ${this.azureSpringCloudResourceGroupName} \
--service ${this.azureSpringCloudServiceName} --name ${this.azureAppServiceName} \
--jar-path target/*.jar`,
                    (err, stdout) => {
                        if (err) {
                            this.abort = true;
                            this.error(`Deployment failed!\n ${err}`);
                        } else {
                            const json = JSON.parse(stdout);
                            this.log(`${chalk.green(chalk.bold('Success!'))} Your application has been deployed.`);
                            this.log(`Provisitioning state: ${chalk.bold(json.properties.provisioningState)}`);
                            this.log(`Application status  : ${chalk.bold(json.properties.status)}`);
                        }
                        done();
                    }
                );
            }
        };
    }
};
