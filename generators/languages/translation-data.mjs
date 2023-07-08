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
import { inspect } from 'node:util';
import _ from 'lodash';
import { entityClientI18nFiles } from './entity-files.mjs';
import { clientI18nFiles } from './files.mjs';

const { get } = _;

export default class TranslationData {
  constructor(generator, control) {
    this.generator = generator;
    this.control = control;

    if (!this.control.clientTranslations) {
      this.control.clientTranslations = {};
    }

    this.translations = this.control.clientTranslations;
    this.env = this.generator.env;
  }

  /**
   * Load entity client native translation.
   */
  async loadEntityClientTranslations(application, entity) {
    const { frontendAppName, nativeLanguage = 'en' } = application;
    const rootTemplatesPath = this.generator.fetchFromInstalledJHipster('languages/templates');
    const translationFiles = await this.generator.writeFiles({
      sections: entityClientI18nFiles,
      rootTemplatesPath,
      context: { ...entity, clientSrcDir: '__tmp__', frontendAppName, lang: 'en' },
    });

    // Add entities to menu translation.
    this.translations.global.menu.entities[entity.entityTranslationKeyMenu] = entity.entityClassHumanized;

    if (nativeLanguage && nativeLanguage !== 'en') {
      translationFiles.push(
        ...(await this.generator.writeFiles({
          sections: entityClientI18nFiles,
          rootTemplatesPath,
          context: { ...entity, clientSrcDir: '__tmp__', frontendAppName, lang: nativeLanguage },
        }))
      );
    }
    for (const translationFile of translationFiles) {
      _.merge(this.translations, this.generator.readDestinationJSON(translationFile));
      delete this.env.sharedFs.get(translationFile).state;
    }
  }

  /**
   * Load client native translation.
   */
  async loadClientTranslations(application) {
    const { nativeLanguage } = application;
    const rootTemplatesPath = this.generator.fetchFromInstalledJHipster('languages/templates/');

    // Prepare and load en translation
    const translationFiles = await this.generator.writeFiles({
      sections: clientI18nFiles,
      rootTemplatesPath,
      context: {
        ...application,
        lang: 'en',
        clientSrcDir: '__tmp__',
      },
    });

    // Prepare and load native translation
    if (nativeLanguage && nativeLanguage !== 'en') {
      translationFiles.push(
        ...(await this.generator.writeFiles({
          sections: clientI18nFiles,
          rootTemplatesPath,
          context: {
            ...application,
            lang: application.nativeLanguage,
            clientSrcDir: '__tmp__',
          },
        }))
      );
    }

    for (const translationFile of translationFiles) {
      _.merge(this.translations, this.generator.readDestinationJSON(translationFile));
      delete this.env.sharedFs.get(translationFile).state;
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
    const compiledTemplate = _.template(translatedValue, { interpolate: /{{([\s\S]+?)}}/g });
    return compiledTemplate(data);
  }
}
