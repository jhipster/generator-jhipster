/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
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
import { existsSync } from 'fs';
import pathjs from 'path';
import chalk from 'chalk';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import normalize from 'normalize-path';
import { defaults } from 'lodash-es';

import BaseWorkspacesGenerator from '../base-workspaces/index.js';

import { deploymentOptions, monitoringTypes, serviceDiscoveryTypes } from '../../lib/jhipster/index.js';
import { GENERATOR_BOOTSTRAP_WORKSPACES } from '../generator-list.js';
import { convertSecretToBase64, createBase64Secret, stringHashCode } from '../../lib/utils/index.js';
import { createFaker } from '../base/support/index.js';
import { checkDocker } from '../base-workspaces/internal/docker-base.js';
import { loadDockerDependenciesTask } from '../base-workspaces/internal/index.js';
import { loadDerivedPlatformConfig, loadPlatformConfig } from '../server/support/index.js';
import { writeFiles } from './files.js';

const { PROMETHEUS, NO: NO_MONITORING } = monitoringTypes;
const { CONSUL, EUREKA, NO: NO_SERVICE_DISCOVERY } = serviceDiscoveryTypes;
const { Options: DeploymentOptions } = deploymentOptions;

/**
 * @class
 * @extends {import('../base/index.js')}
 */
export default class DockerComposeGenerator extends BaseWorkspacesGenerator {
  existingDeployment;
  jwtSecretKey!: string;

