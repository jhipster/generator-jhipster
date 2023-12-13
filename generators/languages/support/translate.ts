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

const TRANSLATE_FUNCTION_ARGS = /\(\s*'(?<key>[^']+)'(?:,\s*(?<interpolate>\{(?:(?!\}\))[\s\S])*\}))?\)/gs.source;

function getTranslationValue(getWebappTranslation, key, data) {
  return getWebappTranslation(key, data) || undefined;
}

export type TranslationReplaceOptions = {
  keyPattern?: string;
  interpolatePattern?: string;
  wrapTranslation?: string | string[];
  escapeHtml?: boolean;
  stringify?: boolean;
};

export const replaceTranslationKeysWithText = (
  getWebappTranslation,
  body: string,
  regexp: string,
  { keyPattern, interpolatePattern, wrapTranslation, escapeHtml, stringify }: TranslationReplaceOptions = {},
) => {
  const matches = body.matchAll(new RegExp(regexp, 'g'));
  if (typeof wrapTranslation === 'string') {
    wrapTranslation = [wrapTranslation, wrapTranslation];
  }
  for (const match of matches) {
    const target = match[0];

    let key = match?.groups?.key;
    if (!key && keyPattern) {
      const keyMatch = target.match(new RegExp(keyPattern));
      key = keyMatch?.groups?.key;
    }
    if (!key) {
      throw new Error(`Translation key not found for ${target}`);
    }

    let interpolate = match.groups && match.groups.interpolate;
    if (!interpolate && interpolatePattern) {
      const interpolateMatch = target.match(new RegExp(interpolatePattern));
      interpolate = interpolateMatch?.groups?.interpolate;
    }

    let data;
    if (interpolate) {
      data = {};
      try {
        const interpolateValues = JSON.parse(interpolate);
        for (const [field, value] of Object.entries(interpolateValues)) {
          data[field] = value;
        }
      } catch {
        throw new Error(`Translation interpolations values should be a JSON, ${interpolate}`);
      }
    }

    const translation = getTranslationValue(getWebappTranslation, key, data);

    let replacement = translation;
    if (!replacement) {
      replacement = wrapTranslation ? `${wrapTranslation[0]}${wrapTranslation[1]}` : '';
    } else if (wrapTranslation) {
      replacement = `${wrapTranslation[0]}${translation}${wrapTranslation[1]}`;
    } else if (escapeHtml) {
      // Escape specific chars
      replacement = replacement.replace(/'/g, '&apos;').replace(/"/g, '&quot;').replace(/@/g, '&#64;');
    } else if (stringify) {
      replacement = JSON.stringify(replacement);
    }
    body = body.replace(target, replacement);
  }
  return body;
};

export const createJhiTransformTranslateReplacer = (getWebappTranslation, translateOptions?: TranslationReplaceOptions) => (body: string) =>
  replaceTranslationKeysWithText(getWebappTranslation, body, `__jhiTransformTranslate__${TRANSLATE_FUNCTION_ARGS}`, translateOptions);

export const createJhiTransformTranslateStringifyReplacer = getWebappTranslation => (body: string) =>
  replaceTranslationKeysWithText(getWebappTranslation, body, `__jhiTransformTranslateStringify__${TRANSLATE_FUNCTION_ARGS}`, {
    stringify: true,
  });
