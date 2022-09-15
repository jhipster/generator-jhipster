/**
 * Copyright 2013-2022 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const _ = require('lodash');

const shelljs = require('shelljs');
const chalk = require('chalk');
const crypto = require('crypto');
const { defaultKubernetesConfig } = require('./kubernetes/kubernetes-constants');
const { loadFromYoRc } = require('./docker-base');
const constants = require('./generator-constants');
const { MICROSERVICE } = require('../jdl/jhipster/application-types');
const { GeneratorTypes, IngressTypes, ServiceTypes } = require('../jdl/jhipster/kubernetes-platform-types');

const { INGRESS } = ServiceTypes;
const { GKE, NGINX } = IngressTypes;
const { K8S, HELM } = GeneratorTypes;

module.exports = {
  checkKubernetes,
  checkHelm,
  loadConfig,
  saveConfig,
  setupKubernetesConstants,
  setupHelmConstants,
  derivedKubernetesPlatformProperties,
};

function checkKubernetes() {
  if (this.skipChecks) return;
  const done = this.async();

  shelljs.exec('kubectl version', { silent: true }, (code, stdout, stderr) => {
    if (stderr) {
      this.log(
        `${chalk.yellow.bold('WARNING!')} kubectl 1.2 or later is not installed on your computer.\n` +
          'Make sure you have Kubernetes installed. Read https://kubernetes.io/docs/setup/\n'
      );
    }
    done();
  });
}

function checkHelm() {
  if (this.skipChecks) return;
  const done = this.async();

  shelljs.exec(
    'helm version --client | grep -E "(v2\\.1[2-9]{1,2}\\.[0-9]{1,3})|(v3\\.[0-9]{1,2}\\.[0-9]{1,3})"',
    { silent: true },
    (code, stdout, stderr) => {
      if (stderr || code !== 0) {
        this.log(
          `${chalk.yellow.bold('WARNING!')} helm 2.12.x or later is not installed on your computer.\n` +
            'Make sure you have helm installed. Read https://github.com/helm/helm/\n'
        );
      }
      done();
    }
  );
}

function loadConfig() {
  loadFromYoRc.call(this);
  this.kubernetesNamespace = this.config.get('kubernetesNamespace');
  this.kubernetesServiceType = this.config.get('kubernetesServiceType');
  this.ingressType = this.config.get('ingressType');
  this.ingressDomain = this.config.get('ingressDomain');
  this.istio = this.config.get('istio');
  this.dbRandomPassword = this.options.reproducibleTests ? 'SECRET-PASSWORD' : crypto.randomBytes(30).toString('hex');
  this.kubernetesUseDynamicStorage = this.config.get('kubernetesUseDynamicStorage');
  this.kubernetesStorageClassName = this.config.get('kubernetesStorageClassName');
  this.generatorType = this.config.get('generatorType');
}

function saveConfig() {
  this.config.set(
    _.defaults(
      {
        appsFolders: this.appsFolders,
        directoryPath: this.directoryPath,
        clusteredDbApps: this.clusteredDbApps,
        serviceDiscoveryType: this.serviceDiscoveryType,
        jwtSecretKey: this.jwtSecretKey,
        dockerRepositoryName: this.dockerRepositoryName,
        dockerPushCommand: this.dockerPushCommand,
        kubernetesNamespace: this.kubernetesNamespace,
        kubernetesServiceType: this.kubernetesServiceType,
        kubernetesUseDynamicStorage: this.kubernetesUseDynamicStorage,
        kubernetesStorageClassName: this.kubernetesStorageClassName,
        generatorType: this.generatorType,
        ingressType: this.ingressType,
        ingressDomain: this.ingressDomain,
        monitoring: this.monitoring,
        istio: this.istio,
      },
      defaultKubernetesConfig
    )
  );
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

function derivedKubernetesPlatformProperties(dest = _.defaults({}, this, defaultKubernetesConfig)) {
  dest.deploymentApplicationTypeMicroservice = dest.deploymentApplicationType === MICROSERVICE;
  dest.ingressTypeNginx = dest.ingressType === NGINX;
  dest.ingressTypeGke = dest.ingressType === GKE;
  dest.kubernetesServiceTypeIngress = dest.kubernetesServiceType === INGRESS;
  dest.kubernetesNamespaceDefault = dest.kubernetesNamespace === 'default';
  dest.generatorTypeK8s = dest.generatorType === K8S;
  dest.generatorTypeHelm = dest.generatorType === HELM;
}

function setupHelmConstants() {
  this.HELM_KAFKA = constants.HELM_KAFKA;
  this.HELM_ELASTICSEARCH = constants.HELM_ELASTICSEARCH;
  this.HELM_PROMETHEUS = constants.HELM_PROMETHEUS;
  this.HELM_GRAFANA = constants.HELM_GRAFANA;
  this.HELM_MARIADB = constants.HELM_MARIADB;
  this.HELM_MYSQL = constants.HELM_MYSQL;
  this.HELM_POSTGRESQL = constants.HELM_POSTGRESQL;
  this.HELM_MOGODB_REPLICASET = constants.HELM_MOGODB_REPLICASET;
  this.HELM_COUCHBASE_OPERATOR = constants.HELM_COUCHBASE_OPERATOR;
}
