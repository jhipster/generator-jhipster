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
const assert = require('assert');
const _ = require('lodash');

const BaseBlueprintGenerator = require('../generator-base-blueprint');
const {
  LOADING_PRIORITY,
  PREPARING_PRIORITY,
  DEFAULT_PRIORITY,
  WRITING_PRIORITY,
  PREPARING_RELATIONSHIPS_PRIORITY,
  POST_WRITING_PRIORITY,
} = require('../../lib/constants/priorities.cjs').compat;
const { addEntityFiles, updateEntityFiles, updateConstraintsFiles, updateMigrateFiles, fakeFiles } = require('./files');
const { SQL } = require('../../jdl/jhipster/database-types');
const { stringify } = require('../../utils');
const { CommonDBTypes } = require('../../jdl/jhipster/field-types');
const { GENERATOR_DATABASE_CHANGELOG_LIQUIBASE } = require('../generator-list');

const TYPE_LONG = CommonDBTypes.LONG;

const constants = require('../generator-constants');

// TODO v8: Remove this constant
const { LIQUIBASE_DTD_VERSION } = constants;
const { prepareFieldForTemplates } = require('../../utils/field');
const { prepareRelationshipForTemplates } = require('../../utils/relationship');
const { prepareFieldForLiquibaseTemplates } = require('../../utils/liquibase');

