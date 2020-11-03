/**
 * Copyright 2013-2020 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const assert = require('assert');

const BaseGenerator = require('../generator-base');
const { addEntityFiles, updateEntityFiles, updateConstraintsFiles, updateMigrateFiles, fakeFiles } = require('./files');

const constants = require('../generator-constants');

const { LIQUIBASE_DTD_VERSION } = constants;
const { prepareFieldForTemplates } = require('../../utils/field');
const { prepareRelationshipForTemplates } = require('../../utils/relationship');

module.exports = class extends BaseGenerator {
    constructor(args, options) {
        super(args, options);
        this.configOptions = options.configOptions || {};

        assert(this.options.databaseChangelog, 'Changelog is required');
        this.databaseChangelog = this.options.databaseChangelog;
    }

    // Public API method used by the getter and also by Blueprints
    _default() {
        return {
            setupConstants() {
                // Make constants available in templates
                this.LIQUIBASE_DTD_VERSION = LIQUIBASE_DTD_VERSION;
            },
            prepareEntityForTemplates() {
                const databaseChangelog = this.databaseChangelog;
                this.entity = this.configOptions.sharedEntities[databaseChangelog.entityName];
                if (!this.entity) {
                    throw new Error(`Shared entity ${databaseChangelog.entityName} was not found`);
                }

                if (databaseChangelog.type === 'entity-new') {
                    this.fields = this.entity.fields.map(field => this._prepareFieldForTemplates(this.entity, field));
                    this.relationships = this.entity.relationships.map(relationship =>
                        this._prepareRelationshipForTemplates(this.entity, relationship)
                    );
                } else {
                    this.addedFields = this.databaseChangelog.addedFields
                        .map(field => prepareFieldForTemplates(this.entity, field, this))
                        .map(field => this._prepareFieldForTemplates(this.entity, field));
                    this.removedFields = this.databaseChangelog.removedFields
                        .map(field => prepareFieldForTemplates(this.entity, field, this))
                        .map(field => this._prepareFieldForTemplates(this.entity, field));
                    this.addedRelationships = this.databaseChangelog.addedRelationships
                        .map(relationship => prepareRelationshipForTemplates(this.entity, relationship, this))
                        .map(relationship => this._prepareRelationshipForTemplates(this.entity, relationship));
                    this.removedRelationships = this.databaseChangelog.removedRelationships
                        .map(relationship => prepareRelationshipForTemplates(this.entity, relationship, this, true))
                        .map(relationship => this._prepareRelationshipForTemplates(this.entity, relationship));
                }
            },
        };
    }

    get default() {
        return this._default();
    }

    // Public API method used by the getter and also by Blueprints
    _writing() {
        return {
            setupReproducibility() {
                if (this.jhipsterConfig.skipServer || this.entity.skipServer) {
                    return;
                }

                // In order to have consistent results with Faker, restart seed with current entity name hash.
                this.entity.resetFakerSeed();
            },

            writeLiquibaseFiles() {
                const config = this.jhipsterConfig;
                if (config.skipServer || this.entity.skipServer || config.databaseType !== 'sql') {
                    return;
                }

                const databaseChangelog = this.options.databaseChangelog;
                databaseChangelog.changelogDate = databaseChangelog.changelogDate || this.dateFormatForLiquibase();

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
                    this._writeLiquibaseFiles();
                } else {
                    this._writeUpdateFiles(this.entity);
                }
            },
        };
    }

    get writing() {
        return this._writing();
    }

    /**
     * Write files for new entities.
     */
    _writeLiquibaseFiles() {
        // Write initial liquibase files
        this.writeFilesToDisk(addEntityFiles, this, false, this.sourceRoot());
        if (!this.skipFakeData) {
            this.writeFilesToDisk(fakeFiles, this, false, this.sourceRoot());
        }

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
        const shouldWriteChangelog =
            this.addedFields.length > 0 ||
            this.removedFields.length > 0 ||
            this.addedRelationships.some(relationship => relationship.shouldWriteRelationship || relationship.shouldWriteJoinTable) ||
            this.removedRelationships.some(relationship => relationship.shouldWriteRelationship || relationship.shouldWriteJoinTable);
        if (!shouldWriteChangelog) {
            return;
        }

        this.hasFieldConstraint = this.addedFields.some(field => field.unique || !field.nullable);
        this.hasRelationshipConstraint = this.addedRelationships.some(
            relationship =>
                (relationship.shouldWriteRelationship || relationship.shouldWriteJoinTable) &&
                (relationship.unique || !relationship.nullable)
        );
        this.shouldWriteAnyRelationship = this.addedRelationships.some(
            relationship => relationship.shouldWriteRelationship || relationship.shouldWriteJoinTable
        );

        this.writeFilesToDisk(updateEntityFiles, this, false, this.sourceRoot());
        this.addIncrementalChangelogToLiquibase(`${this.databaseChangelog.changelogDate}_updated_entity_${this.entity.entityClass}`);

        if (!this.skipFakeData && (this.addedFields.length > 0 || this.shouldWriteAnyRelationship)) {
            this.fields = this.addedFields;
            this.relationships = this.addedRelationships;
            this.writeFilesToDisk(fakeFiles, this, false, this.sourceRoot());
            this.writeFilesToDisk(updateMigrateFiles, this, false, this.sourceRoot());

            this.addIncrementalChangelogToLiquibase(
                `${this.databaseChangelog.changelogDate}_updated_entity_migrate_${this.entity.entityClass}`
            );
        }

        if (this.hasFieldConstraint || this.shouldWriteAnyRelationship) {
            this.writeFilesToDisk(updateConstraintsFiles, this, false, this.sourceRoot());

            this.addIncrementalChangelogToLiquibase(
                `${this.databaseChangelog.changelogDate}_updated_entity_constraints_${this.entity.entityClass}`
            );
        }
    }

    _prepareFieldForTemplates(entity, field) {
        field.columnType = this._columnType(entity, field);
        field.loadColumnType = this._loadColumnType(entity, field);
        field.shouldDropDefaultValue = field.fieldType === 'ZonedDateTime' || field.fieldType === 'Instant';
        field.shouldCreateContentType = field.fieldType === 'byte[]' && field.fieldTypeBlobContent !== 'text';
        field.nullable = !(field.fieldValidate === true && field.fieldValidateRules.includes('required'));
        return field;
    }

    _prepareRelationshipForTemplates(entity, relationship) {
        relationship.shouldCreateJoinTable = this._shouldCreateJoinTable(relationship);
        relationship.shouldWriteRelationship = this._shouldWriteRelationship(relationship);
        relationship.shouldWriteJoinTable = this._shouldWriteJoinTable(relationship);
        relationship.columnDataType = this._getRelationshipColumnType(relationship, entity);
        return relationship;
    }

    _shouldCreateJoinTable(relationship) {
        return relationship.relationshipType === 'many-to-many' && relationship.ownerSide;
    }

    _shouldWriteRelationship(relationship) {
        return (
            relationship.relationshipType === 'many-to-one' ||
            (relationship.relationshipType === 'one-to-one' && relationship.ownerSide === true)
        );
    }

    _shouldWriteJoinTable(relationship) {
        return relationship.relationshipType === 'many-to-many' && relationship.ownerSide;
    }

    _loadColumnType(entity, field) {
        const columnType = field.columnType;
        // eslint-disable-next-line no-template-curly-in-string
        if (['integer', 'bigint', 'double', 'decimal(21,2)', '${floatType}'].includes(columnType)) {
            return 'numeric';
        }

        if (field.fieldIsEnum) {
            return 'string';
        }

        // eslint-disable-next-line no-template-curly-in-string
        if (['date', '${datetimeType}', 'boolean'].includes(columnType)) {
            return columnType;
        }

        if (columnType === 'blob' || columnType === 'longblob') {
            return 'blob';
        }

        // eslint-disable-next-line no-template-curly-in-string
        if (columnType === '${clobType}') {
            return 'clob';
        }

        const { prodDatabaseType } = entity;
        if (
            // eslint-disable-next-line no-template-curly-in-string
            columnType === '${uuidType}' &&
            prodDatabaseType !== 'mysql' &&
            prodDatabaseType !== 'mariadb'
        ) {
            // eslint-disable-next-line no-template-curly-in-string
            return '${uuidType}';
        }

        return 'string';
    }

    _getRelationshipColumnType(relationship, entity) {
        return relationship.otherEntityName === 'user' && entity.authenticationType === 'oauth2' ? 'varchar(100)' : 'bigint';
    }

    _columnType(entity, field) {
        const fieldType = field.fieldType;
        if (fieldType === 'String' || field.fieldIsEnum) {
            return `varchar(${field.fieldValidateRulesMaxlength || 255})`;
        }

        if (fieldType === 'Integer') {
            return 'integer';
        }

        if (fieldType === 'Long') {
            return 'bigint';
        }

        if (fieldType === 'Float') {
            // eslint-disable-next-line no-template-curly-in-string
            return '${floatType}';
        }

        if (fieldType === 'Double') {
            return 'double';
        }

        if (fieldType === 'BigDecimal') {
            return 'decimal(21,2)';
        }

        if (fieldType === 'LocalDate') {
            return 'date';
        }

        if (fieldType === 'Instant') {
            // eslint-disable-next-line no-template-curly-in-string
            return '${datetimeType}';
        }

        if (fieldType === 'ZonedDateTime') {
            // eslint-disable-next-line no-template-curly-in-string
            return '${datetimeType}';
        }

        if (fieldType === 'Duration') {
            return 'bigint';
        }

        if (fieldType === 'UUID') {
            // eslint-disable-next-line no-template-curly-in-string
            return '${uuidType}';
        }

        if (fieldType === 'byte[]' && field.fieldTypeBlobContent !== 'text') {
            const { prodDatabaseType } = entity;
            if (prodDatabaseType === 'mysql' || prodDatabaseType === 'postgresql' || prodDatabaseType === 'mariadb') {
                return 'longblob';
            }

            return 'blob';
        }

        if (field.fieldTypeBlobContent === 'text') {
            // eslint-disable-next-line no-template-curly-in-string
            return '${clobType}';
        }

        if (fieldType === 'Boolean') {
            return 'boolean';
        }

        return undefined;
    }
};
