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
import isPlainObject from 'lodash-es/isPlainObject.js';
import { type Document, isMap, isSeq, parseDocument } from 'yaml';

const mergeIntoDocument = (document: Document, path: (string | number)[], value: unknown): void => {
  if (value === undefined) return;
  const node = path.length > 0 ? document.getIn(path, true) : document.contents;
  if (isMap(node) && isPlainObject(value)) {
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      mergeIntoDocument(document, [...path, key], child);
    }
  } else if (isSeq(node)) {
    // A list gets the items added, like a value merged into it.
    for (const item of Array.isArray(value) ? value : [value]) {
      node.add(document.createNode(item));
    }
  } else if (path.length > 0) {
    document.setIn(path, value);
  } else {
    document.contents = document.createNode(value);
  }
};

/**
 * Merges a value into a yaml content: the keys it has are added or replaced, the items of its lists added, and the rest of
 * the content is kept as written, its comments and its style included.
 */
export const mergeYamlContent = (content: string, value: Record<string | number, unknown>): string => {
  const document = parseDocument(content);
  mergeIntoDocument(document, [], value);
  return document.toString({ lineWidth: 0 });
};
