/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
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

import { Lexer } from 'chevrotain';
import createTokenFromConfig from './token-creator.js';

const deploymentCategoryToken = createTokenFromConfig({
  name: 'DEPLOYMENT_KEY',
  pattern: Lexer.NA,
});

const deploymentTokens = [
  { name: 'APPS_FOLDERS', pattern: 'appsFolders' },
  { name: 'CLUSTERED_DB_APPS', pattern: 'clusteredDbApps' },
  { name: 'DEPLOYMENT_TYPE', pattern: 'deploymentType' },
  { name: 'DIRECTORY_PATH', pattern: 'directoryPath' },
  { name: 'DOCKER_PUSH_COMMAND', pattern: 'dockerPushCommand' },
  { name: 'DOCKER_REPOSITORY_NAME', pattern: 'dockerRepositoryName' },
  { name: 'GATEWAY_TYPE', pattern: 'gatewayType' },
  { name: 'INGRESS_DOMAIN', pattern: 'ingressDomain' },
  { name: 'INGRESS_TYPE', pattern: 'ingressType' },
  { name: 'ISTIO', pattern: 'istio' },
  { name: 'KUBERNETES_NAMESPACE', pattern: 'kubernetesNamespace' },
  { name: 'KUBERNETES_SERVICE_TYPE', pattern: 'kubernetesServiceType' },
  { name: 'KUBERNETES_STORAGE_CLASS_NAME', pattern: 'kubernetesStorageClassName' },
  { name: 'KUBERNETES_USE_DYNAMIC_STORAGE', pattern: 'kubernetesUseDynamicStorage' },
  { name: 'MONITORING', pattern: 'monitoring' },
  { name: 'OPENSHIFT_NAMESPACE', pattern: 'openshiftNamespace' },
  { name: 'REGISTRY_REPLICAS', pattern: 'registryReplicas' },
  { name: 'STORAGE_TYPE', pattern: 'storageType' },
].map(tokenConfig => {
  (tokenConfig as any).categories = [deploymentCategoryToken];
  return createTokenFromConfig(tokenConfig);
});

export default {
  categoryToken: deploymentCategoryToken,
  tokens: [deploymentCategoryToken, ...deploymentTokens],
};
