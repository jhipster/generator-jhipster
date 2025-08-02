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
import { extname } from 'node:path';

import { passthrough } from '@yeoman/transform';
import type { MemFsEditorFile } from 'mem-fs-editor';
import { Minimatch } from 'minimatch';

import type { GetWebappTranslationCallback } from '../../client/translation.js';
import {
  type JHITranslateConverterOptions,
  createJhiTransformTranslateReplacer,
  createJhiTransformTranslateStringifyReplacer,
  createJhiTranslateReplacer,
  escapeHtmlTranslationValue,
  escapeTsTranslationValue,
} from '../../languages/support/index.ts';

const PLACEHOLDER_REGEX = /(?:placeholder|title)=['|"](\{\{\s?['|"]([a-zA-Z0-9.\-_]+)['|"]\s?\|\s?translate\s?\}\})['|"]/.source;

const JHI_TRANSLATE_REGEX = /(\n?\s*[a-z][a-zA-Z]*Translate="[a-zA-Z0-9 +{}'_!?.]+")/.source;
const TRANSLATE_VALUES_REGEX = /(\n?\s*\[translateValues\]="\{(?:(?!\}").)*?\}")/.source;
const TRANSLATE_REGEX = [JHI_TRANSLATE_REGEX, TRANSLATE_VALUES_REGEX].join('|');

export type ReplacerOptions = { jhiPrefix: string; enableTranslation: boolean };

/**
 * Replace translation key with translation values
 *
 * @param {import('../generator-base.js')} generator
 * @param getWebappTranslation
 * @param {string} content
 * @param {string} regexSource regular expression to find keys
 * @returns {string}
 */
