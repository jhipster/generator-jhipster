/**
 * Copyright 2013-2017 the original author or authors from the JHipster project.
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
const generator = require('yeoman-generator');
const chalk = require('chalk');
const shelljs = require('shelljs');
const util = require('util');
const prompts = require('./prompts');
const writeFiles = require('./files').writeFiles;
const BaseGenerator = require('../generator-base');
const docker = require('../docker-base');

const KubernetesGenerator = generator.extend({});
util.inherits(KubernetesGenerator, BaseGenerator);

/* Constants used throughout */
const constants = require('../generator-constants');

module.exports = KubernetesGenerator.extend({
    constructor: function (...args) { // eslint-disable-line object-shorthand
        generator.apply(this, args);

        // This adds support for a `--skip-checks` flag
        this.option('skip-checks', {
            desc: 'Check the status of the required tools',
            type: Boolean,
            defaults: false
        });

        this.skipChecks = this.options['skip-checks'];
    },

    initializing: {
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
            this.jhipsterConsole = this.config.get('jhipsterConsole');
            this.prometheusOperator = this.config.get('prometheusOperator');
            this.kubernetesServiceType = this.config.get('kubernetesServiceType');
            this.ingressDomain = this.config.get('ingressDomain');

            this.DOCKER_JHIPSTER_REGISTRY = constants.DOCKER_JHIPSTER_REGISTRY;
            this.DOCKER_JHIPSTER_ELASTICSEARCH = constants.DOCKER_JHIPSTER_ELASTICSEARCH;
            this.DOCKER_JHIPSTER_LOGSTASH = constants.DOCKER_JHIPSTER_LOGSTASH;
            this.DOCKER_JHIPSTER_CONSOLE = constants.DOCKER_JHIPSTER_CONSOLE;
            this.DOCKER_CONSUL = constants.DOCKER_CONSUL;
            this.DOCKER_CONSUL_CONFIG_LOADER = constants.DOCKER_CONSUL_CONFIG_LOADER;
            this.DOCKER_MYSQL = constants.DOCKER_MYSQL;
            this.DOCKER_MARIADB = constants.DOCKER_MARIADB;
            this.DOCKER_POSTGRESQL = constants.DOCKER_POSTGRESQL;
            this.DOCKER_ORACLE = constants.DOCKER_ORACLE;
            this.DOCKER_MONGODB = constants.DOCKER_MONGODB;
            this.DOCKER_ELASTICSEARCH = constants.DOCKER_ELASTICSEARCH;
            this.DOCKER_KAFKA = constants.DOCKER_KAFKA;
            this.DOCKER_ZOOKEEPER = constants.DOCKER_ZOOKEEPER;

            if (this.defaultAppsFolders !== undefined) {
                this.log('\nFound .yo-rc.json config file...');
            }
        }
    },

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
    },

    prompting: {
        askForApplicationType: prompts.askForApplicationType,
        askForPath: prompts.askForPath,
        askForApps: prompts.askForApps,
        // cluster for mongodb: it can be done later
        // askForClustersMode: prompts.askForClustersMode,
        askForServiceDiscovery: prompts.askForServiceDiscovery,
        askForAdminPassword: prompts.askForAdminPassword,
        askForKubernetesNamespace: prompts.askForKubernetesNamespace,
        askForDockerRepositoryName: prompts.askForDockerRepositoryName,
        askForDockerPushCommand: prompts.askForDockerPushCommand,
        askForJhipsterConsole: prompts.askForJhipsterConsole,
        askForPrometheusOperator: prompts.askForPrometheusOperator,
        askForKubernetesServiceType: prompts.askForKubernetesServiceType,
        askForIngressDomain: prompts.askForIngressDomain
    },

    configuring: {
        insight() {
            const insight = this.insight();
            insight.trackWithEvent('generator', 'kubernetes');
        },

        checkImages: docker.checkImages,
        generateJwtSecret: docker.generateJwtSecret,
        configureImageNames: docker.configureImageNames,
        setAppsFolderPaths: docker.setAppsFolderPaths,

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
        }
    },

    writing: writeFiles(),

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
        if (this.kubernetesNamespace !== 'default') {
            this.log(`  ${chalk.cyan('kubectl apply -f namespace.yml')}`);
        }
        if (this.jhipsterConsole) {
            this.log(`  ${chalk.cyan('kubectl apply -f console')}`);
        }
        if (this.prometheusOperator) {
            this.log(`  ${chalk.cyan('kubectl apply -f prometheus-tpr.yml')}`);
        }
        if (this.gatewayNb >= 1 || this.microserviceNb >= 1) {
            this.log(`  ${chalk.cyan('kubectl apply -f registry')}`);
        }
        for (let i = 0; i < this.appsFolders.length; i++) {
            this.log(`  ${chalk.cyan(`kubectl apply -f ${this.appConfigs[i].baseName.toLowerCase()}`)}`);
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
});
