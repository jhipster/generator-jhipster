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
const chalk = require('chalk');
const BaseBlueprintGenerator = require('../generator-base-blueprint');
const jhipsterUtils = require('../utils');
const prompts = require('./prompts');
const writeFiles = require('./files').writeFiles;

let useBlueprints;
module.exports = class extends BaseBlueprintGenerator {
    constructor(args, opts) {
        super(args, opts);

        if (this.options.help) {
            return;
        }

        this.loadOptions();
        this.loadRuntimeOptions();

        useBlueprints = !this.fromBlueprint && this.instantiateBlueprints('common');
    }

    _initializing() {
        return {
            validateFromCli() {
                this.checkInvocationFromCLI();
            },
            setupConsts() {
                const configuration = this.jhipsterConfig;
                this.skipClient = configuration.skipClient;
                this.clientPackageManager = configuration.clientPackageManager;
                this.enableTranslation = configuration.enableTranslation;
                this.protractorTests = configuration.testFrameworks && configuration.testFrameworks.includes('protractor');
            }
        }
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

    _writing() {
        return {
            writeAdditionalFile() {
                writeFiles.call(this);
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
                if (!this.options['skip-install'] && !this.skipClient) {
                    this.rebuildClient();
                }
                this.log(chalk.bold.green(`Page ${this.pageName} generated successfully.`));
            },
        };
    }

    get end() {
        if (useBlueprints) return;
        return this._end();
    }
};
