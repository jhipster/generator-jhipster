/**
 * Copyright 2013-2022 the original author or authors from the JHipster project.
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
import entityUtils from '../../utils/entity.cjs';
import fieldUtils from '../../utils/field.cjs';
import relationshipUtils from '../../utils/relationship.cjs';
import utils from '../../utils/index.cjs';
import userUtils from '../../utils/user.cjs';
import { DOCKER_DIR, NODE_VERSION } from '../generator-constants.mjs';
import type { CommonClientServerApplication } from './types.js';

const { prepareEntityForTemplates } = entityUtils;
const { prepareFieldForTemplates } = fieldUtils;
const { prepareRelationshipForTemplates } = relationshipUtils;
const { stringify } = utils;
const { createUserEntity } = userUtils;
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
        application.nodeDestinationVersion = NODE_VERSION;
        application.dockerServicesDir = DOCKER_DIR;

        // TODO v8 drop the following variables
        const anyApplication = application as any;

        anyApplication.clientPackageManager = application.nodePackageManager;
        anyApplication.protractorTests = false;
        anyApplication.NODE_VERSION = NODE_VERSION;
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
        if (application.skipUserManagement && !application.authenticationTypeOauth2) {
          return;
        }
        if (this.sharedData.hasEntity('User')) {
          throw new Error("Fail to bootstrap 'User', already exists.");
        }

        const user = createUserEntity.call(this, {}, application);
        this.sharedData.setEntity('User', user);
        application.user = user;
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
      preparingEachEntity({ application, entity }) {
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
