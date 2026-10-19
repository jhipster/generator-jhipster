/**
 * Copyright 2013-2026 the original author or authors from the JHipster project.
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

import FastXmlBuilder, { type XmlBuilderOptions } from 'fast-xml-builder';
import { type X2jOptions, XMLParser } from 'fast-xml-parser';
import type { MemFsEditor } from 'mem-fs-editor';
import { Storage } from 'yeoman-generator';

const defaultXmlCommonOptions: Partial<X2jOptions & XmlBuilderOptions> = {
  ignoreAttributes: false,
  attributeNamePrefix: '@@',
  commentPropName: '#comment',
};

export const defaultXmlParserOptions: Partial<X2jOptions> = {
  parseAttributeValue: false,
  parseTagValue: false,
  ...defaultXmlCommonOptions,
};

export const defaultXmlBuildOptions: Partial<XmlBuilderOptions> = {
  ...defaultXmlCommonOptions,
  suppressBooleanAttributes: false,
  suppressEmptyNode: true,
  format: true,
  indentBy: '    ',
};

// Created before the fields of a storage: Storage reads its file in its constructor.
const parser = new XMLParser(defaultXmlParserOptions);
const builder = new FastXmlBuilder(defaultXmlBuildOptions);

/**
 * A storage of a xml file: yeoman-generator's Storage, parsing and building xml.
 */
export default class XmlStorage extends Storage {
  sortFile: boolean;
  /** Whether a change was made through this storage: only then save writes the file. */
  protected changed = false;

  constructor(fs: MemFsEditor, filePath: string, { sortFile }: { sortFile?: boolean } = {}) {
    super(undefined, fs, filePath);
    this.sortFile = sortFile ?? true;
  }

  override parseContent(contents: string): Record<string, any> {
    return parser.parse(contents);
  }

  override serializeContent(fullStore: Record<string, any>): string {
    return builder.build(fullStore);
  }

  override save(sort = this.sortFile) {
    if (this.changed) {
      this.persist(sort);
    }
  }

  override merge(source: Record<string, any>): Record<string, any> {
    this.changed = true;
    return super.merge(source);
  }

  protected sort() {}

  protected persist(sort = this.sortFile) {
    if (sort) {
      this.sort();
    }
    this.changed = true;
    super.save();
  }

  protected get store() {
    return this._store;
  }

  protected mergeContent<T>(existing: T, newContent?: string): T {
    return newContent ? { ...existing, ...parser.parse(newContent) } : existing;
  }
}
