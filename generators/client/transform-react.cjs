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
const TRANSLATE_IMPORT_1 = /import { ?[T|t]ranslate(?:, ?[T|t]ranslate)? ?} from 'react-jhipster';?/.source; // Translate imports
const TRANSLATE_IMPORT_2 = / *[T|t]ranslate,|, ?[T|t]ranslate/.source; // Translate import
const TRANSLATE_IMPORT = [TRANSLATE_IMPORT_1, TRANSLATE_IMPORT_2].join('|');

const TRANSLATE_FUNCTION = /translate\(\s*'(?<key>[^']+)'(?:,\s*(?<interpolate>\{[^}]*\}))?\s*\)/g.source;

const CONTENT_TYPE_ATTRIBUTE = 'contentKey=(?:"(?<key>[^"]+)"|\\{[^\\}]+\\})\\s*';
const INTERPOLATE_ATTRIBUTE = 'interpolate=\\{(?<interpolate>\\{[^\\}]+\\})\\}\\s*';
const COMPONENT_ATTRIBUTE = 'component="(?<component>[^"]+)"\\s*';
const TRANSLATE_TAG = `<Translate\\s*(?:(?:${COMPONENT_ATTRIBUTE}|${INTERPOLATE_ATTRIBUTE}|${CONTENT_TYPE_ATTRIBUTE})+)>(?<translation>[\\s\\S]*?)<\\/Translate>`;

function getTranslationValue(generator, key, data) {
  if (generator._getEntityClientTranslation) {
    return generator._getEntityClientTranslation(key, data);
  }
  return (generator._getClientTranslation && generator._getClientTranslation(key, data)) || undefined;
}

const replaceTranslationKeysWithText = (generator, body, regexp, { keyPattern, interpolatePattern, wrapTranslation, escapeHtml } = {}) => {
  const matches = body.matchAll(new RegExp(regexp, 'g'));
  if (typeof wrapTranslation === 'string') {
    wrapTranslation = [wrapTranslation, wrapTranslation];
  }
  for (const match of matches) {
    const target = match[0];

    let key = match.groups && match.groups.key;
    if (!key && keyPattern) {
      const keyMatch = target.match(new RegExp(keyPattern));
      key = keyMatch && keyMatch.groups && keyMatch.groups.key;
    }
    if (!key) {
      throw new Error(`Translation key not found for ${target}`);
    }

    let interpolate = match.groups && match.groups.interpolate;
    if (!interpolate && interpolatePattern) {
      const interpolateMatch = target.match(new RegExp(interpolatePattern));
      interpolate = interpolateMatch && interpolateMatch.groups && interpolateMatch.groups.interpolate;
    }

    let data;
    if (interpolate) {
      const interpolateMatches = interpolate.matchAll(/(?<field>[^{\s:,}]+)(?::\s*(?<value>[^,}]+))?/g);
      data = {};
      for (const interpolateMatch of interpolateMatches) {
        const field = interpolateMatch.groups.field;
        let value = interpolateMatch.groups.value;
        if (value === undefined) {
          value = key;
        }
        value = value.trim();
        if (/^\d+$/.test(value)) {
          // convert integer
          value = parseInt(value, 10);
        } else if (/^'.*'$/.test(value) || /^".*"$/.test(value)) {
          // extract string value
          value = value.substring(1, value.length - 2);
        } else {
          // wrap expression
          value = `{${value}}`;
        }
        data[field] = value;
      }
    }

    const translation = getTranslationValue(generator, key, data);

    let replacement = translation;
    if (!replacement) {
      replacement = wrapTranslation ? `${wrapTranslation[0]}${wrapTranslation[1]}` : '';
    } else if (wrapTranslation) {
      replacement = `${wrapTranslation[0]}${translation}${wrapTranslation[1]}`;
    } else if (escapeHtml) {
      // Escape specific chars
      replacement = replacement.replace(/'/g, '&apos;').replace(/"/g, '&quot;');
    }
    body = body.replace(target, replacement);
  }
  return body;
};

/**
 * Replace and cleanup translations.
 *
 * @type {import('../generator-base.js').EditFileCallback}
 * @this {import('../generator-base.js')}
 */
function replaceReactTranslations(body, filePath) {
  if (this.enableTranslation || !this._getClientTranslation) {
    return body;
  }
  if (/\.tsx$/.test(filePath)) {
    body = body.replace(new RegExp(TRANSLATE_IMPORT, 'g'), '');
    body = replaceTranslationKeysWithText(this, body, `\\{\\s*${TRANSLATE_FUNCTION}\\s*\\}`, { wrapTranslation: '"' });
    body = replaceTranslationKeysWithText(this, body, TRANSLATE_FUNCTION, { wrapTranslation: '"' });
    body = replaceTranslationKeysWithText(this, body, TRANSLATE_TAG, {
      keyPattern: CONTENT_TYPE_ATTRIBUTE,
      interpolatePattern: INTERPOLATE_ATTRIBUTE,
      escapeHtml: true,
    });
  }
  return body;
}

module.exports = {
  replaceReactTranslations,
};
