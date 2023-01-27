import { databaseTypes, fieldTypes } from '../../../jdl/jhipster/index.mjs';

const dbTypes = fieldTypes;
const { STRING: TYPE_STRING, LONG: TYPE_LONG, UUID: TYPE_UUID } = dbTypes.CommonDBTypes;
const { MONGODB, NEO4J, COUCHBASE, CASSANDRA, SQL } = databaseTypes;

type DatabaseTypeData = {
  name: string;
  defaultPrimaryKeyType: string;
};

const databaseTypeDataFallback: DatabaseTypeData = {
  name: 'Unknown',
  defaultPrimaryKeyType: TYPE_LONG,
};

export const databaseTypeData: Record<string, DatabaseTypeData> = {
  [CASSANDRA]: {
    name: 'Cassandra',
    defaultPrimaryKeyType: TYPE_UUID,
  },
  [COUCHBASE]: {
    name: 'Couchbase',
    defaultPrimaryKeyType: TYPE_STRING,
  },
  [MONGODB]: {
    name: 'MongoDB',
    defaultPrimaryKeyType: TYPE_STRING,
  },
  [NEO4J]: {
    name: 'Neo4j',
    defaultPrimaryKeyType: TYPE_STRING,
  },
  [SQL]: {
    name: 'SQL',
    defaultPrimaryKeyType: TYPE_LONG,
  },
};

export const getDatabaseTypeData = (databaseType: string): DatabaseTypeData => {
  return databaseTypeData[databaseType] ?? databaseTypeDataFallback;
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
