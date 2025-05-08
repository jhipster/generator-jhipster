import { TEMPLATES_DOCKER_DIR } from '../generator-constants.js';

const renameTo = (ctx, filepath) => `${ctx.dockerServicesDir}${filepath}`.replace('/_eureka_', '').replace('/_consul_', '');

export const dockerFiles = {
  commonFiles: [
    {
      condition: ctx => ctx.eslintConfigFile,
      templates: [{ sourceFile: 'eslint.config.js.jhi.docker', destinationFile: ctx => `${ctx.eslintConfigFile}.jhi.docker` }],
    },
  ],
  sqlDatabasesFiles: [
    {
      condition: ctx => ctx.dockerServices.some(service => ['postgresql', 'mariadb', 'mysql', 'mssql'].includes(service)),
      templates: [
        {
          sourceFile: ctx => `${TEMPLATES_DOCKER_DIR}${ctx.prodDatabaseType}.yml`,
          destinationFile: ctx => `${ctx.dockerServicesDir}${ctx.prodDatabaseType}.yml`,
        },
      ],
    },
    {
      condition: ctx => ctx.dockerServices.includes('mysql'),
      path: TEMPLATES_DOCKER_DIR,
      renameTo,
      transform: false,
      templates: ['config/mysql/my.cnf'],
    },
    {
      condition: ctx => ctx.dockerServices.includes('mariadb'),
      path: TEMPLATES_DOCKER_DIR,
      renameTo,
      transform: false,
      templates: ['config/mariadb/my.cnf'],
    },
  ],
  couchbaseFiles: [
    {
      condition: ctx => ctx.dockerServices.includes('couchbase'),
      path: TEMPLATES_DOCKER_DIR,
      renameTo,
      templates: ['couchbase.yml', 'couchbase-cluster.yml', 'couchbase/Couchbase.Dockerfile', 'couchbase/scripts/configure-node.sh'],
    },
  ],
  mongodbFiles: [
    {
      condition: ctx => ctx.dockerServices.includes('mongodb'),
      path: TEMPLATES_DOCKER_DIR,
      renameTo,
      templates: ['mongodb.yml', 'mongodb-cluster.yml', 'mongodb/MongoDB.Dockerfile', 'mongodb/scripts/init_replicaset.js'],
    },
  ],
  cassandraFiles: [
    {
      condition: ctx => ctx.dockerServices.includes('cassandra'),
      path: TEMPLATES_DOCKER_DIR,
      renameTo,
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
      condition: ctx => ctx.dockerServices.includes('neo4j'),
      path: TEMPLATES_DOCKER_DIR,
      renameTo,
      templates: ['neo4j.yml'],
    },
  ],
  cacheProvideFiles: [
    {
      condition: generator => generator.dockerServices.includes('hazelcast'),
      path: TEMPLATES_DOCKER_DIR,
      renameTo,
      templates: ['hazelcast-management-center.yml'],
    },
    {
      condition: generator => generator.dockerServices.includes('memcached'),
      path: TEMPLATES_DOCKER_DIR,
      renameTo,
      templates: ['memcached.yml'],
    },
    {
      condition: generator => generator.dockerServices.includes('redis'),
      path: TEMPLATES_DOCKER_DIR,
      renameTo,
      templates: ['redis.yml', 'redis-cluster.yml', 'redis/Redis-Cluster.Dockerfile', 'redis/connectRedisCluster.sh'],
    },
  ],
  searchDiscoveryFiles: [
    {
      condition: generator => generator.serviceDiscoveryAny,
      path: TEMPLATES_DOCKER_DIR,
      renameTo,
      templates: ['central-server-config/README.md'],
    },
    {
      condition: generator => generator.dockerServices.includes('consul'),
      path: TEMPLATES_DOCKER_DIR,
      renameTo,
      templates: ['consul.yml', 'config/git2consul.json', 'central-server-config/_consul_/application.yml'],
    },
    {
      condition: generator => generator.dockerServices.includes('eureka'),
      path: TEMPLATES_DOCKER_DIR,
      renameTo,
      templates: [
        'jhipster-registry.yml',
        'central-server-config/_eureka_/docker-config/application.yml',
        'central-server-config/_eureka_/localhost-config/application.yml',
      ],
    },
  ],
  applicationFiles: [
    {
      path: TEMPLATES_DOCKER_DIR,
      condition: ctx => ctx.dockerServices.includes('app') || ctx.backendTypeSpringBoot,
      renameTo,
      templates: ['app.yml'],
    },
    {
      path: TEMPLATES_DOCKER_DIR,
      condition: ctx => ctx.backendTypeJavaAny,
      renameTo,
      templates: [
        'jhipster-control-center.yml',
        'monitoring.yml',
        'grafana/provisioning/dashboards/dashboard.yml',
        'grafana/provisioning/dashboards/JVM.json',
        'grafana/provisioning/datasources/datasource.yml',
      ],
    },
    {
      path: TEMPLATES_DOCKER_DIR,
      renameTo,
      templates: ['sonar.yml', 'prometheus/prometheus.yml'],
    },
    {
      condition: generator => generator.dockerServices.includes('elasticsearch'),
      path: TEMPLATES_DOCKER_DIR,
      renameTo,
      templates: ['elasticsearch.yml'],
    },
    {
      condition: generator => generator.dockerServices.includes('kafka'),
      path: TEMPLATES_DOCKER_DIR,
      renameTo,
      templates: ['kafka.yml'],
    },
    {
      condition: generator => generator.dockerServices.includes('pulsar'),
      path: TEMPLATES_DOCKER_DIR,
      renameTo,
      templates: ['pulsar.yml'],
    },
    {
      condition: generator => !!generator.dockerServices.includes('swagger-editor'),
      path: TEMPLATES_DOCKER_DIR,
      renameTo,
      templates: ['swagger-editor.yml'],
    },
    {
      condition: generator => generator.dockerServices.includes('keycloak'),
      path: TEMPLATES_DOCKER_DIR,
      renameTo,
      templates: ['keycloak.yml', 'realm-config/jhipster-realm.json'],
    },
    {
      condition: generator => generator.dockerServices.includes('keycloak'),
      path: TEMPLATES_DOCKER_DIR,
      renameTo,
      transform: false,
      templates: ['realm-config/keycloak-health-check.sh'],
    },
    {
      condition: generator => generator.dockerServices.includes('zipkin'),
      path: TEMPLATES_DOCKER_DIR,
      renameTo,
      templates: ['zipkin.yml'],
    },
  ],
};
