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
const chalk = require('chalk');
const writeFiles = require('./files').writeFiles;
const utils = require('../utils');
const BaseGenerator = require('../generator-base');

let useBlueprint;

module.exports = class extends BaseGenerator {
    constructor(args, opts) {
        super(args, opts);
        utils.copyObjectProps(this, this.options.context);
        const blueprint = this.config.get('blueprint');
        // use global variable since getters dont have access to instance property
        useBlueprint = this.composeBlueprint(blueprint, 'entity-client', {
            context: opts.context,
            force: opts.force,
            debug: opts.context.isDebugEnabled,
            'skip-install': opts.context.options['skip-install']
        });
    }

    get writing() {
        if (useBlueprint) return;
        return writeFiles();
    }

    end() {
        if (useBlueprint) return;
        if (!this.options['skip-install'] && !this.skipClient) {
            this.rebuildClient();
        }
        this.log(chalk.bold.green(`Entity ${this.entityNameCapitalized} generated successfully.`));
    }
};
