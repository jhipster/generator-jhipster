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
import chalk from 'chalk';
import { lowerFirst, sortedUniqBy } from 'lodash-es';

import { APPLICATION_TYPE_GATEWAY, APPLICATION_TYPE_MICROSERVICE } from '../../lib/core/application-types.ts';
import type { FieldType } from '../../lib/jhipster/field-types.ts';
import {
  cacheTypes,
  databaseTypes,
  fieldTypes,
  messageBrokerTypes,
  searchEngineTypes,
  testFrameworkTypes,
  websocketTypes,
} from '../../lib/jhipster/index.ts';
import { mutateData } from '../../lib/utils/index.ts';
import BaseApplicationGenerator from '../base-application/index.ts';
import { createNeedleCallback, isWin32 } from '../base-core/support/index.ts';
import { editPropertiesFileCallback } from '../base-core/support/properties-file.ts';
import type { Config as ClientConfig, Entity as ClientEntity } from '../client/types.ts';
import type { Source as CommonSource } from '../common/types.ts';
import type { Entity as CypressEntity } from '../cypress/types.ts';
import { ADD_SPRING_MILESTONE_REPOSITORY } from '../generator-constants.ts';
import { addJavaImport, generateKeyStore, javaBeanCase } from '../java/support/index.ts';
import type { JavaArtifactType } from '../java-simple-application/types.ts';
import {
  getJavaValueGeneratorForType,
  getSpecificationBuildForType,
  insertContentIntoApplicationProperties,
  getPrimaryKeyValue
} from '../server/support/index.ts';
import type { Config as SpringCacheConfig } from '../spring-cache/types.ts';
import type { Config as SpringCloudStreamConfig } from '../spring-cloud-stream/types.ts';

import cleanupTask from './cleanup.ts';
import { writeFiles as writeEntityFiles } from './entity-files.ts';
import { serverFiles } from './files.ts';
import { askForOptionalItems, askForServerSideOpts, askForServerTestOpts } from './prompts.ts';
import springBootDependencies from './resources/spring-boot-dependencies.ts';
import type {
  Application as SpringBootApplication,
  Config as SpringBootConfig,
  Entity as SpringBootEntity,
  Options as SpringBootOptions,
  Source as SpringBootSource,
  SpringBootModule,
} from './types.ts';

const { CAFFEINE, EHCACHE, HAZELCAST, INFINISPAN, MEMCACHED, REDIS } = cacheTypes;
const { NO: NO_WEBSOCKET, SPRING_WEBSOCKET } = websocketTypes;
const { CASSANDRA, COUCHBASE, MONGODB, NEO4J, SQL } = databaseTypes;
const { KAFKA, PULSAR } = messageBrokerTypes;
const { ELASTICSEARCH } = searchEngineTypes;

const { BYTES: TYPE_BYTES, BYTE_BUFFER: TYPE_BYTE_BUFFER } = fieldTypes.RelationalOnlyDBTypes;
const { CUCUMBER, GATLING } = testFrameworkTypes;

export class SpringBootApplicationGenerator extends BaseApplicationGenerator<
  SpringBootEntity,
  SpringBootApplication,
  SpringBootConfig,
  SpringBootOptions,
  SpringBootSource
> {}

