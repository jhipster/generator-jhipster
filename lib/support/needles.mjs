/**
 * Copyright 2013-2022 the original author or authors from the JHipster project.
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
import chalk from 'chalk';
import _ from 'lodash';
import escapeStringRegexp from 'escape-string-regexp';

const { kebabCase } = _;

/**
 * Change spaces sequences and '>' to allow any number of spaces or new line prefix
 *
 * @param {string} str string
 * @returns {string} string where CRLF is replaced with LF in Windows
 */
export const convertToPrettierExpressions = str => {
  return str.replace(/\s+/g, '([\\s\n]*)').replace(/>+/g, '(\n?[\\s]*)>');
};

/**
 * Check if contentToCheck existing in content
 *
 * @param {string} contentToCheck
 * @param {string} content
 * @param {boolean} [ignoreWhitespaces=true]
 * @returns {boolean} if exists
 */
export const checkContentIn = (contentToCheck, content, ignoreWhitespaces = true) => {
  assert(content, 'content is required');
  assert(contentToCheck, 'contentToCheck is required');

  let re;
  if (contentToCheck.test) {
    re = contentToCheck;
  } else if (ignoreWhitespaces) {
    re = convertToPrettierExpressions(escapeStringRegexp(contentToCheck));
  } else {
    re = contentToCheck
      .split('\n')
      .map(line => `\\s*${escapeStringRegexp(line)}`)
      .join('\n');
  }
  if (!re.test) {
    re = new RegExp(re);
  }
  return re.test(content);
};

/**
 * Write content before needle applying identation
 *
 * @param {object} args
 * @param {string} args.content - normalized content
 * @param {string} args.needle
 * @param {string|string[]} args.contentToAdd
 * @returns {string|null} null if needle was not found, new content otherwise
 */
export const insertContentBeforeNeedle = ({ content, contentToAdd, needle }) => {
  assert(needle, 'needle is required');
  assert(content, 'content is required');
  assert(contentToAdd, 'contentToAdd is required');

  const regexp = new RegExp(`(?://|<!--|/*|#) jhipster-needle-${needle}(?:$|\n| )`, 'g');
  const firstMatch = regexp.exec(content);
  if (!firstMatch) {
    return null;
  }
  if (regexp.exec(content)) {
    throw new Error(`Multiple needles found for ${needle}`);
  }

  const needleIndex = firstMatch.index;

  const needleLineIndex = content.lastIndexOf('\n', needleIndex);
  const beforeContent = content.substring(0, needleLineIndex + 1);
  const afterContent = content.substring(needleLineIndex + 1);

  // Find needle ident
  const needleLine = afterContent.split('\n', 2)[0];
  const needleIdent = needleLine.length - needleLine.trimStart().length;

  contentToAdd = []
    .concat(contentToAdd)
    .map(eachContentToAdd => eachContentToAdd.split('\n'))
    .flat();

  // Normalize needle ident with contentToAdd.
  const firstContent = contentToAdd.find(line => line.trim());
  const contentIdent = firstContent.length - firstContent.trimStart().length;
  if (needleIdent > contentIdent) {
    const identToApply = ' '.repeat(needleIdent - contentIdent);
    contentToAdd = contentToAdd.map(line => (line ? identToApply + line : line));
  } else if (needleIdent < contentIdent) {
    let identToRemove = contentIdent - needleIdent;
    contentToAdd
      .filter(line => line.trimStart())
      .forEach(line => {
        const trimmedLine = line.trimStart();
        const lineIdent = line.length - trimmedLine.length;
        if (lineIdent < identToRemove) {
          identToRemove = lineIdent;
        }
      });
    contentToAdd = contentToAdd.map(line => (line.length > identToRemove ? line.substring(identToRemove) : ''));
  }

  return `${beforeContent}${contentToAdd.join('\n')}\n${afterContent}`;
};

/**
 * Create an callback to insert the new content into existing content.
 *
 * @this Generator
 * @param {object} options
 * @param {string} options.needle needle to look for
 * @param {string|string[]} options.contentToAdd content to add
 * @param {boolean} [options.optional=false] don't throw error if needle was not found
 * @param {boolean} [options.ignoreWhitespaces=true] check existing content ignoring white spaces and new lines
 * @returns {import('../../generators/base/types').EditFileCallback}
 */
export const createNeedleCallback = ({ needle, contentToAdd, optional = false, ignoreWhitespaces = true }) => {
  assert(needle, 'needle is required');
  assert(contentToAdd, 'contentToAdd is required');

  /**
   * @type {import('../../generators/base/types').EditFileCallback}
   * @this {import('../../generators/base/index.cjs')}
   */
  return function (content, filePath) {
    contentToAdd = [].concat(contentToAdd).filter(eachContent => !checkContentIn(eachContent, content, ignoreWhitespaces));
    if (contentToAdd.length === 0) {
      return content;
    }

    const newContent = insertContentBeforeNeedle({
      needle,
      content,
      contentToAdd,
    });
    if (newContent) {
      return newContent;
    }
    const message = `Missing ${optional ? 'optional' : 'required'} jhipster-needle ${needle} not found at '${filePath}'`;
    if (optional) {
      this.log(chalk.yellow(message));
      return content;
    }
    throw new Error(message);
  };
};

/**
 * Inject content before needle or create a needle insertion callback.
 *
 * @param {object} options foo
 * @param {object} needles
 * @param {string} options.contentToAdd content to add
 * @param {Generator} [options.generator] generator if provided, editFile will be executed
 * @param {string} [options.filePath] path to file
 * @param {string} [options.needlesPrefix] common needle prefix
 * @param {boolean} [options.optional=false] throw error if needle was not found
 * @returns {import('../../generators/base/index.mjs').CascatedEditFileCallback | import('../../generators/base/index.mjs').EditFileCallback}
 */
export const createBaseNeedle = (options, needles) => {
  if (!needles) {
    needles = options;
    options = {};
  }

  assert(needles, 'needles is required');
  const { generator, filePath, optional = false, ignoreWhitespaces = true } = options;
  let { needlesPrefix } = options;
  needlesPrefix = needlesPrefix ? `${needlesPrefix}-` : '';

  const callbacks = Object.entries(needles)
    .filter(([_key, contentToAdd]) => contentToAdd)
    .map(([key, contentToAdd]) =>
      createNeedleCallback({ needle: `${needlesPrefix}${kebabCase(key)}`, contentToAdd, optional, ignoreWhitespaces })
    );

  assert(callbacks.length > 0, 'At least 1 needle is required');

  const callback =
    callbacks.length === 1
      ? callbacks[0]
      : function (content, ...args) {
          callbacks.forEach(cb => {
            content = cb.call(this, content, ...args);
          });
          return content;
        };

  if (generator) {
    assert(filePath, 'filePath is required');

    return generator.editFile(filePath, callback);
  }

  return callback;
};
