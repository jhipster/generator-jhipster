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
const Field = require('./field');

module.exports = class Entity {
    /**
     * Entity definitions wrapper for calculating extra info.
     *
     * @param {Object} definitions - Field definition.
     * @param {Object} baseGenerator - JHipster base generator instance.
     */
    constructor(definitions, baseGenerator, config) {
        this.baseGenerator = baseGenerator;
        this.definitions = definitions;
        this.config = config;
    }

    get name() {
        return this.definitions.name;
    }

    get entityNameCapitalized() {
        return _.upperFirst(this.name);
    }

    get entityClass() {
        return this.entityNameCapitalized;
    }

    get entityTableName() {
        return this.definitions.entityTableName || this.baseGenerator.getTableName(this.name);
    }

    get javadoc() {
        return this.definitions.javadoc;
    }

    get remarks() {
        return this.baseGenerator.formatAsLiquibaseRemarks(this.javadoc, true);
    }

    get fieldsContainOwnerManyToMany() {
        return this.definitions.relationships.find(rel => rel.relationshipType === 'many-to-many' && rel.ownerSide);
    }

    get fieldsContainOwnerOneToOne() {
        return this.definitions.relationships.find(rel => rel.relationshipType === 'one-to-one' && rel.ownerSide);
    }

    get fieldsContainNoOwnerOneToOne() {
        return this.definitions.relationships.find(rel => rel.relationshipType === 'one-to-one' && !rel.ownerSide);
    }

    get fieldsContainManyToMany() {
        return this.definitions.relationships.find(rel => rel.relationshipType === 'many-to-many');
    }

    get fieldsContainOneToMany() {
        return this.definitions.relationships.find(rel => rel.relationshipType === 'one-to-many');
    }

    get fieldsContainManyToOne() {
        return this.definitions.relationships.find(rel => rel.relationshipType === 'many-to-one');
    }

    get relationships() {
        /* eslint-disable-next-line global-require */
        const Relationship = require('./relationship');
        return this.definitions.relationships.map(rel => new Relationship(rel, this.baseGenerator, this.config));
    }

    get fields() {
        return this.definitions.fields.map(field => new Field(field, this.baseGenerator, this.config));
    }
};
