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

import uniqBy from 'lodash-es/uniqBy.js';

import { getEntityDerivedPropertyMutations } from '../../../../lib/command/mutations.ts';
import type { FieldType } from '../../../../lib/jhipster/field-types.ts';
import { fieldTypes } from '../../../../lib/jhipster/index.ts';
import { mutateData, mutateDefaults } from '../../../../lib/utils/object.ts';
import databaseData from '../../../base-application/generators/database-bootstrap/support/database-data.ts';
import { isContentTypeField } from '../../../base-application/internal/content-type-fields.ts';
import { getFieldFakeDataDomain } from '../../../base-application/internal/fake-data.ts';
import { generateEntitySamples } from '../../../base-application/support/index.ts';
import type { Entity as ClientEntity } from '../../../client/types.ts';
import { javaValue } from '../../../java/support/index.ts';
import { getJavaValueGeneratorForType, getSpecificationBuildForType } from '../../../server/support/index.ts';
import {
  mutateApplicationLoading,
  mutateApplicationPreparing,
  mutateFilterableField,
  mutateFilterableRelationship,
} from '../../application.ts';
import command from '../../command.ts';
import { SpringBootApplicationGenerator } from '../../generator.ts';
import { getJdbcUrl, getR2dbcUrl } from '../data-relational/support/database-url.ts';

