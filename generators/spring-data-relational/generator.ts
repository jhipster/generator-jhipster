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

import assert from 'assert';
import BaseApplicationGenerator from '../base-application/index.js';
import { GENERATOR_LIQUIBASE } from '../generator-list.js';
import { isReservedTableName } from '../../lib/jhipster/reserved-keywords.js';
import { databaseTypes } from '../../lib/jhipster/index.js';
import writeTask from './files.js';
import cleanupTask from './cleanup.js';
import writeEntitiesTask, { cleanupEntitiesTask } from './entity-files.js';
import { getDBCExtraOption, getJdbcUrl, getR2dbcUrl } from './support/index.js';
import {
  getDatabaseDriverForDatabase,
  getDatabaseTypeMavenDefinition,
  getH2MavenDefinition,
  javaSqlDatabaseArtifacts,
} from './internal/dependencies.js';

const { SQL } = databaseTypes;

export default class SqlGenerator extends BaseApplicationGenerator {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnJHipster('jhipster:java:domain');
    }
  }

  get composing() {
    return this.asComposingTaskGroup({
      async composing() {
        await this.composeWithJHipster(GENERATOR_LIQUIBASE);
      },
    });
  }

  get [BaseApplicationGenerator.COMPOSING]() {
    return this.delegateTasksToBlueprint(() => this.composing);
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      async preparing({ application }) {
        const anyApp = application as any;
        anyApp.devDatabaseExtraOptions = getDBCExtraOption(anyApp.devDatabaseType);
        anyApp.prodDatabaseExtraOptions = getDBCExtraOption(anyApp.prodDatabaseType);

        anyApp.prodDatabaseDriver = getDatabaseDriverForDatabase(application.prodDatabaseType!);
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING]() {
    return this.delegateTasksToBlueprint(() => this.preparing);
  }

  get preparingEachEntity() {
    return this.asPreparingEachEntityTaskGroup({
      prepareEntity({ entity }) {
        entity.relationships.forEach(relationship => {
          if (relationship.persistableRelationship === undefined && relationship.relationshipType === 'many-to-many') {
            relationship.persistableRelationship = true;
          }
        });
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING_EACH_ENTITY]() {
    return this.delegateTasksToBlueprint(() => this.preparingEachEntity);
  }

  get preparingEachEntityRelationship() {
    return this.asPreparingEachEntityRelationshipTaskGroup({
      prepareRelationship({ application, relationship }) {
        if (application.reactive) {
          relationship.relationshipSqlSafeName = isReservedTableName(relationship.relationshipName, SQL)
            ? `e_${relationship.relationshipName}`
            : relationship.relationshipName;
        }
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING_EACH_ENTITY_RELATIONSHIP]() {
    return this.delegateTasksToBlueprint(() => this.preparingEachEntityRelationship);
  }

  get writing() {
    return this.asWritingTaskGroup({
      cleanupTask,
      writeTask,
    });
  }

  get [BaseApplicationGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  get writingEntities() {
    return {
      cleanupEntitiesTask,
      writeEntitiesTask,
    };
  }

  get [BaseApplicationGenerator.WRITING_ENTITIES]() {
    return this.delegateTasksToBlueprint(() => this.writingEntities);
  }

  get postWriting() {
    return this.asPostWritingTaskGroup({
      addTestSpringFactory({ source, application }) {
        source.addTestSpringFactory?.({
          key: 'org.springframework.test.context.ContextCustomizerFactory',
          value: `${application.packageName}.config.SqlTestContainersSpringContextCustomizerFactory`,
        });
      },
      addLog({ source }) {
        source.addLogbackTestLog?.({
          name: 'org.hibernate.orm.incubating',
          level: 'ERROR',
        });
      },
      addDependencies({ application, source }) {
        const { reactive, javaDependencies, packageFolder } = application;
        assert.ok(javaDependencies, 'javaDependencies is required');
        assert.ok(packageFolder, 'packageFolder is required');

        const { prodDatabaseType, devDatabaseTypeH2Any } = application as any;
        const dbDefinitions = getDatabaseTypeMavenDefinition(prodDatabaseType, {
          inProfile: devDatabaseTypeH2Any ? 'prod' : undefined,
          javaDependencies,
        });
        const h2Definitions = devDatabaseTypeH2Any ? getH2MavenDefinition({ prodDatabaseType, packageFolder }) : undefined;

        source.addJavaDefinitions?.(
          {
            condition: reactive,
            dependencies: [
              {
                groupId: 'commons-beanutils',
                artifactId: 'commons-beanutils',
                version: javaDependencies['commons-beanutils'],
                exclusions: [{ groupId: 'commons-logging', artifactId: 'commons-logging' }],
              },
              { groupId: 'jakarta.persistence', artifactId: 'jakarta.persistence-api' },
              { groupId: 'org.springframework.boot', artifactId: 'spring-boot-starter-data-r2dbc' },
            ],
            mavenDefinition: dbDefinitions.r2dbc,
          },
          {
            condition: !reactive,
            dependencies: [
              { groupId: 'com.fasterxml.jackson.datatype', artifactId: 'jackson-datatype-hibernate6' },
              { groupId: 'org.hibernate.orm', artifactId: 'hibernate-core' },
              { groupId: 'org.hibernate.validator', artifactId: 'hibernate-validator' },
              { groupId: 'org.springframework.boot', artifactId: 'spring-boot-starter-data-jpa' },
              { groupId: 'org.springframework.security', artifactId: 'spring-security-data' },
              { scope: 'annotationProcessor', groupId: 'org.hibernate.orm', artifactId: 'hibernate-jpamodelgen' },
            ],
            mavenDefinition: { dependencies: [{ inProfile: 'IDE', groupId: 'org.hibernate.orm', artifactId: 'hibernate-jpamodelgen' }] },
          },
          {
            dependencies: [
              { groupId: 'com.fasterxml.jackson.module', artifactId: 'jackson-module-jaxb-annotations' },
              { groupId: 'com.zaxxer', artifactId: 'HikariCP' },
              { scope: 'annotationProcessor', groupId: 'org.glassfish.jaxb', artifactId: 'jaxb-runtime' },
              { scope: 'test', groupId: 'org.testcontainers', artifactId: 'jdbc' },
              { scope: 'test', groupId: 'org.testcontainers', artifactId: 'junit-jupiter' },
              { scope: 'test', groupId: 'org.testcontainers', artifactId: 'testcontainers' },
            ],
            mavenDefinition: dbDefinitions.jdbc,
          },
          {
            condition: devDatabaseTypeH2Any,
            mavenDefinition: h2Definitions?.jdbc,
          },
          {
            condition: devDatabaseTypeH2Any && reactive,
            mavenDefinition: h2Definitions?.r2dbc,
          },
        );

        if (application.buildToolGradle) {
          const artifacts = javaSqlDatabaseArtifacts[prodDatabaseType];
          source.addJavaDefinition!(
            { dependencies: [artifacts.jdbc, artifacts.testContainer, ...(reactive && artifacts.r2dbc ? [artifacts.r2dbc] : [])] },
            { gradleFile: devDatabaseTypeH2Any ? 'gradle/profile_prod.gradle' : 'build.gradle' },
          );
          if (devDatabaseTypeH2Any) {
            source.addJavaDefinition!(
              { dependencies: [javaSqlDatabaseArtifacts.h2.jdbc, ...(reactive ? [javaSqlDatabaseArtifacts.h2.r2dbc] : [])] },
              { gradleFile: 'gradle/profile_dev.gradle' },
            );
          }
        }
      },
      nativeHints({ application, source }) {
        if (application.reactive || !application.graalvmSupport) return;

        // Latest hibernate-core version supported by Reachability Repository is 6.5.0.Final
        // Hints may be dropped if newer version is supported
        // https://github.com/oracle/graalvm-reachability-metadata/blob/master/metadata/org.hibernate.orm/hibernate-core/index.json
        source.addNativeHint!({
          publicConstructors: ['org.hibernate.binder.internal.BatchSizeBinder.class'],
        });
      },
      async nativeMavenBuildTool({ application, source }) {
        if (!application.buildToolMaven || !application.graalvmSupport) return;

        source.addMavenProperty!({ property: 'spring.h2.console.enabled', value: 'true' });
      },
      async nativeGradleBuildTool({ application, source }) {
        if (!application.buildToolGradle || !application.graalvmSupport) return;

        const { reactive, javaManagedProperties } = application;
        if (!reactive) {
          source.addGradleDependencyCatalogVersion!({ name: 'hibernate', version: javaManagedProperties!['hibernate.version']! });
          source.addGradleDependencyCatalogPlugin!({
            addToBuild: true,
            pluginName: 'hibernate',
            id: 'org.hibernate.orm',
            'version.ref': 'hibernate',
          });
        }
      },
    });
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }

  get postWritingEntities() {
    return this.asPostWritingEntitiesTaskGroup({
      async jsonFilter({ application, entities, source }) {
        if (application.reactive || !application.graalvmSupport) return;
        for (const entity of entities.filter(({ builtIn, builtInUser, embedded }) => builtInUser || (!builtIn && !embedded))) {
          source.editJavaFile!(`${application.srcMainJava}/${entity.entityAbsoluteFolder}/domain/${entity.entityClass}.java`, {
            annotations: [
              {
                package: 'com.fasterxml.jackson.annotation',
                annotation: 'JsonFilter',
                parameters: () => '"lazyPropertyFilter"',
              },
            ],
          });
        }
      },
    });
  }

  get [BaseApplicationGenerator.POST_WRITING_ENTITIES]() {
    return this.delegateTasksToBlueprint(() => this.postWritingEntities);
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
