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

const TRANSLATIONS_ATTRIBUTES = ['v-text', 'v-bind:placeholder', 'v-html', 'v-bind:title', 'v-bind:label', 'v-bind:value', 'v-bind:html']
  .map(s => `(?:${s}="\\$t\\(.*?\\)")`)
  .join('|');

/**
 * Replace and cleanup vue translations.
 *
 * @type {import('../generator-base.js').EditFileCallback}
 * @this {import('../generator-base.js')}
 */
// eslint-disable-next-line import/prefer-default-export
export function replaceVueTranslations(body, filePath) {
  if (/\.vue$/.test(filePath)) {
    body = body.replace(new RegExp(`[\\s\\n]*(?:${TRANSLATIONS_ATTRIBUTES})`, 'g'), '');
  }
  return body;
}
