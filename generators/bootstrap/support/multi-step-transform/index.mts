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
import { Duplex } from 'stream';
import PQueue from 'p-queue';
import { isFilePending } from 'mem-fs-editor/state';
import TemplateFileFs from './template-file-fs.mjs';

// eslint-disable-next-line import/prefer-default-export
export const createMultiStepTransform = () => {
  const twoStepTemplateQueue = new PQueue({ concurrency: 1, autoStart: false });
  const templateFileFs = new TemplateFileFs({});
  const pendingFiles: string[] = [];

  const duplex: Duplex & { templateFileFs: TemplateFileFs } = Duplex.from(async function* (source) {
    for await (const file of source) {
      if (file.contents && templateFileFs.isTemplate(file.path)) {
        const templateFile = templateFileFs.add(file.path, file.contents.toString());
        if (templateFile.rootTemplate) {
          // If multi-step root, postpone.
          twoStepTemplateQueue.add(() => {
            if (pendingFiles.includes(templateFile.basePath)) {
              return;
            }
            file.path = templateFile.basePath;
            file.contents = Buffer.from(templateFile.render().concat('\n'));
          });
        } else {
          delete file.state;
        }
      } else if (isFilePending(file)) {
        pendingFiles.push(file.path);
      }
      yield file;
    }
    await twoStepTemplateQueue.start().onIdle();
  }) as any;

  duplex.templateFileFs = templateFileFs;
  return duplex;
};
