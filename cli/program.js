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
const { Option } = require('commander');

const JHipsterCommand = require('./jhipster-command');
const { version } = require('../package.json');

const moreInfo = `\n  For more info visit ${chalk.blue('https://www.jhipster.tech')}\n`;

const createProgram = () => {
    return (
        new JHipsterCommand()
            .storeOptionsAsProperties(false)
            .passCommandToAction(false)
            .version(version)
            .addHelpText('after', moreInfo)
            // JHipster common options
            .option(
                '--blueprints <value>',
                'A comma separated list of one or more generator blueprints to use for the sub generators, e.g. --blueprints kotlin,vuejs'
            )
            .option('--no-insight', 'Disable insight')
            // Conflicter options
            .option('--force', 'Override every file', false)
            .option('--dry-run', 'Print conflicts', false)
            .option('--whitespace', 'Whitespace changes will not trigger conflicts', false)
            .option('--bail', 'Fail on first conflict', false)
            .option('--skip-regenerate', "Don't regenerate identical files", false)
            .option('--skip-yo-resolve', 'Ignore .yo-resolve files', false)
            .addOption(new Option('--from-jdl', 'Allow every option jdl forwards').default(false).hideHelp())
    );
};

module.exports = {
    createProgram,
    moreInfo,
};