export default class SpringBootGenerator extends SpringBootApplicationGenerator {
  fakeKeytool!: boolean;

  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnBootstrap('spring-boot');
      await this.dependsOnJHipster('jhipster:java');
      await this.dependsOnJHipster('jhipster:java:domain');
      await this.dependsOnJHipster('jhipster:java-simple-application:build-tool');
      await this.dependsOnJHipster('jhipster:java:server');
    }
  }

  get prompting() {
    return this.asPromptingTaskGroup({
      askForServerTestOpts,
      askForServerSideOpts,
      askForOptionalItems,
    });
  }

  get [BaseApplicationGenerator.PROMPTING]() {
    return this.delegateTasksToBlueprint(() => this.prompting);
  }

  get configuring() {
    return this.asConfiguringTaskGroup({
      syncUserWithIdpMigration({ control }) {
        if (this.jhipsterConfig.syncUserWithIdp === undefined && this.jhipsterConfigWithDefaults.authenticationType === 'oauth2') {
          if (control.isJhipsterVersionLessThan('8.1.1')) {
            this.jhipsterConfig.syncUserWithIdp = true;
          }
        }
      },
      feignMigration({ control }) {
        const { reactive, applicationType, feignClient } = this.jhipsterConfigWithDefaults;
        if (feignClient) {
          if (reactive) {
            this.handleCheckFailure('Feign client is not supported by reactive applications.');
          }
          if (applicationType !== APPLICATION_TYPE_MICROSERVICE) {
            this.handleCheckFailure('Feign client is only supported by microservice applications.');
          }
        }
        if (
          feignClient === undefined &&
          control.isJhipsterVersionLessThan('8.0.1') &&
          !reactive &&
          applicationType === APPLICATION_TYPE_MICROSERVICE
        ) {
          this.jhipsterConfig.feignClient = true;
        }
      },
    });
  }

  get [BaseApplicationGenerator.CONFIGURING]() {
    return this.delegateTasksToBlueprint(() => this.configuring);
  }

  get composing() {
    return this.asComposingTaskGroup({
      async composing() {
        const {
          applicationType,
          authenticationType,
          databaseType,
          graalvmSupport,
          searchEngine,
          websocket,
          testFrameworks,
          feignClient,
          enableSwaggerCodegen,
        } = this.jhipsterConfigWithDefaults;
        const { cacheProvider } = this.jhipsterConfigWithDefaults as SpringCacheConfig;
        const { messageBroker } = this.jhipsterConfigWithDefaults as SpringCloudStreamConfig;

        await this.composeWithJHipster('jhipster:java:i18n');
        await this.composeWithJHipster('docker');
        await this.composeWithJHipster('jhipster:java-simple-application:jib');
        await this.composeWithJHipster('jhipster:java-simple-application:code-quality');

        if (authenticationType === 'jwt' || authenticationType === 'oauth2') {
          await this.composeWithJHipster(`jhipster:spring-boot:${authenticationType}`);
        }

        if (graalvmSupport) {
          await this.composeWithJHipster('jhipster:java-simple-application:graalvm');
        }

        if (enableSwaggerCodegen) {
          await this.composeWithJHipster('jhipster:java-simple-application:openapi-generator');
        }

        if (applicationType === APPLICATION_TYPE_GATEWAY) {
          await this.composeWithJHipster('jhipster:spring-cloud:gateway');
        }

        if (testFrameworks?.includes(CUCUMBER)) {
          await this.composeWithJHipster('jhipster:spring-boot:cucumber');
        }
        if (testFrameworks?.includes(GATLING)) {
          await this.composeWithJHipster('jhipster:java:gatling');
        }
        if (feignClient) {
          await this.composeWithJHipster('jhipster:spring-boot:feign-client');
        }

        if (databaseType === SQL) {
          await this.composeWithJHipster('jhipster:spring-data:relational');
        } else if (databaseType === CASSANDRA) {
          await this.composeWithJHipster('jhipster:spring-data:cassandra');
        } else if (databaseType === COUCHBASE) {
          await this.composeWithJHipster('jhipster:spring-data:couchbase');
        } else if (databaseType === MONGODB) {
          await this.composeWithJHipster('jhipster:spring-data:mongodb');
        } else if (databaseType === NEO4J) {
          await this.composeWithJHipster('jhipster:spring-data:neo4j');
        }
        if (messageBroker === KAFKA || messageBroker === PULSAR) {
          await this.composeWithJHipster('spring-cloud-stream');
        }
        if (searchEngine === ELASTICSEARCH) {
          await this.composeWithJHipster('jhipster:spring-data:elasticsearch');
        }
        if (websocket === SPRING_WEBSOCKET) {
          await this.composeWithJHipster('jhipster:spring-boot:websocket');
        }
        if (([EHCACHE, CAFFEINE, HAZELCAST, INFINISPAN, MEMCACHED, REDIS] as string[]).includes(cacheProvider!)) {
          await this.composeWithJHipster('spring-cache');
        }
      },
    });
  }

  get [BaseApplicationGenerator.COMPOSING]() {
    return this.delegateTasksToBlueprint(() => this.composing);
  }

  get composingComponent() {
    return this.asComposingComponentTaskGroup({
      async composing() {
        const { clientFramework, skipClient } = this.jhipsterConfigWithDefaults as ClientConfig;
        if (!skipClient && clientFramework !== 'no') {
          // When using prompts, clientFramework will only be known after composing priority.
          await this.composeWithJHipster('jhipster:java:node');
        }
      },
      async composeLanguages() {
        if (this.jhipsterConfigWithDefaults.enableTranslation) {
          await this.composeWithJHipster('languages');
        }
      },
    });
  }

  get [BaseApplicationGenerator.COMPOSING_COMPONENT]() {
    return this.delegateTasksToBlueprint(() => this.composingComponent);
  }

  get loading() {
    return this.asLoadingTaskGroup({
      loading({ applicationDefaults }) {
        applicationDefaults({
          communicationSpringWebsocket: ({ websocket }) => websocket === SPRING_WEBSOCKET,
        });
      },
    });
  }

  get [BaseApplicationGenerator.LOADING]() {
    return this.delegateTasksToBlueprint(() => this.loading);
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      checksWebsocket({ application }) {
        const { websocket } = application;
        if (websocket && websocket !== NO_WEBSOCKET) {
          if (application.reactive) {
            throw new Error('Spring Websocket is not supported with reactive applications.');
          }
          if (application.applicationType === APPLICATION_TYPE_MICROSERVICE) {
            throw new Error('Spring Websocket is not supported with microservice applications.');
          }
        }
      },
      loadSpringBootBom({ application }) {
        if (this.useVersionPlaceholders) {
          application.springBootDependencies = {
            'spring-boot-dependencies': "'SPRING-BOOT-VERSION'",
          };
        } else {
          application.springBootDependencies = this.prepareDependencies(springBootDependencies.versions, 'java');
          application.javaDependencies!['spring-boot'] = application.springBootDependencies['spring-boot-dependencies'];
          Object.assign(application.javaManagedProperties!, springBootDependencies.properties);
          application.javaDependencies!.liquibase = application.javaManagedProperties!['liquibase.version']!;
        }
      },
      prepareForTemplates({ application }) {
        const SPRING_BOOT_VERSION = application.springBootDependencies!['spring-boot-dependencies'];
        application.addSpringMilestoneRepository =
          (application.backendType ?? 'Java') === 'Java' &&
          (ADD_SPRING_MILESTONE_REPOSITORY || SPRING_BOOT_VERSION.includes('M') || SPRING_BOOT_VERSION.includes('RC'));
      },
      prepare({ application, applicationDefaults }) {
        const { reactive } = application;
        applicationDefaults({
          __override__: false,
          requiresDeleteAllUsers: data =>
            (data.anyEntityHasRelationshipWithUser && data.authenticationTypeOauth2) ||
            data.authenticationTypeOauth2 ||
            data.databaseTypeNeo4j ||
            (reactive && data.databaseTypeSql) ||
            (!reactive && data.databaseTypeMongodb) ||
            (!reactive && data.databaseTypeCassandra),

          generateSpringAuditor: ctx =>
            ctx.databaseTypeSql || ctx.databaseTypeMongodb || ctx.databaseTypeNeo4j || ctx.databaseTypeCouchbase,
        });
      },
      registerSpringFactory({ source, application }) {
        source.addTestSpringFactory = ({ key, value }) => {
          const springFactoriesFile = `${application.srcTestResources}META-INF/spring.factories`;
          this.editFile(
            springFactoriesFile,
            { create: true },
            editPropertiesFileCallback([{ key, value, valueSep: ',' }], { sortFile: true }),
          );
        };
      },
      addSpringIntegrationTest({ application, source }) {
        source.addIntegrationTestAnnotation = annotation =>
          source.editJavaFile!(this.destinationPath(`${application.javaPackageTestDir}IntegrationTest.java`), {
            annotations: [annotation],
          });
      },
      addApplicationYamlDocument({ application, source }) {
        source.addApplicationYamlDocument = content =>
          this.editFile(
            this.destinationPath(`${application.srcMainResources}config/application.yml`),
            createNeedleCallback({ needle: 'add-application-yaml-document', autoIndent: false, contentToAdd: `---\n${content}` }),
          );
      },
      addLogNeedles({ source }) {
        source.addLogbackLogEntry = ({ file, name, level }) =>
          this.editFile(
            this.destinationPath(file),
            createNeedleCallback({
              needle: 'logback-add-log',
              contentToAdd: `<logger name="${name}" level="${level}"/>`,
            }),
          );
        source.addMainLog = opts => source.addLogbackLogEntry!({ file: 'src/main/resources/logback-spring.xml', ...opts });
        source.addTestLog = opts => source.addLogbackLogEntry!({ file: 'src/test/resources/logback.xml', ...opts });
      },
      addApplicationPropertiesNeedles({ application, source }) {
        source.addApplicationPropertiesContent = needles =>
          this.editFile(
            `${application.javaPackageSrcDir}config/ApplicationProperties.java`,
            insertContentIntoApplicationProperties(needles),
          );
        source.addApplicationPropertiesProperty = ({ propertyName, propertyType }) =>
          source.addApplicationPropertiesContent!({
            property: `private ${propertyType} ${propertyName};`,
            propertyGetter: `
public ${propertyType} get${javaBeanCase(propertyName)}() {
    return ${propertyName};
}

public void set${javaBeanCase(propertyName)}(${propertyType} ${propertyName}) {
    this.${propertyName} = ${propertyName};
}
`,
          });
        source.addApplicationPropertiesClass = ({ propertyType, propertyName = lowerFirst(propertyType), classStructure }) => {
          const classProperties = Object.entries(classStructure).map(([name, type]) => ({
            name,
            type: Array.isArray(type) ? type[0] : type,
            defaultVaue: Array.isArray(type) ? ` = ${type[1]}` : '',
            beanName: javaBeanCase(name),
          }));
          return source.addApplicationPropertiesContent!({
            property: `private final ${propertyType} ${propertyName} = new ${propertyType}();`,
            propertyGetter: `
public ${propertyType} get${javaBeanCase(propertyName)}() {
    return ${propertyName};
}
`,
            propertyClass: `public static class ${propertyType} {
${classProperties.map(({ name, type, defaultVaue }) => `\n    private ${type} ${name}${defaultVaue};`).join('\n')}
${classProperties.map(({ name, type, beanName }) => `\n    public ${type} get${beanName}() {\n        return ${name};\n    }\n`).join('\n')}
${classProperties
  .map(({ name, type, beanName }) => `\n    public void set${beanName}(${type} ${name}) {\n        this.${name} = ${name};\n    }`)
  .join('\n')}
}
`,
          });
        };
      },
      blockhound({ application, source }) {
        source.addAllowBlockingCallsInside = ({ classPath, method }) => {
          if (!application.reactive) throw new Error('Blockhound is only supported by reactive applications');

          this.editFile(
            `${application.javaPackageTestDir}config/JHipsterBlockHoundIntegration.java`,
            createNeedleCallback({
              needle: 'blockhound-integration',
              contentToAdd: `builder.allowBlockingCallsInside("${classPath}", "${method}");`,
            }),
          );
        };
      },
      addNativeHint({ source, application }) {
        source.addNativeHint = ({
          advanced = [],
          declaredConstructors = [],
          publicConstructors = [],
          publicMethods = [],
          resources = [],
        }) => {
          this.editFile(
            `${application.javaPackageSrcDir}config/NativeConfiguration.java`,
            addJavaImport('org.springframework.aot.hint.MemberCategory'),
            createNeedleCallback({
              contentToAdd: [
                ...advanced,
                ...resources.map(resource => `hints.resources().registerPattern("${resource}");`),
                ...publicConstructors.map(
                  classPath =>
                    `hints.reflection().registerType(${classPath}, (hint) -> hint.withMembers(MemberCategory.INVOKE_PUBLIC_CONSTRUCTORS));`,
                ),
                ...publicMethods.map(
                  classPath =>
                    `hints.reflection().registerType(${classPath}, (hint) -> hint.withMembers(MemberCategory.INVOKE_PUBLIC_METHODS));`,
                ),
                ...declaredConstructors.map(
                  classPath =>
                    `hints.reflection().registerType(${classPath}, (hint) -> hint.withMembers(MemberCategory.INVOKE_DECLARED_CONSTRUCTORS));`,
                ),
              ],
              needle: 'add-native-hints',
              ignoreWhitespaces: true,
            }),
          );
        };
      },
      needles({ source }) {
        const getScopeForModule = (moduleName: SpringBootModule): JavaArtifactType['scope'] => {
          if (moduleName === 'spring-boot-properties-migrator') return 'runtime';
          if (moduleName === 'spring-boot-configuration-processor') return 'annotationProcessor';
          return moduleName.endsWith('-test') ? 'test' : undefined;
        };
        source.addSpringBootModule = (...moduleNames) =>
          source.addJavaDependencies?.(
            moduleNames
              .filter(module => typeof module === 'string' || module.condition)
              .map(module => (typeof module === 'string' ? module : module.module))
              .map(name => ({
                groupId: 'org.springframework.boot',
                artifactId: name,
                scope: getScopeForModule(name),
              })),
          );

        source.overrideProperty = props => source.addJavaProperty!(props);
      },
      prepareCompositePrimaryKeyHelpers({ application }) {
        // needed for _dtoClass_Test with composite key, this could be improved
        (application as any).getPrimaryKeyValue = getPrimaryKeyValue;
      }
    });
  }

  get [BaseApplicationGenerator.PREPARING]() {
    return this.delegateTasksToBlueprint(() => this.preparing);
  }

  get preparingEachEntity() {
    return this.asPreparingEachEntityTaskGroup({
      prepareEntity({ entity, application }) {
        if (entity.entityRestLayer === false) {
          (entity as unknown as ClientEntity).entityClientModelOnly = true;
        }

        const hasAnyAuthority = (authorities: string[]): string | undefined =>
          authorities.length > 0 ? `hasAnyAuthority(${authorities.map(auth => `'${auth}'`).join(',')})` : undefined;
        mutateData(entity, {
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

  get [BaseApplicationGenerator.PREPARING_EACH_ENTITY]() {
    return this.delegateTasksToBlueprint(() => this.preparingEachEntity);
  }

  get preparingEachEntityField() {
    return this.asPreparingEachEntityFieldTaskGroup({
      prepareEntity({ field }) {
        field.fieldJavaBuildSpecification = getSpecificationBuildForType(field.fieldType as FieldType);

        field.filterableField = !([TYPE_BYTES, TYPE_BYTE_BUFFER] as string[]).includes(field.fieldType) && !field.transient;
        if (field.filterableField) {
          const { fieldType, fieldName, fieldInJavaBeanMethod } = field;
          mutateData(field, {
            propertyJavaFilterName: fieldName,
            propertyJavaFilteredType: fieldType,
            propertyJavaFilterJavaBeanName: fieldInJavaBeanMethod,
          });

          if (field.fieldIsEnum) {
            const filterType = `${fieldType}Filter`;
            field.propertyJavaFilterType = filterType;
            field.propertyJavaCustomFilter = { type: filterType, superType: `Filter<${fieldType}>`, fieldType };
          } else if (
            field.fieldTypeDuration ||
            field.fieldTypeTemporal ||
            field.fieldTypeCharSequence ||
            field.fieldTypeNumeric ||
            field.fieldTypeBoolean
          ) {
            field.propertyJavaFilterType = `${fieldType}Filter`;
          } else if (field.fieldTypeLocalTime) {
            const filterType = `${fieldType}Filter`;
            field.propertyJavaFilterType = filterType;
            field.propertyJavaCustomFilter = { type: filterType, superType: `RangeFilter<${fieldType}>`, fieldType };
          } else {
            field.propertyJavaFilterType = `Filter<${fieldType}>`;
          }
        }
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING_EACH_ENTITY_FIELD]() {
    return this.delegateTasksToBlueprint(() => this.preparingEachEntityField);
  }

  get preparingEachEntityRelationship() {
    return this.asPreparingEachEntityRelationshipTaskGroup({
      checkUserRelationships({ entity, entityName, relationship }) {
        if (!entity.dtoMapstruct && relationship.otherEntity.builtInUser) {
          this.log.warn(
            `Entity ${entityName} doesn't use DTO. You should check for User data leakage through ${relationship.relationshipName} relationship.`,
          );
        }
      },
      checkDtoRelationships({ entity, entityName, relationship }) {
        if (entity.dto !== relationship.otherEntity.dto && !relationship.otherEntity.builtIn) {
          this.log.warn(
            `Relationship between entities with different DTO configurations can cause unexpected results. Check ${relationship.relationshipName} in the ${entityName} entity.`,
          );
        }
      },
      prepareEntity({ relationship }) {
        const { primaryKey } = relationship.otherEntity;
        if (!primaryKey) return;

        const { relationshipName, relationshipNameCapitalized } = relationship;
        const otherEntityPkField = primaryKey.fields[0];
        mutateData(relationship, {
          propertyJavaFilterName: `${relationshipName}Id`,
          propertyJavaFilterJavaBeanName: `${relationshipNameCapitalized}Id`,
          propertyJavaFilterType: otherEntityPkField.propertyJavaFilterType,
          propertyJavaFilteredType: otherEntityPkField.propertyJavaFilteredType,
        });
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING_EACH_ENTITY_RELATIONSHIP]() {
    return this.delegateTasksToBlueprint(() => this.preparingEachEntityRelationship);
  }

  get postPreparingEachEntity() {
    return this.asPostPreparingEachEntityTaskGroup({
      prepareEntity({ entity }) {
        const { primaryKey } = entity;
        if (primaryKey) {
          for (const field of primaryKey.fields) {
            field.fieldJavaValueGenerator = getJavaValueGeneratorForType(field.fieldType);
          }
          if (!primaryKey.composite) {
            primaryKey.javaBuildSpecification = getSpecificationBuildForType(primaryKey.type);
            primaryKey.javaValueGenerator = getJavaValueGeneratorForType(primaryKey.type);
            primaryKey.urlIdGenerator = getJavaValueGeneratorForType(primaryKey.type);
          } else {
            primaryKey.javaValueGenerator = `new ${primaryKey.type}(${primaryKey.fields.map(field => getJavaValueGeneratorForType(field.fieldType)).join(', ')})`;
            primaryKey.urlIdGenerator = primaryKey.fields
              .map(field => `"${field.fieldName}=" + ${getJavaValueGeneratorForType(field.fieldType)}`)
              .join(' + ";" + ');
          }
        }
      },
      prepareFilters({ application, entity }) {
        const relationshipFilterableProperties = entity.relationships
          .filter(rel => !application.reactive || (rel.persistableRelationship && !rel.collection && rel.otherEntity.primaryKey))
          .flatMap(relationship =>
            relationship.otherEntity.primaryKey!.fields.map(field => {
              const fieldType = field.fieldType;
              let filterType = `${fieldType}Filter`;
              // user has a String PK when using OAuth, so change relationships accordingly
              if (relationship.otherEntityUser && application.authenticationTypeOauth2) {
                filterType = 'StringFilter';
              }
              return {
                propertyJavaFilterType: filterType,
                propertyJavaFilterName: `${relationship.relationshipFieldName}${field.fieldNameCapitalized}`,
                propertyJavaFilterJavaBeanName: `${relationship.relationshipNameCapitalized}${field.fieldNameCapitalized}`,
              };
            }),
          );

        mutateData(entity, {
          entityJavaFilterableProperties: [...entity.fields.filter(field => field.filterableField), ...relationshipFilterableProperties],
          entityJavaCustomFilters: sortedUniqBy(entity.fields.map(field => field.propertyJavaCustomFilter).filter(Boolean), 'type'),
        });

        mutateData(entity as unknown as CypressEntity, {
          __override__: true,
          // Reactive with some r2dbc databases doesn't allow insertion without data.
          workaroundEntityCannotBeEmpty: ({ reactive, prodDatabaseType }: any) =>
            reactive && ['postgresql', 'mysql', 'mariadb'].includes(prodDatabaseType),
          // Reactive with MariaDB doesn't allow null value at Instant fields.
          workaroundInstantReactiveMariaDB: ({ reactive, prodDatabaseType }: any) => reactive && prodDatabaseType === 'mariadb',
        });
      },
    });
  }

  get [BaseApplicationGenerator.POST_PREPARING_EACH_ENTITY]() {
    return this.delegateTasksToBlueprint(() => this.postPreparingEachEntity);
  }

  get writing() {
    return this.asWritingTaskGroup({
      cleanupTask,
      resetFakeDataSeed() {
        this.resetEntitiesFakeData('server');
      },
      async writeFiles({ application }) {
        return this.writeFiles({
          sections: serverFiles,
          rootTemplatesPath: ['', '../../java/generators/domain/templates/'],
          context: application,
        });
      },
      async generateKeyStore({ application }) {
        const keyStoreFile = this.destinationPath(`${application.srcMainResources}config/tls/keystore.p12`);
        if (this.fakeKeytool) {
          this.writeDestination(keyStoreFile, 'fake key-tool');
        } else {
          this.validateResult(await generateKeyStore(keyStoreFile, { packageName: application.packageName! }));
        }
      },
    });
  }

  get [BaseApplicationGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  get writingEntities() {
    return this.asWritingEntitiesTaskGroup({
      ...writeEntityFiles(),
    });
  }

  get [BaseApplicationGenerator.WRITING_ENTITIES]() {
    return this.delegateTasksToBlueprint(() => this.writingEntities);
  }

  get postWriting() {
    return this.asPostWritingTaskGroup({
      baseDependencies({ application, source }) {
        source.addSpringBootModule!(
          'spring-boot-configuration-processor',
          'spring-boot-loader-tools',
          'spring-boot-starter',
          'spring-boot-starter-actuator',
          'spring-boot-starter-aop',
          'spring-boot-starter-mail',
          'spring-boot-starter-test',
          'spring-boot-starter-thymeleaf',
          'spring-boot-starter-tomcat',
          'spring-boot-starter-validation',
          `spring-boot-starter-web${application.reactive ? 'flux' : ''}`,
          'spring-boot-test',
          {
            condition: application.authenticationTypeSession,
            module: 'spring-boot-starter-security',
          },
        );
      },
      addJHipsterBomDependencies({ application, source }) {
        const {
          applicationTypeGateway,
          applicationTypeMicroservice,
          javaDependencies,
          jhipsterDependenciesVersion,
          messageBrokerAny,
          serviceDiscoveryAny,
        } = application;

        if (application.reactive && application.graalvmSupport) {
          source.addNativeHint!({
            advanced: [
              // Tomcat
              'hints.reflection().registerType(org.apache.catalina.connector.RequestFacade.class, (hint) -> hint.withMembers(MemberCategory.DECLARED_FIELDS));',
              'hints.reflection().registerType(org.apache.catalina.connector.ResponseFacade.class, (hint) -> hint.withMembers(MemberCategory.DECLARED_FIELDS));',
            ],
          });
        }
        source.addJavaDefinitions?.(
          {
            dependencies: [{ groupId: 'tech.jhipster', artifactId: 'jhipster-framework', version: jhipsterDependenciesVersion! }],
            mavenDefinition: {
              properties: [
                {
                  property: 'spring-boot.version',
                  // eslint-disable-next-line no-template-curly-in-string
                  value: '${project.parent.version}',
                },
              ],
            },
          },
          {
            condition: applicationTypeGateway || applicationTypeMicroservice || serviceDiscoveryAny || messageBrokerAny,
            dependencies: [
              {
                groupId: 'org.springframework.cloud',
                artifactId: 'spring-cloud-dependencies',
                type: 'pom',
                scope: 'import',
                version: javaDependencies!['spring-cloud-dependencies'],
              },
            ],
          },
        );
      },
      addSpringdoc({ application, source }) {
        const springdocDependency = `springdoc-openapi-starter-${application.reactive ? 'webflux' : 'webmvc'}-api`;
        source.addJavaDependencies?.([
          { groupId: 'org.springdoc', artifactId: springdocDependency, version: application.javaDependencies!.springdoc },
        ]);
        if (application.reactive) {
          source.addAllowBlockingCallsInside?.({ classPath: 'org.springdoc.core.service.OpenAPIService', method: 'build' });
          source.addAllowBlockingCallsInside?.({ classPath: 'org.springdoc.core.service.OpenAPIService', method: 'getWebhooksClasses' });
          source.addAllowBlockingCallsInside?.({ classPath: 'org.springdoc.core.service.AbstractRequestService', method: 'build' });
        }
      },
      addFeignReactor({ application, source }) {
        const { applicationTypeGateway, applicationTypeMicroservice, javaDependencies, reactive } = application;
        if ((applicationTypeMicroservice || applicationTypeGateway) && reactive) {
          const groupId = 'com.playtika.reactivefeign';
          source.addJavaDependencies?.([
            { groupId, artifactId: 'feign-reactor-bom', type: 'pom', scope: 'import', version: javaDependencies!['feign-reactor-bom'] },
            { groupId, artifactId: 'feign-reactor-cloud' },
            { groupId, artifactId: 'feign-reactor-spring-configuration' },
            { groupId, artifactId: 'feign-reactor-webclient' },
          ]);
        }
      },
      addSpringSnapshotRepository({ application, source }) {
        if (application.buildToolMaven) {
          if (application.addSpringMilestoneRepository) {
            const springRepository = {
              id: 'spring-milestone',
              name: 'Spring Milestones',
              url: 'https://repo.spring.io/milestone',
            };
            source.addMavenPluginRepository?.(springRepository);
            source.addMavenRepository?.(springRepository);
            source.addSpringBootModule?.('spring-boot-properties-migrator');
          }
          if (application.jhipsterDependenciesVersion?.endsWith('-SNAPSHOT')) {
            source.addMavenRepository?.({
              id: 'ossrh-snapshots',
              url: 'https://oss.sonatype.org/content/repositories/snapshots/',
              releasesEnabled: false,
            });
          }
        } else if (application.buildToolGradle) {
          source.addGradleRepository?.({
            repository: `// Local maven repository is required for libraries built locally with maven like development jhipster-bom.
${application.jhipsterDependenciesVersion?.includes('-CICD') ? '' : '// '}mavenLocal()`,
          });
          if (application.addSpringMilestoneRepository) {
            source.addGradleMavenRepository?.({ url: 'https://repo.spring.io/milestone' });
          }
          if (application.jhipsterDependenciesVersion?.endsWith('-SNAPSHOT')) {
            source.addGradleRepository?.({
              repository: `maven {
    url "https://oss.sonatype.org/content/repositories/snapshots/"
    mavenContent {
        snapshotsOnly()
    }
}`,
            });
          }
        }
      },
      addSpringBootPlugin({ application, source }) {
        if (application.buildToolGradle) {
          source.applyFromGradle!({ script: 'gradle/spring-boot.gradle' });
          source.addGradleDependencyCatalogPlugins?.([
            {
              pluginName: 'gradle-git-properties',
              id: 'com.gorylenko.gradle-git-properties',
              version: application.javaDependencies!['gradle-git-properties'],
              addToBuild: true,
            },
            {
              pluginName: 'spring-boot',
              id: 'org.springframework.boot',
              version: application.javaDependencies!['spring-boot'],
              addToBuild: true,
            },
          ]);
        }
      },
      addSpringBootCompose({ application, source }) {
        if (!application.dockerServices?.length) return;

        source.addMainLog!({ name: 'org.springframework.boot.docker', level: 'WARN' });

        const dockerComposeArtifact = { groupId: 'org.springframework.boot', artifactId: 'spring-boot-docker-compose' };
        if (application.buildToolGradle) {
          source.addGradleDependency!({ ...dockerComposeArtifact, scope: 'developmentOnly' });
        } else if (application.buildToolMaven) {
          // Add dependency to profile due to jib issue https://github.com/GoogleContainerTools/jib-extensions/issues/158
          source.addMavenDefinition!({
            profiles: [
              {
                id: 'docker-compose',
                content: `
                <activation>
                  <activeByDefault>true</activeByDefault>
                </activation>`,
              },
            ],
          });
          source.addMavenDependency!({ inProfile: 'docker-compose', ...dockerComposeArtifact, optional: true });
        }
      },
      sonar({ application, source }) {
        (source as CommonSource).ignoreSonarRule?.({
          ruleId: 'S125',
          ruleKey: 'xml:S125',
          resourceKey: `${application.srcMainResources}logback-spring.xml`,
          comment: `Rule https://rules.sonarsource.com/xml/RSPEC-125 is ignored, we provide commented examples`,
        });

        if (!application.authenticationUsesCsrf && application.generateAuthenticationApi) {
          (source as CommonSource).ignoreSonarRule?.({
            ruleId: 'S4502',
            ruleKey: 'java:S4502',
            resourceKey: `${application.javaPackageSrcDir}config/SecurityConfiguration.java`,
            comment: `Rule https://rules.sonarsource.com/java/RSPEC-4502 is ignored, as for JWT tokens we are not subject to CSRF attack`,
          });
        }

        (source as CommonSource).ignoreSonarRule?.({
          ruleId: 'S4684',
          ruleKey: 'java:S4684',
          resourceKey: `${application.javaPackageSrcDir}web/rest/**/*`,
          comment: `Rule https://rules.sonarsource.com/java/RSPEC-4684`,
        });

        (source as CommonSource).ignoreSonarRule?.({
          ruleId: 'S5145',
          ruleKey: 'javasecurity:S5145',
          resourceKey: `${application.javaPackageSrcDir}**/*`,
          comment: `Rule https://rules.sonarsource.com/java/RSPEC-5145 is ignored, as we use log filter to format log messages`,
        });

        (source as CommonSource).ignoreSonarRule?.({
          ruleId: 'S6437',
          ruleKey: 'java:S6437',
          resourceKey: `${application.srcMainResources}config/*`,
          comment: `Rule https://rules.sonarsource.com/java/RSPEC-6437 is ignored, hardcoded passwords are provided for development purposes`,
        });
      },
      dependencies({ application, source }) {
        source.addJavaDefinitions!(
          {
            versions: [
              { name: 'mapstruct', version: application.javaDependencies.mapstruct },
              { name: 'archunit-junit5', version: application.javaDependencies['archunit-junit5'] },
            ],
            dependencies: [
              { groupId: 'com.fasterxml.jackson.datatype', artifactId: 'jackson-datatype-hppc' },
              { groupId: 'com.fasterxml.jackson.datatype', artifactId: 'jackson-datatype-jsr310' },
              { groupId: 'io.micrometer', artifactId: 'micrometer-registry-prometheus-simpleclient' },
              { groupId: 'org.apache.commons', artifactId: 'commons-lang3' },
              { groupId: 'org.mapstruct', artifactId: 'mapstruct', versionRef: 'mapstruct' },
              { groupId: 'org.mapstruct', artifactId: 'mapstruct-processor', versionRef: 'mapstruct', scope: 'annotationProcessor' },
              { groupId: 'org.springframework.security', artifactId: 'spring-security-test', scope: 'test' },
              {
                scope: 'test',
                groupId: 'com.tngtech.archunit',
                artifactId: 'archunit-junit5-api',
                versionRef: 'archunit-junit5',
                exclusions: [{ groupId: 'org.slf4j', artifactId: 'slf4j-api' }],
              },
              {
                scope: 'testRuntimeOnly',
                groupId: 'com.tngtech.archunit',
                artifactId: 'archunit-junit5-engine',
                versionRef: 'archunit-junit5',
                exclusions: [{ groupId: 'org.slf4j', artifactId: 'slf4j-api' }],
              },
            ],
          },
          {
            condition: application.reactive,
            versions: [
              { name: 'blockhound-junit-platform', version: application.javaDependencies['blockhound-junit-platform'] },
              { name: 'micrometer-context-propagation', version: application.javaDependencies['micrometer-context-propagation'] },
            ],
            dependencies: [
              { groupId: 'io.netty', artifactId: 'netty-tcnative-boringssl-static', scope: 'runtime' },
              { groupId: 'io.micrometer', artifactId: 'context-propagation', versionRef: 'micrometer-context-propagation' },
              {
                groupId: 'io.projectreactor.tools',
                artifactId: 'blockhound-junit-platform',
                versionRef: 'blockhound-junit-platform',
                scope: 'test',
              },
              { groupId: 'org.springframework.data', artifactId: 'spring-data-commons' },
            ],
          },
          {
            condition: application.addSpringMilestoneRepository,
            dependencies: [{ groupId: 'org.springframework.boot', artifactId: 'spring-boot-properties-migrator', scope: 'runtime' }],
          },
          {
            condition: application.applicationTypeMicroservice || application.applicationTypeGateway,
            dependencies: [
              { groupId: 'org.springframework.cloud', artifactId: 'spring-cloud-starter' },
              {
                groupId: 'org.springframework.cloud',
                artifactId: `spring-cloud-starter-circuitbreaker-${application.reactive ? 'reactor-' : ''}resilience4j`,
              },
            ],
          },
          {
            condition: application.serviceDiscoveryAny,
            dependencies: [{ groupId: 'org.springframework.cloud', artifactId: 'spring-cloud-starter-bootstrap' }],
          },
          {
            condition: application.serviceDiscoveryEureka,
            dependencies: [
              { groupId: 'org.springframework.cloud', artifactId: 'spring-cloud-starter-config' },
              { groupId: 'org.springframework.cloud', artifactId: 'spring-cloud-starter-netflix-eureka-client' },
            ],
          },
          {
            condition: application.serviceDiscoveryConsul,
            dependencies: [
              { groupId: 'org.springframework.cloud', artifactId: 'spring-cloud-starter-consul-config' },
              { groupId: 'org.springframework.cloud', artifactId: 'spring-cloud-starter-consul-discovery' },
            ],
          },
        );

        if (application.buildToolGradle && application.reactive) {
          this.editFile('build.gradle', {
            needle: 'gradle-dependency',
            contentToAdd: `OperatingSystem os = org.gradle.nativeplatform.platform.internal.DefaultNativePlatform.getCurrentOperatingSystem();
Architecture arch = org.gradle.nativeplatform.platform.internal.DefaultNativePlatform.getCurrentArchitecture();
if (os.isMacOsX() && !arch.isAmd64()) {
    implementation("io.netty:netty-resolver-dns-native-macos") {
        artifact {
            classifier = "osx-aarch_64"
        }
    }
}`,
          });
        } else if (application.buildToolMaven) {
          source.addJavaDefinitions!({
            condition: application.reactive,
            dependencies: [{ groupId: 'io.netty', artifactId: 'netty-resolver-dns-native-macos', classifier: 'osx-aarch_64' }],
          });
        }
      },
    });
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }

  get end() {
    return this.asEndTaskGroup({
      end({ application, control }) {
        const { buildToolExecutable } = application;
        this.log.ok('Spring Boot application generated successfully.');

        if (application.dockerServices?.length && !control.environmentHasDockerCompose) {
          const dockerComposeCommand = chalk.yellow.bold('docker compose');
          this.log('');
          this.log
            .warn(`${dockerComposeCommand} command was not found in your environment. The generated Spring Boot application uses ${dockerComposeCommand} integration by default. You can disable it by setting
${chalk.yellow.bold(`
spring:
  docker:
    compose:
      enabled: false
`)}
in your ${chalk.yellow.bold(`${application.srcMainResources}config/application.yml`)} file or removing 'spring-boot-docker-compose' dependency.
`);
        }

        let logMsgComment = '';
        if (isWin32) {
          logMsgComment = ` (${chalk.yellow.bold(buildToolExecutable)} if using Windows Command Prompt)`;
        }
        this.log.log(
          chalk.green(`  Run your Spring Boot application:\n  ${chalk.yellow.bold(`./${buildToolExecutable}`)}${logMsgComment}`),
        );
      },
    });
  }

  get [BaseApplicationGenerator.END]() {
    return this.delegateTasksToBlueprint(() => this.end);
  }
}
