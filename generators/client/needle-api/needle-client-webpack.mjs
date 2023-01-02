/**
 * Copyright 2013-2022 the original author or authors from the JHipster project.
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
import needleClient from './needle-client.mjs';
import { CLIENT_WEBPACK_DIR } from '../../generator-constants.mjs';
import { clientFrameworkTypes } from '../../../jdl/jhipster/index.mjs';

const { ANGULAR } = clientFrameworkTypes;

export default class extends needleClient {
  _getWebpackFile(clientFramework = this.clientFramework) {
    return this.clientFramework === ANGULAR ? `${CLIENT_WEBPACK_DIR}/webpack.custom.js` : `${CLIENT_WEBPACK_DIR}/webpack.common.js`;
  }

  copyExternalAssets(source, target, clientFramework) {
    const errorMessage = 'Resource path not added to JHipster app.';
    let assetBlock = '';
    if (source && target) {
      assetBlock = `{ from: '${source}', to: '${target}' },`;
    }
    const rewriteFileModel = this.generateFileModel(
      this._getWebpackFile(clientFramework),
      'jhipster-needle-add-assets-to-webpack',
      assetBlock
    );

    this.addBlockContentToFile(rewriteFileModel, errorMessage);
  }

  addWebpackConfig(config, clientFramework) {
    config = `,${config}`;
    const rewriteFileModel = this.generateFileModel(this._getWebpackFile(clientFramework), 'jhipster-needle-add-webpack-config', config);
    rewriteFileModel.prettierAware = true;
    this.addBlockContentToFile(rewriteFileModel, 'Webpack config not added to JHipster app.\n');
  }
}
