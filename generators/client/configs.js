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

module.exports = {
    client: {
        framework: {
            persistent: true,
            varName: 'clientFramework',
            dependsOn: ['base.applicationType'],
            async prompt(generator, repository) {
                if (repository.clientFramework !== undefined) return;
                const done = generator.async();
                const applicationType = repository.applicationType;

                const choices = [
                    {
                        value: 'angularX',
                        name: 'Angular'
                    },
                    {
                        value: 'react',
                        name: 'React'
                    },
                    {
                        value: 'no',
                        name: 'No client'
                    }
                ];

                const PROMPT = {
                    type: 'list',
                    name: 'clientFramework',
                    when: response => applicationType !== 'microservice' && applicationType !== 'uaa',
                    message: `Which ${chalk.yellow('*Framework*')} would you like to use for the client?`,
                    choices,
                    default: 'angularX'
                };

                const answers = await generator.prompt(PROMPT);
                repository.clientFramework = answers.clientFramework;
                this.installOption(generator, 'clientFramework', repository.clientFramework);

                if (repository.clientFramework === 'no') {
                    repository.skipClient = true;
                    this.installOption(generator, 'skipClient', repository.skipClient);
                }

                done();
            }
        },
        clientTheme: {
            persistent: true,
            varName: 'clientTheme',
            dependsOn: ['client.framework'],
            prompt(generator, repository) {
                if (repository.clientTheme !== undefined || repository.skipClient) return;
                const done = generator.async();

                const defaultChoices = [
                    {
                        value: 'none',
                        name: 'Default JHipster'
                    },
                    { value: 'cerulean', name: 'Cerulean' },
                    { value: 'cosmo', name: 'Cosmo' },
                    { value: 'cerulean', name: 'Cyborg' },
                    { value: 'darkly', name: 'Darkly' },
                    { value: 'flatly', name: 'Flatly' },
                    { value: 'journal', name: 'Journal' },
                    { value: 'litera', name: 'Litera' },
                    { value: 'lumen', name: 'Lumen' },
                    { value: 'lux', name: 'Lux' },
                    { value: 'materia', name: 'Materia' },
                    { value: 'minty', name: 'Minty' },
                    { value: 'pulse', name: 'Pulse' },
                    { value: 'sandstone', name: 'Sandstone' },
                    { value: 'simplex', name: 'Simplex' },
                    { value: 'sketchy', name: 'Sketchy' },
                    { value: 'slate', name: 'Slate' },
                    { value: 'solar', name: 'Solar' },
                    { value: 'spacelab', name: 'Spacelab' },
                    { value: 'superhero', name: 'Superhero' },
                    { value: 'united', name: 'United' },
                    { value: 'yeti', name: 'Yeti' }
                ];

                const PROMPT = {
                    type: 'list',
                    name: 'clientTheme',
                    message: 'Would you like to use a Bootswatch theme (https://bootswatch.com/)?',
                    choices: defaultChoices,
                    default: 'none'
                };

                generator.httpsGet(
                    'https://bootswatch.com/api/4.json',
                    // eslint-disable-next-line consistent-return
                    body => {
                        try {
                            const { themes } = JSON.parse(body);

                            PROMPT.choices = [
                                {
                                    value: 'none',
                                    name: 'Default JHipster'
                                },
                                ...themes.map(theme => ({
                                    value: theme.name.toLowerCase(),
                                    name: theme.name
                                }))
                            ];

                            promptQuestion(PROMPT, done, generator, this);
                        } catch (err) {
                            generator.warning('Could not fetch bootswatch themes from API. Using default ones.');
                            promptQuestion(PROMPT, done, generator, this);
                        }
                    },
                    () => {
                        generator.warning('Could not fetch bootswatch themes from API. Using default ones.');
                        promptQuestion(PROMPT, done, generator, this);
                    }
                );
            }
        },
        clientThemeVariant: {
            persistent: true,
            varName: 'clientThemeVariant',
            dependsOn: ['client.framework'],
            async prompt(generator, repository) {
                if (repository.clientThemeVariant !== undefined || repository.skipClient) return;

                if (repository.clientTheme === 'none') {
                    repository.clientThemeVariant = '';
                    return;
                }

                const done = generator.async();

                const choices = [{ value: 'primary', name: 'Primary' }, { value: 'dark', name: 'Dark' }, { value: 'light', name: 'Light' }];

                const PROMPT = {
                    type: 'list',
                    name: 'clientThemeVariant',
                    message: 'Choose a Bootswatch variant navbar theme (https://bootswatch.com/)?',
                    choices,
                    default: 'primary'
                };

                const answers = await generator.prompt(PROMPT);
                repository.clientThemeVariant = answers.clientThemeVariant;

                done();
            }
        }
    }
};

function promptQuestion(PROMPT, done, generator, configuration) {
    generator.prompt(PROMPT).then(prompt => {
        generator.clientTheme = prompt.clientTheme;
        configuration.installOption(generator, 'clientTheme', prompt.clientTheme);
        done();
    });
}