function replaceTranslationKeysWithText(
  getWebappTranslation: GetWebappTranslationCallback,
  content: string,
  regexSource: string,
  {
    keyIndex = 1,
    replacementIndex = 1,
    escape,
  }: { keyIndex?: number; replacementIndex?: number; escape?: (str: string, match: any) => string } = {},
) {
  const regex = new RegExp(regexSource, 'g');
  const allMatches = content.matchAll(regex);
  for (const match of allMatches) {
    // match is now the next match, in array form and our key is at index 1, index 1 is replace target.
    const key = match[keyIndex];
    const target = match[replacementIndex];
    let translation = getWebappTranslation(key);
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
function replaceJSTranslation(getWebappTranslation: GetWebappTranslationCallback, content: string, jsKey: string) {
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
function replacePageTitles(getWebappTranslation: GetWebappTranslationCallback, content: string) {
  return replaceJSTranslation(getWebappTranslation, content, 'title');
}

function replacePlaceholders(getWebappTranslation: GetWebappTranslationCallback, content: string) {
  return replaceTranslationKeysWithText(getWebappTranslation, content, PLACEHOLDER_REGEX, { keyIndex: 2 });
}

/**
 * Replace error code translation key with translated message
 */
function replaceErrorMessage(getWebappTranslation: GetWebappTranslationCallback, content: string) {
  return replaceJSTranslation(getWebappTranslation, content, 'errorMessage');
}

/**
 * Creates a `jhiTranslate` attribute with optional translateValues.
 * Or the translation value if translation is disabled.
 */
const tagTranslation = (
  getWebappTranslation: GetWebappTranslationCallback,
  { enableTranslation, jhiPrefix }: ReplacerOptions,
  { key, parsedInterpolate, prefix, suffix }: JHITranslateConverterOptions,
) => {
  const translatedValueInterpolate = parsedInterpolate
    ? Object.fromEntries(Object.entries(parsedInterpolate).map(([key, value]) => [key, `{{ ${value} }}`]))
    : undefined;
  const translatedValue = escapeHtmlTranslationValue(getWebappTranslation(key, translatedValueInterpolate));

  if (enableTranslation) {
    const translateValuesAttr = parsedInterpolate
      ? ` [translateValues]="{ ${Object.entries(parsedInterpolate)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ')} }"`
      : '';
    return ` ${jhiPrefix}Translate="${key}"${translateValuesAttr}${prefix}${translatedValue}${suffix}`;
  }

  return `${prefix}${translatedValue}${suffix}`;
};

/**
 * Creates a `jhiTranslate` attribute with translateValues.
 * Or the translation value if translation is disabled.
 */
const validationTagTranslation = (
  getWebappTranslation: GetWebappTranslationCallback,
  { enableTranslation, jhiPrefix }: ReplacerOptions,
  { key, parsedInterpolate, prefix, suffix }: JHITranslateConverterOptions,
) => {
  if (!parsedInterpolate || Object.keys(parsedInterpolate).length === 0) {
    throw new Error(`No interpolation values found for translation key ${key}, use __jhiTranslateTag__ instead.`);
  }
  const translatedValue = escapeHtmlTranslationValue(getWebappTranslation(key, parsedInterpolate));

  if (enableTranslation) {
    const translateValuesAttr = parsedInterpolate
      ? ` [translateValues]="{ ${Object.entries(parsedInterpolate)
          .map(([key, value]) => `${key}: '${value}'`)
          .join(', ')} }"`
      : '';
    return ` ${jhiPrefix}Translate="${key}"${translateValuesAttr}${prefix}${translatedValue}${suffix}`;
  }

  return `${prefix}${translatedValue}${suffix}`;
};

/**
 * Creates a `jhiTranslate` attribute with optional translateValues.
 * Or the translation value if translation is disabled.
 */
const tagPipeTranslation = (
  getWebappTranslation: GetWebappTranslationCallback,
  { enableTranslation, jhiPrefix }: ReplacerOptions,
  { key, parsedInterpolate, prefix, suffix }: JHITranslateConverterOptions,
) => {
  if (!parsedInterpolate || Object.keys(parsedInterpolate).length === 0) {
    throw new Error(`No interpolation values found for translation key ${key}, use __jhiTranslateTag__ instead.`);
  }
  const translatedValueInterpolate = Object.fromEntries(
    Object.entries(parsedInterpolate).map(([key, value]) => [key, getWebappTranslation(value)]),
  );
  const translatedValue = escapeHtmlTranslationValue(getWebappTranslation(key, translatedValueInterpolate));
  if (enableTranslation) {
    const translateValuesAttr = ` [translateValues]="{ ${Object.entries(parsedInterpolate)
      .map(([key, value]) => `${key}: ('${value}' | translate)`)
      .join(', ')} }"`;
    return ` ${jhiPrefix}Translate="${key}"${translateValuesAttr}${prefix}${translatedValue}${suffix}`;
  }

  return `${prefix}${translatedValue}${suffix}`;
};

/**
 * Creates a `jhiTranslate` attribute with optional translateValues.
 * Or the translation value if translation is disabled.
 */
const tagEnumTranslation = (
  getWebappTranslation: GetWebappTranslationCallback,
  { enableTranslation, jhiPrefix }: ReplacerOptions,
  { key, parsedInterpolate, prefix, suffix }: JHITranslateConverterOptions,
) => {
  if (!parsedInterpolate?.value) {
    throw new Error(`Value is required for TagEnum ${key}.`);
  }
  const { value, fallback } = parsedInterpolate;
  const translatedValue = `{{ ${JSON.stringify(getWebappTranslation(key))}[${value}]${fallback ? ` || ${fallback}` : ''} }}`;
  if (enableTranslation) {
    return ` [${jhiPrefix}Translate]="'${key}.' + (${parsedInterpolate?.value})"${prefix}${translatedValue}${suffix}`;
  }

  return `${prefix}${translatedValue}${suffix}`;
};

/**
 * Creates a `translate` pipe.
 * Or the translation value if translation is disabled.
 */
const pipeTranslation = (
  getWebappTranslation: GetWebappTranslationCallback,
  { enableTranslation }: ReplacerOptions,
  { key, prefix, suffix }: JHITranslateConverterOptions,
) => {
  if (enableTranslation) {
    return `${prefix}{{ '${key}' | translate }}${suffix}`;
  }

  return `${prefix}${escapeHtmlTranslationValue(getWebappTranslation(key))}${suffix}`;
};

/**
 * Get translation value.
 */
const valueTranslation = (
  getWebappTranslation: GetWebappTranslationCallback,
  _replacerOptions: ReplacerOptions,
  { filePath, key, prefix, suffix }: JHITranslateConverterOptions,
) => {
  let translationValue = getWebappTranslation(key);
  const fileExtension = extname(filePath);
  if (fileExtension === '.html') {
    translationValue = escapeHtmlTranslationValue(translationValue);
  } else if (fileExtension === '.ts') {
    translationValue = escapeTsTranslationValue(translationValue);
  }
  return `${prefix}${translationValue}${suffix}`;
};

/**
 * Creates a `translate` pipe.
 * Or the translation value if translation is disabled.
 */
const pipeEnumTranslation = (
  getWebappTranslation: GetWebappTranslationCallback,
  { enableTranslation }: ReplacerOptions,
  { key, parsedInterpolate, prefix, suffix }: JHITranslateConverterOptions,
) => {
  if (!parsedInterpolate?.value) {
    throw new Error(`Value is required for TagEnum ${key}.`);
  }
  const { value, fallback } = parsedInterpolate;
  if (enableTranslation) {
    return `${prefix}{{ '${key}.' + ${value} | translate }}${suffix}`;
  }

  const translatedValue = `{{ ${JSON.stringify(getWebappTranslation(key))}[${value}]${fallback ? ` ?? ${fallback}` : ''} }}`;
  return `${prefix}${translatedValue}${suffix}`;
};

const replaceImplementations: Record<
  string,
  (getWebappTranslation: GetWebappTranslationCallback, replacerOpts: ReplacerOptions, translateOpts: JHITranslateConverterOptions) => string
> = {
  Tag: tagTranslation,
  TagPipe: tagPipeTranslation,
  TagEnum: tagEnumTranslation,
  ValidationTag: validationTagTranslation,
  Pipe: pipeTranslation,
  PipeEnum: pipeEnumTranslation,
  Value: valueTranslation,
};

/**
 * Replace and cleanup translations.
 *
 * @type {import('../generator-base.js').EditFileCallback}
 * @this {import('../generator-base.js')}
 */
export const createTranslationReplacer = (getWebappTranslation: GetWebappTranslationCallback, opts: ReplacerOptions | boolean) => {
  const htmlJhiTranslateReplacer = createJhiTransformTranslateReplacer(getWebappTranslation, { escapeHtml: true });
  const htmlJhiTranslateStringifyReplacer = createJhiTransformTranslateStringifyReplacer(getWebappTranslation);
  let translationReplacer: ((content: string, filePath: string) => string) | undefined;
  const enableTranslation = typeof opts === 'boolean' ? opts : opts.enableTranslation;
  if (typeof opts !== 'boolean') {
    translationReplacer = createJhiTranslateReplacer(
      optsReplacer => {
        const replacer =
          replaceImplementations[optsReplacer.type] ??
          (() => {
            throw new Error(`Translation type not supported ${optsReplacer.type}`);
          });
        return replacer(getWebappTranslation, opts, optsReplacer);
      },
      { prefixPattern: '>\\s*', suffixPattern: '\\s*<' },
    );
  }
  return function replaceAngularTranslations(content: string, filePath: string) {
    if (filePath.endsWith('.html')) {
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
    if (/(:?\.html|.ts)$/.test(filePath)) {
      content = translationReplacer ? translationReplacer?.(content, filePath) : content;
    }
    if (!enableTranslation) {
      if (/(:?route|module)\.ts$/.test(filePath)) {
        content = replacePageTitles(getWebappTranslation, content);
      }
      if (filePath.endsWith('error.route.ts')) {
        content = replaceErrorMessage(getWebappTranslation, content);
      }
    }
    return content;
  };
};

const minimatch = new Minimatch('**/*{.html,.ts}');
export const isTranslatedAngularFile = (file: MemFsEditorFile) => minimatch.match(file.path);

export const translateAngularFilesTransform = (getWebappTranslation: GetWebappTranslationCallback, opts: ReplacerOptions | boolean) => {
  const translate = createTranslationReplacer(getWebappTranslation, opts);
  return passthrough(file => {
    file.contents = Buffer.from(translate(file.contents.toString(), file.path));
  });
};
