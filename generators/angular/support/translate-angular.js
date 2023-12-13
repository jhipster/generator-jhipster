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
import { passthrough } from '@yeoman/transform';
import { Minimatch } from 'minimatch';

import { createJhiTransformTranslateReplacer, createJhiTransformTranslateStringifyReplacer } from '../../languages/support/index.js';

const PLACEHOLDER_REGEX = /(?:placeholder|title)=['|"](\{\{\s?['|"]([a-zA-Z0-9.\-_]+)['|"]\s?\|\s?translate\s?\}\})['|"]/.source;

const JHI_TRANSLATE_REGEX = /(\n?\s*[a-z][a-zA-Z]*Translate="[a-zA-Z0-9 +{}'_!?.]+")/.source;
const TRANSLATE_VALUES_REGEX = /(\n?\s*\[translateValues\]="\{(?:(?!\}").)*?\}")/.source;
const TRANSLATE_REGEX = [JHI_TRANSLATE_REGEX, TRANSLATE_VALUES_REGEX].join('|');

function getTranslationValue(getWebappTranslation, key, data) {
  return getWebappTranslation(key, data) || undefined;
}

/**
 * Replace translation key with translation values
 *
 * @param {import('../generator-base.js')} generator
 * @param {string} content
 * @param {string} regexSource regular expression to find keys
 * @param {object} [options]
 * @param {number} [options.keyIndex]
 * @param {number} [options.replacementIndex]
 * @returns {string}
 */
function replaceTranslationKeysWithText(getWebappTranslation, content, regexSource, { keyIndex = 1, replacementIndex = 1, escape } = {}) {
  const regex = new RegExp(regexSource, 'g');
  const allMatches = content.matchAll(regex);
  for (const match of allMatches) {
    // match is now the next match, in array form and our key is at index 1, index 1 is replace target.
    const key = match[keyIndex];
    const target = match[replacementIndex];
    let translation = getTranslationValue(getWebappTranslation, key);
    if (escape) {
      translation = escape(translation, match);
    }
    content = content.replace(target, translation);
  }
  return content;
}

/**
 *
 * @param {import('../generator-base.js')} generator reference to the generator
 * @param {string} content html content
 * @param {string} jsKey
 * @returns string with jsKey value replaced
 */
function replaceJSTranslation(getWebappTranslation, content, jsKey) {
  return replaceTranslationKeysWithText(
    getWebappTranslation,
    content,
    `${jsKey}\\s?:\\s?['|"]([a-zA-Z0-9.\\-_]+\\.[a-zA-Z0-9.\\-_]+)['|"]`,
    {
      escape: (translation, match) => translation.replaceAll(match[0].slice(-1), `\\${match[0].slice(-1)}`),
    },
  );
}

/**
 *
 * @param {import('../generator-base.js')} generator reference to the generator
 * @param {string} content html content
 * @returns string with pageTitle replaced
 */
function replacePageTitles(getWebappTranslation, content) {
  return replaceJSTranslation(getWebappTranslation, content, 'title');
}

/**
 * @type {function(import('../generator-base.js'), string): string}
 */
function replacePlaceholders(getWebappTranslation, content) {
  return replaceTranslationKeysWithText(getWebappTranslation, content, PLACEHOLDER_REGEX, { keyIndex: 2 });
}

/**
 * Replace error code translation key with translated message
 *
 * @type {function(import('../generator-base.js'), string): string}
 */
function replaceErrorMessage(getWebappTranslation, content) {
  return replaceJSTranslation(getWebappTranslation, content, 'errorMessage');
}

/**
 * Replace and cleanup translations.
 *
 * @type {import('../generator-base.js').EditFileCallback}
 * @this {import('../generator-base.js')}
 */
export const createTranslationReplacer = (getWebappTranslation, enableTranslation) => {
  const htmlJhiTranslateReplacer = createJhiTransformTranslateReplacer(getWebappTranslation, { escapeHtml: true });
  const htmlJhiTranslateStringifyReplacer = createJhiTransformTranslateStringifyReplacer(getWebappTranslation, { escapeHtml: true });
  return function replaceAngularTranslations(content, filePath) {
    if (/\.html$/.test(filePath)) {
      if (!enableTranslation) {
        content = content.replace(new RegExp(TRANSLATE_REGEX, 'g'), '');
        content = replacePlaceholders(getWebappTranslation, content);
      }
    }
    // Translate html files and inline templates.
    if (/(:?\.html|component\.ts)$/.test(filePath)) {
      content = htmlJhiTranslateReplacer(content);
      content = htmlJhiTranslateStringifyReplacer(content);
    }
    if (!enableTranslation) {
      if (/(:?route|module)\.ts$/.test(filePath)) {
        content = replacePageTitles(getWebappTranslation, content);
      }
      if (/error\.route\.ts$/.test(filePath)) {
        content = replaceErrorMessage(getWebappTranslation, content);
      }
    }
    return content;
  };
};

const minimatch = new Minimatch('**/*{.html,.component.ts,.route.ts,.module.ts}');
export const isTranslatedAngularFile = file => minimatch.match(file.path);

const translateAngularFilesTransform = (getWebappTranslation, enableTranslation) => {
  const translate = createTranslationReplacer(getWebappTranslation, enableTranslation);
  return passthrough(file => {
    file.contents = Buffer.from(translate(file.contents.toString(), file.path));
  });
};

export default translateAngularFilesTransform;
