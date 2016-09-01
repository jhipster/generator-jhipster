'use strict';

const TYPES = {
  sql: 'sql',
  mysql: 'mysql',
  mariadb: 'mariadb',
  postgresql: 'postgresql',
  oracle: 'oracle',
  mongodb: 'mongodb',
  cassandra: 'cassandra'
};

function isSql(type) {
  return TYPES.sql === type || TYPES.mysql === type || TYPES.postgresql === type || TYPES.oracle === type || TYPES.mariadb === type;
}
module.exports = {
  Types: TYPES,
  isSql: isSql
};
