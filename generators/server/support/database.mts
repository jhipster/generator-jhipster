import { databaseTypes } from '../../../jdl/jhipster/index.mjs';

const SQL = databaseTypes.SQL;

export const OFFICIAL_DATABASE_TYPE_NAMES = {
  cassandra: 'Cassandra',
  couchbase: 'Couchbase',
  mongodb: 'MongoDB',
  neo4j: 'Neo4j',
  sql: 'SQL',
};

export const R2DBC_DB_OPTIONS = [
  {
    value: databaseTypes.POSTGRESQL,
    name: 'PostgreSQL',
  },
  {
    value: databaseTypes.MYSQL,
    name: 'MySQL',
  },
  {
    value: databaseTypes.MARIADB,
    name: 'MariaDB',
  },
  {
    value: databaseTypes.MSSQL,
    name: 'Microsoft SQL Server',
  },
];

export const SQL_DB_OPTIONS = [
  {
    value: databaseTypes.POSTGRESQL,
    name: 'PostgreSQL',
  },
  {
    value: databaseTypes.MYSQL,
    name: 'MySQL',
  },
  {
    value: databaseTypes.MARIADB,
    name: 'MariaDB',
  },
  {
    value: databaseTypes.ORACLE,
    name: 'Oracle',
  },
  {
    value: databaseTypes.MSSQL,
    name: 'Microsoft SQL Server',
  },
];

/**
 * Get DB type from DB value
 * @param {string} db - db
 */
export function getDBTypeFromDBValue(db) {
  if (SQL_DB_OPTIONS.map(db => db.value).includes(db)) {
    return SQL;
  }
  return db;
}
