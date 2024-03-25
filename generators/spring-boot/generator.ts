/**
 * Copyright 2013-2024 the original author or authors from the JHipster project.
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
import os from 'node:os';
import chalk from 'chalk';
import { kebabCase, sortedUniqBy } from 'lodash-es';
import BaseApplicationGenerator from '../base-application/index.js';
import {
  GENERATOR_SERVER,
  GENERATOR_SPRING_CACHE,
  GENERATOR_SPRING_CLOUD_STREAM,
  GENERATOR_SPRING_DATA_CASSANDRA,
  GENERATOR_SPRING_DATA_COUCHBASE,
  GENERATOR_SPRING_DATA_ELASTICSEARCH,
  GENERATOR_SPRING_DATA_MONGODB,
  GENERATOR_SPRING_DATA_NEO4J,
  GENERATOR_SPRING_DATA_RELATIONAL,
  GENERATOR_SPRING_WEBSOCKET,
} from '../generator-list.js';
import { serverFiles } from './files.js';
import cleanupTask from './cleanup.js';
import { ADD_SPRING_MILESTONE_REPOSITORY } from '../generator-constants.js';
import {
  addSpringFactory,
  getJavaValueGeneratorForType,
  getPrimaryKeyValue,
  getSpecificationBuildForType,
  insertContentIntoApplicationProperties,
  javaBeanCase,
} from '../server/support/index.js';
import { addJavaAnnotation, generateKeyStore } from '../java/support/index.js';
import { createNeedleCallback, mutateData } from '../base/support/index.js';
import {
  APPLICATION_TYPE_MICROSERVICE,
  applicationTypes,
  cacheTypes,
  databaseTypes,
  fieldTypes,
  messageBrokerTypes,
  searchEngineTypes,
  websocketTypes,
} from '../../jdl/index.js';
import { writeFiles as writeEntityFiles } from './entity-files.js';
import { getPomVersionProperties } from '../maven/support/index.js';

const { CAFFEINE, EHCACHE, HAZELCAST, INFINISPAN, MEMCACHED, REDIS, NO: NO_CACHE } = cacheTypes;
const { NO: NO_WEBSOCKET, SPRING_WEBSOCKET } = websocketTypes;
const { CASSANDRA, COUCHBASE, MONGODB, NEO4J, SQL } = databaseTypes;
const { MICROSERVICE, GATEWAY } = applicationTypes;
const { KAFKA, PULSAR } = messageBrokerTypes;
const { ELASTICSEARCH } = searchEngineTypes;

const { BYTES: TYPE_BYTES, BYTE_BUFFER: TYPE_BYTE_BUFFER } = fieldTypes.RelationalOnlyDBTypes;

export default class SpringBootGenerator extends BaseApplicationGenerator {
  fakeKeytool;

  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnJHipster(GENERATOR_SERVER);
    }
  }

  get initializing() {
    return this.asInitializingTaskGroup({
      async parseCommand() {
        await this.parseCurrentJHipsterCommand();
      },
    });
  }

  get [BaseApplicationGenerator.INITIALIZING]() {
    return this.delegateTasksToBlueprint(() => this.initializing);
  }

  get configuring() {
    return this.asConfiguringTaskGroup({
      forceReactiveGateway() {
        if (this.jhipsterConfig.applicationType === GATEWAY) {
          if (this.jhipsterConfig.reactive !== undefined && !this.jhipsterConfig.reactive) {
            this.log.warn('Non reactive gateway is not supported. Switching to reactive.');
          }
          this.jhipsterConfig.reactive = true;
        }
      },
      checks() {
        const config = this.jhipsterConfigWithDefaults;
        if (config.enableHibernateCache && [NO_CACHE, MEMCACHED].includes(config.cacheProvider)) {
          this.log.verboseInfo(`Disabling hibernate cache for cache provider ${config.cacheProvider}`);
          this.jhipsterConfig.enableHibernateCache = false;
        }

        if (config.websocket && config.websocket !== NO_WEBSOCKET) {
          if (config.reactive) {
            throw new Error('Spring Websocket is not supported with reactive applications.');
          }
          if (config.applicationType === MICROSERVICE) {
            throw new Error('Spring Websocket is not supported with microservice applications.');
          }
        }
      },
      feignMigration() {
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
          this.isJhipsterVersionLessThan('8.0.1') &&
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
        const { databaseType, messageBroker, searchEngine, websocket, cacheProvider, buildTool, skipClient, clientFramework } =
          this.jhipsterConfigWithDefaults;

        if (buildTool === 'gradle') {
          await this.composeWithJHipster('jhipster:gradle:code-quality');
          await this.composeWithJHipster('jhipster:gradle:jib');
          if (!skipClient && clientFramework !== 'no') {
            await this.composeWithJHipster('jhipster:gradle:node-gradle');
          }
        }

        if (databaseType === SQL) {
          await this.composeWithJHipster(GENERATOR_SPRING_DATA_RELATIONAL);
        } else if (databaseType === CASSANDRA) {
          await this.composeWithJHipster(GENERATOR_SPRING_DATA_CASSANDRA);
        } else if (databaseType === COUCHBASE) {
          await this.composeWithJHipster(GENERATOR_SPRING_DATA_COUCHBASE);
        } else if (databaseType === MONGODB) {
          await this.composeWithJHipster(GENERATOR_SPRING_DATA_MONGODB);
        } else if (databaseType === NEO4J) {
          await this.composeWithJHipster(GENERATOR_SPRING_DATA_NEO4J);
        }
        if (messageBroker === KAFKA || messageBroker === PULSAR) {
          await this.composeWithJHipster(GENERATOR_SPRING_CLOUD_STREAM);
        }
        if (searchEngine === ELASTICSEARCH) {
          await this.composeWithJHipster(GENERATOR_SPRING_DATA_ELASTICSEARCH);
        }
        if (websocket === SPRING_WEBSOCKET) {
          await this.composeWithJHipster(GENERATOR_SPRING_WEBSOCKET);
        }
        if ([EHCACHE, CAFFEINE, HAZELCAST, INFINISPAN, MEMCACHED, REDIS].includes(cacheProvider)) {
          await this.composeWithJHipster(GENERATOR_SPRING_CACHE);
        }
      },
    });
  }

  get [BaseApplicationGenerator.COMPOSING]() {
    return this.delegateTasksToBlueprint(() => this.composing);
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      loadSpringBootBom({ application }) {
        const pomFile = this.readTemplate(this.jhipsterTemplatePath('../resources/spring-boot-dependencies.pom'))?.toString();
        if (this.useVersionPlaceholders) {
          application.javaDependencies!['spring-boot'] = "'SPRING-BOOT-VERSION'";
          application.springBootDependencies = {};
        } else {
          application.springBootDependencies = this.prepareDependencies(
            getPomVersionProperties(pomFile!),
            value => `'${kebabCase(value).toUpperCase()}-VERSION'`,
          );
          application.javaDependencies!['spring-boot'] = application.springBootDependencies['spring-boot-dependencies'];
        }
      },
      prepareForTemplates({ application }) {
        const SPRING_BOOT_VERSION = application.javaDependencies!['spring-boot'];
        application.addSpringMilestoneRepository =
          (application.backendType ?? 'Java') === 'Java' &&
          (ADD_SPRING_MILESTONE_REPOSITORY || SPRING_BOOT_VERSION.includes('M') || SPRING_BOOT_VERSION.includes('RC'));
      },
      registerSpringFactory({ source, application }) {
        source.addTestSpringFactory = ({ key, value }) => {
          const springFactoriesFile = `${application.srcTestResources}META-INF/spring.factories`;
          this.editFile(springFactoriesFile, { create: true }, addSpringFactory({ key, value }));
        };
      },
      addSpringIntegrationTest({ application, source }) {
        source.addIntegrationTestAnnotation = ({ package: packageName, annotation }) =>
          this.editFile(this.destinationPath(`${application.javaPackageTestDir}IntegrationTest.java`), content =>
            addJavaAnnotation(content, { package: packageName, annotation }),
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
        source.addLogbackMainLog = opts => source.addLogbackLogEntry!({ file: 'src/main/resources/logback-spring.xml', ...opts });
        source.addLogbackTestLog = opts => source.addLogbackLogEntry!({ file: 'src/test/resources/logback.xml', ...opts });
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
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING]() {
    return this.delegateTasksToBlueprint(() => this.preparing);
  }

  get preparingEachEntity() {
    return this.asPreparingEachEntityTaskGroup({
      prepareEntity({ entity }) {
        const hasAnyAuthority = authorities =>
          authorities.length > 0 ? `hasAnyAuthority(${authorities.map(auth => `'${auth}'`).join(',')})` : undefined;
        mutateData(entity, {
          entitySpringPreAuthorize: hasAnyAuthority(entity.entityAuthority?.split(',') ?? []),
          entitySpringReadPreAuthorize: hasAnyAuthority([
            ...(entity.entityAuthority?.split(',') ?? []),
            ...(entity.entityReadAuthority?.split(',') ?? []),
          ]),
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
        field.fieldJavaBuildSpecification = getSpecificationBuildForType(field.fieldType);

        field.filterableField = ![TYPE_BYTES, TYPE_BYTE_BUFFER].includes(field.fieldType) && !field.transient;
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
      prepareEntity({ relationship }) {
        if (relationship.otherEntity.embedded) return;

        const { relationshipName, relationshipNameCapitalized } = relationship;
        const otherEntityPkField = relationship.otherEntity.primaryKey.fields[0];
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
          primaryKey.javaBuildSpecification = getSpecificationBuildForType(primaryKey.type);
          primaryKey.javaValueGenerator = getJavaValueGeneratorForType(primaryKey.type);
          for (const field of primaryKey.fields) {
            field.fieldJavaValueGenerator = getJavaValueGeneratorForType(field.fieldType);
          }
        }
      },
      prepareFilters({ application, entity }) {
        (entity as any).entityJavaFilterableProperties = [
          ...entity.fields.filter(field => field.filterableField),
          ...entity.relationships.filter(rel => !application.reactive || (rel.persistableRelationship && !rel.collection)),
        ];
        (entity as any).entityJavaCustomFilters = sortedUniqBy(
          entity.fields.map(field => field.propertyJavaCustomFilter).filter(Boolean),
          'type',
        );
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
          rootTemplatesPath: ['', '../../server/templates/', '../../java/templates/'],
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
      addJHipsterBomDependencies({ application, source }) {
        const { applicationTypeGateway, applicationTypeMicroservice, javaDependencies, jhipsterDependenciesVersion, messageBrokerAny } =
          application;
        const { serviceDiscoveryAny } = application as any;

        source.addJavaDependencies?.([
          { groupId: 'tech.jhipster', artifactId: 'jhipster-framework', version: jhipsterDependenciesVersion! },
        ]);

        if (applicationTypeGateway || applicationTypeMicroservice || serviceDiscoveryAny || messageBrokerAny) {
          source.addJavaDependencies?.([
            {
              groupId: 'org.springframework.cloud',
              artifactId: 'spring-cloud-dependencies',
              type: 'pom',
              scope: 'import',
              version: javaDependencies!['spring-cloud-dependencies'],
            },
          ]);
        }
      },
      addSpringdoc({ application, source }) {
        const springdocDependency = `springdoc-openapi-starter-${application.reactive ? 'webflux' : 'webmvc'}-api`;
        source.addJavaDependencies?.([
          { groupId: 'org.springdoc', artifactId: springdocDependency, version: application.javaDependencies!.springdoc },
        ]);
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
            source.addMavenDependency?.({
              groupId: 'org.springframework.boot',
              artifactId: 'spring-boot-properties-migrator',
              scope: 'runtime',
            });
          }
          if (application.jhipsterDependenciesVersion?.endsWith('-SNAPSHOT')) {
            source.addMavenRepository?.({
              id: 'ossrh-snapshots',
              url: 'https://oss.sonatype.org/content/repositories/snapshots/',
              releasesEnabled: false,
            });
          }
        }
      },
      addSpringBootPlugin({ application, source }) {
        if (application.buildToolGradle) {
          source.addGradleDependencyCatalogPlugins?.([
            {
              pluginName: 'spring-boot',
              id: 'org.springframework.boot',
              version: application.javaDependencies!['spring-boot'],
              addToBuild: true,
            },
            {
              pluginName: 'spring-dependency-management',
              id: 'io.spring.dependency-management',
              version: application.javaDependencies!['spring-dependency-management'],
              addToBuild: true,
            },
          ]);
        }
      },
    });
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }

  get end() {
    return this.asEndTaskGroup({
      end({ application }) {
        this.log.ok('Spring Boot application generated successfully.');

        let executable = 'mvnw';
        if (application.buildToolGradle) {
          executable = 'gradlew';
        }
        let logMsgComment = '';
        if (os.platform() === 'win32') {
          logMsgComment = ` (${chalk.yellow.bold(executable)} if using Windows Command Prompt)`;
        }
        this.log.log(chalk.green(`  Run your Spring Boot application:\n  ${chalk.yellow.bold(`./${executable}`)}${logMsgComment}`));
      },
    });
  }

  get [BaseApplicationGenerator.END]() {
    return this.asEndTaskGroup(this.delegateTasksToBlueprint(() => this.end));
  }

  /**
   * @private
   * Returns the primary key value based on the primary key type, DB and default value
   *
   * @param {string} primaryKey - the primary key type
   * @param {string} databaseType - the database type
   * @param {string} defaultValue - default value
   * @returns {string} java primary key value
   */
  getPrimaryKeyValue(primaryKey, databaseType = this.jhipsterConfig.databaseType, defaultValue = 1) {
    return getPrimaryKeyValue(primaryKey, databaseType, defaultValue);
  }
}
