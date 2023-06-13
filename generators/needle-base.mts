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
import BaseGenerator from './base/index.mjs';
import { createNeedleCallback, NeedleInsertion } from './base/support/needles.mjs';

export type NeedleFileModel = {
  /**
   * file path for logging purposes.
   */
  file: string;
  /**
   * needle to be looked for
   */
  needle: string;
  /**
   * content to be added.
   */
  splicable: string | string[];

  path?: string;
  /**
   * apply prettier aware expressions before looking for applied needles.
   */
  prettierAware?: boolean;
  /**
   * use another content to looking for applied needles.
   */
  regexp?: RegExp | string;
  /**
   * file content
   */
  haystack?: string;
};

export default class {
  generator: BaseGenerator;

  constructor(generator: BaseGenerator) {
    this.generator = generator;
  }

  /**
   * @deprecated
   */
  get clientSrcDir(): string {
    return (this.generator.sharedData.getApplication() as any).clientSrcDir;
  }

  /**
   * @deprecated
   */
  get clientFramework(): string {
    return (this.generator.sharedData.getApplication() as any).clientFramework;
  }

  /**
   * @deprecated use editFile
   * @param rewriteFileModel
   * @param errorMessage
   */
  addBlockContentToFile(rewriteFileModel: NeedleFileModel, errorMessage: string): void {
    const ignoreNonExisting = errorMessage ?? true;
    const { path: rewritePath, file } = rewriteFileModel;
    let fullPath;
    if (rewritePath) {
      fullPath = this.generator.destinationPath(rewritePath, file);
    } else {
      fullPath = this.generator.destinationPath(file);
    }
    this.generator.editFile(
      fullPath,
      { ignoreNonExisting },
      createNeedleCallback({
        needle: rewriteFileModel.needle,
        contentToAdd: rewriteFileModel.splicable,
        contentToCheck: rewriteFileModel.regexp,
        ignoreWhitespaces: rewriteFileModel.prettierAware,
        autoIndent: false,
      })
    );
  }

  editFile(fullPath, errorMessage: string, needleData: NeedleInsertion): void {
    const ignoreNonExisting = errorMessage ?? true;
    this.generator.editFile(fullPath, { ignoreNonExisting }, createNeedleCallback(needleData));
  }

  logNeedleNotFound(exception: Error, message?: string, fullPath?: string): void {
    if (!message) {
      message = 'File rewrite failed.';
    }
    this.generator.log(chalk.yellow('\nUnable to find ') + fullPath + chalk.yellow(` or missing required jhipster-needle. ${message}\n`));
    this.generator.log.debug('Error:', exception);
  }

  /**
   * @deprecated
   */
  generateFileModelWithPath(aPath: string, aFile: string, needleTag: string, ...content: string[]): NeedleFileModel {
    return Object.assign(this.generateFileModel(aFile, needleTag, ...content), { path: aPath });
  }

  /**
   * @deprecated
   */
  generateFileModel(aFile: string, needleTag: string, ...content: string[]): NeedleFileModel {
    return {
      file: aFile,
      needle: needleTag,
      splicable: content,
    };
  }
}
