/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
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
import assert from 'node:assert';

import { escapeRegExp, kebabCase } from 'lodash-es';

import type { CascatedEditFileCallback, EditFileCallback } from '../api.ts';
import type CoreGenerator from '../index.ts';

import { joinCallbacks } from './write-files.ts';

export type NeedleCallback = (content: string) => string;

type NeedleContentToAddCallback = {
  /**
   * Position of the needle start.
   */
  needleIndex: number;
  /**
   * Position of the needle line's new line char.
   */
  needleLineIndex: number;
  needleIndent: number;
  indentPrefix: string;
};

type ContentToAdd = { content: string; contentToCheck?: string | RegExp };

export type NeedleInsertion = {
  needle: string;
  /**
   * Content to add.
   */
  contentToAdd: string | string[] | ContentToAdd[] | ((content: string, options: NeedleContentToAddCallback) => string);
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
   * Detect and apply indent
   */
  autoIndent?: boolean;
};

type NeedleFileInsertion = Omit<NeedleInsertion, 'needle' | 'contentToAdd'> & {
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

type NeedleContentInsertion = Pick<NeedleInsertion, 'needle' | 'autoIndent'> & {
  content: string;
  contentToAdd: string | string[] | ((content: string, options: NeedleContentToAddCallback) => string);
};

/**
 * Change spaces sequences and characters that prettier breaks line (<>()) to allow any number of spaces or new line prefix
 */
export const convertToPrettierExpressions = (str: string): string =>
  str
    .replace(/(<|\\\()(?! )/g, '$1\\n?[\\s]*')
    .replace(/(?! )(>|\\\))/g, ',?\\n?[\\s]*$1')
    .replace(/\s+/g, '[\\s\\n]*');

const isArrayOfContentToAdd = (value: unknown): value is ContentToAdd[] => {
  return Array.isArray(value) && value.every(item => typeof item === 'object' && 'content' in item);
};

/**
 * Check if contentToCheck existing in content
 *
 * @param contentToCheck
 * @param content
 * @param [ignoreWhitespaces=true]
 */
export const checkContentIn = (contentToCheck: string | RegExp, content: string, ignoreWhitespaces = true) => {
  assert(content, 'content is required');
  assert(contentToCheck, 'contentToCheck is required');

  let re: RegExp;
  if (typeof contentToCheck === 'string') {
    const pattern = ignoreWhitespaces
      ? convertToPrettierExpressions(escapeRegExp(contentToCheck))
      : contentToCheck
          .split('\n')
          .map(line => `\\s*${escapeRegExp(line)}`)
          .join('\n');
    re = new RegExp(pattern);
  } else {
    re = contentToCheck;
  }
  return re.test(content);
};

const addNeedlePrefix = (needle: string): string => {
  return needle.includes('jhipster-needle-') ? needle : `jhipster-needle-${needle}`;
};

const hasNeedleStart = (content: string, needle: string): boolean => {
  const regexpStart = new RegExp(`(?://|<!--|\\{?/\\*|#) ${addNeedlePrefix(needle)}-start(?:.*)\n`, 'g');
  const startMatch = regexpStart.exec(content);
  return Boolean(startMatch);
};

/**
 * Write content before needle applying indentation
 *
 * @param args
 * @returns null if needle was not found, new content otherwise
 */
export const insertContentBeforeNeedle = ({ content, contentToAdd, needle, autoIndent = true }: NeedleContentInsertion): string | null => {
  assert(needle, 'needle is required');
  assert(content, 'content is required');
  assert(contentToAdd, 'contentToAdd is required');

  needle = addNeedlePrefix(needle);

  const regexp = new RegExp(`(?://|<!--|\\{?/\\*|#) ${needle}(?:$|\n| )`, 'g');
  let firstMatch = regexp.exec(content);
  if (!firstMatch) {
    return null;
  }

  // Replacements using functions allows to replace multiples needles
  if (typeof contentToAdd !== 'function' && regexp.exec(content)) {
    throw new Error(`Multiple needles found for ${needle}`);
  }

  const regexpStart = new RegExp(`(?://|<!--|\\{?/\\*|#) ${needle}-start(?:.*)\n`, 'g');
  const startMatch = regexpStart.exec(content);
  if (startMatch) {
    const needleLineIndex = content.lastIndexOf('\n', firstMatch.index) + 1;
    content = content.substring(0, startMatch.index + startMatch[0].length) + content.substring(needleLineIndex);
    regexp.lastIndex = 0;
    firstMatch = regexp.exec(content);
    if (!firstMatch) {
      throw new Error(`Needle start found for ${needle} but no end found`);
    }
  }

  const needleIndex = firstMatch.index;

  const needleLineIndex = content.lastIndexOf('\n', needleIndex) + 1;
  const beforeContent = content.substring(0, needleLineIndex);
  const afterContent = content.substring(needleLineIndex);
  const needleIndent = needleIndex - needleLineIndex;

  if (typeof contentToAdd === 'function') {
    const newContent = contentToAdd(content, {
      needleIndex,
      needleLineIndex,
      needleIndent,
      indentPrefix: ' '.repeat(needleIndent),
    });
    return newContent;
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

  const newContent = `${beforeContent}${contentToAdd.join('\n')}\n${afterContent}`;
  return newContent;
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
    if (isArrayOfContentToAdd(contentToAdd)) {
      contentToAdd = contentToAdd.filter(({ content: itemContent, contentToCheck }) => {
        return !checkContentIn(contentToCheck ?? itemContent, content, ignoreWhitespaces);
      });
      if (contentToAdd.length === 0) {
        return content;
      }
      contentToAdd = contentToAdd.map(({ content }) => content);
    }
    if (contentToCheck && checkContentIn(contentToCheck, content, ignoreWhitespaces)) {
      return content;
    }
    if (typeof contentToAdd !== 'function') {
      if (typeof contentToAdd === 'string' && contentToAdd.startsWith('\n')) {
        contentToAdd = contentToAdd.slice(1);
      }
      contentToAdd = Array.isArray(contentToAdd) ? contentToAdd : [contentToAdd];
      if (!hasNeedleStart(content, needle)) {
        contentToAdd = contentToAdd.filter(eachContent => !checkContentIn(eachContent, content, ignoreWhitespaces));
      }
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
    if (optional && this) {
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
export function createBaseNeedle(options: Omit<NeedleFileInsertion, 'filePath'>, needles: Record<string, string>): NeedleCallback;
export function createBaseNeedle(needles: Record<string, string>): NeedleCallback;
export function createBaseNeedle<Generator extends CoreGenerator = CoreGenerator>(
  this: Generator,
  options: NeedleFileInsertion,
  needles: Record<string, string>,
): CascatedEditFileCallback<Generator>;
export function createBaseNeedle<Generator extends CoreGenerator = CoreGenerator>(
  this: Generator | void,
  options: NeedleFileInsertion | Record<string, string>,
  needles?: Record<string, string>,
): EditFileCallback<Generator> | CascatedEditFileCallback<Generator> {
  const actualNeedles = (needles ??= options as Record<string, string>);
  const actualOptions: Partial<NeedleFileInsertion> | undefined = needles === undefined ? {} : (options as NeedleFileInsertion);

  assert(actualNeedles, 'needles is required');
  const { needlesPrefix, filePath, ...needleOptions } = actualOptions;
  needleOptions.optional = needleOptions.optional ?? false;
  needleOptions.ignoreWhitespaces = needleOptions.ignoreWhitespaces ?? true;

  const callbacks = Object.entries(actualNeedles)
    .filter(([_key, contentToAdd]) => contentToAdd)
    .map(([key, contentToAdd]) =>
      createNeedleCallback({ ...needleOptions, needle: `${needlesPrefix ? `${needlesPrefix}-` : ''}${kebabCase(key)}`, contentToAdd }),
    );

  assert(callbacks.length > 0, 'At least 1 needle is required');

  const callback = callbacks.length === 1 ? callbacks[0] : joinCallbacks(...callbacks);

  if (filePath) {
    assert(this?.editFile, 'when passing filePath, the generator is required');

    return this.editFile(filePath, callback);
  }

  return callback;
}
