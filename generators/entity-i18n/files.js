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
const utils = require('../utils');

/**
 * The default is to use a file path string. It implies use of the template method.
 * For any other config an object { file:.., method:.., template:.. } can be used
 */

module.exports = {
    writeFiles
};

function writeFiles() {
    return {
        writeEnumFiles() {
            this.fields.forEach(field => {
                if (field.fieldIsEnum === true) {
                    const enumInfo = utils.buildEnumInfo(field, this.angularAppName, this.packageName, this.clientRootFolder);

                    // Copy for each
                    if (!this.skipClient && this.enableTranslation) {
                        const languages = this.languages || this.getAllInstalledLanguages();
                        languages.forEach(language => {
                            this.copyEnumI18n(language, enumInfo, this.fetchFromInstalledJHipster('entity-i18n/templates'));
                        });
                    }
                }
            });
        },

        writeClientFiles() {
            if (this.skipClient) return;

            // Copy for each
            if (this.enableTranslation) {
                const languages = this.languages || this.getAllInstalledLanguages();
                languages.forEach(language => {
                    this.copyI18n(language, this.fetchFromInstalledJHipster('entity-i18n/templates'));
                });
            }
        }
    };
}
