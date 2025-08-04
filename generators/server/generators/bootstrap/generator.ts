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

import { mutateData, normalizePathEnd } from '../../../../lib/utils/index.ts';
import BaseApplicationGenerator from '../../../base-application/index.ts';
import { loadRequiredConfigIntoEntity } from '../../../base-application/support/index.ts';
import { loadDockerDependenciesTask } from '../../../base-workspaces/internal/docker-dependencies.ts';
import {
  CLIENT_MAIN_SRC_DIR,
  CLIENT_TEST_SRC_DIR,
  RECOMMENDED_JAVA_VERSION,
  SERVER_MAIN_RES_DIR,
  SERVER_MAIN_SRC_DIR,
  SERVER_TEST_RES_DIR,
  SERVER_TEST_SRC_DIR,
} from '../../../generator-constants.js';
import { getGradleLibsVersionsProperties } from '../../../gradle/support/index.ts';
import { getMainClassName } from '../../../java/support/index.ts';
import { getPomVersionProperties } from '../../../maven/support/index.ts';
import type { Application as SpringDataRelationalApplication } from '../../../spring-data-relational/types.ts';
import serverCommand from '../../command.ts';
import {
  addEntitiesOtherRelationships,
  getPrimaryKeyValue,
  hibernateSnakeCase,
  loadRequiredConfigDerivedProperties,
  prepareField as prepareServerFieldForTemplates,
  preparePostEntityServerDerivedProperties,
  prepareRelationship,
} from '../../support/index.ts';
import type {
  Application as ServerApplication,
  Entity as ServerEntity,
  Features as ServerFeatures,
  Options as ServerOptions,
} from '../../types.ts';

export default class ServerBootstrapGenerator extends BaseApplicationGenerator<ServerEntity, ServerApplication<ServerEntity>> {
  constructor(args: string | string[], opts: ServerOptions, features: ServerFeatures) {
    super(args, opts, { loadCommand: [serverCommand], ...features });
  }

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
      properties({ application, applicationDefaults }) {
        applicationDefaults({
          __override__: true,
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

        mutateData(application as unknown as SpringDataRelationalApplication, {
          devDatabaseTypeH2Any: ({ devDatabaseType }) => devDatabaseType === 'h2Disk' || devDatabaseType === 'h2Memory',
          devJdbcUrl: undefined,
          devDatabaseUsername: undefined,
          devDatabasePassword: undefined,
          prodJdbcUrl: undefined,
          prodDatabaseUsername: undefined,
          prodDatabasePassword: undefined,
        });
      },
      async loadApplication({ application, applicationDefaults }) {
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

        loadDockerDependenciesTask.call(this, { context: application });

        applicationDefaults({
          javaVersion: this.useVersionPlaceholders ? 'JAVA_VERSION' : RECOMMENDED_JAVA_VERSION,
          packageInfoJavadocs: [],
          javaNodeBuildPaths: [],
          javaProperties: {},
          javaManagedProperties: {},
          javaDependencies: ({ javaDependencies }) => ({
            ...applicationJavaDependencies,
            ...javaDependencies,
          }),
        });
      },
    });
  }

  get [BaseApplicationGenerator.LOADING]() {
    return this.loading;
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      prepareForTemplates({ applicationDefaults }) {
        applicationDefaults({
          mainClass: ({ baseName }) => getMainClassName({ baseName }),
          jhiTablePrefix: ({ jhiPrefix }) => hibernateSnakeCase(jhiPrefix),
          imperativeOrReactive: ({ reactive }) => (reactive ? 'reactive' : 'imperative'),
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
    });
  }

  get [BaseApplicationGenerator.PREPARING_EACH_ENTITY]() {
    return this.preparingEachEntity;
  }

  get preparingEachEntityField() {
    return this.asPreparingEachEntityFieldTaskGroup({
      prepareFieldsForTemplates({ application, entity, field }) {
        if (application.databaseTypeAny) {
          prepareServerFieldForTemplates(application, entity, field, this);
        }
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING_EACH_ENTITY_FIELD]() {
    return this.preparingEachEntityField;
  }

  get preparingEachEntityRelationship() {
    return this.asPreparingEachEntityRelationshipTaskGroup({
      prepareRelationship({ application, entity, relationship }) {
        prepareRelationship({ application, entity, relationship });
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING_EACH_ENTITY_RELATIONSHIP]() {
    return this.preparingEachEntityRelationship;
  }

  get postPreparingEachEntity() {
    return this.asPostPreparingEachEntityTaskGroup({
      prepareEntityDerivedProperties({ entity }) {
        preparePostEntityServerDerivedProperties(entity as any);
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
