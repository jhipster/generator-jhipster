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
const BaseBlueprintGenerator = require('../generator-base-blueprint');
const prompts = require('./prompts');
const writeVueFiles = require('./files-vue').writeFiles;
const constants = require('../generator-constants');

const VUE = constants.SUPPORTED_CLIENT_FRAMEWORKS.VUE;

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
        this.option('skip-prompts', {
            desc: 'Skip prompts',
            type: Boolean,
            hide: true,
            defaults: false,
        });
        // This makes it possible to pass `languages` by argument
        this.argument('pageName', {
            type: String,
            required: false,
            description: 'Page name',
        });
        this.pageName = this.options.pageName;

        if (this.options.help) {
            return;
        }

        this.loadRuntimeOptions();

        this.rootGenerator = this.env.rootGenerator() === this;

        useBlueprints = !this.fromBlueprint && this.instantiateBlueprints('page');
    }

    _initializing() {
        return {
            validateFromCli() {
                this.checkInvocationFromCLI();
            },
            loadConfig() {
                this.skipClient = this.jhipsterConfig.skipClient;
                this.clientPackageManager = this.jhipsterConfig.clientPackageManager;
                this.enableTranslation = this.jhipsterConfig.enableTranslation;
                this.protractorTests = this.jhipsterConfig.testFrameworks && this.jhipsterConfig.testFrameworks.includes('protractor');
                this.clientFramework = this.jhipsterConfig.clientFramework;

                if (this.clientFramework !== VUE) {
                    this.error(`This sub generator page is not supported for ${this.clientFramework}`);
                }
            },
        };
    }

    get initializing() {
        if (useBlueprints) return;
        return this._initializing();
    }

    _prompting() {
        return {
            askForPage: prompts.askForPage,
        };
    }

    get prompting() {
        if (useBlueprints) return;
        return this._prompting();
    }

    _configuring() {
        return {
            save() {
                const pages = this.jhipsterConfig.pages || [];
                const page = pages.find(page => page.name === this.pageName);
                if (page) {
                    return;
                }
                this.jhipsterConfig.pages = pages.concat({ name: this.pageName });
            },
        };
    }

    get configuring() {
        if (useBlueprints) return;
        return this._configuring();
    }

    _writing() {
        return {
            writeAdditionalFile() {
                writeVueFiles.call(this);
            },
        };
    }

    get writing() {
        if (useBlueprints) return;
        return this._writing();
    }

    _end() {
        return {
            end() {
                if (!this.rootGenerator || this.options.skipInstall || this.skipClient) return;
                this.rebuildClient();
            },
            success() {
                if (!this.rootGenerator) return;
                this.log(chalk.bold.green(`Page ${this.pageName} generated successfully.`));
            },
        };
    }

    get end() {
        if (useBlueprints) return;
        return this._end();
    }
};
