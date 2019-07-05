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

const _ = require('lodash');
const { REQUIRED, UNIQUE, MAX, MAXBYTES, MAXLENGTH, MIN, MINBYTES, MINLENGTH, PATTERN } = require('./validations');
const JDLEnum = require('../jdl_enum');
const {
  MONGODB,
  MARIADB,
  COUCHBASE,
  CASSANDRA,
  MSSQL,
  MYSQL,
  NO,
  ORACLE,
  POSTGRESQL,
  SQL
} = require('./database_types');

const CommonDBTypes = {
  STRING: 'String',
  INTEGER: 'Integer',
  LONG: 'Long',
  BIG_DECIMAL: 'BigDecimal',
  FLOAT: 'Float',
  DOUBLE: 'Double',
  UUID: 'UUID',
  ENUM: 'Enum',
  BOOLEAN: 'Boolean',
  LOCAL_DATE: 'LocalDate',
  ZONED_DATE_TIME: 'ZonedDateTime',
  BLOB: 'Blob',
  ANY_BLOB: 'AnyBlob',
  IMAGE_BLOB: 'ImageBlob',
  TEXT_BLOB: 'TextBlob',
  INSTANT: 'Instant',
  DURATION: 'Duration'
};

const CommonDBValidations = {
  String: new Set([REQUIRED, UNIQUE, MINLENGTH, MAXLENGTH, PATTERN]),
  Integer: new Set([REQUIRED, UNIQUE, MIN, MAX]),
  Long: new Set([REQUIRED, UNIQUE, MIN, MAX]),
  BigDecimal: new Set([REQUIRED, UNIQUE, MIN, MAX]),
  Float: new Set([REQUIRED, UNIQUE, MIN, MAX]),
  Double: new Set([REQUIRED, UNIQUE, MIN, MAX]),
  Enum: new Set([REQUIRED, UNIQUE]),
  Boolean: new Set([REQUIRED, UNIQUE]),
  LocalDate: new Set([REQUIRED, UNIQUE]),
  ZonedDateTime: new Set([REQUIRED, UNIQUE]),
  Blob: new Set([REQUIRED, UNIQUE, MINBYTES, MAXBYTES]),
  AnyBlob: new Set([REQUIRED, UNIQUE, MINBYTES, MAXBYTES]),
  ImageBlob: new Set([REQUIRED, UNIQUE, MINBYTES, MAXBYTES]),
  TextBlob: new Set([REQUIRED, UNIQUE]),
  UUID: new Set([REQUIRED, UNIQUE]),
  Instant: new Set([REQUIRED, UNIQUE]),
  Duration: new Set([REQUIRED, UNIQUE])
};

const CassandraTypes = {
  STRING: 'String',
  INTEGER: 'Integer',
  LONG: 'Long',
  BIG_DECIMAL: 'BigDecimal',
  FLOAT: 'Float',
  DOUBLE: 'Double',
  BOOLEAN: 'Boolean',
  DATE: 'Date',
  UUID: 'UUID',
  INSTANT: 'Instant'
};

const CassandraValidations = {
  String: new Set([REQUIRED, UNIQUE, MINLENGTH, MAXLENGTH, PATTERN]),
  Integer: new Set([REQUIRED, UNIQUE, MIN, MAX]),
  Long: new Set([REQUIRED, UNIQUE, MIN, MAX]),
  BigDecimal: new Set([REQUIRED, UNIQUE, MIN, MAX]),
  Float: new Set([REQUIRED, UNIQUE, MIN, MAX]),
  Double: new Set([REQUIRED, UNIQUE, MIN, MAX]),
  Boolean: new Set([REQUIRED, UNIQUE]),
  Date: new Set([REQUIRED, UNIQUE]),
  UUID: new Set([REQUIRED, UNIQUE]),
  Instant: new Set([REQUIRED, UNIQUE])
};

function isCommonDBType(type) {
  if (!type) {
    throw new Error('The passed type must not be nil.');
  }
  return _.snakeCase(type).toUpperCase() in CommonDBTypes || type instanceof JDLEnum;
}

function isCassandraType(type) {
  if (!type) {
    throw new Error('The passed type must not be nil.');
  }
  return _.snakeCase(type).toUpperCase() in CassandraTypes && !(type instanceof JDLEnum);
}

function hasValidation(type, validation, isAnEnum) {
  if (!type || !validation) {
    throw new Error('The passed type and value must not be nil.');
  }
  if (isAnEnum) {
    type = 'Enum';
  }
  return (
    (isCommonDBType(type) && CommonDBValidations[type].has(validation)) ||
    (isCassandraType(type) && CassandraValidations[type].has(validation))
  );
}

function getIsType(databaseType, callback) {
  if (!databaseType) {
    throw new Error('The passed type must not be nil.');
  }
  let isType;
  switch (databaseType) {
    case SQL:
    case MYSQL:
    case MARIADB:
    case POSTGRESQL:
    case ORACLE:
    case MSSQL:
    case MONGODB:
    case COUCHBASE:
      isType = isCommonDBType;
      break;
    case CASSANDRA:
      isType = isCassandraType;
      break;
    case NO:
      isType = () => true;
      break;
    default:
      callback && callback();
      throw new Error(
        "The passed database type must either be 'sql', 'mysql', 'mariadb', 'postgresql'," +
          " 'oracle', 'mssql', 'mongodb', 'couchbase', or 'cassandra'"
      );
  }
  return isType;
}

module.exports = {
  CommonDBTypes,
  CassandraTypes,
  isCommonDBType,
  isCassandraType,
  hasValidation,
  getIsType
};
