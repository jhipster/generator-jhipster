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
const path = require('path');
const shelljs = require('shelljs');
const request = require('sync-request');

module.exports = {
    askActionType,
    askExistingAvailableDocs,
    askGenerationInfos
};

function fetchSwaggerResources(input) {
    const availableDocs = [];

    const baseUrl = input.replace(/\/$/, '');
    const swaggerResources = request('GET', `${baseUrl}/swagger-resources`, {
        // This header is needed to use the custom /swagger-resources controller
        // and not the default one that has only the gateway's swagger resource
        headers: { Accept: 'application/json, text/javascript;' }
    });

    JSON.parse(swaggerResources.getBody()).forEach(swaggerResource => {
        const specPath = swaggerResource.location.replace(/^\/+/g, '');
        availableDocs.push({
            value: { url: `${baseUrl}/${specPath}`, name: swaggerResource.name },
            name: `${swaggerResource.name} (${swaggerResource.location})`
        });
    });

    return availableDocs;
}

function askActionType() {
    if (this.options.regen) {
        return;
    }

    const done = this.async();

    const hasExistingApis = Object.keys(this.openApiClients).length !== 0;

    const actionList = [
        {
            value: 'new',
            name: 'Generate a new API client'
        }
    ];

    if (hasExistingApis) {
        actionList.push({ value: 'all', name: 'Generate all stored API clients' });
        actionList.push({ value: 'select', name: 'Select stored API clients to generate' });
    }

    const newClient = actionList.length === 1;

    const prompts = [
        {
            when: !newClient,
            type: 'list',
            name: 'action',
            message: 'What do you want to do ?',
            choices: actionList
        },
        {
            when: response => response.action === 'new' || newClient,
            type: 'list',
            name: 'specOrigin',
            message: 'Where do you want to import your OpenAPI/Swagger specification from ?',
            choices: [
                { value: 'jhipster-endpoint', name: 'From a Jhipster /swagger-resources live doc endpoint' },
                { value: 'jhipster-directory', name: 'From the api.yml spec of an existing Jhipster project' },
                { value: 'custom-endpoint', name: 'From a custom specification file or endpoint' }
            ]
        },
        {
            when: response => response.specOrigin === 'jhipster-endpoint',
            type: 'input',
            name: 'jhipsterEndpoint',
            message: 'Enter the URL of the running Jhipster instance',
            default: 'http://localhost:8080',
            validate: input => {
                try {
                    const availableDocs = fetchSwaggerResources(input);

                    if (availableDocs.length === 0) {
                        return `No live doc found at ${input}`;
                    }
                    return true;
                } catch (err) {
                    return `Error while fetching live doc from '${input}'. "${err.message}"`;
                }
            }
        },
        {
            when: response => response.specOrigin === 'jhipster-directory',
            type: 'input',
            name: 'jhipsterDirectory',
            message: 'Enter the path to the jhipster project root directory',
            default: '../',
            validate: input => {
                let fromPath;
                if (path.isAbsolute(input)) {
                    fromPath = `${input}/src/main/resources/swagger/api.yml`;
                } else {
                    fromPath = this.destinationPath(`${input}/src/main/resources/swagger/api.yml`);
                }

                if (shelljs.test('-f', fromPath)) {
                    return true;
                }
                return `api.yml not found in ${input}/`;
            }
        },
        {
            when: response => response.specOrigin === 'custom-endpoint',
            type: 'input',
            name: 'customEndpoint',
            message: 'Where is your Swagger/OpenAPI spec (URL or path) ?',
            default: 'http://petstore.swagger.io/v2/swagger.json',
            store: true,
            validate: input => {
                try {
                    if (/^((http|https):\/\/)/.test(input)) {
                        request('GET', `${input}`, {
                            // headers: { Accept: 'application/json, text/javascript;' }
                        });
                    } else if (!shelljs.test('-f', input)) {
                        return `file '${input}' not found`;
                    }
                    return true;
                } catch (err) {
                    return `Cannot read from ${input}. ${err.message}`;
                }
            }
        }
    ];

    this.prompt(prompts).then(props => {
        if (props.jhipsterEndpoint !== undefined) {
            props.availableDocs = fetchSwaggerResources(props.jhipsterEndpoint);
        } else if (props.jhipsterDirectory !== undefined) {
            props.inputSpec = `${props.jhipsterDirectory}/src/main/resources/swagger/api.yml`;
        } else if (props.customEndpoint !== undefined) {
            props.inputSpec = props.customEndpoint;
        }

        if (newClient) {
            props.action = 'new';
        }

        props.generatorName = 'spring';

        this.props = props;
        done();
    });
}

function askExistingAvailableDocs() {
    if (this.options.regen) {
        return;
    }
    const done = this.async();

    const prompts = [
        {
            when: !this.options.regen && this.props.availableDocs !== undefined,
            type: 'list',
            name: 'availableDoc',
            message: 'Select the doc for which you want to create a client',
            choices: this.props.availableDocs
        }
    ];

    this.prompt(prompts).then(props => {
        if (props.availableDoc !== undefined) {
            this.props.inputSpec = props.availableDoc.url;
            this.props.cliName = props.availableDoc.name;
        }
        done();
    });
}

function askGenerationInfos() {
    if (this.options.regen) {
        return;
    }

    const done = this.async();
    const prompts = [
        {
            when:
                this.props.specOrigin === 'jhipster-endpoint' &&
                this.config.get('serviceDiscoveryType') === 'eureka' &&
                this.props.generatorName === 'spring',
            type: 'confirm',
            name: 'useServiceDiscovery',
            message: 'Do you want to use Eureka service discovery ?',
            default: true
        },
        {
            when: response => this.props.action === 'new' && !response.useServiceDiscovery,
            type: 'input',
            name: 'cliName',
            message: 'What is the unique name for your API client ?',
            default: this.props.cliName || 'petstore',
            validate: input => {
                if (!/^([a-zA-Z0-9_]*)$/.test(input)) {
                    return 'Your API client name cannot contain special characters or a blank space';
                }
                if (input === '') {
                    return 'Your API client name cannot be empty';
                }
                return true;
            }
        },
        {
            when: this.props.action === 'new',
            type: 'confirm',
            name: 'saveConfig',
            message: 'Do you want to save this config for future reuse ?',
            default: false
        },
        {
            when: this.props.action === 'select',
            type: 'checkbox',
            name: 'selected',
            message: 'Select which APIs you want to generate',
            choices: () => {
                const choices = [];
                Object.keys(this.openApiClients).forEach(cliName => {
                    choices.push({
                        name: `${cliName} (${this.openApiClients[cliName].spec})`,
                        value: { cliName, spec: this.openApiClients[cliName] }
                    });
                });
                return choices;
            }
        }
    ];

    this.prompt(prompts).then(props => {
        if (props.cliName !== undefined) {
            this.props.cliName = props.cliName;
        }
        this.props.saveConfig = props.saveConfig;
        this.props.selected = props.selected;
        done();
    });
}
