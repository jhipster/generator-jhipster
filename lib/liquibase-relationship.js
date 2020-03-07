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
const Relationship = require('./relationship');

/**
 * Relationship definitions wrapper for calculating extra info.
 * Additional Liquibase info
 *
 * @param {Object} definitions - Field definition.
 * @param {Object} baseGenerator - JHipster base generator instance.
 * @param {Object} config - Required application config.
 * @param {String} config.jhiPrefix - jhiPrefix.
 * @param {String} config.prodDatabaseType - Production database type.
 * @param {String} config.changelogDate - Changelog reference.
 */
module.exports = class LiquibaseRelationship extends Relationship {
    get otherSide() {
        if (!this._otherSide) {
            const entity = this.baseGenerator.loadDatabaseChangelogEntity(
                _.upperFirst(this.definitions.otherEntityName),
                this.config.changelogDate
            );
            /* eslint-disable-next-line global-require */
            const LiquibaseEntity = require('./liquibase-entity');
            this._otherSide = new LiquibaseEntity(entity, this.baseGenerator, this.config);
        }
        return this._otherSide;
    }
};
