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
const prompts = require('./prompts');

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
        force: {
            persistent: false,
            cli: true,
            cliName: 'force',
            spec: {
                desc: 'Force',
                type: Boolean,
                defaults: false
            }
        },
        noninteractive: {
            persistent: false,
            cli: true,
            cliName: 'noninteractive',
            spec: {
                desc: 'Ignore prompts using the default value',
                type: Boolean,
                defaults: false
            },
            // Not implemented
            // dependsOnCli: ['base.force'],
            validateCli(repository) {
                /**
                 * existingProject is different for app, client, server and aws
                 * Using a modified app version.
                 */
                if (this.rootConfig.exists && this.rootConfig.get('baseName') && this.rootConfig.get('applicationType'))
                    repository.noninteractive = true;
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
            prompt: prompts.askForApplicationType
        },
        baseName: {
            persistent: true,
            varName: 'baseName',
            async prompt(meta, configCallback) {
                const generator = this;
                await generator.askModuleName(generator, configCallback);
            }
        }
    },
    app: {
        insight: {
            persistent: false,
            varName: 'insight',
            prompt: prompts.askForInsightOptIn
        },
        testFrameworks: {
            persistent: true,
            varName: 'testFrameworks',
            // queue after client and server (is not a hard dependency)
            promptQueue: 'configuring',
            configQueue: 'default',
            prompt: prompts.askForTestOpts
        }
    }
};
