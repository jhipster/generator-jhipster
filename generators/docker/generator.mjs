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
/* eslint-disable camelcase */
import BaseApplicationGenerator from '../base-application/index.mjs';
import { createDockerComposeFile, createDockerExtendedServices } from '../base-docker/utils.mjs';
import { GENERATOR_BOOTSTRAP_APPLICATION_SERVER, GENERATOR_DOCKER } from '../generator-list.mjs';
import { dockerFiles } from './files.mjs';
import constants from '../generator-constants.cjs';

const SERVICE_HEALTHY = 'service_healthy';
const SERVICE_STARTED = 'service_started';

/**
 * @class
 * @extends {BaseApplicationGenerator<import('../server/types.mjs').SpringBootApplication>}
 */
export default class DockerGenerator extends BaseApplicationGenerator {
  constructor(args, options, features) {
    super(args, options, { unique: 'namespace', ...features });
  }

  async _postConstruct() {
    // TODO depend on GENERATOR_BOOTSTRAP_APPLICATION_SERVER.
    await this.dependsOnJHipster(GENERATOR_BOOTSTRAP_APPLICATION_SERVER);
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints(GENERATOR_DOCKER);
    }
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      loadConstants({ application }) {
        application.DOCKER_JHIPSTER_REGISTRY = constants.DOCKER_JHIPSTER_REGISTRY;
        application.DOCKER_JHIPSTER_CONTROL_CENTER = constants.DOCKER_JHIPSTER_CONTROL_CENTER;
        application.DOCKER_JAVA_JRE = constants.DOCKER_JAVA_JRE;
        application.DOCKER_MYSQL = constants.DOCKER_MYSQL;
        application.DOCKER_MARIADB = constants.DOCKER_MARIADB;
        application.DOCKER_MONGODB = constants.DOCKER_MONGODB;
        application.DOCKER_COUCHBASE = constants.DOCKER_COUCHBASE;
        application.DOCKER_MSSQL = constants.DOCKER_MSSQL;
        application.DOCKER_NEO4J = constants.DOCKER_NEO4J;
        application.DOCKER_HAZELCAST_MANAGEMENT_CENTER = constants.DOCKER_HAZELCAST_MANAGEMENT_CENTER;
        application.DOCKER_MEMCACHED = constants.DOCKER_MEMCACHED;
        application.DOCKER_REDIS = constants.DOCKER_REDIS;
        application.DOCKER_CASSANDRA = constants.DOCKER_CASSANDRA;
        application.DOCKER_KAFKA = constants.DOCKER_KAFKA;
        application.KAFKA_VERSION = constants.KAFKA_VERSION;
        application.DOCKER_ZOOKEEPER = constants.DOCKER_ZOOKEEPER;
        application.DOCKER_SONAR = constants.DOCKER_SONAR;
        application.DOCKER_CONSUL = constants.DOCKER_CONSUL;
        application.DOCKER_CONSUL_CONFIG_LOADER = constants.DOCKER_CONSUL_CONFIG_LOADER;
        application.DOCKER_SWAGGER_EDITOR = constants.DOCKER_SWAGGER_EDITOR;
        application.DOCKER_PROMETHEUS = constants.DOCKER_PROMETHEUS;
        application.DOCKER_GRAFANA = constants.DOCKER_GRAFANA;
        application.DOCKER_ZIPKIN = constants.DOCKER_ZIPKIN;
      },

