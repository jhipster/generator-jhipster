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

import JHipsterReservedKeywords from './reserved-keywords/jhipster.js';
import PagingReservedKeywords from './reserved-keywords/paging.js';
import AngularReservedKeywords from './reserved-keywords/angular.js';
import MySQLReservedKeywords from './reserved-keywords/mysql.js';
import JavaReservedKeywords from './reserved-keywords/java.js';
import TypescriptReservedKeywords from './reserved-keywords/typescript.js';
import PostgresqlReservedKeywords from './reserved-keywords/postgresql.js';
import CassandraReservedKeywords from './reserved-keywords/cassandra.js';
import CouchbaseReservedKeywords from './reserved-keywords/couchbase.js';
import OracleReservedKeywords from './reserved-keywords/oracle.js';
import MsSQLReservedKeywords from './reserved-keywords/mssql.js';
import Neo4JReservedKeywords from './reserved-keywords/neo4j.js';
import applicationOptions from './application-options.js';

const clientFrameworks = applicationOptions.OptionValues[applicationOptions.OptionNames.CLIENT_FRAMEWORK];

const ReservedWords = {
  JHIPSTER: JHipsterReservedKeywords,
  ANGULAR: AngularReservedKeywords,
  // TODO: Remove react from the object if there are no reserve keywords for react.
  REACT: [],
  JAVA: JavaReservedKeywords,
  TYPESCRIPT: TypescriptReservedKeywords,
  MYSQL: MySQLReservedKeywords,
  MARIADB: MySQLReservedKeywords,
  POSTGRESQL: PostgresqlReservedKeywords,
  PAGING: PagingReservedKeywords,
  CASSANDRA: CassandraReservedKeywords,
  COUCHBASE: CouchbaseReservedKeywords,
  ORACLE: OracleReservedKeywords,
  MONGODB: ['DOCUMENT'],
  MSSQL: MsSQLReservedKeywords,
  NEO4J: Neo4JReservedKeywords,
};

export function isReserved(keyword?: any, type?: any) {
  return !!keyword && !!type && !!ReservedWords[type.toUpperCase()] && ReservedWords[type.toUpperCase()].includes(keyword.toUpperCase());
}

export function isReservedClassName(keyword) {
  return (
    isReserved(keyword, 'JHIPSTER') || isReserved(keyword, 'ANGULAR') || isReserved(keyword, 'TYPESCRIPT') || isReserved(keyword, 'JAVA')
  );
}

export function isReservedTableName(keyword, databaseType) {
  return databaseType.toUpperCase() === 'SQL'
    ? isReserved(keyword, 'MYSQL') || isReserved(keyword, 'POSTGRESQL') || isReserved(keyword, 'ORACLE') || isReserved(keyword, 'MSSQL')
    : isReserved(keyword, databaseType);
}

export function isReservedPaginationWords(keyword) {
  return isReserved(keyword, 'PAGING');
}

export function isReservedFieldName(keyword, clientFramework?: any) {
  if (clientFramework) {
    if (clientFramework === clientFrameworks.angular) {
      // Angular client framework
      return isReserved(keyword, 'ANGULAR') || isReserved(keyword, 'TYPESCRIPT') || isReserved(keyword, 'JAVA');
    }
    if (clientFramework === clientFrameworks.react) {
      // React client framework
      return isReserved(keyword, 'TYPESCRIPT') || isReserved(keyword, 'JAVA');
    }
  }
  // If no client framework is selected
  // for example in JDL, entities can be used with both Angular and React, so both reserved keywords lists should be used
  return isReserved(keyword, 'ANGULAR') || isReserved(keyword, 'TYPESCRIPT') || isReserved(keyword, 'JAVA');
}

export default {
  isReserved,
  isReservedClassName,
  isReservedTableName,
  isReservedFieldName,
  isReservedPaginationWords,
  JHIPSTER: ReservedWords.JHIPSTER,
  ANGULAR: ReservedWords.ANGULAR,
  REACT: ReservedWords.REACT,
  JAVA: ReservedWords.JAVA,
  TYPESCRIPT: ReservedWords.TYPESCRIPT,
  MYSQL: ReservedWords.MYSQL,
  POSTGRESQL: ReservedWords.POSTGRESQL,
  CASSANDRA: ReservedWords.CASSANDRA,
  COUCHBASE: ReservedWords.COUCHBASE,
  ORACLE: ReservedWords.ORACLE,
  MONGODB: ReservedWords.MONGODB,
  MSSQL: ReservedWords.MSSQL,
  NEO4J: ReservedWords.NEO4J,
};
