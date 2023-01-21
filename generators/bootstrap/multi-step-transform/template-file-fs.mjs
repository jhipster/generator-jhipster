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
import assert from 'assert';
import minimatch from 'minimatch';
import path from 'path';

import TemplateFile from './template-file.mjs';

export default class TemplateFileFs {
  constructor(options = {}) {
    this.extension = options.extension || 'jhi';
    this.delimiter = options.delimiter || '&';
    this.fragmentFiles = {};
  }

  isTemplate(filePath) {
    return this.isRootTemplate(filePath) || this.isDerivedTemplate(filePath);
  }

  isRootTemplate(filePath) {
    return path.extname(filePath) === `.${this.extension}`;
  }

  isDerivedTemplate(filePath) {
    return minimatch(filePath, `**/*.${this.extension}.*`, { dot: true });
  }

  add(filePath, contents) {
    assert(filePath, 'filePath is required');
    assert(contents, 'contents is required');

    const templateFile = this.get(filePath);
    templateFile.compile(filePath, contents, { delimiter: this.delimiter });
    if (!templateFile.rootTemplate) {
      this.get(templateFile.parentPath).addFragment(templateFile);
    }
    return templateFile;
  }

  get(filePath) {
    assert(filePath, 'filePath is required');
    this.fragmentFiles[filePath] = this.fragmentFiles[filePath] || new TemplateFile(path.basename(filePath), this.extension);
    return this.fragmentFiles[filePath];
  }
}
