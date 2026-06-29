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

import { type GitHubMatrixGroup, type MatrixSample, extendMatrix, fromMatrix } from '../../../lib/ci/index.ts';
import { convertOptionsToJDL } from '../support/jdl.ts';

// Supported containers: https://github.com/spring-projects/spring-boot/tree/main/spring-boot-project/spring-boot-docker-compose/src/main/java/org/springframework/boot/docker/compose/service/connection
export default Object.fromEntries(
  [
    ...Object.entries(
      extendMatrix(
        {
          ...fromMatrix({
            databaseType: ['cassandra', 'mongodb', 'neo4j'],
            reactive: [undefined, true],
          }),
          ...extendMatrix(
            fromMatrix({
              prodDatabaseType: ['postgresql', 'mysql', 'mariadb'],
              reactive: [undefined],
            }),
            { cacheProvider: ['no', 'redis', 'memcached'] },
          ),
          ...fromMatrix({
            prodDatabaseType: ['postgresql', 'mysql', 'mariadb'],
            reactive: [true],
          }),
        },
        {
          buildTool: ['maven', 'gradle'],
          searchEngine: [undefined, 'elasticsearch'],
          authenticationType: ['jwt', 'oauth2'],
          serviceDiscoveryType: [undefined, 'eureka', 'consul'],
          messageBroker: [undefined, 'kafka'],
        },
      ),
    ),
    ['h2', { devDatabaseType: 'h2Disk' } as MatrixSample],
  ].map(([key, value]) => [
    key as string,
    {
      'cmd-e2e': 'npm run ci:e2e:dev',
      args: 'jdl',
      jdl: convertOptionsToJDL(value as MatrixSample),
    },
  ]),
) satisfies GitHubMatrixGroup;
