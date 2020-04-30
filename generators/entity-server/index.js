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
            },
        };
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

    /* Private methods used in templates */
    _processJavaEntityImports(fields, relationships) {
        let importJsonIgnore = false;
        let importJsonIgnoreProperties = false;
        let importSet = false;
        const uniqueEnums = {};

        let importApiModelProperty = Object.values(relationships).filter(v => typeof v.javadoc != 'undefined').length > 0;
        if (!importApiModelProperty) {
            importApiModelProperty = Object.values(fields).filter(v => typeof v.javadoc != 'undefined').length > 0;
        }

        Object.values(relationships).forEach(v => {
            if (v.ownerSide === false && ['one-to-many', 'one-to-one', 'many-to-many'].includes(v.relationshipType)) {
                importJsonIgnore = true;
            } else if (v.relationshipType === 'many-to-one') {
                importJsonIgnoreProperties = true;
            }
            if (v.relationshipType === 'one-to-many' || v.relationshipType === 'many-to-many') {
                importSet = true;
            }
        });

        Object.values(fields).forEach(v => {
            if (v.fieldIsEnum && (!uniqueEnums[v.fieldType] || (uniqueEnums[v.fieldType] && v.fieldValues.length !== 0))) {
                uniqueEnums[v.fieldType] = v.fieldType;
            }
        });
        return { importApiModelProperty, importJsonIgnore, importJsonIgnoreProperties, importSet, uniqueEnums };
    }
};
