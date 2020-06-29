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
const BaseBlueprintGenerator = require('../generator-base-blueprint');
const writeFiles = require('./files').writeFiles;
const constants = require('../generator-constants');

let useBlueprints;

module.exports = class extends BaseBlueprintGenerator {
    constructor(args, opts) {
        super(args, opts);

        this.configOptions = this.options.configOptions || {};
        // This adds support for a `--from-cli` flag
        this.option('from-cli', {
            desc: 'Indicates the command is run from JHipster CLI',
            type: Boolean,
            defaults: false,
        });

        this.setupServerOptions(this);
        this.setupClientOptions(this);

        useBlueprints = !this.fromBlueprint && this.instantiateBlueprints('e2e', { 'client-hook': !this.skipClient });
    }

    // Public API method used by the getter and also by Blueprints
    _initializing() {
        return {
            validateFromCli() {
                this.checkInvocationFromCLI();
            },

            setupConsts() {
                // Make constants available in templates
                this.MAIN_DIR = constants.MAIN_DIR;
                this.TEST_DIR = constants.TEST_DIR;
                this.SERVER_MAIN_RES_DIR = constants.SERVER_MAIN_RES_DIR;
                this.ANGULAR = constants.SUPPORTED_CLIENT_FRAMEWORKS.ANGULAR;
                this.BUILD_DIR = this.getBuildDirectoryForBuildTool(this.buildTool);
                this.CLIENT_DIST_DIR = this.getResourceBuildDirectoryForBuildTool(this.configOptions.buildTool) + constants.CLIENT_DIST_DIR;
            },
        };
    }

    get initializing() {
        if (useBlueprints) return;
        return this._initializing();
    }

    // Public API method used by the getter and also by Blueprints
    _default() {
        return {
            getSharedConfigOptions() {
                this.jhipsterVersion = this.config.get('jhipsterVersion');
                this.applicationType = this.config.get('applicationType') || this.configOptions.applicationType;
                this.serverPort = this.configOptions.serverPort;
                this.clientFramework = this.configOptions.clientFramework;
                this.authenticationType = this.config.get('authenticationType') || this.configOptions.authenticationType;
                this.databaseType = this.config.get('databaseType') || this.configOptions.databaseType;
                const baseName = this.config.get('baseName');
                if (baseName) {
                    this.baseName = baseName;
                }
                if (this.configOptions.testFrameworks) {
                    this.testFrameworks = this.configOptions.testFrameworks;
                }
                this.cypressTests = this.testFrameworks.includes('cypress');
            },
        };
    }

    get default() {
        if (useBlueprints) return;
        return this._default();
    }

    // Public API method used by the getter and also by Blueprints
    _writing() {
        return writeFiles();
    }

    get writing() {
        if (useBlueprints) return;
        return this._writing();
    }
};
