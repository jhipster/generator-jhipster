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
/* eslint-disable consistent-return */
const assert = require('assert');
const faker = require('faker');
const utils = require('../utils');

const LiquibaseEntity = require('../../lib/liquibase-entity');
const Field = require('../../lib/field');
const LiquibaseRelationship = require('../../lib/liquibase-relationship');
const constants = require('../generator-constants');
const BaseBlueprintGenerator = require('../generator-base-blueprint');
const { addEntityFiles, updateEntityFiles, updateConstraintsFiles, updateMigrateFiles, fakeFiles } = require('./files');

const INTERPOLATE_REGEX = constants.INTERPOLATE_REGEX;
const SERVER_MAIN_RES_DIR = constants.SERVER_MAIN_RES_DIR;

/* constants used throughout */
let useBlueprints;

module.exports = class extends BaseBlueprintGenerator {
    constructor(args, opts) {
        super(args, opts);
        this.configOptions = opts.configOptions || {};

        useBlueprints = !this.fromBlueprint && this.instantiateBlueprints('versioned-database-liquibase');

        assert(this.options.databaseChangelog, 'Changelog is required');
    }

    // Public API method used by the getter and also by Blueprints
    _configuring() {
        return {
            setupConstants() {
                // Make constants available in templates
                this.LIQUIBASE_DTD_VERSION = constants.LIQUIBASE_DTD_VERSION;
            },
        };
    }

    get configuring() {
        if (useBlueprints) return;
        return this._configuring();
    }

    // Public API method used by the getter and also by Blueprints
    _writing() {
        return {
            setupReproducibility() {
                if (this.skipServer || !this.options.databaseChangelog.entityName) return;

                // In order to have consistent results with Faker, restart seed with current entity name hash.
                faker.seed(utils.stringHashCode(this.options.databaseChangelog.entityName.toLowerCase()));
            },

            writeLiquibaseFiles() {
                const config = this.config.getAll();
                if (config.skipServer || config.databaseType !== 'sql') return;

                const databaseChangelog = this.options.databaseChangelog;
                const entityName = databaseChangelog.entityName;
                const changelogDate = databaseChangelog.changelogDate;

                /* Required by the templates */
                Object.assign(this, {
                    databaseChangelog,
                    changelogDate,
                    databaseType: config.databaseType,
                    skipFakeData: config.skipFakeData,
                    prodDatabaseType: config.prodDatabaseType,
                    authenticationType: config.authenticationType,
                    jhiPrefix: config.jhiPrefix,
                });

                if (databaseChangelog.type === 'custom') {
                    this._writeCustomChangelog(databaseChangelog);
                } else if (databaseChangelog.type === 'entity-snapshot') {
                    this._writeCustomChangelog(databaseChangelog, 'snapshot');
                } else if (databaseChangelog.type === 'tag') {
                    this._writeCustomChangelog(databaseChangelog, 'tag');
                } else if (databaseChangelog.type.startsWith('entity-')) {
                    const updatedEntity = this.loadDatabaseChangelogEntity(entityName, changelogDate, true);
                    updatedEntity.name = updatedEntity.name || entityName;

                    this.primaryKeyType = this.getPkTypeBasedOnDBAndAssociation(
                        config.authenticationType,
                        config.databaseType,
                        updatedEntity.relationships
                    );

                    this.entity = new LiquibaseEntity(updatedEntity, this, {
                        jhiPrefix: config.jhiPrefix,
                        prodDatabaseType: config.prodDatabaseType,
                        changelogDate,
                    });

                    if (databaseChangelog.type === 'entity-new') {
                        this._writeLiquibaseFiles();
                    } else {
                        this._writeUpdateFiles(updatedEntity);
                    }
                } else {
                    this.error(`Changelog of type ${databaseChangelog.type} not implemented`);
                }
            },
        };
    }

    get writing() {
        if (useBlueprints) return;
        return this._writing();
    }

    /**
     * Write a changelog entry to master.xml and creates a changelog file.
     * @param {Object} changelog - The changelog difinition
     * @param {String} [changelogType] - Custom changelog variation
     */
    _writeCustomChangelog(changelog, changelogType = 'custom') {
        this._writeChangelog(changelogType, `${changelog.changelogDate}_${changelogType}_${changelog.name || changelog.entityName}`, {
            ...changelog,
            changelogType,
        });
    }

    /**
     * Write a changelog entry to master.xml and creates a changelog file.
     * @param {String} source - Source file
     * @param {String} destFile - The destination file
     * @param {Object} changelog - the changelog definition
     */
    _writeChangelog(source, destFile, changelog) {
        this.template(
            `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/${source}.xml.ejs`,
            `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/${destFile}.xml`,
            this,
            { interpolate: INTERPOLATE_REGEX },
            { changelog, LIQUIBASE_DTD_VERSION: constants.LIQUIBASE_DTD_VERSION }
        );
        this.addIncrementalChangelogToLiquibase(destFile);
    }

    /**
     * Write files for new entities.
     * @param {Entity} updatedEntity - the updated entity definition.
     */
    _writeLiquibaseFiles() {
        this.fields = this.entity.fields;
        this.relationships = this.entity.relationships;

        // write initial liquibase files
        this.writeFilesToDisk(addEntityFiles, this, false, this.jhipsterSourceRoot());
        this.writeFilesToDisk(fakeFiles, this, false, this.jhipsterSourceRoot());

        const fileName = `${this.changelogDate}_added_entity_${this.entity.entityClass}`;
        if (this.databaseChangelog.migration) {
            this.addChangelogToLiquibase(fileName);
        } else {
            this.addIncrementalChangelogToLiquibase(fileName);
        }

        if (this.entity.fieldsContainOwnerManyToMany || this.entity.fieldsContainOwnerOneToOne || this.entity.fieldsContainManyToOne) {
            const constFileName = `${this.changelogDate}_added_entity_constraints_${this.entity.entityClass}`;
            if (this.databaseChangelog.migration) {
                this.addConstraintsChangelogToLiquibase(constFileName);
            } else {
                this.addIncrementalChangelogToLiquibase(constFileName);
            }
        }
    }

    /**
     * Write files for updated entities.
     * @param {Entity} updatedEntity - the new entity definition.
     */
    _writeUpdateFiles(updatedEntity) {
        let hasConstraints = false;
        const changelogDate = this.databaseChangelog.changelogDate;

        const appConfig = { changelogDate, jhiPrefix: this.jhiPrefix, prodDatabaseType: this.prodDatabaseType };
        this.addedDbFields = (this.databaseChangelog.addedFields || []).map(field => {
            const dbField = new Field(field, this, appConfig);
            hasConstraints = hasConstraints || dbField.unique || dbField.nullable;
            return dbField;
        });

        this.removedDbFields = (updatedEntity.removedFields || []).map(field => new Field(field, this, appConfig));

        this.addedDbRelationships = (this.databaseChangelog.addedRelationships || []).map(relationship => {
            const dbRelationship = new LiquibaseRelationship(relationship, this, appConfig);
            if (!hasConstraints) {
                hasConstraints = dbRelationship.shouldWriteRelationship() || dbRelationship.shouldWriteJoinTable();
                const relationshipType = dbRelationship.relationshipType;
                const ownerSide = dbRelationship.ownerSide;
                hasConstraints = hasConstraints || relationshipType === 'many-to-one' || (relationshipType === 'one-to-one' && ownerSide);
                hasConstraints = hasConstraints || (relationshipType === 'many-to-many' && ownerSide);
            }
            return dbRelationship;
        });

        this.removedDbRelationships = (updatedEntity.removedRelationships || []).map(
            relationship => new LiquibaseRelationship(relationship, this, appConfig)
        );

        this.writeFilesToDisk(updateEntityFiles, this, false, this.jhipsterSourceRoot());

        this.writeFakeData = !this.skipFakeData && (this.addedDbFields.length > 0 || this.addedDbRelationships.length > 0);
        if (this.writeFakeData) {
            this.fields = this.addedDbFields;
            this.relationships = this.addedDbRelationships;
            this.writeFilesToDisk(fakeFiles, this, false, this.jhipsterSourceRoot());
        }

        this.addIncrementalChangelogToLiquibase(`${this.databaseChangelog.changelogDate}_updated_entity_${this.entity.entityClass}`);
        if (hasConstraints) {
            this.writeFilesToDisk(updateConstraintsFiles, this, false, this.jhipsterSourceRoot());
            this.writeFilesToDisk(updateMigrateFiles, this, false, this.jhipsterSourceRoot());

            this.addIncrementalChangelogToLiquibase(
                `${this.databaseChangelog.changelogDate}_updated_entity_migrate_${this.entity.entityClass}`
            );
            this.addIncrementalChangelogToLiquibase(
                `${this.databaseChangelog.changelogDate}_updated_entity_constraints_${this.entity.entityClass}`
            );
        }
    }
};
