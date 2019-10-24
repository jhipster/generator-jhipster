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
            this.isAppConfiguration = true;
        } else if (this.generatorSource.options.namespace.endsWith(':server')) {
            this.generatorType = 'server';
            this.isAppConfiguration = true;
        } else {
            this.error(`Config module not implemented for ${this.generatorSource.options.namespace}.`);
        }
        debug(`Executing config for generator ${this.generatorType}`);

        this.configOptions = this.options.configOptions || {};

        this.useBlueprints = !opts.fromBlueprint && this.instantiateBlueprints('config', { generatorSource: this.generatorSource });
    }

    // Public API method used by the getter and also by Blueprints
    _initializing() {
        let steps;

        // App configuration steps
        if (this.isAppConfiguration) {
            steps = {
                askForInsightOptIn: appPrompts.askForInsightOptIn,
                askForApplicationType: appPrompts.askForApplicationType,
                askForModuleName: appPrompts.askForModuleName,

                setup() {
                    this.configOptions.skipI18nQuestion = true;
                    this.configOptions.logo = false;

                    this._parseApplicationType();

                    // Update generatorType for languages generators
                    if (this.storedConfig.skipClient) {
                        this.generatorType = 'server';
                    } else if (this.storedConfig.skipServer) {
                        this.generatorType = 'client';
                    } else {
                        this._validateSkip();
                    }
                }
            };
        }

        return {
            loadSharedData() {
                this.loadShared();
            },

            validateFromCli() {
                this.checkInvocationFromCLI();
            },
            ...steps
        };
    }

    get initializing() {
        if (this.useBlueprints) return;
        return this._initializing();
    }

    _prompting() {
        let steps;

        // App configuration steps
        if (this.isAppConfiguration) {
            steps = {
                askFori18n: appPrompts.askFori18n,
                askForTestOpts: appPrompts.askForTestOpts,
                askForMoreModules: appPrompts.askForMoreModules
            };
        }

        return {
            loadSharedData() {
                this.loadShared();
            },
            ...steps
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

            composeLanguages() {
                this.composeLanguagesSub(this, this.configOptions, this.generatorType);
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
    _parseApplicationType(config = this.storedConfig) {
        if (config.applicationType === 'microservice') {
            config.skipClient = true;
            config.skipUserManagement = true;
        }
        if (this.applicationType === 'uaa') {
            config.skipClient = true;
            config.skipUserManagement = false;
            config.authenticationType = 'uaa';
        }
        if (config.skipServer && this.options.db) {
            // defaults to use when skipping server
            config.databaseType = this.getDBTypeFromDBValue(this.options.db);
            config.devDatabaseType = this.options.db;
            config.prodDatabaseType = this.options.db;
        }
    }

    _validateSkip(generator = this) {
        if (generator.storedConfig.skipServer && generator.storedConfig.skipClient) {
            generator.error(`You can not pass both ${chalk.yellow('--skip-client')} and ${chalk.yellow('--skip-server')} together`);
        }
    }
};
