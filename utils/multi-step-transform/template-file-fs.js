const assert = require('assert');
const minimatch = require('minimatch');
const path = require('path');

const { EjsFile } = require('./template-file');

module.exports.TemplateFileFs = class TemplateFileFs {
  constructor(options = {}) {
    this.extension = options.extension || 'jhi';
    this.delimiter = options.delimiter || '&';
    this.partialFiles = {};
  }

  isTemplate(filePath) {
    return this.isRootTemplate(filePath) || this.isDerivedTemplate(filePath);
  }

  isRootTemplate(filePath) {
    return path.extname(filePath) === `.${this.extension}`;
  }

  isDerivedTemplate(filePath) {
    return minimatch(filePath, `**/*.${this.extension}.*`);
  }

  add(filePath, contents) {
    assert(filePath, 'filePath is required');
    assert(contents, 'contents is required');

    const templateFile = this.get(filePath);
    templateFile.compile(filePath, contents, { delimiter: this.delimiter });
    if (!templateFile.rootTemplate) {
      this.get(templateFile.parentPath).addChild(templateFile);
    }
    return templateFile;
  }

  get(filePath) {
    assert(filePath, 'filePath is required');
    this.partialFiles[filePath] = this.partialFiles[filePath] || new EjsFile(path.basename(filePath), this.extension);
    return this.partialFiles[filePath];
  }
};
