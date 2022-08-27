/**
 * Copyright 2013-2022 the original author or authors from the JHipster project.
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
const databaseTypes = require('../jdl/jhipster/database-types');

const { H2_DISK, H2_MEMORY, MARIADB, MSSQL, MYSQL, ORACLE, POSTGRESQL } = databaseTypes;

const databaseData = {
  [MSSQL]: {
    protocolSuffix: 'sqlserver://',
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
    tableNameMaxLength: 64,
    constraintNameMaxLength: 64,
    protocolSuffix: 'mariadb://',
    port: ':3306/',
    extraOptions: '?useLegacyDatetimeCode=false&serverTimezone=UTC',
  },
  [MYSQL]: {
    name: 'MySQL',
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
    tableNameMaxLength: 128,
    constraintNameMaxLength: 128,
    protocolSuffix: 'oracle:thin:@',
    port: ':1521:',
  },
  [POSTGRESQL]: {
    name: 'PostgreSQL',
    tableNameMaxLength: 63,
    constraintNameMaxLength: 63,
    protocolSuffix: 'postgresql://',
    port: ':5432/',
  },
  [H2_DISK]: {
    protocolSuffix: 'h2:file:',
    useDirectory: true,
    extraOptions: ';DB_CLOSE_DELAY=-1;MODE=LEGACY',
    r2dbc: {
      protocolSuffix: 'h2:file://',
    },
  },
  [H2_MEMORY]: {
    protocolSuffix: 'h2:mem:',
    extraOptions: ';DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;MODE=LEGACY',
    r2dbc: {
      protocolSuffix: 'h2:mem:///',
    },
  },
};

module.exports = {
  databaseData,
};
