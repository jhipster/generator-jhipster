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
import { inspect } from 'node:util';

import { transform } from '@yeoman/transform';
import { defaultsDeep, get, merge, template } from 'lodash-es';
import type { MemFsEditorFile } from 'mem-fs-editor';
import { Minimatch } from 'minimatch';

import type CoreGenerator from '../base-core/generator.ts';

export const createTranslationsFilter = ({
  i18nDir,
  nativeLanguage,
  fallbackLanguage,
}: {
  i18nDir: string;
  nativeLanguage: string;
  fallbackLanguage?: string;
}) => {
  const pattern =
    !fallbackLanguage || nativeLanguage === fallbackLanguage
      ? `**/${i18nDir}${nativeLanguage}/*.json`
      : `**/${i18nDir}{${nativeLanguage},${fallbackLanguage}}/*.json`;
  const minimatch = new Minimatch(pattern);
  return (filePath: string): boolean => minimatch.match(filePath);
};

export const createTranslationsFileFilter = (opts: Parameters<typeof createTranslationsFilter>[0]) => {
  const filter = createTranslationsFilter(opts);
  return (file: MemFsEditorFile): boolean => filter(file.path);
};

export default class TranslationData {
  translations: Record<string, any>;
  generator: CoreGenerator;

  constructor({ generator, translations }: { generator: CoreGenerator; translations: Record<string, any> }) {
    if (!generator) {
      throw new Error('Generator is required');
    }
    this.generator = generator;
    this.translations = translations;
  }

  loadFromStreamTransform({
    enableTranslation,
    i18nDir,
    nativeLanguage,
    fallbackLanguage = 'en',
  }: {
    enableTranslation: boolean;
    i18nDir: string;
    nativeLanguage: string;
    fallbackLanguage?: string;
  }) {
    const filter = createTranslationsFileFilter({ i18nDir, nativeLanguage, fallbackLanguage });
    const minimatchNative = new Minimatch(`**/${i18nDir}${nativeLanguage}/*.json`);
    return transform(file => {
      if (filter(file) && file.contents) {
        const contents = JSON.parse(file.contents.toString());
        this.mergeTranslation(contents, !minimatchNative.match(file.path));
        if (!enableTranslation) {
          return undefined;
        }
      }
      return file;
    });
  }

  mergeTranslation(translation: Record<string, any>, fallback: boolean) {
    if (fallback) {
      defaultsDeep(this.translations, translation);
    } else {
      merge(this.translations, translation);
    }
  }

  /**
   * Get translation value for a key.
   */
  getClientTranslation(translationKey: string, data?: Record<string, any>) {
    let translatedValue = get(this.translations, translationKey);
    if (translatedValue === undefined) {
      const [last, second, third, ...others] = translationKey.split('.').reverse();
      translatedValue =
        get(this.translations, `${[...others.reverse(), third].join('.')}['${second}.${last}']`) ??
        get(this.translations, `${others.reverse().join('.')}['${third}.${second}.${last}']`);
    }
    if (translatedValue === undefined) {
      const errorMessage = `Translation missing for ${translationKey}`;
      this.generator.log.warn(errorMessage);
      this.generator.log.debug(`${errorMessage} at ${inspect(this.translations, { depth: null })}`);
      return errorMessage;
    }
    if (!data) {
      return translatedValue;
    }
    /* workaround custom translation for UserManagement */
    if (translatedValue.includes('{{ login }}') && !data.login) {
      data.login = data.id;
    }
    const compiledTemplate = template(translatedValue, { interpolate: /{{([\s\S]+?)}}/g });
    return compiledTemplate(data);
  }
}
