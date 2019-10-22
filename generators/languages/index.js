/**
 * Copyright 2013-2019 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/* eslint-disable consistent-return */
const debug = require('debug')('jhipster:languages');
const chalk = require('chalk');
const _ = require('lodash');
const BaseBlueprintGenerator = require('../generator-base-blueprint');
const prompts = require('./prompts');
const statistics = require('../statistics');

const constants = require('../generator-constants');
const jhipsterUtils = require('../utils');

const CLIENT_MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR;
const SERVER_TEST_SRC_DIR = constants.SERVER_TEST_SRC_DIR;

module.exports = class extends BaseBlueprintGenerator {
    constructor(args, opts) {
        super(args, opts);

        debug(`Initializing ${this.rootGeneratorName()}:languages generator`);

        // This adds support for a `--from-cli` flag
        this.option('from-cli', {
            desc: 'Indicates the command is run from JHipster CLI',
            type: Boolean,
            defaults: false
        });
        // This makes it possible to pass `languages` by argument
        this.argument('languages', {
            type: Array,
            required: false,
            description: 'Languages'
        });

        // This adds support for a `--skip-client` flag
        this.option('skip-client', {
            desc: 'Skip installing client files',
            type: Boolean,
            defaults: false
        });

        // This adds support for a `--skip-server` flag
        this.option('skip-server', {
            desc: 'Skip installing server files',
            type: Boolean,
            defaults: false
        });

        // Enable translation by default
        this.enableTranslation = true;
        this.authenticationType = this.config.get('authenticationType');
        this.skipClient = this.options['skip-client'] || this.config.get('skipClient');
        this.skipServer = this.options['skip-server'] || this.config.get('skipServer');
        // Validate languages passed as argument
        this.languages = this.options.languages;
        if (this.languages) {
            this.languages = this.languages.filter(language => language);
            this.languages.forEach(language => {
                if (!this.isSupportedLanguage(language)) {
                    this.log('\n');
                    this.error(
                        `Unsupported language "${language}" passed as argument to language generator.` +
                            `\nSupported languages: ${_.map(
                                this.getAllSupportedLanguageOptions(),
                                o => `\n  ${_.padEnd(o.value, 5)} (${o.name})`
                            ).join('')}`
                    );
                }
            });
        }

        this.useBlueprints =
            !this.fromBlueprint &&
            this.instantiateBlueprints('languages', { languages: this.languages, arguments: this.options.languages });
    }

    // Public API method used by the getter and also by Blueprints
    _initializing() {
        return {
            validateFromCli() {
                this.checkInvocationFromCLI();
            },

            setupConsts() {
                if (this.languages) {
                    if (this.skipClient) {
                        this.log(chalk.bold(`\nInstalling languages: ${this.languages.join(', ')} for server`));
                    } else if (this.skipServer) {
                        this.log(chalk.bold(`\nInstalling languages: ${this.languages.join(', ')} for client`));
                    } else {
                        this.log(chalk.bold(`\nInstalling languages: ${this.languages.join(', ')}`));
                    }
                    this.languagesToApply = this.languages || [];
                } else {
                    this.log(chalk.bold('\nLanguages configuration is starting'));
                }
            }
        };
    }

    get initializing() {
        if (this.useBlueprints) return;
        return this._initializing();
    }

    // Public API method used by the getter and also by Blueprints
    _prompting() {
        return {
            askForLanguages: prompts.askForLanguages
        };
    }

    get prompting() {
        if (this.useBlueprints) return;
        return this._prompting();
    }

    // Public API method used by the getter and also by Blueprints
    _configuring() {
        return {
            saveConfig() {
                if (this.enableTranslation) {
                    this.languages = _.union(this.currentLanguages, this.languagesToApply);
                    this.config.set('languages', this.languages);
                }
            }
        };
    }

    get configuring() {
        if (this.useBlueprints) return;
        return this._configuring();
    }

    _default() {
        return {
            insight() {
                statistics.sendSubGenEvent('generator', 'languages');
            },

            loadSharedData() {
                this.installShared();
            },

            setupShared() {
                const configuration = this.getAllJhipsterConfig(this, true);
                this.capitalizedBaseName = _.upperFirst(this.baseName);
                this.websocket = configuration.get('websocket') === 'no' ? false : configuration.get('websocket');
                this.searchEngine = configuration.get('searchEngine') === 'no' ? false : configuration.get('searchEngine');
                this.messageBroker = configuration.get('messageBroker') === 'no' ? false : configuration.get('messageBroker');
                this.env.options.appPath = configuration.get('appPath') || constants.CLIENT_MAIN_SRC_DIR;
                this.serviceDiscoveryType =
                    configuration.get('serviceDiscoveryType') === 'no' ? false : configuration.get('serviceDiscoveryType');
                // Make dist dir available in templates
                this.BUILD_DIR = this.getBuildDirectoryForBuildTool(configuration.get('buildTool'));
            }
        };
    }

    get default() {
        if (this.useBlueprints) return;
        return this._default();
    }

    // Public API method used by the getter and also by Blueprints
    _writing() {
        return {
            translateFile() {
                this.languagesToApply.forEach(language => {
                    if (!this.skipClient) {
                        this._installI18nClientFilesByLanguage(constants.CLIENT_MAIN_SRC_DIR, language);
                    }
                    if (!this.skipServer) {
                        this._installI18nServerFilesByLanguage(constants.SERVER_MAIN_RES_DIR, language, constants.SERVER_TEST_RES_DIR);
                    }
                    statistics.sendSubGenEvent('languages/language', language);
                });
            },
            write() {
                if (!this.skipClient) {
                    this._updateLanguagesInLanguagePipe(this.languages);
                    this._updateLanguagesInLanguageConstantNG2(this.languages);
                    this._updateLanguagesInWebpack(this.languages);
                    if (this.clientFramework === 'angularX') {
                        this._updateLanguagesInMomentWebpackNgx(this.languages);
                    }
                    if (this.clientFramework === 'react') {
                        this._updateLanguagesInMomentWebpackReact(this.languages);
                    }
                }
                if (!this.skipUserManagement) {
                    this._updateLanguagesInLanguageMailServiceIT(this.languages, this.packageFolder);
                }
            }
        };
    }

    get writing() {
        if (this.useBlueprints) return;
        return this._writing();
    }

    /* ======================================================================== */
    /* private methods use within generator (not queued for execution) */
    /* ======================================================================== */
    /**
     * Install I18N Client Files By Language
     *
     * @param {string} webappDir web app directory
     * @param {string} lang language code
     */
    _installI18nClientFilesByLanguage(webappDir, lang) {
        const generator = this;
        const prefix = this.fetchFromInstalledJHipster('languages/templates');
        if ((generator.databaseType !== 'no' || generator.authenticationType === 'uaa') && generator.databaseType !== 'cassandra') {
            generator._copyI18nFilesByName(generator, webappDir, 'audits.json', lang);
        }
        if (generator.applicationType === 'gateway' && generator.serviceDiscoveryType) {
            generator._copyI18nFilesByName(generator, webappDir, 'gateway.json', lang);
        }
        generator._copyI18nFilesByName(generator, webappDir, 'configuration.json', lang);
        generator._copyI18nFilesByName(generator, webappDir, 'error.json', lang);
        generator._copyI18nFilesByName(generator, webappDir, 'login.json', lang);
        generator._copyI18nFilesByName(generator, webappDir, 'home.json', lang);
        generator._copyI18nFilesByName(generator, webappDir, 'metrics.json', lang);
        generator._copyI18nFilesByName(generator, webappDir, 'logs.json', lang);
        generator._copyI18nFilesByName(generator, webappDir, 'password.json', lang);
        generator._copyI18nFilesByName(generator, webappDir, 'register.json', lang);
        generator._copyI18nFilesByName(generator, webappDir, 'sessions.json', lang);
        generator._copyI18nFilesByName(generator, webappDir, 'settings.json', lang);
        generator._copyI18nFilesByName(generator, webappDir, 'user-management.json', lang);

        // tracker.json for Websocket
        if (this.websocket === 'spring-websocket') {
            generator._copyI18nFilesByName(generator, webappDir, 'tracker.json', lang);
        }

        // Templates
        generator.template(`${prefix}/${webappDir}i18n/${lang}/activate.json.ejs`, `${webappDir}i18n/${lang}/activate.json`);
        generator.template(`${prefix}/${webappDir}i18n/${lang}/global.json.ejs`, `${webappDir}i18n/${lang}/global.json`);
        generator.template(`${prefix}/${webappDir}i18n/${lang}/health.json.ejs`, `${webappDir}i18n/${lang}/health.json`);
        generator.template(`${prefix}/${webappDir}i18n/${lang}/reset.json.ejs`, `${webappDir}i18n/${lang}/reset.json`);
    }

    /**
     * Install I18N Server Files By Language
     *
     * @param {string} resourceDir - resource directory
     * @param {string} lang - language code
     */
    _installI18nServerFilesByLanguage(resourceDir, lang, testResourceDir) {
        const generator = this;
        const prefix = this.fetchFromInstalledJHipster('languages/templates');
        // Template the message server side properties
        const langProp = lang.replace(/-/g, '_');
        // Target file : change xx_yyyy_zz to xx_yyyy_ZZ to match java locales
        const langJavaProp = langProp.replace(/_[a-z]+$/g, lang => lang.toUpperCase());
        debug(`${resourceDir}i18n/messages_${langJavaProp}.properties`);
        generator.template(
            `${prefix}/${resourceDir}i18n/messages_${langJavaProp}.properties.ejs`,
            `${resourceDir}i18n/messages_${langJavaProp}.properties`
        );
        generator.template(
            `${prefix}/${testResourceDir}i18n/messages_${langJavaProp}.properties.ejs`,
            `${testResourceDir}i18n/messages_${langJavaProp}.properties`
        );
    }

    /**
     * Copy i18 files for given language
     *
     * @param {object} generator - context that can be used as the generator instance or data to process template
     * @param {string} webappDir - webapp directory path
     * @param {string} fileToCopy - file name to copy
     * @param {string} lang - language for which file needs to be copied
     */
    _copyI18nFilesByName(generator, webappDir, fileToCopy, lang) {
        const _this = generator || this;
        const prefix = this.fetchFromInstalledJHipster('languages/templates');
        _this.copy(`${prefix}/${webappDir}i18n/${lang}/${fileToCopy}`, `${webappDir}i18n/${lang}/${fileToCopy}`);
    }

    /**
     * Update Languages In Language Constant
     *
     * @param languages
     */
    _updateLanguagesInLanguageConstant(languages) {
        const fullPath = `${CLIENT_MAIN_SRC_DIR}app/components/language/language.constants.js`;
        try {
            let content = ".constant('LANGUAGES', [\n";
            languages.forEach((language, i) => {
                content += `            '${language}'${i !== languages.length - 1 ? ',' : ''}\n`;
            });
            content +=
                '            // jhipster-needle-i18n-language-constant - JHipster will add/remove languages in this array\n        ]';

            jhipsterUtils.replaceContent(
                {
                    file: fullPath,
                    pattern: /\.constant.*LANGUAGES.*\[([^\]]*jhipster-needle-i18n-language-constant[^\]]*)\]/g,
                    content
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
     * Update Languages In Language Constant NG2
     *
     * @param languages
     */
    _updateLanguagesInLanguageConstantNG2(languages) {
        if (this.clientFramework !== 'angularX') {
            return;
        }
        const fullPath = `${CLIENT_MAIN_SRC_DIR}app/core/language/language.constants.ts`;
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
                    content
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
     */
    _updateLanguagesInLanguageMailServiceIT(languages, packageFolder) {
        const fullPath = `${SERVER_TEST_SRC_DIR}${packageFolder}/service/MailServiceIT.java`;
        try {
            let content = 'private static String languages[] = {\n';
            languages.forEach((language, i) => {
                content += `        "${language}"${i !== languages.length - 1 ? ',' : ''}\n`;
            });
            content += '        // jhipster-needle-i18n-language-constant - JHipster will add/remove languages in this array\n    };';

            jhipsterUtils.replaceContent(
                {
                    file: fullPath,
                    pattern: /private.*static.*String.*languages.*\{([^}]*jhipster-needle-i18n-language-constant[^}]*)\};/g,
                    content
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
    _updateLanguagesInLanguagePipe(languages) {
        const fullPath =
            this.clientFramework === 'angularX'
                ? `${CLIENT_MAIN_SRC_DIR}app/shared/language/find-language-from-key.pipe.ts`
                : `${CLIENT_MAIN_SRC_DIR}/app/config/translation.ts`;
        try {
            let content = '{\n';
            this.generateLanguageOptions(languages, this.clientFramework).forEach((ln, i) => {
                content += `        ${ln}${i !== languages.length - 1 ? ',' : ''}\n`;
            });
            content += '        // jhipster-needle-i18n-language-key-pipe - JHipster will add/remove languages in this object\n    };';

            jhipsterUtils.replaceContent(
                {
                    file: fullPath,
                    pattern: /{\s*('[a-z-]*':)?([^=]*jhipster-needle-i18n-language-key-pipe[^;]*)\};/g,
                    content
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
    _updateLanguagesInWebpack(languages) {
        const fullPath = 'webpack/webpack.common.js';
        try {
            let content = 'groupBy: [\n';
            languages.forEach((language, i) => {
                content += `                    { pattern: "./src/main/webapp/i18n/${language}/*.json", fileName: "./i18n/${language}.json" }${
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
                    content
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
     * Update Moment Locales to keep in webpack prod build
     *
     * @param languages
     */
    _updateLanguagesInMomentWebpackNgx(languages) {
        const fullPath = 'webpack/webpack.prod.js';
        try {
            let content = 'localesToKeep: [\n';
            languages.forEach((language, i) => {
                content += `                    '${this.getMomentLocaleId(language)}'${i !== languages.length - 1 ? ',' : ''}\n`;
            });
            content +=
                '                    // jhipster-needle-i18n-language-moment-webpack - JHipster will add/remove languages in this array\n' +
                '                ]';

            jhipsterUtils.replaceContent(
                {
                    file: fullPath,
                    pattern: /localesToKeep:.*\[([^\]]*jhipster-needle-i18n-language-moment-webpack[^\]]*)\]/g,
                    content
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
     * Update Moment Locales to keep in webpack prod build
     *
     * @param languages
     */
    _updateLanguagesInMomentWebpackReact(languages) {
        const fullPath = 'webpack/webpack.prod.js';
        try {
            let content = 'localesToKeep: [\n';
            languages.forEach((language, i) => {
                content += `        '${this.getMomentLocaleId(language)}'${i !== languages.length - 1 ? ',' : ''}\n`;
            });
            content +=
                '        // jhipster-needle-i18n-language-moment-webpack - JHipster will add/remove languages in this array\n      ]';

            jhipsterUtils.replaceContent(
                {
                    file: fullPath,
                    pattern: /localesToKeep:.*\[([^\]]*jhipster-needle-i18n-language-moment-webpack[^\]]*)\]/g,
                    content
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
};
