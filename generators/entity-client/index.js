/**
 * Copyright 2013-2021 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/* eslint-disable consistent-return */
const _ = require('lodash');
const { writeFiles, customizeFiles } = require('./files');
const utils = require('../utils');
const BaseBlueprintGenerator = require('../generator-base-blueprint');
const {
  SUPPORTED_CLIENT_FRAMEWORKS: { ANGULAR, REACT },
} = require('../generator-constants');

let useBlueprints;

module.exports = class extends BaseBlueprintGenerator {
  constructor(args, opts) {
    super(args, opts);
    this.entity = opts.context;

    this.jhipsterContext = opts.jhipsterContext || opts.context;

    useBlueprints = !this.fromBlueprint && this.instantiateBlueprints('entity-client', { context: opts.context });
  }

  // Public API method used by the getter and also by Blueprints
  _default() {
    return {
      ...super._missingPreDefault(),

      loadConfigIntoGenerator() {
        utils.copyObjectProps(this, this.entity);
      },

      setup() {
        if (!this.embedded) {
          this.tsKeyType = this.getTypescriptKeyType(this.primaryKey.type);
        }
      },
    };
  }

  get default() {
    if (useBlueprints) return;
    return this._default();
  }

  // Public API method used by the getter and also by Blueprints
  _writing() {
    return {
      cleanup() {
        if (this.isJhipsterVersionLessThan('7.0.0-beta.0') && this.jhipsterConfig.clientFramework === ANGULAR) {
          this.removeFile(`${this.CLIENT_MAIN_SRC_DIR}/app/entities/${this.entityFolderName}/${this.entityFileName}.route.ts`);
          this.removeFile(`${this.CLIENT_MAIN_SRC_DIR}/app/entities/${this.entityFolderName}/${this.entityFileName}.component.ts`);
          this.removeFile(`${this.CLIENT_MAIN_SRC_DIR}/app/entities/${this.entityFolderName}/${this.entityFileName}.component.html`);
          this.removeFile(`${this.CLIENT_MAIN_SRC_DIR}/app/entities/${this.entityFolderName}/${this.entityFileName}-detail.component.ts`);
          this.removeFile(`${this.CLIENT_MAIN_SRC_DIR}/app/entities/${this.entityFolderName}/${this.entityFileName}-detail.component.html`);
          this.removeFile(
            `${this.CLIENT_MAIN_SRC_DIR}/app/entities/${this.entityFolderName}/${this.entityFileName}-delete-dialog.component.ts`
          );
          this.removeFile(
            `${this.CLIENT_MAIN_SRC_DIR}/app/entities/${this.entityFolderName}/${this.entityFileName}-delete-dialog.component.html`
          );
          this.removeFile(`${this.CLIENT_MAIN_SRC_DIR}/app/entities/${this.entityFolderName}/${this.entityFileName}-update.component.ts`);
          this.removeFile(`${this.CLIENT_MAIN_SRC_DIR}/app/entities/${this.entityFolderName}/${this.entityFileName}-update.component.html`);
          this.removeFile(`${this.CLIENT_MAIN_SRC_DIR}/app/shared/model/${this.entityModelFileName}.model.ts`);
          this.fields.forEach(field => {
            if (field.fieldIsEnum === true) {
              const enumFileName = _.kebabCase(field.fieldType);
              this.removeFile(`${this.CLIENT_MAIN_SRC_DIR}/app/shared/model/enumerations/${enumFileName}.model.ts`);
            }
          });
          this.removeFile(
            `${this.CLIENT_MAIN_SRC_DIR}/app/entities/${this.entityFolderName}/${this.entityFileName}-routing-resolve.service.ts`
          );
          this.removeFile(`${this.CLIENT_MAIN_SRC_DIR}/app/entities/${this.entityFolderName}/${this.entityFileName}-routing.module.ts`);
          this.removeFile(`${this.CLIENT_MAIN_SRC_DIR}/app/entities/${this.entityFolderName}/${this.entityFileName}.service.ts`);
          this.removeFile(`${this.CLIENT_MAIN_SRC_DIR}/app/entities/${this.entityFolderName}/${this.entityFileName}.service.spec.ts`);
          this.removeFile(
            `${this.CLIENT_TEST_SRC_DIR}/spec/app/entities/${this.entityFolderName}/${this.entityFileName}.component.spec.ts`
          );
          this.removeFile(
            `${this.CLIENT_TEST_SRC_DIR}/spec/app/entities/${this.entityFolderName}/${this.entityFileName}-detail.component.spec.ts`
          );
          this.removeFile(
            `${this.CLIENT_TEST_SRC_DIR}/spec/app/entities/${this.entityFolderName}/${this.entityFileName}-delete-dialog.component.spec.ts`
          );
          this.removeFile(
            `${this.CLIENT_TEST_SRC_DIR}/spec/app/entities/${this.entityFolderName}/${this.entityFileName}-update.component.spec.ts`
          );
          this.removeFile(`${this.CLIENT_TEST_SRC_DIR}/spec/app/entities/${this.entityFolderName}/${this.entityFileName}.service.spec.ts`);
        }
        if (this.isJhipsterVersionLessThan('7.0.0-beta.1') && this.jhipsterConfig.clientFramework === REACT) {
          this.removeFile(`${this.CLIENT_TEST_SRC_DIR}spec/app/entities/${this.entityFolderName}/${this.entityFileName}-reducer.spec.ts`);
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

  // Public API method used by the getter and also by Blueprints
  _postWriting() {
    return {
      customizeFiles() {
        return customizeFiles.call(this);
      },
    };
  }

  get postWriting() {
    if (useBlueprints) return;
    return this._postWriting();
  }
};
