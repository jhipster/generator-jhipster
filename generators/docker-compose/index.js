'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var shelljs = require('shelljs');
var crypto = require('crypto');
var _ = require('lodash');
var jsyaml = require('js-yaml');
var pathjs = require('path');


module.exports = yeoman.Base.extend({
    initializing: {
        sayHello: function() {
            this.log(chalk.white('Welcome to the JHipster Docker Compose Sub-Generator '));
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
                    if ( dockerVersionMajor < 1 || ( dockerVersionMajor == 1 && dockerVersionMinor < 10 )) {
                        this.log(chalk.yellow.bold('WARNING!') + ' Docker version 1.10.0 or later is not installed on your computer.\n' +
                            '         Docker version found: ' + dockerVersion + '\n' +
                            '         Read http://docs.docker.com/engine/installation/#installation\n');
                    }
                }
                done();
            }.bind(this));
        },

        checkDockerCompose: function() {
            var done = this.async();

            shelljs.exec('docker-compose -v', {silent:true}, function(code, stdout, stderr) {
                if (stderr) {
                    this.log(chalk.yellow.bold('WARNING!') + ' Docker Compose 1.6.0 or later is not installed on your computer.\n' +
                        '         Read https://docs.docker.com/compose/install/\n');
                } else {
                    var composeVersion = stdout.split(' ')[2].replace(/,/g, '');
                    var composeVersionMajor = composeVersion.split('.')[0];
                    var composeVersionMinor = composeVersion.split('.')[1];
                    if ( composeVersionMajor < 1 || ( composeVersionMajor == 1 && composeVersionMinor < 6 )) {
                        this.log(chalk.yellow.bold('WARNING!') + ' Docker Compose version 1.6.0 or later is not installed on your computer.\n' +
                            '         Docker Compose version found: ' + composeVersion + '\n' +
                            '         Read https://docs.docker.com/compose/install/\n');
                    }
                }
                done();
            }.bind(this));
        },

        loadConfig: function() {

            this.defaultAppsFolders = this.config.get('appsFolders');
            this.useElk = this.config.get('useElk');
            this.jwtSecretKey = this.config.get('jwtSecretKey');

            if(this.defaultAppsFolders !== undefined) {
                this.regenerate = true;
                this.log('\nFound .yo-rc.json config file...');
            }
        }
    },

    prompting: {
        askForPath: function() {
            var done = this.async();

            var prompts = [{
                type: 'input',
                name: 'directoryPath',
                message: 'Enter the root directory where your gateway(s) and microservices are located',
                default: '../',
                validate: function (input) {
                    var path = this.destinationPath(input);
                    if(shelljs.test('-d', path)) {
                        var files = shelljs.ls('-l',this.destinationPath(input));
                        this.appsFolders = [];

                        files.forEach(function(file) {
                            if(file.isDirectory()) {
                                if(shelljs.test('-f', file.name + '/.yo-rc.json')) {
                                    var fileData = this.fs.readJSON(file.name + '/.yo-rc.json');
                                    if(fileData['generator-jhipster'].baseName !== undefined) {
                                        this.appsFolders.push(file.name.match(/([^\/]*)\/*$/)[1]);
                                    }
                                }
                            }
                        }, this);

                        if(this.appsFolders.length === 0) {
                            return 'No microservice or gateway found in ' + this.destinationPath(input);
                        } else {
                            return true;
                        }
                    } else {
                        return path + ' is not a directory or doesn\'t exist';
                    }
                }.bind(this)
            }];

            this.prompt(prompts, function (props) {
                this.directoryPath = props.directoryPath;

                //Removing monolithic apps and registry from appsFolders
                for(var i = 0; i < this.appsFolders.length; i++) {
                    var path = this.destinationPath(this.directoryPath + this.appsFolders[i]+'/.yo-rc.json');
                    var fileData = this.fs.readJSON(path);
                    var config = fileData['generator-jhipster'];
                    if (config.applicationType === 'monolith' || this.appsFolders[i]==='jhipster-registry' || this.appsFolders[i] === 'registry') {
                        this.appsFolders.splice(i,1);
                        i--;
                    }
                }

                this.log(chalk.green(this.appsFolders.length + ' applications found at ' + this.destinationPath(this.directoryPath) + '\n'));

                done();
            }.bind(this));
        },

        askForApps: function() {
            if(this.abort) return;
            var done = this.async();

            var prompts = [{
                type: 'checkbox',
                name: 'chosenApps',
                message: 'Which applications do you want to include in your Docker Compose configuration?',
                choices: this.appsFolders,
                default: this.defaultAppsFolders,
                validate: function (input) {
                    if(input.length === 0) {
                        return 'Please choose at least one application';
                    } else return true;
                }
            }];

            this.prompt(prompts, function (props) {
                this.appsFolders = props.chosenApps;

                this.appConfigs = [];

                //Loading configs
                for(var i = 0; i < this.appsFolders.length; i++) {
                    var path = this.destinationPath(this.directoryPath + this.appsFolders[i]+'/.yo-rc.json');
                    var fileData = this.fs.readJSON(path);
                    var config = fileData['generator-jhipster'];
                    this.appConfigs.push(config);
                }

                done();
            }.bind(this));
        },

        askForElk: function() {
            if(this.abort) return;
            var done = this.async();

            var prompts = [{
                type: 'confirm',
                name: 'elk',
                message: 'Do you want ELK to monitor your applications ?',
                default: this.useElk && true
            }];

            this.prompt(prompts, function(props) {
                this.useElk = props.elk;

                done();
            }.bind(this));
        },
    },

    configuring: {
        checkImages: function() {
            if(this.abort) return;

            this.log('\nChecking Docker images in applications\' directories...');

            for (var i = 0; i < this.appsFolders.length; i++) {
                if(this.appConfigs[i].buildTool === 'maven') {
                    var imagePath = this.destinationPath(this.directoryPath + this.appsFolders[i] + '/target/docker/' + _.kebabCase(this.appConfigs[i].baseName) + '-*.war');
                    var runCommand = './mvnw package -Pprod docker:build';
                } else {
                    var imagePath = this.destinationPath(this.directoryPath + this.appsFolders[i] + '/build/docker/' + _.kebabCase(this.appConfigs[i].baseName) + '-*.war');
                    var runCommand = './gradlew -Pprod bootRepackage buildDocker';
                }
                if (shelljs.ls(imagePath).length == 0) {
                    this.log(chalk.red('\nDocker Image not found at ' + imagePath));
                    this.log(chalk.red('Please run "' + runCommand + '" in ' + this.destinationPath(this.directoryPath + this.appsFolders[i]) + ' to generate Docker image'));
                    this.abort = true;
                }
            }

            if(!this.abort) this.log(chalk.green('Found Docker images, writing files...\n'));
        },

        generateJwtSecret: function() {
            if(this.jwtSecretKey === undefined) {
                this.jwtSecretKey = crypto.randomBytes(20).toString('hex');
            }
        },

        setAppsFolderPaths: function() {
            this.appsFolderPaths = [];
            for (var i = 0; i < this.appsFolders.length; i++) {
                var path = this.destinationPath(this.directoryPath + this.appsFolders[i]);
                this.appsFolderPaths.push(path);
            }
        },

        setAppsYaml: function() {
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
                if (database != 'no') {
                    var databaseYaml = jsyaml.load(this.fs.read(path + '/src/main/docker/' + database + '.yml'));
                    var databaseYamlConfig = databaseYaml.services[this.appConfigs[i].baseName.toLowerCase() + '-' + database];
                    delete databaseYamlConfig.ports;
                    if(this.appConfigs[i].devDatabaseType === 'cassandra') {
                        var relativePath = pathjs.relative(this.destinationRoot(), path + '/src/main/docker');
                        databaseYamlConfig.build.context = relativePath;
                    }
                    parentConfiguration[this.appConfigs[i].baseName.toLowerCase() + '-' + database] = databaseYamlConfig;
                }
                // Add search engine configuration
                var searchEngine = this.appConfigs[i].searchEngine;
                if (searchEngine != 'no') {
                    var searchEngineYaml = jsyaml.load(this.fs.read(path + '/src/main/docker/' + searchEngine + '.yml'));
                    var searchEngineConfig = searchEngineYaml.services[this.appConfigs[i].baseName.toLowerCase() + '-' + searchEngine];
                    delete searchEngineConfig.ports;
                    parentConfiguration[this.appConfigs[i].baseName.toLowerCase() + '-' + searchEngine] = searchEngineConfig;
                }
                // Dump the file
                var stringYaml = jsyaml.dump(parentConfiguration, {indent: 4});
                var array = stringYaml.split("\n");
                for (var j = 0; j < array.length; j++) {
                    array[j] = "    " + array[j];
                    array[j] = array[j].replace(/\'/g, '');
                }
                stringYaml = array.join("\n");
                this.appsYaml.push(stringYaml);
            }
        },

        saveConfig: function() {
            if(this.abort) return;
            this.config.set('appsFolders', this.appsFolders);
            this.config.set('useElk', this.useElk);
            this.config.set('jwtSecretKey', this.jwtSecretKey);
        }
    },

    writing: {
        writeDockerCompose: function() {
            if(this.abort) return;

            this.template('_docker-compose.yml', 'docker-compose.yml');
        },

        writeRegistryFiles: function() {
            if(this.abort) return;

            this.copy('jhipster-registry.yml', 'jhipster-registry.yml');
            this.template('central-server-config/_application.yml', 'central-server-config/application.yml');
        },

        writeElkFiles: function() {
            if(!this.useElk || this.abort) return;

            this.copy('elk.yml', 'elk.yml');
            this.copy('log-monitoring/log-config/logstash.conf', 'log-monitoring/log-config/logstash.conf');
            this.copy('log-monitoring/log-data/gitignore', 'log-monitoring/log-data/.gitignore');
        }
    },
    end: function() {
        if(this.abort) return;

        this.log('\n' + chalk.bold.green('Docker Compose configuration successfully generated!'));
        this.log('You can launch all your infrastructure by running : ' + chalk.cyan('docker-compose up -d'));
    }
});
