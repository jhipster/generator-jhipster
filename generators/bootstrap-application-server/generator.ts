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

import BaseApplicationGenerator from '../base-application/index.js';
import {
  JAVA_VERSION,
  MAIN_DIR,
  SERVER_MAIN_RES_DIR,
  SERVER_MAIN_SRC_DIR,
  SERVER_TEST_RES_DIR,
  SERVER_TEST_SRC_DIR,
  TEST_DIR,
  dockerContainers,
} from '../generator-constants.js';
import { loadRequiredConfigIntoEntity, prepareEntityPrimaryKeyForTemplates } from '../base-application/support/prepare-entity.js';
import {
  addEntitiesOtherRelationships,
  getPrimaryKeyValue,
  hibernateSnakeCase,
  loadDerivedServerConfig,
  loadRequiredConfigDerivedProperties,
  loadServerConfig,
  prepareEntity as prepareEntityServerForTemplates,
  prepareRelationship,
} from '../server/support/index.js';
import { getGradleLibsVersionsProperties } from '../gradle/support/index.js';
import { getPomVersionProperties } from '../maven/support/index.js';
import { prepareField as prepareFieldForLiquibaseTemplates } from '../liquibase/support/index.js';
import { getDockerfileContainers } from '../docker/utils.js';
import { normalizePathEnd } from '../base/support/path.js';
import { getMainClassName } from '../java/support/index.js';
import { loadConfig, loadDerivedConfig } from '../../lib/internal/index.js';
import serverCommand from '../server/command.js';

export default class BoostrapApplicationServer extends BaseApplicationGenerator {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (this.delegateToBlueprint) {
      throw new Error('Only sbs blueprint is supported');
    }

