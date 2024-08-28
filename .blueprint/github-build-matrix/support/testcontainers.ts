import { extendMatrix, fromMatrix } from '../../../testing/index.js';
import { convertToCliArgs } from './cli-args.js';

export const testcontainersMatrix = Object.fromEntries(
  Object.entries(
    extendMatrix(
      {
        ...fromMatrix({ reactive: [false, true], databaseType: ['cassandra', 'mongodb', 'neo4j'] }),
        ...extendMatrix(fromMatrix({ reactive: [false, true], prodDatabaseType: ['postgresql', 'mysql', 'mariadb'] }), {
          cacheProvider: ['no', 'redis', 'memcached'],
        }),
      },
      {
        searchEngine: ['no', 'elasticsearch'],
        auth: ['jwt', 'oauth2'],
        serviceDiscovery: ['no', 'eureka', 'consul'],
        messageBroker: ['no', 'kafka', 'pulsar'],
      },
    ),
  ).map(([key, value]) => [key, { args: convertToCliArgs(value) }]),
);
