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

const chalk = require('chalk');
const BaseGenerator = require('../generator-base');
const prompts = require('./prompts');
const writeFiles = require('./files').writeFiles;

module.exports = class extends BaseGenerator {
    constructor(args, opts) {
        super(args, opts);
        this.option('regen', {
            desc: 'Regenerates all saved clients',
            type: Boolean,
            defaults: false
        });
        this.registerPrettierTransform();
    }

    get initializing() {
        return {
            validateFromCli() {
                this.checkInvocationFromCLI();
            },
            sayHello() {
                // Have Yeoman greet the user.
                this.log(chalk.white('Welcome to the JHipster OpenApi client Sub-Generator'));
            },
            getConfig() {
                this.openApiClients = this.config.get('openApiClients') || {};
            }
        };
    }

    get prompting() {
        return {
            askActionType: prompts.askActionType,
            askExistingAvailableDocs: prompts.askExistingAvailableDocs,
            askGenerationInfos: prompts.askGenerationInfos
        };
    }

    get configuring() {
        return {
            determineApisToGenerate() {
                this.clientsToGenerate = {};
                if (this.options.regen || this.props.action === 'all') {
                    this.clientsToGenerate = this.openApiClients;
                } else if (this.props.action === 'new' || this.props.action === undefined) {
                    this.clientsToGenerate[this.props.cliName] = {
                        spec: this.props.inputSpec,
                        useServiceDiscovery: this.props.useServiceDiscovery,
                        generatorName: this.props.generatorName
                    };
                } else if (this.props.action === 'select') {
                    this.props.selected.forEach(selection => {
                        this.clientsToGenerate[selection.cliName] = selection.spec;
                    });
                }
            },

            saveConfig() {
                if (!this.options.regen && this.props.saveConfig) {
                    this.openApiClients[this.props.cliName] = this.clientsToGenerate[this.props.cliName];
                    this.config.set('openApiClients', this.openApiClients);
                }
            }
        };
    }

    get writing() {
        return writeFiles();
    }

    end() {
        this.log('End of openapi-client generator');
    }
};
