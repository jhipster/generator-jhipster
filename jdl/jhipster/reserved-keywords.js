/**
 * Copyright 2013-2021 the original author or authors from the JHipster project.
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

const JHipsterReservedKeywords = require('./reserved-keywords/jhipster');
const PagingReservedKeywords = require('./reserved-keywords/paging');
const AngularReservedKeywords = require('./reserved-keywords/angular');
const MySQLReservedKeywords = require('./reserved-keywords/mysql');
const JavaReservedKeywords = require('./reserved-keywords/java');
const TypescriptReservedKeywords = require('./reserved-keywords/typescript');
const PostgresqlReservedKeywords = require('./reserved-keywords/postgresql');
const CassandraReservedKeywords = require('./reserved-keywords/cassandra');
const CouchbaseReservedKeywords = require('./reserved-keywords/couchbase');
const OracleReservedKeywords = require('./reserved-keywords/oracle');
const MsSQLReservedKeywords = require('./reserved-keywords/mssql');
const Neo4JReservedKeywords = require('./reserved-keywords/neo4j');
const applicationOptions = require('./application-options');

const clientFrameworks = applicationOptions.OptionValues[applicationOptions.OptionNames.CLIENT_FRAMEWORK];

const ReservedWords = {
  JHIPSTER: JHipsterReservedKeywords,
  ANGULAR: AngularReservedKeywords,
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

function isReserved(keyword, type) {
  return !!keyword && !!type && !!ReservedWords[type.toUpperCase()] && ReservedWords[type.toUpperCase()].includes(keyword.toUpperCase());
}

function isReservedClassName(keyword) {
  return (
    isReserved(keyword, 'JHIPSTER') || isReserved(keyword, 'ANGULAR') || isReserved(keyword, 'TYPESCRIPT') || isReserved(keyword, 'JAVA')
  );
}

function isReservedTableName(keyword, databaseType) {
  return databaseType.toUpperCase() === 'SQL'
    ? isReserved(keyword, 'MYSQL') || isReserved(keyword, 'POSTGRESQL') || isReserved(keyword, 'ORACLE') || isReserved(keyword, 'MSSQL')
    : isReserved(keyword, databaseType);
}

function isReservedPaginationWords(keyword) {
  return isReserved(keyword, 'PAGING');
}

function isReservedFieldName(keyword, clientFramework) {
  if (clientFramework) {
    if (clientFramework === clientFrameworks.angularX) {
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

module.exports = {
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
