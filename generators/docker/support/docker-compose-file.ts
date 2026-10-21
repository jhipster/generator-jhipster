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
import ejs from 'ejs';
import mergeWith from 'lodash-es/mergeWith.js';
import { Scalar, isMap, isScalar, isSeq, parse as parseYaml, parseDocument } from 'yaml';

import type { DockerComposeFile, DockerComposeService, DockerComposeServiceConfig } from '../types.ts';

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

/**
 * The services of a docker compose file of an application as a deployment uses them: `app` named after the
 * application, the other services of the application and the ones it depends on named with the prefix, the services
 * the applications of the deployment share (like keycloak) keeping their name.
 */
export const createDockerDeploymentServices = (
  services: Record<string, DockerComposeServiceConfig>,
  {
    applicationServiceName,
    servicePrefix,
    isApplicationService,
  }: { applicationServiceName: string; servicePrefix: string; isApplicationService: (serviceName: string) => boolean },
): Record<string, DockerComposeServiceConfig> =>
  Object.fromEntries(
    Object.entries(services).map(([serviceName, service]) => [
      serviceName === 'app' ? applicationServiceName : `${servicePrefix}${serviceName}`,
      {
        ...service,
        ...(service.depends_on ?
          {
            depends_on: Object.fromEntries(
              Object.entries(service.depends_on).map(([dependency, condition]) => [
                isApplicationService(dependency) ? `${servicePrefix}${dependency}` : dependency,
                condition,
              ]),
            ),
          }
        : {}),
      },
    ]),
  );

/** A docker compose file of an application as the docker generator writes it: its template merged with its data. */
export const mergeDockerComposeFile = (
  { data }: DockerComposeFile,
  sourceContent: string,
): { name?: string; services: Record<string, any> } =>
  mergeWith(parseYaml(ejs.render(sourceContent)), structuredClone(data), (a, b) =>
    Array.isArray(a) ? [...a, ...(Array.isArray(b) ? b : [b])] : undefined,
  );

/** Writes the healthcheck command of each service of a docker compose file on one line, as a flow list of quoted items. */
export const flowHealthcheckCommands = (content: string): string => {
  const document = parseDocument(content);
  const services = document.get('services', true);
  if (!isMap(services)) return content;
  for (const { value: service } of services.items) {
    const test = isMap(service) ? service.getIn(['healthcheck', 'test'], true) : undefined;
    if (isSeq(test)) {
      test.flow = true;
      for (const item of test.items) {
        if (isScalar(item) && typeof item.value === 'string') {
          item.type = Scalar.QUOTE_SINGLE;
        }
      }
    }
  }
  return document.toString({ lineWidth: 0 });
};
