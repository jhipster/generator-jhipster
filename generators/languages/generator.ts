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

import chalk from 'chalk';
import { padEnd } from 'lodash-es';

import { clientFrameworkTypes } from '../../lib/jhipster/index.ts';
import BaseApplicationGenerator from '../base-application/index.ts';
import { PRIORITY_NAMES } from '../base-application/priorities.ts';
import type { Config as ClientConfig } from '../client/types.ts';

import { askForLanguages, askI18n } from './prompts.ts';
import { CONTEXT_DATA_SUPPORTED_LANGUAGES } from './support/constants.ts';
import type { Language } from './support/languages.ts';
import { findLanguageForTag } from './support/languages.ts';
import type {
  Application as LanguagesApplication,
  Config as LanguagesConfig,
  Entity as LanguagesEntity,
  Options as LanguagesOptions,
  Source as LanguagesSource,
} from './types.ts';

const { NO: NO_CLIENT_FRAMEWORK, ANGULAR } = clientFrameworkTypes;

/**
 * This is the base class for a generator that generates entities.
 */
export default class LanguagesGenerator extends BaseApplicationGenerator<
  LanguagesEntity,
  LanguagesApplication<LanguagesEntity>,
  LanguagesConfig,
  LanguagesOptions,
  LanguagesSource
> {
  askForMoreLanguages!: boolean;
  askForNativeLanguage!: boolean;
  languages?: string[];
  /**
   * Languages to be generated.
   * Can be incremental or every language.
   */
  languagesToApply!: string[];
  languageCommand!: boolean;
  writeJavaLanguageFiles!: boolean;
  regenerateLanguages!: boolean;

  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnBootstrap('languages');
      await this.dependsOnBootstrap('app');
    }

    const { skipClient, clientFramework } = this.jhipsterConfigWithDefaults as ClientConfig;
    if (!skipClient && clientFramework !== NO_CLIENT_FRAMEWORK && (!this.jhipsterConfig.enableTranslation || clientFramework === ANGULAR)) {
      // We must write languages files for translation process for entities only generation.
      // Angular frontend uses translation files even if enableTranslation is enabled.
      // As side effect, with angular frontends, translation files will be written for nativeLanguage for entity only generation.
      this.setFeatures({ disableSkipPriorities: true });
    }
  }

  get supportedLanguages(): Map<string, Language> {
    return this.getContextData<Map<string, Language>>(CONTEXT_DATA_SUPPORTED_LANGUAGES);
  }

  // Public API method used by the getter and also by Blueprints
  get initializing() {
    return this.asInitializingTaskGroup({
      initializing() {
        this.languageCommand = this.options.commandName === 'languages';
      },
      languagesToApply() {
        // Validate languages passed as argument.
        // Additional languages, will not replace current ones.
        this.languagesToApply = [this.options.nativeLanguage, ...(this.languages ?? [])].filter(Boolean) as string[];
      },
      validateSupportedLanguages() {
        if (this.languagesToApply.length > 0) {
          const supportedLanguages = [...this.supportedLanguages.values()];
          const unsupportedLanguage = this.languagesToApply.find(lang => !findLanguageForTag(lang, supportedLanguages));
          if (unsupportedLanguage) {
            throw new Error(
              `Unsupported language "${unsupportedLanguage}" passed as argument to language generator.` +
                `\nSupported languages: ${supportedLanguages
                  .map(language => `\n  ${padEnd(language.languageTag, 5)} (${language.name})`)
                  .join('')}`,
            );
          }
        }
      },
      validate() {
        if (this.languagesToApply.length > 0) {
          this.log.log(chalk.bold(`\nInstalling languages: ${this.languagesToApply.join(', ')}`));
        }
      },
    });
  }

  get [BaseApplicationGenerator.INITIALIZING]() {
    return this.delegateTasksToBlueprint(() => this.initializing);
  }

  // Public API method used by the getter and also by Blueprints
  get prompting() {
    return this.asPromptingTaskGroup({
      checkPrompts({ control }) {
        const { enableTranslation, languages } = this.jhipsterConfig;
        const showPrompts = this.options.askAnswered || (this.languageCommand && !this.regenerateLanguages);
        this.askForNativeLanguage = showPrompts || (!control.existingProject && !this.jhipsterConfig.nativeLanguage);
        this.askForMoreLanguages =
          enableTranslation !== false && (showPrompts || (!control.existingProject && (languages?.length ?? 0) < 1));
      },
      askI18n,
      askForLanguages,
    });
  }

  get [BaseApplicationGenerator.PROMPTING]() {
    return this.delegateTasksToBlueprint(() => this.prompting);
  }

  // Public API method used by the getter and also by Blueprints
  get configuring() {
    return this.asConfiguringTaskGroup({
      defaults() {
        const { nativeLanguage, enableTranslation } = this.jhipsterConfigWithDefaults;
        const isLanguageConfigured = Boolean(this.jhipsterConfig.nativeLanguage);
        // Prompts detects current language. Save default native language for next execution.
        this.config.defaults({ nativeLanguage: nativeLanguage! });
        if (!enableTranslation) {
          return;
        }
        this.config.defaults({ languages: [] });
        if (!isLanguageConfigured && this.languagesToApply.length === 0) {
          // If languages is not configured, apply defaults.
          this.languagesToApply = this.jhipsterConfigWithDefaults.languages as string[];
        }
        if (this.jhipsterConfig.languages!.length === 0 || this.jhipsterConfig.languages![0] !== this.jhipsterConfig.nativeLanguage) {
          // Set native language as first language.
          this.jhipsterConfig.languages = [...new Set([nativeLanguage, ...this.jhipsterConfig.languages!])];
        }
        if (this.languagesToApply && this.languagesToApply.length > 0) {
          // Save new languages.
          this.jhipsterConfig.languages = [...new Set([...this.jhipsterConfig.languages!, ...this.languagesToApply])];
        }
      },
    });
  }

  get [BaseApplicationGenerator.CONFIGURING]() {
    return this.delegateTasksToBlueprint(() => this.configuring);
  }

  get composing() {
    return this.asComposingTaskGroup({
      async bootstrap() {
        // Make sure generators languages callbacks are correctly initialized.
        const { clientFramework = 'no', skipServer, backendType = 'Java' } = this.jhipsterConfigWithDefaults as ClientConfig;
        if (clientFramework !== 'no') {
          await this.composeWithJHipster('jhipster:client:i18n');
        }
        if (!skipServer && backendType === 'Java') {
          await this.composeWithJHipster('jhipster:java:i18n');
        }
      },
    });
  }

  get [BaseApplicationGenerator.COMPOSING]() {
    return this.delegateTasksToBlueprint(() => this.composing);
  }

  get loading() {
    return this.asPreparingTaskGroup({
      prepareForTemplates({ application }) {
        if (application.enableTranslation) {
          if (!this.languageCommand || this.regenerateLanguages) {
            this.languagesToApply = application.languages;
          } else {
            this.languagesToApply = [...new Set(this.languagesToApply || [])];
          }
        }
        application.languagesToGenerate = this.languagesToApply;
      },
    });
  }

  get [BaseApplicationGenerator.LOADING]() {
    return this.delegateTasksToBlueprint(() => this.loading);
  }

  get postWriting() {
    return this.asPostWritingTaskGroup({
      updateLanguages({ application }) {
        if (this.options.skipPriorities?.includes?.(PRIORITY_NAMES.POST_WRITING)) return;

        for (const addLanguageCallback of application.addLanguageCallbacks) {
          addLanguageCallback(application.languagesToGenerateDefinition!, application.languagesDefinition);
        }
      },
    });
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }
}
