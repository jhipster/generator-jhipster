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
/* eslint-disable consistent-return */
const _ = require('lodash');

const BaseBlueprintGenerator = require('../generator-base-blueprint');
const { DEFAULT_PRIORITY, WRITING_PRIORITY } = require('../../lib/constants/priorities.cjs').compat;

const { writeAngularFiles, cleanupAngular } = require('./files-angular.cjs');
const { writeReactFiles, cleanupReact } = require('./files-react.cjs');
const { writeVueFiles } = require('./files-vue.cjs');
const { entityClientI18nFiles } = require('../languages/entity-files.cjs');
const { clientI18nFiles } = require('../languages/files.cjs');

const { GENERATOR_ENTITY_CLIENT } = require('../generator-list');

module.exports = class extends BaseBlueprintGenerator {
  constructor(args, options, features) {
    super(args, options, features);

    this.entity = this.options.context;
    this.application = this.options.application;
    this.jhipsterContext = this.options.jhipsterContext || this.options.context;
  }

  async _postConstruct() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints(GENERATOR_ENTITY_CLIENT, { context: this.options.context });
    }
  }

  // Public API method used by the getter and also by Blueprints
  _default() {
    return {
      async loadNativeLanguage() {
        const { entity, application } = this;
        await this._loadEntityClientTranslations(entity, application);

        const context = { ...this.application };
        await this._loadClientTranslations(context);
      },
    };
  }

  get [DEFAULT_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._default();
  }

  // Public API method used by the getter and also by Blueprints
  _writing() {
    return {
      writeAngularFiles,
      cleanupAngular,
      writeReactFiles,
      cleanupReact,
      writeVueFiles,
    };
  }

  get [WRITING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._writing();
  }

  /**
   * @experimental
   * Load entity client native translation.
   */
  async _loadEntityClientTranslations(entity, configContext = this, entityClientTranslations = entity.entityClientTranslations) {
    const { frontendAppName = this.getFrontendAppName(), nativeLanguage = 'en' } = configContext;
    if (!entityClientTranslations) {
      entity.entityClientTranslations = entity.entityClientTranslations || {};
      entityClientTranslations = entity.entityClientTranslations;
    }
    const rootTemplatesPath = this.fetchFromInstalledJHipster('languages/templates/entity');
    const translationFiles = await this.writeFiles({
      sections: entityClientI18nFiles,
      rootTemplatesPath,
      context: { ...entity, clientSrcDir: '__tmp__', frontendAppName, lang: 'en' },
    });
    if (nativeLanguage && nativeLanguage !== 'en') {
      translationFiles.push(
        ...(await this.writeFiles({
          sections: entityClientI18nFiles,
          rootTemplatesPath,
          context: { ...entity, clientSrcDir: '__tmp__', frontendAppName, lang: nativeLanguage },
        }))
      );
    }
    for (const translationFile of translationFiles) {
      _.merge(entityClientTranslations, this.readDestinationJSON(translationFile));
      delete this.env.sharedFs.get(translationFile).state;
    }

    if (!this.configOptions.entitiesClientTranslations) {
      this.configOptions.entitiesClientTranslations = {};
    }
    this.entitiesClientTranslations = this.configOptions.entitiesClientTranslations;
    _.merge(this.entitiesClientTranslations, entityClientTranslations);
  }

  /**
   * @experimental
   * Get translation value for a key.
   *
   * @param translationKey {string} - key to be translated
   * @param [data] {object} - template data in case translated value is a template
   */
  _getEntityClientTranslation(translationKey, data) {
    if (translationKey.startsWith('global.') || translationKey.startsWith('entity.')) {
      return this._getClientTranslation(translationKey, data);
    }
    const translatedValue = _.get(this.entitiesClientTranslations, translationKey);
    if (translatedValue === undefined) {
      const errorMessage = `Entity translation missing for ${translationKey}`;
      this.warning(`${errorMessage} at ${JSON.stringify(this.entityClientTranslations)}`);
      return errorMessage;
    }
    if (!data) {
      return translatedValue;
    }
    const compiledTemplate = _.template(translatedValue, { interpolate: /{{([\s\S]+?)}}/g });
    return compiledTemplate(data);
  }

  /**
   * @experimental
   * Load client native translation.
   */
  async _loadClientTranslations(configContext = this) {
    if (this.configOptions.clientTranslations) {
      this.clientTranslations = this.configOptions.clientTranslations;
      return;
    }
    const { nativeLanguage } = configContext;
    this.clientTranslations = this.configOptions.clientTranslations = {};
    const rootTemplatesPath = this.fetchFromInstalledJHipster('languages/templates/');

    // Prepare and load en translation
    const translationFiles = await this.writeFiles({
      sections: clientI18nFiles,
      rootTemplatesPath,
      context: {
        ...configContext,
        lang: 'en',
        clientSrcDir: '__tmp__',
      },
    });

    // Prepare and load native translation
    configContext.lang = configContext.nativeLanguage;
    if (nativeLanguage && nativeLanguage !== 'en') {
      translationFiles.push(
        ...(await this.writeFiles({
          sections: clientI18nFiles,
          rootTemplatesPath,
          context: {
            ...configContext,
            lang: configContext.nativeLanguage,
            clientSrcDir: '__tmp__',
          },
        }))
      );
    }
    for (const translationFile of translationFiles) {
      _.merge(this.clientTranslations, this.readDestinationJSON(translationFile));
      delete this.env.sharedFs.get(translationFile).state;
    }
  }

  /**
   * @experimental
   * Get translation value for a key.
   *
   * @param translationKey {string} - key to be translated
   * @param [data] {object} - template data in case translated value is a template
   */
  _getClientTranslation(translationKey, data) {
    let translatedValue = _.get(this.clientTranslations, translationKey);
    if (translatedValue === undefined) {
      const [last, second, ...others] = translationKey.split('.').reverse();
      translatedValue = _.get(this.clientTranslations, `${others.reverse().join('.')}['${second}.${last}']`);
    }
    if (translatedValue === undefined) {
      const errorMessage = `Translation missing for ${translationKey}`;
      this.warning(`${errorMessage} at ${JSON.stringify(this.clientTranslations)}`);
      return errorMessage;
    }
    if (!data) {
      return translatedValue;
    }
    const compiledTemplate = _.template(translatedValue, { interpolate: /{{([\s\S]+?)}}/g });
    return compiledTemplate(data);
  }
};
