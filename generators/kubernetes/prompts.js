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
const _ = require('lodash');
const dockerPrompts = require('../docker-prompts');

module.exports = _.extend({
    askForKubernetesNamespace,
    askForDockerRepositoryName,
    askForDockerPushCommand,
    askForJhipsterConsole,
    askForPrometheusOperator,
    askForKubernetesServiceType,
    askForIngressDomain
}, dockerPrompts);

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

function askForJhipsterConsole() {
    const done = this.async();

    const prompts = [{
        type: 'confirm',
        name: 'jhipsterConsole',
        message: 'Do you want to use JHipster Console for log aggregation (ELK)?',
        default: this.jhipsterConsole ? this.jhipsterConsole : true
    }];

    this.prompt(prompts).then((props) => {
        this.jhipsterConsole = props.jhipsterConsole;
        done();
    });
}

function askForPrometheusOperator() {
    const done = this.async();

    const prompts = [{
        type: 'confirm',
        name: 'prometheusOperator',
        message: 'Do you want to export your services for Prometheus (needs a running prometheus operator)?',
        default: this.prometheusOperator ? this.prometheusOperator : true
    }];

    this.prompt(prompts).then((props) => {
        this.prometheusOperator = props.prometheusOperator;
        done();
    });
}

function askForKubernetesServiceType() {
    const done = this.async();

    const prompts = [{
        type: 'list',
        name: 'kubernetesServiceType',
        message: 'Choose the kubernetes service type for your edge services',
        choices: [
            {
                value: 'LoadBalancer',
                name: 'LoadBalancer - Let a kubernetes cloud provider automatically assign an IP'
            },
            {
                value: 'NodePort',
                name: 'NodePort - expose the services to a random port (30000 - 32767) on all cluster nodes'
            },
            {
                value: 'Ingress',
                name: 'Ingress - create ingresses for your services. Requires a running ingress controller'
            }
        ],
        default: this.kubernetesServiceType ? this.kubernetesServiceType : 'LoadBalancer'
    }];

    this.prompt(prompts).then((props) => {
        this.kubernetesServiceType = props.kubernetesServiceType;
        done();
    });
}

function askForIngressDomain() {
    const done = this.async();
    const kubernetesServiceType = this.kubernetesServiceType;

    const prompts = [{
        when: () => kubernetesServiceType === 'Ingress',
        type: 'input',
        name: 'ingressDomain',
        message: 'What is the root FQDN for your ingress services (e.g. example.com, sub.domain.co, www.10.10.10.10.xip.io, [namespace.ip]...)?',
        // default to minikube ip
        default: this.ingressDomain ? this.ingressDomain : `${this.kubernetesNamespace}.192.168.99.100.nip.io`,
        validate: (input) => {
            if (input.length === 0) {
                return 'domain name cannot be empty';
            }
            if (input.charAt(0) === '.') {
                return 'domain name cannot start with a "."';
            }
            if (!input.match(/^[\w]+[\w.-]+[\w]{1,}$/)) {
                return 'domain not valid';
            }

            return true;
        }
    }];

    this.prompt(prompts).then((props) => {
        this.ingressDomain = props.ingressDomain;
        done();
    });
}