const { BYTES: TYPE_BYTES, BYTE_BUFFER: TYPE_BYTE_BUFFER } = fieldTypes.RelationalOnlyDBTypes;

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
      checkDatabase({ application }) {
        // The shared preparation accepts the relational databases of blueprints, Spring Boot only knows its own.
        if (application.databaseTypeSql) {
          for (const databaseType of [application.prodDatabaseType, application.devDatabaseType]) {
            if (!databaseData[databaseType!]) {
              throw new Error(`Database ${databaseType} is not supported by Spring Boot`);
            }
          }
        }
      },
      defaults({ applicationDefaults }) {
        applicationDefaults(mutateApplicationPreparing, {
          // Deprecated: Spring Boot 3 is no longer supported, springBoot4 is always true.
          springBoot4: true,
        });
      },
      hibernate({ application, applicationDefaults }) {
        if (application.databaseTypeSql && !application.reactive) {
          applicationDefaults({
            hibernateNamingPhysicalStrategy: 'org.hibernate.boot.model.naming.CamelCaseToUnderscoresNamingStrategy',
            hibernateNamingImplicitStrategy: 'org.springframework.boot.hibernate.SpringImplicitNamingStrategy',
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

        mutateData(dockerApplicationEnvironment, {
          _JAVA_OPTIONS: '-Xmx512m -Xms256m',
          SPRING_PROFILES_ACTIVE: 'prod,api-docs,secret-samples',
          MANAGEMENT_PROMETHEUS_METRICS_EXPORT_ENABLED: 'true',
        });

        // TODO move to spring-cloud:bootstrap generator
        if (application.serviceDiscoveryConsul) {
          mutateData(dockerApplicationEnvironment, {
            SPRING_CLOUD_CONSUL_HOST: 'consul',
            SPRING_CLOUD_CONSUL_PORT: '8500',
          });
        }
        if (application.serviceDiscoveryEureka) {
          // eslint-disable-next-line no-template-curly-in-string
          const jhipsterRegistryUrl = 'http://admin:$${jhipster.registry.password}@jhipster-registry:8761/';
          mutateData(dockerApplicationEnvironment, {
            EUREKA_CLIENT_SERVICE_URL_DEFAULTZONE: `${jhipsterRegistryUrl}eureka`,
            SPRING_CLOUD_CONFIG_URI: `${jhipsterRegistryUrl}config`,
          });
        }

        if (application.authenticationTypeSession) {
          mutateData(dockerApplicationEnvironment, {
            SPRING_SECURITY_REMEMBER_ME_KEY: application.rememberMeKey,
          });
        } else if (application.authenticationTypeOauth2) {
          const clientId = application.applicationTypeMicroservice ? 'internal' : 'web_app';
          mutateData(dockerApplicationEnvironment, {
            SPRING_SECURITY_OAUTH2_CLIENT_PROVIDER_OIDC_ISSUER_URI: 'http://keycloak:9080/realms/jhipster',
            SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_OIDC_CLIENT_ID: clientId,
            SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_OIDC_CLIENT_SECRET: clientId,
          });
        }

        if (application.generateInMemoryUserCredentials) {
          mutateData(dockerApplicationEnvironment, {
            SPRING_SECURITY_USER_NAME: application.defaultAdminUsername,
            SPRING_SECURITY_USER_PASSWORD: application.defaultAdminPassword,
            SPRING_SECURITY_USER_ROLES: application.defaultAdminRoles.join(','),
          });
        }

        // The variables of the database, with the host of its service: its name in the docker compose files of the
        // application, `<application>-<service>` in a deployment.
        const addDatabaseEnvironment = (environment: Record<string, string>, hostPrefix: string) => {
          if (application.databaseTypeSql) {
            const databaseName =
              application.prodDatabaseTypeMysql || application.prodDatabaseTypeMariadb ? baseName.toLowerCase() : baseName;
            const hostname = `${hostPrefix}${application.prodDatabaseType}`;
            const jdbcUrl = getJdbcUrl(application.prodDatabaseType!, {
              hostname,
              databaseName,
            });
            if (application.reactive) {
              mutateData(environment, {
                SPRING_R2DBC_URL: getR2dbcUrl(application.prodDatabaseType!, {
                  hostname,
                  databaseName,
                }),
                SPRING_R2DBC_USERNAME: application.prodDatabaseUsername,
                SPRING_R2DBC_PASSWORD: application.prodDatabasePassword,
              });
            } else {
              mutateData(environment, {
                SPRING_DATASOURCE_URL: jdbcUrl,
                SPRING_DATASOURCE_USERNAME: application.prodDatabaseUsername,
                SPRING_DATASOURCE_PASSWORD: application.prodDatabasePassword,
              });
            }
            mutateData(environment, {
              SPRING_LIQUIBASE_URL: jdbcUrl,
            });
          } else if (application.databaseTypeMongodb) {
            const mongodbUri = `mongodb://${hostPrefix}mongodb:27017/${application.baseName}`;
            mutateData(environment, {
              SPRING_MONGODB_URI: mongodbUri,
            });
          } else if (application.databaseTypeCouchbase) {
            mutateData(environment, {
              SPRING_COUCHBASE_USERNAME: 'Administrator',
              SPRING_COUCHBASE_PASSWORD: 'password',
              SPRING_COUCHBASE_CONNECTION_STRING: `${hostPrefix}couchbase`,
              JHIPSTER_DATABASE_COUCHBASE_BUCKET_NAME: application.baseName,
              JHIPSTER_SLEEP: '20', // Let database to start
            });
          } else if (application.databaseTypeNeo4j) {
            mutateData(environment, {
              SPRING_NEO4J_URI: `bolt://${hostPrefix}neo4j:7687`,
            });
            if (application.databaseMigrationLiquibase) {
              mutateData(environment, {
                SPRING_LIQUIBASE_URL: `jdbc:neo4j:bolt://${hostPrefix}neo4j:7687`,
              });
            }
          } else if (application.databaseTypeCassandra) {
            mutateData(environment, {
              SPRING_CASSANDRA_CONTACTPOINTS: `${hostPrefix}cassandra`,
              JHIPSTER_SLEEP: '10', // Let migration complete
            });
          }
        };
        addDatabaseEnvironment(dockerApplicationEnvironment, '');
        addDatabaseEnvironment(application.dockerDeploymentEnvironment, application.dockerDeploymentServicePrefix);
      },
    });
  }

  get [SpringBootApplicationGenerator.POST_PREPARING]() {
    return this.postPreparing;
  }
  get preparingEachEntity() {
    return this.asPreparingEachEntityTaskGroup({
      prepareEntity({ entity, application }) {
        if (entity.entityRestLayer === false) {
          mutateDefaults(entity as unknown as ClientEntity, { entityClientModelOnly: true });
        }

        const hasAnyAuthority = (authorities: string[]): string | undefined =>
          authorities.length > 0 ? `hasAnyAuthority(${authorities.map(auth => `'${auth}'`).join(',')})` : undefined;
        mutateDefaults(entity, getEntityDerivedPropertyMutations(command.entity), {
          entityPersistenceLayer: true,
          entityRestLayer: true,
          entitySpringPreAuthorize: hasAnyAuthority(entity.entityAuthority?.split(',') ?? []),
          entitySpringReadPreAuthorize: hasAnyAuthority([
            ...(entity.entityAuthority?.split(',') ?? []),
            ...(entity.entityReadAuthority?.split(',') ?? []),
          ]),
          serviceClass: ({ service }) => service === 'serviceClass',
          serviceImpl: ({ service }) => service === 'serviceImpl',
          serviceNo: ({ service }) => service === 'no',
          saveUserSnapshot: ({ hasRelationshipWithBuiltInUser, dto }) =>
            application.applicationTypeMicroservice &&
            application.authenticationTypeOauth2 &&
            hasRelationshipWithBuiltInUser &&
            dto === 'no',
        });
      },
    });
  }

  get [SpringBootApplicationGenerator.PREPARING_EACH_ENTITY]() {
    return this.preparingEachEntity;
  }

  get preparingEachEntityField() {
    return this.asPreparingEachEntityFieldTaskGroup({
      prepareField({ entity, field }) {
        if (field.mapstructExpression) {
          assert.equal(
            entity.dto,
            'mapstruct',
            `@MapstructExpression requires an Entity with mapstruct dto [${entity.name}.${field.fieldName}].`,
          );
          // Disable update form.
          field.readonly = true;
        }
      },
      prepareFilters({ field }) {
        mutateDefaults(field, {
          fieldJavaBuildSpecification: getSpecificationBuildForType(field.fieldType as FieldType),
          // The content type of a blob is not filtered, like the blob.
          filterableField:
            !([TYPE_BYTES, TYPE_BYTE_BUFFER] as string[]).includes(field.fieldType) && !field.transient && !isContentTypeField(field),
        });
        if (field.filterableField) {
          const { fieldType } = field;
          mutateDefaults(field, mutateFilterableField);

          if (field.fieldIsEnum) {
            const filterType = `${fieldType}Filter`;
            mutateDefaults(field, {
              propertyJavaFilterType: filterType,
              propertyJavaCustomFilter: { type: filterType, superType: `Filter<${fieldType}>`, fieldType },
            });
          } else if (
            field.fieldTypeDuration ||
            field.fieldTypeTemporal ||
            field.fieldTypeCharSequence ||
            field.fieldTypeNumeric ||
            field.fieldTypeBoolean
          ) {
            mutateDefaults(field, { propertyJavaFilterType: `${fieldType}Filter` });
          } else if (field.fieldTypeLocalTime) {
            const filterType = `${fieldType}Filter`;
            mutateDefaults(field, {
              propertyJavaFilterType: filterType,
              propertyJavaCustomFilter: { type: filterType, superType: `RangeFilter<${fieldType}>`, fieldType },
            });
          } else {
            mutateDefaults(field, { propertyJavaFilterType: `Filter<${fieldType}>` });
          }
        }
      },
    });
  }

  get [SpringBootApplicationGenerator.PREPARING_EACH_ENTITY_FIELD]() {
    return this.preparingEachEntityField;
  }

  get preparingEachEntityRelationship() {
    return this.asPreparingEachEntityRelationshipTaskGroup({
      prepareEntity({ relationship }) {
        const { primaryKey } = relationship.otherEntity;
        if (!primaryKey) return;

        const otherEntityPkField = primaryKey.fields[0];
        mutateDefaults(relationship, mutateFilterableRelationship, {
          propertyJavaFilterType: otherEntityPkField.propertyJavaFilterType,
          propertyJavaFilteredType: otherEntityPkField.propertyJavaFilteredType,
        });
      },
    });
  }

  get [SpringBootApplicationGenerator.PREPARING_EACH_ENTITY_RELATIONSHIP]() {
    return this.preparingEachEntityRelationship;
  }

  get postPreparingEachEntity() {
    return this.asPostPreparingEachEntityTaskGroup({
      prepareEntity({ entity }) {
        const { primaryKey } = entity;
        if (primaryKey) {
          mutateDefaults(primaryKey, {
            javaBuildSpecification: getSpecificationBuildForType(primaryKey.type),
            javaValueGenerator: getJavaValueGeneratorForType(primaryKey.type),
          });
          for (const field of primaryKey.fields) {
            mutateDefaults(field, { fieldJavaValueGenerator: getJavaValueGeneratorForType(field.fieldType) });
          }
        }
      },
      prepareTestValues({ entity }) {
        type TestField = (typeof entity.fields)[number];
        type TestValue = string | number | boolean;
        const isNumber = (field: TestField) =>
          field.fieldTypeInteger || field.fieldTypeLong || field.fieldTypeFloat || field.fieldTypeDouble || field.fieldTypeBigDecimal;
        const isTime = (field: TestField) =>
          field.fieldTypeLocalDate ||
          field.fieldTypeInstant ||
          field.fieldTypeZonedDateTime ||
          field.fieldTypeLocalTime ||
          field.fieldTypeDuration;
        // A type with an order has a smaller value too, which the range filters of the test look for below the default one.
        const durationMinutes = (duration: TestValue) => Number(/^PT(\d+)M$/.exec(duration as string)![1]);
        const compareTestValues = (field: TestField): ((a: TestValue, b: TestValue) => number) | undefined => {
          if (isNumber(field)) return (a, b) => (a as number) - (b as number);
          if (field.fieldTypeDuration) return (a, b) => durationMinutes(a) - durationMinutes(b);
          return isTime(field) ? (a, b) => (a as string).localeCompare(b as string) : undefined;
        };
        const testValuesCount = (field: TestField) => (compareTestValues(field) ? 3 : 2);
        // The values of the resource integration test, the default and the updated one of each field, and the smaller one of a
        // type with an order, drawn as entity samples in this order: the texts of a pattern, the other texts, the numbers,
        // the UUID, boolean and enum fields, the times.
        const sampleGroups: ((field: TestField) => boolean | undefined)[] = [
          field => field.fieldTypeString && field.fieldValidateRulesPattern !== undefined,
          field => field.fieldTypeString,
          isNumber,
          field => field.fieldTypeUUID || field.fieldTypeBoolean || field.fieldIsEnum,
          isTime,
        ];
        const sampleGroup = (field: TestField) => sampleGroups.findIndex(inGroup => inGroup(field));
        const sampleFields = entity.fields
          .filter(field => !field.id && !isContentTypeField(field) && sampleGroup(field) !== -1)
          .toSorted((a, b) => sampleGroup(a) - sampleGroup(b));
        // A date is written as its ISO 8601 text, a BigDecimal with the two decimals of its column, a Float or a Double without
        // the error of the binary floating point.
        const testValue = (field: TestField, value: unknown): TestValue | undefined => {
          if (value instanceof Date) return value.toISOString();
          if (typeof value !== 'number' || Number.isInteger(value)) return value as TestValue | undefined;
          return Number(field.fieldTypeBigDecimal ? value.toFixed(2) : value.toPrecision(15));
        };
        // The values of a field do not repeat, but for a field with fewer values than the test needs, like an enum of a
        // single value, whose samples repeat.
        const samples = generateEntitySamples(entity, {
          seed: 'resource-it',
          batches: sampleFields.map(field => ({
            fields: [field],
            format: 'json-serializable',
            count: testValuesCount(field),
            distinct: (getFieldFakeDataDomain(field)?.length ?? Infinity) >= testValuesCount(field),
          })),
        });

        for (const [index, field] of sampleFields.entries()) {
          const values = samples[index].map(sample => testValue(field, sample[field.fieldName])!);
          const compare = compareTestValues(field);
          let [smaller, sample, updated] = (compare ? values.toSorted(compare) : [undefined, ...values]) as [
            TestValue | undefined,
            TestValue,
            TestValue,
          ];
          if (isNumber(field)) {
            // A number of a small range repeats its values: the default and the updated ones are distinct when the range has two,
            // and the smaller one, which only filters, is below the default one.
            const distinctValues = [...new Set(values as number[])].toSorted((a, b) => a - b);
            if (distinctValues.length < values.length) {
              const step = field.fieldTypeInteger || field.fieldTypeLong ? 1 : 0.01;
              [sample, updated = sample] = distinctValues;
              smaller = testValue(field, sample - step);
            }
          }
          mutateDefaults(field, {
            sbTestDefaultValue: javaValue(field, sample),
            sbTestUpdatedValue: javaValue(field, updated),
            sbTestSmallerValue: smaller === undefined ? undefined : javaValue(field, smaller),
          });
        }

        // The blob of a file of the test has one byte, or a size within its minbytes and maxbytes, wrapped in a ByteBuffer
        // with Cassandra.
        for (const field of entity.fields.filter(field => field.fieldTypeBinary && !field.blobContentTypeText)) {
          const minBytes = field.fieldValidationMinBytes ? Number(field.fieldValidateRulesMinbytes) : 0;
          const maxBytes = field.fieldValidationMaxBytes ? Number(field.fieldValidateRulesMaxbytes) : Infinity;
          const size = Math.min(Math.max(1, minBytes), maxBytes);
          const [sample, updated] = [`TestUtil.createByteArray(${size}, "0")`, `TestUtil.createByteArray(${size}, "1")`].map(bytes =>
            field.fieldTypeBytes ? bytes : `ByteBuffer.wrap(${bytes})`,
          );
          mutateDefaults(field, {
            sbTestDefaultValue: sample,
            sbTestUpdatedValue: updated,
            // The byte arrays are validated by their size, a ByteBuffer is not.
            sbTestRejectedBlobSizes:
              field.fieldTypeBytes ? [...(minBytes > 0 ? [minBytes - 1] : []), ...(Number.isFinite(maxBytes) ? [maxBytes + 1] : [])] : [],
          });
        }

        // The blobs give no value as a sample: the fake data of a blob is a file.
        for (const field of entity.fields.filter(field => isContentTypeField(field) || field.blobContentTypeText)) {
          const [sample, updated] = isContentTypeField(field) ? ['image/jpg', 'image/png'] : ['AAAAAAAAAA', 'BBBBBBBBBB'];
          mutateDefaults(field, {
            sbTestDefaultValue: javaValue(field, sample),
            sbTestUpdatedValue: javaValue(field, updated),
          });
        }
      },
      prepareFilters({ application, entity }) {
        mutateDefaults(entity, {
          entityJavaFilterableProperties: [
            ...entity.fields.filter(field => field.filterableField),
            ...entity.relationships.filter(rel => !application.reactive || (rel.persistableRelationship && !rel.collection)),
          ],
          entityJavaCustomFilters: uniqBy(entity.fields.map(field => field.propertyJavaCustomFilter).filter(Boolean), 'type'),
        });
      },
    });
  }

  get [SpringBootApplicationGenerator.POST_PREPARING_EACH_ENTITY]() {
    return this.postPreparingEachEntity;
  }

  get default() {
    return this.asDefaultTaskGroup({
      publicRestIntegrationTests({ entities }) {
        // Integration tests of entities referenced from another package are used across packages, so they must be public.
        const referencedFromOtherPackages = new Set(
          entities.flatMap(entity =>
            entity.relationships
              .filter(relationship => relationship.otherEntity.entityAbsolutePackage !== entity.entityAbsolutePackage)
              .map(relationship => relationship.otherEntity),
          ),
        );
        for (const entity of entities) {
          mutateDefaults(entity, { entityRestIntegrationTestPublic: referencedFromOtherPackages.has(entity) });
        }
      },
    });
  }

  get [SpringBootApplicationGenerator.DEFAULT]() {
    return this.default;
  }
}
