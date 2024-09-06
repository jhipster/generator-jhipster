import assert from 'assert';
import path from 'path';
import debugBuilder from 'debug';
import ejs from 'ejs';

import TemplateData from './template-data.js';

export default class TemplateFile {
  file;
  rootTemplate: boolean;
  basePath?: string;
  parentPath?: string;
  filePath?: string;

  private depth: number;
  private _filename: any;
  private _extension: any;
  private _compiled: ejs.TemplateFunction;
  // eslint-disable-next-line no-use-before-define
  private _fragments: TemplateFile[];
  private _fragmentName: string;
  private _debug: { enabled: boolean } & ((msg: string) => void);

  constructor(filename, extension) {
    this._filename = filename;
    this._extension = extension;
    this._compiled = () => '';
    this._fragments = [];
    this._fragmentName = filename.split(`.${this._extension}.`)[1] || '';
    this._debug = debugBuilder(`jhipster.templates.${this._filename}`);

    this.rootTemplate = !this._fragmentName;
    if (!this.rootTemplate) {
      this.depth = (this._fragmentName.match(/\./g) || []).length + 1;
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

    try {
      this._compiled = ejs.compile(contents, { ...options, async: false }) as unknown as ejs.TemplateFunction;
    } catch (error) {
      throw new Error(`Error compiling ${this._filename}, with contents:\n${contents}`, { cause: error });
    }
  }

  addFragment(templateFile) {
    assert(templateFile, 'templateFile is required');

    this._fragments.push(templateFile);
  }

  renderFragments(data) {
    return this._fragments.map(templateFile => templateFile.render(data));
  }

  render(data: any = {}) {
    const fragments = new TemplateData(this, data);
    try {
      const rendered = this._compiled({
        fragment: false,
        fragmentName: this._fragmentName,
        fragments,
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
}
