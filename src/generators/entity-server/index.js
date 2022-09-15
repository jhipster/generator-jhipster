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
/* eslint-disable consistent-return */
const BaseBlueprintGenerator = require('../generator-base-blueprint');
const { PREPARING_PRIORITY, DEFAULT_PRIORITY, WRITING_PRIORITY, PREPARING_FIELDS_PRIORITY, POST_WRITING_PRIORITY } =
  require('../../lib/constants/priorities.cjs').compat;

const constants = require('../generator-constants');
const { entityDefaultConfig } = require('../generator-defaults');
const { writeFiles, customizeFiles } = require('./files');
const utils = require('../utils');
const { GENERATOR_ENTITY_SERVER } = require('../generator-list');
const { OAUTH2, SESSION } = require('../../jdl/jhipster/authentication-types');
const { SQL } = require('../../jdl/jhipster/database-types');
const { isReservedTableName } = require('../../jdl/jhipster/reserved-keywords');

/* constants used throughout */

module.exports = class extends BaseBlueprintGenerator {
  constructor(args, options, features) {
    super(args, options, features);

    this.entity = this.options.context || { ...entityDefaultConfig };

    this.jhipsterContext = this.options.jhipsterContext || this.options.context;
  }

  async _postConstruct() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints(GENERATOR_ENTITY_SERVER, { context: this.options.context });
    }
  }

  _preparing() {
    return {
      validateDatabaseSafety() {
        const entity = this.entity;
        if (isReservedTableName(entity.entityInstance, entity.prodDatabaseType) && entity.jhiPrefix) {
          entity.entityInstanceDbSafe = `${entity.jhiPrefix}${entity.entityClass}`;
        } else {
          entity.entityInstanceDbSafe = entity.entityInstance;
        }
      },
    };
  }

  get [PREPARING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._preparing();
  }

  // Public API method used by the getter and also by Blueprints
  _preparingFields() {
    return {
      processDerivedPrimaryKeyFields() {
        const primaryKey = this.entity.primaryKey;
        if (!primaryKey || primaryKey.composite || !primaryKey.derivedFields) {
          return;
        }
        // derivedPrimary uses '@MapsId', which requires for each relationship id field to have corresponding field in the model
        const derivedFields = this.entity.primaryKey.derivedFields;
        this.entity.fields.unshift(...derivedFields);
      },
      processFieldType() {
        this.entity.fields.forEach(field => {
          if (field.blobContentTypeText) {
            field.javaFieldType = 'String';
          } else {
            field.javaFieldType = field.fieldType;
          }
        });
      },
    };
  }

  get [PREPARING_FIELDS_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._preparingFields();
  }

  _default() {
    return {
      ...super._missingPreDefault(),

      loadConfigIntoGenerator() {
        utils.copyObjectProps(this, this.entity);

        const { databaseType, authenticationType, reactive } = this.entity;
        this.testsNeedCsrf = [OAUTH2, SESSION].includes(authenticationType);
        this.officialDatabaseType = constants.OFFICIAL_DATABASE_TYPE_NAMES[databaseType];
        let springDataDatabase;
        if (this.databaseType !== SQL) {
          springDataDatabase = this.officialDatabaseType;
          if (reactive) {
            springDataDatabase += ' reactive';
          }
        } else {
          springDataDatabase = reactive ? 'R2DBC' : 'JPA';
        }
        this.springDataDescription = `Spring Data ${springDataDatabase}`;
      },

      /**
       * Process json ignore references to prevent cyclic relationships.
       */
      processJsonIgnoreReferences() {
        this.relationships
          .filter(relationship => relationship.ignoreOtherSideProperty === undefined)
          .forEach(relationship => {
            relationship.ignoreOtherSideProperty =
              !relationship.embedded && !!relationship.otherEntity && relationship.otherEntity.relationships.length > 0;
          });
        this.relationshipsContainOtherSideIgnore = this.relationships.some(relationship => relationship.ignoreOtherSideProperty);
      },

      processJavaEntityImports() {
        this.importApiModelProperty =
          this.relationships.some(relationship => relationship.javadoc) || this.fields.some(field => field.javadoc);
      },

      processUniqueEnums() {
        this.uniqueEnums = {};

        this.fields.forEach(field => {
          if (
            field.fieldIsEnum &&
            (!this.uniqueEnums[field.fieldType] || (this.uniqueEnums[field.fieldType] && field.fieldValues.length !== 0))
          ) {
            this.uniqueEnums[field.fieldType] = field.fieldType;
          }
        });
      },

      useMapsIdRelation() {
        if (this.primaryKey && this.primaryKey.derived) {
          this.isUsingMapsId = true;
          this.mapsIdAssoc = this.relationships.find(rel => rel.id);
          this.hasOauthUser = this.mapsIdAssoc.otherEntityName === 'user' && this.authenticationType === OAUTH2;
        } else {
          this.isUsingMapsId = false;
          this.mapsIdAssoc = null;
          this.hasOauthUser = false;
        }
      },

      processUniqueEntityTypes() {
        this.reactiveOtherEntities = new Set(this.reactiveEagerRelations.map(rel => rel.otherEntity));
        this.reactiveUniqueEntityTypes = new Set(this.reactiveEagerRelations.map(rel => rel.otherEntityNameCapitalized));
        this.reactiveUniqueEntityTypes.add(this.entityClass);
      },

      relationshipsSqlDerivedProperties() {
        if (!this.databaseTypeSql) return;
        for (const relationship of this.relationships) {
          if (!relationship.otherEntity.embedded) {
            relationship.joinColumnNames = relationship.otherEntity.primaryKey.fields.map(
              otherField => `${relationship.columnNamePrefix}${otherField.columnName}`
            );
          }
        }
      },
    };
  }

  get [DEFAULT_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._default();
  }

  // Public API method used by the getter and also by Blueprints
  _writing() {
    return {
      ...writeFiles(),
      ...super._missingPostWriting(),
    };
  }

  get [WRITING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._writing();
  }

  // Public API method used by the getter and also by Blueprints
  _postWriting() {
    return {
      customizeFiles() {
        return customizeFiles.call(this);
      },
    };
  }

  get [POST_WRITING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._postWriting();
  }

  /**
   * @deprecated
   * TODO remove for v8
   * Private methods used in templates
   */
  _getJoinColumnName(relationship) {
    if (relationship.id === true) {
      return 'id';
    }
    return `${this.getColumnName(relationship.relationshipName)}_id`;
  }

  _generateSqlSafeName(name) {
    if (isReservedTableName(name, SQL)) {
      return `e_${name}`;
    }
    return name;
  }
};
