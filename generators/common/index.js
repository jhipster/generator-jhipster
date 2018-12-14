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
const constants = require('../generator-constants');
const packagejs = require('../../package.json');

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
        this.setupClientOptions(this);
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
                this.SERVER_MAIN_RES_DIR = constants.SERVER_MAIN_RES_DIR;
                this.CLIENT_MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR;
                this.CLIENT_TEST_SRC_DIR = constants.CLIENT_TEST_SRC_DIR;
                this.BUILD_DIR = this.getBuildDirectoryForBuildTool(this.buildTool);
                this.CLIENT_DIST_DIR = this.BUILD_DIR + constants.CLIENT_DIST_DIR;

                this.documentationVersion = packagejs.version;
                // Make documentation URL available in templates
                this.DOCUMENTATION_URL = constants.JHIPSTER_DOCUMENTATION_URL;
                this.DOCUMENTATION_ARCHIVE_URL = `${constants.JHIPSTER_DOCUMENTATION_URL + constants.JHIPSTER_DOCUMENTATION_ARCHIVE_PATH}v${
                    this.documentationVersion
                }`;
            }
        };
    }

    get initializing() {
        if (useBlueprint) return;
        return this._initializing();
    }

    // Public API method used by the getter and also by Blueprints
    _prompting() {
        return {};
    }

    get prompting() {
        if (useBlueprint) return;
        return this._prompting();
    }

    // Public API method used by the getter and also by Blueprints
    _default() {
        return {
            getSharedConfigOptions() {
                this.jhipsterVersion = this.config.get('jhipsterVersion');
                this.applicationType = this.config.get('applicationType') || this.configOptions.applicationType;
                this.enableSwaggerCodegen = this.configOptions.enableSwaggerCodegen;
                this.serverPort = this.configOptions.serverPort;
                this.clientFramework = this.configOptions.clientFramework;
                this.useSass = this.configOptions.useSass;
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
