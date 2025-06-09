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
import type { ApplicationAll } from '../base-application/application-properties-all.js';
import type { Config as BaseConfig } from '../base/index.js';

export type { Source } from '../base/types.js';

export type Config = BaseConfig & {
  appsFolders: string[];
  directoryPath: string;
  deploymentType: string;
  jwtSecretKey: string;
  adminPassword: string;
  serviceDiscoveryType: string;
};

export type { Features, Options } from '../base/types.js';

type ServiceDiscoveryApplication = OptionWithDerivedProperties<'serviceDiscoveryType', ['no', 'eureka', 'consul']>;

type MonitoringApplication = OptionWithDerivedProperties<'monitoring', ['no', 'elk', 'prometheus']>;

export type WorkspacesApplication = ServiceDiscoveryApplication & MonitoringApplication & ApplicationAll & { clusteredDb?: boolean };

export type Workspaces = {
  directoryPath: string;
};

export type Deployment = any;
