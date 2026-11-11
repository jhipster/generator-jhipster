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

import type { Application as ServerApplication } from './types.ts';

export type ServerAddedApplicationProperties = {
  /**
   * The origins the backend allows in development: the ones of the development servers, then the additional ones.
   */
  corsAllowedOrigins: string[];
  /**
   * The origins a blueprint adds to the allowed ones, in its preparing.
   */
  corsAdditionalAllowedOrigins: string[];
  /**
   * The patterns of the origins the backend allows in development.
   */
  corsAllowedOriginPatterns: string[];
};

export const mutateApplication = {
  __override__: false,
  corsAdditionalAllowedOrigins: () => [],
  corsAllowedOrigins: finalizeDefault((data: ServerApplication) => {
    const { devServerPort, devServerPortProxy, microfrontend } = data as ServerApplication & {
      devServerPortProxy?: number;
      microfrontend?: boolean;
    };
    const ports = [
      // Ionic for JHipster
      8100,
      ...(devServerPortProxy ? [devServerPortProxy] : []),
      ...(data.skipClient ? [] : [devServerPort]),
      // The microfrontends in development
      ...(!data.skipClient && data.applicationTypeGateway && microfrontend ?
        Array.from({ length: 9 }, (_, index) => devServerPort + index + 1)
      : []),
    ];
    return [...ports.flatMap(port => [`http://localhost:${port}`, `https://localhost:${port}`]), ...data.corsAdditionalAllowedOrigins];
  }),
  // GitHub Codespaces
  corsAllowedOriginPatterns: () => ['https://*.githubpreview.dev'],
} as const satisfies MutateDataPropertiesWithRequiredProperties<MutateDataParam<ServerApplication>, ServerAddedApplicationProperties>;
