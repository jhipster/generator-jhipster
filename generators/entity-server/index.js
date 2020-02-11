/**
 * Copyright 2013-2019 the original author or authors from the JHipster project.
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
            !opts.fromBlueprint &&
            this.instantiateBlueprints('entity-server', { context: opts.context, debug: opts.context.isDebugEnabled });

        // Setup jhipsterOldVersion for isJhipsterVersionLessThan
        this.jhipsterOldVersion = this.config.get('jhipsterVersion');

        // Create a upgrade path to jhipster 7. Should be removed for jhipster 7 release.
        // Every upgrade path should be jhipster 6.x => 6.8.0 => 7.x
        if (this.config.get('joinTableSeparator') === undefined && this.config.existed) {
            this.config.set('joinTableSeparator', '_');
        } else {
            this.config.set('joinTableSeparator', '__');
        }
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
