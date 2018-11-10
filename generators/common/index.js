/**
 * Copyright 2013-2018 the original author or authors from the JHipster project.
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
const BaseBlueprintGenerator = require('../generator-base-blueprint');
const writeFiles = require('./files').writeFiles;
const packagejs = require('../../package.json');
const constants = require('../generator-constants');

let useBlueprint;

module.exports = class extends BaseBlueprintGenerator {
    constructor(args, opts) {
        super(args, opts);

        this.configOptions = this.options.configOptions || {};
        // This adds support for a `--from-cli` flag
        this.option('from-cli', {
            desc: 'Indicates the command is run from JHipster CLI',
            type: Boolean,
            defaults: false
        });

        this.setupServerOptions(this);
        const blueprint = this.options.blueprint || this.configOptions.blueprint || this.config.get('blueprint');
        if (!opts.fromBlueprint) {
            // use global variable since getters dont have access to instance property
            useBlueprint = this.composeBlueprint(blueprint, 'common', {
                'from-cli': this.options['from-cli'],
                configOptions: this.configOptions,
                force: this.options.force
            });
        } else {
            useBlueprint = false;
        }
    }

    // Public API method used by the getter and also by Blueprints
    _initializing() {
        return {
            validateFromCli() {
                if (!this.options['from-cli']) {
                    this.error('This JHipster subgenerator is not intented for standalone use.');
                }
            },

            setupConsts() {
                // Make constants available in templates
                this.TEST_DIR = constants.TEST_DIR;
                this.CLIENT_MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR;
                this.SERVER_MAIN_RES_DIR = constants.SERVER_MAIN_RES_DIR;

                this.packagejs = packagejs;
                const configuration = this.getAllJhipsterConfig(this, true);
                this.applicationType = configuration.get('applicationType') || this.configOptions.applicationType;
                if (!this.applicationType) {
                    this.applicationType = 'monolith';
                }
                this.serverPort = configuration.get('serverPort');
                if (this.serverPort === undefined) {
                    this.serverPort = '8080';
                }

                this.enableSwaggerCodegen = configuration.get('enableSwaggerCodegen');

                this.serviceDiscoveryType =
                    configuration.get('serviceDiscoveryType') === 'no' ? false : configuration.get('serviceDiscoveryType');
                if (this.serviceDiscoveryType === undefined) {
                    this.serviceDiscoveryType = false;
                }

                this.databaseType = configuration.get('databaseType');
                if (this.databaseType === 'mongodb') {
                    this.prodDatabaseType = 'mongodb';
                } else if (this.databaseType === 'couchbase') {
                    this.prodDatabaseType = 'couchbase';
                } else if (this.databaseType === 'cassandra') {
                    this.prodDatabaseType = 'cassandra';
                } else if (this.databaseType === 'no') {
                    // no database, only available for microservice applications
                    this.prodDatabaseType = 'no';
                } else {
                    // sql
                    this.prodDatabaseType = configuration.get('prodDatabaseType');
                }

                this.buildTool = configuration.get('buildTool');
                this.jhipsterVersion = packagejs.version;
                if (this.jhipsterVersion === undefined) {
                    this.jhipsterVersion = configuration.get('jhipsterVersion');
                }
                this.authenticationType = configuration.get('authenticationType');
                this.clientFramework = configuration.get('clientFramework');
                const testFrameworks = configuration.get('testFrameworks');
                if (testFrameworks) {
                    this.testFrameworks = testFrameworks;
                }

                const baseName = configuration.get('baseName');
                if (baseName) {
                    // to avoid overriding name from configOptions
                    this.baseName = baseName;
                }

                // Make documentation URL available in templates
                this.DOCUMENTATION_URL = constants.JHIPSTER_DOCUMENTATION_URL;
                this.DOCUMENTATION_ARCHIVE_URL = `${constants.JHIPSTER_DOCUMENTATION_URL + constants.JHIPSTER_DOCUMENTATION_ARCHIVE_PATH}v${
                    this.jhipsterVersion
                }`;
            }
        };
    }

    get initializing() {
        if (useBlueprint) return;
        return this._initializing();
    }

    // Public API method used by the getter and also by Blueprints
    _configuring() {
        return {
            setSharedConfigOptions() {
                // Make dist dir available in templates
                if (this.buildTool === 'maven') {
                    this.BUILD_DIR = 'target/';
                } else {
                    this.BUILD_DIR = 'build/';
                }
                this.CLIENT_DIST_DIR = this.BUILD_DIR + constants.CLIENT_DIST_DIR;
            }
        };
    }

    get configuring() {
        if (useBlueprint) return;
        return this._configuring();
    }

    // Public API method used by the getter and also by Blueprints
    _default() {
        return {
            getSharedConfigOptions() {
                if (this.configOptions.clientFramework) {
                    this.clientFramework = this.configOptions.clientFramework;
                }
                this.testFrameworks = [];
                if (this.configOptions.testFrameworks) {
                    this.testFrameworks = this.configOptions.testFrameworks;
                }
                this.protractorTests = this.testFrameworks.includes('protractor');
                this.gatlingTests = this.testFrameworks.includes('gatling');
            }
        };
    }

    get default() {
        if (useBlueprint) return;
        return this._default();
    }

    // Public API method used by the getter and also by Blueprints
    _writing() {
        return writeFiles();
    }

    get writing() {
        if (useBlueprint) return;
        return this._writing();
    }
};
