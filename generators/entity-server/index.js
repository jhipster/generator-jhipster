/**
 * Copyright 2013-2021 the original author or authors from the JHipster project.
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
const constants = require('../generator-constants');
const { writeFiles, customizeFiles } = require('./files');
const utils = require('../utils');
const BaseBlueprintGenerator = require('../generator-base-blueprint');
const { isReservedTableName } = require('../../jdl/jhipster/reserved-keywords');

/* constants used throughout */
let useBlueprints;

module.exports = class extends BaseBlueprintGenerator {
  constructor(args, opts) {
    super(args, opts);

    this.entity = opts.context;

    this.jhipsterContext = opts.jhipsterContext || opts.context;

    useBlueprints = !this.fromBlueprint && this.instantiateBlueprints('entity-server', { context: opts.context });
  }

  // Public API method used by the getter and also by Blueprints
  _initializing() {
    return {
      setupConstants() {
        // Make constants available in templates
        this.LIQUIBASE_DTD_VERSION = constants.LIQUIBASE_DTD_VERSION;
      },
    };
  }

  get initializing() {
    if (useBlueprints) return;
    return this._initializing();
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
    };
  }

  get preparingFields() {
    if (useBlueprints) return;
    return this._preparingFields();
  }

  _default() {
    return {
      ...super._missingPreDefault(),

      loadConfigIntoGenerator() {
        utils.copyObjectProps(this, this.entity);

        this.testsNeedCsrf = ['oauth2', 'session'].includes(this.entity.authenticationType);
        this.officialDatabaseType = constants.OFFICIAL_DATABASE_TYPE_NAMES[this.entity.databaseType];
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
          this.hasOauthUser = this.mapsIdAssoc.otherEntityName === 'user' && this.authenticationType === 'oauth2';
        } else {
          this.isUsingMapsId = false;
          this.mapsIdAssoc = null;
          this.hasOauthUser = false;
        }
      },

      processUniqueEntityTypes() {
        this.reactiveUniqueEntityTypes = new Set(this.reactiveEagerRelations.map(rel => rel.otherEntityNameCapitalized));
        this.reactiveUniqueEntityTypes.add(this.entityClass);
      },
    };
  }

  get default() {
    if (useBlueprints) return;
    return this._default();
  }

  // Public API method used by the getter and also by Blueprints
  _writing() {
    return { ...writeFiles(), ...super._missingPostWriting() };
  }

  get writing() {
    if (useBlueprints) return;
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

  get postWriting() {
    if (useBlueprints) return;
    return this._postWriting();
  }

  /* Private methods used in templates */
  _getJoinColumnName(relationship) {
    if (relationship.id === true) {
      return 'id';
    }
    return `${this.getColumnName(relationship.relationshipName)}_id`;
  }

  _generateSqlSafeName(name) {
    if (isReservedTableName(name, 'sql')) {
      return `e_${name}`;
    }
    return name;
  }
};
