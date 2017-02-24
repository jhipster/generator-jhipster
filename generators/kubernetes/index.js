/*
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';
var generators = require('yeoman-generator'),
    chalk = require('chalk'),
    shelljs = require('shelljs'),
    crypto = require('crypto'),
    _ = require('lodash'),
    util = require('util'),
    prompts = require('./prompts'),
    writeFiles = require('./files').writeFiles,
    scriptBase = require('../generator-base');

var KubernetesGenerator = generators.Base.extend({});
util.inherits(KubernetesGenerator, scriptBase);

/* Constants used throughout */
const constants = require('../generator-constants');

module.exports = KubernetesGenerator.extend({
    constructor: function () {
        generators.Base.apply(this, arguments);

        // This adds support for a `--skip-checks` flag
        this.option('skip-checks', {
            desc: 'Check the status of the required tools',
            type: Boolean,
            defaults: false
        });

        this.skipChecks = this.options['skip-checks'];
    },

    initializing: {
        sayHello: function() {
            this.log(chalk.white(chalk.bold('⎈') + ' [BETA] Welcome to the JHipster Kubernetes Generator ' + chalk.bold('⎈')));
            this.log(chalk.white('Files will be generated in folder: ' + chalk.yellow(this.destinationRoot())));
        },

        checkDocker: function() {
            if (this.skipChecks) return;
            var done = this.async();

            shelljs.exec('docker -v', {silent:true},function(code, stdout, stderr) {
                if (stderr) {
                    this.log(chalk.yellow.bold('WARNING!') + ' Docker version 1.10.0 or later is not installed on your computer.\n' +
                        '         Read http://docs.docker.com/engine/installation/#installation\n');
                } else {
                    var dockerVersion = stdout.split(' ')[2].replace(/,/g, '');
                    var dockerVersionMajor = dockerVersion.split('.')[0];
                    var dockerVersionMinor = dockerVersion.split('.')[1];
                    if ( dockerVersionMajor < 1 || ( dockerVersionMajor === 1 && dockerVersionMinor < 10 )) {
                        this.log(chalk.yellow.bold('WARNING!') + ' Docker version 1.10.0 or later is not installed on your computer.\n' +
                            '         Docker version found: ' + dockerVersion + '\n' +
                            '         Read http://docs.docker.com/engine/installation/#installation\n');
                    }
                }
                done();
            }.bind(this));
        },

        checkKubernetes: function() {
            if (this.skipChecks) return;
            var done = this.async();

            shelljs.exec('kubectl version', {silent:true}, function(code, stdout, stderr) {
                if (stderr) {
                    this.log(chalk.yellow.bold('WARNING!') + ' kubectl 1.2 or later is not installed on your computer.\n' +
                      'Make sure you have Kubernetes installed. Read http://kubernetes.io/docs/getting-started-guides/binary_release/\n');
                }
                done();
            }.bind(this));
        },

        loadConfig: function() {
            this.defaultAppsFolders = this.config.get('appsFolders');
            this.directoryPath = this.config.get('directoryPath');
            this.clusteredDbApps = this.config.get('clusteredDbApps');
            this.serviceDiscoveryType = this.config.get('serviceDiscoveryType');
            this.adminPassword = this.config.get('adminPassword');
            this.jwtSecretKey = this.config.get('jwtSecretKey');
            this.dockerRepositoryName = this.config.get('dockerRepositoryName');
            this.dockerPushCommand = this.config.get('dockerPushCommand');
            this.kubernetesNamespace = this.config.get('kubernetesNamespace');

            this.DOCKER_JHIPSTER_REGISTRY = constants.DOCKER_JHIPSTER_REGISTRY;
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

    _getAppFolders: function (input) {
        var files = shelljs.ls('-l', this.destinationPath(input));
        var appsFolders = [];

        files.forEach(function(file) {
            if (file.isDirectory()) {
                if ((shelljs.test('-f', file.name + '/.yo-rc.json'))
                    && (shelljs.test('-f', file.name + '/src/main/docker/app.yml'))) {
                    try {
                        var fileData = this.fs.readJSON(file.name + '/.yo-rc.json');
                        if (fileData['generator-jhipster'].baseName !== undefined) {
                            appsFolders.push(file.name.match(/([^\/]*)\/*$/)[1]);
                        }
                    } catch(err) {
                        this.log(chalk.red(file + ': this .yo-rc.json can\'t be read'));
                    }
                }
            }
        }, this);

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

        askForDockerPushCommand: prompts.askForDockerPushCommand
    },

    configuring: {
        insight: function () {
            var insight = this.insight();
            insight.trackWithEvent('generator', 'kubernetes');
        },

        checkImages: function() {
            this.log('\nChecking Docker images in applications\' directories...');

            var imagePath = '';
            var runCommand = '';
            this.warning = false;
            this.warningMessage = 'To generate Docker image, please run:\n';
            for (var i = 0; i < this.appsFolders.length; i++) {
                if (this.appConfigs[i].buildTool === 'maven') {
                    imagePath = this.destinationPath(this.directoryPath + this.appsFolders[i] + '/target/docker/' + _.kebabCase(this.appConfigs[i].baseName) + '-*.war');
                    runCommand = './mvnw package -Pprod docker:build';
                } else {
                    imagePath = this.destinationPath(this.directoryPath + this.appsFolders[i] + '/build/docker/' + _.kebabCase(this.appConfigs[i].baseName) + '-*.war');
                    runCommand = './gradlew -Pprod bootRepackage buildDocker';
                }
                if (shelljs.ls(imagePath).length === 0) {
                    this.warning = true;
                    this.warningMessage += '  ' + chalk.cyan(runCommand) +  ' in ' + this.destinationPath(this.directoryPath + this.appsFolders[i]) + '\n';
                }
            }
        },

        configureImageNames: function() {
            for (var i = 0; i < this.appsFolders.length; i++) {
                var originalImageName = this.appConfigs[i].baseName.toLowerCase();
                var targetImageName = this.dockerRepositoryName ? this.dockerRepositoryName + '/' + originalImageName : originalImageName;
                this.appConfigs[i].targetImageName = targetImageName;
            }
        },

        generateJwtSecret: function() {
            if (this.jwtSecretKey === undefined) {
                this.jwtSecretKey = crypto.randomBytes(20).toString('hex');
            }
        },

        setAppsFolderPaths: function() {
            if (this.applicationType) return;
            this.appsFolderPaths = [];
            for (var i = 0; i < this.appsFolders.length; i++) {
                var path = this.destinationPath(this.directoryPath + this.appsFolders[i]);
                this.appsFolderPaths.push(path);
            }
        },

        saveConfig: function() {
            this.config.set('appsFolders', this.appsFolders);
            this.config.set('directoryPath', this.directoryPath);
            this.config.set('clusteredDbApps', this.clusteredDbApps);
            this.config.set('serviceDiscoveryType', this.serviceDiscoveryType);
            this.config.set('jwtSecretKey', this.jwtSecretKey);
            this.config.set('dockerRepositoryName', this.dockerRepositoryName);
            this.config.set('dockerPushCommand', this.dockerPushCommand);
            this.config.set('kubernetesNamespace', this.kubernetesNamespace);
        }
    },

    writing: writeFiles(),

    end: function() {
        if (this.warning) {
            this.log('\n' + chalk.yellow.bold('WARNING!') + ' Kubernetes configuration generated with missing images!');
            this.log(this.warningMessage);
        } else {
            this.log('\n' + chalk.bold.green('Kubernetes configuration successfully generated!'));
        }

        this.log(chalk.yellow.bold('WARNING!') + ' You will need to push your image to a registry. If you have not done so, use the following commands to tag and push the images:');
        for (var i = 0; i < this.appsFolders.length; i++) {
            var originalImageName = this.appConfigs[i].baseName.toLowerCase();
            var targetImageName = this.appConfigs[i].targetImageName;
            if (originalImageName !== targetImageName) {
                this.log('  ' + chalk.cyan('docker image tag ' + originalImageName + ' ' + targetImageName));
            }
            this.log('  ' + chalk.cyan(this.dockerPushCommand + ' ' + targetImageName));
        }

        this.log('\nYou can deploy all your apps by running: ');
        if (this.gatewayNb >= 1 || this.microserviceNb >= 1) {
            this.log('  ' + chalk.cyan('kubectl apply -f registry'));
        }
        for (i = 0; i < this.appsFolders.length; i++) {
            this.log('  ' + chalk.cyan('kubectl apply -f ' + this.appConfigs[i].baseName));
        }

        if (this.gatewayNb + this.monolithicNb >= 1) {
            this.log('\nUse these commands to find your application\'s IP addresses:');
            for (i = 0; i < this.appsFolders.length; i++) {
                if(this.appConfigs[i].applicationType === 'gateway' || this.appConfigs[i].applicationType === 'monolith') {
                    this.log('  ' + chalk.cyan('kubectl get svc '+this.appConfigs[i].baseName));
                }
            }
            this.log();
        }
    }
});