/* eslint-disable consistent-return */
module.exports = class extends BaseBlueprintGenerator {
  constructor(args, options, features) {
    super(args, options, features);

    if (this.options.help) return;

    assert(this.options.databaseChangelog, 'Changelog is required');
    this.databaseChangelog = this.options.databaseChangelog;
    if (!this.databaseChangelog.changelogDate) {
      this.databaseChangelog.changelogDate = this.dateFormatForLiquibase();
    }

    // Set number of rows to be generated
    this.numberOfRows = 10;
  }

  async _postConstruct() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints(GENERATOR_DATABASE_CHANGELOG_LIQUIBASE);
    }
  }

  _loading() {
    return {
      loadSharedConfig() {
        this.loadAppConfig();
        this.loadDerivedAppConfig();
        this.loadClientConfig();
        this.loadDerivedClientConfig();
        this.loadServerConfig();
        this.loadTranslationConfig();
        this.loadPlatformConfig();
      },
    };
  }

  get [LOADING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._loading();
  }

  _preparing() {
    return {
      prepareEntityForTemplates() {
        const databaseChangelog = this.databaseChangelog;
        this.entity = this.configOptions.sharedEntities[databaseChangelog.entityName];
        if (!this.entity) {
          throw new Error(`Shared entity ${databaseChangelog.entityName} was not found`);
        }

        this.allFields = this.entity.fields
          .filter(field => !field.transient)
          .map(field => prepareFieldForLiquibaseTemplates(this.entity, field));

        if (databaseChangelog.type === 'entity-new') {
          this.fields = this.allFields;
        } else {
          this.addedFields = this.databaseChangelog.addedFields
            .map(field => prepareFieldForTemplates(this.entity, field, this))
            .filter(field => !field.transient)
            .map(field => prepareFieldForLiquibaseTemplates(this.entity, field));
          this.removedFields = this.databaseChangelog.removedFields
            .map(field => prepareFieldForTemplates(this.entity, field, this))
            .filter(field => !field.transient)
            .map(field => prepareFieldForLiquibaseTemplates(this.entity, field));
        }
      },

      prepareFakeData() {
        const databaseChangelog = this.databaseChangelog;
        this.entity.liquibaseFakeData = [];

        // fakeDataCount must be limited to the size of required unique relationships.
        Object.defineProperty(this.entity, 'fakeDataCount', {
          get: () => {
            const uniqueRelationships = this.entity.relationships.filter(rel => rel.unique && (rel.relationshipRequired || rel.id));
            return _.min([this.entity.liquibaseFakeData.length, ...uniqueRelationships.map(rel => rel.otherEntity.fakeDataCount)]);
          },
          configurable: true,
        });

        for (let rowNumber = 0; rowNumber < this.numberOfRows; rowNumber++) {
          const rowData = {};
          const fields =
            databaseChangelog.type === 'entity-new'
              ? // generate id fields first to improve reproducibility
                [...this.fields.filter(f => f.id), ...this.fields.filter(f => !f.id)]
              : [...this.allFields.filter(f => f.id), ...this.addedFields.filter(f => !f.id)];
          fields.forEach((field, idx) => {
            if (field.derived) {
              Object.defineProperty(rowData, field.fieldName, {
                get: () => {
                  if (!field.derivedEntity.liquibaseFakeData || rowNumber >= field.derivedEntity.liquibaseFakeData.length) {
                    return undefined;
                  }
                  return field.derivedEntity.liquibaseFakeData[rowNumber][field.fieldName];
                },
              });
              return;
            }
            let data;
            if (field.id && field.fieldType === TYPE_LONG) {
              data = rowNumber + 1;
            } else {
              data = field.generateFakeData();
            }
            rowData[field.fieldName] = data;
          });

          this.entity.liquibaseFakeData.push(rowData);
        }
        this.configOptions.sharedLiquibaseFakeData = this.configOptions.sharedLiquibaseFakeData || {};
        this.configOptions.sharedLiquibaseFakeData[_.upperFirst(this.entity.name)] = this.entity.liquibaseFakeData;
      },
    };
  }

  get [PREPARING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._preparing();
  }

  _preparingRelationships() {
    return {
      prepareRelationshipsForTemplates() {
        const databaseChangelog = this.databaseChangelog;
        if (databaseChangelog.type === 'entity-new') {
          this.relationships = this.entity.relationships.map(relationship =>
            this._prepareRelationshipForTemplates(this.entity, relationship)
          );
        } else {
          this.addedRelationships = this.databaseChangelog.addedRelationships
            .map(relationship => {
              const otherEntityName = this._.upperFirst(relationship.otherEntityName);
              relationship.otherEntity = this.configOptions.sharedEntities[otherEntityName];
              if (!relationship.otherEntity) {
                throw new Error(
                  `Error at entity ${this.entity.name}: could not find the entity of the relationship ${stringify(relationship)}`
                );
              }
              return relationship;
            })
            .map(relationship => prepareRelationshipForTemplates(this.entity, relationship, this))
            .map(relationship => this._prepareRelationshipForTemplates(this.entity, relationship));
          this.removedRelationships = this.databaseChangelog.removedRelationships
            .map(relationship => {
              const otherEntityName = this._.upperFirst(relationship.otherEntityName);
              relationship.otherEntity = this.configOptions.oldSharedEntities[otherEntityName];
              if (!relationship.otherEntity) {
                throw new Error(
                  `Error at entity ${this.entity.name}: could not find the entity of the relationship ${stringify(relationship)}`
                );
              }
              return relationship;
            })
            .map(relationship => prepareRelationshipForTemplates(this.entity, relationship, this, true))
            .map(relationship => this._prepareRelationshipForTemplates(this.entity, relationship));
        }
      },
    };
  }

  get [PREPARING_RELATIONSHIPS_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._preparingRelationships();
  }

  // Public API method used by the getter and also by Blueprints
  _default() {
    return {
      setupConstants() {
        // Make constants available in templates
        // TODO v8: Remove this constant
        this.LIQUIBASE_DTD_VERSION = LIQUIBASE_DTD_VERSION;
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
      writeLiquibaseFiles() {
        const config = this.jhipsterConfig;
        if (config.skipServer || this.entity.skipServer || config.databaseType !== SQL) {
          return undefined;
        }

        const databaseChangelog = this.databaseChangelog;

        /* Required by the templates */
        Object.assign(this, {
          databaseChangelog,
          changelogDate: databaseChangelog.changelogDate,
          databaseType: this.entity.databaseType,
          prodDatabaseType: this.entity.prodDatabaseType,
          authenticationType: this.entity.authenticationType,
          jhiPrefix: this.entity.jhiPrefix,
          skipFakeData: this.entity.skipFakeData || config.skipFakeData,
          reactive: config.reactive,
        });

        if (databaseChangelog.type === 'entity-new') {
          return this._writeLiquibaseFiles();
        }
        if (
          this.addedFields.length > 0 ||
          this.removedFields.length > 0 ||
          this.addedRelationships.some(relationship => relationship.shouldWriteRelationship || relationship.shouldWriteJoinTable) ||
          this.removedRelationships.some(relationship => relationship.shouldWriteRelationship || relationship.shouldWriteJoinTable)
        ) {
          return this._writeUpdateFiles();
        }
        return undefined;
      },
    };
  }

  get [WRITING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    if (this.options.skipWriting) {
      return {};
    }
    return this._writing();
  }

  // Public API method used by the getter and also by Blueprints
  _postWriting() {
    return {
      writeLiquibaseFiles() {
        const config = this.jhipsterConfig;
        if (config.skipServer || this.entity.skipServer || config.databaseType !== SQL) {
          return undefined;
        }

        if (this.databaseChangelog.type === 'entity-new') {
          return this._addLiquibaseFilesReferences();
        }
        if (
          this.addedFields.length > 0 ||
          this.removedFields.length > 0 ||
          this.addedRelationships.some(relationship => relationship.shouldWriteRelationship || relationship.shouldWriteJoinTable) ||
          this.removedRelationships.some(relationship => relationship.shouldWriteRelationship || relationship.shouldWriteJoinTable)
        ) {
          return this._addUpdateFilesReferences();
        }
        return undefined;
      },
    };
  }

  get [POST_WRITING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    if (this.options.skipWriting) {
      return {};
    }
    return this._postWriting();
  }

  /**
   * Write files for new entities.
   */
  _writeLiquibaseFiles() {
    const promises = [];
    // Write initial liquibase files
    promises.push(this.writeFilesToDisk(addEntityFiles, this, false, this.sourceRoot()));
    if (!this.skipFakeData) {
      promises.push(this.writeFilesToDisk(fakeFiles, this, false, this.sourceRoot()));
    }

    return Promise.all(promises);
  }

  /**
   * Write files for new entities.
   */
  _addLiquibaseFilesReferences() {
    const fileName = `${this.changelogDate}_added_entity_${this.entity.entityClass}`;
    if (this.incremental) {
      this.addIncrementalChangelogToLiquibase(fileName);
    } else {
      this.addChangelogToLiquibase(fileName);
    }

    if (this.entity.fieldsContainOwnerManyToMany || this.entity.fieldsContainOwnerOneToOne || this.entity.fieldsContainManyToOne) {
      const constFileName = `${this.changelogDate}_added_entity_constraints_${this.entity.entityClass}`;
      if (this.incremental) {
        this.addIncrementalChangelogToLiquibase(constFileName);
      } else {
        this.addConstraintsChangelogToLiquibase(constFileName);
      }
    }
  }

  /**
   * Write files for updated entities.
   */
  _writeUpdateFiles() {
    this.hasFieldConstraint = this.addedFields.some(field => field.unique || !field.nullable);
    this.hasRelationshipConstraint = this.addedRelationships.some(
      relationship =>
        (relationship.shouldWriteRelationship || relationship.shouldWriteJoinTable) && (relationship.unique || !relationship.nullable)
    );
    this.shouldWriteAnyRelationship = this.addedRelationships.some(
      relationship => relationship.shouldWriteRelationship || relationship.shouldWriteJoinTable
    );

    const promises = [];
    promises.push(this.writeFilesToDisk(updateEntityFiles, this, false, this.sourceRoot()));

    if (!this.skipFakeData && (this.addedFields.length > 0 || this.shouldWriteAnyRelationship)) {
      this.fields = this.addedFields;
      this.relationships = this.addedRelationships;
      promises.push(this.writeFilesToDisk(fakeFiles, this, false, this.sourceRoot()));
      promises.push(this.writeFilesToDisk(updateMigrateFiles, this, false, this.sourceRoot()));
    }

    if (this.hasFieldConstraint || this.shouldWriteAnyRelationship) {
      promises.push(this.writeFilesToDisk(updateConstraintsFiles, this, false, this.sourceRoot()));
    }
    return Promise.all(promises);
  }

  /**
   * Write files for updated entities.
   */
  _addUpdateFilesReferences() {
    this.addIncrementalChangelogToLiquibase(`${this.databaseChangelog.changelogDate}_updated_entity_${this.entity.entityClass}`);

    if (!this.skipFakeData && (this.addedFields.length > 0 || this.shouldWriteAnyRelationship)) {
      this.addIncrementalChangelogToLiquibase(`${this.databaseChangelog.changelogDate}_updated_entity_migrate_${this.entity.entityClass}`);
    }

    if (this.hasFieldConstraint || this.shouldWriteAnyRelationship) {
      this.addIncrementalChangelogToLiquibase(
        `${this.databaseChangelog.changelogDate}_updated_entity_constraints_${this.entity.entityClass}`
      );
    }
  }

  _prepareRelationshipForTemplates(entity, relationship) {
    relationship.shouldWriteRelationship =
      relationship.relationshipType === 'many-to-one' ||
      (relationship.relationshipType === 'one-to-one' && relationship.ownerSide === true);

    if (relationship.shouldWriteJoinTable) {
      const joinTableName = relationship.joinTable.name;
      const prodDatabaseType = entity.prodDatabaseType;
      _.defaults(relationship.joinTable, {
        constraintName: this.getFKConstraintName(joinTableName, entity.entityTableName, prodDatabaseType),
        otherConstraintName: this.getFKConstraintName(joinTableName, relationship.columnName, prodDatabaseType),
      });
    }

    relationship.columnDataType = relationship.otherEntity.columnType;
    return relationship;
  }
};
