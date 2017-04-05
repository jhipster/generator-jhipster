const generators = require('yeoman-generator');
const chalk = require('chalk');
const shelljs = require('shelljs');
const crypto = require('crypto');
const _ = require('lodash');
const jsyaml = require('js-yaml');
const pathjs = require('path');
const util = require('util');
const prompts = require('./prompts');
const writeFiles = require('./files').writeFiles;
const scriptBase = require('../generator-base');

const RancherGenerator = generators.extend({});

util.inherits(RancherGenerator, scriptBase);

/* Constants used throughout */
const constants = require('../generator-constants');

module.exports = RancherGenerator.extend({
    constructor: function (...args) { // eslint-disable-line object-shorthand
        generators.apply(this, args);

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
            this.log(chalk.white(`${chalk.bold('🐮')} [BETA] Welcome to the JHipster Rancher Compose Generator ${chalk.bold('🐮')}`));
            this.log(chalk.white(`Files will be generated in folder: ${chalk.yellow(this.destinationRoot())}`));
        },

        setupServerVars() {
            // Make constants available in templates
            this.DOCKER_KAFKA = constants.DOCKER_KAFKA;
            this.DOCKER_ZOOKEEPER = constants.DOCKER_ZOOKEEPER;
            this.DOCKER_JHIPSTER_REGISTRY = constants.DOCKER_JHIPSTER_REGISTRY;
            this.DOCKER_JHIPSTER_CONSOLE = constants.DOCKER_JHIPSTER_CONSOLE;
            this.DOCKER_JHIPSTER_ELASTICSEARCH = constants.DOCKER_JHIPSTER_ELASTICSEARCH;
            this.DOCKER_JHIPSTER_LOGSTASH = constants.DOCKER_JHIPSTER_LOGSTASH;
            this.DOCKER_CONSUL = constants.DOCKER_CONSUL;
            this.DOCKER_CONSUL_CONFIG_LOADER = constants.DOCKER_CONSUL_CONFIG_LOADER;
            this.DOCKER_PROMETHEUS = constants.DOCKER_PROMETHEUS;
            this.DOCKER_PROMETHEUS_ALERTMANAGER = constants.DOCKER_PROMETHEUS_ALERTMANAGER;
            this.DOCKER_GRAFANA = constants.DOCKER_GRAFANA;
        },

        checkDocker() {
            if (this.skipChecks) return;
            const done = this.async();

            shelljs.exec('docker -v', { silent: true }, (code, stdout, stderr) => {
                if (stderr) {
                    this.log(chalk.red('Docker version 1.10.0 or later is not installed on your computer.\n' +
                        '         Read http://docs.docker.com/engine/installation/#installation\n'));
                } else {
                    const dockerVersion = stdout.split(' ')[2].replace(/,/g, '');
                    const dockerVersionMajor = dockerVersion.split('.')[0];
                    const dockerVersionMinor = dockerVersion.split('.')[1];
                    if (dockerVersionMajor < 1 || (dockerVersionMajor === 1 && dockerVersionMinor < 10)) {
                        this.log(chalk.red(`${'Docker version 1.10.0 or later is not installed on your computer.\n' +
                            '         Docker version found: '}${dockerVersion}\n` +
                            '         Read http://docs.docker.com/engine/installation/#installation\n'));
                    }
                }
                done();
            });
        },

        loadConfig() {
            this.defaultAppsFolders = this.config.get('appsFolders');
            this.directoryPath = this.config.get('directoryPath');
            this.monitoring = this.config.get('monitoring');
            this.useKafka = false;
            this.serviceDiscoveryType = this.config.get('serviceDiscoveryType');
            if (this.serviceDiscoveryType === undefined) {
                this.serviceDiscoveryType = 'eureka';
            }
            this.adminPassword = this.config.get('adminPassword');
            this.jwtSecretKey = this.config.get('jwtSecretKey');
            this.dockerRepositoryName = this.config.get('dockerRepositoryName');
            this.dockerPushCommand = this.config.get('dockerPushCommand');
            this.enableRancherLoadBalancing = this.config.get('enableRancherLoadBalancing');

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
        askForMonitoring: prompts.askForMonitoring,
        askForServiceDiscovery: prompts.askForServiceDiscovery,
        askForAdminPassword: prompts.askForAdminPassword,
        askForRancherLoadBalancing: prompts.askForRancherLoadBalancing,
        askForDockerRepositoryName: prompts.askForDockerRepositoryName,
        askForDockerPushCommand: prompts.askForDockerPushCommand
    },

    configuring: {
        insight() {
            const insight = this.insight();
            insight.trackWithEvent('generator', 'rancher-compose');
        },

        checkImages() {
            this.log('\nChecking Docker images in applications\' directories...');

            let imagePath = '';
            let runCommand = '';
            this.warning = false;
            this.warningMessage = 'To generate Docker image, please run:\n';
            for (let i = 0; i < this.appsFolders.length; i++) {
                if (this.appConfigs[i].buildTool === 'maven') {
                    imagePath = this.destinationPath(`${this.directoryPath + this.appsFolders[i]}/target/docker/${_.kebabCase(this.appConfigs[i].baseName)}-*.war`);
                    runCommand = './mvnw package -Pprod docker:build';
                } else {
                    imagePath = this.destinationPath(`${this.directoryPath + this.appsFolders[i]}/build/docker/${_.kebabCase(this.appConfigs[i].baseName)}-*.war`);
                    runCommand = './gradlew -Pprod bootRepackage buildDocker';
                }
                if (shelljs.ls(imagePath).length === 0) {
                    this.warning = true;
                    this.warningMessage += `  ${chalk.cyan(runCommand)} in ${this.destinationPath(this.directoryPath + this.appsFolders[i])}\n`;
                }
            }
        },

        configureImageNames() {
            for (let i = 0; i < this.appsFolders.length; i++) {
                const originalImageName = this.appConfigs[i].baseName.toLowerCase();
                const targetImageName = this.dockerRepositoryName ? `${this.dockerRepositoryName}/${originalImageName}` : originalImageName;
                this.appConfigs[i].targetImageName = targetImageName;
            }
        },

        generateJwtSecret() {
            if (this.jwtSecretKey === undefined) {
                this.jwtSecretKey = crypto.randomBytes(20).toString('hex');
            }
        },

        setAppsFolderPaths() {
            if (this.applicationType) return;
            this.appsFolderPaths = [];
            for (let i = 0; i < this.appsFolders.length; i++) {
                const path = this.destinationPath(this.directoryPath + this.appsFolders[i]);
                this.appsFolderPaths.push(path);
            }
        },

        setAppsYaml() {
            this.appsYaml = [];
            this.frontAppName = '';
            this.hasFrontApp = false;

            let portIndex = 8080;
            this.appsFolders.forEach(function (appsFolder, index) {
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

            this.appsYaml.forEach(function (appYaml, index) {
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
            this.config.set('appsFolders', this.appsFolders);
            this.config.set('directoryPath', this.directoryPath);
            this.config.set('monitoring', this.monitoring);
            this.config.set('serviceDiscoveryType', this.serviceDiscoveryType);
            this.config.set('adminPassword', this.adminPassword);
            this.config.set('jwtSecretKey', this.jwtSecretKey);
            this.config.set('dockerRepositoryName', this.dockerRepositoryName);
            this.config.set('dockerPushCommand', this.dockerPushCommand);
            this.config.set('enableRancherLoadBalancing', this.enableRancherLoadBalancing);
        }
    },

    writing: writeFiles(),

    end() {
        if (this.warning) {
            this.log('\n');
            this.log(chalk.red('Rancher Compose configuration generated with missing images!'));
            this.log(chalk.red(this.warningMessage));
        } else {
            this.log(`\n${chalk.bold.green('Rancher Compose configuration successfully generated!')}`);
        }

        this.log(`${chalk.yellow.bold('WARNING!')} You will need to push your image to a registry. If you have not done so, use the following commands to tag and push the images:`);
        for (let i = 0; i < this.appsFolders.length; i++) {
            const originalImageName = this.appConfigs[i].baseName.toLowerCase();
            const targetImageName = this.appConfigs[i].targetImageName;
            if (originalImageName !== targetImageName) {
                this.log(chalk.cyan(`docker tag ${originalImageName} ${targetImageName}`));
            }
            this.log(chalk.cyan(`${this.dockerPushCommand} ${targetImageName}`));
        }
    }
});
