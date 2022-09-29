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
import { GENERATOR_BOOTSTRAP_APPLICATION_BASE } from '../generator-list.mjs';
import constants from '../generator-constants.js';
import entityUtils from '../../utils/entity.js';
import type { SpringBootApplication } from './types.js';
import { prepareFieldForLiquibaseTemplates } from '../../utils/liquibase.js';
import AuthentitcationTypes from '../../jdl/jhipster/authentication-types.js';
import FieldTypes from '../../jdl/jhipster/field-types.js';

const {
  CommonDBTypes: { LONG: TYPE_LONG },
} = FieldTypes;
const { OAUTH2 } = AuthentitcationTypes;
const { CLIENT_MAIN_SRC_DIR, CLIENT_TEST_SRC_DIR } = constants;
const {
  loadRequiredConfigIntoEntity,
  loadRequiredConfigDerivedProperties,
  prepareEntityServerForTemplates,
  prepareEntityPrimaryKeyForTemplates,
} = entityUtils;

/**
 * @class
 * @extends {BaseApplicationGenerator<SpringBootApplication>}
 */
export default class BoostrapApplicationServer extends BaseApplicationGenerator<SpringBootApplication> {
  constructor(args: any, options: any, features: any) {
    super(args, options, { unique: 'namespace', ...features });
  }

  async _postConstruct() {
    await this.dependsOnJHipster(GENERATOR_BOOTSTRAP_APPLICATION_BASE);
  }

  get loading() {
    return this.asLoadingTaskGroup({
      loadApplication({ application }) {
        this.loadServerConfig(undefined, application);

        application.backendType = 'Java';
        application.temporaryDir = application.buildTool === 'gradle' ? 'build/' : 'target/';
        application.buildDir = `${application.temporaryDir}${application.buildTool === 'gradle' ? 'resources/main/' : 'classes/'}`;
        application.clientSrcDir = CLIENT_MAIN_SRC_DIR;
        application.clientTestDir = CLIENT_TEST_SRC_DIR;
        application.clientDistDir = `${application.buildDir}${constants.CLIENT_DIST_DIR}`;

        // TODO v8 drop the following variables
        const applicationAsAny = application as any;
        applicationAsAny.DIST_DIR = application.clientDistDir;
        applicationAsAny.BUILD_DIR = application.temporaryDir;
        applicationAsAny.MAIN_SRC_DIR = application.srcMainWebapp;
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
          loadRequiredConfigIntoEntity(entity, application);
          loadRequiredConfigDerivedProperties(entity);
        }
      },
      requiredOtherSideRelationships({ entitiesToLoad }) {
        for (const { entityName } of entitiesToLoad) {
          const entity = this.sharedData.getEntity(entityName);
          for (const relationship of entity.relationships) {
            if (
              relationship.unidirectional &&
              (relationship.relationshipType === 'many-to-many' ||
                // OneToOne back reference is required due to filtering
                relationship.relationshipType === 'one-to-one' ||
                (relationship.relationshipType === 'one-to-many' && !entity.databaseTypeNeo4j && !entity.databaseTypeNo))
            ) {
              relationship.otherEntityRelationshipName = _.lowerFirst(entity.name);
              relationship.otherEntity.relationships.push({
                otherEntity: entity,
                otherEntityName: relationship.otherEntityRelationshipName,
                ownerSide: !relationship.ownerSide,
                otherEntityRelationshipName: relationship.relationshipName,
                relationshipName: relationship.otherEntityRelationshipName,
                relationshipType: relationship.relationshipType.split('-').reverse().join('-'),
              });
            }
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
      prepareUser({ entity }) {
        if (entity.builtIn && entity.name === 'User') {
          const oauth2 = entity.authenticationType === OAUTH2;
          const userIdType = entity.primaryKey.type;
          const liquibaseFakeData = oauth2
            ? []
            : [
                { id: userIdType === TYPE_LONG ? 1 : entity.primaryKey.fields[0].generateFakeData() },
                { id: userIdType === TYPE_LONG ? 2 : entity.primaryKey.fields[0].generateFakeData() },
              ];
          entity.liquibaseFakeData = liquibaseFakeData;
          entity.fakeDataCount = liquibaseFakeData.length;
          this.configOptions.sharedLiquibaseFakeData.User = liquibaseFakeData;
        }
      },
    });
  }

  get [BaseApplicationGenerator.POST_PREPARING_EACH_ENTITY]() {
    return this.postPreparingEachEntity;
  }
}
