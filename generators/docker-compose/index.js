'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var shelljs = require('shelljs');
var crypto = require('crypto');
var _ = require('lodash');

module.exports = yeoman.generators.Base.extend({
    initializing: {
        printJHipsterLogo: function() {
            this.log(' \n' +
                chalk.green('        ██') + chalk.red('  ██    ██  ████████  ███████    ██████  ████████  ████████  ███████\n') +
                chalk.green('        ██') + chalk.red('  ██    ██     ██     ██    ██  ██          ██     ██        ██    ██\n') +
                chalk.green('        ██') + chalk.red('  ████████     ██     ███████    █████      ██     ██████    ███████\n') +
                chalk.green('  ██    ██') + chalk.red('  ██    ██     ██     ██             ██     ██     ██        ██   ██\n') +
                chalk.green('   ██████ ') + chalk.red('  ██    ██  ████████  ██        ██████      ██     ████████  ██    ██\n'));
            this.log(chalk.white.bold('                            http://jhipster.github.io\n'));
            this.log(chalk.white('Welcome to the JHipster Docker Compose Generator '));
            this.log(chalk.white('Files will be generated in folder: ' + chalk.yellow(this.destinationRoot())));
        },

        checkDocker: function() {
            var done = this.async();

            shelljs.exec('docker -v', {silent:true},function(code, stdout, stderr) {
                if (stderr) {
                    this.log(chalk.yellow.bold('WARNING!') + ' docker is not found on your computer.\n' +
                        '         Read http://docs.docker.com/engine/installation/#installation\n');
                }
                done();
            }.bind(this));
        },

        checkDockerCompose: function() {
            var done = this.async();

            shelljs.exec('docker-compose -v', {silent:true}, function(code, stdout, stderr) {
                if (stderr) {
                    this.log(chalk.yellow.bold('WARNING!') + ' docker-compose is not found on your computer.\n' +
                        '         Read https://docs.docker.com/compose/install/\n');
                }
                done();
            }.bind(this));
        },

        loadConfig: function() {

            this.defaultAppsFolders = this.config.get('appsFolders');
            this.appConfigs = this.config.get('appConfigs');
            this.useElk = this.config.get('useElk');
            this.profile = this.config.get('profile');
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
                message: 'Where are the applications located ?',
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
                                    if(fileData['generator-jhipster'] !== undefined) {
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
                    if(config.applicationType === 'monolith' || this.appsFolders[i]==='jhipster-registry' || this.appsFolders[i] === 'registry') {
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
                message: 'Which applications do you want in your DockerFile ?',
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

        askForProfile: function() {
            if(this.abort) return;
            var done = this.async();

            var choices = ['dev', 'prod'];

            var prompts = [{
                type: 'list',
                name: 'profile',
                message: 'Which profile do you want to use ?',
                choices: choices,
                default: this.profile || 'dev'
            }];

            this.prompt(prompts, function(props) {
                this.profile = props.profile;

                done();
            }.bind(this));
        }
    },

    configuring: {
        checkImages: function() {
            if(this.abort) return;

            this.log('\nChecking Docker images in applications directories...');

            for (var i = 0; i < this.appsFolders.length; i++) {
                var imagePath = this.destinationPath(this.directoryPath + this.appsFolders[i] + '/target/docker/' + _.kebabCase(this.appConfigs[i].baseName) + '-0.0.1-SNAPSHOT.war');
                if (!shelljs.test('-f', imagePath)) {
                    this.log(chalk.red('\nDocker Image not found at ' + imagePath));
                    this.log(chalk.red('Please run "mvn package docker:build" in ' + this.destinationPath(this.directoryPath + this.appsFolders[i]) + ' to generate Docker image'));
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

        saveConfig: function() {
            if(this.abort) return;
            this.config.set('appsFolders', this.appsFolders);
            this.config.set('appConfigs', this.appConfigs);
            this.config.set('useElk', this.useElk);
            this.config.set('profile', this.profile);
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

            this.copy('registry.yml', 'registry.yml');
            this.template('central-server-config/_application.yml', 'central-server-config/application.yml');
        },

        writeElkFiles: function() {
            if(!this.useElk || this.abort) return;

            this.copy('elk.yml', 'elk.yml');
            this.copy('log-monitoring/log-config/logstash.conf', 'log-monitoring/log-config/logstash.conf');
            this.copy('log-monitoring/log-data/.gitignore', 'log-monitoring/log-data/.gitignore');
        }
    },
    end: function() {
        if(this.abort) return;

        this.log('\n' + chalk.bold.green('##### USAGE #####'));
        this.log('First launch the JHipster Registry by running : ' + chalk.cyan('docker-compose up -d jhipster-registry'));
        this.log('Wait a minute, then launch all your applications by running : ' + chalk.cyan('docker-compose up -d'));
    }
});