    await this.dependsOnBootstrapApplicationBase();
  }

  get loading() {
    return this.asLoadingTaskGroup({
      cancel({ application }) {
        if (application.skipServer) {
          // TODO fix preparation for skipServer
          // this.cancelCancellableTasks();
        }
      },
      async loadApplication({ application, applicationDefaults }) {
        loadConfig(serverCommand.configs, { config: this.jhipsterConfigWithDefaults, application });
        loadServerConfig({ config: this.jhipsterConfigWithDefaults, application });

        const pomFile = this.readTemplate(this.jhipsterTemplatePath('../../server/resources/pom.xml'))?.toString();
        const gradleLibsVersions = this.readTemplate(
          this.jhipsterTemplatePath('../../server/resources/gradle/libs.versions.toml'),
        )?.toString();
        const applicationJavaDependencies = this.prepareDependencies(
          {
            ...getPomVersionProperties(pomFile!),
            ...getGradleLibsVersionsProperties(gradleLibsVersions!),
          },
          'java',
        );

        const dockerfile = this.readTemplate(this.jhipsterTemplatePath('../../server/resources/Dockerfile'));
        const applicationDockerContainers = this.prepareDependencies(
          {
            ...dockerContainers,
            ...getDockerfileContainers(dockerfile),
          },
          'docker',
        );

        applicationDefaults({
          javaVersion: this.useVersionPlaceholders ? 'JAVA_VERSION' : JAVA_VERSION,
          packageInfoJavadocs: [],
          javaNodeBuildPaths: [],
          javaProperties: {},
          javaManagedProperties: {},
          javaDependencies: ({ javaDependencies }) => ({
            ...applicationJavaDependencies,
            ...javaDependencies,
          }),
          dockerContainers: ({ dockerContainers: currentDockerContainers = {} }) => ({
            ...applicationDockerContainers,
            ...currentDockerContainers,
          }),
          gatewayRoutes: undefined,
        });
      },
    });
  }

  get [BaseApplicationGenerator.LOADING]() {
    return this.loading;
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      prepareApplication({ application }) {
        loadDerivedConfig(serverCommand.configs, { application });
        loadDerivedServerConfig({ application });
      },
      prepareForTemplates({ application: app }) {
        const application: any = app;
        // Application name modified, using each technology's conventions
        application.mainClass = getMainClassName({ baseName: application.baseName });
        application.jhiTablePrefix = hibernateSnakeCase(application.jhiPrefix);
        application.mainJavaDir = SERVER_MAIN_SRC_DIR;
        application.mainJavaPackageDir = normalizePathEnd(`${SERVER_MAIN_SRC_DIR}${application.packageFolder}`);
        application.mainJavaResourceDir = SERVER_MAIN_RES_DIR;
        application.testJavaDir = SERVER_TEST_SRC_DIR;
        application.testJavaPackageDir = normalizePathEnd(`${SERVER_TEST_SRC_DIR}${application.packageFolder}`);
        application.testResourceDir = SERVER_TEST_RES_DIR;
        application.srcMainDir = MAIN_DIR;
        application.srcTestDir = TEST_DIR;
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING]() {
    return this.preparing;
  }

  get loadingEntities() {
    return this.asLoadingEntitiesTaskGroup({
      loadingEntities({ entitiesToLoad }) {
        for (const { entityBootstrap } of entitiesToLoad) {
          loadRequiredConfigIntoEntity.call(this, entityBootstrap, this.jhipsterConfigWithDefaults);
        }
      },
      requiredOtherSideRelationships({ entitiesToLoad }) {
        this.validateResult(addEntitiesOtherRelationships(entitiesToLoad.map(({ entityBootstrap }) => entityBootstrap)));
      },
    });
  }

  get [BaseApplicationGenerator.LOADING_ENTITIES]() {
    return this.loadingEntities;
  }

  get preparingEachEntity() {
    return this.asPreparingEachEntityTaskGroup({
      prepareEntity({ entity, application }) {
        prepareEntityServerForTemplates(entity, application);
        loadRequiredConfigDerivedProperties(entity);
      },
      preparePrimaryKey({ entity, application }) {
        // If primaryKey doesn't exist, create it.
        if (!entity.embedded && !entity.primaryKey) {
          prepareEntityPrimaryKeyForTemplates.call(this, { entity, application });
        }
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING_EACH_ENTITY]() {
    return this.preparingEachEntity;
  }

  get preparingEachEntityField() {
    return this.asPreparingEachEntityFieldTaskGroup({
      prepareDatabase({ application, field }) {
        prepareFieldForLiquibaseTemplates(application, field);
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING_EACH_ENTITY_FIELD]() {
    return this.preparingEachEntityField;
  }

  get preparingEachEntityRelationship() {
    return this.asPreparingEachEntityRelationshipTaskGroup({
      prepareRelationship({ entity, relationship }) {
        prepareRelationship({ entity, relationship });
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING_EACH_ENTITY_RELATIONSHIP]() {
    return this.preparingEachEntityRelationship;
  }

  get postPreparingEachEntity() {
    return this.asPostPreparingEachEntityTaskGroup({
      processDerivedPrimaryKeyFields({ entity }) {
        const primaryKey = entity.primaryKey;
        if (!primaryKey || primaryKey.composite || !primaryKey.derived) {
          return;
        }
        // derivedPrimary uses '@MapsId', which requires for each relationship id field to have corresponding field in the model
        const derivedFields = primaryKey.derivedFields;
        entity.fields.unshift(...derivedFields);
      },
    });
  }

  get [BaseApplicationGenerator.POST_PREPARING_EACH_ENTITY]() {
    return this.postPreparingEachEntity;
  }

  get default() {
    return this.asDefaultTaskGroup({
      async postPreparingEntity({ application, entities }) {
        if (!application.backendTypeJavaAny) return;
        for (const entity of entities) {
          if (entity.primaryKey) {
            entity.resetFakerSeed(`${application.baseName}post-prepare-server`);
            entity.primaryKey.javaSampleValues ??= [
              getPrimaryKeyValue(entity.primaryKey, application.databaseType!, 1),
              getPrimaryKeyValue(entity.primaryKey, application.databaseType!, 2),
              getPrimaryKeyValue(entity.primaryKey, application.databaseType!, entity.faker.number.int({ min: 10, max: 100 })),
            ];
          }
        }
      },
    });
  }

  get [BaseApplicationGenerator.DEFAULT]() {
    return this.default;
  }
}
