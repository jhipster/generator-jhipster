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
const BaseBlueprintGenerator = require('../generator-base-blueprint');
const appPrompts = require('../app/prompts');

// Migrate to local variables with yeoman-generator 4.1.1 | 4.2.0
let useBlueprints;
let prompts;

module.exports = class extends BaseBlueprintGenerator {
    constructor(args, opts) {
        super(args, opts);

        this.generatorSource = this.options.generatorSource;
        if (!this.generatorSource) {
            this.error('Config module must have a generator source.');
        }

        this.configOptions = this.options.configOptions || {};

        useBlueprints = !opts.fromBlueprint && this.instantiateBlueprints('config');

        prompts = this.options.configPrompts || { ...appPrompts.configModule };
    }

    _initializing() {
        return prompts.initializingPrompts;
    }

    get initializing() {
        if (useBlueprints) return;
        return this._initializing();
    }

    _prompting() {
        return prompts.promptingPrompts;
    }

    get prompting() {
        if (useBlueprints) return;
        return this._prompting();
    }

    _configuring() {
        return prompts.configuringPrompts;
    }

    get configuring() {
        if (useBlueprints) return;
        return this._configuring();
    }
};
