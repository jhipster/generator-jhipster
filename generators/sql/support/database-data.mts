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
import { databaseTypes } from '../../../jdl/jhipster/index.mjs';

export type DatabaseData = {
  name: string;
  protocolSuffix: string;
  jdbcDriver: string;
  port?: string;
  localDirectory?: string;
  extraOptions?: string;

  constraintNameMaxLength?: number;
  tableNameMaxLength?: number;
};

export type getData = (options: {
  prodDatabaseType?: string;
  localDirectory?: string;
  buildDirectory?: string;
  itests?: boolean;
}) => Partial<DatabaseData>;

export type DatabaseDataSpec = DatabaseData & {
  jdbc?: Partial<DatabaseData>;
  r2dbc?: Partial<DatabaseData>;
  getData?: getData;
};

const { H2_DISK, H2_MEMORY, MARIADB, MSSQL, MYSQL, ORACLE, POSTGRESQL } = databaseTypes;

const H2_PROD_DATABASE_MODE = {
  [MYSQL]: ';MODE=MYSQL',
  [MARIADB]: ';MODE=LEGACY',
};

const h2GetProdDatabaseData = (
  databaseType: string,
  { extraOptions = '' }: { extraOptions?: string },
  { prodDatabaseType, buildDirectory, itests, localDirectory }: Parameters<getData>[0]
): Partial<DatabaseData> => {
  const data: Partial<DatabaseData> = {};
  if (H2_DISK === databaseType) {
    if (!localDirectory && !buildDirectory) {
      throw new Error(`'localDirectory' option should be provided for ${databaseType} databaseType`);
    }
    if (localDirectory) {
      localDirectory = `${localDirectory}/`;
    } else {
      localDirectory = `${buildDirectory}h2db/${itests ? 'testdb/' : 'db/'}`;
    }
  }

  if (itests && H2_MEMORY === databaseType) {
    data.port = ':12344';
  }

  const h2ProdDatabaseMode = prodDatabaseType ? H2_PROD_DATABASE_MODE[prodDatabaseType] ?? '' : '';
  return {
    ...data,
    localDirectory,
    extraOptions: `${extraOptions}${h2ProdDatabaseMode}`,
  };
};

const databaseData: Record<string, DatabaseDataSpec> = {
  [MSSQL]: {
    name: 'SQL Server',
    protocolSuffix: 'sqlserver://',
    jdbcDriver: '',
    port: ':1433;database=',
    jdbc: {
      extraOptions: ';encrypt=false',
    },
    r2dbc: {
      protocolSuffix: 'mssql://',
      port: ':1433/',
    },
  },
  [MARIADB]: {
    name: 'MariaDB',
    protocolSuffix: 'mariadb://',
    jdbcDriver: 'org.mariadb.jdbc.Driver',
    port: ':3306/',
    extraOptions: '?useLegacyDatetimeCode=false&serverTimezone=UTC',

    constraintNameMaxLength: 64,
    tableNameMaxLength: 64,
  },
  [MYSQL]: {
    name: 'MySQL',
    jdbcDriver: 'com.mysql.cj.jdbc.Driver',
    tableNameMaxLength: 64,
    constraintNameMaxLength: 64,
    protocolSuffix: 'mysql://',
    port: ':3306/',
    extraOptions:
      '?useUnicode=true&characterEncoding=utf8&useSSL=false&useLegacyDatetimeCode=false&serverTimezone=UTC&createDatabaseIfNotExist=true',
    r2dbc: {
      protocolSuffix: 'mariadb://',
    },
  },
  [ORACLE]: {
    name: 'Oracle',
    protocolSuffix: 'oracle:thin:@',
    jdbcDriver: 'oracle.jdbc.OracleDriver',
    port: ':1521:',

    constraintNameMaxLength: 128,
    tableNameMaxLength: 128,
  },
  [POSTGRESQL]: {
    name: 'PostgreSQL',
    protocolSuffix: 'postgresql://',
    jdbcDriver: 'org.postgresql.Driver',
    port: ':5432/',

    constraintNameMaxLength: 63,
    tableNameMaxLength: 63,
  },
  [H2_DISK]: {
    name: 'H2Disk',
    protocolSuffix: 'h2:file:',
    jdbcDriver: 'org.h2.Driver',
    getData: options => h2GetProdDatabaseData(H2_DISK, { extraOptions: ';DB_CLOSE_DELAY=-1' }, options),
    r2dbc: {
      protocolSuffix: 'h2:file:///',
    },
  },
  [H2_MEMORY]: {
    name: 'H2Memory',
    protocolSuffix: 'h2:mem:',
    jdbcDriver: 'org.h2.Driver',
    getData: options => h2GetProdDatabaseData(H2_MEMORY, { extraOptions: ';DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE' }, options),
    r2dbc: {
      protocolSuffix: 'h2:mem:///',
    },
  },
};

export default databaseData;

function getDatabaseData(databaseType: string) {
  if (databaseData[databaseType] === undefined) {
    throw new Error(`Database data not found for database ${databaseType}`);
  }
  return databaseData[databaseType];
}

export function getJdbcDriver(databaseType: string): string {
  return getDatabaseData(databaseType).jdbcDriver;
}
