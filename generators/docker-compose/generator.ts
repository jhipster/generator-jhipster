/**
 * Copyright 2013-2026 the original author or authors from the JHipster project.
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
import assert from 'node:assert';
import pathjs from 'node:path';

import chalk from 'chalk';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';

import { monitoringTypes, serviceDiscoveryTypes } from '../../lib/jhipster/index.ts';
import { createBase64Secret, stringHashCode } from '../../lib/utils/index.ts';
import { normalizePath as normalize } from '../../lib/utils/path.ts';
import { createFaker } from '../base-application/support/index.ts';
import BaseWorkspacesGenerator, { type Deployment as BaseDeployment, type WorkspacesApplication } from '../base-workspaces/index.ts';
import { checkImages } from '../base-workspaces/internal/docker-base.ts';
import {
  askForClustersModeWorkspace,
  askForMonitoring,
  askForServiceDiscoveryWorkspace,
} from '../base-workspaces/internal/docker-prompts.ts';
import { loadDockerDependenciesTask, loadDockerElasticsearchVersion } from '../base-workspaces/internal/index.ts';
import { askForDirectoryPath } from '../base-workspaces/prompts.ts';
import type { Features as BaseWorkspacesFeatures, Options as BaseWorkspacesOptions } from '../base-workspaces/types.ts';
import { createDockerDeploymentServices } from '../docker/support/index.ts';

import cleanupOldFilesTask from './cleanup.ts';
import { writeFiles } from './files.ts';

const { PROMETHEUS } = monitoringTypes;
const { EUREKA, NO: NO_SERVICE_DISCOVERY } = serviceDiscoveryTypes;

export default class DockerComposeGenerator extends BaseWorkspacesGenerator {
  constructor(args?: string[], options?: BaseWorkspacesOptions, features?: BaseWorkspacesFeatures) {
    super(args, options, { officialApplicationTypesOnly: true, ...features });
  }

  async beforeQueue() {
    if (!this.fromBlueprint) {
      this.jhipsterConfig.deploymentType ??= 'docker-compose';
      assert.equal(this.jhipsterConfig.deploymentType, 'docker-compose', 'Deployment type must be docker-compose');

      await this.composeWithBlueprints();
    }

    await this.dependsOnBootstrap('base-workspaces');
  }

  get initializing() {
    return this.asInitializingTaskGroup({
      sayHello() {
        this.log.log(chalk.white(`${chalk.bold('🐳')}  Welcome to the JHipster Docker Compose Sub-Generator ${chalk.bold('🐳')}`));
        this.log.log(chalk.white(`Files will be generated in folder: ${chalk.yellow(this.destinationRoot())}`));
      },
      checkDockerCompose({ control }) {
        if (this.skipChecks) return;

        if (!control.environmentHasDockerCompose) {
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

  get prompting() {
    return this.asPromptingTaskGroup({
      askForDirectoryPath,
    });
  }

  get [BaseWorkspacesGenerator.PROMPTING]() {
    return this.delegateTasksToBlueprint(() => this.prompting);
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      setWorkspacesRoot() {
        this.setWorkspacesRoot(this.destinationPath(this.jhipsterConfigWithDefaults.directoryPath, { allowOutsideRoot: true }));
      },
    });
  }

  get [BaseWorkspacesGenerator.PREPARING]() {
    return this.delegateTasksToBlueprint(() => this.preparing);
  }

  get promptingWorkspaces() {
    return this.asPromptingWorkspacesTaskGroup({
      askForMonitoring,
      askForClustersModeWorkspace,
      askForServiceDiscoveryWorkspace,
    });
  }

  get [BaseWorkspacesGenerator.PROMPTING_WORKSPACES]() {
    return this.delegateTasksToBlueprint(() => this.promptingWorkspaces);
  }

  get configuringWorkspaces() {
    return this.asConfiguringWorkspacesTaskGroup({
      configureBaseDeployment({ applications }) {
        const clientOnlyApplications = applications.filter(app => app.skipServer);
        if (clientOnlyApplications.length > 0) {
          throw new Error(
            `Applications generated with skipServer have no docker image to compose: ${clientOnlyApplications.map(app => app.appFolder).join(', ')}`,
          );
        }
        this.jhipsterConfig.jwtSecretKey ??= createBase64Secret(this.options.reproducibleTests);
        if (applications.some(app => app.serviceDiscoveryTypeEureka)) {
          this.jhipsterConfig.adminPassword ??= 'admin';
        }
      },
    });
  }

  get [BaseWorkspacesGenerator.CONFIGURING_WORKSPACES]() {
    return this.delegateTasksToBlueprint(() => this.configuringWorkspaces);
  }

  get loadingWorkspaces() {
    return this.asLoadingWorkspacesTaskGroup({
      loadBaseDeployment({ deployment }) {
        deployment.jwtSecretKey = this.jhipsterConfig.jwtSecretKey;

        loadDockerDependenciesTask.call(this, { context: deployment });
        loadDockerElasticsearchVersion.call(this, {
          dockerContainers: deployment.dockerContainers!,
        });
      },
    });
  }

  get [BaseWorkspacesGenerator.LOADING_WORKSPACES]() {
    return this.delegateTasksToBlueprint(() => this.loadingWorkspaces);
  }

  get preparingWorkspaces() {
    return this.asPreparingWorkspacesTaskGroup({
      prepareDeployment({ deployment, applications }) {
        this.prepareDeploymentDerivedProperties({ deployment, applications });
      },
    });
  }

  get [BaseWorkspacesGenerator.PREPARING_WORKSPACES]() {
    return this.delegateTasksToBlueprint(() => this.preparingWorkspaces);
  }

  get writing() {
    return this.asWritingTaskGroup({
      // At writing: the docker bootstraps of the applications add their docker compose files at the default priority.
      async setAppsYaml({ deployment, applications }) {
        const faker = await createFaker();

        deployment.keycloakRedirectUris = '';
        deployment.appsYaml = applications.map(appConfig => {
          const lowercaseBaseName = appConfig.baseName.toLowerCase();
          const parentConfiguration: Record<string, any> = {};
          const path = this.workspacePath(appConfig.appFolder!);
          // The docker files of the application, in the folder it declares: a blueprint may keep them elsewhere.
          const dockerServicesDir = pathjs.join(path, appConfig.dockerServicesDir);
          // The name the deployment gives a service of the application.
          const serviceName = (service: string) => `${appConfig.dockerDeploymentServicePrefix}${service}`;
          // The services of a docker compose file of the application as the deployment uses them, by their name in it:
          // prepared by the application, or from the file it wrote.
          const composeServices = (fileName: string): Record<string, any> => {
            const deploymentServices = appConfig.dockerComposeFiles?.[fileName]?.deploymentServices;
            return deploymentServices ?
                structuredClone(deploymentServices)
              : createDockerDeploymentServices(parseYaml(this.fs.read(`${dockerServicesDir}/${fileName}.yml`)).services, {
                  applicationServiceName: lowercaseBaseName,
                  servicePrefix: appConfig.dockerDeploymentServicePrefix,
                  isApplicationService: service => !['keycloak', 'jhipster-registry', 'consul'].includes(service),
                });
          };
          // Add application configuration
          const yamlConfig = composeServices('app')[lowercaseBaseName];
          if (appConfig.applicationTypeGateway || appConfig.applicationTypeMonolith) {
            if (deployment.keycloakSecrets === undefined && appConfig.authenticationTypeOauth2) {
              faker.seed(stringHashCode(appConfig.baseName));
              deployment.keycloakSecrets = Array.from(new Array(6), () => faker.string.uuid());
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

          if (appConfig.applicationTypeMonolith && deployment.monitoring === PROMETHEUS) {
            yamlConfig.environment.push('JHIPSTER_LOGGING_LOGSTASH_ENABLED=false');
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
            const relativePath = normalize(pathjs.relative(this.destinationRoot(), dockerServicesDir));
            const databaseServiceName = serviceName(database!);
            let databaseYamlConfig = composeServices(database!)[databaseServiceName];
            // Don't export database ports
            delete databaseYamlConfig.ports;

            if (appConfig.databaseTypeCassandra && appConfig.databaseMigrationLoader) {
              // migration service config
              const cassandraMigrationConfig = composeServices('cassandra-migration')[`${databaseServiceName}-migration`];
              cassandraMigrationConfig.build.context = relativePath;
              const cqlFilesRelativePath = normalize(pathjs.relative(this.destinationRoot(), `${path}/src/main/resources/config/cql`));
              cassandraMigrationConfig.volumes[0] = `${cqlFilesRelativePath}:/cql:ro`;

              parentConfiguration[`${databaseServiceName}-migration`] = cassandraMigrationConfig;
            }

            if (appConfig.databaseTypeCouchbase) {
              databaseYamlConfig.build.context = relativePath;
            }

            if (deployment.clusteredDbApps?.includes(appConfig.appFolder!)) {
              const clusterServices = composeServices(`${database}-cluster`);
              const dbNodeConfig = clusterServices[`${databaseServiceName}-node`];
              dbNodeConfig.build.context = relativePath;
              databaseYamlConfig = clusterServices[databaseServiceName];
              delete databaseYamlConfig.ports;
              if (appConfig.databaseTypeCouchbase) {
                databaseYamlConfig.build.context = relativePath;
              }
              parentConfiguration[`${databaseServiceName}-node`] = dbNodeConfig;
              if (appConfig.databaseTypeMongodb) {
                parentConfiguration[`${databaseServiceName}-config`] = clusterServices[`${databaseServiceName}-config`];
              }
            }

            parentConfiguration[databaseServiceName] = databaseYamlConfig;
          }
          if (appConfig.searchEngineElasticsearch) {
            // Add search engine configuration
            const { searchEngine } = appConfig;
            const searchEngineConfig = composeServices(searchEngine)[serviceName(searchEngine)];
            delete searchEngineConfig.ports;
            parentConfiguration[serviceName(searchEngine)] = searchEngineConfig;
          }
          // Add Memcached support
          if (appConfig.cacheProviderMemcached) {
            const memcachedConfig = composeServices('memcached')[serviceName('memcached')];
            delete memcachedConfig.ports;
            parentConfiguration[serviceName('memcached')] = memcachedConfig;
          }

          // Add Redis support
          if (appConfig.cacheProviderRedis) {
            const redisConfig = composeServices('redis')[serviceName('redis')];
            delete redisConfig.ports;
            parentConfiguration[serviceName('redis')] = redisConfig;
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
      cleanupOldFilesTask,
      writeFiles,
    });
  }

  get [BaseWorkspacesGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  get end() {
    return this.asEndTaskGroup({
      end({ applications }) {
        this.checkApplicationsDockerImages({ applications });

        this.log.verboseInfo(`You can launch all your infrastructure by running: ${chalk.cyan('docker compose up -d')}`);
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

  checkApplicationsDockerImages({ applications }: { applications: WorkspacesApplication[] }) {
    const check = checkImages.call(this, { applications });
    if (check.hasWarning) {
      this.log.warn('Docker Compose configuration generated, but the Docker images may be missing');
      this.log.warn('If you forgot to generate the Docker image for these applications, please run:');
      this.log.log(chalk.red(check.warningMessage));
    } else {
      this.log.verboseInfo(chalk.bold.green('Docker Compose configuration successfully generated!'));
    }
  }

  prepareDeploymentDerivedProperties({ deployment, applications }: { deployment: BaseDeployment; applications: any[] }) {
    deployment.usesOauth2 = applications.some(appConfig => appConfig.authenticationTypeOauth2);
    deployment.useKafka = applications.some(appConfig => appConfig.messageBrokerKafka);
    deployment.usePulsar = applications.some(appConfig => appConfig.messageBrokerPulsar);
    deployment.useMemcached = applications.some(appConfig => appConfig.cacheProviderMemcached);
    deployment.useRedis = applications.some(appConfig => appConfig.cacheProviderRedis);
    deployment.includesApplicationTypeGateway = applications.some(appConfig => appConfig.applicationTypeGateway);
    deployment.entryPort = 8080;

    deployment.appConfigs = applications;
  }
}
