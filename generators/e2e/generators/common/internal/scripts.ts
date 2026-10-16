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
/** The time the e2e scripts wait for the dev server. */
export const WAIT_TIMEOUT = 3 * 60000;

/** What the e2e scripts of the root package.json need to run the client, from its workspace when it has one. */
export const e2eScriptsContext = (application: {
  clientFrameworkAngular?: boolean;
  microfrontend?: boolean;
  devServerPort?: number;
  devServerPortProxy?: number;
  clientRootDir?: string;
}) => {
  const { clientRootDir, devServerPort, devServerPortProxy: devServerPortE2e = devServerPort } = application;
  const angular = Boolean(application.clientFrameworkAngular);
  const clientRun = (script: string) => `npm run ${clientRootDir ? `-w ${clientRootDir} ` : ''}${script}`;
  return {
    devServerPortE2e,
    // The native federation dev server never reports its url to `ng e2e` (the builder only yields on rebuilds),
    // so microfrontend applications start the dev server concurrently and wait for its port instead.
    ngE2e: angular && !application.microfrontend,
    // The Angular dev server listens on localhost only (which may resolve to ::1), Vite listens on every address.
    devServerHost: angular ? 'localhost' : '127.0.0.1',
    clientRun,
    clientStart: clientRootDir ? `"${clientRun('start')}"` : 'npm:start',
    ng: clientRootDir ? `npm exec -w ${clientRootDir} -- ng` : 'ng',
  };
};
