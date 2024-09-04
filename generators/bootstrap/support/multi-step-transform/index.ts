/**
 * Copyright 2013-2024 the original author or authors from the JHipster project.
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
import { type DuplexWithDebug, transform } from 'p-transform';
import type { MemFsEditorFile } from 'mem-fs-editor';
import TemplateFileFs from './template-file-fs.js';
import type TemplateFile from './template-file.js';

export const createMultiStepTransform = () => {
  const templateFileFs = new TemplateFileFs({});
  const templateFiles: TemplateFile[] = [];

  const duplex: DuplexWithDebug & { templateFileFs: TemplateFileFs } = transform(
    (file: MemFsEditorFile) => {
      if (!templateFileFs.isTemplate(file.path)) {
        throw new Error(`File ${file.path} is not supported`);
      }
      const templateFile = templateFileFs.add(file);
      if (templateFile.rootTemplate) {
        templateFiles.push(templateFile);
      }
      return undefined;
    },
    async function () {
      for (const templateFile of templateFiles) {
        const file = templateFile.file;
        file.path = templateFile.basePath;
        file.contents = Buffer.from(templateFile.render().concat('\n'));
        this.push(templateFile.file);
      }
    },
  ) as any;

  duplex.templateFileFs = templateFileFs;
  return duplex;
};
