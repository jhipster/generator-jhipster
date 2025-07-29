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

import { intersection } from 'lodash-es';
import BaseApplicationGenerator from '../base-simple-application/index.js';
import { createDockerComposeFile, createDockerExtendedServices } from '../docker/support/index.js';
import { createFaker } from '../base-application/support/index.ts';
import { stringHashCode } from '../../lib/utils/index.js';
import { getJdbcUrl, getR2dbcUrl } from '../spring-data-relational/support/index.js';
import type { Application as SpringBootApplication } from '../spring-boot/index.js';
import type { Application as SpringDataRelationalApplication } from '../spring-data-relational/index.js';
import { dockerFiles } from './files.js';
import { SERVICE_COMPLETED_SUCCESSFULLY, SERVICE_HEALTHY } from './constants.js';
import type {
  Application as DockerApplication,
  Config as DockerConfig,
  Options as DockerOptions,
  Source as DockerSource,
} from './types.js';

// Current implementation adds support for docker services and add docker services based on SpringBoot generated application.
// Splitting this generator into bootstrap generator (only injects docker support) and jhipster(adds docker service based on spring-boot implementation) should be considered.
type Application = DockerApplication & SpringDataRelationalApplication<any> & SpringBootApplication<any>;

export default class DockerGenerator extends BaseApplicationGenerator<Application, DockerConfig, DockerOptions, DockerSource> {
  hasServicesFile = false;

  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnBootstrapApplicationBase();
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
    return this.delegateTasksToBlueprint(() => this.loading);
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      async dockerServices({ application }) {
        const dockerServices = application.dockerServices!;
        if (application.authenticationTypeOauth2) {
          dockerServices.push('keycloak');

          const faker = await createFaker();
          faker.seed(stringHashCode(application.baseName));
          application.keycloakSecrets = Array.from(Array(6), () => faker.string.uuid());
        }
        if (application.searchEngineElasticsearch) {
          dockerServices.push('elasticsearch');
        }
        if (application.messageBrokerKafka || application.messageBrokerPulsar) {
          dockerServices.push(application.messageBroker!);
        }
        if (application.serviceDiscoveryConsul || application.serviceDiscoveryEureka) {
          dockerServices.push(application.serviceDiscoveryType!);
        }
        if (application.serviceDiscoveryAny || application.applicationTypeGateway || application.applicationTypeMicroservice) {
          dockerServices.push('zipkin');
        }
        if (application.enableSwaggerCodegen) {
          dockerServices.push('swagger-editor');
        }
        if (application.cacheProviderMemcached || application.cacheProviderRedis || application.cacheProviderHazelcast) {
          dockerServices.push(application.cacheProvider!);
        }
        if (
          application.databaseTypeCassandra ||
          application.databaseTypeCouchbase ||
          application.databaseTypeMongodb ||
          application.databaseTypeNeo4j
        ) {
          dockerServices.push(application.databaseType!);
        }
        if (
          application.prodDatabaseTypePostgresql ||
          application.prodDatabaseTypeMariadb ||
          application.prodDatabaseTypeMysql ||
          application.prodDatabaseTypeMssql
        ) {
          dockerServices.push(application.prodDatabaseType);
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

        source.addDockerExtendedServiceToApplication = (...services) => {
          const extendedServices = createDockerExtendedServices(...services);
          this.mergeDestinationYaml(`${application.dockerServicesDir}app.yml`, extendedServices);
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
        if (application.dockerServices!.includes('cassandra')) {
          const serviceName = application.databaseType!;
          source.addDockerExtendedServiceToApplicationAndServices!(
            { serviceName },
            { serviceFile: './cassandra.yml', serviceName: 'cassandra-migration' },
          );
          source.addDockerDependencyToApplication!(
            { serviceName, condition: SERVICE_HEALTHY },
            { serviceName: 'cassandra-migration', condition: SERVICE_COMPLETED_SUCCESSFULLY },
          );
        }

        for (const serviceName of intersection(['postgresql', 'mysql', 'mariadb', 'mssql'], application.dockerServices)) {
          // Blank profile services starts if no profile is passed.
          const profiles = application.prodDatabaseType === application.devDatabaseType ? undefined : ['', 'prod'];
          source.addDockerExtendedServiceToApplication!({ serviceName });
          source.addDockerExtendedServiceToServices!({ serviceName, additionalConfig: { profiles } });
          source.addDockerDependencyToApplication!({ serviceName, condition: SERVICE_HEALTHY });
        }

        for (const serviceName of intersection(
          ['couchbase', 'mongodb', 'neo4j', 'elasticsearch', 'keycloak'],
          application.dockerServices,
        )) {
          source.addDockerExtendedServiceToApplicationAndServices!({ serviceName });
          source.addDockerDependencyToApplication!({ serviceName, condition: SERVICE_HEALTHY });
        }

        for (const serviceName of application.dockerServices!.filter(service => ['redis', 'memcached', 'pulsar'].includes(service))) {
          source.addDockerExtendedServiceToApplicationAndServices!({ serviceName });
        }

        if (application.dockerServices!.includes('eureka')) {
          const depends_on = application.authenticationTypeOauth2
            ? {
                keycloak: {
                  condition: SERVICE_HEALTHY,
                },
              }
            : undefined;
          source.addDockerExtendedServiceToApplicationAndServices!({
            serviceName: 'jhipster-registry',
            additionalConfig: {
              depends_on,
            },
          });

          source.addDockerDependencyToApplication!({ serviceName: 'jhipster-registry', condition: SERVICE_HEALTHY });
        }
        if (application.dockerServices!.includes('consul')) {
          source.addDockerExtendedServiceToApplicationAndServices!(
            { serviceName: 'consul' },
            { serviceFile: './consul.yml', serviceName: 'consul-config-loader' },
          );
        }
        if (application.dockerServices!.includes('kafka')) {
          source.addDockerExtendedServiceToApplicationAndServices!({ serviceName: 'kafka' });
        }
      },

      packageJsonScripts({ application }) {
        const scriptsStorage = this.packageJson.createStorage('scripts');
        const { databaseType, databaseTypeSql, prodDatabaseType, prodDatabaseTypeOracle } = application;
        let postServicesSleep;

        if (databaseTypeSql) {
          if (prodDatabaseTypeOracle) {
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

  get end() {
    return this.asEndTaskGroup({
      async dockerComposeUp({ control }) {
        if (!control.enviromentHasDockerCompose) {
          this.log('');
          this.log.warn(
            'Docker Compose V2 is not installed on your computer. Some features may not work as expected. Read https://docs.docker.com/compose/install/',
          );
        }
      },
    });
  }

  /**
   * @private
   * Returns the JDBC URL for a databaseType
   */
  getJDBCUrl(...args: Parameters<typeof getJdbcUrl>) {
    return getJdbcUrl(...args);
  }

  /**
   * @private
   * Returns the R2DBC URL for a databaseType
   *
   * @param {string} databaseType
   * @param {*} options: databaseName, and required infos that depends of databaseType (hostname, localDirectory, ...)
   */
  getR2DBCUrl(...args: Parameters<typeof getR2dbcUrl>) {
    return getR2dbcUrl(...args);
  }
}
