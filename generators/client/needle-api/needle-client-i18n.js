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
const chalk = require('chalk');
const _ = require('lodash');
const needleClient = require('./needle-client');

module.exports = class extends needleClient {
    addElementTranslationKey(key, value, language) {
        const errorMessage = ' not added as a new entity in the menu.';
        this._addTranslationKey(key, value, language, errorMessage, 'jhipster-needle-menu-add-element');
    }

    addAdminElementTranslationKey(key, value, language) {
        const errorMessage = ' not added as a new entry in the admin menu.';
        this._addTranslationKey(key, value, language, errorMessage, 'jhipster-needle-menu-add-admin-element');
    }

    addEntityTranslationKey(key, value, language) {
        const errorMessage = ' not added as a new entity in the menu.';
        this._addTranslationKey(key, value, language, errorMessage, 'jhipster-needle-menu-add-entry');
    }

    _addTranslationKey(key, value, language, errorMessage, needle) {
        const fullErrorMessage = `${chalk.yellow(' Reference to ') + language} ${chalk.yellow(errorMessage)}`;
        const fullPath = `${this.CLIENT_MAIN_SRC_DIR}i18n/${language}/global.json`;
        const rewriteFileModel = this.generateFileModel(fullPath, needle, `"${key}": "${value}",`);

        this.addBlockContentToFile(rewriteFileModel, fullErrorMessage);
    }
};
