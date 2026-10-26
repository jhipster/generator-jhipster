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

import { databaseTypes } from '../../../lib/jhipster/index.ts';

const { SQL } = databaseTypes;

/**
 * @deprecated moved to `jhipster:base-application:database`; import them from
 * `generators/base-application/generators/database/support`.
 */
export { type DatabaseTypeData, databaseTypeData, getDatabaseTypeData } from '../../base-application/generators/database/support/index.ts';

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
] as { value: string; name: string }[];

/**
 * Get DB type from DB value
 * @param {string} db - db
 */
export function getDBTypeFromDBValue(db: string): string {
  if (SQL_DB_OPTIONS.map(db => db.value).includes(db)) {
    return SQL;
  }
  return db;
}

/**
 * @deprecated moved to `jhipster:base-application:database`; import them from
 * `generators/base-application/generators/database/support`.
 */
export {
  calculateDbName,
  calculateDbNameWithLimit,
  getFKConstraintName,
  getJoinTableName,
  getUXConstraintName,
} from '../../base-application/generators/database/support/index.ts';
