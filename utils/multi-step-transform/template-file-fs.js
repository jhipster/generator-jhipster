const assert = require('assert');
const minimatch = require('minimatch');
const path = require('path');

const { TemplateFile } = require('./template-file');

module.exports.TemplateFileFs = class TemplateFileFs {
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
};
