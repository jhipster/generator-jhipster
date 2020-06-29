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
const EntityClientGenerator = require('generator-jhipster/generators/entity-client');
const jhipsterUtils = require('generator-jhipster/generators/utils');
const chalk = require('chalk');
const prompts = require('./prompts');
const writeFiles = require('./files').writeFiles;

module.exports = class extends EntityClientGenerator {
    constructor(args, opts) {
        super(args, Object.assign({ fromBlueprint: true }, opts)); // fromBlueprint variable is important
        // Get missing configuration
        const configuration = jhipsterUtils.getAllJhipsterConfig(null, true);
        this.skipClient = configuration.skipClient;
        this.clientPackageManager = configuration.clientPackageManager;
        this.enableTranslation = configuration.enableTranslation;
        this.protractorTests = configuration.testFrameworks && configuration.testFrameworks.includes('protractor');
    }

    get prompting() {
        // The prompting phase is being overridden so that we can ask our own questions
        return {
            askForPage: prompts.askForPage
        };
    }

    get writing() {
        return {
            writeAdditionalFile() {
                writeFiles.call(this);
            }
        };
    }

    get end() {
        return {
            end() {
                if (!this.options['skip-install'] && !this.skipClient) {
                    this.rebuildClient();
                }
                this.log(chalk.bold.green(`Page ${this.pageName} generated successfully.`));
            }
        };
    }
};
