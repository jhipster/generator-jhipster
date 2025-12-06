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
import type { ApplicationWithEntities } from '../../../lib/jdl/jdl-importer.ts';

export const addApplicationIndex = (applicationsWithEntities: ApplicationWithEntities[]) => {
  applicationsWithEntities.forEach((applicationWithEntities, applicationIndex) => {
    applicationWithEntities.config.applicationIndex = applicationIndex;
  });
};

export const customizeForMicroservices = (applicationsWithEntities: Record<string, ApplicationWithEntities>) => {
  const gatewayApplications = Object.values(applicationsWithEntities).filter(app => app.config.applicationType === 'gateway');
  for (const gateway of gatewayApplications) {
    const { microfrontends = [], clientFramework: gatewayClientFramework, serverPort: gatewayServerPort } = gateway.config;

    for (const mf of microfrontends) {
      const { baseName, clientFramework } = applicationsWithEntities[mf.baseName].config;
      if (clientFramework !== gatewayClientFramework) {
        throw Error(
          `Using different client frameworks in microfrontends is not supported. Tried to use: ${gatewayClientFramework} with ${clientFramework} (${baseName})`,
        );
      }
    }

    const relatedBaseNames = microfrontends.map(mf => mf.baseName);
    gateway.entities
      .map(entity => entity.microserviceName)
      .filter(Boolean)
      .forEach(basename => !relatedBaseNames.includes(basename!) && relatedBaseNames.push(basename!));

    if (relatedBaseNames.length > 0) {
      gateway.config.applications = Object.fromEntries(
        relatedBaseNames.map(baseName => {
          const appConfig = applicationsWithEntities[baseName]?.config ?? {};
          appConfig.gatewayServerPort = appConfig.gatewayServerPort || gatewayServerPort;
          const { clientFramework, serverPort, applicationIndex, devServerPort } = appConfig;
          return [baseName, { clientFramework, serverPort, applicationIndex, devServerPort }];
        }),
      );
    }
  }
};
