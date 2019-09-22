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
const shelljs = require('shelljs');
const chalk = require('chalk');
const crypto = require('crypto');
const { loadFromYoRc } = require('./docker-base');
const constants = require('./generator-constants');

module.exports = {
    checkKubernetes,
    loadConfig,
    saveConfig,
    setupKubernetesConstants
};

function checkKubernetes() {
    if (this.skipChecks) return;
    const done = this.async();

    shelljs.exec('kubectl version', { silent: true }, (code, stdout, stderr) => {
        if (stderr) {
            this.log(
                `${chalk.yellow.bold('WARNING!')} kubectl 1.2 or later is not installed on your computer.\n` +
                    'Make sure you have Kubernetes installed. Read http://kubernetes.io/docs/getting-started-guides/binary_release/\n'
            );
        }
        done();
    });
}

function loadConfig() {
    loadFromYoRc.call(this);
    this.kubernetesNamespace = this.config.get('kubernetesNamespace');
    this.kubernetesServiceType = this.config.get('kubernetesServiceType');
    this.ingressType = this.config.get('ingressType');
    this.ingressDomain = this.config.get('ingressDomain');
    this.istio = this.config.get('istio');
    this.dbRandomPassword = crypto.randomBytes(128).toString('hex');
}

function saveConfig() {
    this.config.set({
        appsFolders: this.appsFolders,
        directoryPath: this.directoryPath,
        clusteredDbApps: this.clusteredDbApps,
        serviceDiscoveryType: this.serviceDiscoveryType,
        jwtSecretKey: this.jwtSecretKey,
        dockerRepositoryName: this.dockerRepositoryName,
        dockerPushCommand: this.dockerPushCommand,
        kubernetesNamespace: this.kubernetesNamespace,
        kubernetesServiceType: this.kubernetesServiceType,
        ingressType: this.ingressType,
        ingressDomain: this.ingressDomain,
        monitoring: this.monitoring,
        istio: this.istio
    });
}

function setupKubernetesConstants() {
    // Make constants available in templates
    this.KUBERNETES_CORE_API_VERSION = constants.KUBERNETES_CORE_API_VERSION;
    this.KUBERNETES_BATCH_API_VERSION = constants.KUBERNETES_BATCH_API_VERSION;
    this.KUBERNETES_DEPLOYMENT_API_VERSION = constants.KUBERNETES_DEPLOYMENT_API_VERSION;
    this.KUBERNETES_STATEFULSET_API_VERSION = constants.KUBERNETES_STATEFULSET_API_VERSION;
    this.KUBERNETES_INGRESS_API_VERSION = constants.KUBERNETES_INGRESS_API_VERSION;
    this.KUBERNETES_ISTIO_NETWORKING_API_VERSION = constants.KUBERNETES_ISTIO_NETWORKING_API_VERSION;
    this.KUBERNETES_RBAC_API_VERSION = constants.KUBERNETES_RBAC_API_VERSION;
}
