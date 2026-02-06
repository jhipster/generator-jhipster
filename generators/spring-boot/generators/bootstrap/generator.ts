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
import { mutateData } from '../../../../lib/utils/object.ts';
import { mutateApplicationLoading, mutateApplicationPreparing } from '../../application.ts';
import { SpringBootApplicationGenerator } from '../../generator.ts';
import { getJdbcUrl, getR2dbcUrl } from '../data-relational/support/database-url.ts';

export default class BootstrapGenerator extends SpringBootApplicationGenerator {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    await this.dependsOnBootstrap('java');
    await this.dependsOnBootstrap('server');
  }

  get loading() {
    return this.asLoadingTaskGroup({
      defaults({ applicationDefaults }) {
        applicationDefaults(mutateApplicationLoading);
      },
    });
  }

  get [SpringBootApplicationGenerator.LOADING]() {
    return this.loading;
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      defaults({ applicationDefaults }) {
        applicationDefaults(mutateApplicationPreparing, {
          springBoot4: data => Boolean(!(data.databaseTypeSql && data.reactive) && !data.databaseTypeCouchbase),
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
    });
  }

  get [SpringBootApplicationGenerator.PREPARING]() {
    return this.preparing;
  }

  get postPreparing() {
    return this.asPostPreparingTaskGroup({
      dockerEnvironment({ application }) {
        const { baseName, dockerApplicationEnvironment } = application;

        mutateData(dockerApplicationEnvironment as any, {
          _JAVA_OPTIONS: '-Xmx512m -Xms256m',
          SPRING_PROFILES_ACTIVE: 'prod,api-docs',
          MANAGEMENT_PROMETHEUS_METRICS_EXPORT_ENABLED: 'true',
        });

        // TODO move to spring-cloud:bootstrap generator
        if (application.serviceDiscoveryConsul) {
          mutateData(dockerApplicationEnvironment as any, {
            SPRING_CLOUD_CONSUL_HOST: 'consul',
            SPRING_CLOUD_CONSUL_PORT: '8500',
          });
        }
        if (application.serviceDiscoveryEureka) {
          // eslint-disable-next-line no-template-curly-in-string
          const jhipsterRegistryUrl = 'http://admin:$${jhipster.registry.password}@jhipster-registry:8761/';
          mutateData(dockerApplicationEnvironment as any, {
            EUREKA_CLIENT_SERVICE_URL_DEFAULTZONE: `${jhipsterRegistryUrl}eureka`,
            SPRING_CLOUD_CONFIG_URI: `${jhipsterRegistryUrl}config`,
          });
        }

        if (application.authenticationTypeSession) {
          mutateData(dockerApplicationEnvironment as any, {
            SPRING_SECURITY_REMEMBER_ME_KEY: application.rememberMeKey,
          });
        }
        if (application.generateInMemoryUserCredentials) {
          mutateData(dockerApplicationEnvironment as any, {
            SPRING_SECURITY_USER_NAME: 'admin',
            SPRING_SECURITY_USER_PASSWORD: 'admin',
            SPRING_SECURITY_USER_ROLES: 'ADMIN,USER',
          });
        }

        if (application.databaseTypeSql) {
          const databaseName = application.prodDatabaseTypeMysql || application.prodDatabaseTypeMariadb ? baseName.toLowerCase() : baseName;
          const jdbcUrl = getJdbcUrl(application.prodDatabaseType, {
            hostname: application.prodDatabaseType,
            databaseName,
          });
          if (application.reactive) {
            mutateData(dockerApplicationEnvironment as any, {
              SPRING_R2DBC_URL: getR2dbcUrl(application.prodDatabaseType, {
                hostname: application.prodDatabaseType,
                databaseName,
              }),
              SPRING_R2DBC_USERNAME: application.prodDatabaseUsername,
              SPRING_R2DBC_PASSWORD: application.prodDatabasePassword,
            });
          } else {
            mutateData(dockerApplicationEnvironment as any, {
              SPRING_DATASOURCE_URL: jdbcUrl,
              SPRING_DATASOURCE_USERNAME: application.prodDatabaseUsername,
              SPRING_DATASOURCE_PASSWORD: application.prodDatabasePassword,
            });
          }
          mutateData(dockerApplicationEnvironment as any, {
            SPRING_LIQUIBASE_URL: jdbcUrl,
          });
        } else if (application.databaseTypeMongodb) {
          const mongodbUri = `mongodb://mongodb:27017/${application.baseName}`;
          mutateData(dockerApplicationEnvironment as any, {
            SPRING_MONGODB_URI: mongodbUri,
          });
        } else if (application.databaseTypeCouchbase) {
          mutateData(dockerApplicationEnvironment as any, {
            SPRING_COUCHBASE_USERNAME: 'Administrator',
            SPRING_COUCHBASE_PASSWORD: 'password',
          });
        }
      },
    });
  }

  get [SpringBootApplicationGenerator.POST_PREPARING]() {
    return this.postPreparing;
  }
}
