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
const { PREPARING_PRIORITY, DEFAULT_PRIORITY, WRITING_PRIORITY, POST_WRITING_PRIORITY } =
  require('../../lib/constants/priorities.cjs').compat;

const { writeFiles, addToMenu } = require('./files');
const { entityClientI18nFiles } = require('../entity-i18n/files');
const { clientI18nFiles } = require('../languages/files');

const utils = require('../utils');
const {
  SUPPORTED_CLIENT_FRAMEWORKS: { ANGULAR, REACT },
} = require('../generator-constants');
const { GENERATOR_ENTITY_CLIENT } = require('../generator-list');
const { POSTGRESQL, MARIADB, MYSQL } = require('../../jdl/jhipster/database-types');

module.exports = class extends BaseBlueprintGenerator {
  constructor(args, options, features) {
    super(args, options, features);

    this.entity = this.options.context;
    this.jhipsterContext = this.options.jhipsterContext || this.options.context;
  }

  async _postConstruct() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints(GENERATOR_ENTITY_CLIENT, { context: this.options.context });
    }
  }

  // Public API method used by the getter and also by Blueprints
  _preparing() {
    return {
      async prepareReact() {
        const entity = this.entity;
        if (!entity.clientFrameworkReact) return;
        entity.entityReactState = entity.applicationTypeMonolith
          ? entity.entityInstance
          : `${entity.lowercaseBaseName}.${entity.entityInstance}`;
      },
    };
  }

  get [PREPARING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._preparing();
  }

  // Public API method used by the getter and also by Blueprints
  _default() {
    return {
      ...super._missingPreDefault(),

      async loadNativeLanguage() {
        await this._loadEntityClientTranslations(this.entity, this.jhipsterConfig);

        const context = {};
        this.loadAppConfig(undefined, context);
        this.loadDerivedAppConfig(context);
        this.loadClientConfig(undefined, context);
        this.loadDerivedClientConfig(context);
        this.loadServerConfig(undefined, context);
        this.loadPlatformConfig(undefined, context);
        this.loadTranslationConfig(undefined, context);
        await this._loadClientTranslations(context);
      },

      loadConfigIntoGenerator() {
        utils.copyObjectProps(this, this.entity);
      },

      setup() {
        if (!this.embedded) {
          this.tsKeyType = this.getTypescriptKeyType(this.primaryKey.type);
        }
      },

      setupCypress() {
        // Blueprints may disable cypress relationships by setting to false.
        this.cypressBootstrapEntities = true;

        const entity = this.entity;
        // Reactive with some r2dbc databases doesn't allow insertion without data.
        this.workaroundEntityCannotBeEmpty = entity.reactive && [POSTGRESQL, MYSQL, MARIADB].includes(entity.prodDatabaseType);
        // Reactive with MariaDB doesn't allow null value at Instant fields.
        this.workaroundInstantReactiveMariaDB = entity.reactive && entity.prodDatabaseType === MARIADB;
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
      cleanup() {
        if (this.isJhipsterVersionLessThan('7.0.0-beta.0') && this.jhipsterConfig.clientFramework === ANGULAR) {
          this.removeFile(`${this.CLIENT_MAIN_SRC_DIR}/app/entities/${this.entityFolderName}/${this.entityFileName}.route.ts`);
          this.removeFile(`${this.CLIENT_MAIN_SRC_DIR}/app/entities/${this.entityFolderName}/${this.entityFileName}.component.ts`);
          this.removeFile(`${this.CLIENT_MAIN_SRC_DIR}/app/entities/${this.entityFolderName}/${this.entityFileName}.component.html`);
          this.removeFile(`${this.CLIENT_MAIN_SRC_DIR}/app/entities/${this.entityFolderName}/${this.entityFileName}-detail.component.ts`);
          this.removeFile(`${this.CLIENT_MAIN_SRC_DIR}/app/entities/${this.entityFolderName}/${this.entityFileName}-detail.component.html`);
          this.removeFile(
            `${this.CLIENT_MAIN_SRC_DIR}/app/entities/${this.entityFolderName}/${this.entityFileName}-delete-dialog.component.ts`
          );
          this.removeFile(
            `${this.CLIENT_MAIN_SRC_DIR}/app/entities/${this.entityFolderName}/${this.entityFileName}-delete-dialog.component.html`
          );
          this.removeFile(`${this.CLIENT_MAIN_SRC_DIR}/app/entities/${this.entityFolderName}/${this.entityFileName}-update.component.ts`);
          this.removeFile(`${this.CLIENT_MAIN_SRC_DIR}/app/entities/${this.entityFolderName}/${this.entityFileName}-update.component.html`);
          this.removeFile(`${this.CLIENT_MAIN_SRC_DIR}/app/shared/model/${this.entityModelFileName}.model.ts`);
          this.fields.forEach(field => {
            if (field.fieldIsEnum === true) {
              const { enumFileName } = field;
              this.removeFile(`${this.CLIENT_MAIN_SRC_DIR}/app/shared/model/enumerations/${enumFileName}.model.ts`);
            }
          });
          this.removeFile(
            `${this.CLIENT_MAIN_SRC_DIR}/app/entities/${this.entityFolderName}/${this.entityFileName}-routing-resolve.service.ts`
          );
          this.removeFile(`${this.CLIENT_MAIN_SRC_DIR}/app/entities/${this.entityFolderName}/${this.entityFileName}-routing.module.ts`);
          this.removeFile(`${this.CLIENT_MAIN_SRC_DIR}/app/entities/${this.entityFolderName}/${this.entityFileName}.service.ts`);
          this.removeFile(`${this.CLIENT_MAIN_SRC_DIR}/app/entities/${this.entityFolderName}/${this.entityFileName}.service.spec.ts`);
          this.removeFile(
            `${this.CLIENT_TEST_SRC_DIR}/spec/app/entities/${this.entityFolderName}/${this.entityFileName}.component.spec.ts`
          );
          this.removeFile(
            `${this.CLIENT_TEST_SRC_DIR}/spec/app/entities/${this.entityFolderName}/${this.entityFileName}-detail.component.spec.ts`
          );
          this.removeFile(
            `${this.CLIENT_TEST_SRC_DIR}/spec/app/entities/${this.entityFolderName}/${this.entityFileName}-delete-dialog.component.spec.ts`
          );
          this.removeFile(
            `${this.CLIENT_TEST_SRC_DIR}/spec/app/entities/${this.entityFolderName}/${this.entityFileName}-update.component.spec.ts`
          );
          this.removeFile(`${this.CLIENT_TEST_SRC_DIR}/spec/app/entities/${this.entityFolderName}/${this.entityFileName}.service.spec.ts`);
        }
        if (this.isJhipsterVersionLessThan('7.0.0-beta.1') && this.jhipsterConfig.clientFramework === REACT) {
          this.removeFile(`${this.CLIENT_TEST_SRC_DIR}spec/app/entities/${this.entityFolderName}/${this.entityFileName}-reducer.spec.ts`);
        }
      },
      ...writeFiles(),
      ...super._missingPostWriting(),
    };
  }

  get [WRITING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._writing();
  }

  // Public API method used by the getter and also by Blueprints
  _postWriting() {
    return {
      addToMenu() {
        if (this.skipClient) return undefined;
        return addToMenu.call(this);
      },
    };
  }

  get [POST_WRITING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._postWriting();
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
    const rootTemplatesPath = this.fetchFromInstalledJHipster('entity-i18n/templates/');
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
