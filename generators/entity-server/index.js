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

        this.testsNeedCsrf = ['uaa', 'oauth2', 'session'].includes(this.jhipsterContext.authenticationType);

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
                });
            },
            relationshipsSetup() {
                // Load in-memory data for relationships
                this.relationships.forEach(relationship => {
                });
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
