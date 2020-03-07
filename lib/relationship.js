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
const _ = require('lodash');

module.exports = class Relationship {
    /**
     * Relationship definitions wrapper for calculating extra info.
     *
     * @param {Object} definitions - Field definition.
     * @param {Object} baseGenerator - JHipster base generator instance.
     * @param {Object} config - Required application config.
     * @param {String} config.jhiPrefix - jhiPrefix
     * @param {String} config.prodDatabaseType - Production database type
     */
    constructor(definitions, baseGenerator, config) {
        this.definitions = definitions;
        this.baseGenerator = baseGenerator;
        this.config = config;
    }

    get otherSide() {
        if (!this._otherSide) {
            const entity = this.baseGenerator.fs.readJSON(`.jhipster/${_.upperFirst(this.definitions.otherEntityName)}.json`);
            /* eslint-disable-next-line global-require */
            const Entity = require('./entity');
            this._otherSide = new Entity(entity, this.baseGenerator, this.config);
        }
        return this._otherSide;
    }

    get relationshipName() {
        return this.definitions.relationshipName;
    }

    get relationshipType() {
        return this.definitions.relationshipType;
    }

    get otherEntityName() {
        return this.definitions.otherEntityName;
    }

    get otherEntityPrimaryKeyType() {
        return this.definitions.otherEntityPrimaryKeyType;
    }

    get relationshipValidate() {
        return (
            this.definitions.relationshipValidate ||
            (this.definitions.relationshipValidateRules && this.definitions.relationshipValidateRules.includes('required'))
        );
    }

    get relationshipRequired() {
        return this.definitions.relationshipValidateRules && this.definitions.relationshipValidateRules.includes('required');
    }

    get ownerSide() {
        return this.definitions.ownerSide;
    }

    get useJPADerivedIdentifier() {
        return this.definitions.useJPADerivedIdentifier;
    }

    get columnName() {
        return this.baseGenerator.getColumnName(this.relationshipName);
    }

    getColumnType(authenticationType) {
        return this.otherEntityName === 'user' && authenticationType === 'oauth2' ? 'varchar(100)' : 'bigint';
    }

    getUniqueConstraintName(entityTableName) {
        return this.baseGenerator.getUXConstraintName(entityTableName, `${this.columnName}_id`, this.config.prodDatabaseType);
    }

    get otherEntityNameCapitalized() {
        return this.definitions.otherEntityNameCapitalized || _.upperFirst(this.otherEntityName);
    }

    get nullable() {
        return !(this.relationshipValidate === true && this.relationshipRequired);
    }

    get unique() {
        return this.relationshipType === 'one-to-one' && this.shouldWriteRelationship();
    }

    shouldWriteRelationship() {
        return (
            this.relationshipType === 'many-to-one' ||
            (this.relationshipType === 'one-to-one' && this.ownerSide === true && !this.useJPADerivedIdentifier)
        );
    }

    shouldWriteJoinTable() {
        return this.relationshipType === 'many-to-many' && this.ownerSide;
    }

    get otherEntityTableName() {
        if (this.definitions.otherEntityTableName) {
            return this.definitions.otherEntityTableName;
        }
        if (this.otherEntityName === 'user') {
            return `${this.baseGenerator.getTableName(this.config.jhiPrefix)}_user`;
        }

        return this.otherSide.entityTableName || this.baseGenerator.getTableName(this.otherSide.name);
    }

    shouldCreateJoinTable() {
        return this.relationshipType === 'many-to-many' && this.ownerSide;
    }
};
