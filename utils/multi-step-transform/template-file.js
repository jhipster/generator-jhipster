const assert = require('assert');
const debugBuilder = require('debug');
const ejs = require('ejs');
const path = require('path');

module.exports.EjsFile = class EjsFile {
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

    if (this.rootTemplate) {
      this.basePath = filePath.slice(0, -path.extname(filePath).length);
    } else {
      this.parentPath = filePath.slice(0, -path.extname(filePath).length);
    }

    if (this._debug.enabled) {
      this._debug(this._file.path);
      this._debug('======');
      this._debug(contents);
    }

    this._compiled = ejs.compile(contents, options);
  }

  addChild(templateFile) {
    assert(templateFile, 'templateFile is required');

    this._childs.push(templateFile);
  }

  render(data) {
    const rendered = this._compiled({
      partial: false,
      partialName: this._partialName,
      partials: {
        render: childData => this._childs.map(templateFile => templateFile.render({ partial: true, ...data, ...childData })).join(''),
      },
      ...data,
    });
    if (this._debug.enabled) {
      this._debug(`${this._file.path}: ${JSON.stringify(data)}`);
      this._debug('======');
      this._debug(rendered);
      this._debug('======');
    }
    return rendered;
  }
};
