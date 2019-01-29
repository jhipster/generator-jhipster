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
const needleBase = require('./needle-base');

const constants = require('../../generator-constants');

const CLIENT_MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR;

module.exports = class extends needleBase {
    addStyle(style, comment, filePath, needle) {
        const styleBlock = this._mergeStyleAndComment(style, comment);
        const rewriteFileModel = this.generateFileModel(filePath, needle, styleBlock);

        this.addBlockContentToFile(rewriteFileModel, 'Style not added to JHipster app.\n');
    }

    _mergeStyleAndComment(style, comment) {
        let styleBlock = '';

        if (comment) {
            styleBlock += '/* ==========================================================================\n';
            styleBlock += `${comment}\n`;
            styleBlock += '========================================================================== */\n';
        }
        styleBlock += `${style}\n`;

        return styleBlock;
    }

    addExternalResourcesToRoot(resources, comment) {
        const errorMessage = 'Resources are not added to JHipster app.';
        const indexFilePath = `${CLIENT_MAIN_SRC_DIR}index.html`;
        let resourcesBlock = '';
        if (comment) {
            resourcesBlock += `<!-- ${comment} -->\n`;
        }
        resourcesBlock += `${resources}\n`;
        const rewriteFileModel = this.generateFileModel(indexFilePath, 'jhipster-needle-add-resources-to-root', resourcesBlock);

        this.addBlockContentToFile(rewriteFileModel, errorMessage);
    }
};
