/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
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
import _ from 'lodash';

import BaseApplicationGenerator from '../base-application/index.mjs';
import { GENERATOR_BOOTSTRAP_APPLICATION_BASE } from '../generator-list.mjs';
import {
  MAIN_DIR,
  SERVER_MAIN_RES_DIR,
  SERVER_MAIN_SRC_DIR,
  SERVER_TEST_RES_DIR,
  SERVER_TEST_SRC_DIR,
  TEST_DIR,
  dockerContainers,
  javaDependencies,
} from '../generator-constants.mjs';
import { loadRequiredConfigIntoEntity, prepareEntityPrimaryKeyForTemplates } from '../base-application/support/index.mjs';
import {
  loadRequiredConfigDerivedProperties,
  prepareEntity as prepareEntityServerForTemplates,
  getPomVersionProperties,
  getGradleLibsVersionsProperties,
  addEntitiesOtherRelationships,
  hibernateSnakeCase,
} from '../server/support/index.mjs';
import { prepareField as prepareFieldForLiquibaseTemplates } from '../liquibase/support/index.mjs';
import { dockerPlaceholderGenerator, getDockerfileContainers } from '../docker/utils.mjs';
import { GRADLE_VERSION } from '../gradle/constants.mjs';
import { normalizePathEnd } from '../base/support/path.mjs';
import { getFrontendAppName } from '../base/support/index.mjs';
import { getMainClassName } from '../java/support/index.mjs';

export default class BoostrapApplicationServer extends BaseApplicationGenerator {
  constructor(args: any, options: any, features: any) {
    super(args, options, { jhipsterBootstrap: false, ...features });
  }

  async beforeQueue() {
    await this.dependsOnJHipster(GENERATOR_BOOTSTRAP_APPLICATION_BASE);
  }

  get loading() {
    return this.asLoadingTaskGroup({
      async loadApplication({ application }) {
        this.loadServerConfig(undefined, application);

        (application as any).gradleVersion = this.useVersionPlaceholders ? 'GRADLE_VERSION' : GRADLE_VERSION;
        application.backendType = 'Java';

        const pomFile = this.readTemplate(this.jhipsterTemplatePath('../../server/resources/pom.xml'))?.toString();
        const gradleLibsVersions = this.readTemplate(
          this.jhipsterTemplatePath('../../server/resources/gradle/libs.versions.toml'),
        )?.toString();
        application.packageInfoJavadocs = [];
        application.javaDependencies = this.prepareDependencies(
          {
            ...javaDependencies,
            ...getPomVersionProperties(pomFile!),
            ...getGradleLibsVersionsProperties(gradleLibsVersions!),
          },
          // Gradle doesn't allows snakeCase
          value => `'${_.kebabCase(value).toUpperCase()}-VERSION'`,
        );

        const dockerfile = this.readTemplate(this.jhipsterTemplatePath('../../server/resources/Dockerfile'));
        application.dockerContainers = this.prepareDependencies(
          {
            ...dockerContainers,
            ...getDockerfileContainers(dockerfile),
          },
          dockerPlaceholderGenerator,
        );
      },
    });
  }

  get [BaseApplicationGenerator.LOADING]() {
    return this.loading;
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      prepareApplication({ application }) {
        this.loadDerivedServerConfig(application);
      },
      prepareForTemplates({ application: app }) {
        const application: any = app;
        // Application name modified, using each technology's conventions
        application.frontendAppName = getFrontendAppName({ baseName: application.baseName });
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
      loadingEntities({ application, entitiesToLoad }) {
        for (const { entityName } of entitiesToLoad) {
          const entity = this.sharedData.getEntity(entityName);
          loadRequiredConfigIntoEntity.call(this, entity, application);
          loadRequiredConfigDerivedProperties(entity);
        }
      },
      requiredOtherSideRelationships() {
        this.validateResult(addEntitiesOtherRelationships(this.sharedData.getEntities().map(({ entity }) => entity)));
      },
    });
  }

  get [BaseApplicationGenerator.LOADING_ENTITIES]() {
    return this.loadingEntities;
  }

  get preparingEachEntity() {
    return this.asPreparingEachEntityTaskGroup({
      prepareEntity({ entity }) {
        prepareEntityServerForTemplates(entity);
      },
      preparePrimaryKey({ entity }) {
        // If primaryKey doesn't exist, create it.
        if (!entity.embedded && !entity.primaryKey) {
          prepareEntityPrimaryKeyForTemplates(entity, this);
        }
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING_EACH_ENTITY]() {
    return this.preparingEachEntity;
  }

  get preparingEachEntityField() {
    return this.asPreparingEachEntityFieldTaskGroup({
      prepareDatabase({ entity, field }) {
        prepareFieldForLiquibaseTemplates(entity, field);
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING_EACH_ENTITY_FIELD]() {
    return this.preparingEachEntityField;
  }

  get postPreparingEachEntity() {
    return this.asPostPreparingEachEntityTaskGroup({
      processDerivedPrimaryKeyFields({ entity }) {
        const primaryKey = entity.primaryKey;
        if (!primaryKey || primaryKey.composite || !primaryKey.derived) {
          return;
        }
        // derivedPrimary uses '@MapsId', which requires for each relationship id field to have corresponding field in the model
        const derivedFields = entity.primaryKey.derivedFields;
        entity.fields.unshift(...derivedFields);
      },
    });
  }

  get [BaseApplicationGenerator.POST_PREPARING_EACH_ENTITY]() {
    return this.postPreparingEachEntity;
  }
}
