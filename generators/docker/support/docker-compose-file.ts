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
import { stringify } from 'yaml';

import type { DockerComposeFile, DockerComposeService } from '../types.ts';

/**
 * Creates EditFileCallback that creates a base docker compose yml file if empty.
 *
 * @param {string} name Docker compose v2 project name
 * @returns {import('../../generators/generator-base.js').EditFileCallback}
 */
export const createDockerComposeFile = (
  name = 'jhipster',
) => `# This configuration is intended for development purpose, it's **your** responsibility to harden it for production
name: ${name}
`;

export const createDockerExtendedServices = (...services: DockerComposeService[]) => ({
  services: Object.fromEntries(
    services.map(({ serviceName, serviceFile = `./${serviceName}.yml`, extendedServiceName = serviceName, additionalConfig = {} }) => [
      serviceName,
      {
        extends: {
          file: serviceFile,
          service: extendedServiceName,
        },
        ...additionalConfig,
      },
    ]),
  ),
});

/** The comment of the docker compose files of an application. */
export const DOCKER_COMPOSE_FILE_COMMENT =
  "This configuration is intended for development purpose, it's **your** responsibility to harden it for production";

/** The content of a docker compose file: its comments, then its project name and its services. */
export const dockerComposeFileContent = ({ comments = [], name, services }: DockerComposeFile): string =>
  `${comments.map(comment => `# ${comment}\n`).join('')}${stringify({ name, services }, { lineWidth: 0, aliasDuplicateObjects: false })}`;

/** The ports of a service published on the loopback address only. */
export const dockerComposeLocalPorts = (...ports: number[]): string[] => ports.map(port => `127.0.0.1:${port}:${port}`);

/** Adds a docker compose file of the application, named after its base name, with the comment of the files. */
export const addDockerComposeFile = (
  application: { baseName: string; dockerComposeFiles: Record<string, DockerComposeFile> },
  fileName: string,
  services: DockerComposeFile['services'],
): DockerComposeFile =>
  (application.dockerComposeFiles[fileName] = {
    comments: [DOCKER_COMPOSE_FILE_COMMENT],
    name: application.baseName.toLowerCase(),
    services,
  });

/** Makes the application service of the `app` file wait for a service, healthy or completed. */
export const addDockerComposeApplicationDependency = (
  application: { dockerComposeFiles: Record<string, DockerComposeFile> },
  serviceName: string,
  condition: string,
): void => {
  const app = application.dockerComposeFiles.app?.services.app;
  if (app) {
    app.depends_on = { ...app.depends_on, [serviceName]: { condition } };
  }
};
