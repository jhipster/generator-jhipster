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
            desc: 'Skips deployment to Azure Spring Cloud',
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

        this.log(chalk.bold('Azure Spring Cloud configuration is starting'));
        this.env.options.appPath = this.config.get('appPath') || constants.CLIENT_MAIN_SRC_DIR;
        this.baseName = this.config.get('baseName');
        this.packageName = this.config.get('packageName');
        this.packageFolder = this.config.get('packageFolder');
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
        this.azureSpringCloudServiceName = ''; // This is not saved, as it is better to get the Azure default variable
        this.azureSpringCloudAppName = this.config.get('azureSpringCloudAppName');
        this.azureSpringCloudDeploymentType = this.config.get('azureSpringCloudDeploymentType');
    }

    get prompting() {
        return {
            checkBuildTool() {
                if (this.abort) return;
                const done = this.async();
                if (this.buildTool !== 'maven') {
                    this.log.error('Sorry, this sub-generator only works with Maven projects for the moment.');
                    this.abort = true;
                }
                done();
            },

            checkInstallation() {
                if (this.abort) return;
                const done = this.async();

                exec('az --version', err => {
                    if (err) {
                        this.log.error(
                            `You don't have the Azure CLI installed.
Download it from:
${chalk.red('https://docs.microsoft.com/en-us/cli/azure/install-azure-cli/?WT.mc_id=generator-jhipster-judubois')}`
                        );
                        this.abort = true;
                    }
                    done();
                });
            },

            checkExtensionInstallation() {
                if (this.abort) return;
                const done = this.async();

                exec('az extension show --name spring-cloud', err => {
                    if (err) {
                        this.log.error(
                            `You don't have the Azure Spring Cloud extension installed in your Azure CLI.
Install it by running:
${chalk.red(
    'az extension add -y --source https://azureclitemp.blob.core.windows.net/spring-cloud/spring_cloud-0.1.0-py2.py3-none-any.whl'
)}`
                        );
                        this.abort = true;
                    }
                    done();
                });
            },

            getAzureSpringCloudDefaults() {
                if (this.abort) return;
                const done = this.async();
                exec('az configure --list-defaults true', (err, stdout) => {
                    if (err) {
                        this.config.set({
                            azureSpringCloudResourceGroupName: null
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
                            this.log.info(
                                `Your default Azure resource group is not set up. We recommend doing it using the command 
                                '${chalk.yellow('az configure --defaults group=<resource group name>')}`
                            );
                            this.azureSpringCloudResourceGroupName = '';
                        }
                        if (this.azureSpringCloudServiceName === '') {
                            this.log.info(
                                `Your default Azure Spring Cloud service name is not set up. We recommend doing it using the command 
                                '${chalk.yellow('az configure --defaults spring-cloud=<service instance name>')}`
                            );
                            this.azureSpringCloudServiceName = '';
                        }
                    }
                    done();
                });
            },

            askForazureSpringCloudVariables() {
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
                        name: 'azureSpringCloudServiceName',
                        message: 'Azure Spring Cloud service name (the name of your cluster):',
                        default: this.azureSpringCloudServiceName
                    },
                    {
                        type: 'input',
                        name: 'azureSpringCloudAppName',
                        message: 'Azure Spring Cloud application name:',
                        default: this.azureSpringCloudAppName || this.baseName
                    }
                ];

                this.prompt(prompts).then(props => {
                    this.azureSpringCloudResourceGroupName = props.azureSpringCloudResourceGroupName;
                    this.azureSpringCloudServiceName = props.azureSpringCloudServiceName;
                    this.azureSpringCloudAppName = props.azureSpringCloudAppName;
                    done();
                });
            },

            askForAzureDeployType() {
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
                    this.azureSpringCloudDeploymentType = props.azureSpringCloudDeploymentType;
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
                    azureSpringCloudAppName: this.azureSpringCloudAppName,
                    azureSpringCloudDeploymentType: this.azureSpringCloudDeploymentType
                });
            }
        };
    }

    get default() {
        return {
            insight() {
                statistics.sendSubGenEvent('generator', 'azure-spring-cloud');
            },

            azureSpringCloudAppCreate() {
                if (this.abort) return;
                const done = this.async();
                // TODO
                done();
            },

            copyAzureSpringCloudFiles() {
                if (this.abort) return;
                const done = this.async();
                this.log(chalk.bold('\nCreating Azure Spring Cloud deployment files'));
                this.template('application-azure.yml.ejs', `${constants.SERVER_MAIN_RES_DIR}/config/application-azure.yml`);
                if (this.azureSpringCloudDeploymentType === 'github-action') {
                    this.template('github/workflow/azure-spring-cloud.yml.ejs', '.github/workflow/azure-spring-cloud.yml');
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
            productionBuild() {
                if (this.abort) return;

                const done = this.async();
                this.log(chalk.bold('\nBuilding application'));

                const child = this.buildApplication(this.buildTool, 'prod,azure', false, err => {
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

            productionDeploy() {}
        };
    }
};
