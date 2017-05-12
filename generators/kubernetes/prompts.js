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
const _ = require('lodash');
const dockerComposePrompts = require('../docker-compose/prompts');

module.exports = _.extend({
    askForKubernetesNamespace,
    askForDockerRepositoryName,
    askForDockerPushCommand
}, dockerComposePrompts);

function askForKubernetesNamespace() {
    const done = this.async();

    const prompts = [{
        type: 'input',
        name: 'kubernetesNamespace',
        message: 'What should we use for the Kubernetes namespace?',
        default: this.kubernetesNamespace ? this.kubernetesNamespace : 'default'
    }];

    this.prompt(prompts).then((props) => {
        this.kubernetesNamespace = props.kubernetesNamespace;
        done();
    });
}

function askForDockerRepositoryName() {
    const done = this.async();

    const prompts = [{
        type: 'input',
        name: 'dockerRepositoryName',
        message: 'What should we use for the base Docker repository name?',
        default: this.dockerRepositoryName
    }];

    this.prompt(prompts).then((props) => {
        this.dockerRepositoryName = props.dockerRepositoryName;
        done();
    });
}

function askForDockerPushCommand() {
    const done = this.async();

    const prompts = [{
        type: 'input',
        name: 'dockerPushCommand',
        message: 'What command should we use for push Docker image to repository?',
        default: this.dockerPushCommand ? this.dockerPushCommand : 'docker push'
    }];

    this.prompt(prompts).then((props) => {
        this.dockerPushCommand = props.dockerPushCommand;
        done();
    });
}
