/**
 * Copyright 2013-2018 the original author or authors from the JHipster project.
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
    askForKubernetesNamespace,
    askForKubernetesServiceType,
    askForIngressDomain,
    askForIstioSupport,
    askForIstioRouteFiles,
    ...dockerPrompts
};

function askForKubernetesNamespace() {
    if (this.regenerate) return;
    const done = this.async();

    const prompts = [
        {
            type: 'input',
            name: 'kubernetesNamespace',
            message: 'What should we use for the Kubernetes namespace?',
            default: this.kubernetesNamespace ? this.kubernetesNamespace : 'default'
        }
    ];

    this.prompt(prompts).then(props => {
        this.kubernetesNamespace = props.kubernetesNamespace;
        done();
    });
}

function askForKubernetesServiceType() {
    if (this.regenerate) return;
    const done = this.async();

    const prompts = [
        {
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
        }
    ];

    this.prompt(prompts).then(props => {
        this.kubernetesServiceType = props.kubernetesServiceType;
        done();
    });
}

function askForIngressDomain() {
    if (this.regenerate) return;
    const done = this.async();
    const kubernetesServiceType = this.kubernetesServiceType;

    const prompts = [
        {
            when: () => kubernetesServiceType === 'Ingress',
            type: 'input',
            name: 'ingressDomain',
            message:
                'What is the root FQDN for your ingress services (e.g. example.com, sub.domain.co, www.10.10.10.10.xip.io, [namespace.ip]...)?',
            // default to minikube ip
            default: this.ingressDomain ? this.ingressDomain : `${this.kubernetesNamespace}.192.168.99.100.nip.io`,
            validate: input => {
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
        }
    ];

    this.prompt(prompts).then(props => {
        this.ingressDomain = props.ingressDomain;
        done();
    });
}

function askForIstioSupport() {
    if (this.regenerate) return;
    if (this.deploymentApplicationType === 'monolith') {
        this.istio = 'no';
        return;
    }
    const done = this.async();

    const prompts = [
        {
            type: 'list',
            name: 'istio',
            message: 'Do you want to configure Istio?',
            choices: [
                {
                    value: 'no',
                    name: 'Not required'
                },
                {
                    value: 'manualInjection',
                    name: 'Manual sidecar injection (ensure istioctl in $PATH)'
                },
                {
                    value: 'autoInjection',
                    name: 'Label tag namespace as automatic injection is already configured'
                }
            ],
            default: this.istio ? this.istio : 'no'
        }
    ];

    this.prompt(prompts).then(props => {
        this.istio = props.istio;
        done();
    });
}

function askForIstioRouteFiles() {
    if (this.regenerate) return;
    if (this.istio === 'no') {
        this.istioRoute = false;
        return;
    }
    const done = this.async();

    const prompts = [
        {
            type: 'list',
            name: 'istioRoute',
            message: 'Do you want to generate Istio route files?',
            choices: [
                {
                    value: false,
                    name: 'No'
                },
                {
                    value: true,
                    name: 'Yes'
                }
            ],
            default: this.istioRoute
        }
    ];

    this.prompt(prompts).then(props => {
        this.istioRoute = props.istioRoute;
        done();
    });
}
