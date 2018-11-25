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
const jsyaml = require('js-yaml');
const pathjs = require('path');
const prompts = require('./prompts');
const writeFiles = require('./files').writeFiles;
const BaseDockerGenerator = require('../generator-base-docker');
const { loadFromYoRc, checkImages, generateJwtSecret, configureImageNames, setAppsFolderPaths } = require('../docker-base');
const statistics = require('../statistics');

module.exports = class extends BaseDockerGenerator {
    get initializing() {
        return {
            sayHello() {
                this.log(chalk.white(`${chalk.bold('🐮')} [BETA] Welcome to the JHipster Rancher Compose Generator ${chalk.bold('🐮')}`));
                this.log(chalk.white(`Files will be generated in folder: ${chalk.yellow(this.destinationRoot())}`));
            },

            ...super.initializing,

            loadConfig() {
                loadFromYoRc.call(this);
                this.enableRancherLoadBalancing = this.config.get('enableRancherLoadBalancing');
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
            askForRancherLoadBalancing: prompts.askForRancherLoadBalancing,
            askForDockerRepositoryName: prompts.askForDockerRepositoryName,
            askForDockerPushCommand: prompts.askForDockerPushCommand
        };
    }

    get configuring() {
        return {
            insight() {
                statistics.sendSubGenEvent('generator', 'rancher-compose');
            },

            checkImages,
            generateJwtSecret,
            configureImageNames,
            setAppsFolderPaths,

            setAppsYaml() {
                this.appsYaml = [];
                this.frontAppName = '';
                this.hasFrontApp = false;

                let portIndex = 8080;
                this.appsFolders.forEach(function(appsFolder, index) {
                    const appConfig = this.appConfigs[index];
                    const lowercaseBaseName = appConfig.baseName.toLowerCase();
                    const parentConfiguration = {};
                    const path = this.destinationPath(this.directoryPath + appsFolder);

                    // Add application configuration
                    const yaml = jsyaml.load(this.fs.read(`${path}/src/main/docker/app.yml`));
                    const yamlConfig = yaml.services[`${lowercaseBaseName}-app`];

                    if (appConfig.applicationType === 'gateway' || appConfig.applicationType === 'monolith') {
                        const ports = yamlConfig.ports[0].split(':');
                        ports[0] = portIndex;
                        yamlConfig.ports[0] = ports.join(':');
                        portIndex++;

                        // Register gateway of monolith app name
                        this.hasFrontApp = true;
                        this.frontAppPort = ports[0];
                        this.frontAppName = `${lowercaseBaseName}-app`;
                    }

                    // change target image name
                    yamlConfig.image = this.dockerRepositoryName ? `${this.dockerRepositoryName}/${yamlConfig.image}` : yamlConfig.image;

                    // Add monitoring configuration for monolith directly in the docker-compose file as they can't get them from the config server
                    if (this.monitoring === 'elk') {
                        yamlConfig.environment.push('JHIPSTER_LOGGING_LOGSTASH_ENABLED=true');
                        yamlConfig.environment.push('JHIPSTER_LOGGING_LOGSTASH_HOST=jhipster-logstash');
                        yamlConfig.environment.push('JHIPSTER_METRICS_LOGS_ENABLED=true');
                        yamlConfig.environment.push('JHIPSTER_METRICS_LOGS_REPORT_FREQUENCY=60');
                    }

                    if (this.monitoring === 'prometheus') {
                        yamlConfig.environment.push('JHIPSTER_METRICS_PROMETHEUS_ENABLED=true');
                        yamlConfig.environment.push('JHIPSTER_METRICS_PROMETHEUS_ENDPOINT=/prometheusMetrics');
                    }

                    if (this.serviceDiscoveryType === 'eureka') {
                        // Set the JHipster Registry password
                        yamlConfig.environment.push(`JHIPSTER_REGISTRY_PASSWORD=${this.adminPassword}`);
                    }

                    parentConfiguration[`${lowercaseBaseName}-app`] = yamlConfig;

                    // Add database configuration
                    const database = appConfig.prodDatabaseType;
                    if (database !== 'no') {
                        let relativePath = '';
                        const databaseYaml = jsyaml.load(this.fs.read(`${path}/src/main/docker/${database}.yml`));
                        const databaseServiceName = `${lowercaseBaseName}-${database}`;
                        const databaseYamlConfig = databaseYaml.services[databaseServiceName];
                        delete databaseYamlConfig.ports;

                        if (database === 'cassandra') {
                            relativePath = pathjs.relative(this.destinationRoot(), `${path}/src/main/docker`);

                            // node config
                            const cassandraClusterYaml = jsyaml.load(this.fs.read(`${path}/src/main/docker/cassandra-cluster.yml`));
                            const cassandraNodeConfig = cassandraClusterYaml.services[`${databaseServiceName}-node`];
                            parentConfiguration[`${databaseServiceName}-node`] = cassandraNodeConfig;

                            // migration service config
                            const cassandraMigrationYaml = jsyaml.load(this.fs.read(`${path}/src/main/docker/cassandra-migration.yml`));
                            const cassandraMigrationConfig = cassandraMigrationYaml.services[`${databaseServiceName}-migration`];
                            cassandraMigrationConfig.build.context = relativePath;
                            const createKeyspaceScript = cassandraClusterYaml.services[`${databaseServiceName}-migration`].environment[0];
                            cassandraMigrationConfig.environment.push(createKeyspaceScript);
                            const cqlFilesRelativePath = pathjs.relative(this.destinationRoot(), `${path}/src/main/resources/config/cql`);
                            cassandraMigrationConfig.volumes[0] = `${cqlFilesRelativePath}:/cql:ro`;

                            parentConfiguration[`${databaseServiceName}-migration`] = cassandraMigrationConfig;
                        }

                        parentConfiguration[databaseServiceName] = databaseYamlConfig;
                    }

                    // Expose authenticationType
                    this.authenticationType = appConfig.authenticationType;

                    // Add search engine configuration
                    const searchEngine = appConfig.searchEngine;
                    if (searchEngine === 'elasticsearch') {
                        const searchEngineYaml = jsyaml.load(this.fs.read(`${path}/src/main/docker/${searchEngine}.yml`));
                        const searchEngineConfig = searchEngineYaml.services[`${lowercaseBaseName}-${searchEngine}`];
                        delete searchEngineConfig.ports;
                        parentConfiguration[`${lowercaseBaseName}-${searchEngine}`] = searchEngineConfig;
                    }
                    // Add message broker support
                    const messageBroker = appConfig.messageBroker;
                    if (messageBroker === 'kafka') {
                        this.useKafka = true;
                    }
                    // Dump the file
                    let yamlString = jsyaml.dump(parentConfiguration, { indent: 4 });

                    // Fix the output file which is totally broken!!!
                    const yamlArray = yamlString.split('\n');
                    for (let j = 0; j < yamlArray.length; j++) {
                        yamlArray[j] = `    ${yamlArray[j]}`;
                        yamlArray[j] = yamlArray[j].replace(/'/g, '');
                    }
                    yamlString = yamlArray.join('\n');
                    yamlString = yamlString.replace(new RegExp('>-\\n {16}', 'g'), '');
                    this.appsYaml.push(yamlString);
                }, this);
            },

            setAppsRancherYaml() {
                this.appsRancherYaml = [];

                this.appsYaml.forEach(function(appYaml, index) {
                    // Add application configuration
                    const yaml = jsyaml.load(appYaml);
                    const rancherConfiguration = {};

                    Object.keys(yaml).forEach((service, index) => {
                        // Create rancher default configuration for this service
                        rancherConfiguration[service] = { scale: 1 };
                    });

                    // Dump the file
                    let yamlString = jsyaml.dump(rancherConfiguration, { indent: 4 });

                    // Fix the output file which is totally broken!!!
                    const yamlArray = yamlString.split('\n');
                    for (let j = 0; j < yamlArray.length; j++) {
                        yamlArray[j] = `    ${yamlArray[j]}`;
                        yamlArray[j] = yamlArray[j].replace(/'/g, '');
                    }
                    yamlString = yamlArray.join('\n');
                    yamlString = yamlString.replace('>-\n                ', '');
                    yamlString = yamlString.replace('>-\n                ', '');
                    this.appsRancherYaml.push(yamlString);
                }, this);
            },

            saveConfig() {
                this.config.set({
                    appsFolders: this.appsFolders,
                    directoryPath: this.directoryPath,
                    monitoring: this.monitoring,
                    serviceDiscoveryType: this.serviceDiscoveryType,
                    adminPassword: this.adminPassword,
                    jwtSecretKey: this.jwtSecretKey,
                    dockerRepositoryName: this.dockerRepositoryName,
                    dockerPushCommand: this.dockerPushCommand,
                    enableRancherLoadBalancing: this.enableRancherLoadBalancing
                });
            }
        };
    }

    get writing() {
        return writeFiles();
    }

    end() {
        if (this.warning) {
            this.log(`\n${chalk.yellow.bold('WARNING!')} Rancher Compose configuration generated, but no Jib cache found`);
            this.log('If you forgot to generate the Docker image for this application, please run:');
            this.log(chalk.red(this.warningMessage));
        } else {
            this.log(`\n${chalk.bold.green('Rancher Compose configuration successfully generated!')}`);
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
                this.log(chalk.cyan(`docker tag ${originalImageName} ${targetImageName}`));
            }
            this.log(chalk.cyan(`${this.dockerPushCommand} ${targetImageName}`));
        }
    }
};
