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
import type { Application as ClientApplication } from '../client/types.ts';

export type E2eAddedApplicationProperties = {
  /** The port the e2e tests reach the client at: the proxy port of a microfrontend, the dev server port otherwise. */
  e2eDevServerPort: number;
  /** The host the e2e scripts wait for the dev server at. */
  e2eDevServerHost: string;
  /** Whether the e2e tests run through `ng e2e`, which starts the dev server. */
  e2eNgBuilder: boolean;
  /** The time, in milliseconds, the e2e scripts wait for the dev server. */
  e2eWaitTimeout: number;
  /** `npm run` for a script of the client, from its workspace when it has one. */
  clientNpmRun: string;
  /** The `ng` command of the client, from its workspace when it has one. */
  clientNgCommand: string;
};

export const mutateApplication = {
  __override__: false,
  // The dev server port is set by the bootstrap of the client framework, which may run after this one.
  e2eDevServerPort: ({ devServerPort, devServerPortProxy }, { delayMarker }) => devServerPortProxy ?? devServerPort ?? delayMarker!,
  // The Angular dev server listens on localhost only (which may resolve to ::1), Vite listens on every address.
  e2eDevServerHost: ({ clientFrameworkAngular }) => (clientFrameworkAngular ? 'localhost' : '127.0.0.1'),
  // The native federation dev server never reports its url to `ng e2e` (the builder only yields on rebuilds),
  // so microfrontend applications start the dev server concurrently and wait for its port instead.
  e2eNgBuilder: ({ clientFrameworkAngular, microfrontend }) => Boolean(clientFrameworkAngular) && !microfrontend,
  e2eWaitTimeout: 3 * 60000,
  clientNpmRun: ({ clientRootDir }) => (clientRootDir ? `npm run -w ${clientRootDir}` : 'npm run'),
  clientNgCommand: ({ clientRootDir }) => (clientRootDir ? `npm exec -w ${clientRootDir} -- ng` : 'ng'),
} as const satisfies MutateDataPropertiesWithRequiredProperties<
  MutateDataParam<ClientApplication & E2eAddedApplicationProperties>,
  E2eAddedApplicationProperties
>;
