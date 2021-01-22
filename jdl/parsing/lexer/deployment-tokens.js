/**
 * Copyright 2013-2021 the original author or authors from the JHipster project.
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

const { Lexer } = require('chevrotain');
const { createTokenFromConfig } = require('./token-creator');

const deploymentCategoryToken = createTokenFromConfig({
  name: 'DEPLOYMENT_KEY',
  pattern: Lexer.NA,
});

const deploymentTokens = [
  { name: 'DEPLOYMENT_TYPE', pattern: 'deploymentType' },
  { name: 'GATEWAY_TYPE', pattern: 'gatewayType' },
  { name: 'MONITORING', pattern: 'monitoring' },
  { name: 'DIRECTORY_PATH', pattern: 'directoryPath' },
  { name: 'APPS_FOLDERS', pattern: 'appsFolders' },
  { name: 'CLUSTERED_DB_APPS', pattern: 'clusteredDbApps' },
  { name: 'DOCKER_REPOSITORY_NAME', pattern: 'dockerRepositoryName' },
  { name: 'DOCKER_PUSH_COMMAND', pattern: 'dockerPushCommand' },
  { name: 'KUBERNETES_NAMESPACE', pattern: 'kubernetesNamespace' },
  { name: 'KUBERNETES_SERVICE_TYPE', pattern: 'kubernetesServiceType' },
  { name: 'INGRESS_DOMAIN', pattern: 'ingressDomain' },
  { name: 'ISTIO', pattern: 'istio' },
  { name: 'OPENSHIFT_NAMESPACE', pattern: 'openshiftNamespace' },
  { name: 'STORAGE_TYPE', pattern: 'storageType' },
].map(tokenConfig => {
  tokenConfig.categories = [deploymentCategoryToken];
  return createTokenFromConfig(tokenConfig);
});

module.exports = {
  categoryToken: deploymentCategoryToken,
  tokens: [deploymentCategoryToken, ...deploymentTokens],
};
