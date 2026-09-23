/**
 * Copyright 2013-2026 the original author or authors from the JHipster project.
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
import type { JHipsterCommandDefinition } from '../../lib/command/types.ts';
import {
  ALPHABETIC_LOWER_PATTERN,
  ALPHABETIC_PATTERN,
  ALPHANUMERIC_DASH_PATTERN,
  ALPHANUMERIC_SPACE_PATTERN,
  KUBERNETES_STORAGE_CLASS_NAME_PATTERN,
  REPONAME_PATTERN,
} from '../../lib/constants/jdl.ts';

const deploymentString = (tokenValuePattern: RegExp) => ({ type: 'string', tokenType: 'STRING', tokenValuePattern }) as const;
const deploymentName = (tokenValuePattern: RegExp) => ({ type: 'string', tokenType: 'NAME', tokenValuePattern }) as const;
const deploymentBoolean = { type: 'boolean', tokenType: 'BOOLEAN' } as const;

const command = {
  import: ['base-workspaces'],
  configs: {
    kubernetesNamespace: {
      description: 'Kubernetes namespace',
      cli: { type: String, hide: true },
      jdl: deploymentName(ALPHANUMERIC_DASH_PATTERN),
      default: 'default',
      scope: 'storage',
    },
    kubernetesServiceType: {
      description: 'Kubernetes service type',
      cli: { type: String, hide: true },
      jdl: deploymentName(ALPHABETIC_PATTERN),
      choices: ['LoadBalancer', 'NodePort', 'Ingress'],
      default: 'LoadBalancer',
      scope: 'storage',
    },
    kubernetesStorageClassName: {
      description: 'Kubernetes storage class name',
      cli: { type: String, hide: true },
      jdl: deploymentString(KUBERNETES_STORAGE_CLASS_NAME_PATTERN),
      default: '',
      scope: 'storage',
    },
    kubernetesUseDynamicStorage: {
      description: 'Use dynamic storage',
      cli: { type: Boolean, hide: true },
      jdl: deploymentBoolean,
      default: false,
      scope: 'storage',
    },
    ingressDomain: {
      description: 'Ingress domain',
      cli: { type: String, hide: true },
      jdl: deploymentString(REPONAME_PATTERN),
      default: '',
      scope: 'storage',
    },
    ingressType: {
      description: 'Ingress type',
      cli: { type: String, hide: true },
      jdl: deploymentName(ALPHABETIC_PATTERN),
      choices: ['nginx', 'gke'],
      default: 'nginx',
      scope: 'storage',
    },
    istio: {
      description: 'Use Istio',
      cli: { type: Boolean, hide: true },
      jdl: deploymentBoolean,
      default: false,
      scope: 'storage',
    },
    dockerRepositoryName: {
      description: 'Docker repository name',
      cli: { type: String, hide: true },
      jdl: deploymentString(REPONAME_PATTERN),
      default: '',
      scope: 'storage',
    },
    dockerPushCommand: {
      description: 'Docker push command',
      cli: { type: String, hide: true },
      jdl: deploymentString(ALPHANUMERIC_SPACE_PATTERN),
      default: 'docker push',
      scope: 'storage',
    },
    registryReplicas: {
      description: 'Registry replicas',
      cli: { type: Number, hide: true },
      jdl: { type: 'integer', tokenType: 'INTEGER', deprecated: 'no generator reads it, it will be removed in JHipster v10' },
      scope: 'storage',
    },
    storageType: {
      description: 'Storage type',
      cli: { type: String, hide: true },
      jdl: { ...deploymentName(ALPHABETIC_LOWER_PATTERN), deprecated: 'no generator reads it, it will be removed in JHipster v10' },
      scope: 'storage',
    },
  },
} as const satisfies JHipsterCommandDefinition;

export default command;
