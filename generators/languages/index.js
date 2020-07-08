/**
 * Copyright 2013-2020 the original author or authors from the JHipster project.
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
const chalk = require('chalk');
const _ = require('lodash');
const BaseBlueprintGenerator = require('../generator-base-blueprint');
const prompts = require('./prompts');
const statistics = require('../statistics');
const constants = require('../generator-constants');

const ANGULAR = constants.SUPPORTED_CLIENT_FRAMEWORKS.ANGULAR;
const REACT = constants.SUPPORTED_CLIENT_FRAMEWORKS.REACT;

let useBlueprints;

module.exports = class extends BaseBlueprintGenerator {
    constructor(args, opts) {
        super(args, opts);

        // This adds support for a `--from-cli` flag
        this.option('from-cli', {
            desc: 'Indicates the command is run from JHipster CLI',
            type: Boolean,
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
            defaults: false,
        });

        // This adds support for a `--skip-server` flag
        this.option('skip-server', {
            desc: 'Skip installing server files',
            type: Boolean,
            defaults: false,
        });

        if (this.options.help) {
            return;
        }

        this.loadOptions();
        this.loadRuntimeOptions();

        // Validate languages passed as argument
        this.languages = this.options.languages;
        if (this.languages) {
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

        useBlueprints =
            !this.fromBlueprint &&
            this.instantiateBlueprints('languages', { languages: this.languages, arguments: this.options.languages });
    }

    // Public API method used by the getter and also by Blueprints
    _initializing() {
        return {
            validateFromCli() {
                this.checkInvocationFromCLI();
            },

            validate() {
                this.currentLanguages = this.jhipsterConfig.languages || [];
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
            },
        };
    }

    get initializing() {
        if (useBlueprints) return;
        return this._initializing();
    }

    // Public API method used by the getter and also by Blueprints
    _prompting() {
        return {
            askForLanguages: prompts.askForLanguages,
        };
    }

    get prompting() {
        if (useBlueprints) return;
        return this._prompting();
    }

    // Public API method used by the getter and also by Blueprints
    _configuring() {
        return {
            saveConfig() {
                this.jhipsterConfig.languages = _.union(this.currentLanguages, this.languagesToApply);
            },
        };
    }

    get configuring() {
        if (useBlueprints) return;
        return this._configuring();
    }

    _default() {
        return {
            insight() {
                statistics.sendSubGenEvent('generator', 'languages');
            },

            getSharedConfigOptions() {
                this.loadAppConfig();
                this.loadClientConfig();
                this.loadServerConfig();
                this.loadTranslationConfig();

                // Make dist dir available in templates
                this.BUILD_DIR = this.getBuildDirectoryForBuildTool(this.buildTool);

                this.capitalizedBaseName = _.upperFirst(this.baseName);
            },
        };
    }

    get default() {
        if (useBlueprints) return;
        return this._default();
    }

    // Public API method used by the getter and also by Blueprints
    _writing() {
        return {
            translateFile() {
                this.languagesToApply.forEach(language => {
                    if (!this.skipClient) {
                        this.installI18nClientFilesByLanguage(this, constants.CLIENT_MAIN_SRC_DIR, language);
                    }
                    if (!this.skipServer) {
                        this.installI18nServerFilesByLanguage(this, constants.SERVER_MAIN_RES_DIR, language, constants.SERVER_TEST_RES_DIR);
                    }
                    statistics.sendSubGenEvent('languages/language', language);
                });
            },
            write() {
                if (!this.skipClient) {
                    this.updateLanguagesInLanguagePipe(this.languages);
                    this.updateLanguagesInWebpack(this.languages);
                    if (this.clientFramework === ANGULAR) {
                        this.updateLanguagesInLanguageConstantNG2(this.languages);
                        this.updateLanguagesInMomentWebpackNgx(this.languages);
                    }
                    if (this.clientFramework === REACT) {
                        this.updateLanguagesInMomentWebpackReact(this.languages);
                    }
                }
                if (!this.skipUserManagement && !this.skipServer) {
                    this.updateLanguagesInLanguageMailServiceIT(this.languages, this.packageFolder);
                }
            },
        };
    }

    get writing() {
        if (useBlueprints) return;
        return this._writing();
    }
};