  async beforeQueue() {
    if (this.appsFolders && this.appsFolders.length > 0) {
      this.jhipsterConfig.appsFolders = this.appsFolders;
    }

    await this.dependsOnJHipster(GENERATOR_BOOTSTRAP_WORKSPACES);
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }
  }

  get initializing() {
    return this.asInitializingTaskGroup({
      sayHello() {
        this.log.log(chalk.white(`${chalk.bold('🐳')}  Welcome to the JHipster Docker Compose Sub-Generator ${chalk.bold('🐳')}`));
        this.log.log(chalk.white(`Files will be generated in folder: ${chalk.yellow(this.destinationRoot())}`));
      },
      checkDocker,
      async checkDockerCompose({ control }) {
        if (this.skipChecks) return;

        if (!control.enviromentHasDockerCompose) {
          throw new Error(`Docker Compose V2 is not installed on your computer.
         Read https://docs.docker.com/compose/install/
`);
        }
      },
    });
  }

  get [BaseWorkspacesGenerator.INITIALIZING]() {
    return this.delegateTasksToBlueprint(() => this.initializing);
  }

  get loading() {
    return this.asLoadingTaskGroup({
      loadWorkspacesConfig() {
        this.loadWorkspacesConfig();
      },
    });
  }

  get [BaseWorkspacesGenerator.LOADING]() {
    return this.delegateTasksToBlueprint(() => this.loading);
  }

  get promptingWorkspaces() {
    return this.asAnyTaskGroup({
      async askForMonitoring({ workspaces }) {
        if (workspaces.existingWorkspaces && !this.options.askAnswered) return;

        await this.askForMonitoring();
      },
      async askForClustersMode({ workspaces, applications }) {
        if (workspaces.existingWorkspaces && !this.options.askAnswered) return;

        await this.askForClustersMode({ applications });
      },
      async askForServiceDiscovery({ workspaces, applications }) {
        if (workspaces.existingWorkspaces && !this.options.askAnswered) return;

        await this.askForServiceDiscovery({ applications });
      },
    });
  }

  get [BaseWorkspacesGenerator.PROMPTING_WORKSPACES]() {
    return this.delegateTasksToBlueprint(() => this.promptingWorkspaces);
  }

  get configuringWorkspaces() {
    return this.asAnyTaskGroup({
      configureBaseDeployment({ applications }) {
        this.jhipsterConfig.jwtSecretKey =
          this.jhipsterConfig.jwtSecretKey ?? this.jwtSecretKey ?? createBase64Secret(this.options.reproducibleTests);
        if (applications.some(app => app.serviceDiscoveryEureka)) {
          this.jhipsterConfig.adminPassword = this.jhipsterConfig.adminPassword ?? 'admin';
        }
      },
    });
  }

  get [BaseWorkspacesGenerator.CONFIGURING_WORKSPACES]() {
    return this.delegateTasksToBlueprint(() => this.configuringWorkspaces);
  }

  get loadingWorkspaces() {
    return this.asAnyTaskGroup({
      async loadBaseDeployment({ deployment }) {
        deployment.jwtSecretKey = this.jhipsterConfig.jwtSecretKey;

        await loadDockerDependenciesTask.call(this, { context: deployment });
      },
      loadPlatformConfig({ deployment }) {
        this.loadDeploymentConfig({ deployment });
      },
    });
  }

  get [BaseWorkspacesGenerator.LOADING_WORKSPACES]() {
    return this.delegateTasksToBlueprint(() => this.loadingWorkspaces);
  }

  get preparingWorkspaces() {
    return this.asAnyTaskGroup({
      prepareDeployment({ deployment, applications }) {
        this.prepareDeploymentDerivedProperties({ deployment, applications });
      },
    });
  }

  get [BaseWorkspacesGenerator.PREPARING_WORKSPACES]() {
    return this.delegateTasksToBlueprint(() => this.preparingWorkspaces);
  }

  get default() {
    return this.asAnyTaskGroup({
      async setAppsYaml({ workspaces, deployment, applications }) {
        const faker = await createFaker();

        deployment.keycloakRedirectUris = '';
        deployment.appsYaml = applications.map(appConfig => {
          const lowercaseBaseName = appConfig.baseName.toLowerCase();
          appConfig.clusteredDb = deployment.clusteredDbApps?.includes(appConfig.appFolder);
          const parentConfiguration = {};
          const path = this.destinationPath(workspaces.directoryPath, appConfig.appFolder);
          // Add application configuration
          const yaml = parseYaml(this.fs.read(`${path}/src/main/docker/app.yml`)!);
          const yamlConfig = yaml.services.app;
          if (yamlConfig.depends_on) {
            yamlConfig.depends_on = Object.fromEntries(
              Object.entries(yamlConfig.depends_on).map(([serviceName, config]) => {
                if (['keycloak', 'jhipster-registry', 'consul'].includes(serviceName)) {
                  return [serviceName, config];
                }
                return [`${lowercaseBaseName}-${serviceName}`, config];
              }),
            );
          }
          if (appConfig.applicationTypeGateway || appConfig.applicationTypeMonolith) {
            if (deployment.keycloakSecrets === undefined && appConfig.authenticationTypeOauth2) {
              faker.seed(stringHashCode(appConfig.baseName));
              deployment.keycloakSecrets = Array.from(Array(6), () => faker.string.uuid());
            }
            deployment.keycloakRedirectUris += `"http://localhost:${appConfig.composePort}/*", "https://localhost:${appConfig.composePort}/*", `;
            if (appConfig.devServerPort !== undefined) {
              deployment.keycloakRedirectUris += `"http://localhost:${appConfig.devServerPort}/*", `;
            }
            if (appConfig.devServerPortProxy !== undefined) {
              deployment.keycloakRedirectUris += `"http://localhost:${appConfig.devServerPortProxy}/*", `;
            }
            // Split ports by ":" and take last 2 elements to skip the hostname/IP if present
            const ports = yamlConfig.ports[0].split(':').slice(-2);
            ports[0] = appConfig.composePort;
            yamlConfig.ports[0] = ports.join(':');
          }

          if (yamlConfig.environment) {
            yamlConfig.environment = yamlConfig.environment.map(envOption => {
              // Doesn't applies to keycloak, jhipster-registry and consul.
              // docker-compose changes the container name to `${lowercaseBaseName}-${databaseType}`.
              // we need to update the environment urls to the new container host.
              [
                'SPRING_R2DBC_URL',
                'SPRING_DATASOURCE_URL',
                'SPRING_LIQUIBASE_URL',
                'SPRING_NEO4J_URI',
                'SPRING_DATA_MONGODB_URI',
                'JHIPSTER_CACHE_REDIS_SERVER',
                'SPRING_ELASTICSEARCH_URIS',
              ].forEach(varName => {
                if (envOption.startsWith(varName)) {
                  envOption = envOption
                    .replace('://', `://${lowercaseBaseName}-`)
                    .replace('oracle:thin:@', `oracle:thin:@${lowercaseBaseName}-`);
                }
              });
              ['JHIPSTER_CACHE_MEMCACHED_SERVERS', 'SPRING_COUCHBASE_CONNECTION_STRING', 'SPRING_CASSANDRA_CONTACTPOINTS'].forEach(
                varName => {
                  if (envOption.startsWith(varName)) {
                    envOption = envOption.replace(`${varName}=`, `${varName}=${lowercaseBaseName}-`);
                  }
                },
              );
              return envOption;
            });
          }

          if (appConfig.applicationTypeMonolith && deployment.monitoring === PROMETHEUS) {
            yamlConfig.environment.push('JHIPSTER_LOGGING_LOGSTASH_ENABLED=false');
            yamlConfig.environment.push('MANAGEMENT_METRICS_EXPORT_PROMETHEUS_ENABLED=true');
          }

          if (deployment.serviceDiscoveryType === EUREKA) {
            // Set the JHipster Registry password
            yamlConfig.environment.push(`JHIPSTER_REGISTRY_PASSWORD=${deployment.adminPassword}`);
          }

          const hasNoServiceDiscovery = !deployment.serviceDiscoveryType && deployment.serviceDiscoveryType !== NO_SERVICE_DISCOVERY;
          if (hasNoServiceDiscovery && appConfig.skipClient) {
            yamlConfig.environment.push('SERVER_PORT=80'); // to simplify service resolution in docker/k8s
          }

          parentConfiguration[lowercaseBaseName] = yamlConfig;

          // Add database configuration
          if (appConfig.databaseTypeAny && !appConfig.prodDatabaseTypeOracle) {
            const database = appConfig.databaseTypeSql ? appConfig.prodDatabaseType : appConfig.databaseType;
            const relativePath = normalize(pathjs.relative(this.destinationRoot(), `${path}/src/main/docker`));
            const databaseYaml = parseYaml(this.fs.read(`${path}/src/main/docker/${database}.yml`)!);
            const databaseServiceName = `${lowercaseBaseName}-${database}`;
            let databaseYamlConfig = databaseYaml.services[database];
            // Don't export database ports
            delete databaseYamlConfig.ports;

            if (appConfig.databaseTypeCassandra) {
              // migration service config
              const cassandraMigrationYaml = parseYaml(this.fs.read(`${path}/src/main/docker/cassandra-migration.yml`)!);
              const cassandraMigrationConfig = cassandraMigrationYaml.services[`${database}-migration`];
              cassandraMigrationConfig.build.context = relativePath;
              const cqlFilesRelativePath = normalize(pathjs.relative(this.destinationRoot(), `${path}/src/main/resources/config/cql`));
              cassandraMigrationConfig.volumes[0] = `${cqlFilesRelativePath}:/cql:ro`;

              parentConfiguration[`${databaseServiceName}-migration`] = cassandraMigrationConfig;
            }

            if (appConfig.databaseTypeCouchbase) {
              databaseYamlConfig.build.context = relativePath;
            }

            if (appConfig.clusteredDb) {
              const clusterDbYaml = parseYaml(this.fs.read(`${path}/src/main/docker/${database}-cluster.yml`)!);
              const dbNodeConfig = clusterDbYaml.services[`${database}-node`];
              dbNodeConfig.build.context = relativePath;
              databaseYamlConfig = clusterDbYaml.services[database];
              delete databaseYamlConfig.ports;
              if (appConfig.databaseTypeCouchbase) {
                databaseYamlConfig.build.context = relativePath;
              }
              parentConfiguration[`${databaseServiceName}-node`] = dbNodeConfig;
              if (appConfig.databaseTypeMongodb) {
                parentConfiguration[`${databaseServiceName}-config`] = clusterDbYaml.services[`${database}-config`];
              }
            }

            parentConfiguration[databaseServiceName] = databaseYamlConfig;
          }
          if (appConfig.searchEngineElasticsearch) {
            // Add search engine configuration
            const searchEngine = appConfig.searchEngine;
            const searchEngineYaml = parseYaml(this.fs.read(`${path}/src/main/docker/${searchEngine}.yml`)!);
            const searchEngineConfig = searchEngineYaml.services[searchEngine];
            delete searchEngineConfig.ports;
            parentConfiguration[`${lowercaseBaseName}-${searchEngine}`] = searchEngineConfig;
          }
          // Add Memcached support
          if (appConfig.cacheProviderMemcached) {
            const memcachedYaml = parseYaml(this.readDestination(`${path}/src/main/docker/memcached.yml`)!.toString());
            const memcachedConfig = memcachedYaml.services.memcached;
            delete memcachedConfig.ports;
            parentConfiguration[`${lowercaseBaseName}-memcached`] = memcachedConfig;
          }

          // Add Redis support
          if (appConfig.cacheProviderRedis) {
            const redisYaml = parseYaml(this.readDestination(`${path}/src/main/docker/redis.yml`)!.toString());
            const redisConfig = redisYaml.services.redis;
            delete redisConfig.ports;
            parentConfiguration[`${lowercaseBaseName}-redis`] = redisConfig;
          }
          // Expose authenticationType
          deployment.authenticationType = appConfig.authenticationType;

          // Dump the file
          let yamlString = stringifyYaml(parentConfiguration, { indent: 2, lineWidth: 0 });

          // Add extra indentation for each lines
          const yamlArray = yamlString.split('\n');
          for (let j = 0; j < yamlArray.length; j++) {
            yamlArray[j] = `  ${yamlArray[j]}`;
          }
          yamlString = yamlArray.join('\n');
          return yamlString;
        });
      },
    });
  }

  get [BaseWorkspacesGenerator.DEFAULT]() {
    return this.delegateTasksToBlueprint(() => this.default);
  }

  get writing() {
    return writeFiles();
  }

  get [BaseWorkspacesGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  get end() {
    return this.asAnyTaskGroup({
      end({ workspaces, applications }) {
        this.checkApplicationsDockerImages({ workspaces, applications });

        this.log.verboseInfo(`You can launch all your infrastructure by running : ${chalk.cyan('docker compose up -d')}`);
        const uiApplications = applications.filter(
          app => (app.applicationTypeGateway || app.applicationTypeMonolith) && app.clientFrameworkAny,
        );
        if (uiApplications.length > 0) {
          this.log.log('\nYour applications will be accessible on these URLs:');
          for (const application of uiApplications) {
            this.log.verboseInfo(`\t- ${application.baseName}: http://localhost:${application.composePort}`);
          }
          this.log.log('\n');
        }
      },
    });
  }

  get [BaseWorkspacesGenerator.END]() {
    return this.delegateTasksToBlueprint(() => this.end);
  }

  checkApplicationsDockerImages({ workspaces, applications }) {
    this.log.log('\nChecking Docker images in applications directories...');

    let imagePath = '';
    let runCommand = '';
    let hasWarning = false;
    let warningMessage = 'To generate the missing Docker image(s), please run:\n';
    applications.forEach(application => {
      if (application.buildToolGradle) {
        imagePath = this.destinationPath(workspaces.directoryPath, application.appFolder, 'build/jib-cache');
        runCommand = `./gradlew bootJar -Pprod jibDockerBuild${process.arch === 'arm64' ? ' -PjibArchitecture=arm64' : ''}`;
      } else if (application.buildToolMaven) {
        imagePath = this.destinationPath(workspaces.directoryPath, application.appFolder, '/target/jib-cache');
        runCommand = `./mvnw -ntp -Pprod verify jib:dockerBuild${process.arch === 'arm64' ? ' -Djib-maven-plugin.architecture=arm64' : ''}`;
      }
      if (!existsSync(imagePath)) {
        hasWarning = true;
        warningMessage += `  ${chalk.cyan(runCommand)} in ${this.destinationPath(workspaces.directoryPath, application.appFolder)}\n`;
      }
    });
    if (hasWarning) {
      this.log.warn('Docker Compose configuration generated, but no Jib cache found');
      this.log.warn('If you forgot to generate the Docker image for this application, please run:');
      this.log.log(chalk.red(warningMessage));
    } else {
      this.log.verboseInfo(`${chalk.bold.green('Docker Compose configuration successfully generated!')}`);
    }
  }

  get deploymentConfigWithDefaults() {
    return defaults({}, this.jhipsterConfig, DeploymentOptions.defaults(this.jhipsterConfig.deploymentType));
  }

  loadDeploymentConfig({ deployment }) {
    const config = this.deploymentConfigWithDefaults;
    deployment.clusteredDbApps = config.clusteredDbApps;
    deployment.adminPassword = config.adminPassword;
    deployment.jwtSecretKey = config.jwtSecretKey;
    loadPlatformConfig({ config, application: deployment });
    loadDerivedPlatformConfig({ application: deployment });
  }

  prepareDeploymentDerivedProperties({ deployment, applications }) {
    if (deployment.adminPassword) {
      deployment.adminPasswordBase64 = convertSecretToBase64(deployment.adminPassword);
    }
    deployment.usesOauth2 = applications.some(appConfig => appConfig.authenticationTypeOauth2);
    deployment.useKafka = applications.some(appConfig => appConfig.messageBrokerKafka);
    deployment.usePulsar = applications.some(appConfig => appConfig.messageBrokerPulsar);
    deployment.useMemcached = applications.some(appConfig => appConfig.cacheProviderMemcached);
    deployment.useRedis = applications.some(appConfig => appConfig.cacheProviderRedis);
    deployment.includesApplicationTypeGateway = applications.some(appConfig => appConfig.applicationTypeGateway);
    deployment.entryPort = 8080;

    deployment.appConfigs = applications;
    deployment.applications = applications;
  }

  async askForMonitoring() {
    await this.prompt(
      [
        {
          type: 'list',
          name: 'monitoring',
          message: 'Do you want to setup monitoring for your applications ?',
          choices: [
            {
              value: NO_MONITORING,
              name: 'No',
            },
            {
              value: PROMETHEUS,
              name: 'Yes, for metrics only with Prometheus',
            },
          ],
          default: NO_MONITORING,
        },
      ],
      this.config,
    );
  }

  async askForClustersMode({ applications }) {
    const clusteredDbApps = applications.filter(app => app.databaseTypeMongodb || app.databaseTypeCouchbase).map(app => app.appFolder);
    if (clusteredDbApps.length === 0) return;

    await this.prompt(
      [
        {
          type: 'checkbox',
          name: 'clusteredDbApps',
          message: 'Which applications do you want to use with clustered databases (only available with MongoDB and Couchbase)?',
          choices: clusteredDbApps,
          default: clusteredDbApps,
        },
      ],
      this.config,
    );
  }

  async askForServiceDiscovery({ applications }) {
    const serviceDiscoveryEnabledApps = applications.filter(app => app.serviceDiscoveryAny);
    if (serviceDiscoveryEnabledApps.length === 0) {
      this.jhipsterConfig.serviceDiscoveryType = NO_SERVICE_DISCOVERY;
      return;
    }

    if (serviceDiscoveryEnabledApps.every(app => app.serviceDiscoveryConsul)) {
      this.jhipsterConfig.serviceDiscoveryType = CONSUL;
      this.log.log(chalk.green('Consul detected as the service discovery and configuration provider used by your apps'));
    } else if (serviceDiscoveryEnabledApps.every(app => app.serviceDiscoveryEureka)) {
      this.jhipsterConfig.serviceDiscoveryType = EUREKA;
      this.log.log(chalk.green('JHipster registry detected as the service discovery and configuration provider used by your apps'));
    } else {
      this.log.warn(
        chalk.yellow('Unable to determine the service discovery and configuration provider to use from your apps configuration.'),
      );
      this.log.verboseInfo('Your service discovery enabled apps:');
      serviceDiscoveryEnabledApps.forEach(app => {
        this.log.verboseInfo(` -${app.baseName} (${app.serviceDiscoveryType})`);
      });

      await this.prompt(
        [
          {
            type: 'list',
            name: 'serviceDiscoveryType',
            message: 'Which Service Discovery registry and Configuration server would you like to use ?',
            choices: [
              {
                value: CONSUL,
                name: 'Consul',
              },
              {
                value: EUREKA,
                name: 'JHipster Registry',
              },
              {
                value: NO_SERVICE_DISCOVERY,
                name: 'No Service Discovery and Configuration',
              },
            ],
            default: CONSUL,
          },
        ],
        this.config,
      );
    }
    if (this.jhipsterConfig.serviceDiscoveryType === EUREKA) {
      await this.prompt(
        [
          {
            type: 'input',
            name: 'adminPassword',
            message: 'Enter the admin password used to secure the JHipster Registry',
            default: 'admin',
            validate: input => (input.length < 5 ? 'The password must have at least 5 characters' : true),
          },
        ],
        this.config,
      );
    }
  }
}
