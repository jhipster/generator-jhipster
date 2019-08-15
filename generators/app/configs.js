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

const statistics = require('../statistics');

module.exports = {
    base: {
        initConfiguration: {
            persistent: false,
            cli: true,
            cliName: 'init-configuration',
            spec: {
                desc: 'Flag that indicates the initial entry point for configurations',
                type: Boolean,
                defaults: false
            }
        },
        skipChecks: {
            persistent: false,
            cli: true,
            cliName: 'skip-checks',
            spec: {
                desc: 'Check the status of the required tools',
                type: Boolean,
                defaults: false
            }
        },
        newConfiguration: {
            persistent: false,
            cli: true,
            cliName: 'new-configuration',
            spec: {
                desc: 'Use new configuration',
                type: Boolean,
                defaults: false
            }
        },
        fromCli: {
            persistent: false,
            cli: true,
            cliName: 'from-cli',
            spec: {
                desc: 'Indicates the command is run from JHipster CLI',
                type: Boolean,
                defaults: false
            }
        },
        jhiPrefix: {
            persistent: true,
            cli: true,
            cliName: 'jhi-prefix',
            spec: {
                desc: 'Add prefix before services, controllers and states name',
                type: String,
                defaults: 'jhi'
            }
        },
        applicationType: {
            persistent: true,
            varName: 'applicationType',
            async prompt(generator, repository) {
                if (generator.existingProject) return;

                const DEFAULT_APPTYPE = 'monolith';

                const applicationTypeChoices = [
                    {
                        value: DEFAULT_APPTYPE,
                        name: 'Monolithic application (recommended for simple projects)'
                    },
                    {
                        value: 'microservice',
                        name: 'Microservice application'
                    },
                    {
                        value: 'gateway',
                        name: 'Microservice gateway'
                    },
                    {
                        value: 'uaa',
                        name: 'JHipster UAA server (for microservice OAuth2 authentication)'
                    }
                ];

                if (generator.experimental) {
                    applicationTypeChoices.push({
                        value: 'reactive',
                        name: '[Alpha] Reactive monolithic application'
                    });
                    applicationTypeChoices.push({
                        value: 'reactive-micro',
                        name: '[Alpha] Reactive microservice application'
                    });
                }

                const PROMPT = {
                    type: 'list',
                    name: 'applicationType',
                    message: `Which ${chalk.yellow('*type*')} of application would you like to create?`,
                    choices: applicationTypeChoices,
                    default: DEFAULT_APPTYPE
                };

                // if (meta) return PROMPT; // eslint-disable-line consistent-return

                const done = generator.async();

                const answers = await generator.prompt(PROMPT);
                if (answers.applicationType === 'reactive') {
                    repository.applicationType = DEFAULT_APPTYPE;
                    repository.reactive = true;
                } else if (answers.applicationType === 'reactive-micro') {
                    repository.applicationType = 'microservice';
                    repository.reactive = true;
                } else {
                    repository.applicationType = answers.applicationType;
                    repository.reactive = false;
                }
                const configuration = this;
                configuration.installOption(generator, 'applicationType', repository.applicationType);
                configuration.installOption(generator, 'reactive', repository.reactive);
                done();
            }
        },
        baseName: {
            persistent: true,
            varName: 'baseName',
            async prompt(generator, repository) {
                if (repository.baseName !== undefined) return;
                const done = generator.async();
                const defaultAppBaseName = generator.getDefaultAppName();
                const answers = await generator.prompt({
                    type: 'input',
                    name: 'baseName',
                    validate: input => {
                        if (!/^([a-zA-Z0-9_]*)$/.test(input)) {
                            return 'Your base name cannot contain special characters or a blank space';
                        }
                        if ((generator.applicationType === 'microservice' || generator.applicationType === 'uaa') && /_/.test(input)) {
                            return 'Your base name cannot contain underscores as this does not meet the URI spec';
                        }
                        if (generator.applicationType === 'uaa' && input === 'auth') {
                            return "Your UAA base name cannot be named 'auth' as it conflicts with the gateway login routes";
                        }
                        if (input === 'application') {
                            return "Your base name cannot be named 'application' as this is a reserved name for Spring Boot";
                        }
                        return true;
                    },
                    message: 'What is the base name of your application?',
                    default: defaultAppBaseName
                });
                repository.baseName = answers.baseName;
                const configuration = this;
                configuration.installOption(generator, 'baseName', repository.baseName);
                done();
            }
        }
    },
    app: {
        insight: {
            persistent: false,
            varName: 'insight',
            async prompt(generator, repository) {
                if (repository.insight !== undefined) return;
                const done = generator.async();
                const answers = await generator.prompt({
                    when: () => statistics.shouldWeAskForOptIn(),
                    type: 'confirm',
                    name: 'insight',
                    message: `May ${chalk.cyan('JHipster')} anonymously report usage statistics to improve the tool over time?`,
                    default: true
                });
                statistics.setOptoutStatus(!answers.insight);
                repository.insight = answers.insight;

                done();
            }
        },
        testFrameworks: {
            persistent: true,
            varName: 'testFrameworks',
            // queue after client and server (is not a hard dependency)
            promptQueue: 'configuring',
            configQueue: 'default',
            async prompt(generator, repository) {
                if (repository.testFrameworks !== undefined) return;
                const done = generator.async();

                const choices = [];
                const defaultChoice = [];
                if (!repository.skipServer) {
                    // all server side test frameworks should be added here
                    choices.push({ name: 'Gatling', value: 'gatling' }, { name: 'Cucumber', value: 'cucumber' });
                }
                if (!repository.skipClient) {
                    // all client side test frameworks should be added here
                    choices.push({ name: 'Protractor', value: 'protractor' });
                }
                const PROMPT = {
                    type: 'checkbox',
                    name: 'testFrameworks',
                    message: 'Besides JUnit and Jest, which testing frameworks would you like to use?',
                    choices,
                    default: defaultChoice
                };

                const answers = await generator.prompt(PROMPT);
                const configuration = this;
                repository.testFrameworks = answers.testFrameworks;
                configuration.installOption(generator, 'testFrameworks', repository.testFrameworks);

                done();
            }
        }
    }
};
