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

import assert from 'assert';
import { XMLParser, XMLBuilder, XmlBuilderOptions, X2jOptions } from 'fast-xml-parser';
import _ from 'lodash';

const { merge } = _;

const defaultXmlCommonOptions: Partial<X2jOptions & XmlBuilderOptions> = {
  ignoreAttributes: false,
  attributeNamePrefix: '@@',
  commentPropName: '#comment',
  parseAttributeValue: false,
};

const defaultXmlParserOptions: Partial<X2jOptions> = {
  ...defaultXmlCommonOptions,
};

const defaultXmlBuildOptions: Partial<XmlBuilderOptions> = {
  ...defaultXmlCommonOptions,
  suppressBooleanAttributes: false,
  suppressEmptyNode: true,
  format: true,
  indentBy: '    ',
};

export default class XmlStorage {
  protected readonly saveFile: (string) => void;
  protected readonly loadFile: () => string;

  protected readonly parser: XMLParser;
  protected readonly builder: XMLBuilder;
  protected _cachedStore: any;

  constructor({
    saveFile,
    loadFile,
    xmlParserOptions,
    xmlBuildOptions,
  }: {
    saveFile: (string) => void;
    loadFile: () => string;
    xmlParserOptions?: Partial<X2jOptions>;
    xmlBuildOptions?: Partial<XmlBuilderOptions>;
  }) {
    assert(saveFile, 'saveFile callback is required to create a storage');
    assert(loadFile, 'loadFile callback is required to create a storage');

    this.parser = new XMLParser({ ...defaultXmlParserOptions, ...xmlParserOptions });
    this.builder = new XMLBuilder({ ...defaultXmlBuildOptions, ...xmlBuildOptions });

    this.saveFile = saveFile;
    this.loadFile = loadFile;
  }

  public clearCache() {
    delete this._cachedStore;
  }

  public save() {
    this.sort();
    this.persist(false);
  }

  protected sort() {}

  protected persist(sort = true) {
    if (this._cachedStore) {
      if (sort) {
        this.sort();
      }

      this.saveFile(this.builder.build(this._cachedStore));
    }
  }

  protected get store() {
    this.load();
    return this._cachedStore;
  }

  protected load() {
    if (!this._cachedStore) {
      this._cachedStore = this.parser.parse(this.loadFile());
    }
  }

  protected merge(source) {
    assert(typeof source === 'object', 'Storage `merge` method only accept objects');
    this._cachedStore = merge({}, this.store, source);
  }

  protected mergeContent<T>(existing: T, newContent?: string): T {
    return newContent ? { ...existing, ...this.parser.parse(newContent) } : existing;
  }
}
