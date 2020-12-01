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
const writeFiles = require('./files').writeFiles;
const utils = require('../utils');
const BaseBlueprintGenerator = require('../generator-base-blueprint');
const {
    SUPPORTED_CLIENT_FRAMEWORKS: { ANGULAR },
} = require('../generator-constants');

let useBlueprints;

module.exports = class extends BaseBlueprintGenerator {
    constructor(args, opts) {
        super(args, opts);
        this.entity = opts.context;

        if (this.jhipsterConfig.clientFramework !== ANGULAR) {
            // Remove fields with custom ids, drop once templates supports them
            this.entity = { ...this.entity, fields: this.entity.fieldsNoId };
        }

        utils.copyObjectProps(this, this.entity);
        this.jhipsterContext = opts.jhipsterContext || opts.context;

        useBlueprints = !this.fromBlueprint && this.instantiateBlueprints('entity-client', { context: opts.context });
    }

    // Public API method used by the getter and also by Blueprints
    _preparing() {
        return {
            setup() {
                this.tsKeyType = this.getTypescriptKeyType(this.primaryKeyType);
            },
        };
    }

    get preparing() {
        if (useBlueprints) return;
        return this._preparing();
    }

    // Public API method used by the getter and also by Blueprints
    _default() {
        return super._missingPreDefault();
    }

    get default() {
        if (useBlueprints) return;
        return this._default();
    }

    // Public API method used by the getter and also by Blueprints
    _writing() {
        return {
            cleanup() {
                if (this.isJhipsterVersionLessThan('7.0.0') && this.jhipsterConfig.clientFramework === ANGULAR) {
                    this.removeFile(`${this.CLIENT_MAIN_SRC_DIR}/app/entities/${this.entityFolderName}/${this.entityFileName}.route.ts`);
                    this.removeFile(
                        `${this.CLIENT_MAIN_SRC_DIR}/app/entities/${this.entityFolderName}/${this.entityFileName}.component.ts`
                    );
                    this.removeFile(
                        `${this.CLIENT_MAIN_SRC_DIR}/app/entities/${this.entityFolderName}/${this.entityFileName}.component.html`
                    );
                    this.removeFile(
                        `${this.CLIENT_MAIN_SRC_DIR}/app/entities/${this.entityFolderName}/${this.entityFileName}-detail.component.ts`
                    );
                    this.removeFile(
                        `${this.CLIENT_MAIN_SRC_DIR}/app/entities/${this.entityFolderName}/${this.entityFileName}-detail.component.html`
                    );
                    this.removeFile(
                        `${this.CLIENT_MAIN_SRC_DIR}/app/entities/${this.entityFolderName}/${this.entityFileName}-delete-dialog.component.ts`
                    );
                    this.removeFile(
                        `${this.CLIENT_MAIN_SRC_DIR}/app/entities/${this.entityFolderName}/${this.entityFileName}-delete-dialog.component.html`
                    );
                    this.removeFile(
                        `${this.CLIENT_MAIN_SRC_DIR}/app/entities/${this.entityFolderName}/${this.entityFileName}-update.component.ts`
                    );
                    this.removeFile(
                        `${this.CLIENT_MAIN_SRC_DIR}/app/entities/${this.entityFolderName}/${this.entityFileName}-update.component.html`
                    );
                }
            },
            ...writeFiles(),
            ...super._missingPostWriting(),
        };
    }

    get writing() {
        if (useBlueprints) return;
        return this._writing();
    }
};
