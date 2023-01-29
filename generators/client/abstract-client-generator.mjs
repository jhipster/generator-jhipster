/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
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
import chalk from 'chalk';
import _ from 'lodash';

import BaseApplicationGenerator from '../base-application/index.mjs';

/**
 * @class
 * @template ApplicationType
 * @extends {BaseApplicationGenerator<import('./types.mjs').ClientApplication>}
 */
export default class AbstractJHipsterClientGenerator extends BaseApplicationGenerator {
  /**
   * @private
   * Add external resources to root file(index.html).
   *
   * @param {string} resources - Resources added to root file.
   * @param {string} comment - comment to add before resources content.
   */
  addExternalResourcesToRoot(resources, comment) {
    this.needleApi.client.addExternalResourcesToRoot(resources, comment);
  }

  /**
   * @private
   * Copy third-party library resources path.
   *
   * @param {string} sourceFolder - third-party library resources source path
   * @param {string} targetFolder - third-party library resources destination path
   */
  copyExternalAssetsInWebpack(sourceFolder, targetFolder) {
    this.needleApi.clientWebpack.copyExternalAssets(sourceFolder, targetFolder);
  }

  /**
   * Add webpack config.
   *
   * @param {string} config - webpack config to be merged
   */
  addWebpackConfig(config, clientFramework) {
    this.needleApi.clientWebpack.addWebpackConfig(config, clientFramework);
  }
}
