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
import { addDockerComposeFile, dockerComposeLocalPorts } from '../../../../docker/support/index.ts';
import type { Application as SpringBootApplication } from '../../../types.ts';

/** Adds the `app` docker compose file of the application: its container, from its docker environment. */
export const addApplicationDockerComposeFile = (application: SpringBootApplication) => {
  const { baseName, serverPort, dockerApplicationEnvironment } = application;
  addDockerComposeFile(application, 'app', {
    app: {
      image: baseName.toLowerCase(),
      environment: Object.entries(dockerApplicationEnvironment).map(([key, value]) => `${key}=${value ?? ''}`),
      ...(application.applicationTypeMonolith || application.applicationTypeGateway ? { ports: dockerComposeLocalPorts(serverPort) } : {}),
      healthcheck: {
        test: [
          'CMD-SHELL',
          String.raw`bash -c 'exec 3<>/dev/tcp/127.0.0.1/${serverPort}; printf "GET /management/health HTTP/1.0\r\nHost: localhost\r\n\r\n" >&3; grep -q "\"status\":\"UP\"" <&3'`,
        ],
        interval: '5s',
        timeout: '5s',
        retries: 40,
      },
    },
  });
};
