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
    jsyaml = require('js-yaml'),
    pathjs = require('path'),
    util = require('util'),
    prompts = require('./prompts'),
    scriptBase = require('../generator-base');

var KubernetesGenerator = generators.Base.extend({});
util.inherits(KubernetesGenerator, scriptBase);

module.exports = KubernetesGenerator.extend({
    constructor: function () {
        generators.Base.apply(this, arguments);
    },

    initializing: {
        sayHello: function() {
            this.log(chalk.white('Welcome to the JHipster Kubernetes Generator '));
            this.log(chalk.white('Files will be generated in folder: ' + chalk.yellow(this.destinationRoot())));
        },

        checkDocker: function() {
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
            var done = this.async();

            shelljs.exec('kubectl version', {silent:true}, function(code, stdout, stderr) {
                if (stderr) {
                    this.log(chalk.yellow.bold('WARNING!') + 'kubectl 1.2 or later is not installed on your computer.\n' +
                      'Make sure you have Kubernetes installed. Read http://kubernetes.io/docs/getting-started-guides/binary_release/\n');
                }
                done();
            }.bind(this));
        },

        loadConfig: function() {
            this.defaultAppsFolders = this.config.get('appsFolders');
            this.directoryPath = this.config.get('directoryPath');
            this.clusteredDbApps = this.config.get('clusteredDbApps');
            this.adminPassword = this.config.get('adminPassword');
            this.jwtSecretKey = this.config.get('jwtSecretKey');
            this.dockerRepositoryName = this.config.get('dockerRepositoryName');
            this.dockerPushCommand = this.config.get('dockerPushCommand');
            this.kubernetesNamespace = this.config.get('kubernetesNamespace');

            if(this.defaultAppsFolders !== undefined) {
                this.log('\nFound .yo-rc.json config file...');
            }
        }
    },

    _getAppFolders: function (input) {
        var files = shelljs.ls('-l', this.destinationPath(input));
        var appsFolders = [];

        files.forEach(function(file) {
            if(file.isDirectory()) {
                if( (shelljs.test('-f', file.name + '/.yo-rc.json'))
                    && (shelljs.test('-f', file.name + '/src/main/docker/app.yml')) ) {
                    try {
                        var fileData = this.fs.readJSON(file.name + '/.yo-rc.json');
                        if(fileData['generator-jhipster'].baseName !== undefined) {
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
        askForPath: prompts.askForPath,

        askForApps: prompts.askForApps,

        askForClustersMode: prompts.askForClustersMode,

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
            this.warningMessage = 'To generate Docker image, please run:\n';
            for (var i = 0; i < this.appsFolders.length; i++) {
                if(this.appConfigs[i].buildTool === 'maven') {
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
            if(this.jwtSecretKey === undefined) {
                this.jwtSecretKey = crypto.randomBytes(20).toString('hex');
            }
        },

        setAppsFolderPaths: function() {
            if(this.applicationType) return;
            this.appsFolderPaths = [];
            for (var i = 0; i < this.appsFolders.length; i++) {
                var path = this.destinationPath(this.directoryPath + this.appsFolders[i]);
                this.appsFolderPaths.push(path);
            }
        },

        setAppsYaml: function() {
            if(this.applicationType) return;
            this.appsYaml = [];

            for (var i = 0; i < this.appsFolders.length; i++) {
                var parentConfiguration = {};
                var path = this.destinationPath(this.directoryPath + this.appsFolders[i]);

                // Add application configuration
                var yaml = jsyaml.load(this.fs.read(path + '/src/main/docker/app.yml'));
                var yamlConfig = yaml.services[this.appConfigs[i].baseName.toLowerCase() + '-app'];

                parentConfiguration[this.appConfigs[i].baseName.toLowerCase() + '-app'] = yamlConfig;

                // Add database configuration
                var database = this.appConfigs[i].prodDatabaseType;
                if (database !== 'no') {
                    var relativePath = '';
                    var databaseYaml = jsyaml.load(this.fs.read(path + '/src/main/docker/' + database + '.yml'));
                    var databaseYamlConfig = databaseYaml.services[this.appConfigs[i].baseName.toLowerCase() + '-' + database];
                    delete databaseYamlConfig.ports;

                    if (database === 'cassandra') {
                        var cassandraDbYaml = jsyaml.load(this.fs.read(path + '/src/main/docker/cassandra-cluster.yml'));
                        relativePath = pathjs.relative(this.destinationRoot(), path + '/src/main/docker');
                        var cassandraConfig = cassandraDbYaml.services[this.appConfigs[i].baseName.toLowerCase() + '-' + database];
                        cassandraConfig.build.context = relativePath;
                        var cassandraNodeConfig = cassandraDbYaml.services[this.appConfigs[i].baseName.toLowerCase() + '-' + database + '-node'];
                        databaseYamlConfig = cassandraDbYaml.services[this.appConfigs[i].baseName.toLowerCase() + '-' + database];
                        delete databaseYamlConfig.ports;
                        parentConfiguration[this.appConfigs[i].baseName.toLowerCase() + '-' + database + '-node'] = cassandraNodeConfig;
                    }

                    if (this.appConfigs[i].clusteredDb) {
                        var clusterDbYaml = jsyaml.load(this.fs.read(path + '/src/main/docker/mongodb-cluster.yml'));
                        relativePath = pathjs.relative(this.destinationRoot(), path + '/src/main/docker');
                        var mongodbNodeConfig = clusterDbYaml.services[this.appConfigs[i].baseName.toLowerCase() + '-' + database + '-node'];
                        var mongoDbConfigSrvConfig = clusterDbYaml.services[this.appConfigs[i].baseName.toLowerCase() + '-' + database + '-config'];
                        mongodbNodeConfig.build.context = relativePath;
                        databaseYamlConfig = clusterDbYaml.services[this.appConfigs[i].baseName.toLowerCase() + '-' + database];
                        delete databaseYamlConfig.ports;
                        parentConfiguration[this.appConfigs[i].baseName.toLowerCase() + '-' + database + '-node'] = mongodbNodeConfig;
                        parentConfiguration[this.appConfigs[i].baseName.toLowerCase() + '-' + database + '-config'] = mongoDbConfigSrvConfig;
                    }

                    parentConfiguration[this.appConfigs[i].baseName.toLowerCase() + '-' + database] = databaseYamlConfig;
                }
                // Add search engine configuration
                var searchEngine = this.appConfigs[i].searchEngine;
                if (searchEngine === 'elasticsearch') {
                    var searchEngineYaml = jsyaml.load(this.fs.read(path + '/src/main/docker/' + searchEngine + '.yml'));
                    var searchEngineConfig = searchEngineYaml.services[this.appConfigs[i].baseName.toLowerCase() + '-' + searchEngine];
                    delete searchEngineConfig.ports;
                    parentConfiguration[this.appConfigs[i].baseName.toLowerCase() + '-' + searchEngine] = searchEngineConfig;
                }
                // Dump the file
                var stringYaml = jsyaml.dump(parentConfiguration, {indent: 4});
                var array = stringYaml.split('\n');
                for (var j = 0; j < array.length; j++) {
                    array[j] = '    ' + array[j];
                    array[j] = array[j].replace(/\'/g, '');
                }
                stringYaml = array.join('\n');
                this.appsYaml.push(stringYaml);
            }
        },

        saveConfig: function() {
            this.config.set('appsFolders', this.appsFolders);
            this.config.set('directoryPath', this.directoryPath);
            this.config.set('clusteredDbApps', this.clusteredDbApps);
            this.config.set('jwtSecretKey', this.jwtSecretKey);
            this.config.set('dockerRepositoryName', this.dockerRepositoryName);
            this.config.set('dockerPushCommand', this.dockerPushCommand);
            this.config.set('kubernetesNamespace', this.kubernetesNamespace);
        }
    },

    writing: {
        writeDeployments: function() {
            for (var i = 0; i < this.appConfigs.length; i++) {
                var appName = this.appConfigs[i].baseName.toLowerCase();
                this.app = this.appConfigs[i];
                this.template('_deployment.yml', appName + '/' + appName + '-deployment.yml');
                this.template('_service.yml', appName + '/' + appName + '-service.yml');

                if (this.app.prodDatabaseType) {
                    this.template('db/_' + this.app.prodDatabaseType + '.yml', appName + '/' + appName + '-' + this.app.prodDatabaseType + '.yml');
                }
              }
        },

        writeRegistryFiles: function() {
            if(this.gatewayNb === 0 && this.microserviceNb === 0) return;
            this.copy('jhipster-registry.yml', 'registry/jhipster-registry.yml');
        }
    },
    end: function() {
        if (this.warning) {
            this.log('\n' + chalk.yellow.bold('WARNING!') + ' Kubernetes configuration generated with missing images!');
            this.log(this.warningMessage);
        } else {
            this.log('\n' + chalk.bold.green('Kubernetes configuration successfully generated!'));
        }

        this.log(chalk.yellow.bold('WARNING!') + ' You will need to push your image to a registry. If you have not not done so, use the following commands to tag and push the images:');
        for (var i = 0; i < this.appsFolders.length; i++) {
            var originalImageName = this.appConfigs[i].baseName.toLowerCase();
            var targetImageName = this.appConfigs[i].targetImageName;
            if (originalImageName !== targetImageName) {
                this.log('  ' + chalk.cyan('docker tag ' + originalImageName + ' ' + targetImageName));
            }
            this.log('  ' + chalk.cyan(this.dockerPushCommand + ' ' + targetImageName));
        }

        this.log('\nYou can deploy all your apps by running: ');
        if (this.gatewayNb >= 1) {
            this.log('  ' + chalk.cyan('kubectl create -f registry'));
        }
        for (var i = 0; i < this.appsFolders.length; i++) {
            this.log('  ' + chalk.cyan('kubectl create -f ' + this.appConfigs[i].baseName));
        }

        if (this.gatewayNb + this.monolithicNb >= 1) {
            this.log('\nUse these commands to find your application\'s IP addresses:');
            for (var i = 0; i < this.appsFolders.length; i++) {
                if(this.appConfigs[i].applicationType === 'gateway' || this.appConfigs[i].applicationType === 'monolith') {
                    this.log('  ' + chalk.cyan('kubectl get svc '+this.appConfigs[i].baseName));
                }
            }
            this.log();
        }
    }
});
