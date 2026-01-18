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
import { getDatabaseTypeData } from '../../../server/support/database.ts';
import { getJdbcUrl, getR2dbcUrl } from '../../../spring-data/generators/relational/support/database-url.ts';
import { SpringBootApplicationGenerator } from '../../generator.ts';

export default class BootstrapGenerator extends SpringBootApplicationGenerator {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    await this.dependsOnBootstrap('java');
    await this.dependsOnBootstrap('server');
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      defaults({ applicationDefaults }) {
        applicationDefaults({
          springBoot4: data =>
            Boolean(
              !(data.databaseTypeSql && data.reactive) &&
              !(data.databaseTypeCassandra && data.reactive) &&
              !data.databaseTypeCouchbase &&
              !data.cacheProviderInfinispan,
            ),
          springDataDescription: ({ databaseType, reactive }) => {
            let springDataDatabase: string;
            if (databaseType !== 'sql') {
              springDataDatabase = getDatabaseTypeData(databaseType as string).name;
              if (reactive) {
                springDataDatabase += ' reactive';
              }
            } else {
              springDataDatabase = reactive ? 'R2DBC' : 'JPA';
            }
            return `Spring Data ${springDataDatabase}`;
          },
        });
      },
      hibernate({ application, applicationDefaults }) {
        if (application.databaseTypeSql && !application.reactive) {
          applicationDefaults({
            hibernateNamingPhysicalStrategy: 'org.hibernate.boot.model.naming.CamelCaseToUnderscoresNamingStrategy',
            hibernateNamingImplicitStrategy: `org.springframework.boot${application.springBoot4 ? '' : '.orm.jpa'}.hibernate.SpringImplicitNamingStrategy`,
          });
        }
      },
      dockerEnvironment({ application }) {
        const { baseName, dockerApplicationEnvironment } = application;

        Object.assign(application.dockerApplicationEnvironment, {
          _JAVA_OPTIONS: '-Xmx512m -Xms256m',
          SPRING_PROFILES_ACTIVE: 'prod,api-docs',
          MANAGEMENT_PROMETHEUS_METRICS_EXPORT_ENABLED: 'true',
        });

        // TODO move to spring-cloud:bootstrap generator
        if (application.serviceDiscoveryConsul) {
          dockerApplicationEnvironment.SPRING_CLOUD_CONSUL_HOST = 'consul';
          dockerApplicationEnvironment.SPRING_CLOUD_CONSUL_PORT = '8500';
        }
        if (application.serviceDiscoveryEureka) {
          // eslint-disable-next-line no-template-curly-in-string
          const jhipsterRegistryUrl = 'http://admin:$${jhipster.registry.password}@jhipster-registry:8761/';
          dockerApplicationEnvironment.EUREKA_CLIENT_SERVICE_URL_DEFAULTZONE = `${jhipsterRegistryUrl}eureka`;
          dockerApplicationEnvironment.SPRING_CLOUD_CONFIG_URI = `${jhipsterRegistryUrl}config`;
        }
        if (application.databaseTypeSql) {
          const databaseName = application.prodDatabaseTypeMysql || application.prodDatabaseTypeMariadb ? baseName.toLowerCase() : baseName;
          const jdbcUrl = getJdbcUrl(application.prodDatabaseType, {
            hostname: application.prodDatabaseType,
            databaseName,
          });
          if (application.reactive) {
            dockerApplicationEnvironment.SPRING_R2DBC_URL = getR2dbcUrl(application.prodDatabaseType, {
              hostname: application.prodDatabaseType,
              databaseName,
            });
          } else {
            dockerApplicationEnvironment.SPRING_DATASOURCE_URL = jdbcUrl;
          }
          dockerApplicationEnvironment.SPRING_LIQUIBASE_URL = jdbcUrl;
        } else if (application.databaseTypeMongodb) {
          const mongodbUri = `mongodb://mongodb:27017/${application.baseName}`;
          application.dockerApplicationEnvironment.SPRING_MONGODB_URI = mongodbUri;
        }
      },
    });
  }

  get [SpringBootApplicationGenerator.PREPARING]() {
    return this.preparing;
  }
}
