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
import { inspect } from 'node:util';
import { defaultsDeep, get, merge, template } from 'lodash-es';
import { transform } from '@yeoman/transform';
import { Minimatch } from 'minimatch';

export const createTranslationsFilter = ({ clientSrcDir, nativeLanguage, fallbackLanguage }) => {
  const pattern =
    !fallbackLanguage || nativeLanguage === fallbackLanguage
      ? `**/${clientSrcDir}i18n/${nativeLanguage}/*.json`
      : `**/${clientSrcDir}i18n/{${nativeLanguage},${fallbackLanguage}}/*.json`;
  const minimatch = new Minimatch(pattern);
  return filePath => minimatch.match(filePath);
};

export const createTranslationsFileFilter = opts => {
  const filter = createTranslationsFilter(opts);
  return file => filter(file.path);
};

export default class TranslationData {
  translations;
  generator;

  constructor({ generator, translations }) {
    this.generator = generator;
    this.translations = translations;
  }

  loadFromStreamTransform({ enableTranslation, clientSrcDir, nativeLanguage, fallbackLanguage = 'en' }) {
    const filter = createTranslationsFileFilter({ clientSrcDir, nativeLanguage, fallbackLanguage });
    const minimatchNative = new Minimatch(`**/${clientSrcDir}i18n/${nativeLanguage}/*.json`);
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

  mergeTranslation(translation, fallback) {
    if (fallback) {
      defaultsDeep(this.translations, translation);
    } else {
      merge(this.translations, translation);
    }
  }

  /**
   * Get translation value for a key.
   *
   * @param translationKey {string} - key to be translated
   * @param [data] {object} - template data in case translated value is a template
   */
  getClientTranslation(translationKey, data) {
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
