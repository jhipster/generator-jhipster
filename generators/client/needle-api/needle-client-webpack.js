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
const needleClient = require('./needle-client');
const constants = require('../../generator-constants');

const CLIENT_WEBPACK_DIR = constants.CLIENT_WEBPACK_DIR;

module.exports = class extends needleClient {
    copyExternalAssets(source, target) {
        const errorMessage = 'Resource path not added to JHipster app.';
        const webpackDevPath = `${CLIENT_WEBPACK_DIR}/webpack.common.js`;
        let assetBlock = '';
        if (source && target) {
            assetBlock = `{ from: '${source}', to: '${target}' },`;
        }
        const rewriteFileModel = this.generateFileModel(webpackDevPath, 'jhipster-needle-add-assets-to-webpack', assetBlock);

        this.addBlockContentToFile(rewriteFileModel, errorMessage);
    }
};
