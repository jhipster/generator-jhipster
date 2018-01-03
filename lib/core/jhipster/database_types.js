/**
 * Copyright 2013-2018 the original author or authors from the JHipster project.
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

const TYPES = {
  sql: 'sql',
  mysql: 'mysql',
  mariadb: 'mariadb',
  postgresql: 'postgresql',
  mssql: 'mssql',
  oracle: 'oracle',
  mongodb: 'mongodb',
  cassandra: 'cassandra',
  couchbase: 'couchbase'
};

function isSql(type) {
  return TYPES.sql === type || TYPES.mysql === type || TYPES.postgresql === type || TYPES.oracle === type || TYPES.mariadb === type || TYPES.mssql === type;
}
module.exports = {
  Types: TYPES,
  isSql
};
