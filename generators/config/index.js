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
const chalk = require('chalk');
const debug = require('debug')('jhipster:config');

const BaseBlueprintGenerator = require('../generator-base-blueprint');
const appPrompts = require('../app/prompts');
const clientPrompts = require('../client/prompts');

// Migrate to local variables with yeoman-generator 4.1.1 | 4.2.0
module.exports = class extends BaseBlueprintGenerator {
    constructor(args, opts) {
        super(args, opts);

        debug(`Initializing ${this.rootGeneratorName()}:config generator`);

        this.generatorSource = this.options.generatorSource;
        if (!this.generatorSource) {
            this.error('Config module must have a generator source.');
        }

        if (this.generatorSource.options.namespace.endsWith(':app')) {
            this.generatorType = 'app'; // Use for languages generators only
            this.isAppConfiguration = true;
        } else if (this.generatorSource.options.namespace.endsWith(':client')) {
            this.generatorType = 'client';
            this.isClientConfiguration = true;
        } else if (this.generatorSource.options.namespace.endsWith(':server')) {
            this.generatorType = 'server';
            this.isServerConfiguration = true;
        } else {
            this.error(`Config module not implemented for ${this.generatorSource.options.namespace}.`);
        }
        debug(`Executing config for ${this.generatorType}`);

        this.useBlueprints = !opts.fromBlueprint && this.instantiateBlueprints('config', { generatorSource: this.generatorSource });
    }

    // Public API method used by the getter and also by Blueprints
    _initializing() {
        return {
            loadSharedData() {
                this.loadShared();
            },

            updateAngularName() {
                if (this.storedConfig.clientFramework === 'angular' || this.storedConfig.clientFramework === 'angular2') {
                    /* for backward compatibility */
                    this.storedConfig.clientFramework = 'angularX';
                }
            },

            validateFromCli() {
                this.checkInvocationFromCLI();
            }
        };
    }

    get initializing() {
        if (this.useBlueprints) return;
        return this._initializing();
    }

    _prompting() {
        const clientSteps = {
            askForModuleName: clientPrompts.askForModuleName,
            askForClient: clientPrompts.askForClient,
            askFori18n: clientPrompts.askFori18n,
            askForClientTheme: clientPrompts.askForClientTheme,
            askForClientThemeVariant: clientPrompts.askForClientThemeVariant
        };

        let steps;

        // App configuration steps
        if (this.isAppConfiguration) {
            steps = {
                askForInsightOptIn: appPrompts.askForInsightOptIn,
                askForApplicationType: appPrompts.askForApplicationType,
                parseApplicationType: this._parseApplicationType,
                askForModuleName: appPrompts.askForModuleName,
                ...clientSteps,
                askFori18n: appPrompts.askFori18n,
                askForTestOpts: appPrompts.askForTestOpts,
                askForMoreModules: appPrompts.askForMoreModules
            };
        } else if (this.isClientConfiguration) {
            steps = clientSteps;
        }

        return {
            loadSharedData() {
                this.loadShared();
            },
            ...steps,

            composeLanguages() {
                // Update generatorType for languages generators
                let generatorType = this.generatorType;
                if (generatorType === 'app') {
                    if (this.storedConfig.skipClient) {
                        generatorType = 'server';
                    } else if (this.storedConfig.skipServer) {
                        generatorType = 'client';
                    } else {
                        this._validateSkip();
                    }
                }
                this.composeLanguagesSub(this, this.configOptions, generatorType);
            }
        };
    }

    get prompting() {
        if (this.useBlueprints) return;
        return this._prompting();
    }

    _configuring() {
        let steps;

        // App configuration steps
        if (this.isAppConfiguration) {
            steps = {};
        }

        return {
            loadSharedData() {
                this.loadShared();
            },

            ...steps,

            configuringAuthenticationType() {
                const config = this.storedConfig;
                if (config.authenticationType === 'oauth2' || (config.databaseType === 'no' && config.authenticationType !== 'uaa')) {
                    config.skipUserManagement = true;
                }
            },

            validateTranslation() {
                const config = this.storedConfig;
                config.enableI18nRTL = this.isI18nRTLSupportNecessary(this.languages);

                if (config.nativeLanguage === undefined) {
                    config.nativeLanguage = 'en';
                }
                if (config.enableTranslation === undefined) {
                    config.enableTranslation = true;
                }
                if (config.enableTranslation && config.languages === undefined) {
                    config.languages = ['en', 'fr'];
                }
            },
            validateSkip: this._validateSkip
        };
    }

    get configuring() {
        if (this.useBlueprints) return;
        return this._configuring();
    }

    /* ======================================================================== */
    /* private methods use within generator (not queued for execution) */
    /* ======================================================================== */
    _parseApplicationType() {
        const config = this.storedConfig;
        if (config.applicationType === 'microservice') {
            config.skipClient = true;
            config.skipUserManagement = true;
        }
        if (this.applicationType === 'uaa') {
            config.skipClient = true;
            config.skipUserManagement = false;
            config.authenticationType = 'uaa';
        }
        // Override existing db by the one from cli arguments.
        if (this.options.db) {
            config.databaseType = this.getDBTypeFromDBValue(this.options.db);
            config.devDatabaseType = this.options.db;
            config.prodDatabaseType = this.options.db;
        }
    }

    _validateSkip() {
        const generator = this;
        if (generator.storedConfig.skipServer && generator.storedConfig.skipClient) {
            generator.error(`You can not pass both ${chalk.yellow('--skip-client')} and ${chalk.yellow('--skip-server')} together`);
        }
    }
};
