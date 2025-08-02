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

import { existsSync } from 'node:fs';

import { APPLICATION_TYPE_GATEWAY } from '../../lib/core/application-types.ts';
import { databaseTypes, entityOptions, fieldTypes, reservedKeywords, searchEngineTypes, validations } from '../../lib/jhipster/index.ts';
import { isReservedPaginationWords } from '../../lib/jhipster/reserved-keywords.ts';
import BaseApplicationGenerator from '../base-application/index.ts';
import { stringifyApplicationData } from '../base-application/support/index.ts';
import { GENERATOR_COMMON, GENERATOR_SPRING_BOOT } from '../generator-list.ts';
import { isReservedH2Keyword } from '../spring-data-relational/support/h2-reserved-keywords.ts';

import { hibernateSnakeCase } from './support/index.ts';
import type {
  Application as ServerApplication,
  Config as ServerConfig,
  Entity as ServerEntity,
  Field as ServerField,
  Options as ServerOptions,
  Relationship as ServerRelationship,
  Source as ServerSource,
} from './types.js';

const { SUPPORTED_VALIDATION_RULES } = validations;
const { isReservedTableName } = reservedKeywords;
const { SQL, NO: NO_DATABASE } = databaseTypes;

const { NO: NO_SEARCH_ENGINE } = searchEngineTypes;
const { CommonDBTypes, RelationalOnlyDBTypes } = fieldTypes;
const { INSTANT } = CommonDBTypes;
const { BYTE_BUFFER } = RelationalOnlyDBTypes;
const { PaginationTypes, ServiceTypes } = entityOptions;
const {
  Validations: { MAX, MIN, MAXLENGTH, MINLENGTH, MAXBYTES, MINBYTES, PATTERN },
} = validations;

const { NO: NO_PAGINATION } = PaginationTypes;
const { NO: NO_SERVICE } = ServiceTypes;

export default class JHipsterServerGenerator extends BaseApplicationGenerator<
  ServerEntity,
  ServerApplication<ServerEntity>,
  ServerConfig,
  ServerOptions,
  ServerSource
