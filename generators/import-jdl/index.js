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

/**
 * This sub-generatot is deprecated. Import JDL is now handled by JHipster CLI. See "./cli/import-jdl.js"
 */
module.exports = class extends BaseGenerator {
    initializing() {
        if (!this.options['from-cli']) {
            this.warning('Deprecated: JHipster seems to be invoked using Yeoman command. Please use the JHipster CLI');
            this.error(`Deprecated: Run ${chalk.red('jhipster import-jdl')} instead of ${chalk.red('yo jhipster:import-jdl')}`);
        }
    }
};
