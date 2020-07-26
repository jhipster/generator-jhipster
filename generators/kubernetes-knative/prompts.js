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
const k8sPrompts = require('../kubernetes/prompts');

module.exports = {
    askForGeneratorType,
    ...k8sPrompts,
};

function askForGeneratorType() {
    if (this.regenerate) return;

    const done = this.async();
    const prompts = [
        {
            type: 'list',
            name: 'generatorType',
            message: 'Which *type* of generator would you like to base this on?',
            choices: [
                {
                    value: 'k8s',
                    name: 'Kubernetes generator',
                },
                {
                    value: 'helm',
                    name: 'Helm Kubernetes generator',
                },
            ],
            default: this.generatorType ? this.generatorType : 'k8s',
        },
    ];

    this.prompt(prompts).then(props => {
        this.generatorType = props.generatorType;
        done();
    });
}
