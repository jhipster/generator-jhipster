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
  CLIENT_MAIN_SRC_DIR,
  CLIENT_TEST_SRC_DIR,
  JAVA_VERSION,
  SERVER_MAIN_RES_DIR,
  SERVER_MAIN_SRC_DIR,
  SERVER_TEST_RES_DIR,
  SERVER_TEST_SRC_DIR,
  dockerContainers,
} from '../generator-constants.js';
import { loadRequiredConfigIntoEntity, prepareEntityPrimaryKeyForTemplates } from '../base-application/support/index.js';
import {
  addEntitiesOtherRelationships,
  getPrimaryKeyValue,
  hibernateSnakeCase,
  loadDerivedServerConfig,
  loadRequiredConfigDerivedProperties,
  prepareRelationship,
} from '../server/support/index.js';
import { getGradleLibsVersionsProperties } from '../gradle/support/index.js';
import { getPomVersionProperties } from '../maven/support/index.js';
import { prepareField as prepareFieldForLiquibaseTemplates } from '../liquibase/support/index.js';
import { getDockerfileContainers } from '../docker/utils.js';
import { getMainClassName } from '../java/support/index.js';
import { loadConfig, loadDerivedConfig } from '../../lib/internal/index.js';
import serverCommand from '../server/command.js';
import { normalizePathEnd } from '../base/support/path.js';

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
      properties({ applicationDefaults }) {
        applicationDefaults({
          __override__: true,
          packageName: this.jhipsterConfigWithDefaults.packageName,

          srcMainJava: SERVER_MAIN_SRC_DIR,
          srcMainResources: SERVER_MAIN_RES_DIR,
          srcMainWebapp: CLIENT_MAIN_SRC_DIR,
          srcTestJava: SERVER_TEST_SRC_DIR,
          srcTestResources: SERVER_TEST_RES_DIR,
          srcTestJavascript: CLIENT_TEST_SRC_DIR,

          packageFolder: ({ packageName }) => `${packageName!.replace(/\./g, '/')}/`,
          javaPackageSrcDir: ({ srcMainJava, packageFolder }) => normalizePathEnd(`${srcMainJava}${packageFolder}`),
          javaPackageTestDir: ({ srcTestJava, packageFolder }) => normalizePathEnd(`${srcTestJava}${packageFolder}`),
        });
      },
      async loadApplication({ application, applicationDefaults }) {
        loadConfig(serverCommand.configs, { config: this.jhipsterConfigWithDefaults, application });

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
      prepareForTemplates({ applicationDefaults }) {
        applicationDefaults({
          mainClass: ({ baseName }) => getMainClassName({ baseName }),
          jhiTablePrefix: ({ jhiPrefix }) => hibernateSnakeCase(jhiPrefix),
          imperativeOrReactive: ({ reactive }) => (reactive ? 'reactive' : 'imperative'),
          authenticationUsesCsrf: ({ authenticationType }) => ['oauth2', 'session'].includes(authenticationType!),
        });
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
      prepareEntity({ entity }) {
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
