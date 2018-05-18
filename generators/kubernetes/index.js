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
const BaseGenerator = require('../generator-base');
const docker = require('../docker-base');

/* Constants used throughout */
const constants = require('../generator-constants');

module.exports = class extends BaseGenerator {
    constructor(args, opts) {
        super(args, opts);

        // This adds support for a `--skip-checks` flag
        this.option('skip-checks', {
            desc: 'Check the status of the required tools',
            type: Boolean,
            defaults: false
        });

        this.skipChecks = this.options['skip-checks'];
    }

    get initializing() {
        return {
            sayHello() {
                this.log(chalk.white(`${chalk.bold('⎈')} Welcome to the JHipster Kubernetes Generator ${chalk.bold('⎈')}`));
                this.log(chalk.white(`Files will be generated in folder: ${chalk.yellow(this.destinationRoot())}`));
            },

            checkDocker: docker.checkDocker,

            checkKubernetes() {
                if (this.skipChecks) return;
                const done = this.async();

                shelljs.exec('kubectl version', { silent: true }, (code, stdout, stderr) => {
                    if (stderr) {
                        this.log(`${chalk.yellow.bold('WARNING!')} kubectl 1.2 or later is not installed on your computer.\n` +
                          'Make sure you have Kubernetes installed. Read http://kubernetes.io/docs/getting-started-guides/binary_release/\n');
                    }
                    done();
                });
            },

            loadConfig() {
                this.defaultAppsFolders = this.config.get('appsFolders');
                this.directoryPath = this.config.get('directoryPath');
                this.clusteredDbApps = this.config.get('clusteredDbApps');
                this.serviceDiscoveryType = this.config.get('serviceDiscoveryType');
                this.adminPassword = this.config.get('adminPassword');
                this.jwtSecretKey = this.config.get('jwtSecretKey');
                this.dockerRepositoryName = this.config.get('dockerRepositoryName');
                this.dockerPushCommand = this.config.get('dockerPushCommand');
                this.kubernetesNamespace = this.config.get('kubernetesNamespace');
                this.monitoring = this.config.get('monitoring');
                this.kubernetesServiceType = this.config.get('kubernetesServiceType');
                this.ingressDomain = this.config.get('ingressDomain');
                this.useKafka = false;

                this.DOCKER_JHIPSTER_REGISTRY = constants.DOCKER_JHIPSTER_REGISTRY;
                this.DOCKER_JHIPSTER_ELASTICSEARCH = constants.DOCKER_JHIPSTER_ELASTICSEARCH;
                this.DOCKER_JHIPSTER_LOGSTASH = constants.DOCKER_JHIPSTER_LOGSTASH;
                this.DOCKER_JHIPSTER_CONSOLE = constants.DOCKER_JHIPSTER_CONSOLE;
                this.DOCKER_JHIPSTER_IMPORT_DASHBOARDS = constants.DOCKER_JHIPSTER_IMPORT_DASHBOARDS;
                this.DOCKER_JHIPSTER_ZIPKIN = constants.DOCKER_JHIPSTER_ZIPKIN;
                this.DOCKER_TRAEFIK = constants.DOCKER_TRAEFIK;
                this.DOCKER_CONSUL = constants.DOCKER_CONSUL;
                this.DOCKER_CONSUL_CONFIG_LOADER = constants.DOCKER_CONSUL_CONFIG_LOADER;
                this.DOCKER_MYSQL = constants.DOCKER_MYSQL;
                this.DOCKER_MARIADB = constants.DOCKER_MARIADB;
                this.DOCKER_POSTGRESQL = constants.DOCKER_POSTGRESQL;
                this.DOCKER_ORACLE = constants.DOCKER_ORACLE;
                this.DOCKER_MONGODB = constants.DOCKER_MONGODB;
                this.DOCKER_COUCHBASE = constants.DOCKER_COUCHBASE;
                this.DOCKER_MEMCACHED = constants.DOCKER_MEMCACHED;
                this.DOCKER_ELASTICSEARCH = constants.DOCKER_ELASTICSEARCH;
                this.DOCKER_KAFKA = constants.DOCKER_KAFKA;
                this.DOCKER_ZOOKEEPER = constants.DOCKER_ZOOKEEPER;
                this.DOCKER_PROMETHEUS_OPERATOR = constants.DOCKER_PROMETHEUS_OPERATOR;
                this.DOCKER_GRAFANA_WATCHER = constants.DOCKER_GRAFANA_WATCHER;
                this.DOCKER_GRAFANA = constants.DOCKER_GRAFANA;

                if (this.defaultAppsFolders !== undefined) {
                    this.log('\nFound .yo-rc.json config file...');
                }
            }
        };
    }

    _getAppFolders(input) {
        const files = shelljs.ls('-l', this.destinationPath(input));
        const appsFolders = [];

        files.forEach((file) => {
            if (file.isDirectory()) {
                if ((shelljs.test('-f', `${file.name}/.yo-rc.json`))
                    && (shelljs.test('-f', `${file.name}/src/main/docker/app.yml`))) {
                    try {
                        const fileData = this.fs.readJSON(`${file.name}/.yo-rc.json`);
                        if (fileData['generator-jhipster'].baseName !== undefined) {
                            appsFolders.push(file.name.match(/([^/]*)\/*$/)[1]);
                        }
                    } catch (err) {
                        this.log(chalk.red(`${file}: this .yo-rc.json can't be read`));
                    }
                }
            }
        });

        return appsFolders;
    }

    get prompting() {
        return {
            askForApplicationType: prompts.askForApplicationType,
            askForPath: prompts.askForPath,
            askForApps: prompts.askForApps,
            askForMonitoring: prompts.askForMonitoring,
            askForClustersMode: prompts.askForClustersMode,
            askForServiceDiscovery: prompts.askForServiceDiscovery,
            askForAdminPassword: prompts.askForAdminPassword,
            askForKubernetesNamespace: prompts.askForKubernetesNamespace,
            askForDockerRepositoryName: prompts.askForDockerRepositoryName,
            askForDockerPushCommand: prompts.askForDockerPushCommand,
            askForKubernetesServiceType: prompts.askForKubernetesServiceType,
            askForIngressDomain: prompts.askForIngressDomain
        };
    }

    get configuring() {
        return {
            insight() {
                const insight = this.insight();
                insight.trackWithEvent('generator', 'kubernetes');
            },

            checkImages: docker.checkImages,
            generateJwtSecret: docker.generateJwtSecret,
            configureImageNames: docker.configureImageNames,
            setAppsFolderPaths: docker.setAppsFolderPaths,

            setPostPromptProp() {
                this.appConfigs.forEach((element) => {
                    element.clusteredDb ? element.dbPeerCount = 3 : element.dbPeerCount = 1;
                    if (element.messageBroker === 'kafka') {
                        this.useKafka = true;
                    }
                });
            },

            saveConfig() {
                this.config.set('appsFolders', this.appsFolders);
                this.config.set('directoryPath', this.directoryPath);
                this.config.set('clusteredDbApps', this.clusteredDbApps);
                this.config.set('serviceDiscoveryType', this.serviceDiscoveryType);
                this.config.set('jwtSecretKey', this.jwtSecretKey);
                this.config.set('dockerRepositoryName', this.dockerRepositoryName);
                this.config.set('dockerPushCommand', this.dockerPushCommand);
                this.config.set('kubernetesNamespace', this.kubernetesNamespace);
                this.config.set('kubernetesServiceType', this.kubernetesServiceType);
                this.config.set('ingressDomain', this.ingressDomain);
                this.config.set('monitoring', this.monitoring);
            }
        };
    }

    get writing() {
        return writeFiles();
    }

    end() {
        if (this.warning) {
            this.log(`\n${chalk.yellow.bold('WARNING!')} Kubernetes configuration generated with missing images!`);
            this.log(this.warningMessage);
        } else {
            this.log(`\n${chalk.bold.green('Kubernetes configuration successfully generated!')}`);
        }

        this.log(`${chalk.yellow.bold('WARNING!')} You will need to push your image to a registry. If you have not done so, use the following commands to tag and push the images:`);
        for (let i = 0; i < this.appsFolders.length; i++) {
            const originalImageName = this.appConfigs[i].baseName.toLowerCase();
            const targetImageName = this.appConfigs[i].targetImageName;
            if (originalImageName !== targetImageName) {
                this.log(`  ${chalk.cyan(`docker image tag ${originalImageName} ${targetImageName}`)}`);
            }
            this.log(`  ${chalk.cyan(`${this.dockerPushCommand} ${targetImageName}`)}`);
        }

        this.log('\nYou can deploy all your apps by running: ');
        this.log(`  ${chalk.cyan(`sh ${this.directoryPath}k8s/kubectl-apply.sh`)}`);
        this.log('OR');
        if (this.kubernetesNamespace !== 'default') {
            this.log(`  ${chalk.cyan(`kubectl apply -f ${this.directoryPath}k8s/namespace.yml`)}`);
        }
        if (this.useKafka === true) {
            this.log(`  ${chalk.cyan(`kubectl apply -f ${this.directoryPath}k8s/messagebroker`)}`);
        }
        if (this.monitoring === 'elk') {
            this.log(`  ${chalk.cyan(`kubectl apply -f ${this.directoryPath}k8s/console`)}`);
        }
        if (this.monitoring === 'prometheus') {
            this.log(`  ${chalk.cyan(`kubectl apply -f ${this.directoryPath}k8s/monitoring`)}`);
        }
        for (let i = 0, regIndex = 0; i < this.appsFolders.length; i++) {
            this.log(`  ${chalk.cyan(`kubectl apply -f ${this.directoryPath}k8s/${this.appConfigs[i].baseName.toLowerCase()}`)}`);
            if (this.appConfigs[i].serviceDiscoveryType !== false && regIndex++ === 0) {
                this.log(`  ${chalk.cyan(`kubectl apply -f ${this.directoryPath}k8s/registry`)}`);
            }
        }
        if (this.gatewayNb + this.monolithicNb >= 1) {
            const namespaceSuffix = this.kubernetesNamespace === 'default' ? '' : ` -n ${this.kubernetesNamespace}`;
            this.log('\nUse these commands to find your application\'s IP addresses:');
            for (let i = 0; i < this.appsFolders.length; i++) {
                if (this.appConfigs[i].applicationType === 'gateway' || this.appConfigs[i].applicationType === 'monolith') {
                    this.log(`  ${chalk.cyan(`kubectl get svc ${this.appConfigs[i].baseName.toLowerCase()}${namespaceSuffix}`)}`);
                }
            }
            this.log();
        }
    }
};
