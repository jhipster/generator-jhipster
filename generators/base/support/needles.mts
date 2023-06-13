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
import _ from 'lodash';
import escapeStringRegexp from 'escape-string-regexp';
import CoreGenerator from '../generator-base.mjs';
import { CascatedEditFileCallback, EditFileCallback } from '../api.mjs';
import { joinCallbacks } from './write-files.mjs';

const { kebabCase } = _;

export type NeedleInsertion = {
  needle: string;
  /**
   * Content to add.
   */
  contentToAdd: string | string[] | ((content: string, options: { needleIndent: number; indentPrefix: string }) => string);
  contentToCheck?: string | RegExp;
  /**
   * check existing content ignoring white spaces and new lines.
   */
  ignoreWhitespaces?: boolean;
  /**
   * throw error if needle was not found
   */
  optional?: boolean;
  /**
   * Detect and apply ident
   */
  autoIndent?: boolean;
};

type NeedleFileInsertion = NeedleInsertion & {
  /**
   * Path to file.
   * The generator context must be passed.
   */
  filePath?: string;
  /**
   * Common needle prefix
   */
  needlesPrefix?: string;
};

type NeedleContentInsertion = NeedleInsertion & {
  content: string;
};

/**
 * Change spaces sequences and '>' to allow any number of spaces or new line prefix
 */
export const convertToPrettierExpressions = (str: string): string => {
  return str.replace(/\s+/g, '([\\s\n]*)').replace(/>+/g, '(\n?[\\s]*)>');
};

/**
 * Check if contentToCheck existing in content
 *
 * @param contentToCheck
 * @param content
 * @param [ignoreWhitespaces=true]
 */
export const checkContentIn = (contentToCheck: string | RegExp, content, ignoreWhitespaces = true) => {
  assert(content, 'content is required');
  assert(contentToCheck, 'contentToCheck is required');

  let re: RegExp;
  if (typeof contentToCheck === 'string') {
    const pattern = ignoreWhitespaces
      ? convertToPrettierExpressions(escapeStringRegexp(contentToCheck))
      : contentToCheck
          .split('\n')
          .map(line => `\\s*${escapeStringRegexp(line)}`)
          .join('\n');
    re = new RegExp(pattern);
  } else {
    re = contentToCheck;
  }
  return re.test(content);
};

/**
 * Write content before needle applying identation
 *
 * @param args
 * @returns null if needle was not found, new content otherwise
 */
export const insertContentBeforeNeedle = ({ content, contentToAdd, needle, autoIndent = true }: NeedleContentInsertion): string | null => {
  assert(needle, 'needle is required');
  assert(content, 'content is required');
  assert(contentToAdd, 'contentToAdd is required');

  needle = needle.includes('jhipster-needle-') ? needle : `jhipster-needle-${needle}`;

  let regexp = new RegExp(`(?://|<!--|/*|#) ${needle}(?:$|\n| )`, 'g');
  let firstMatch = regexp.exec(content);
  if (!firstMatch) {
    regexp = new RegExp(`"${needle}": `, 'g');
    firstMatch = regexp.exec(content);
    if (!firstMatch) {
      return null;
    }
  }

  // Replacements using functions allows to replace multiples needles
  if (typeof contentToAdd !== 'function' && regexp.exec(content)) {
    throw new Error(`Multiple needles found for ${needle}`);
  }

  const needleIndex = firstMatch.index;

  const needleLineIndex = content.lastIndexOf('\n', needleIndex);
  const beforeContent = content.substring(0, needleLineIndex + 1);
  const afterContent = content.substring(needleLineIndex + 1);

  // Find needle ident
  const needleLine = afterContent.split('\n', 2)[0];
  const needleIndent = needleLine.length - needleLine.trimStart().length;

  if (typeof contentToAdd === 'function') {
    return contentToAdd(content, { needleIndent, indentPrefix: ' '.repeat(needleIndent) });
  }
  contentToAdd = Array.isArray(contentToAdd) ? contentToAdd : [contentToAdd];
  if (autoIndent) {
    contentToAdd = contentToAdd.map(eachContentToAdd => eachContentToAdd.split('\n')).flat();
  }

  // Normalize needle indent with contentToAdd.
  const firstContent = contentToAdd.find(line => line.trim());
  if (!firstContent) {
    // File is blank.
    return null;
  }
  const contentIndent = firstContent.length - firstContent.trimStart().length;
  if (needleIndent > contentIndent) {
    const identToApply = ' '.repeat(needleIndent - contentIndent);
    contentToAdd = contentToAdd.map(line => (line ? identToApply + line : line));
  } else if (needleIndent < contentIndent) {
    let identToRemove = contentIndent - needleIndent;
    contentToAdd
      .filter(line => line.trimStart())
      .forEach(line => {
        const trimmedLine = line.trimStart();
        const lineIndent = line.length - trimmedLine.length;
        if (lineIndent < identToRemove) {
          identToRemove = lineIndent;
        }
      });
    contentToAdd = contentToAdd.map(line => (line.length > identToRemove ? line.substring(identToRemove) : ''));
  }

  return `${beforeContent}${contentToAdd.join('\n')}\n${afterContent}`;
};

