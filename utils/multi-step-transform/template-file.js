const assert = require('assert');
const debugBuilder = require('debug');
const ejs = require('ejs');
const path = require('path');

const { TemplateData } = require('./template-data');

module.exports.TemplateFile = class TemplateFile {
  constructor(filename, extension) {
    this._filename = filename;
    this._extension = extension;
    this._compiled = () => '';
    this._childs = [];
    this._partialName = filename.split(`.${this._extension}.`)[1] || '';
    this._debug = debugBuilder(`jhipster.templates.${this._filename}`);

    this.rootTemplate = !this._partialName;
    if (!this.rootTemplate) {
      this.depth = (this._partialName.match(/\./g) || []).length + 1;
    } else {
      this.depth = 0;
    }
  }

  compile(filePath, contents, options) {
    assert(filePath, 'filePath is required');
    assert(contents, 'contents is required');
    assert(options, 'options is required');

    this.filePath = filePath;
    if (this.rootTemplate) {
      this.basePath = filePath.slice(0, -path.extname(filePath).length);
    } else {
      this.parentPath = filePath.slice(0, -path.extname(filePath).length);
    }

    if (this._debug.enabled) {
      this._debug(filePath);
      this._debug('======');
      this._debug(contents);
    }

    this._compiled = ejs.compile(contents, options);
  }

  addChild(templateFile) {
    assert(templateFile, 'templateFile is required');

    this._childs.push(templateFile);
  }

  renderChilds(data) {
    return this._childs.map(templateFile => templateFile.render(data));
  }

  render(data = {}) {
    const partials = new TemplateData(this, data);
    try {
      const rendered = this._compiled({
        partial: false,
        partialName: this._partialName,
        partials,
        ...data,
      })
        .trimEnd()
        .replace(/^(\r\n|\n|\r)+/, '');
      if (this._debug.enabled) {
        this._debug(`${this.filePath}`);
        this._debug(`${JSON.stringify(data)}`);
        this._debug('======');
        this._debug(rendered);
        this._debug('======');
      }
      return rendered;
    } catch (error) {
      /* eslint-disable no-console */
      console.log(`Error rendering ${this._filename}`);
      console.log(`Available sessions ${data.sections}`);
      console.log(error);
      /* eslint-enable no-console */
      throw error;
    }
  }
};
