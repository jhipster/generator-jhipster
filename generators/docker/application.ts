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
import type { MutateDataParam, MutateDataPropertiesWithRequiredProperties } from '../../lib/utils/object.ts';
import { JAVA_DOCKER_DIR } from '../generator-constants.ts';

import type { Application as DockerApplication } from './types.ts';

export type DockerAddedApplicationLoadingProperties = {
  dockerContainers: Record<string, string>;
  dockerApplicationEnvironment: Record<string, string>;
  dockerServices: string[];
  keycloakSecrets?: string[];
};

export type DockerAddedApplicationPreparingProperties = {
  dockerServicesDir: string;
};

export const mutateApplicationLoading = {
  __override__: false,
  dockerContainers: () => ({}),
  dockerApplicationEnvironment: () => ({}),
  dockerServices: () => [],
} as const satisfies MutateDataPropertiesWithRequiredProperties<
  MutateDataParam<DockerApplication>,
  DockerAddedApplicationLoadingProperties
>;

export const mutateApplicationPreparing = {
  __override__: false,
  dockerServicesDir: JAVA_DOCKER_DIR,
} as const satisfies MutateDataPropertiesWithRequiredProperties<
  MutateDataParam<DockerApplication>,
  DockerAddedApplicationPreparingProperties
>;
