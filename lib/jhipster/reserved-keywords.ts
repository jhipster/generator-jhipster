/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
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

import { angularReservedKeywords } from '../../generators/angular/support/reserved-keywords.ts';
import { javaReservedKeywords } from '../../generators/java/support/reserved-keywords.ts';
import { typescriptReservedKeywords } from '../../generators/javascript-simple-application/support/reserved-words.ts';
import { cassandraReservedKeywords } from '../../generators/spring-data/generators/cassandra/support/reserved-keywords.ts';
import { couchbaseReservedKeywords } from '../../generators/spring-data/generators/couchbase/support/reserved-keywords.ts';
import { neo4jReservedKeywords } from '../../generators/spring-data/generators/neo4j/support/reserved-keywords.ts';
import { mssqlReservedKeywords } from '../../generators/spring-data/generators/relational/support/mssql-reserved-keywords.ts';
import { mysqlReservedKeywords } from '../../generators/spring-data/generators/relational/support/mysql-reserved-keywords.ts';
import { oracleReservedKeywords } from '../../generators/spring-data/generators/relational/support/oracle-reserved-keywords.ts';
import { postgresqlReservedKeywords } from '../../generators/spring-data/generators/relational/support/postgresql-reserved-keywords.ts';

import applicationOptions from './application-options.ts';
import JHipsterReservedKeywords from './reserved-keywords/jhipster.ts';
import PagingReservedKeywords from './reserved-keywords/paging.ts';

const clientFrameworks = applicationOptions.OptionValues[applicationOptions.OptionNames.CLIENT_FRAMEWORK] as Record<string, string>;

const ReservedWords = {
  JHIPSTER: JHipsterReservedKeywords,
  ANGULAR: angularReservedKeywords,
  JAVA: javaReservedKeywords,
  TYPESCRIPT: typescriptReservedKeywords,
  MYSQL: mysqlReservedKeywords,
  MARIADB: mysqlReservedKeywords,
  POSTGRESQL: postgresqlReservedKeywords,
  PAGING: PagingReservedKeywords,
  CASSANDRA: cassandraReservedKeywords,
  COUCHBASE: couchbaseReservedKeywords,
  ORACLE: oracleReservedKeywords,
  MONGODB: ['DOCUMENT'],
  MSSQL: mssqlReservedKeywords,
  NEO4J: neo4jReservedKeywords,
} satisfies Record<string, readonly string[]>;

export const keywordsForType = (type: string): readonly string[] =>
  (ReservedWords as Record<string, readonly string[]>)[type.toUpperCase()];

export function isReserved(keyword?: string, type?: string) {
  return !!keyword && !!type && !!keywordsForType(type)?.includes(keyword.toUpperCase());
}

export function isReservedClassName(keyword: string) {
  return (
    isReserved(keyword, 'JHIPSTER') || isReserved(keyword, 'ANGULAR') || isReserved(keyword, 'TYPESCRIPT') || isReserved(keyword, 'JAVA')
  );
}

export function isReservedTableName(keyword: string, databaseType: string) {
  return databaseType.toUpperCase() === 'SQL'
    ? isReserved(keyword, 'MYSQL') || isReserved(keyword, 'POSTGRESQL') || isReserved(keyword, 'ORACLE') || isReserved(keyword, 'MSSQL')
    : isReserved(keyword, databaseType);
}

export function isReservedPaginationWords(keyword: string) {
  return isReserved(keyword, 'PAGING');
}

export function isReservedFieldName(keyword: string, clientFramework?: any) {
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
