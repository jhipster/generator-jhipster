/**
 * Copyright 2013-2017 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://jhipster.github.io/
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

function askForClient() {
    if (this.existingProject) return;

    const done = this.async();
    const applicationType = this.applicationType;

    this.prompt({
        type: 'list',
        name: 'clientFramework',
        when: response => (applicationType !== 'microservice' && applicationType !== 'uaa'),
        message: response => this.getNumberedQuestion('Which *Framework* would you like to use for the client?',
            applicationType !== 'microservice' && applicationType !== 'uaa'),
        choices: [
            {
                value: 'angularX',
                name: 'Angular 4'
            },
            {
                value: 'angular1',
                name: 'AngularJS 1.x'
            }
        ],
        default: 'angularX'
    }).then((prompt) => {
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
            message: response => this.getNumberedQuestion('Would you like to use the LibSass stylesheet preprocessor for your CSS?', true),
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
