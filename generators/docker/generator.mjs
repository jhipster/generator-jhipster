/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
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
/* eslint-disable camelcase */
import { faker } from '@faker-js/faker/locale/en';
import BaseApplicationGenerator from '../base-application/index.mjs';
import { createDockerComposeFile, createDockerExtendedServices } from '../base-docker/utils.mjs';
import { GENERATOR_BOOTSTRAP_APPLICATION_SERVER, GENERATOR_DOCKER } from '../generator-list.mjs';
import { dockerFiles } from './files.mjs';
import { SERVICE_COMPLETED_SUCCESSFULLY, SERVICE_HEALTHY } from './constants.mjs';
import { stringHashCode } from '../utils.mjs';

/**
 * @class
 * @extends {BaseApplicationGenerator<import('../server/types.mjs').SpringBootApplication>}
 */
export default class DockerGenerator extends BaseApplicationGenerator {
  constructor(args, options, features) {
    super(args, options, { unique: 'namespace', ...features });
  }

  async beforeQueue() {
    // TODO depend on GENERATOR_BOOTSTRAP_APPLICATION_SERVER.
    await this.dependsOnJHipster(GENERATOR_BOOTSTRAP_APPLICATION_SERVER);
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints(GENERATOR_DOCKER);
    }
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      addAppServices({ application, source }) {
        source.addDockerExtendedServiceToApplicationAndServices = (...services) => {
          const extendedServices = createDockerExtendedServices(...services);
          this.mergeDestinationYaml(`${application.dockerServicesDir}services.yml`, extendedServices);
          this.mergeDestinationYaml(`${application.dockerServicesDir}app.yml`, extendedServices);
        };

        source.addDockerExtendedServiceToServices = (...services) => {
          const extendedServices = createDockerExtendedServices(...services);
          this.mergeDestinationYaml(`${application.dockerServicesDir}services.yml`, extendedServices);
        };

        source.addDockerDependencyToApplication = (...services) => {
          this.mergeDestinationYaml(`${application.dockerServicesDir}app.yml`, {
            services: {
              app: {
                depends_on: Object.fromEntries(
                  services.map(({ serviceName, condition }) => [
                    serviceName,
                    {
                      condition,
                    },
                  ])
                ),
              },
            },
          });
        };
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING]() {
    return this.preparing;
  }

  get writing() {
    return this.asWritingTaskGroup({
      async writeDockerFiles({ application }) {
        if (application.authenticationTypeOauth2) {
          faker.seed(stringHashCode(application.baseName));
          application.keycloakSecrets = Array.from(Array(6), () => faker.datatype.uuid());
        }
        await this.writeFiles({
          sections: dockerFiles,
          context: application,
        });
      },
    });
  }

  get [BaseApplicationGenerator.WRITING]() {
    return this.writing;
  }

