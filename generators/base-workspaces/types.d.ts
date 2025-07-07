/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
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
import type { OptionWithDerivedProperties } from '../base-application/internal/types/application-options.js';
import type { ApplicationAll } from '../../lib/types/application-properties-all.js';
import type { Config as BaseConfig } from '../base/index.js';

export type { Source } from '../base/types.js';

type DeploymentConfig = {
  directoryPath: string;
  appsFolders: string[];

  jwtSecretKey: string;
  adminPassword: string;
  dbRandomPassword: string;

  deploymentType: string;
  serviceDiscoveryType: string;
  ingressType: string;
  ingressDomain: string;

  kubernetesUseDynamicStorage: boolean;
  kubernetesStorageClassName: string;
  generatorType: string;
};

export type Config = BaseConfig & DeploymentConfig;

export type { Features, Options } from '../base/types.js';

type ServiceDiscoveryApplication = OptionWithDerivedProperties<'serviceDiscoveryType', ['no', 'eureka', 'consul']>;

type MonitoringApplication = OptionWithDerivedProperties<'monitoring', ['no', 'elk', 'prometheus']>;

export type WorkspacesApplication = ServiceDiscoveryApplication &
  MonitoringApplication &
  ApplicationAll & { composePort?: number; clusteredDb?: boolean; appFolder: string };

export type Deployment = DeploymentConfig & {
  appConfigs?: WorkspacesApplication[];
  applications?: any[];
  appsYaml?: string[];
  clusteredDbApps?: string[];

  keycloakRedirectUris?: string;
  keycloakSecrets?: string[];
  authenticationType?: string;
  adminPasswordBase64?: string;

  usesOauth2?: boolean;
  useKafka?: boolean;
  usePulsar?: boolean;
  useMemcached?: boolean;
  useRedis?: boolean;
  includesApplicationTypeGateway?: boolean;

  entryPort?: number;
  dockerRepositoryName?: string;
  dockerPushCommand?: string;

  monitoring?: string;
  monitoringElk?: boolean;
  monitoringPrometheus?: boolean;

  monolithicNb?: number;
  gatewayNb?: number;
  microserviceNb?: number;
  portsToBind?: number;
};
