import type { GitHubMatrixGroup } from '../../../lib/testing/index.js';
import { extendMatrix, fromMatrix } from '../../../lib/testing/index.js';
import { convertOptionsToJDL } from '../support/jdl.js';

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
    ['h2', { devDatabaseType: 'h2Disk' }],
  ].map(([key, value]) => [
    key,
    {
      'cmd-e2e': 'npm run ci:e2e:dev',
      args: 'jdl',
      jdl: convertOptionsToJDL(value),
    },
  ]),
) satisfies GitHubMatrixGroup;
