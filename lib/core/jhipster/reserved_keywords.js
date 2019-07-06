/**
 * Copyright 2013-2019 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see http://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const JHipsterReservedKeywords = require('./reserved_keywords/jhipster');
const AngularReservedKeywords = require('./reserved_keywords/angular');
const MySQLReservedKeywords = require('./reserved_keywords/mysql');
const JavaReservedKeywords = require('./reserved_keywords/java');
const TypescriptReservedKeywords = require('./reserved_keywords/typescript');
const PostgresqlReservedKeywords = require('./reserved_keywords/postgresql');
const CassandraReservedKeywords = require('./reserved_keywords/cassandra');
const CouchbaseReservedKeywords = require('./reserved_keywords/couchbase');
const OracleReservedKeywords = require('./reserved_keywords/oracle');
const MsSQLReservedKeywords = require('./reserved_keywords/mssql');

const ReservedWords = {
  JHIPSTER: JHipsterReservedKeywords,
  ANGULAR: AngularReservedKeywords,
  JAVA: JavaReservedKeywords,
  TYPESCRIPT: TypescriptReservedKeywords,
  MYSQL: MySQLReservedKeywords,
  MARIADB: MySQLReservedKeywords,
  POSTGRESQL: PostgresqlReservedKeywords,
  CASSANDRA: CassandraReservedKeywords,
  COUCHBASE: CouchbaseReservedKeywords,
  ORACLE: OracleReservedKeywords,
  MONGODB: ['DOCUMENT'],
  MSSQL: MsSQLReservedKeywords
};

function isReserved(keyword, type) {
  return (
    !!keyword &&
    !!type &&
    !!ReservedWords[type.toUpperCase()] &&
    ReservedWords[type.toUpperCase()].includes(keyword.toUpperCase())
  );
}

function isReservedClassName(keyword) {
  return (
    isReserved(keyword, 'JHIPSTER') ||
    isReserved(keyword, 'ANGULAR') ||
    isReserved(keyword, 'TYPESCRIPT') ||
    isReserved(keyword, 'JAVA')
  );
}

function isReservedTableName(keyword, databaseType) {
  return databaseType.toUpperCase() === 'SQL'
    ? isReserved(keyword, 'MYSQL') ||
        isReserved(keyword, 'POSTGRESQL') ||
        isReserved(keyword, 'ORACLE') ||
        isReserved(keyword, 'MSSQL')
    : isReserved(keyword, databaseType);
}

function isReservedFieldName(keyword, clientFramework) {
  if (clientFramework) {
    if (clientFramework === 'angularX') {
      // Angular client framework
      return isReserved(keyword, 'ANGULAR') || isReserved(keyword, 'TYPESCRIPT') || isReserved(keyword, 'JAVA');
    }
    if (clientFramework === 'react') {
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
  MSSQL: ReservedWords.MSSQL
};
