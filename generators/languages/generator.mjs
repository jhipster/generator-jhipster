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
import chalk from 'chalk';
import _ from 'lodash';

import BaseApplicationGenerator from '../base-application/index.mjs';

import { askForLanguages, askI18n } from './prompts.mjs';
import statistics from '../statistics.cjs';
import { SERVER_TEST_SRC_DIR, SERVER_MAIN_RES_DIR, SERVER_TEST_RES_DIR } from '../generator-constants.mjs';

import generatorDefaults from '../generator-defaults.mjs';
import { GENERATOR_LANGUAGES, GENERATOR_BOOTSTRAP_APPLICATION } from '../generator-list.mjs';
import { clientI18nFiles } from './files.mjs';
import { writeEntityFiles } from './entity-files.mjs';
import { languageToJavaLanguage } from './utils.mjs';
import jhipsterUtils from '../utils.cjs';
import TranslationData from './translation-data.mjs';

const { translationDefaultConfig } = generatorDefaults;

/**
 * This is the base class for a generator that generates entities.
 *
 * @class
 * @extends {BaseApplicationGenerator}
 */
export default class LanguagesGenerator extends BaseApplicationGenerator {
  constructor(args, options, features) {
    super(args, options, { unique: 'namespace', ...features });

    this.option('skip-prompts', {
      desc: 'Skip prompts',
      type: Boolean,
      hide: true,
      defaults: false,
    });
    // This makes it possible to pass `languages` by argument
    this.argument('languages', {
      type: Array,
      required: false,
      description: 'Languages',
    });

    // This adds support for a `--skip-client` flag
    this.option('skip-client', {
      desc: 'Skip installing client files',
      type: Boolean,
    });

    // This adds support for a `--skip-server` flag
    this.option('skip-server', {
      desc: 'Skip installing server files',
      type: Boolean,
    });

    this.option('regenerate', {
      desc: 'Regenerate languages files',
      type: Boolean,
    });

    if (this.options.help) {
      return;
    }

    this.loadStoredAppOptions();
    this.loadRuntimeOptions();

    // Validate languages passed as argument.
    // Additional languages, will not replace current ones.
    this.languagesToApply = [this.options.nativeLanguage, ...(this.options.languages ?? [])].filter(Boolean);
    if (this.languagesToApply.length > 0) {
      this.languagesToApply.forEach(language => {
        if (!this.isSupportedLanguage(language)) {
          this.log('\n');
          this.error(
            `Unsupported language "${language}" passed as argument to language generator.` +
              `\nSupported languages: ${_.map(this.getAllSupportedLanguageOptions(), o => `\n  ${_.padEnd(o.value, 5)} (${o.name})`).join(
                ''
              )}`
          );
        }
      });
    }
  }

