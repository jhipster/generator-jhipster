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
const execSync = require('child_process').execSync;
const dockerPrompts = require('../docker-prompts');

module.exports = {
    askForKubernetesNamespace,
    askForKubernetesServiceType,
    askForIngressType,
    askForIngressDomain,
    askForIstioSupport,
    askForPersistentStorage,
    askForStorageClassName,
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

    const istio = this.istio;

    const prompts = [
        {
            when: () => istio === false,
            type: 'list',
            name: 'kubernetesServiceType',
            message: 'Choose the Kubernetes service type for your edge services',
            choices: [
                {
                    value: 'LoadBalancer',
                    name: 'LoadBalancer - Let a Kubernetes cloud provider automatically assign an IP'
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

function askForIngressType() {
    if (this.regenerate) return;
    const done = this.async();
    const kubernetesServiceType = this.kubernetesServiceType;

    const prompts = [
        {
            when: () => kubernetesServiceType === 'Ingress',
            type: 'list',
            name: 'ingressType',
            message: 'Choose the Kubernetes Ingress type',
            choices: [
                {
                    value: 'nginx',
                    name: 'NGINX Ingress - choose this if you are running on Minikube'
                },
                {
                    value: 'gke',
                    name: 'Google Kubernetes Engine Ingress - choose this if you are running on GKE'
                }
            ],
            default: this.ingressType ? this.ingressType : 'nginx'
        }
    ];

    this.prompt(prompts).then(props => {
        this.ingressType = props.ingressType;
        done();
    });
}

function askForIngressDomain() {
    if (this.regenerate) return;
    const done = this.async();
    const kubernetesServiceType = this.kubernetesServiceType;
    const istio = this.istio;
    this.ingressDomain = this.ingressDomain && this.ingressDomain.startsWith('.') ? this.ingressDomain.substring(1) : this.ingressDomain;

    const istioIpCommand = "kubectl -n istio-system get svc istio-ingressgateway -o jsonpath='{.status.loadBalancer.ingress[0].ip}'";
    let istioMessage = '';
    let istioIngressIp = '';

    let defaultValue = '';
    if (this.ingressDomain) {
        defaultValue = this.ingressDomain;
    } else if (istio) {
        // If it's Istio, and no previous domain is configured, try to determine the default value
        try {
            istioIngressIp = execSync(istioIpCommand, { encoding: 'utf8' });
            defaultValue = `${istioIngressIp}.nip.io`;
        } catch (ex) {
            istioMessage = `Unable to determine Istio Ingress IP address. You can find the Istio Ingress IP address by running the command line:\n    ${istioIpCommand}`;
        }
    } else if (this.ingressType === 'nginx') {
        defaultValue = '192.168.99.100.nip.io';
    } else {
        defaultValue = 'none';
    }

    const examples = ['example.com', '192.168.99.100.nip.io'];
    if (this.ingressType !== 'nginx' && !istio) {
        examples.push('none');
    }

    const prompts = [
        {
            when: () => kubernetesServiceType === 'Ingress' || istio === true,
            type: 'input',
            name: 'ingressDomain',
            message: `${istioMessage}${istioMessage ? '\n' : ''}What is the root FQDN for your ingress services (e.g. ${examples.join(
                ', '
            )})?`,
            // if Ingress Type is nginx, then default to minikube ip
            // else, default to empty string, because it's mostly not needed.
            default: defaultValue,
            validate: input => {
                if (input.length === 0) {
                    if (this.ingressType === 'nginx' || istio) {
                        return 'domain name cannot be empty';
                    }
                    return true;
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
        if (props.ingressDomain === 'none') {
            this.ingressDomain = '';
        } else {
            this.ingressDomain = props.ingressDomain ? props.ingressDomain : '';
        }
        done();
    });
}

function askForIstioSupport() {
    if (this.regenerate) return;
    if (this.deploymentApplicationType === 'monolith') {
        this.istio = false;
        return;
    }
    const done = this.async();

    const prompts = [
        {
            type: 'list',
            name: 'istio',
            message: 'Do you want to enable Istio?',
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
            default: this.istio
        }
    ];

    this.prompt(prompts).then(props => {
        this.istio = props.istio;
        done();
    });
}

function askForPersistentStorage() {
    if (this.regenerate) return;
    const done = this.async();
    let usingDataBase = false;
    this.appConfigs.forEach((appConfig, index) => {
        if (appConfig.prodDatabaseType !== 'no') {
            usingDataBase = true;
        }
    });

    const prompts = [
        {
            when: () => usingDataBase,
            type: 'list',
            name: 'kubernetesUseDynamicStorage',
            message: 'Do you want to use dynamic storage provisioning for your stateful services?',
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
            default: this.kubernetesUseDynamicStorage
        }
    ];

    this.prompt(prompts).then(props => {
        this.kubernetesUseDynamicStorage = props.kubernetesUseDynamicStorage;
        done();
    });
}

function askForStorageClassName() {
    if (this.regenerate) return;
    const done = this.async();
    const kubernetesUseDynamicStorage = this.kubernetesUseDynamicStorage;

    const prompts = [
        {
            when: () => kubernetesUseDynamicStorage,
            type: 'input',
            name: 'kubernetesStorageClassName',
            message: 'Do you want to use a specific storage class? (leave empty for using the clusters default storage class)',
            default: this.kubernetesStorageClassName ? this.kubernetesStorageClassName : ''
        }
    ];

    this.prompt(prompts).then(props => {
        this.kubernetesStorageClassName = props.kubernetesStorageClassName.trim();
        done();
    });
}