/**
 * Create an callback to insert the new content into existing content.
 *
 * A `contentToAdd` of string type will remove leading `\n`.
 * Leading `\n` allows a prettier template formatting.
 *
 * @param options
 */
export const createNeedleCallback = <Generator extends CoreGenerator = CoreGenerator>({
  needle,
  contentToAdd,
  contentToCheck,
  optional = false,
  ignoreWhitespaces = true,
  autoIndent,
}: NeedleInsertion): EditFileCallback<Generator> => {
  assert(needle, 'needle is required');
  assert(contentToAdd, 'contentToAdd is required');

  return function (content, filePath) {
    if (contentToCheck && checkContentIn(contentToCheck, content, ignoreWhitespaces)) {
      return content;
    }
    if (typeof contentToAdd !== 'function') {
      if (typeof contentToAdd === 'string' && contentToAdd.startsWith('\n')) {
        contentToAdd = contentToAdd.slice(1);
      }
      contentToAdd = (Array.isArray(contentToAdd) ? contentToAdd : [contentToAdd]).filter(
        eachContent => !checkContentIn(eachContent, content, ignoreWhitespaces)
      );
      if (contentToAdd.length === 0) {
        return content;
      }
    }

    const newContent = insertContentBeforeNeedle({
      needle,
      content,
      contentToAdd,
      autoIndent,
    });
    if (newContent) {
      return newContent;
    }
    const message = `Missing ${optional ? 'optional' : 'required'} jhipster-needle ${needle} not found at '${filePath}'`;
    if (optional) {
      this.log.warn(message);
      return content;
    }
    throw new Error(message);
  };
};

/**
 * Inject content before needle or create a needle insertion callback.
 *
 * @param this - generator if provided, editFile will be executed
 */
export function createBaseNeedle<Generator extends CoreGenerator = CoreGenerator>(
  this: Generator | void,
  options: NeedleFileInsertion | Record<string, string>,
  needles?: Record<string, string>
): EditFileCallback<Generator> | CascatedEditFileCallback<Generator> {
  const actualNeedles = needles === undefined ? (options as Record<string, string>) : needles;
  const actualOptions: NeedleFileInsertion | undefined = needles === undefined ? undefined : (options as NeedleFileInsertion);

  assert(actualNeedles, 'needles is required');
  const { filePath, optional = false, ignoreWhitespaces = true } = actualOptions ?? {};
  let { needlesPrefix } = options;
  needlesPrefix = needlesPrefix ? `${needlesPrefix}-` : '';

  const callbacks = Object.entries(actualNeedles)
    .filter(([_key, contentToAdd]) => contentToAdd)
    .map(([key, contentToAdd]) =>
      createNeedleCallback({ needle: `${needlesPrefix}${kebabCase(key)}`, contentToAdd, optional, ignoreWhitespaces })
    );

  assert(callbacks.length > 0, 'At least 1 needle is required');

  const callback = callbacks.length === 1 ? callbacks[0] : joinCallbacks(...callbacks);

  if (filePath) {
    assert(this, 'when passing filePath, the generator is required');

    return this.editFile(filePath, callback);
  }

  return callback;
}
