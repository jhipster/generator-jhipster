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
const debug = require('debug')('jhipster:common');

const BaseBlueprintGenerator = require('../generator-base-blueprint');
const writeFiles = require('./files').writeFiles;
const prettierConfigFiles = require('./files').prettierConfigFiles;
const constants = require('../generator-constants');
const prompts = require('../app/prompts');

module.exports = class extends BaseBlueprintGenerator {
    constructor(args, opts) {
        super(args, opts);

        // eslint-disable-next-line global-require
        require('../interceptor').registerDiff(this);

        debug(`Initializing ${this.rootGeneratorName()}:common generator`);

        // This adds support for a `--from-cli` flag
        this.option('from-cli', {
            desc: 'Indicates the command is run from JHipster CLI',
            type: Boolean,
            defaults: false
        });

        this.loadOptions('storage', ['base-name', 'uaa-base-name', 'skip-user-management']);
        this.installShared();

        this.useBlueprints = !this.fromBlueprint && this.instantiateBlueprints('common', { 'client-hook': !this.skipClient });

        debug(`${this.existingProject}`);
        debug('%o', this.storedConfig);
    }

    // Public API method used by the getter and also by Blueprints
    _initializing() {
        return {
            loadSharedData() {
                this.installShared();
            },

            validateFromCli() {
                this.checkInvocationFromCLI();
            },

            setupConsts() {
                // Make constants available in templates
                this.MAIN_DIR = constants.MAIN_DIR;
                this.TEST_DIR = constants.TEST_DIR;
                this.SERVER_MAIN_RES_DIR = constants.SERVER_MAIN_RES_DIR;
                this.CLIENT_MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR;
                this.CLIENT_TEST_SRC_DIR = constants.CLIENT_TEST_SRC_DIR;
                this.BUILD_DIR = this.getBuildDirectoryForBuildTool(this.buildTool);
                this.CLIENT_DIST_DIR = this.getResourceBuildDirectoryForBuildTool(this.configOptions.buildTool) + constants.CLIENT_DIST_DIR;

                // Make documentation URL available in templates
                this.DOCUMENTATION_URL = constants.JHIPSTER_DOCUMENTATION_URL;
                this.DOCUMENTATION_ARCHIVE_PATH = constants.JHIPSTER_DOCUMENTATION_ARCHIVE_PATH;
            },

            askForInsightOptIn: prompts.askForInsightOptIn,
            askForApplicationType: prompts.askForApplicationType,
            askForModuleName: prompts.askForModuleName,

            setup() {
                // Load prompts
                this.installShared();

                this.configOptions.skipI18nQuestion = true;
                this.configOptions.logo = false;

                this.generatorType = 'app';
                if (this.applicationType === 'microservice') {
                    this.generatorType = 'server';
                    this.storedConfig.skipClient = true;
                    this.storedConfig.skipUserManagement = true;
                }
                if (this.applicationType === 'uaa') {
                    this.generatorType = 'server';
                    this.storedConfig.skipClient = true;
                    this.storedConfig.skipUserManagement = false;
                    this.storedConfig.authenticationType = 'uaa';
                }
                if (this.storedConfig.skipClient) {
                    // defaults to use when skipping client
                    this.generatorType = 'server';
                }
                if (this.storedConfig.skipServer) {
                    // defaults to use when skipping server
                    this.generatorType = 'client';
                    this.storedConfig.databaseType = this.getDBTypeFromDBValue(this.options.db);
                    this.storedConfig.devDatabaseType = this.options.db;
                    this.storedConfig.prodDatabaseType = this.options.db;
                    this.configOptions.useYarn = this.useYarn;
                }
            }
        };
    }

    get initializing() {
        if (this.useBlueprints) return;
        return this._initializing();
    }

    _prompting() {
        return {
            loadSharedData() {
                this.installShared();
            },

            askFori18n: prompts.askFori18n
        };
    }

    get prompting() {
        if (this.useBlueprints) return;
        return this._prompting();
    }

    _configuring() {
        return {
            loadSharedData() {
                this.installShared();
            },

            composeLanguages() {
                this.composeLanguagesSub(this, this.configOptions, this.generatorType);
            },

            askForTestOpts: prompts.askForTestOpts,
            askForMoreModules: prompts.askForMoreModules
        };
    }

    get configuring() {
        if (this.useBlueprints) return;
        return this._configuring();
    }

    // Public API method used by the getter and also by Blueprints
    _default() {
        return {
            loadSharedData() {
                this.installShared();
            },

            validate() {
                if (this.storedConfig.authenticationType === 'uaa' && this._.isNil(this.storedConfig.uaaBaseName)) {
                    this.error('when using --auth uaa, a UAA basename must be provided with --uaa-base-name');
                }
            },

            getSharedConfigOptions() {
                this.protractorTests = this.testFrameworks.includes('protractor');
                this.gatlingTests = this.testFrameworks.includes('gatling');
                this.cacheProvider = this.cacheProvider || this.hibernateCache || 'no';
            },
            writePrettierConfig() {
                // Prettier configuration needs to be the first written files - all subgenerators considered - for prettier transform to work
                this.writeFilesToDisk(prettierConfigFiles, this, false, this.fetchFromInstalledJHipster('common/templates'));
            }
        };
    }

    get default() {
        if (this.useBlueprints) return;
        return this._default();
    }

    // Public API method used by the getter and also by Blueprints
    _writing() {
        return writeFiles();
    }

    get writing() {
        if (this.useBlueprints) return;
        return this._writing();
    }
};
