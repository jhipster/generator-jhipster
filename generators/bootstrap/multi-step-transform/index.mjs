import PQueue from 'p-queue';
import PTransform from 'p-transform';
import memFsEditorState from 'mem-fs-editor/lib/state.js';

import TemplateFileFs from './template-file-fs.mjs';

const { isFilePending } = memFsEditorState;

export default class MultiStepTransform extends PTransform {
  constructor(options = {}) {
    super({ logName: 'jhipster:multi-step-transform', ...options });

    this.twoStepTemplateQueue = new PQueue({ concurrency: 1, autoStart: false });
    this.templateFileFs = new TemplateFileFs(options);

    // Keep track of existing files, they should take precedence over multi-step templates.
    this.pendingFiles = [];
  }

  async queuedTransform(file, enc) {
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
      this.destroy(error);
    }
  }

  _flush(callback) {
    // Clear normal queue before templates.
    this.flushQueue()
      .then(() => this.twoStepTemplateQueue.start().onIdle())
      .then(() => super._flush(callback));
  }
}
