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

import { describe, expect, it } from 'expect-node';

import { createDockerComposeFile, flowHealthcheckCommands, mergeDockerComposeFile } from './docker-compose-file.ts';

describe('generator - docker - docker-compose-file', () => {
  describe('createDockerComposeFile', () => {
    it('should return a docker compose file header with default name', () => {
      expect(createDockerComposeFile()).toMatchInlineSnapshot(`
"# This configuration is intended for development purpose, it's **your** responsibility to harden it for production
name: jhipster
"
`);
    });

    it('should return a docker compose file header with custom name', () => {
      expect(createDockerComposeFile('customService')).toMatchInlineSnapshot(`
"# This configuration is intended for development purpose, it's **your** responsibility to harden it for production
name: customService
"
`);
    });
  });

  describe('mergeDockerComposeFile', () => {
    it('should merge the data into the source, adding the items of its lists', () => {
      const source = `name: jhipster
services:
  postgresql:
    image: postgres
    environment:
      - POSTGRES_HOST_AUTH_METHOD=trust
`;
      expect(
        mergeDockerComposeFile(
          {
            source: 'postgresql.yml',
            data: { name: 'app', services: { postgresql: { image: 'postgres:18', environment: ['POSTGRES_USER=app'] } } },
          },
          source,
        ),
      ).toEqual({
        name: 'app',
        services: { postgresql: { image: 'postgres:18', environment: ['POSTGRES_HOST_AUTH_METHOD=trust', 'POSTGRES_USER=app'] } },
      });
    });
  });

  describe('flowHealthcheckCommands', () => {
    it('writes the healthcheck command of each service on one line', () => {
      expect(
        flowHealthcheckCommands(`services:
  app:
    healthcheck:
      test:
        - CMD-SHELL
        - "curl -f 'http://localhost:8080/'"
      retries: 40
  db:
    image: db
`),
      ).toBe(`services:
  app:
    healthcheck:
      test: [ 'CMD-SHELL', 'curl -f ''http://localhost:8080/''' ]
      retries: 40
  db:
    image: db
`);
    });
  });
});
