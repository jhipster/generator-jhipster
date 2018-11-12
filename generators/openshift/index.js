/**
 * Copyright 2013-2018 the original author or authors from the JHipster project.
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
const chalk = require('chalk');
const shelljs = require('shelljs');
const prompts = require('./prompts');
const writeFiles = require('./files').writeFiles;
const BaseDockerGenerator = require('../generator-base-docker');
const { loadFromYoRc, checkImages, generateJwtSecret, configureImageNames, setAppsFolderPaths } = require('../docker-base');
const statistics = require('../statistics');

module.exports = class extends BaseDockerGenerator {
    get initializing() {
        return {
            sayHello() {
                this.log(chalk.white(`${chalk.bold('⭕')} [*BETA*] Welcome to the JHipster OpenShift Generator ${chalk.bold('⭕')}`));
                this.log(
                    chalk.white(
                        `Files will be generated in folder: ${chalk.yellow(
                            this.destinationRoot()
                        )} or in the root directory path that you select in the subsequent step`
                    )
                );
            },

            ...super.initializing,

            checkOpenShift() {
                if (this.skipChecks) return;
                const done = this.async();

                shelljs.exec('oc version', { silent: true }, (code, stdout, stderr) => {
                    if (stderr) {
                        this.log(
                            `${chalk.yellow.bold('WARNING!')} oc 1.3 or later is not installed on your computer.\n` +
                                'Make sure you have OpenShift Origin / OpenShift Container Platform and CLI installed. Read' +
                                ' https://github.com/openshift/origin/\n'
                        );
                    }
                    done();
                });
            },

            loadConfig() {
                loadFromYoRc.call(this);
                this.openshiftNamespace = this.config.get('openshiftNamespace');
                this.storageType = this.config.get('storageType');
                this.registryReplicas = this.config.get('registryReplicas');
            }
        };
    }

    get prompting() {
        return {
            askForApplicationType: prompts.askForApplicationType,
            askForPath: prompts.askForPath,
            askForApps: prompts.askForApps,
            askForMonitoring: prompts.askForMonitoring,
            askForServiceDiscovery: prompts.askForServiceDiscovery,
            askForAdminPassword: prompts.askForAdminPassword,
            askForOpenShiftNamespace: prompts.askForOpenShiftNamespace,
            askForStorageType: prompts.askForStorageType,
            askForDockerRepositoryName: prompts.askForDockerRepositoryName,
            askForDockerPushCommand: prompts.askForDockerPushCommand
        };
    }

    get configuring() {
        return {
            insight() {
                statistics.sendSubGenEvent('generator', 'openshift');
            },

            checkImages,
            generateJwtSecret,
            configureImageNames,
            setAppsFolderPaths,

            // place holder for future changes (may be prompt or something else)
            setRegistryReplicas() {
                this.registryReplicas = 2;
            },

            setPostPromptProp() {
                this.appConfigs.some(element => {
                    if (element.messageBroker === 'kafka') {
                        this.useKafka = true;
                        return true;
                    }
                    return false;
                });
            },

            saveConfig() {
                this.config.set({
                    appsFolders: this.appsFolders,
                    directoryPath: this.directoryPath,
                    clusteredDbApps: this.clusteredDbApps,
                    serviceDiscoveryType: this.serviceDiscoveryType,
                    monitoring: this.monitoring,
                    jwtSecretKey: this.jwtSecretKey,
                    dockerRepositoryName: this.dockerRepositoryName,
                    dockerPushCommand: this.dockerPushCommand,
                    openshiftNamespace: this.openshiftNamespace,
                    storageType: this.storageType,
                    registryReplicas: this.registryReplicas
                });
            }
        };
    }

    get writing() {
        return writeFiles();
    }

    end() {
        if (this.warning) {
            this.log(`\n${chalk.yellow.bold('WARNING!')} OpenShift configuration generated, but no Jib cache found`);
            this.log('If you forgot to generate the Docker image for this application, please run:');
            this.log(this.warningMessage);
        } else {
            this.log(`\n${chalk.bold.green('OpenShift configuration successfully generated!')}`);
        }

        this.log(
            `${chalk.yellow.bold(
                'WARNING!'
            )} You will need to push your image to a registry. If you have not done so, use the following commands to tag and push the images:`
        );
        for (let i = 0; i < this.appsFolders.length; i++) {
            const originalImageName = this.appConfigs[i].baseName.toLowerCase();
            const targetImageName = this.appConfigs[i].targetImageName;
            if (originalImageName !== targetImageName) {
                this.log(`  ${chalk.cyan(`docker image tag ${originalImageName} ${targetImageName}`)}`);
            }
            this.log(`  ${chalk.cyan(`${this.dockerPushCommand} ${targetImageName}`)}`);
        }

        this.log('\nYou can deploy all your apps by running: ');
        this.log(`  ${chalk.cyan(`${this.directoryPath}ocp/ocp-apply.sh`)}`);
        this.log('OR');
        this.log(`  ${chalk.cyan(`oc process -f ${this.directoryPath}ocp/registry/scc-config.yml | oc apply -f -`)}`);
        if (this.monitoring === 'elk') {
            this.log(`  ${chalk.cyan(`oc process -f ${this.directoryPath}ocp/monitoring/jhipster-monitoring.yml | oc apply -f -`)}`);
        }
        if (this.monitoring === 'prometheus') {
            this.log(`  ${chalk.cyan(`oc process -f ${this.directoryPath}ocp/monitoring/jhipster-metrics.yml | oc apply -f -`)}`);
        }
        if (this.useKafka === true) {
            this.log(`  ${chalk.cyan(`oc process -f ${this.directoryPath}ocp/messagebroker/kafka.yml | oc apply -f -`)}`);
        }
        for (let i = 0, regIndex = 0; i < this.appsFolders.length; i++) {
            const app = this.appConfigs[i];
            const appName = app.baseName.toLowerCase();
            if (app.searchEngine === 'elasticsearch') {
                this.log(
                    `  ${chalk.cyan(`oc process -f ${this.directoryPath}ocp/${appName}/${appName}-elasticsearch.yml | oc apply -f -`)}`
                );
            }
            if (app.serviceDiscoveryType !== false && regIndex++ === 0) {
                this.log(`  ${chalk.cyan(`oc process -f ${this.directoryPath}ocp/registry/application-configmap.yml | oc apply -f -`)}`);
                if (app.serviceDiscoveryType === 'eureka') {
                    this.log(`  ${chalk.cyan(`oc process -f ${this.directoryPath}ocp/registry/jhipster-registry.yml | oc apply -f -`)}`);
                } else {
                    this.log(`  ${chalk.cyan(`oc process -f ${this.directoryPath}ocp/registry/consul.yml | oc apply -f -`)}`);
                }
            }
            if (app.prodDatabaseType !== 'no') {
                this.log(
                    `  ${chalk.cyan(
                        `oc process -f ${this.directoryPath}ocp/${appName}/${appName}-${app.prodDatabaseType}.yml | oc apply -f -`
                    )}`
                );
            }
            this.log(`  ${chalk.cyan(`oc process -f ${this.directoryPath}ocp/${appName}/${appName}-deployment.yml | oc apply -f -`)}`);
        }

        if (this.gatewayNb + this.monolithicNb >= 1) {
            this.log("\nUse these commands to find your application's IP addresses:");
            for (let i = 0; i < this.appsFolders.length; i++) {
                if (this.appConfigs[i].applicationType === 'gateway' || this.appConfigs[i].applicationType === 'monolith') {
                    this.log(`  ${chalk.cyan(`oc get svc ${this.appConfigs[i].baseName}`)}`);
                }
            }
            this.log();
        }
    }
};
