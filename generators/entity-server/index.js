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
const _ = require('lodash');
const chalk = require('chalk');
const jhiCore = require('jhipster-core');
const constants = require('../generator-constants');
const writeFiles = require('./files').writeFiles;
const utils = require('../utils');
const BaseBlueprintGenerator = require('../generator-base-blueprint');

/* constants used throughout */
let useBlueprints;

module.exports = class extends BaseBlueprintGenerator {
    constructor(args, opts) {
        super(args, opts);
        utils.copyObjectProps(this, opts.context);
        this.jhipsterContext = opts.jhipsterContext || opts.context;
        this.configOptions = opts.configOptions || {};

        useBlueprints =
            !this.fromBlueprint &&
            this.instantiateBlueprints('entity-server', { context: opts.context, debug: opts.context.isDebugEnabled });
    }

    // Public API method used by the getter and also by Blueprints
    _initializing() {
        return {
            setupConstants() {
                // Make constants available in templates
                this.LIQUIBASE_DTD_VERSION = constants.LIQUIBASE_DTD_VERSION;
            }
        };
    }

    // Public API method used by the getter and also by Blueprints
    _configuring() {
        return {
            globalSetup() {
                this.reactiveRepositories = this.reactive && ['mongodb', 'cassandra', 'couchbase'].includes(this.databaseType);
                this.testsNeedCsrf = ['uaa', 'oauth2', 'session'].includes(this.authenticationType);
            },
            fieldsSetup() {
                // Load in-memory data for fields
                this.fields.forEach(field => {
                    if (_.isUndefined(field.fieldNameAsDatabaseColumn)) {
                        const fieldNameUnderscored = _.snakeCase(field.fieldName);
                        const jhiFieldNamePrefix = this.getColumnName(this.jhiPrefix);
                        if (jhiCore.isReservedTableName(fieldNameUnderscored, this.prodDatabaseType)) {
                            if (!jhiFieldNamePrefix) {
                                this.warning(
                                    chalk.red(
                                        `The field name '${fieldNameUnderscored}' is regarded as a reserved keyword, but you have defined an empty jhiPrefix. This might lead to a non-working application.`
                                    )
                                );
                                field.fieldNameAsDatabaseColumn = fieldNameUnderscored;
                            } else {
                                field.fieldNameAsDatabaseColumn = `${jhiFieldNamePrefix}_${fieldNameUnderscored}`;
                            }
                        } else {
                            field.fieldNameAsDatabaseColumn = fieldNameUnderscored;
                        }
                    }

                    if (_.isUndefined(field.fieldInJavaBeanMethod)) {
                        // Handle the specific case when the second letter is capitalized
                        // See http://stackoverflow.com/questions/2948083/naming-convention-for-getters-setters-in-java
                        if (field.fieldName.length > 1) {
                            const firstLetter = field.fieldName.charAt(0);
                            const secondLetter = field.fieldName.charAt(1);
                            if (firstLetter === firstLetter.toLowerCase() && secondLetter === secondLetter.toUpperCase()) {
                                field.fieldInJavaBeanMethod = firstLetter.toLowerCase() + field.fieldName.slice(1);
                            } else {
                                field.fieldInJavaBeanMethod = _.upperFirst(field.fieldName);
                            }
                        } else {
                            field.fieldInJavaBeanMethod = _.upperFirst(field.fieldName);
                        }
                    }

                    if (_.isUndefined(field.fieldValidateRulesPatternJava)) {
                        field.fieldValidateRulesPatternJava = field.fieldValidateRulesPattern
                            ? field.fieldValidateRulesPattern.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
                            : field.fieldValidateRulesPattern;
                    }
                });
            },
            relationshipsSetup() {
                // Load in-memory data for relationships
                let hasUserField = false;
                this.relationships.forEach(relationship => {
                    const otherEntityName = relationship.otherEntityName;
                    const otherEntityData = this.getEntityJson(otherEntityName);
                    const jhiTablePrefix = this.jhiTablePrefix;

                    if (otherEntityName === 'user') {
                        relationship.otherEntityTableName = `${this.jhiTablePrefix}_user`;
                        hasUserField = true;
                    } else {
                        relationship.otherEntityTableName = otherEntityData ? otherEntityData.entityTableName : null;
                        if (!relationship.otherEntityTableName) {
                            relationship.otherEntityTableName = this.getTableName(otherEntityName);
                        }
                        if (jhiCore.isReservedTableName(relationship.otherEntityTableName, this.prodDatabaseType) && jhiTablePrefix) {
                            const otherEntityTableName = relationship.otherEntityTableName;
                            relationship.otherEntityTableName = `${jhiTablePrefix}_${otherEntityTableName}`;
                        }
                    }
                });
                this.saveUserSnapshot =
                    this.applicationType === 'microservice' &&
                    this.authenticationType === 'oauth2' &&
                    hasUserField &&
                    this.dto === 'no';
            }
        };
    }

    get configuring() {
        if (useBlueprints) return;
        return this._configuring();
    }

    get initializing() {
        if (useBlueprints) return;
        return this._initializing();
    }

    // Public API method used by the getter and also by Blueprints
    _writing() {
        return writeFiles();
    }

    get writing() {
        if (useBlueprints) return;
        return this._writing();
    }
};