  async beforeQueue() {
    await this.dependsOnJHipster(GENERATOR_BOOTSTRAP_APPLICATION);
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints('languages', { languages: this.languagesToApply, arguments: this.options.languages });
    }
  }

  // Public API method used by the getter and also by Blueprints
  get initializing() {
    return {
      validate() {
        if (this.languagesToApply.length > 0) {
          if (this.skipClient) {
            this.log(chalk.bold(`\nInstalling languages: ${this.languagesToApply.join(', ')} for server`));
          } else if (this.skipServer) {
            this.log(chalk.bold(`\nInstalling languages: ${this.languagesToApply.join(', ')} for client`));
          } else {
            this.log(chalk.bold(`\nInstalling languages: ${this.languagesToApply.join(', ')}`));
          }
        }
      },
    };
  }

  get [BaseApplicationGenerator.INITIALIZING]() {
    return this.delegateTasksToBlueprint(() => this.initializing);
  }

  // Public API method used by the getter and also by Blueprints
  get prompting() {
    return {
      checkPrompts({ control }) {
        const { enableTranslation, languages } = this.jhipsterConfig;
        const showPrompts = this.options.askAnswered || this.env.rootGenerator() === this;
        this.askForNativeLanguage = showPrompts || (!control.existingProject && !this.jhipsterConfig.nativeLanguage);
        this.askForMoreLanguages =
          enableTranslation !== false && (showPrompts || (!control.existingProject && (languages?.length ?? 0) < 1));
      },
      askI18n,
      askForLanguages,
    };
  }

  get [BaseApplicationGenerator.PROMPTING]() {
    return this.delegateTasksToBlueprint(() => this.prompting);
  }

  // Public API method used by the getter and also by Blueprints
  get configuring() {
    return {
      defaults() {
        if (this.jhipsterConfig.enableTranslation === false) {
          return;
        }
        if (!this.jhipsterConfig.nativeLanguage) {
          // If native language is not set, use defaults, otherwise languages will be built with nativeLanguage.
          this.setConfigDefaults(translationDefaultConfig);
          if (this.languagesToApply.length === 0) {
            this.languagesToApply = this.jhipsterConfig.languages;
          }
        }
        if (!this.jhipsterConfig.languages) {
          this.jhipsterConfig.languages = [];
        }
        if (this.jhipsterConfig.languages.length === 0 || this.jhipsterConfig.languages[0] !== this.jhipsterConfig.nativeLanguage) {
          this.jhipsterConfig.languages = [...new Set([this.jhipsterConfig.nativeLanguage, ...this.jhipsterConfig.languages])];
        }
        if (this.languagesToApply.length > 0) {
          // Save new languages;
          this.jhipsterConfig.languages = [...new Set([...this.jhipsterConfig.languages, ...this.languagesToApply])];
        }
      },
    };
  }

  get [BaseApplicationGenerator.CONFIGURING]() {
    return this.delegateTasksToBlueprint(() => this.configuring);
  }

  // Public API method used by the getter and also by Blueprints
  get preparing() {
    return {
      prepareForTemplates({ application }) {
        if (application.enableTranslation) {
          if (this.options.regenerate) {
            this.languagesToApply = application.languages;
          } else {
            this.languagesToApply = [...new Set(this.languagesToApply || [])];
          }
        }
      },
    };
  }

  get [BaseApplicationGenerator.PREPARING]() {
    return this.delegateTasksToBlueprint(() => this.preparing);
  }

  get default() {
    return {
      async loadNativeLanguage({ application, entities, control }) {
        this.translationData = new TranslationData(this, control);

        const loadClientTranslations = async () => {
          await this.translationData.loadClientTranslations(application);
          for (const entity of entities.filter(entity => !entity.skipClient && !entity.builtIn)) {
            await this.translationData.loadEntityClientTranslations(application, entity);
          }
        };

        if (application.enableTranslation) {
          // Translation is normally not needed, add support on demand for angular.
          control.getWebappTranslation = () => {
            throw new Error(
              `Translations are not loaded, call ${chalk.yellow("'await control.loadClientTranslations'")} to load translations`
            );
          };

          control.loadClientTranslations = async () => {
            await loadClientTranslations();
            control.getWebappTranslation = (...args) => this.translationData.getClientTranslation(...args);
            delete control.loadClientTranslations;
          };
        } else {
          await loadClientTranslations();
          control.getWebappTranslation = (...args) => this.translationData.getClientTranslation(...args);
        }
      },

      insight() {
        statistics.sendSubGenEvent('generator', GENERATOR_LANGUAGES);
      },
    };
  }

  get [BaseApplicationGenerator.DEFAULT]() {
    return this.delegateTasksToBlueprint(() => this.default);
  }

  // Public API method used by the getter and also by Blueprints
  get writing() {
    return {
      async writeClientTranslations({ application }) {
        if (!application.enableTranslation || application.skipClient) return;
        await Promise.all(
          this.languagesToApply.map(lang =>
            this.writeFiles({
              sections: clientI18nFiles,
              context: {
                ...application,
                lang,
              },
            })
          )
        );
      },
      translateFile({ application }) {
        if (!application.enableTranslation || application.skipServer) return;
        this.languagesToApply.forEach(language => {
          if (!application.skipServer) {
            this.installI18nServerFilesByLanguage(this, SERVER_MAIN_RES_DIR, language, SERVER_TEST_RES_DIR, {
              ...application,
              lang: language,
            });
          }
          statistics.sendSubGenEvent('languages/language', language);
        });
      },
    };
  }

  get [BaseApplicationGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  get writingEntities() {
    return {
      ...writeEntityFiles(),
    };
  }

  get [BaseApplicationGenerator.WRITING_ENTITIES]() {
    return this.delegateTasksToBlueprint(() => this.writingEntities);
  }

  get postWriting() {
    return {
      write({ application }) {
        if (application.enableTranslation && !application.skipClient) {
          this.updateLanguagesInDayjsConfiguation(application.languages, application);
          if (application.clientFrameworkAngular) {
            this.updateLanguagesInLanguagePipe(application.languages, application);
            this.updateLanguagesInLanguageConstantNG2(application.languages, application);
            this.updateLanguagesInWebpackAngular(application.languages, application);
          }
          if (application.clientFrameworkReact) {
            this.updateLanguagesInLanguagePipe(application.languages, application);
            this.updateLanguagesInWebpackReact(application.languages, application);
          }
          if (application.clientFrameworkVue) {
            this.vueUpdateLanguagesInTranslationStore(application.languages, application);
            this.vueUpdateI18nConfig(application.languages, application);
            this.vueUpdateLanguagesInWebpack(application.languages, application);
          }
        }
        if (application.enableTranslation && application.generateUserManagement && !application.skipServer) {
          this.updateLanguagesInLanguageMailServiceIT(application.languages, application);
        }
      },
    };
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }

  /**
   * Install I18N Server Files By Language
   *
   * @param {any} _this - reference to generator
   * @param {string} resourceDir - resource directory
   * @param {string} lang - language code
   * @param {string} testResourceDir - test resource directory
   */
  installI18nServerFilesByLanguage(_this, resourceDir, lang, testResourceDir, data) {
    const generator = _this || this;
    const prefix = this.fetchFromInstalledJHipster('languages/templates');
    const langJavaProp = languageToJavaLanguage(lang);
    generator.renderTemplate(
      `${prefix}/${resourceDir}i18n/messages_${langJavaProp}.properties.ejs`,
      `${resourceDir}i18n/messages_${langJavaProp}.properties`,
      data
    );
    if (!data.skipUserManagement) {
      generator.renderTemplate(
        `${prefix}/${testResourceDir}i18n/messages_${langJavaProp}.properties.ejs`,
        `${testResourceDir}i18n/messages_${langJavaProp}.properties`,
        data
      );
    }
  }

  /**
   * Update Languages In Language Constant NG2
   *
   * @param languages
   */
  updateLanguagesInLanguageConstantNG2(languages, application) {
    if (!application.clientFrameworkAngular) {
      return;
    }
    const fullPath = `${application.clientSrcDir}app/config/language.constants.ts`;
    try {
      let content = 'export const LANGUAGES: string[] = [\n';
      languages.forEach((language, i) => {
        content += `    '${language}'${i !== languages.length - 1 ? ',' : ''}\n`;
      });
      content += '    // jhipster-needle-i18n-language-constant - JHipster will add/remove languages in this array\n];';

      jhipsterUtils.replaceContent(
        {
          file: fullPath,
          pattern: /export.*LANGUAGES.*\[([^\]]*jhipster-needle-i18n-language-constant[^\]]*)\];/g,
          content,
        },
        this
      );
    } catch (e) {
      this.log(
        chalk.yellow('\nUnable to find ') +
          fullPath +
          chalk.yellow(' or missing required jhipster-needle. LANGUAGE constant not updated with languages: ') +
          languages +
          chalk.yellow(' since block was not found. Check if you have enabled translation support.\n')
      );
      this.debug('Error:', e);
    }
  }

  /**
   * Update Languages In MailServiceIT
   *
   * @param languages
   * @param packageFolder
   */
  updateLanguagesInLanguageMailServiceIT(languages, application) {
    const fullPath = `${SERVER_TEST_SRC_DIR}${application.packageFolder}/service/MailServiceIT.java`;
    try {
      let content = 'private static final String[] languages = {\n';
      languages.forEach((language, i) => {
        content += `        "${language}"${i !== languages.length - 1 ? ',' : ''}\n`;
      });
      content += '        // jhipster-needle-i18n-language-constant - JHipster will add/remove languages in this array\n    };';

      jhipsterUtils.replaceContent(
        {
          file: fullPath,
          pattern: /private.*static.*String.*languages.*\{([^}]*jhipster-needle-i18n-language-constant[^}]*)\};/g,
          content,
        },
        this
      );
    } catch (e) {
      this.log(
        chalk.yellow('\nUnable to find ') +
          fullPath +
          chalk.yellow(' or missing required jhipster-needle. LANGUAGE constant not updated with languages: ') +
          languages +
          chalk.yellow(' since block was not found. Check if you have enabled translation support.\n')
      );
      this.debug('Error:', e);
    }
  }

  /**
   * Update Languages In Language Pipe
   *
   * @param languages
   */
  updateLanguagesInLanguagePipe(languages, application) {
    const fullPath = application.clientFrameworkAngular
      ? `${application.clientSrcDir}app/shared/language/find-language-from-key.pipe.ts`
      : `${application.clientSrcDir}/app/config/translation.ts`;
    try {
      let content = '{\n';
      this.generateLanguageOptions(languages, application.clientFramework).forEach((ln, i) => {
        content += `        ${ln}${i !== languages.length - 1 ? ',' : ''}\n`;
      });
      content += '        // jhipster-needle-i18n-language-key-pipe - JHipster will add/remove languages in this object\n    };';

      jhipsterUtils.replaceContent(
        {
          file: fullPath,
          pattern: /{\s*('[a-z-]*':)?([^=]*jhipster-needle-i18n-language-key-pipe[^;]*)\};/g,
          content,
        },
        this
      );
    } catch (e) {
      this.log(
        chalk.yellow('\nUnable to find ') +
          fullPath +
          chalk.yellow(' or missing required jhipster-needle. Language pipe not updated with languages: ') +
          languages +
          chalk.yellow(' since block was not found. Check if you have enabled translation support.\n')
      );
      this.debug('Error:', e);
    }
  }

  /**
   * Update Languages In Webpack
   *
   * @param languages
   */
  updateLanguagesInWebpackAngular(languages, application) {
    const fullPath = 'webpack/webpack.custom.js';
    try {
      let content = 'groupBy: [\n';
      // prettier-ignore
      languages.forEach((language, i) => {
                content += `                    { pattern: "./${application.clientSrcDir}i18n/${language}/*.json", fileName: "./i18n/${language}.json" }${
                    i !== languages.length - 1 ? ',' : ''
                }\n`;
            });
      content +=
        '                    // jhipster-needle-i18n-language-webpack - JHipster will add/remove languages in this array\n' +
        '                ]';

      jhipsterUtils.replaceContent(
        {
          file: fullPath,
          pattern: /groupBy:.*\[([^\]]*jhipster-needle-i18n-language-webpack[^\]]*)\]/g,
          content,
        },
        this
      );
    } catch (e) {
      this.log(
        chalk.yellow('\nUnable to find ') +
          fullPath +
          chalk.yellow(' or missing required jhipster-needle. Webpack language task not updated with languages: ') +
          languages +
          chalk.yellow(' since block was not found. Check if you have enabled translation support.\n')
      );
      this.debug('Error:', e);
    }
  }

  /**
   * Update Languages In Webpack React
   *
   * @param languages
   */
  updateLanguagesInWebpackReact(languages, application) {
    const fullPath = 'webpack/webpack.common.js';
    try {
      let content = 'groupBy: [\n';
      // prettier-ignore
      languages.forEach((language, i) => {
                content += `                    { pattern: "./${application.clientSrcDir}i18n/${language}/*.json", fileName: "./i18n/${language}.json" }${
                    i !== languages.length - 1 ? ',' : ''
                }\n`;
            });
      content +=
        '                    // jhipster-needle-i18n-language-webpack - JHipster will add/remove languages in this array\n' +
        '                ]';

      jhipsterUtils.replaceContent(
        {
          file: fullPath,
          pattern: /groupBy:.*\[([^\]]*jhipster-needle-i18n-language-webpack[^\]]*)\]/g,
          content,
        },
        this
      );
    } catch (e) {
      this.log(
        chalk.yellow('\nUnable to find ') +
          fullPath +
          chalk.yellow(' or missing required jhipster-needle. Webpack language task not updated with languages: ') +
          languages +
          chalk.yellow(' since block was not found. Check if you have enabled translation support.\n')
      );
      this.debug('Error:', e);
    }
  }

  /**
   * Update DayJS Locales to keep in dayjs.ts config file
   *
   * @param languages
   */
  updateLanguagesInDayjsConfiguation(languages, application) {
    let fullPath = `${application.clientSrcDir}app/config/dayjs.ts`;
    if (application.clientFrameworkVue) {
      fullPath = `${application.clientSrcDir}app/shared/config/dayjs.ts`;
    } else if (application.clientFrameworkAngular) {
      fullPath = `${application.clientSrcDir}app/config/dayjs.ts`;
    }
    try {
      const content = languages.reduce(
        (content, language) =>
          `${content}import 'dayjs/${application.clientFrameworkAngular ? 'esm/' : ''}locale/${this.getDayjsLocaleId(language)}'\n`,
        '// jhipster-needle-i18n-language-dayjs-imports - JHipster will import languages from dayjs here\n'
      );

      jhipsterUtils.replaceContent(
        {
          file: fullPath,
          // match needle until // DAYJS CONFIGURATION (excluded)
          pattern: /\/\/ jhipster-needle-i18n-language-dayjs-imports[\s\S]+?(?=\/\/ DAYJS CONFIGURATION)/g,
          content: `${content}\n`,
        },
        this
      );
    } catch (e) {
      this.log(
        chalk.yellow('\nUnable to find ') +
          fullPath +
          chalk.yellow(' or missing required jhipster-needle. DayJS language task not updated with languages: ') +
          languages +
          chalk.yellow(' since block was not found. Check if you have enabled translation support.\n')
      );
      this.debug('Error:', e);
    }
  }

  vueUpdateLanguagesInTranslationStore(languages, application) {
    const fullPath = `${application.clientSrcDir}app/shared/config/store/translation-store.ts`;
    try {
      let content = 'languages: {\n';
      if (application.enableTranslation) {
        this.generateLanguageOptions(languages, application.clientFramework).forEach((ln, i) => {
          content += `      ${ln}${i !== languages.length - 1 ? ',' : ''}\n`;
        });
      }
      content += '      // jhipster-needle-i18n-language-key-pipe - JHipster will add/remove languages in this object\n    }';
      jhipsterUtils.replaceContent(
        {
          file: fullPath,
          pattern: /languages:.*\{([^\]]*jhipster-needle-i18n-language-key-pipe[^}]*)}/g,
          content,
        },
        this
      );
    } catch (e) {
      this.log(
        chalk.yellow('\nUnable to find ') +
          fullPath +
          chalk.yellow(' or missing required jhipster-needle. Language pipe not updated with languages: ') +
          languages +
          chalk.yellow(' since block was not found. Check if you have enabled translation support.\n')
      );
      this.debug('Error:', e);
    }
  }

  vueUpdateI18nConfig(languages, application) {
    const fullPath = `${application.clientSrcDir}app/shared/config/config.ts`;

    try {
      // Add i18n config snippets for all languages
      let i18nConfig = 'const dateTimeFormats: DateTimeFormats = {\n';
      if (application.enableTranslation) {
        languages.forEach((ln, i) => {
          i18nConfig += this.generateDateTimeFormat(ln, i, languages.length);
        });
      }
      i18nConfig += '  // jhipster-needle-i18n-language-date-time-format - JHipster will add/remove format options in this object\n';
      i18nConfig += '}';

      jhipsterUtils.replaceContent(
        {
          file: fullPath,
          pattern: /const dateTimeFormats.*\{([^\]]*jhipster-needle-i18n-language-date-time-format[^}]*)}/g,
          content: i18nConfig,
        },
        this
      );
    } catch (e) {
      this.log(
        chalk.yellow('\nUnable to find ') +
          fullPath +
          chalk.yellow(' or missing required jhipster-needle. Language pipe not updated with languages: ') +
          languages +
          chalk.yellow(' since block was not found. Check if you have enabled translation support.\n')
      );
      this.debug('Error:', e);
    }
  }

  vueUpdateLanguagesInWebpack(languages, application) {
    const fullPath = 'webpack/webpack.common.js';
    try {
      let content = 'groupBy: [\n';
      // prettier-ignore
      languages.forEach((language, i) => {
                content += `          { pattern: './${application.clientSrcDir}i18n/${language}/*.json', fileName: './i18n/${language}.json' }${
                    i !== languages.length - 1 ? ',' : ''
                }\n`;
            });
      content += '          // jhipster-needle-i18n-language-webpack - JHipster will add/remove languages in this array\n        ]';

      jhipsterUtils.replaceContent(
        {
          file: fullPath,
          pattern: /groupBy:.*\[([^\]]*jhipster-needle-i18n-language-webpack[^\]]*)\]/g,
          content,
        },
        this
      );
    } catch (e) {
      this.log(
        chalk.yellow('\nUnable to find ') +
          fullPath +
          chalk.yellow(' or missing required jhipster-needle. Webpack language task not updated with languages: ') +
          languages +
          chalk.yellow(' since block was not found. Check if you have enabled translation support.\n')
      );
      this.debug('Error:', e);
    }
  }
}
