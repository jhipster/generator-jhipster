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
import chalk from 'chalk';
import { rewriteFile } from './utils.mjs';

export default class {
  constructor(generator) {
    this.generator = generator;
  }

  get clientSrcDir() {
    return this.generator.sharedData.getApplication().clientSrcDir;
  }

  get clientFramework() {
    return this.generator.sharedData.getApplication().clientFramework;
  }

  addBlockContentToFile(rewriteFileModel, errorMessage) {
    try {
      return rewriteFile(rewriteFileModel, this.generator);
    } catch (e) {
      this.logNeedleNotFound(e, errorMessage, rewriteFileModel.file);
      return false;
    }
  }

  logNeedleNotFound(exception, message, fullPath) {
    if (!message) {
      message = 'File rewrite failed.';
    }
    this.generator.log(chalk.yellow('\nUnable to find ') + fullPath + chalk.yellow(` or missing required jhipster-needle. ${message}\n`));
    this.generator.debug('Error:', exception);
  }

  generateFileModelWithPath(aPath, aFile, needleTag, ...content) {
    return Object.assign(this.generateFileModel(aFile, needleTag, ...content), { path: aPath });
  }

  generateFileModel(aFile, needleTag, ...content) {
    return {
      file: aFile,
      needle: needleTag,
      splicable: content,
    };
  }
}
