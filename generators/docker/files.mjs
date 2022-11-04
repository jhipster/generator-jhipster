import { DOCKER_DIR } from '../generator-constants.mjs';

// eslint-disable-next-line import/prefer-default-export
export const dockerFiles = {
  sqlDatabasesFiles: [
    {
      condition: ctx => ctx.databaseTypeSql && !ctx.prodDatabaseTypeOracle,
      path: DOCKER_DIR,
      templates: [{ file: ctx => `${ctx.prodDatabaseType}.yml` }],
    },
    {
      condition: ctx => ctx.prodDatabaseTypeMysql,
      path: DOCKER_DIR,
      templates: [{ file: 'config/mysql/my.cnf', noEjs: true }],
    },
    {
      condition: ctx => ctx.prodDatabaseTypeMariadb,
      path: DOCKER_DIR,
      templates: [{ file: 'config/mariadb/my.cnf', noEjs: true }],
    },
  ],
  couchbaseFiles: [
    {
      condition: ctx => ctx.databaseTypeCouchbase,
      path: DOCKER_DIR,
      templates: ['couchbase.yml', 'couchbase-cluster.yml', 'couchbase/Couchbase.Dockerfile', 'couchbase/scripts/configure-node.sh'],
    },
  ],
  mongodbFiles: [
    {
      condition: ctx => ctx.databaseTypeMongodb,
      path: DOCKER_DIR,
      templates: ['mongodb.yml', 'mongodb-cluster.yml', 'mongodb/MongoDB.Dockerfile', 'mongodb/scripts/init_replicaset.js'],
    },
  ],
  cassandraFiles: [
    {
      condition: ctx => ctx.databaseTypeCassandra,
      path: DOCKER_DIR,
      templates: [
        // docker-compose files
        'cassandra.yml',
        'cassandra-cluster.yml',
        'cassandra-migration.yml',
        // dockerfiles
        'cassandra/Cassandra-Migration.Dockerfile',
        // scripts
        'cassandra/scripts/autoMigrate.sh',
        'cassandra/scripts/execute-cql.sh',
      ],
    },
  ],
  neo4jFiles: [
    {
      condition: ctx => ctx.databaseTypeNeo4j,
      path: DOCKER_DIR,
      templates: ['neo4j.yml'],
    },
  ],
  cacheProvideFiles: [
    {
      condition: generator => generator.cacheProviderHazelcast,
      path: DOCKER_DIR,
      templates: ['hazelcast-management-center.yml'],
    },
    {
      condition: generator => generator.cacheProviderMemcached,
      path: DOCKER_DIR,
      templates: ['memcached.yml'],
    },
    {
      condition: generator => generator.cacheProviderRedis,
      path: DOCKER_DIR,
      templates: ['redis.yml', 'redis-cluster.yml', 'redis/Redis-Cluster.Dockerfile', 'redis/connectRedisCluster.sh'],
    },
  ],
  searchDiscoveryFiles: [
    {
      condition: generator => generator.serviceDiscoveryAny,
      path: DOCKER_DIR,
      templates: [{ file: 'config/README.md', renameTo: () => 'central-server-config/README.md' }],
    },
    {
      condition: generator => generator.serviceDiscoveryConsul,
      path: DOCKER_DIR,
      templates: [
        'consul.yml',
        'config/git2consul.json',
        { file: 'config/consul-config/application.yml', renameTo: () => 'central-server-config/application.yml' },
      ],
    },
    {
      condition: generator => generator.serviceDiscoveryEureka,
      path: DOCKER_DIR,
      templates: [
        'jhipster-registry.yml',
        {
          file: 'config/docker-config/application.yml',
          renameTo: () => 'central-server-config/docker-config/application.yml',
        },
        {
          file: 'config/localhost-config/application.yml',
          renameTo: () => 'central-server-config/localhost-config/application.yml',
        },
      ],
    },
  ],
  applicationFiles: [
    {
      path: DOCKER_DIR,
      templates: [
        'app.yml',
        'jhipster-control-center.yml',
        'sonar.yml',
        'monitoring.yml',
        'prometheus/prometheus.yml',
        'grafana/provisioning/dashboards/dashboard.yml',
        'grafana/provisioning/dashboards/JVM.json',
        'grafana/provisioning/datasources/datasource.yml',
      ],
    },
    {
      condition: generator => generator.searchEngineElasticsearch,
      path: DOCKER_DIR,
      templates: ['elasticsearch.yml'],
    },
    {
      condition: generator => generator.messageBrokerKafka,
      path: DOCKER_DIR,
      templates: ['kafka.yml'],
    },
    {
      condition: generator => !!generator.enableSwaggerCodegen,
      path: DOCKER_DIR,
      templates: ['swagger-editor.yml'],
    },
    {
      condition: generator => generator.authenticationTypeOauth2 && !generator.applicationTypeMicroservice,
      path: DOCKER_DIR,
      templates: ['keycloak.yml', { file: 'config/realm-config/jhipster-realm.json', renameTo: () => 'realm-config/jhipster-realm.json' }],
    },
    {
      condition: generator => generator.serviceDiscoveryAny || generator.applicationTypeGateway || generator.applicationTypeMicroservice,
      path: DOCKER_DIR,
      templates: ['zipkin.yml'],
    },
  ],
};
