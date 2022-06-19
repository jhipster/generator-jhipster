/**
 * Copyright 2013-2022 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
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
const normalize = require('normalize-path');

const BaseDockerGenerator = require('../generator-base-docker');
const { INITIALIZING_PRIORITY, PROMPTING_PRIORITY, CONFIGURING_PRIORITY, LOADING_PRIORITY, PREPARING_PRIORITY, WRITING_PRIORITY } =
  require('../../lib/constants/priorities.cjs').compat;

const writeFiles = require('./files').writeFiles;
const { GATEWAY, MONOLITH } = require('../../jdl/jhipster/application-types');
const { PROMETHEUS } = require('../../jdl/jhipster/monitoring-types');
const { EUREKA } = require('../../jdl/jhipster/service-discovery-types');
const { CASSANDRA, COUCHBASE, MONGODB, ORACLE, NO: NO_DATABASE } = require('../../jdl/jhipster/database-types');
const { ELASTICSEARCH } = require('../../jdl/jhipster/search-engine-types');
const { KAFKA } = require('../../jdl/jhipster/message-broker-types');
const { MEMCACHED, REDIS } = require('../../jdl/jhipster/cache-types');
const { GENERATOR_DOCKER_COMPOSE } = require('../generator-list');

/* eslint-disable consistent-return */
module.exports = class extends BaseDockerGenerator {
  async _postConstruct() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints(GENERATOR_DOCKER_COMPOSE);
    }
  }

  _initializing() {
    return {
      ...super._initializing(),

      checkDockerCompose() {
        if (this.skipChecks) return;

        const done = this.async();

        shelljs.exec('docker-compose -v', { silent: true }, (code, stdout, stderr) => {
          if (stderr) {
            this.log(
              chalk.red(
                'Docker Compose 1.6.0 or later is not installed on your computer.\n' +
                  '         Read https://docs.docker.com/compose/install/\n'
              )
            );
          } else {
            const composeVersion = stdout.split(' ')[2].replace(/,/g, '');
            const composeVersionMajor = composeVersion.split('.')[0];
            const composeVersionMinor = composeVersion.split('.')[1];
            if (composeVersionMajor < 1 || (composeVersionMajor === 1 && composeVersionMinor < 6)) {
              this.log(
                chalk.red(
                  `$Docker Compose version 1.6.0 or later is not installed on your computer.
                                             Docker Compose version found: ${composeVersion}
                                             Read https://docs.docker.com/compose/install`
                )
              );
            }
          }
          done();
        });
      },
    };
  }

  get [INITIALIZING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._initializing();
  }

  _prompting() {
    return super._prompting();
  }

  get [PROMPTING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._prompting();
  }

  _configuring() {
    return {
      sayHello() {
        this.log(chalk.white(`${chalk.bold('🐳')}  Welcome to the JHipster Docker Compose Sub-Generator ${chalk.bold('🐳')}`));
        this.log(chalk.white(`Files will be generated in folder: ${chalk.yellow(this.destinationRoot())}`));
      },

      ...super._configuring(),

      saveConfig() {
        this.config.set({
          appsFolders: this.appsFolders,
          directoryPath: this.directoryPath,
          gatewayType: this.gatewayType,
          clusteredDbApps: this.clusteredDbApps,
          monitoring: this.monitoring,
          serviceDiscoveryType: this.serviceDiscoveryType,
          jwtSecretKey: this.jwtSecretKey,
        });
      },
    };
  }

  get [CONFIGURING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._configuring();
  }

  _preparing() {
    return {
      loadConfig() {
        this.usesOauth2 = this.appConfigs.some(appConfig => appConfig.authenticationTypeOauth2);
        this.useKafka = this.appConfigs.some(appConfig => appConfig.messageBroker === KAFKA);
        this.entryPort = 8080;
      },

      setAppsYaml() {
        this.appsYaml = [];
        this.keycloakRedirectUris = '';
        this.appConfigs.forEach(appConfig => {
          const lowercaseBaseName = appConfig.baseName.toLowerCase();
          const parentConfiguration = {};
          const path = this.destinationPath(this.directoryPath + appConfig.appFolder);
          // Add application configuration
          const yaml = jsyaml.load(this.fs.read(`${path}/src/main/docker/app.yml`));
          const yamlConfig = yaml.services[`${lowercaseBaseName}-app`];
          if (appConfig.applicationType === GATEWAY || appConfig.applicationType === MONOLITH) {
            this.keycloakRedirectUris += `"http://localhost:${appConfig.composePort}/*", "https://localhost:${appConfig.composePort}/*", `;
            if (appConfig.devServerPort !== undefined) {
              this.keycloakRedirectUris += `"http://localhost:${appConfig.devServerPort}/*", `;
            }
            // Split ports by ":" and take last 2 elements to skip the hostname/IP if present
            const ports = yamlConfig.ports[0].split(':').slice(-2);
            ports[0] = appConfig.composePort;
            yamlConfig.ports[0] = ports.join(':');
          }

          if (appConfig.applicationType === MONOLITH && this.monitoring === PROMETHEUS) {
            yamlConfig.environment.push('JHIPSTER_LOGGING_LOGSTASH_ENABLED=false');
            yamlConfig.environment.push('MANAGEMENT_METRICS_EXPORT_PROMETHEUS_ENABLED=true');
          }

          if (this.serviceDiscoveryType === EUREKA) {
            // Set the JHipster Registry password
            yamlConfig.environment.push(`JHIPSTER_REGISTRY_PASSWORD=${this.adminPassword}`);
          }

          if (!this.serviceDiscoveryType && appConfig.skipClient) {
            yamlConfig.environment.push('SERVER_PORT=80'); // to simplify service resolution in docker/k8s
          }

          parentConfiguration[`${lowercaseBaseName}`] = yamlConfig;

          // Add database configuration
          const database = appConfig.databaseTypeSql ? appConfig.prodDatabaseType : appConfig.databaseType;
          if (database !== NO_DATABASE && database !== ORACLE) {
            const relativePath = normalize(pathjs.relative(this.destinationRoot(), `${path}/src/main/docker`));
            const databaseYaml = jsyaml.load(this.fs.read(`${path}/src/main/docker/${database}.yml`));
            const databaseServiceName = `${lowercaseBaseName}-${database}`;
            let databaseYamlConfig = databaseYaml.services[databaseServiceName];
            // Don't export database ports
            delete databaseYamlConfig.ports;

            if (database === CASSANDRA) {
              // migration service config
              const cassandraMigrationConfig = databaseYaml.services[`${databaseServiceName}-migration`];

              // replace script with prod
              cassandraMigrationConfig.environment = [
                ...cassandraMigrationConfig.environment.filter(envVariable => !envVariable.includes('CREATE_KEYSPACE_SCRIPT=')),
                'CREATE_KEYSPACE_SCRIPT=create-keyspace-prod.cql',
              ];
              cassandraMigrationConfig.build.context = relativePath;
              const cqlFilesRelativePath = normalize(pathjs.relative(this.destinationRoot(), `${path}/src/main/resources/config/cql`));
              cassandraMigrationConfig.volumes[0] = `${cqlFilesRelativePath}:/cql:ro`;

              parentConfiguration[`${databaseServiceName}-migration`] = cassandraMigrationConfig;
            }

            if (database === COUCHBASE) {
              databaseYamlConfig.build.context = relativePath;
            }

            if (appConfig.clusteredDb) {
              const clusterDbYaml = jsyaml.load(this.fs.read(`${path}/src/main/docker/${database}-cluster.yml`));
              const dbNodeConfig = clusterDbYaml.services[`${databaseServiceName}-node`];
              dbNodeConfig.build.context = relativePath;
              databaseYamlConfig = clusterDbYaml.services[databaseServiceName];
              delete databaseYamlConfig.ports;
              if (database === COUCHBASE) {
                databaseYamlConfig.build.context = relativePath;
              }
              parentConfiguration[`${databaseServiceName}-node`] = dbNodeConfig;
              if (database === MONGODB) {
                parentConfiguration[`${databaseServiceName}-config`] = clusterDbYaml.services[`${databaseServiceName}-config`];
              }
            }

            parentConfiguration[databaseServiceName] = databaseYamlConfig;
          }
          // Add search engine configuration
          const searchEngine = appConfig.searchEngine;
          if (searchEngine === ELASTICSEARCH) {
            const searchEngineYaml = jsyaml.load(this.fs.read(`${path}/src/main/docker/${searchEngine}.yml`));
            const searchEngineConfig = searchEngineYaml.services[`${lowercaseBaseName}-${searchEngine}`];
            delete searchEngineConfig.ports;
            parentConfiguration[`${lowercaseBaseName}-${searchEngine}`] = searchEngineConfig;
          }
          // Add Memcached support
          const cacheProvider = appConfig.cacheProvider;
          if (cacheProvider === MEMCACHED) {
            this.useMemcached = true;
            const memcachedYaml = jsyaml.load(this.fs.read(`${path}/src/main/docker/memcached.yml`));
            const memcachedConfig = memcachedYaml.services[`${lowercaseBaseName}-memcached`];
            delete memcachedConfig.ports;
            parentConfiguration[`${lowercaseBaseName}-memcached`] = memcachedConfig;
          }

          // Add Redis support
          if (cacheProvider === REDIS) {
            this.useRedis = true;
            const redisYaml = jsyaml.load(this.fs.read(`${path}/src/main/docker/redis.yml`));
            const redisConfig = redisYaml.services[`${lowercaseBaseName}-redis`];
            delete redisConfig.ports;
            parentConfiguration[`${lowercaseBaseName}-redis`] = redisConfig;
          }
          // Expose authenticationType
          this.authenticationType = appConfig.authenticationType;

          // Dump the file
          let yamlString = jsyaml.dump(parentConfiguration, { indent: 2, lineWidth: -1 });

          // Add extra indentation for each lines
          const yamlArray = yamlString.split('\n');
          for (let j = 0; j < yamlArray.length; j++) {
            yamlArray[j] = `  ${yamlArray[j]}`;
          }
          yamlString = yamlArray.join('\n');
          this.appsYaml.push(yamlString);

          this.skipClient = appConfig.skipClient;
        });
      },
    };
  }

  get [PREPARING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._preparing();
  }

  _loading() {
    return {
      loadPlatformConfig() {
        this.loadDeploymentConfig(this);
      },
    };
  }

  get [LOADING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._loading();
  }

  _writing() {
    return writeFiles();
  }

  get [WRITING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._writing();
  }

  _end() {
    if (this.hasWarning) {
      this.log(`\n${chalk.yellow.bold('WARNING!')} Docker Compose configuration generated, but no Jib cache found`);
      this.log('If you forgot to generate the Docker image for this application, please run:');
      this.log(chalk.red(this.warningMessage));
    } else {
      this.log(`\n${chalk.bold.green('Docker Compose configuration successfully generated!')}`);
    }
    this.log(`You can launch all your infrastructure by running : ${chalk.cyan('docker-compose up -d')}`);
    if (this.gatewayNb + this.monolithicNb > 1) {
      this.log('\nYour applications will be accessible on these URLs:');
      this.appConfigs.forEach(appConfig => {
        if (appConfig.applicationType === GATEWAY || appConfig.applicationType === MONOLITH) {
          this.log(`\t- ${appConfig.baseName}: http://localhost:${appConfig.composePort}`);
        }
      });
      this.log('\n');
    }
  }

  end() {
    if (this.delegateToBlueprint) return {};
    return this._end();
  }
};
