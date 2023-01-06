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
import { prepareEntityForTemplates } from '../../utils/entity.mjs';
import { prepareFieldForTemplates } from '../../utils/field.mjs';
import { prepareRelationshipForTemplates } from '../../utils/relationship.mjs';
import { stringify } from '../../utils/index.mjs';
import { createUserEntity } from './utils.mjs';
import { DOCKER_DIR } from '../generator-constants.mjs';
import type { CommonClientServerApplication } from '../base-application/types.mjs';
import { GENERATOR_BOOTSTRAP, GENERATOR_COMMON, GENERATOR_PROJECT_NAME } from '../generator-list.mjs';
import { addFakerToEntity } from './faker.mjs';
import { packageJson } from '../../lib/index.mjs';

const { upperFirst } = _;

/**
 * @class
 * @extends { BaseApplicationGenerator<CommonClientServerApplication> }
 */
export default class BootStrapApplicationBase extends BaseApplicationGenerator<CommonClientServerApplication> {
  constructor(args: any, options: any, features: any) {
    super(args, options, { unique: 'namespace', ...features });

    if (this.options.help) return;

    this.loadStoredAppOptions();
  }

  async beforeQueue() {
    await this.dependsOnJHipster(GENERATOR_PROJECT_NAME);
    await this.composeWithJHipster(GENERATOR_BOOTSTRAP);
  }

  get configuring() {
    return this.asLoadingTaskGroup({
      configuring() {
        if (this.jhipsterConfig.baseName === undefined) {
          this.jhipsterConfig.baseName = 'jhipster';
        }
      },
    });
  }

  get [BaseApplicationGenerator.CONFIGURING]() {
    return this.configuring;
  }

  get loading() {
    return this.asLoadingTaskGroup({
      loadApplication({ application }) {
        this.loadAppConfig(undefined, application);
        this.loadTranslationConfig(undefined, application);
      },
      loadNodeDependencies({ application }) {
        const commonDependencies = this.fs.readJSON(this.fetchFromInstalledJHipster(GENERATOR_COMMON, 'templates', 'package.json')) as any;
        application.nodeDependencies = this.prepareDependencies({
          ...(application.nodeDependencies ?? {}),
          prettier: packageJson.dependencies.prettier,
          'prettier-plugin-java': packageJson.dependencies['prettier-plugin-java'],
          'prettier-plugin-packagejson': packageJson.dependencies['prettier-plugin-packagejson'],
          ...(commonDependencies.dependencies ?? {}),
          ...(commonDependencies.devDependencies ?? {}),
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
        this.loadDerivedAppConfig(application);

        application.nodePackageManager = 'npm';
        application.dockerServicesDir = DOCKER_DIR;

        // TODO v8 drop the following variables
        const anyApplication = application as any;

        anyApplication.clientPackageManager = application.nodePackageManager;
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING]() {
    return this.preparing;
  }

  get configuringEachEntity() {
    return this.asConfiguringEachEntityTaskGroup({
      configureEntity({ entityStorage, entityConfig }) {
        entityStorage.defaults({ fields: [], relationships: [] });

        if (entityConfig.changelogDate === undefined) {
          entityConfig.changelogDate = this.dateFormatForLiquibase();
        }
      },
    });
  }

  get [BaseApplicationGenerator.CONFIGURING_EACH_ENTITY]() {
    return this.configuringEachEntity;
  }

  get loadingEntities() {
    return this.asLoadingEntitiesTaskGroup({
      loadUser({ application }) {
        if (application.generateBuiltInUserEntity) {
          if (this.sharedData.hasEntity('User')) {
            throw new Error("Fail to bootstrap 'User', already exists.");
          }

          const user = createUserEntity.call(this, {}, application);
          this.sharedData.setEntity('User', user);
          application.user = user;
        }
      },
      loadingEntities({ entitiesToLoad }) {
        for (const { entityName, entityStorage } of entitiesToLoad) {
          if (this.sharedData.hasEntity(entityName)) {
            throw new Error(`Fail to bootstrap '${entityName}', already exists.`);
          }
          const entity = entityStorage.getAll();
          entity.name = entity.name ?? entityName;
          this.sharedData.setEntity(entityName, entity);

          // Load field annotations
          for (const field of entity.fields ?? []) {
            if (field.options) {
              Object.assign(field, field.options);
            }
          }
        }

        for (const { entityName } of entitiesToLoad) {
          const entity = this.sharedData.getEntity(entityName);
          // Load relationships annotations
          for (const relationship of entity.relationships ?? []) {
            const { otherEntityName, options } = relationship;
            if (options) {
              Object.assign(relationship, options);
            }
            const otherEntity = this.sharedData.getEntity(upperFirst(otherEntityName));
            if (!otherEntity) {
              throw new Error(`Error at entity ${entityName}: could not find the entity of the relationship ${stringify(relationship)}`);
            }
            relationship.otherEntity = otherEntity;

            otherEntity.otherRelationships = otherEntity.otherRelationships || [];
            otherEntity.otherRelationships.push(relationship);
          }
        }
      },
    });
  }

  get [BaseApplicationGenerator.LOADING_ENTITIES]() {
    return this.loadingEntities;
  }

  get preparingEachEntity() {
    return this.asPreparingEachEntityTaskGroup({
      async preparingEachEntity({ application, entity }) {
        await addFakerToEntity(entity, application.nativeLanguage);
        prepareEntityForTemplates(entity, this, application);
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING_EACH_ENTITY]() {
    return this.preparingEachEntity;
  }

  get preparingEachEntityField() {
    return this.asPreparingEachEntityFieldTaskGroup({
      prepareFieldsForTemplates({ entity, field }) {
        prepareFieldForTemplates(entity, field, this);
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING_EACH_ENTITY_FIELD]() {
    return this.preparingEachEntityField;
  }

  get preparingEachEntityRelationship() {
    return this.asPreparingEachEntityRelationshipTaskGroup({
      prepareRelationshipsForTemplates({ entity, relationship }) {
        prepareRelationshipForTemplates(entity, relationship, this);
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING_EACH_ENTITY_RELATIONSHIP]() {
    return this.preparingEachEntityRelationship;
  }
}
