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

/**
 * @class
 * @extends {BaseApplicationGenerator<import('../server/types.mjs').SpringBootApplication>}
 */
export default class DockerGenerator extends BaseApplicationGenerator {
  constructor(args, options, features) {
    super(args, options, { unique: 'namespace', ...features });
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      sayHello({ application, source }) {
        source.addDockerExtendedServiceToApplicationServices = (...services) => {
          const extendedServices = createDockerExtendedServices(...services);
          this.mergeDestinationYaml(`${application.dockerServicesDir}services.yml`, extendedServices);
          this.mergeDestinationYaml(`${application.dockerServicesDir}app.yml`, extendedServices);
        };

        source.addDockerDependencyToApplication = ({ serviceName, condition }) => {
          this.mergeDestinationYaml(`${application.dockerServicesDir}app.yml`, {
            app: {
              depends_on: {
                [serviceName]: {
                  condition,
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

  get postWriting() {
    return this.asPostWritingTaskGroup({
      async dockerServices({ application, source }) {
        const dockerFile = createDockerComposeFile(application.lowercaseBaseName);
        this.writeDestination(`${application.dockerServicesDir}services.yml`, dockerFile);

        if (application.databaseTypeSql && !application.prodDatabaseType) {
          source.addDockerExtendedServiceToApplicationServices({ serviceName: application.prodDatabaseType });
          source.addDockerDependencyToApplication({ serviceName: application.prodDatabaseType, condition: 'service_started' });
        } else if (application.databaseTypeCassandra) {
          source.addDockerExtendedServiceToApplicationServices(
            { serviceName: 'cassandra' },
            { serviceFile: './cassandra.yml', serviceName: 'cassandra-migration' }
          );
          source.addDockerDependencyToApplication({ serviceName: application.prodDatabaseType, condition: 'service_started' });
        } else if (!application.databaseTypeSql) {
          source.addDockerExtendedServiceToApplicationServices({ serviceName: application.databaseType });
          source.addDockerDependencyToApplication({ serviceName: application.databaseType, condition: 'service_started' });
        }

        if (application.searchEngineElasticsearch) {
          source.addDockerExtendedServiceToApplicationServices({ serviceName: application.searchEngine });
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
          source.addDockerDependencyToApplication({ serviceName: 'keycloak', condition: 'service_healthy' });
        }

        if (application.serviceDiscoveryEureka) {
          const depends_on = application.authenticationTypeOauth2
            ? {
                keycloak: {
                  condition: 'service_healthy',
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

          source.addDockerDependencyToApplication({ serviceName: 'jhipster-registry', condition: 'service_healthy' });
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
