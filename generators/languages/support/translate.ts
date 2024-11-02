/**
 * Copyright 2013-2024 the original author or authors from the JHipster project.
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
import type { GetWebappTranslationCallback } from '../../../lib/types/base/translation.js';

const TRANSLATE_FUNCTION_ARGS = /\(\s*'(?<key>[^']+)'(?:,\s*(?<interpolate>\{(?:(?!\}\))[\s\S])*\}))?\)/gs.source;

export const escapeHtmlTranslationValue = (translation: string) =>
  translation.replace(/'/g, '&apos;').replace(/"/g, '&quot;').replace(/@/g, '&#64;');

export const escapeTsTranslationValue = (translation: string) => translation.replace(/'/g, "\\'").replace(/\\/g, '\\\\');

export type TranslationReplaceOptions = {
  keyPattern?: string;
  interpolatePattern?: string;
  /** Wrap the replacement inside wrapTranslation chars */
  wrapTranslation?: string | string[];
  /** Escape specific chars for html */
  escapeHtml?: boolean;
  /** Apply JSON.stringify to the replacement */
  stringify?: boolean;
};

export const replaceTranslationKeysWithText = (
  getWebappTranslation: GetWebappTranslationCallback,
  body: string,
  regexp: string,
  { keyPattern, interpolatePattern, wrapTranslation, escapeHtml, stringify }: TranslationReplaceOptions = {},
) => {
  const matches = [...body.matchAll(new RegExp(regexp, 'g'))].reverse();
  if (typeof wrapTranslation === 'string') {
    wrapTranslation = [wrapTranslation, wrapTranslation];
  }
  for (const match of matches) {
    const target = match[0];

    let key = match.groups?.key;
    if (!key && keyPattern) {
      const keyMatch = new RegExp(keyPattern).exec(target);
      key = keyMatch?.groups?.key;
    }
    if (!key) {
      throw new Error(`Translation key not found for ${target}`);
    }

    let interpolate = match.groups?.interpolate;
    if (!interpolate && interpolatePattern) {
      const interpolateMatch = new RegExp(interpolatePattern).exec(target);
      interpolate = interpolateMatch?.groups?.interpolate;
    }

    let data;
    if (interpolate) {
      data = {};
      try {
        data = JSON.parse(interpolate);
      } catch {
        throw new Error(`Translation interpolations values should be a JSON, ${interpolate}`);
      }
    }

    const translation = getWebappTranslation(key, data);

    let replacement = translation;
    if (!replacement) {
      replacement = wrapTranslation ? `${wrapTranslation[0]}${wrapTranslation[1]}` : '';
    } else if (wrapTranslation) {
      replacement = `${wrapTranslation[0]}${translation}${wrapTranslation[1]}`;
    } else if (escapeHtml) {
      // Escape specific chars
      replacement = escapeHtmlTranslationValue(replacement);
    } else if (stringify) {
      replacement = JSON.stringify(replacement);
    }
    body = `${body.slice(0, match.index)}${replacement}${body.slice(match.index + target.length)}`;
  }
  return body;
};

export const createJhiTransformTranslateReplacer =
  (getWebappTranslation: GetWebappTranslationCallback, translateOptions?: TranslationReplaceOptions) => (body: string) =>
    replaceTranslationKeysWithText(getWebappTranslation, body, `__jhiTransformTranslate__${TRANSLATE_FUNCTION_ARGS}`, translateOptions);

export const createJhiTransformTranslateStringifyReplacer = (getWebappTranslation: GetWebappTranslationCallback) => (body: string) =>
  replaceTranslationKeysWithText(getWebappTranslation, body, `__jhiTransformTranslateStringify__${TRANSLATE_FUNCTION_ARGS}`, {
    stringify: true,
  });

export type JHITranslateConverterOptions = {
  filePath: string;
  /** Translation type */
  type: string;
  /** Translation key */
  key: string;
  /** Translation interpolation data */
  interpolate: string;
  /** Parse translation interpolation data */
  parsedInterpolate: Record<string, string> | undefined;
  /** Closing tag before the matched string */
  prefix: string;
  /** Opening tag after the matched string */
  suffix: string;
};

export type JHITranslateConverter = (opts: JHITranslateConverterOptions) => string;

export const replaceTranslateContents = (body: string, filePath: string, regexp: string, converter: JHITranslateConverter) => {
  const matches = [...body.matchAll(new RegExp(regexp, 'g'))].reverse();
  for (const match of matches) {
    const target = match[0];
    const { key, interpolate, type, prefix = '', suffix = '' } = match.groups ?? {};

    if (!type) {
      throw new Error(`Translation type not found for ${target}`);
    }
    if (!key) {
      throw new Error(`Translation key not found for ${target}`);
    }

    let parsedInterpolate: Record<string, string> | undefined;
    if (interpolate) {
      parsedInterpolate = {};
      try {
        parsedInterpolate = JSON.parse(interpolate);
      } catch {
        throw new Error(`Translation interpolations values should be a JSON, ${interpolate}`);
      }
    }

    body = `${body.slice(0, match.index)}${converter({ filePath, key, interpolate, parsedInterpolate, type, prefix, suffix })}${body.slice(match.index + target.length)}`;
  }
  return body;
};

export type JHITranslateReplacerOptions = {
  /** Allows a before part to be included in replacement */
  prefixPattern?: string;
  /** Allows an after part to be included in replacement */
  suffixPattern?: string;
};

export const createJhiTranslateReplacer =
  (converter: JHITranslateConverter, { prefixPattern = '', suffixPattern = '' }: JHITranslateReplacerOptions = {}) =>
  (body: string, filePath: string) =>
    replaceTranslateContents(
      body,
      filePath,
      `${prefixPattern ? `(?<prefix>(${prefixPattern}))?` : ''}__jhiTranslate(?<type>(\\w+))__${TRANSLATE_FUNCTION_ARGS}${suffixPattern ? `(?<suffix>(${suffixPattern}))?` : ''}`,
      converter,
    );
