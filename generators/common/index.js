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
const prettierConfigFiles = require('./files').prettierConfigFiles;
const constants = require('../generator-constants');

let useBlueprints;

module.exports = class JHipsterCommonGenerator extends BaseBlueprintGenerator {
    constructor(args, opts) {
        super(args, opts);

        // This adds support for a `--from-cli` flag
        this.option('from-cli', {
            desc: 'Indicates the command is run from JHipster CLI',
            type: Boolean,
            defaults: false,
        });

        if (this.options.help) {
            return;
        }

        this.loadStoredAppOptions();
        this.loadRuntimeOptions();

        useBlueprints = !this.fromBlueprint && this.instantiateBlueprints('common');
    }

    // Public API method used by the getter and also by Blueprints
    _initializing() {
        return {
            validateFromCli() {
                this.checkInvocationFromCLI();
            },

            setupConstants() {
                // Make constants available in templates
                this.MAIN_DIR = constants.MAIN_DIR;
                this.TEST_DIR = constants.TEST_DIR;
                this.SERVER_MAIN_RES_DIR = constants.SERVER_MAIN_RES_DIR;
                this.ANGULAR = constants.SUPPORTED_CLIENT_FRAMEWORKS.ANGULAR;

                // Make documentation URL available in templates
                this.DOCUMENTATION_URL = constants.JHIPSTER_DOCUMENTATION_URL;
                this.DOCUMENTATION_ARCHIVE_PATH = constants.JHIPSTER_DOCUMENTATION_ARCHIVE_PATH;
            },
        };
    }

    get initializing() {
        if (useBlueprints) return;
        return this._initializing();
    }

    // Public API method used by the getter and also by Blueprints
    _loading() {
        return {
            loadSharedConfig() {
                this.loadAppConfig();
                this.loadClientConfig();
                this.loadServerConfig();
                this.loadTranslationConfig();
            },
        };
    }

    get loading() {
        if (useBlueprints) return;
        return this._loading();
    }

    // Public API method used by the getter and also by Blueprints
    _preparing() {
        return {
            prepareForTemplates() {
                this.BUILD_DIR = this.getBuildDirectoryForBuildTool(this.buildTool);
                this.CLIENT_DIST_DIR = this.getResourceBuildDirectoryForBuildTool(this.buildTool) + constants.CLIENT_DIST_DIR;
            },
        };
    }

    get preparing() {
        if (useBlueprints) return;
        return this._preparing();
    }

    // Public API method used by the getter and also by Blueprints
    _default() {
        return {
            ...super._missingPreDefault(),

            writePrettierConfig() {
                // Prettier configuration needs to be the first written files - all subgenerators considered - for prettier transform to work
                this.writeFilesToDisk(prettierConfigFiles, this, false, this.fetchFromInstalledJHipster('common/templates'));
            },
        };
    }

    get default() {
        if (useBlueprints) return;
        return this._default();
    }

    // Public API method used by the getter and also by Blueprints
    _writing() {
        return { ...writeFiles(), ...super._missingPostWriting() };
    }

    get writing() {
        if (useBlueprints) return;
        return this._writing();
    }
};
