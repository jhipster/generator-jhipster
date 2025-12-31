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
import type { ApplicationAll } from '../../lib/types/application-all.ts';
import type { Config as BaseConfig, Options as BaseOptions } from '../base/types.d.ts';
import type { OptionWithDerivedProperties } from '../base-application/internal/types/application-options.ts';

export type { Source } from '../base/types.ts';

type DeploymentConfig = {
  directoryPath: string;
  appsFolders: string[];

  jwtSecretKey: string;
  adminPassword: string;
  adminPasswordBase64: string;
  dbRandomPassword: string;

  deploymentType: string;
  serviceDiscoveryType: string;
  ingressType: string;
  ingressDomain: string;

  kubernetesUseDynamicStorage: boolean;
  kubernetesStorageClassName: string;
  // knative property
  generatorType: 'k8s' | 'helm';
  istio: boolean;

  deploymentApplicationType: 'microservice' | 'monolith';
};

export type Config = BaseConfig & DeploymentConfig;

export type { Features } from '../base/types.ts';

export type Options = BaseOptions & DeploymentConfig;

type ServiceDiscoveryApplication = OptionWithDerivedProperties<'serviceDiscoveryType', ['no', 'eureka', 'consul']>;

type MonitoringApplication = OptionWithDerivedProperties<'monitoring', ['no', 'elk', 'prometheus']>;

export type WorkspacesApplication = ServiceDiscoveryApplication &
  MonitoringApplication &
  ApplicationAll & {
    composePort?: number;
    targetImageName?: string;
    appFolder?: string;
    dbPeerCount?: number;
  };

export type Deployment = DeploymentConfig & {
  appConfigs?: WorkspacesApplication[];
  appsYaml?: string[];
  clusteredDbApps?: string[];
  dockerContainers?: Record<string, string>;

  keycloakRedirectUris?: string;
  keycloakSecrets?: string[];
  usesOauth2?: boolean;
  useKafka?: boolean;
  usePulsar?: boolean;
  useMemcached?: boolean;
  useRedis?: boolean;
  includesApplicationTypeGateway?: boolean;

  authenticationType?: string;

  serviceDiscoveryTypeAny?: boolean;
  serviceDiscoveryTypeConsul?: boolean;
  serviceDiscoveryTypeEureka?: boolean;

  entryPort?: number;

  monitoring?: string;
  monitoringElk?: boolean;
  monitoringPrometheus?: boolean;

  serviceDiscoveryAny?: boolean;
  serviceDiscoveryConsul?: boolean;
  serviceDiscoveryEureka?: boolean;
};
