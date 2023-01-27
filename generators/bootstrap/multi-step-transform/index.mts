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
import PQueue from 'p-queue';
import PTransform from 'p-transform';
import memFsEditorState from 'mem-fs-editor/lib/state.js';

import TemplateFileFs from './template-file-fs.mjs';

const { isFilePending } = memFsEditorState;

export default class MultiStepTransform extends PTransform {
  twoStepTemplateQueue: PQueue;
  templateFileFs: TemplateFileFs;
  pendingFiles: string[];

  constructor(options = {}) {
    super({
      logName: 'jhipster:multi-step-transform',
      ...options,
      transform: file => {
        try {
          if (file.contents && this.templateFileFs.isTemplate(file.path)) {
            const templateFile = this.templateFileFs.add(file.path, file.contents.toString());
            if (templateFile.rootTemplate) {
              // If multi-step root, postpone.
              this.twoStepTemplateQueue.add(() => {
                if (this.pendingFiles.includes(templateFile.basePath)) {
                  return;
                }
                file.path = templateFile.basePath;
                file.contents = Buffer.from(templateFile.render().concat('\n'));
                this.push(file);
              });
            } else {
              delete file.state;
            }
          } else {
            if (isFilePending(file)) {
              this.pendingFiles.push(file.path);
            }
            this.push(file);
          }
        } catch (error) {
          this.destroy(error as Error);
        }
      },
    });

    this.twoStepTemplateQueue = new PQueue({ concurrency: 1, autoStart: false });
    this.templateFileFs = new TemplateFileFs(options);

    // Keep track of existing files, they should take precedence over multi-step templates.
    this.pendingFiles = [];
  }

  _flush(callback) {
    // Clear normal queue before templates.
    (this as any)
      .flushQueue()
      .then(() => this.twoStepTemplateQueue.start().onIdle())
      .then(() => super._flush(callback));
  }
}