  get postWriting() {
    return this.asPostWritingTaskGroup({
      async dockerServices({ application, source }) {
        const dockerFile = createDockerComposeFile(application.lowercaseBaseName);
        this.writeDestination(`${application.dockerServicesDir}services.yml`, dockerFile);

        if (application.databaseTypeCassandra) {
          const serviceName = application.databaseType;
          source.addDockerExtendedServiceToApplicationAndServices(
            { serviceName },
            { serviceFile: './cassandra.yml', serviceName: 'cassandra-migration' }
          );
          source.addDockerDependencyToApplication(
            { serviceName, condition: SERVICE_HEALTHY },
            { serviceName: 'cassandra-migration', condition: SERVICE_COMPLETED_SUCCESSFULLY }
          );
        } else if (!application.databaseTypeSql || !application.prodDatabaseTypeOracle) {
          const serviceName = application.databaseTypeSql ? application.prodDatabaseType : application.databaseType;
          source.addDockerExtendedServiceToApplicationAndServices({ serviceName });
          source.addDockerDependencyToApplication({ serviceName, condition: SERVICE_HEALTHY });
        }

        if (application.searchEngineElasticsearch) {
          source.addDockerExtendedServiceToApplicationAndServices({ serviceName: application.searchEngine });
          source.addDockerDependencyToApplication({ serviceName: application.searchEngine, condition: SERVICE_HEALTHY });
        }

        if (application.cacheProviderMemcached || application.cacheProviderRedis) {
          source.addDockerExtendedServiceToApplicationAndServices({ serviceName: application.cacheProvider });
        }

        if (application.authenticationTypeOauth2) {
          source.addDockerExtendedServiceToApplicationAndServices({ serviceName: 'keycloak' });
          source.addDockerDependencyToApplication({ serviceName: 'keycloak', condition: SERVICE_HEALTHY });
        }

        if (application.serviceDiscoveryEureka) {
          const depends_on = application.authenticationTypeOauth2
            ? {
                keycloak: {
                  condition: SERVICE_HEALTHY,
                },
              }
            : undefined;
          source.addDockerExtendedServiceToApplicationAndServices({
            serviceName: 'jhipster-registry',
            additionalConfig: {
              depends_on,
            },
          });

          source.addDockerDependencyToApplication({ serviceName: 'jhipster-registry', condition: SERVICE_HEALTHY });
        }
        if (application.serviceDiscoveryConsul) {
          source.addDockerExtendedServiceToApplicationAndServices(
            { serviceName: 'consul' },
            { serviceFile: './consul.yml', serviceName: 'consul-config-loader' }
          );
        }
        if (application.messageBrokerKafka) {
          source.addDockerExtendedServiceToApplicationAndServices(
            { serviceName: 'kafka' },
            { serviceFile: './kafka.yml', serviceName: 'zookeeper' }
          );
        }
      },

      packageJsonScripts({ application }) {
        const scriptsStorage = this.packageJson.createStorage('scripts');
        const { databaseType, databaseTypeSql, prodDatabaseType, prodDatabaseTypeNo, prodDatabaseTypeMysql, prodDatabaseTypeOracle } =
          application;
        let postServicesSleep;

        if (databaseTypeSql) {
          if (prodDatabaseTypeNo || prodDatabaseTypeOracle) {
            scriptsStorage.set(
              'docker:db:up',
              `echo "Docker for db ${prodDatabaseType} not configured for application ${application.baseName}"`
            );
          } else {
            const dockerFile = `${application.dockerServicesDir}${prodDatabaseType}.yml`;
            scriptsStorage.set({
              'docker:db:up': `docker compose -f ${dockerFile} up --wait`,
              'docker:db:down': `docker compose -f ${dockerFile} down -v`,
            });
          }
        } else {
          const dockerFile = `${application.dockerServicesDir}${databaseType}.yml`;
          if (this.fs.exists(this.destinationPath(dockerFile))) {
            scriptsStorage.set({
              'docker:db:up': `docker compose -f ${dockerFile} up --wait`,
              'docker:db:down': `docker compose -f ${dockerFile} down -v`,
            });
            if (application.databaseTypeCassandra) {
              // Wait for migration
              postServicesSleep = 5;
            }
          } else {
            scriptsStorage.set(
              'docker:db:up',
              `echo "Docker for db ${databaseType} not configured for application ${application.baseName}"`
            );
          }
        }

        ['keycloak', 'elasticsearch', 'kafka', 'consul', 'redis', 'memcached', 'jhipster-registry'].forEach(dockerConfig => {
          const dockerFile = `${application.dockerServicesDir}${dockerConfig}.yml`;
          if (this.fs.exists(this.destinationPath(dockerFile))) {
            scriptsStorage.set(`docker:${dockerConfig}:up`, `docker compose -f ${dockerFile} up --wait`);
            scriptsStorage.set(`docker:${dockerConfig}:down`, `docker compose -f ${dockerFile} down -v`);
          }
        });

        if (postServicesSleep) {
          scriptsStorage.set({
            'postservices:up': `sleep ${postServicesSleep}`,
          });
        }
        scriptsStorage.set({
          'services:up': `docker compose -f ${application.dockerServicesDir}services.yml up --wait`,
          'app:up': `docker compose -f ${application.dockerServicesDir}app.yml up --wait`,
          'ci:e2e:prepare:docker': 'npm run services:up && docker ps -a',
          'ci:e2e:prepare': 'npm run ci:e2e:prepare:docker',
          'ci:e2e:teardown:docker': `docker compose -f ${application.dockerServicesDir}services.yml down -v && docker ps -a`,
          'ci:e2e:teardown': 'npm run ci:e2e:teardown:docker',
        });
      },
    });
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
    return this.asPostWritingTaskGroup(this.delegateToBlueprint ? {} : this.postWriting);
  }
}
