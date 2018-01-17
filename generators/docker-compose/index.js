/**
 * Copyright 2013-2018 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see http://www.jhipster.tech/
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
const jsyaml = require('js-yaml');
const pathjs = require('path');
const prompts = require('./prompts');
const writeFiles = require('./files').writeFiles;
const BaseGenerator = require('../generator-base');
const docker = require('../docker-base');

const constants = require('../generator-constants');

module.exports = class extends BaseGenerator {
    get initializing() {
        return {
            sayHello() {
                this.log(chalk.white(`${chalk.bold('🐳')}  Welcome to the JHipster Docker Compose Sub-Generator ${chalk.bold('🐳')}`));
                this.log(chalk.white(`Files will be generated in folder: ${chalk.yellow(this.destinationRoot())}`));
            },

            setupServerConsts() {
                // Make constants available in templates
                this.DOCKER_KAFKA = constants.DOCKER_KAFKA;
                this.DOCKER_ZOOKEEPER = constants.DOCKER_ZOOKEEPER;
                this.DOCKER_JHIPSTER_REGISTRY = constants.DOCKER_JHIPSTER_REGISTRY;
                this.DOCKER_JHIPSTER_CONSOLE = constants.DOCKER_JHIPSTER_CONSOLE;
                this.DOCKER_JHIPSTER_CURATOR = constants.DOCKER_JHIPSTER_CURATOR;
                this.DOCKER_JHIPSTER_ELASTICSEARCH = constants.DOCKER_JHIPSTER_ELASTICSEARCH;
                this.DOCKER_JHIPSTER_LOGSTASH = constants.DOCKER_JHIPSTER_LOGSTASH;
                this.DOCKER_JHIPSTER_IMPORT_DASHBOARDS = constants.DOCKER_JHIPSTER_IMPORT_DASHBOARDS;
                this.DOCKER_JHIPSTER_ZIPKIN = constants.DOCKER_JHIPSTER_ZIPKIN;
                this.DOCKER_KEYCLOAK = constants.DOCKER_KEYCLOAK;
                this.DOCKER_TRAEFIK = constants.DOCKER_TRAEFIK;
                this.DOCKER_CONSUL = constants.DOCKER_CONSUL;
                this.DOCKER_CONSUL_CONFIG_LOADER = constants.DOCKER_CONSUL_CONFIG_LOADER;
                this.DOCKER_PROMETHEUS = constants.DOCKER_PROMETHEUS;
                this.DOCKER_PROMETHEUS_ALERTMANAGER = constants.DOCKER_PROMETHEUS_ALERTMANAGER;
                this.DOCKER_GRAFANA = constants.DOCKER_GRAFANA;
                this.DOCKER_COMPOSE_FORMAT_VERSION = constants.DOCKER_COMPOSE_FORMAT_VERSION;
            },

            checkDocker: docker.checkDocker,

            checkDockerCompose() {
                const done = this.async();

                shelljs.exec('docker-compose -v', { silent: true }, (code, stdout, stderr) => {
                    if (stderr) {
                        this.log(chalk.red('Docker Compose 1.6.0 or later is not installed on your computer.\n' +
                            '         Read https://docs.docker.com/compose/install/\n'));
                    } else {
                        const composeVersion = stdout.split(' ')[2].replace(/,/g, '');
                        const composeVersionMajor = composeVersion.split('.')[0];
                        const composeVersionMinor = composeVersion.split('.')[1];
                        if (composeVersionMajor < 1 || (composeVersionMajor === 1 && composeVersionMinor < 6)) {
                            this.log(chalk.red(`${'Docker Compose version 1.6.0 or later is not installed on your computer.\n' +
                                '         Docker Compose version found: '}${composeVersion}\n` +
                                '         Read https://docs.docker.com/compose/install/\n'));
                        }
                    }
                    done();
                });
            },

            loadConfig() {
                this.authenticationType = this.config.get('authenticationType');
                this.defaultAppsFolders = this.config.get('appsFolders');
                this.directoryPath = this.config.get('directoryPath');
                this.gatewayType = this.config.get('gatewayType');
                this.clusteredDbApps = this.config.get('clusteredDbApps');
                this.monitoring = this.config.get('monitoring');
                this.consoleOptions = this.config.get('consoleOptions');
                this.useKafka = false;
                this.serviceDiscoveryType = this.config.get('serviceDiscoveryType');
                if (this.serviceDiscoveryType === undefined) {
                    this.serviceDiscoveryType = 'eureka';
                }
                this.adminPassword = this.config.get('adminPassword');
                this.jwtSecretKey = this.config.get('jwtSecretKey');

                if (this.defaultAppsFolders !== undefined) {
                    this.log('\nFound .yo-rc.json config file...');
                }
            }
        };
    }

    get prompting() {
        return {
            askForApplicationType: prompts.askForApplicationType,
            askForGatewayType: prompts.askForGatewayType,
            askForPath: prompts.askForPath,
            askForApps: prompts.askForApps,
            askForClustersMode: prompts.askForClustersMode,
            askForMonitoring: prompts.askForMonitoring,
            askForConsoleOptions: prompts.askForConsoleOptions,
            askForServiceDiscovery: prompts.askForServiceDiscovery,
            askForAdminPassword: prompts.askForAdminPassword
        };
    }

    get configuring() {
        return {
            insight() {
                const insight = this.insight();
                insight.trackWithEvent('generator', 'docker-compose');
            },

            checkImages: docker.checkImages,
            generateJwtSecret: docker.generateJwtSecret,
            setAppsFolderPaths: docker.setAppsFolderPaths,

            setAppsYaml() {
                this.appsYaml = [];
                this.keycloakRedirectUri = '';
                let portIndex = 8080;
                this.appsFolders.forEach((appsFolder, index) => {
                    const appConfig = this.appConfigs[index];
                    const lowercaseBaseName = appConfig.baseName.toLowerCase();
                    const parentConfiguration = {};
                    const path = this.destinationPath(this.directoryPath + appsFolder);
                    // Add application configuration
                    const yaml = jsyaml.load(this.fs.read(`${path}/src/main/docker/app.yml`));
                    const yamlConfig = yaml.services[`${lowercaseBaseName}-app`];
                    if (this.gatewayType === 'traefik' && appConfig.applicationType === 'gateway') {
                        delete yamlConfig.ports; // Do not export the ports as Traefik is the gateway
                    } else if (appConfig.applicationType === 'gateway' || appConfig.applicationType === 'monolith') {
                        this.keycloakRedirectUri += `"http://localhost:${portIndex}/*", `;
                        const ports = yamlConfig.ports[0].split(':');
                        ports[0] = portIndex;
                        yamlConfig.ports[0] = ports.join(':');
                        portIndex++;
                    }

                    // Add monitoring configuration for monolith directly in the docker-compose file as they can't get them from the config server
                    if (appConfig.applicationType === 'monolith' && this.monitoring === 'elk') {
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
                        const relativePath = pathjs.relative(this.destinationRoot(), `${path}/src/main/docker`);
                        const databaseYaml = jsyaml.load(this.fs.read(`${path}/src/main/docker/${database}.yml`));
                        const databaseServiceName = `${lowercaseBaseName}-${database}`;
                        let databaseYamlConfig = databaseYaml.services[databaseServiceName];
                        delete databaseYamlConfig.ports;

                        if (database === 'cassandra') {
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

                        if (database === 'couchbase') {
                            databaseYamlConfig.build.context = relativePath;
                        }

                        if (appConfig.clusteredDb) {
                            const clusterDbYaml = jsyaml.load(this.fs.read(`${path}/src/main/docker/${database}-cluster.yml`));
                            const dbNodeConfig = clusterDbYaml.services[`${databaseServiceName}-node`];
                            dbNodeConfig.build.context = relativePath;
                            databaseYamlConfig = clusterDbYaml.services[databaseServiceName];
                            delete databaseYamlConfig.ports;
                            if (database === 'couchbase') {
                                databaseYamlConfig.build.context = relativePath;
                            }
                            parentConfiguration[`${databaseServiceName}-node`] = dbNodeConfig;
                            if (database === 'mongodb') {
                                parentConfiguration[`${databaseServiceName}-config`] = clusterDbYaml.services[`${databaseServiceName}-config`];
                            }
                        }

                        parentConfiguration[databaseServiceName] = databaseYamlConfig;
                    }
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
                    // Expose authenticationType
                    this.authenticationType = appConfig.authenticationType;

                    // Dump the file
                    let yamlString = jsyaml.dump(parentConfiguration, { indent: 4 });

                    // Fix the output file which is totally broken!!!
                    const yamlArray = yamlString.split('\n');
                    for (let j = 0; j < yamlArray.length; j++) {
                        yamlArray[j] = `    ${yamlArray[j]}`;
                        yamlArray[j] = yamlArray[j].replace(/'/g, '');
                    }
                    yamlString = yamlArray.join('\n');
                    yamlString = yamlString.replace(/>-\n/g, '');
                    yamlString = yamlString.replace(/-\s\s+/g, '- ');
                    this.appsYaml.push(yamlString);
                });
            },

            saveConfig() {
                this.config.set('appsFolders', this.appsFolders);
                this.config.set('directoryPath', this.directoryPath);
                this.config.set('gatewayType', this.gatewayType);
                this.config.set('clusteredDbApps', this.clusteredDbApps);
                this.config.set('monitoring', this.monitoring);
                this.config.set('consoleOptions', this.consoleOptions);
                this.config.set('serviceDiscoveryType', this.serviceDiscoveryType);
                this.config.set('adminPassword', this.adminPassword);
                this.config.set('jwtSecretKey', this.jwtSecretKey);
            }
        };
    }

    get writing() {
        return writeFiles();
    }

    end() {
        if (this.warning) {
            this.log('\n');
            this.log(chalk.red('Docker Compose configuration generated with missing images!'));
            this.log(chalk.red(this.warningMessage));
        } else {
            this.log(`\n${chalk.bold.green('Docker Compose configuration successfully generated!')}`);
        }
        this.log(`You can launch all your infrastructure by running : ${chalk.cyan('docker-compose up -d')}`);
        if (this.gatewayNb + this.monolithicNb > 1) {
            this.log('\nYour applications will be accessible on these URLs:');
            let portIndex = 8080;
            this.appConfigs.forEach((appConfig) => {
                if (appConfig.applicationType === 'gateway' || appConfig.applicationType === 'monolith') {
                    this.log(`\t- ${appConfig.baseName}: http://localhost:${portIndex}`);
                    portIndex++;
                }
            });
            this.log('\n');
        }
    }
};
