import { extendMatrix, fromMatrix } from '../../../lib/testing/index.js';
import { convertToCliArgs } from './cli-args.js';

// Supported containers: https://github.com/spring-projects/spring-boot/tree/main/spring-boot-project/spring-boot-docker-compose/src/main/java/org/springframework/boot/docker/compose/service/connection
export const testcontainersMatrix = Object.fromEntries(
  Object.entries(
    extendMatrix(
      {
        ...fromMatrix({
          databaseType: ['cassandra', 'mongodb', 'neo4j'],
          reactive: [false, true],
        }),
        ...extendMatrix(
          fromMatrix(
            {
              prodDatabaseType: ['postgresql', 'mysql', 'mariadb'],
              reactive: [false, true],
            }
          ),
          { cacheProvider: ['no', 'redis', 'memcached'] },
        ),
      },
      {
        build: ['maven', 'gradle'],
        searchEngine: ['no', 'elasticsearch'],
        // auth: ['jwt', 'oauth2'],
        // serviceDiscoveryType: ['no', 'eureka', 'consul'],
        // messageBroker: ['no', 'kafka'],
      },
    ),
  ).map(([key, value]) => [key, { args: convertToCliArgs(value) }]),
);
