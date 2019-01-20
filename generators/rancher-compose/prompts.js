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
const dockerPrompts = require('../docker-prompts');

module.exports = {
    askForRancherLoadBalancing,
    ...dockerPrompts
};

function askForRancherLoadBalancing() {
    if (this.regenerate) return;
    const done = this.async();

    const prompts = [
        {
            type: 'confirm',
            name: 'enableRancherLoadBalancing',
            message: 'Would you like to enable rancher load balancing support?',
            default: false
        }
    ];

    this.prompt(prompts).then(props => {
        this.enableRancherLoadBalancing = props.enableRancherLoadBalancing;
        done();
    });
}
