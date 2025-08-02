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
import type { HandleCommandTypes } from '../../lib/command/types.js';
import type { OptionWithDerivedProperties } from '../base-application/internal/types/application-options.js';
import type {
  Config as BaseWorkspacesConfig,
  Deployment as BaseWorkspacesDeployment,
  Options as BaseWorkspacesOptions,
  Source as BaseWorkspacesSource,
  WorkspacesApplication as BaseWorkspacesWorkspacesApplication,
} from '../base-workspaces/types.js';

import type command from './command.ts';
import type bootstrapCommand from './generators/bootstrap/command.ts';
import type { helmConstants, kubernetesConstants } from './support/constants.ts';

type KubernetesDeployment = typeof kubernetesConstants & typeof helmConstants & {};

type Command = HandleCommandTypes<typeof command>;

type BootstrapCommand = HandleCommandTypes<typeof bootstrapCommand>;

export type Config = Command['Config'] & BootstrapCommand['Config'] & BaseWorkspacesConfig;

export type Options = Command['Options'] & BootstrapCommand['Options'] & BaseWorkspacesOptions;

export { BaseWorkspacesSource as Source, BaseWorkspacesWorkspacesApplication as WorkspacesApplication };

type KNativeGeneratorType = OptionWithDerivedProperties<'generatorType', ['k8s', 'helm']>;

export type Deployment = Command['Application'] &
  BootstrapCommand['Application'] &
  BaseWorkspacesDeployment &
  KubernetesDeployment &
  KNativeGeneratorType & {
    useKeycloak?: boolean;
    usesIngress?: boolean;

    kubernetesNamespaceDefault?: boolean;
    kubernetesServiceTypeIngress?: boolean;
    ingressTypeGke?: boolean;
    ingressTypeNginx?: boolean;
    deploymentApplicationTypeMicroservice?: boolean;

    monolithicNb?: number;
    gatewayNb?: number;
    microserviceNb?: number;
    portsToBind?: number;

    deploymentApplicationType?: 'microservice' | 'monolith';
    kubernetesNamespace?: string;

    dockerRepositoryName?: string;
    dockerPushCommand?: string;
  };
