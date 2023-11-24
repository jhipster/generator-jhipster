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
import * as _ from 'lodash-es';
import BaseApplicationGenerator from '../base-application/index.mjs';
import { createDockerComposeFile, createDockerExtendedServices } from '../docker/support/index.mjs';
import { GENERATOR_BOOTSTRAP_APPLICATION_SERVER, GENERATOR_DOCKER } from '../generator-list.mjs';
import { dockerFiles } from './files.mjs';
import { SERVICE_COMPLETED_SUCCESSFULLY, SERVICE_HEALTHY } from './constants.mjs';
import { stringHashCode, createFaker } from '../base/support/index.mjs';
import { getJdbcUrl, getR2dbcUrl } from '../spring-data-relational/support/index.mjs';

const { intersection } = _;

export default class DockerGenerator extends BaseApplicationGenerator {
  hasServicesFile = false;

  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints(GENERATOR_DOCKER);
    }

    if (!this.delegateToBlueprint) {
      // TODO depend on GENERATOR_BOOTSTRAP_APPLICATION_SERVER.
      await this.dependsOnJHipster(GENERATOR_BOOTSTRAP_APPLICATION_SERVER);
    }
  }

  get loading() {
    return this.asLoadingTaskGroup({
      loading({ applicationDefaults }) {
        applicationDefaults({
          dockerServices: [],
        });
      },
    });
  }

  get [BaseApplicationGenerator.LOADING]() {
    return this.asLoadingTaskGroup(this.delegateTasksToBlueprint(() => this.loading));
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      dockerServices({ application }) {
        if (application.backendTypeSpringBoot) {
          application.dockerServices.push('app');
        }
        if (application.authenticationTypeOauth2) {
          application.dockerServices.push('keycloak');
        }
        if (application.searchEngineElasticsearch) {
          application.dockerServices.push('elasticsearch');
        }
        if (application.messageBrokerKafka || application.messageBrokerPulsar) {
          application.dockerServices.push(application.messageBroker);
        }
        if (application.serviceDiscoveryConsul || application.serviceDiscoveryEureka) {
          application.dockerServices.push(application.serviceDiscoveryType);
        }
        if (application.serviceDiscoveryAny || application.applicationTypeGateway || application.applicationTypeMicroservice) {
          application.dockerServices.push('zipkin');
        }
        if (application.enableSwaggerCodegen) {
          application.dockerServices.push('swagger-editor');
        }
        if (application.cacheProviderMemcached || application.cacheProviderRedis || application.cacheProviderHazelcast) {
          application.dockerServices.push(application.cacheProvider);
        }
        if (
          application.databaseTypeCassandra ||
          application.databaseTypeCouchbase ||
          application.databaseTypeMongodb ||
          application.databaseTypeNeo4j
        ) {
          application.dockerServices.push(application.databaseType);
        }
        if (
          application.prodDatabaseTypePostgresql ||
          application.prodDatabaseTypeMariadb ||
          application.prodDatabaseTypeMysql ||
          application.prodDatabaseTypeMssql
        ) {
          application.dockerServices.push(application.prodDatabaseType);
        }
      },
      addAppServices({ application, source }) {
        const writeInitialServicesFile = () => {
          if (!this.hasServicesFile) {
            const dockerFile = createDockerComposeFile(application.lowercaseBaseName);
            this.writeDestination(`${application.dockerServicesDir}services.yml`, dockerFile);
          }
          this.hasServicesFile = true;
        };

        source.addDockerExtendedServiceToApplicationAndServices = (...services) => {
          const extendedServices = createDockerExtendedServices(...services);
          writeInitialServicesFile();
          this.mergeDestinationYaml(`${application.dockerServicesDir}services.yml`, extendedServices);
          this.mergeDestinationYaml(`${application.dockerServicesDir}app.yml`, extendedServices);
        };

        source.addDockerExtendedServiceToServices = (...services) => {
          const extendedServices = createDockerExtendedServices(...services);
          writeInitialServicesFile();
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
                  ]),
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
          const faker = await createFaker();
          faker.seed(stringHashCode(application.baseName));
          application.keycloakSecrets = Array.from(Array(6), () => faker.string.uuid());
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
        if (application.dockerServices.includes('cassandra')) {
          const serviceName = application.databaseType;
          source.addDockerExtendedServiceToApplicationAndServices(
            { serviceName },
            { serviceFile: './cassandra.yml', serviceName: 'cassandra-migration' },
          );
          source.addDockerDependencyToApplication(
            { serviceName, condition: SERVICE_HEALTHY },
            { serviceName: 'cassandra-migration', condition: SERVICE_COMPLETED_SUCCESSFULLY },
          );
        }

        for (const serviceName of intersection(
          ['couchbase', 'mongodb', 'neo4j', 'postgresql', 'mysql', 'mariadb', 'mssql', 'elasticsearch', 'keycloak'],
          application.dockerServices,
        )) {
          source.addDockerExtendedServiceToApplicationAndServices({ serviceName });
          source.addDockerDependencyToApplication({ serviceName, condition: SERVICE_HEALTHY });
        }

        for (const serviceName of application.dockerServices.filter(service => ['redis', 'memcached', 'pulsar'].includes(service))) {
          source.addDockerExtendedServiceToApplicationAndServices({ serviceName });
        }

        if (application.dockerServices.includes('eureka')) {
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
        if (application.dockerServices.includes('consul')) {
          source.addDockerExtendedServiceToApplicationAndServices(
            { serviceName: 'consul' },
            { serviceFile: './consul.yml', serviceName: 'consul-config-loader' },
          );
        }
        if (application.dockerServices.includes('kafka')) {
          source.addDockerExtendedServiceToApplicationAndServices(
            { serviceName: 'kafka' },
            { serviceFile: './kafka.yml', serviceName: 'zookeeper' },
          );
        }
      },

      packageJsonScripts({ application }) {
        const scriptsStorage = this.packageJson.createStorage('scripts');
        const { databaseType, databaseTypeSql, prodDatabaseType, prodDatabaseTypeNo, prodDatabaseTypeOracle } = application;
        let postServicesSleep;

        if (databaseTypeSql) {
          if (prodDatabaseTypeNo || prodDatabaseTypeOracle) {
            scriptsStorage.set(
              'docker:db:up',
              `echo "Docker for db ${prodDatabaseType} not configured for application ${application.baseName}"`,
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
              postServicesSleep = 10;
            }
          } else {
            scriptsStorage.set(
              'docker:db:up',
              `echo "Docker for db ${databaseType} not configured for application ${application.baseName}"`,
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
        if (this.hasServicesFile) {
          scriptsStorage.set({
            'services:up': `docker compose -f ${application.dockerServicesDir}services.yml up --wait`,
            'ci:e2e:teardown:docker': `docker compose -f ${application.dockerServicesDir}services.yml down -v && docker ps -a`,
          });
        }
        scriptsStorage.set({
          'app:up': `docker compose -f ${application.dockerServicesDir}app.yml up --wait`,
          'ci:e2e:prepare:docker': 'npm run services:up --if-present && docker ps -a',
          'ci:e2e:prepare': 'npm run ci:e2e:prepare:docker',
          'ci:e2e:teardown': 'npm run ci:e2e:teardown:docker --if-present',
        });
      },
    });
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
    return this.asPostWritingTaskGroup(this.delegateToBlueprint ? {} : this.postWriting);
  }

  /**
   * @private
   * Returns the JDBC URL for a databaseType
   *
   * @param {string} databaseType
   * @param {*} options: databaseName, and required infos that depends of databaseType (hostname, localDirectory, ...)
   */
  getJDBCUrl(databaseType, options = {}) {
    return getJdbcUrl(databaseType, options);
  }

  /**
   * @private
   * Returns the R2DBC URL for a databaseType
   *
   * @param {string} databaseType
   * @param {*} options: databaseName, and required infos that depends of databaseType (hostname, localDirectory, ...)
   */
  getR2DBCUrl(databaseType, options = {}) {
    return getR2dbcUrl(databaseType, options);
  }
}
