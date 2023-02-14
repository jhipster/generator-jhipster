/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
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
import crypto from 'crypto';

import { databaseTypes, fieldTypes } from '../../../jdl/jhipster/index.mjs';
import { hibernateSnakeCase } from './string.mjs';

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

/**
 * get for tables/constraints in JHipster preferred style after applying any length limits required.
 *
 * @param {string} tableOrEntityName - name of the table or entity
 * @param {string} columnOrRelationshipName - name of the column or relationship
 * @param {number} limit - max length of the returned db reference name
 * @param {object} [options]
 * @param {boolean} [options.noSnakeCase = false] - do not convert names to snakecase
 * @param {string} [options.prefix = '']
 * @param {string} [options.separator = '__']
 * @return {string} db referente name
 */
export function calculateDbNameWithLimit(
  tableOrEntityName: string,
  columnOrRelationshipName: string,
  limit: number,
  { noSnakeCase = false, prefix = '', separator = '__' }: { noSnakeCase?: boolean; prefix?: string; separator?: string } = {}
): string {
  const halfLimit = Math.floor(limit / 2);
  const suffix = `_${crypto
    .createHash('shake256', { outputLength: 1 })
    .update(`${tableOrEntityName}.${columnOrRelationshipName}`, 'utf8')
    .digest('hex')}`;

  let formattedName = noSnakeCase ? tableOrEntityName : hibernateSnakeCase(tableOrEntityName);
  formattedName = formattedName.substring(0, halfLimit - separator.length);

  let otherFormattedName = noSnakeCase ? columnOrRelationshipName : hibernateSnakeCase(columnOrRelationshipName);
  otherFormattedName = otherFormattedName.substring(0, limit - formattedName.length - separator.length - prefix.length - suffix.length);

  return `${prefix}${formattedName}${separator}${otherFormattedName}${suffix}`;
}
