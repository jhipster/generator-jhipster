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

import type { JDLFiles } from './ast-to-files.ts';

const GENERATOR_JHIPSTER = 'generator-jhipster';

/** An application of the json files: its folder, its config, and the names of the microservices of its entities. */
type StackApplication = { folder: string; config: Record<string, any>; microserviceNames: string[] };

/**
 * Adds to the json files of a jdl the config its applications derive from one another, as a stack:
 * - with several applications, each one gets its index, the gateways first;
 * - a gateway gets the applications it serves, its microfrontends and the microservices of its entities, with their
 *   client framework, ports and index, and each of them gets the server port of the gateway as its gateway server port;
 * - a microfrontend of the jdl must use the client framework of its gateway.
 */
export function applyStackConfig({ files, relativeRoot }: JDLFiles): JDLFiles {
  const result: JDLFiles['files'] = Object.fromEntries(Object.entries(files).map(([path, content]) => [path, structuredClone(content)]));
  const applications: StackApplication[] = [];
  for (const [path, content] of Object.entries(result)) {
    const [folder, ...rest] = path.split('/');
    if (rest.length === 1 && rest[0] === '.yo-rc.json' && !content[GENERATOR_JHIPSTER]?.deploymentType) {
      applications.push({ folder, config: content[GENERATOR_JHIPSTER], microserviceNames: [] });
    }
  }
  for (const application of applications) {
    for (const [path, entity] of Object.entries(result)) {
      if (path.startsWith(`${application.folder}/.jhipster/`) && entity.microserviceName) {
        application.microserviceNames.push(entity.microserviceName);
      }
    }
  }
  const byBaseName = new Map(applications.map(application => [application.config.baseName, application]));
  const isGateway = ({ config }: StackApplication) => config.applicationType === 'gateway';

  if (applications.length > 1) {
    [...applications.filter(isGateway), ...applications.filter(application => !isGateway(application))].forEach((application, index) => {
      application.config.applicationIndex = index;
    });
  }

  for (const gateway of applications.filter(isGateway)) {
    const { microfrontends = [], clientFramework: gatewayClientFramework, serverPort: gatewayServerPort } = gateway.config;
    for (const { baseName } of microfrontends as { baseName: string }[]) {
      const microfrontend = byBaseName.get(baseName);
      const clientFramework = microfrontend?.config.clientFramework;
      if (microfrontend && clientFramework !== gatewayClientFramework) {
        throw new Error(
          `Using different client frameworks in microfrontends is not supported. Tried to use: ${gatewayClientFramework} with ${clientFramework} (${baseName})`,
        );
      }
    }
    const relatedBaseNames = [
      ...new Set([...microfrontends.map(({ baseName }: { baseName: string }) => baseName), ...gateway.microserviceNames]),
    ];
    if (relatedBaseNames.length > 0) {
      gateway.config.applications = Object.fromEntries(
        relatedBaseNames.map(baseName => {
          const config = byBaseName.get(baseName)?.config ?? {};
          config.gatewayServerPort ||= gatewayServerPort;
          const { clientFramework, serverPort, applicationIndex, devServerPort } = config;
          return [baseName, { clientFramework, serverPort, applicationIndex, devServerPort }];
        }),
      );
    }
  }
  return { files: result, relativeRoot };
}
