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
const _ = require('lodash');
const glob = require('glob');
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
        this.azureSpringCloudResourceGroupName = this.config.get('azureSpringCloudResourceGroupName');
        this.azureSpringCloudServiceName = this.config.get('azureSpringCloudServiceName');
        this.azureSpringCloudAppName = this.config.get('azureSpringCloudAppName');
    }

    get prompting() {
        return {

            getDefaultAzureSpringCloudDefaults() {
                if (this.abort) return;
                const done = this.async();

                exec('az configure --list-defaults true', (err, stdout) => {
                    if (err) {
                        this.config.set({
                            azureSpringCloudResourceGroup: null
                        });
                        this.abort = true;
                        this.log.error(`Could not retrieve your Azure default configuration. Is the Azure CLI installed and configured on your system?`);
                    } else {
                        const json = JSON.parse(stdout);
                        for (const defaultProp in json) {
                            if (json[defaultProp].name === 'group') {
                                this.azureSpringCloudResourceGroup = json[defaultProp].value;
                            }
                            if (json[defaultProp].name === 'spring-cloud') {
                                this.azureSpringCloudServiceName = json[defaultProp].value;
                            }
                        }
                        if (this.azureSpringCloudResourceGroup == null) {
                            this.log.info(`Your default Azure resource group is not set up. We recommend doing it using the command '` +
                            chalk.yellow(`az configure --defaults group=<resource group name>`) + `'`);
                            this.azureSpringCloudResourceGroup = '';
                        }
                        if (this.azureSpringCloudServiceName == null) {
                            this.log.info(`Your default Azure Spring Cloud service name is not set up. We recommend doing it using the command '` +
                            chalk.yellow(`az configure --defaults spring-cloud=<service instance name>`) + `'`);
                            this.azureSpringCloudServiceName = '';
                        }
                    }
                    done();
                });

            },

            askForazureSpringCloudResourceGroup() {
                if (this.abort) return;
                const done = this.async();

                const prompts = [
                    {
                        type: 'input',
                        name: 'azureSpringCloudResourceGroup',
                        message: 'Azure resource group name:',
                        default: this.azureSpringCloudResourceGroup
                    },
                    {
                        type: 'input',
                        name: 'azureSpringCloudServiceName',
                        message: 'Azure Spring Cloud service name:',
                        default: this.azureSpringCloudServiceName
                    }
                ];

                this.prompt(prompts).then(props => {
                    this.azureSpringCloudResourceGroupName = props.azureSpringCloudResourceGroupName;
                    done();
                });
            },

            
        };
    }

    get configuring() {
        return {

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

            },

            copyAzureSpringCloudFiles() {
                if (this.abort) return;
                const done = this.async();
                this.log(chalk.bold('\nCreating Azure Spring Cloud deployment files'));
                this.template('application-azure.yml.ejs', `${constants.SERVER_MAIN_RES_DIR}/config/application-azure.yml`);
                this.conflicter.resolve(err => {
                    done();
                });
            },

            addAzureSpringCloudMavenProfile() {
                if (this.buildTool === 'maven') {
                    this.render('pom-profile.xml.ejs', profile => {
                        this.addMavenProfile('azure', `            ${profile.toString().trim()}`);
                    });
                }
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

            productionDeploy() {
                if (this.abort) return;

            }
        };
    }
};
