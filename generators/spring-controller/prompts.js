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
const jhiCore = require('jhipster-core');

module.exports = {
    askForControllerActions
};

function askForControllerActions() {
    const askForControllerAction = done => {
        const prompts = [
            {
                type: 'confirm',
                name: 'actionAdd',
                message: 'Do you want to add an action to your controller?',
                default: true
            },
            {
                when: response => response.actionAdd === true,
                type: 'input',
                name: 'actionName',
                validate: input => {
                    if (!/^([a-zA-Z0-9_]*)$/.test(input)) {
                        return 'Your action name cannot contain special characters';
                    }
                    if (input === '') {
                        return 'Your action name cannot be empty';
                    }
                    if (input.charAt(0) === input.charAt(0).toUpperCase()) {
                        return 'Your action name cannot start with an upper case letter';
                    }
                    if (jhiCore.isReservedFieldName(input)) {
                        return 'Your action name cannot contain a Java, Angular or React reserved keyword';
                    }

                    return true;
                },
                message: 'What is the name of your action?'
            },
            {
                when: response => response.actionAdd === true,
                type: 'list',
                name: 'actionMethod',
                message: 'What is the HTTP method of your action?',
                choices: [
                    {
                        name: 'POST',
                        value: 'Post'
                    },
                    {
                        name: 'GET',
                        value: 'Get'
                    },
                    {
                        name: 'PUT',
                        value: 'Put'
                    },
                    {
                        name: 'DELETE',
                        value: 'Delete'
                    }
                ],
                default: 1
            }
        ];

        if (!this.defaultOption) {
            this.prompt(prompts).then(props => {
                if (props.actionAdd) {
                    const controllerAction = {
                        actionName: props.actionName,
                        actionMethod: props.actionMethod
                    };

                    this.controllerActions.push(controllerAction);

                    askForControllerAction(done);
                } else {
                    done();
                }
            });
        } else {
            done();
        }
    };

    const done = this.async();
    askForControllerAction(done);
}