> {
  jhipsterDependenciesVersion!: string;
  projectVersion!: string;

  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnBootstrapApplicationServer();
      await this.dependsOnJHipster(GENERATOR_COMMON);
    }
  }

  get composing() {
    return this.asComposingTaskGroup({
      async composeBackendType() {
        if (!this.jhipsterConfig.backendType || ['spring-boot', 'java'].includes(this.jhipsterConfig.backendType.toLowerCase())) {
          await this.composeWithJHipster(GENERATOR_SPRING_BOOT);
        }
      },
    });
  }

  get [BaseApplicationGenerator.COMPOSING]() {
    return this.delegateTasksToBlueprint(() => this.composing);
  }

  get configuringEachEntity() {
    return this.asConfiguringEachEntityTaskGroup({
      configureMicroservice({ application, entityConfig }) {
        if (application.applicationTypeMicroservice) {
          if (entityConfig.microserviceName === undefined) {
            entityConfig.microserviceName = application.baseName;
          }
          if (entityConfig.clientRootFolder === undefined) {
            entityConfig.clientRootFolder = entityConfig.microserviceName;
          }
          if (entityConfig.databaseType === undefined) {
            entityConfig.databaseType = application.databaseType;
          }
        }
      },
      configureGateway({ application, entityConfig }) {
        if (application.applicationTypeGateway) {
          if (entityConfig.databaseType === undefined) {
            entityConfig.databaseType = application.databaseType;
          }
          if (entityConfig.clientRootFolder === undefined) {
            entityConfig.clientRootFolder = entityConfig.skipUiGrouping ? '' : entityConfig.microserviceName;
          }
        }
      },
      configureEntitySearchEngine({ application, entityConfig }) {
        const { applicationTypeMicroservice, applicationTypeGateway, clientFrameworkAny } = application;
        if (entityConfig.microserviceName && !(applicationTypeMicroservice && clientFrameworkAny)) {
          if (!entityConfig.searchEngine) {
            // If a non-microfrontend microservice entity, should be disabled by default.
            entityConfig.searchEngine = NO_SEARCH_ENGINE;
          }
        }
        if (
          // Don't touch the configuration for microservice entities published at gateways
          !(applicationTypeGateway && entityConfig.microserviceName) &&
          !application.searchEngineAny &&
          entityConfig.searchEngine !== NO_SEARCH_ENGINE
        ) {
          if (entityConfig.searchEngine) {
            this.log.warn('Search engine is enabled at entity level, but disabled at application level. Search engine will be disabled');
          }
          // Search engine can only be enabled at entity level and disabled at application level for gateways publishing a microservice entity
          entityConfig.searchEngine = NO_SEARCH_ENGINE;
        }
      },
      configureModelFiltering({ application, entityConfig }) {
        const { databaseTypeSql, applicationTypeGateway } = application;
        if (
          // Don't touch the configuration for microservice entities published at gateways
          !(applicationTypeGateway && entityConfig.microserviceName) &&
          entityConfig.jpaMetamodelFiltering &&
          (!databaseTypeSql || entityConfig.service === NO_SERVICE)
        ) {
          this.log.warn('Not compatible with jpaMetamodelFiltering, disabling');
          entityConfig.jpaMetamodelFiltering = false;
        }
      },
      configurePagination({ application, entityName, entityConfig }) {
        const entityDatabaseType = entityConfig.databaseType ?? application.databaseType;
        // disable pagination if there is no database, unless it’s a microservice entity published by a gateway
        if (
          entityDatabaseType === NO_DATABASE &&
          (application.applicationType !== APPLICATION_TYPE_GATEWAY || !entityConfig.microserviceName)
        ) {
          const errorMessage = `Pagination is not supported for entity ${entityName} when the app doesn't use a database.`;
          if (!this.skipChecks) {
            throw new Error(errorMessage);
          }

          this.log.warn(errorMessage);
          entityConfig.pagination = 'no';
        }
      },
      configureEntityTable({ application, entityName, entityConfig }) {
        if ((application.applicationTypeGateway && entityConfig.microserviceName) || entityConfig.skipServer) return;

        const { jhiTablePrefix, devDatabaseTypeH2Any } = application;

        const databaseType =
          entityConfig.prodDatabaseType ?? application.prodDatabaseType ?? entityConfig.databaseType ?? application.databaseType;
        const entityTableName = entityConfig.entityTableName ?? hibernateSnakeCase(entityName);
        const fixedEntityTableName =
          (isReservedTableName(entityTableName, databaseType) || (devDatabaseTypeH2Any && isReservedH2Keyword(entityTableName))) &&
          jhiTablePrefix
            ? `${jhiTablePrefix}_${entityTableName}`
            : entityTableName;
        if (fixedEntityTableName !== entityTableName) {
          entityConfig.entityTableName = fixedEntityTableName;
        }

        if (entityConfig.incrementalChangelog === undefined) {
          // Keep entity's original incrementalChangelog option.
          entityConfig.incrementalChangelog =
            application.incrementalChangelog &&
            !existsSync(
              this.destinationPath(
                `src/main/resources/config/liquibase/changelog/${entityConfig.annotations?.changelogDate}_added_entity_${entityConfig.name}.xml`,
              ),
            );
        }
      },

      configureFields({ application, entityConfig, entityName }) {
        // Validate entity json field content
        const fields = entityConfig.fields;
        fields!.forEach(field => {
          // Migration from JodaTime to Java Time
          if (field.fieldType === 'DateTime' || field.fieldType === 'Date') {
            field.fieldType = INSTANT;
          }

          this._validateField(entityName, field);

          if (entityConfig.pagination && entityConfig.pagination !== NO_PAGINATION && isReservedPaginationWords(field.fieldName)) {
            throw new Error(
              `Field name '${field.fieldName}' found in ${entityConfig.name} is a reserved keyword, as it is used by Spring for pagination in the URL.`,
            );
          }
          // Field type check should be ignored for entities of others microservices.
          if (!field.fieldValues && (!entityConfig.microserviceName || entityConfig.microserviceName === application.baseName)) {
            if (
              !(Object.values(CommonDBTypes) as string[]).includes(field.fieldType) &&
              (application.databaseType !== SQL || !(Object.values(RelationalOnlyDBTypes) as string[]).includes(field.fieldType))
            ) {
              throw new Error(
                `The type '${field.fieldType}' is an unknown field type for field '${field.fieldName}' of entity '${entityConfig.name}' using '${application.databaseType}' database.`,
              );
            }
          }
        });
        entityConfig.fields = fields;
      },

      configureRelationships({ entityConfig, entityName }) {
        // Validate entity json relationship content
        const relationships = entityConfig.relationships;
        relationships!.forEach(relationship => {
          this._validateRelationship(entityName, relationship);

          if (relationship.relationshipName === undefined) {
            relationship.relationshipName = relationship.otherEntityName;
            this.log.warn(
              `relationshipName is missing in .jhipster/${entityName}.json for relationship ${stringifyApplicationData(
                relationship,
              )}, using ${relationship.otherEntityName} as fallback`,
            );
          }
          if ((relationship as any).useJPADerivedIdentifier) {
            this.log.verboseInfo('Option useJPADerivedIdentifier is deprecated, use id instead');
            relationship.options ??= {};
            relationship.options.id = true;
          }
        });
        entityConfig.relationships = relationships;
      },
    });
  }

  get [BaseApplicationGenerator.CONFIGURING_EACH_ENTITY]() {
    return this.delegateTasksToBlueprint(() => this.configuringEachEntity);
  }

  get loadingEntities() {
    return this.asLoadingEntitiesTaskGroup({
      loadEntityConfig({ entitiesToLoad }) {
        for (const { entityName, entityBootstrap } of entitiesToLoad) {
          for (const field of entityBootstrap.fields) {
            if (field.fieldType === BYTE_BUFFER) {
              this.log.warn(`Cannot use validation in .jhipster/${entityName}.json for field ${stringifyApplicationData(field)}`);
              field.fieldValidate = false;
              field.fieldValidateRules = [];
            }
          }
        }
      },
    });
  }

  get [BaseApplicationGenerator.LOADING_ENTITIES]() {
    return this.delegateTasksToBlueprint(() => this.loadingEntities);
  }

  get postPreparingEachEntity() {
    return this.asPostPreparingEachEntityTaskGroup({
      checkForTableName({ application, entity }) {
        const databaseType =
          (entity as any).prodDatabaseType ?? application.prodDatabaseType ?? entity.databaseType ?? application.databaseType;
        const validation = this._validateTableName(entity.entityTableName, databaseType, entity);
        if (validation !== true) {
          throw new Error(validation);
        }
      },
    });
  }

  get [BaseApplicationGenerator.POST_PREPARING_EACH_ENTITY]() {
    return this.delegateTasksToBlueprint(() => this.postPreparingEachEntity);
  }

  /** @inheritdoc */
  get default() {
    return this.asDefaultTaskGroup({
      checkCompositeIds({ entities }) {
        const entitiesWithCompositeIds = entities.filter(entity => entity.primaryKey?.composite);
        if (entitiesWithCompositeIds.length > 0) {
          throw new Error(
            `Composite id is not supported. Defined in ${entitiesWithCompositeIds.map(
              entity => `${entity.name} (${entity.primaryKey!.fields.map(field => field.fieldName)})`,
            )}`,
          );
        }
      },
    });
  }

  get [BaseApplicationGenerator.DEFAULT]() {
    return this.delegateTasksToBlueprint(() => this.default);
  }

  /**
   * Validate the entityTableName
   * @return {true|string} true for a valid value or error message.
   */
  _validateTableName(entityTableName: string, prodDatabaseType: string, entity: ServerEntity): true | string {
    const jhiTablePrefix = (entity as any).jhiTablePrefix;
    const instructions = `You can specify a different table name in your JDL file or change it in .jhipster/${entity.name}.json file and then run again 'jhipster entity ${entity.name}.'`;

    if (!/^([a-zA-Z0-9_]*)$/.test(entityTableName)) {
      return `The table name cannot contain special characters.
${instructions}`;
    }
    if (!entityTableName) {
      return 'The table name cannot be empty';
    }
    if (isReservedTableName(entityTableName, prodDatabaseType)) {
      if (jhiTablePrefix) {
        this.log.warn(
          `The table name cannot contain the '${entityTableName.toUpperCase()}' reserved keyword, so it will be prefixed with '${jhiTablePrefix}_'.
${instructions}`,
        );
        entity.entityTableName = `${jhiTablePrefix}_${entityTableName}`;
      } else {
        this.log.warn(
          `The table name contain the '${entityTableName.toUpperCase()}' reserved keyword but you have defined an empty jhiPrefix so it won't be prefixed and thus the generated application might not work'.
${instructions}`,
        );
      }
    }
    return true;
  }

  _validateField(entityName: string, field: ServerField) {
    if (field.fieldName === undefined) {
      throw new Error(`fieldName is missing in .jhipster/${entityName}.json for field ${stringifyApplicationData(field)}`);
    }

    if (field.fieldType === undefined) {
      throw new Error(`fieldType is missing in .jhipster/${entityName}.json for field ${stringifyApplicationData(field)}`);
    }

    if (field.fieldValidateRules !== undefined) {
      if (!Array.isArray(field.fieldValidateRules)) {
        throw new Error(`fieldValidateRules is not an array in .jhipster/${entityName}.json for field ${stringifyApplicationData(field)}`);
      }
      field.fieldValidateRules.forEach(fieldValidateRule => {
        if (!SUPPORTED_VALIDATION_RULES.includes(fieldValidateRule)) {
          throw new Error(
            `fieldValidateRules contains unknown validation rule ${fieldValidateRule} in .jhipster/${entityName}.json for field ${stringifyApplicationData(
              field,
            )} [supported validation rules ${SUPPORTED_VALIDATION_RULES}]`,
          );
        }
      });
      if (field.fieldValidateRules.includes(MAX) && field.fieldValidateRulesMax === undefined) {
        throw new Error(`fieldValidateRulesMax is missing in .jhipster/${entityName}.json for field ${stringifyApplicationData(field)}`);
      }
      if (field.fieldValidateRules.includes(MIN) && field.fieldValidateRulesMin === undefined) {
        throw new Error(`fieldValidateRulesMin is missing in .jhipster/${entityName}.json for field ${stringifyApplicationData(field)}`);
      }
      if (field.fieldValidateRules.includes(MAXLENGTH) && field.fieldValidateRulesMaxlength === undefined) {
        throw new Error(
          `fieldValidateRulesMaxlength is missing in .jhipster/${entityName}.json for field ${stringifyApplicationData(field)}`,
        );
      }
      if (field.fieldValidateRules.includes(MINLENGTH) && field.fieldValidateRulesMinlength === undefined) {
        throw new Error(
          `fieldValidateRulesMinlength is missing in .jhipster/${entityName}.json for field ${stringifyApplicationData(field)}`,
        );
      }
      if (field.fieldValidateRules.includes(MAXBYTES) && field.fieldValidateRulesMaxbytes === undefined) {
        throw new Error(
          `fieldValidateRulesMaxbytes is missing in .jhipster/${entityName}.json for field ${stringifyApplicationData(field)}`,
        );
      }
      if (field.fieldValidateRules.includes(MINBYTES) && field.fieldValidateRulesMinbytes === undefined) {
        throw new Error(
          `fieldValidateRulesMinbytes is missing in .jhipster/${entityName}.json for field ${stringifyApplicationData(field)}`,
        );
      }
      if (field.fieldValidateRules.includes(PATTERN) && field.fieldValidateRulesPattern === undefined) {
        throw new Error(
          `fieldValidateRulesPattern is missing in .jhipster/${entityName}.json for field ${stringifyApplicationData(field)}`,
        );
      }
    }
  }

  _validateRelationship(entityName: string, relationship: ServerRelationship) {
    if (relationship.otherEntityName === undefined) {
      throw new Error(
        `otherEntityName is missing in .jhipster/${entityName}.json for relationship ${stringifyApplicationData(relationship)}`,
      );
    }
    if (relationship.relationshipType === undefined) {
      throw new Error(
        `relationshipType is missing in .jhipster/${entityName}.json for relationship ${stringifyApplicationData(relationship)}`,
      );
    }

    if (
      relationship.relationshipSide === undefined &&
      (relationship.relationshipType === 'one-to-one' || relationship.relationshipType === 'many-to-many')
    ) {
      throw new Error(
        `relationshipSide is missing in .jhipster/${entityName}.json for relationship ${stringifyApplicationData(relationship)}`,
      );
    }
  }
}
