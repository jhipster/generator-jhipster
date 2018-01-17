/**
 * Copyright 2013-2018 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see http://www.jhipster.tech/
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

module.exports = {
    askForModuleName,
    askForClient,
    askForClientSideOpts,
    askFori18n
};

function askForModuleName() {
    if (this.baseName) return;

    this.askModuleName(this);
}

function askForClient(meta) {
    if (!meta && this.existingProject) return;

    const applicationType = this.applicationType;

    const choices = [
        {
            value: 'angularX',
            name: 'Angular 5'
        }
    ];

    if (this.authenticationType !== 'oauth2') {
        choices.push({
            value: 'angular1',
            name: 'AngularJS 1.x'
        });
        if (this.experimental) {
            choices.push({
                value: 'react',
                name: '[EXPERIMENTAL] React'
            });
        }
    }

    const PROMPT = {
        type: 'list',
        name: 'clientFramework',
        when: response => (applicationType !== 'microservice' && applicationType !== 'uaa'),
        message: `Which ${chalk.yellow('*Framework*')} would you like to use for the client?`,
        choices,
        default: 'angularX'
    };

    if (meta) return PROMPT; // eslint-disable-line consistent-return

    const done = this.async();

    this.prompt(PROMPT).then((prompt) => {
        this.clientFramework = prompt.clientFramework;
        done();
    });
}

function askForClientSideOpts() {
    if (this.existingProject) return;

    const done = this.async();
    const prompts = [
        {
            type: 'confirm',
            name: 'useSass',
            message: `Would you like to enable ${chalk.yellow('*SASS*')} support using the LibSass stylesheet preprocessor?`,
            default: false
        }
    ];
    this.prompt(prompts).then((props) => {
        this.useSass = props.useSass;
        done();
    });
}

function askFori18n() {
    if (this.existingProject || this.configOptions.skipI18nQuestion) return;

    this.aski18n(this);
}
