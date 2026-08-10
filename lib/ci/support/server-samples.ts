
import { databaseTypes } from '../../jhipster/index.ts';

const { CASSANDRA, COUCHBASE, MONGODB, NEO4J, MARIADB, MSSQL, MYSQL, ORACLE, POSTGRESQL, H2_DISK, H2_MEMORY } = databaseTypes;

export const serverSamples = {
  'maven-gradle': {
    'maven-java': { buildTool: 'maven' },
    'gradle-java': { buildTool: 'gradle' },
  },
  databases: {
    cassandra: { databaseType: CASSANDRA, enableLiquibase: true },
    couchbase: { databaseType: COUCHBASE },
    mongodb: { databaseType: MONGODB },
    neo4j: { databaseType: NEO4J },
    mariadb: { databaseType: MARIADB },
    mssql: { databaseType: MSSQL },
    mysql: { databaseType: MYSQL },
    oracle: { databaseType: ORACLE },
    postgresql: { databaseType: POSTGRESQL },
    h2Disk: { databaseType: H2_DISK },
    h2Memory: { databaseType: H2_MEMORY },
  },
};
