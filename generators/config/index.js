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
const serverPrompts = require('../server/prompts');
const { getBase64Secret, getRandomHex } = require('../utils');

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

        this.serverExistingProject = this._serverExistingProject();

        this.useBlueprints = !opts.fromBlueprint && this.instantiateBlueprints('config', { generatorSource: this.generatorSource });

        this.loadScopedOptions('storage', ['base-name', 'uaa-base-name', 'skip-user-management', 'rememberMeKey']);
    }

    // Public API method used by the getter and also by Blueprints
    _initializing() {
        return {
            updateAngularName() {
                if (this.storedConfig.clientFramework === 'angular' || this.storedConfig.clientFramework === 'angular2') {
                    /* for backward compatibility */
                    this.storedConfig.clientFramework = 'angularX';
                }
            },

            validateFromCli() {
                this.checkInvocationFromCLI();
            },

            loadDBFromOptions() {
                // Override existing db by the one from cli arguments.
                if (this.options.db) {
                    const config = this.storedConfig;
                    config.databaseType = this.getDBTypeFromDBValue(this.options.db);
                    config.devDatabaseType = this.options.db;
                    config.prodDatabaseType = this.options.db;
                }
            }
        };
    }

    get initializing() {
        if (this.useBlueprints) return;
        return this._initializing();
    }

    _prompting() {
        const config = this.storedConfig;

        let clientSteps;
        if (!config.skipServer)
            clientSteps = {
                askForModuleName: this.storedConfig.baseName ? undefined : this.askModuleName,
                askForClient: clientPrompts.askForClient,
                askFori18n: this.isClientConfiguration ? this.aski18n : undefined,
                askForClientTheme: clientPrompts.askForClientTheme,
                askForClientThemeVariant: clientPrompts.askForClientThemeVariant
            };

        let serverSteps;
        if (!config.skipServer)
            serverSteps = {
                askForModuleName: this.storedConfig.baseName ? undefined : this.askModuleName,
                askForServerSideOpts: serverPrompts.askForServerSideOpts,
                configureServerPrompt: this._configureServerPrompt,
                askForOptionalItems: serverPrompts.askForOptionalItems,
                askFori18n: this.isServerConfiguration ? this.aski18n : undefined
            };

        let steps;

        // App configuration steps
        if (!this.configExisted) {
            if (this.isAppConfiguration) {
                steps = {
                    askForInsightOptIn: appPrompts.askForInsightOptIn,
                    askForApplicationType: appPrompts.askForApplicationType,
                    parseApplicationType: this._parseApplicationType,
                    askForModuleName: this.askModuleName,
                    ...serverSteps,
                    ...clientSteps,
                    askFori18n: this.skipI18n ? undefined : this.aski18n,
                    askForTestOpts: appPrompts.askForTestOpts,
                    askForMoreModules: appPrompts.askForMoreModules
                };
            } else if (this.isClientConfiguration) {
                steps = clientSteps;
            } else if (this.isServerConfiguration) {
                steps = serverSteps;
            }
        } else if (this.isAppConfiguration) {
            steps = { askForInsightOptIn: appPrompts.askForInsightOptIn };
            if (!this.serverExistingProject) {
                steps = {
                    ...steps,
                    ...serverSteps
                };
            }
        }

        return {
            ...steps,

            composeLanguages() {
                const config = this.storedConfig;
                // Update generatorType for languages generators
                let generatorType = this.generatorType;
                if (generatorType === 'app') {
                    if (config.skipClient) {
                        generatorType = 'server';
                    } else if (config.skipServer) {
                        generatorType = 'client';
                    } else {
                        this._validateSkip();
                    }
                }
                this.languages = config.languages;
                this.enableTranslation = config.enableTranslation;
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
        if (!this.isClientConfiguration && !this.storedConfig.skipServer) {
            steps = {
                configureServer: this._configureServer
            };
        }

        return {
            ...steps,

            configuringAuthenticationType() {
                const config = this.storedConfig;
                if (config.authenticationType === 'oauth2' || (config.databaseType === 'no' && config.authenticationType !== 'uaa')) {
                    config.skipUserManagement = true;
                }
            },

            validateTranslation() {
                const config = this.storedConfig;
                config.enableI18nRTL = this.isI18nRTLSupportNecessary(config.languages);

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
    _parseApplicationTypeApp() {
        const config = this.storedConfig;
        if (config.applicationType === 'microservice') {
            config.skipClient = true;
            config.skipUserManagement = true;
        }
        if (config.applicationType === 'uaa') {
            config.skipClient = true;
            config.skipUserManagement = false;
            config.authenticationType = 'uaa';
        }
    }

    _validateSkip() {
        const generator = this;
        if (generator.storedConfig.skipServer && generator.storedConfig.skipClient) {
            generator.error(`You can not pass both ${chalk.yellow('--skip-client')} and ${chalk.yellow('--skip-server')} together`);
        }
    }

    _serverExistingProject() {
        const config = this.storedConfig;
        // Keep old existingProject logic.
        const serverConfigFound =
            config.packageName !== undefined &&
            config.authenticationType !== undefined &&
            config.cacheProvider !== undefined &&
            config.enableHibernateCache !== undefined &&
            config.websocket !== undefined &&
            config.databaseType !== undefined &&
            config.devDatabaseType !== undefined &&
            config.prodDatabaseType !== undefined &&
            config.searchEngine !== undefined &&
            config.buildTool !== undefined &&
            config.baseName !== undefined;

        if (serverConfigFound) {
            this.log(
                chalk.green(
                    'This is an existing project, using the configuration from your .yo-rc.json file \nto re-generate the project...\n'
                )
            );
            return true;
        }
        return false;
    }

    _configureServerPrompt() {
        if (this.serverExistingProject) return;
        const config = this.storedConfig;

        // JWT authentication is mandatory with Eureka, so the JHipster Registry
        // can control the applications
        if (config.serviceDiscoveryType === 'eureka' && config.authenticationType !== 'uaa' && config.authenticationType !== 'oauth2') {
            config.authenticationType = 'jwt';
        }

        if (config.authenticationType === 'session') {
            config.rememberMeKey = getRandomHex();
        }

        if (config.authenticationType === 'jwt' || config.applicationType === 'microservice') {
            config.jwtSecretKey = getBase64Secret(null, 64);
        }

        // user-management will be handled by UAA app, oauth expects users to be managed in IpP
        if ((config.applicationType === 'gateway' && config.authenticationType === 'uaa') || config.authenticationType === 'oauth2') {
            config.skipUserManagement = true;
        }

        if (config.applicationType === 'uaa') {
            config.authenticationType = 'uaa';
        }

        if (config.reactive) {
            config.cacheProvider = 'no';
        }
        if (config.serverPort === undefined) {
            config.serverPort = '8080';
        }
        if (config.databaseType === 'no') {
            config.devDatabaseType = 'no';
            config.prodDatabaseType = 'no';
            config.enableHibernateCache = false;
            if (config.authenticationType !== 'uaa') {
                config.skipUserManagement = true;
            }
        } else if (config.databaseType === 'mongodb') {
            config.devDatabaseType = 'mongodb';
            config.prodDatabaseType = 'mongodb';
            config.enableHibernateCache = false;
        } else if (config.databaseType === 'couchbase') {
            config.devDatabaseType = 'couchbase';
            config.prodDatabaseType = 'couchbase';
            config.enableHibernateCache = false;
        } else if (config.databaseType === 'cassandra') {
            config.devDatabaseType = 'cassandra';
            config.prodDatabaseType = 'cassandra';
            config.enableHibernateCache = false;
        }
    }

    _configureServer() {
        const config = this.storedConfig;
        if (config.websocket === 'no') {
            config.websocket = false;
        }
        if (config.searchEngine === 'no') {
            config.searchEngine = false;
        }
        if (config.messageBroker === 'no') {
            config.messageBroker = false;
        }

        if (config.serviceDiscoveryType === 'no') {
            config.serviceDiscoveryType = false;
        }

        config.cacheProvider = config.cacheProvider || config.hibernateCache || 'no';
        config.enableHibernateCache = config.enableHibernateCache && !['no', 'memcached'].includes(config.cacheProvider);

        if (config.databaseType === 'mongodb') {
            config.devDatabaseType = 'mongodb';
            config.prodDatabaseType = 'mongodb';
            config.enableHibernateCache = false;
        } else if (config.databaseType === 'couchbase') {
            config.devDatabaseType = 'couchbase';
            config.prodDatabaseType = 'couchbase';
            config.enableHibernateCache = false;
        } else if (config.databaseType === 'cassandra') {
            config.devDatabaseType = 'cassandra';
            config.prodDatabaseType = 'cassandra';
            config.enableHibernateCache = false;
        } else if (config.databaseType === 'no') {
            config.devDatabaseType = 'no';
            config.prodDatabaseType = 'no';
            config.enableHibernateCache = false;
            if (config.authenticationType !== 'uaa') {
                config.skipUserManagement = true;
            }
        }

        // force variables unused by microservice applications
        if (config.applicationType === 'microservice' || config.applicationType === 'uaa') {
            config.websocket = false;
        }

        if (config.entitySuffix === config.dtoSuffix) {
            this.error('Entities cannot be generated as the entity suffix and DTO suffix are equals !');
        }

        // Generate remember me key if key does not already exist in config
        if (config.authenticationType === 'session' && config.rememberMeKey === undefined) {
            config.rememberMeKey = getRandomHex();
        }

        // Generate JWT secret key if key does not already exist in config
        if (config.authenticationType === 'jwt' && config.jwtSecretKey === undefined) {
            config.jwtSecretKey = getBase64Secret(null, 64);
        }

        // user-management will be handled by UAA app, oauth expects users to be managed in IpP
        if ((config.applicationType === 'gateway' && config.authenticationType === 'uaa') || config.authenticationType === 'oauth2') {
            config.skipUserManagement = true;
        }

        config.packageFolder = config.packageName.replace(/\./g, '/');

        if (config.authenticationType === 'uaa' && !config.uaaBaseName) {
            const uaaAppData = this.getUaaAppName('../uaa');
            config.uaaBaseName = uaaAppData ? uaaAppData.baseName : undefined;
        }
    }
};
