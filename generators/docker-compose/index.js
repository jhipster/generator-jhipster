'use strict';
var generators = require('yeoman-generator'),
    chalk = require('chalk'),
    shelljs = require('shelljs'),
    crypto = require('crypto'),
    _ = require('lodash'),
    jsyaml = require('js-yaml'),
    pathjs = require('path'),
    util = require('util'),
    scriptBase = require('../generator-base');

var DockerComposeGenerator = generators.Base.extend({});

util.inherits(DockerComposeGenerator, scriptBase);

module.exports = DockerComposeGenerator.extend({
    constructor: function () {
        generators.Base.apply(this, arguments);
    },

    initializing: {
        sayHello: function() {
            this.log(chalk.white('Welcome to the JHipster Docker Compose Sub-Generator '));
            this.log(chalk.white('Files will be generated in folder: ' + chalk.yellow(this.destinationRoot())));
        },

        checkDocker: function() {
            var done = this.async();

            shelljs.exec('docker -v', {silent:true}, function(code, stdout, stderr) {
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
                    if ( composeVersionMajor < 1 || ( composeVersionMajor === 1 && composeVersionMinor < 6 )) {
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
            this.directoryPath = this.config.get('directoryPath');
            this.clusteredDbApps = this.config.get('clusteredDbApps');
            this.useElk = this.config.get('useElk');
            this.adminPassword = this.config.get('adminPassword');
            this.jwtSecretKey = this.config.get('jwtSecretKey');

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
                if( (shelljs.test('-f', input + file.name + '/.yo-rc.json'))
                    && (shelljs.test('-f', input + file.name + '/src/main/docker/app.yml')) ) {
                    try {
                        var fileData = this.fs.readJSON(input + file.name + '/.yo-rc.json');
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
        askForPath: function() {
            if (this.regenerate) return;

            var done = this.async();

            var prompts = [{
                type: 'input',
                name: 'directoryPath',
                message: 'Enter the root directory where your gateway(s) and microservices are located',
                default: this.directoryPath || '../',
                validate: function (input) {
                    var path = this.destinationPath(input);
                    if(shelljs.test('-d', path)) {
                        var appsFolders = this._getAppFolders(input);

                        if(appsFolders.length === 0) {
                            return 'No microservice or gateway found in ' + path;
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

                this.appsFolders = this._getAppFolders(this.directoryPath);

                //Removing registry from appsFolders, using reverse for loop
                for(var i = this.appsFolders.length - 1; i >= 0; i--) {
                    if (this.appsFolders[i] === 'jhipster-registry' || this.appsFolders[i] === 'registry') {
                        this.appsFolders.splice(i,1);
                    }
                }

                this.log(chalk.green(this.appsFolders.length + ' applications found at ' + this.destinationPath(this.directoryPath) + '\n'));

                done();
            }.bind(this));
        },

        askForApps: function() {
            if (this.regenerate) return;

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
                this.gatewayNb = 0;
                this.monolithicNb = 0;
                this.microserviceNb = 0;

                //Loading configs
                this.appsFolders.forEach(function (appFolder) {
                    var path = this.destinationPath(this.directoryPath + appFolder +'/.yo-rc.json');
                    var fileData = this.fs.readJSON(path);
                    var config = fileData['generator-jhipster'];

                    if(config.applicationType === 'monolith') {
                        this.monolithicNb++;
                    } else if(config.applicationType === 'gateway') {
                        this.gatewayNb++;
                    } else if(config.applicationType === 'microservice') {
                        this.microserviceNb++;
                    }

                    this.portsToBind = this.monolithicNb + this.gatewayNb;
                    this.appConfigs.push(config);
                }, this);

                done();
            }.bind(this));
        },

        askForClustersMode: function () {
            if (this.regenerate) return;

            var mongoApps = [];
            this.appConfigs.forEach(function (appConfig, index) {
                if(appConfig.prodDatabaseType === 'mongodb') {
                    mongoApps.push(this.appsFolders[index]);
                }
            }, this);
            if(mongoApps.length===0) return;

            var done = this.async();

            var prompts = [{
                type: 'checkbox',
                name: 'clusteredDbApps',
                message: 'Which applications do you want to use with clustered databases (only available with MongoDB)?',
                choices: mongoApps,
                default: this.clusteredDbApps
            }];

            this.prompt(prompts, function (props) {
                this.clusteredDbApps = props.clusteredDbApps;
                for (var i = 0; i < this.appsFolders.length; i++) {
                    for (var j = 0; j < props.clusteredDbApps.length; j++) {
                        this.appConfigs[i].clusteredDb = this.appsFolders[i] === props.clusteredDbApps[j];
                    }
                }

                done();
            }.bind(this));
        },

        askForElk: function() {
            if (this.regenerate) return;

            var done = this.async();

            var prompts = [{
                type: 'confirm',
                name: 'elk',
                message: 'Do you want the JHipster Console (based on ELK) to monitor your applications?',
                default: this.useElk && true
            }];

            this.prompt(prompts, function(props) {
                this.useElk = props.elk;
                done();
            }.bind(this));
        },

        askForAdminPassword: function() {
            if (this.regenerate) return;

            var done = this.async();

            var prompts = [{
                type: 'input',
                name: 'adminPassword',
                message: 'Enter the admin password used to secure the JHipster Registry',
                default: 'admin',
                validate: function (input) {
                    if(input.length < 5) {
                        return 'The password must have at least 5 characters';
                    } else return true;
                }
            }];

            this.prompt(prompts, function(props) {
                this.adminPassword = props.adminPassword;
                done();
            }.bind(this));
        }
    },

    configuring: {
        insight: function () {
            var insight = this.insight();
            insight.trackWithEvent('generator', 'docker-compose');
        },

        checkImages: function() {

            this.log('\nChecking Docker images in applications\' directories...');

            var imagePath = '';
            var runCommand = '';
            this.warningMessage = 'To generate Docker image, please run:\n';
            this.appsFolders.forEach(function (appsFolder, index) {
                var appConfig = this.appConfigs[index];
                if(appConfig.buildTool === 'maven') {
                    imagePath = this.destinationPath(this.directoryPath + appsFolder + '/target/docker/' + _.kebabCase(appConfig.baseName) + '-*.war');
                    runCommand = './mvnw package -Pprod docker:build';
                } else {
                    imagePath = this.destinationPath(this.directoryPath + appsFolder + '/build/docker/' + _.kebabCase(appConfig.baseName) + '-*.war');
                    runCommand = './gradlew -Pprod bootRepackage buildDocker';
                }
                if (shelljs.ls(imagePath).length === 0) {
                    this.warning = true;
                    this.warningMessage += '  ' + chalk.cyan(runCommand) +  ' in ' + this.destinationPath(this.directoryPath + appsFolder) + '\n';
                }
            }, this);
        },

        generateJwtSecret: function() {
            if(this.jwtSecretKey === undefined) {
                this.jwtSecretKey = crypto.randomBytes(20).toString('hex');
            }
        },

        setAppsFolderPaths: function() {
            this.appsFolderPaths = [];
            this.appsFolders.forEach(function (appsFolder) {
                var path = this.destinationPath(this.directoryPath + appsFolder);
                this.appsFolderPaths.push(path);
            }, this);
        },

        setAppsYaml: function() {
            this.appsYaml = [];

            var portIndex=8080;
            this.appsFolders.forEach(function (appsFolder, index) {
                var appConfig = this.appConfigs[index];
                var lowercaseBaseName = appConfig.baseName.toLowerCase();
                var parentConfiguration = {};
                var path = this.destinationPath(this.directoryPath + appsFolder);

                // Add application configuration
                var yaml = jsyaml.load(this.fs.read(path + '/src/main/docker/app.yml'));
                var yamlConfig = yaml.services[lowercaseBaseName + '-app'];

                if (appConfig.applicationType === 'gateway' || appConfig.applicationType === 'monolith') {
                    var ports = yamlConfig.ports[0].split(':');
                    ports[0] = portIndex;
                    yamlConfig.ports[0] = ports.join(':');
                    portIndex++;
                }

                // Add monitoring configuration for monolith directly in the docker-compose file as they can't get them from the config server
                if (appConfig.applicationType === 'monolith' && this.useElk) {
                    yamlConfig.environment.push('JHIPSTER_LOGGING_LOGSTASH_ENABLED=true');
                    yamlConfig.environment.push('JHIPSTER_LOGGING_LOGSTASH_HOST=elk-logstash');
                    yamlConfig.environment.push('JHIPSTER_METRICS_LOGS_ENABLED=true');
                    yamlConfig.environment.push('JHIPSTER_METRICS_LOGS_REPORT_FREQUENCY=60');
                }

                // Re-configure the JHipster Registry if it is already configured
                var spring_cloud_config_uri_configured = false;
                var eureka_client_serviceurl_defaultzone_configured = false;
                yamlConfig.environment.forEach(function (env, index, envArr) {

                    if (env.startsWith('SPRING_CLOUD_CONFIG_URI')) {
                        envArr[index] = 'SPRING_CLOUD_CONFIG_URI=http://admin:' +
                            this.adminPassword + '@registry:8761/config';
                        spring_cloud_config_uri_configured = true;
                    }
                    if (env.startsWith('EUREKA_CLIENT_SERVICEURL_DEFAULTZONE')) {
                        envArr[index] = 'EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://admin:' +
                            this.adminPassword + '@registry:8761/eureka';
                        eureka_client_serviceurl_defaultzone_configured = true;
                    }
                }, this);
                // Configure the JHipster Registry if it is not already configured
                if (!spring_cloud_config_uri_configured) {
                    yamlConfig.environment.push('SPRING_CLOUD_CONFIG_URI=http://admin:' +
                        this.adminPassword + '@registry:8761/config');
                }
                if (!eureka_client_serviceurl_defaultzone_configured) {
                    yamlConfig.environment.push('EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://admin:' +
                        this.adminPassword + '@registry:8761/eureka');
                }

                parentConfiguration[lowercaseBaseName + '-app'] = yamlConfig;

                // Add database configuration
                var database = appConfig.prodDatabaseType;
                if (database !== 'no') {
                    var relativePath = '';
                    var databaseYaml = jsyaml.load(this.fs.read(path + '/src/main/docker/' + database + '.yml'));
                    var databaseYamlConfig = databaseYaml.services[lowercaseBaseName + '-' + database];
                    delete databaseYamlConfig.ports;

                    if (database === 'cassandra') {
                        var cassandraDbYaml = jsyaml.load(this.fs.read(path + '/src/main/docker/cassandra-cluster.yml'));
                        relativePath = pathjs.relative(this.destinationRoot(), path + '/src/main/docker');
                        var cassandraConfig = cassandraDbYaml.services[lowercaseBaseName + '-' + database];
                        cassandraConfig.build.context = relativePath;
                        var cassandraNodeConfig = cassandraDbYaml.services[lowercaseBaseName + '-' + database + '-node'];
                        databaseYamlConfig = cassandraDbYaml.services[lowercaseBaseName + '-' + database];
                        delete databaseYamlConfig.ports;
                        parentConfiguration[lowercaseBaseName + '-' + database + '-node'] = cassandraNodeConfig;
                    }

                    if (appConfig.clusteredDb) {
                        var clusterDbYaml = jsyaml.load(this.fs.read(path + '/src/main/docker/mongodb-cluster.yml'));
                        relativePath = pathjs.relative(this.destinationRoot(), path + '/src/main/docker');
                        var mongodbNodeConfig = clusterDbYaml.services[lowercaseBaseName + '-' + database + '-node'];
                        var mongoDbConfigSrvConfig = clusterDbYaml.services[lowercaseBaseName + '-' + database + '-config'];
                        mongodbNodeConfig.build.context = relativePath;
                        databaseYamlConfig = clusterDbYaml.services[lowercaseBaseName + '-' + database];
                        delete databaseYamlConfig.ports;
                        parentConfiguration[lowercaseBaseName + '-' + database + '-node'] = mongodbNodeConfig;
                        parentConfiguration[lowercaseBaseName + '-' + database + '-config'] = mongoDbConfigSrvConfig;
                    }

                    parentConfiguration[lowercaseBaseName + '-' + database] = databaseYamlConfig;
                }
                // Add search engine configuration
                var searchEngine = appConfig.searchEngine;
                if (searchEngine === 'elasticsearch') {
                    var searchEngineYaml = jsyaml.load(this.fs.read(path + '/src/main/docker/' + searchEngine + '.yml'));
                    var searchEngineConfig = searchEngineYaml.services[lowercaseBaseName + '-' + searchEngine];
                    delete searchEngineConfig.ports;
                    parentConfiguration[lowercaseBaseName + '-' + searchEngine] = searchEngineConfig;
                }
                // Dump the file
                var yamlString = jsyaml.dump(parentConfiguration, {indent: 4});

                // Fix the output file which is totally broken!!!
                var yamlArray = yamlString.split('\n');
                for (var j = 0; j < yamlArray.length; j++) {
                    yamlArray[j] = '    ' + yamlArray[j];
                    yamlArray[j] = yamlArray[j].replace(/\'/g, '');
                }
                yamlString = yamlArray.join('\n');
                yamlString = yamlString.replace('>-\n                ', '');
                yamlString = yamlString.replace('>-\n                ', '');
                this.appsYaml.push(yamlString);
            }, this);
        },

        saveConfig: function() {
            this.config.set('appsFolders', this.appsFolders);
            this.config.set('directoryPath', this.directoryPath);
            this.config.set('clusteredDbApps', this.clusteredDbApps);
            this.config.set('useElk', this.useElk);
            this.config.set('adminPassword', this.adminPassword);
            this.config.set('jwtSecretKey', this.jwtSecretKey);
        }
    },

    writing: {
        writeDockerCompose: function() {
            this.template('_docker-compose.yml', 'docker-compose.yml');
        },

        writeRegistryFiles: function() {
            if(this.gatewayNb === 0 && this.microserviceNb === 0) return;

            this.template('_jhipster-registry.yml', 'jhipster-registry.yml');
            this.template('central-server-config/_application.yml', 'central-server-config/application.yml');
        },

        writeElkFiles: function() {
            if(!this.useElk) return;

            this.copy('elk.yml', 'elk.yml');
            this.copy('log-monitoring/log-config/logstash.conf', 'log-monitoring/log-config/logstash.conf');
            this.copy('log-monitoring/log-data/gitignore', 'log-monitoring/log-data/.gitignore');
        }
    },
    end: function() {
        if (this.warning) {
            this.log('\n' + chalk.yellow.bold('WARNING!') + ' Docker Compose configuration generated with missing images!');
            this.log(this.warningMessage);
        } else {
            this.log('\n' + chalk.bold.green('Docker Compose configuration successfully generated!'));
        }
        this.log('You can launch all your infrastructure by running : ' + chalk.cyan('docker-compose up -d'));
        if (this.gatewayNb + this.monolithicNb > 1) {
            this.log('\nYour applications will be accessible on these URLs:');
            var portIndex = 8080;
            this.appConfigs.forEach(function (appConfig) {
                if(appConfig.applicationType === 'gateway' || appConfig.applicationType === 'monolith') {
                    this.log('\t- ' + appConfig.baseName + ':' + ' http://localhost:'+ portIndex);
                    portIndex++;
                }
            }, this);
            this.log('\n');
        }
    }
});
