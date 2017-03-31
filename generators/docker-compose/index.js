const generator = require('yeoman-generator');
const chalk = require('chalk');
const shelljs = require('shelljs');
const crypto = require('crypto');
const _ = require('lodash');
const jsyaml = require('js-yaml');
const pathjs = require('path');
const util = require('util');
const prompts = require('./prompts');
const writeFiles = require('./files').writeFiles;
const BaseGenerator = require('../generator-base');

const DockerComposeGenerator = generator.extend({});

util.inherits(DockerComposeGenerator, BaseGenerator);

const constants = require('../generator-constants');

module.exports = DockerComposeGenerator.extend({
    constructor: function (...args) { // eslint-disable-line object-shorthand
        generator.apply(this, args);
    },

    initializing: {
        sayHello() {
            this.log(chalk.white(`${chalk.bold('🐳')}  Welcome to the JHipster Docker Compose Sub-Generator ${chalk.bold('🐳')}`));
            this.log(chalk.white(`Files will be generated in folder: ${chalk.yellow(this.destinationRoot())}`));
        },

        setupServerconsts() {
            // Make constants available in templates
            this.DOCKER_KAFKA = constants.DOCKER_KAFKA;
            this.DOCKER_ZOOKEEPER = constants.DOCKER_ZOOKEEPER;
            this.DOCKER_JHIPSTER_REGISTRY = constants.DOCKER_JHIPSTER_REGISTRY;
            this.DOCKER_JHIPSTER_CONSOLE = constants.DOCKER_JHIPSTER_CONSOLE;
            this.DOCKER_JHIPSTER_ELASTICSEARCH = constants.DOCKER_JHIPSTER_ELASTICSEARCH;
            this.DOCKER_JHIPSTER_LOGSTASH = constants.DOCKER_JHIPSTER_LOGSTASH;
            this.DOCKER_JHIPSTER_ZIPKIN = constants.DOCKER_JHIPSTER_ZIPKIN;
            this.DOCKER_CONSUL = constants.DOCKER_CONSUL;
            this.DOCKER_CONSUL_CONFIG_LOADER = constants.DOCKER_CONSUL_CONFIG_LOADER;
            this.DOCKER_PROMETHEUS = constants.DOCKER_PROMETHEUS;
            this.DOCKER_PROMETHEUS_ALERTMANAGER = constants.DOCKER_PROMETHEUS_ALERTMANAGER;
            this.DOCKER_GRAFANA = constants.DOCKER_GRAFANA;
        },

        checkDocker() {
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
            this.defaultAppsFolders = this.config.get('appsFolders');
            this.directoryPath = this.config.get('directoryPath');
            this.clusteredDbApps = this.config.get('clusteredDbApps');
            this.monitoring = this.config.get('monitoring');
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
    },

    prompting: {
        askForApplicationType: prompts.askForApplicationType,
        askForPath: prompts.askForPath,
        askForApps: prompts.askForApps,
        askForClustersMode: prompts.askForClustersMode,
        askForMonitoring: prompts.askForMonitoring,
        askForServiceDiscovery: prompts.askForServiceDiscovery,
        askForAdminPassword: prompts.askForAdminPassword
    },

    configuring: {
        insight() {
            const insight = this.insight();
            insight.trackWithEvent('generator', 'docker-compose');
        },

        checkImages() {
            this.log('\nChecking Docker images in applications\' directories...');

            let imagePath = '';
            let runCommand = '';
            this.warning = false;
            this.warningMessage = 'To generate the missing Docker image(s), please run:\n';
            this.appsFolders.forEach((appsFolder, index) => {
                const appConfig = this.appConfigs[index];
                if (appConfig.buildTool === 'maven') {
                    imagePath = this.destinationPath(`${this.directoryPath + appsFolder}/target/docker/${_.kebabCase(appConfig.baseName)}-*.war`);
                    runCommand = './mvnw package -Pprod docker:build';
                } else {
                    imagePath = this.destinationPath(`${this.directoryPath + appsFolder}/build/docker/${_.kebabCase(appConfig.baseName)}-*.war`);
                    runCommand = './gradlew -Pprod bootRepackage buildDocker';
                }
                if (shelljs.ls(imagePath).length === 0) {
                    this.warning = true;
                    this.warningMessage += `  ${chalk.cyan(runCommand)} in ${this.destinationPath(this.directoryPath + appsFolder)}\n`;
                }
            });
        },

        generateJwtSecret() {
            if (this.jwtSecretKey === undefined) {
                this.jwtSecretKey = crypto.randomBytes(20).toString('hex');
            }
        },

        setAppsFolderPaths() {
            this.appsFolderPaths = [];
            this.appsFolders.forEach((appsFolder) => {
                const path = this.destinationPath(this.directoryPath + appsFolder);
                this.appsFolderPaths.push(path);
            });
        },

        setAppsYaml() {
            this.appsYaml = [];

            let portIndex = 8080;
            this.appsFolders.forEach((appsFolder, index) => {
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
                }

                // Add monitoring configuration for monolith directly in the docker-compose file as they can't get them from the config server
                if (appConfig.applicationType === 'monolith' && this.monitoring === 'elk') {
                    yamlConfig.environment.push('SPRING_ZIPKIN_ENABLED=true');
                    yamlConfig.environment.push('SPRING_ZIPKIN_BASE_URL=http://jhipster-zipkin:9411');
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
                    let databaseYamlConfig = databaseYaml.services[databaseServiceName];
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

                    if (appConfig.clusteredDb) {
                        const clusterDbYaml = jsyaml.load(this.fs.read(`${path}/src/main/docker/mongodb-cluster.yml`));
                        relativePath = pathjs.relative(this.destinationRoot(), `${path}/src/main/docker`);
                        const mongodbNodeConfig = clusterDbYaml.services[`${databaseServiceName}-node`];
                        const mongoDbConfigSrvConfig = clusterDbYaml.services[`${databaseServiceName}-config`];
                        mongodbNodeConfig.build.context = relativePath;
                        databaseYamlConfig = clusterDbYaml.services[databaseServiceName];
                        delete databaseYamlConfig.ports;
                        parentConfiguration[`${databaseServiceName}-node`] = mongodbNodeConfig;
                        parentConfiguration[`${databaseServiceName}-config`] = mongoDbConfigSrvConfig;
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
                yamlString = yamlString.replace('>-\n                ', '');
                yamlString = yamlString.replace('>-\n                ', '');
                this.appsYaml.push(yamlString);
            });
        },

        saveConfig() {
            this.config.set('appsFolders', this.appsFolders);
            this.config.set('directoryPath', this.directoryPath);
            this.config.set('clusteredDbApps', this.clusteredDbApps);
            this.config.set('monitoring', this.monitoring);
            this.config.set('serviceDiscoveryType', this.serviceDiscoveryType);
            this.config.set('adminPassword', this.adminPassword);
            this.config.set('jwtSecretKey', this.jwtSecretKey);
        }
    },

    writing: writeFiles(),

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
});
