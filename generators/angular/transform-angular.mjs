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
function replaceTranslationKeysWithText(getWebappTranslation, content, regexSource, { keyIndex = 1, replacementIndex = 1 } = {}) {
  const regex = new RegExp(regexSource, 'g');
  let match = regex.exec(content);
  while (match !== null) {
    // match is now the next match, in array form and our key is at index 1, index 1 is replace target.
    const key = match[keyIndex];
    const target = match[replacementIndex];
    const translation = getTranslationValue(getWebappTranslation, key);
    content = content.replace(target, translation);
    match = regex.exec(content);
  }

  return content;
}

/**
 *
 * @param {import('../generator-base.js')} generator reference to the generator
 * @param {string} content html content
 * @param {string} jsKey
 * @returns string with pageTitle replaced
 */
function replaceJSTranslation(getWebappTranslation, content, jsKey) {
  return replaceTranslationKeysWithText(getWebappTranslation, content, `${jsKey}\\s?:\\s?['|"]([a-zA-Z0-9.\\-_]+)['|"]`);
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
// eslint-disable-next-line import/prefer-default-export
export const createTranslationReplacer = getWebappTranslation =>
  function replaceAngularTranslations(content, filePath) {
    if (/\.html$/.test(filePath)) {
      content = content.replace(new RegExp(TRANSLATE_REGEX, 'g'), '');
      content = replacePlaceholders(getWebappTranslation, content);
    }
    if (/(:?route|module)\.ts$/.test(filePath)) {
      content = replacePageTitles(getWebappTranslation, content);
    }
    if (/error\.route\.ts$/.test(filePath)) {
      content = replaceErrorMessage(getWebappTranslation, content);
    }
    return content;
  };
