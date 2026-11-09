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
import { type MutateDataParam, type MutateDataPropertiesWithRequiredProperties, finalizeDefault } from '../../lib/utils/object.ts';
import { JAVA_DOCKER_DIR } from '../generator-constants.ts';

import type { Application as DockerApplication, DockerComposeFile } from './types.ts';

export type DockerAddedApplicationLoadingProperties = {
  dockerContainers: Record<string, string>;
  dockerApplicationEnvironment: Record<string, string>;
  /**
   * The variables of the application in a deployment, over `dockerApplicationEnvironment`: the ones naming the hosts of
   * its services, which a deployment names `<application>-<service>`.
   */
  dockerDeploymentEnvironment: Record<string, string>;
  dockerServices: string[];
  /**
   * The docker compose files of the application a deployment uses, by name: the docker generator writes them to
   * `dockerServicesDir`, the deployments read them from their source merged with their data.
   */
  dockerComposeFiles: Record<string, DockerComposeFile>;
  keycloakSecrets?: string[];
};

export type DockerAddedApplicationPreparingProperties = {
  dockerServicesDir: string;
  /** The prefix of the names a deployment gives the docker compose services of the application. */
  dockerDeploymentServicePrefix: string;
  /**
   * The command of the healthcheck of the `app` docker compose service, run by its shell: by default a request to
   * `/management/health` with bash, which an application whose image has no bash replaces.
   */
  dockerApplicationHealthcheckCommand: string;
};

export const mutateApplicationLoading = {
  __override__: false,
  dockerContainers: () => ({}),
  dockerApplicationEnvironment: () => ({}),
  dockerDeploymentEnvironment: () => ({}),
  dockerServices: () => [],
  dockerComposeFiles: () => ({}),
} as const satisfies MutateDataPropertiesWithRequiredProperties<
  MutateDataParam<DockerApplication>,
  DockerAddedApplicationLoadingProperties
>;

export const mutateApplicationPreparing = {
  __override__: false,
  dockerServicesDir: JAVA_DOCKER_DIR,
  dockerDeploymentServicePrefix: ({ lowercaseBaseName }) => `${lowercaseBaseName}-`,
  // Delayed, so an application preparing its own command keeps it; the server port is prepared by then.
  dockerApplicationHealthcheckCommand: finalizeDefault(
    ({ serverPort }: DockerApplication) =>
      String.raw`bash -c 'exec 3<>/dev/tcp/127.0.0.1/${serverPort}; printf "GET /management/health HTTP/1.0\r\nHost: localhost\r\n\r\n" >&3; grep -q "\"status\":\"UP\"" <&3'`,
  ),
} as const satisfies MutateDataPropertiesWithRequiredProperties<
  MutateDataParam<DockerApplication>,
  DockerAddedApplicationPreparingProperties
>;
