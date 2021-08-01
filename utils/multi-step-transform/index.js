const { default: PQueue } = require('p-queue');
const OOOTransform = require('yeoman-environment/lib/util/out-of-order-transform');
const { isFilePending } = require('mem-fs-editor/lib/state');

const { TemplateFileFs } = require('./template-file-fs');

module.exports.MultiStepTransform = class MultiStepTransform extends OOOTransform {
  constructor(options = {}) {
    super(options);

    this.twoStepTemplateQueue = new PQueue({ concurrency: 1, autoStart: false });
    this.templateFileFs = new TemplateFileFs(options);

    // Keep track of existing files, they should take precedence over multi-step templates.
    this.pendingFiles = [];
  }

  async _executeTransform(file, enc) {
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

  async _final(...args) {
    // Clear normal queue before templates.
    await this.queue.onIdle();
    await this.twoStepTemplateQueue.start().onIdle();
    super._final(...args);
  }
};