      sayHello({ application, source }) {
        source.addDockerExtendedServiceToApplicationServices = (...services) => {
          const extendedServices = createDockerExtendedServices(...services);
          this.mergeDestinationYaml(`${application.dockerServicesDir}services.yml`, extendedServices);
          this.mergeDestinationYaml(`${application.dockerServicesDir}app.yml`, extendedServices);
        };

        source.addDockerDependencyToApplication = ({ serviceName, condition }) => {
          this.mergeDestinationYaml(`${application.dockerServicesDir}app.yml`, {
            services: {
              app: {
                depends_on: {
                  [serviceName]: {
                    condition,
                  },
                },
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
        const dockerFile = createDockerComposeFile(application.lowercaseBaseName);
        this.writeDestination(`${application.dockerServicesDir}services.yml`, dockerFile);

        if (application.prodDatabaseTypePostgresql) {
          source.addDockerExtendedServiceToApplicationServices({
            serviceName: application.prodDatabaseType,
            additionalConfig: {
              healthcheck: {
                test: ['CMD-SHELL', 'pg_isready'],
                interval: '10s',
                timeout: '5s',
                retries: 5,
              },
            },
          });
          source.addDockerDependencyToApplication({ serviceName: application.prodDatabaseType, condition: SERVICE_HEALTHY });
        } else if (application.databaseTypeSql && !application.prodDatabaseTypeOracle) {
          source.addDockerExtendedServiceToApplicationServices({ serviceName: application.prodDatabaseType });
          source.addDockerDependencyToApplication({ serviceName: application.prodDatabaseType, condition: SERVICE_STARTED });
        } else if (application.databaseTypeCassandra) {
          source.addDockerExtendedServiceToApplicationServices(
            {
              serviceName: 'cassandra',
              additionalConfig: {
                healthcheck: {
                  test: ['CMD-SHELL', '[ $$(nodetool statusgossip) = running ]'],
                  interval: '30s',
                  timeout: '10s',
                  retries: 5,
                },
              },
            },
            { serviceFile: './cassandra.yml', serviceName: 'cassandra-migration' }
          );
          source.addDockerDependencyToApplication({ serviceName: application.prodDatabaseType, condition: SERVICE_STARTED });
        } else if (!application.databaseTypeSql) {
          source.addDockerExtendedServiceToApplicationServices({ serviceName: application.databaseType });
          source.addDockerDependencyToApplication({ serviceName: application.databaseType, condition: SERVICE_STARTED });
        }

        if (application.searchEngineElasticsearch) {
          source.addDockerExtendedServiceToApplicationServices({
            serviceName: application.searchEngine,
            additionalConfig: {
              healthcheck: {
                test: [
                  'CMD',
                  'curl',
                  '--fail',
                  'http://localhost:9200/_cluster/health?wait_for_status=green&timeout=1s',
                  '||',
                  'exit',
                  '1',
                ],
                interval: '5s',
                timeout: '3s',
              },
            },
          });
          source.addDockerDependencyToApplication({ serviceName: application.searchEngine, condition: SERVICE_HEALTHY });
        }
        if (application.cacheProviderMemcached || application.cacheProviderRedis) {
          source.addDockerExtendedServiceToApplicationServices({ serviceName: application.cacheProvider });
        }
        if (application.authenticationTypeOauth2) {
          source.addDockerExtendedServiceToApplicationServices({
            serviceName: 'keycloak',
            additionalConfig: {
              healthcheck: {
                test: ['CMD', 'curl', '-f', 'http://localhost:9080/realms/jhipster'],
                interval: '5s',
                timeout: '5s',
                retries: 20,
                start_period: '40s',
              },
            },
          });
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
          source.addDockerExtendedServiceToApplicationServices({
            serviceName: 'jhipster-registry',
            additionalConfig: {
              healthcheck: {
                test: ['CMD', 'curl', '-f', 'http://localhost:8761/management/health'],
                interval: '5s',
                timeout: '5s',
                retries: 20,
                start_period: '10s',
              },
              depends_on,
            },
          });
          // extendedEurekaServices.services['jhipster-registry'].environment = ['JHIPSTER_SLEEP=20'];

          source.addDockerDependencyToApplication({ serviceName: 'jhipster-registry', condition: SERVICE_HEALTHY });
        }
        if (application.serviceDiscoveryConsul) {
          source.addDockerExtendedServiceToApplicationServices(
            { serviceName: 'consul' },
            { serviceFile: './consul.yml', serviceName: 'consul-config-loader' }
          );
        }
        if (application.messageBrokerKafka) {
          source.addDockerExtendedServiceToApplicationServices(
            { serviceName: 'kafka' },
            { serviceFile: './kafka.yml', serviceName: 'zookeeper' }
          );
        }
      },
    });
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
    return this.asPostWritingTaskGroup(this.delegateToBlueprint ? {} : this.postWriting);
  }
}
