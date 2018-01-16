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

const Set = require('../../utils/objects/set');
const _ = require('lodash');
const _v = require('./validations');
const JDLEnum = require('../jdl_enum');
const DatabaseTypes = require('./database_types').Types;
const BuildException = require('../../exceptions/exception_factory').BuildException;
const exceptions = require('../../exceptions/exception_factory').exceptions;

const VALIDATIONS = _v.VALIDATIONS;

const COMMON_DB_TYPES = {
  STRING: 'String',
  INTEGER: 'Integer',
  LONG: 'Long',
  BIG_DECIMAL: 'BigDecimal',
  FLOAT: 'Float',
  DOUBLE: 'Double',
  ENUM: 'Enum',
  BOOLEAN: 'Boolean',
  LOCAL_DATE: 'LocalDate',
  ZONED_DATE_TIME: 'ZonedDateTime',
  BLOB: 'Blob',
  ANY_BLOB: 'AnyBlob',
  IMAGE_BLOB: 'ImageBlob',
  TEXT_BLOB: 'TextBlob',
  INSTANT: 'Instant'
};

const COMMON_DB_VALIDATIONS = {
  String: new Set([VALIDATIONS.REQUIRED, VALIDATIONS.MINLENGTH, VALIDATIONS.MAXLENGTH, VALIDATIONS.PATTERN]),
  Integer: new Set([VALIDATIONS.REQUIRED, VALIDATIONS.MIN, VALIDATIONS.MAX]),
  Long: new Set([VALIDATIONS.REQUIRED, VALIDATIONS.MIN, VALIDATIONS.MAX]),
  BigDecimal: new Set([VALIDATIONS.REQUIRED, VALIDATIONS.MIN, VALIDATIONS.MAX]),
  Float: new Set([VALIDATIONS.REQUIRED, VALIDATIONS.MIN, VALIDATIONS.MAX]),
  Double: new Set([VALIDATIONS.REQUIRED, VALIDATIONS.MIN, VALIDATIONS.MAX]),
  Enum: new Set([VALIDATIONS.REQUIRED]),
  Boolean: new Set([VALIDATIONS.REQUIRED]),
  LocalDate: new Set([VALIDATIONS.REQUIRED]),
  ZonedDateTime: new Set([VALIDATIONS.REQUIRED]),
  Blob: new Set([VALIDATIONS.REQUIRED, VALIDATIONS.MINBYTES, VALIDATIONS.MAXBYTES]),
  AnyBlob: new Set([VALIDATIONS.REQUIRED, VALIDATIONS.MINBYTES, VALIDATIONS.MAXBYTES]),
  ImageBlob: new Set([VALIDATIONS.REQUIRED, VALIDATIONS.MINBYTES, VALIDATIONS.MAXBYTES]),
  TextBlob: new Set([VALIDATIONS.REQUIRED, VALIDATIONS.MINBYTES, VALIDATIONS.MAXBYTES]),
  Instant: new Set([VALIDATIONS.REQUIRED])
};

const CASSANDRA_TYPES = {
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
const CASSANDRA_VALIDATIONS = {
  String: new Set([VALIDATIONS.REQUIRED, VALIDATIONS.MINLENGTH, VALIDATIONS.MAXLENGTH, VALIDATIONS.PATTERN]),
  Integer: new Set([VALIDATIONS.REQUIRED, VALIDATIONS.MIN, VALIDATIONS.MAX]),
  Long: new Set([VALIDATIONS.REQUIRED, VALIDATIONS.MIN, VALIDATIONS.MAX]),
  BigDecimal: new Set([VALIDATIONS.REQUIRED, VALIDATIONS.MIN, VALIDATIONS.MAX]),
  Float: new Set([VALIDATIONS.REQUIRED, VALIDATIONS.MIN, VALIDATIONS.MAX]),
  Double: new Set([VALIDATIONS.REQUIRED, VALIDATIONS.MIN, VALIDATIONS.MAX]),
  Boolean: new Set([VALIDATIONS.REQUIRED]),
  Date: new Set([VALIDATIONS.REQUIRED]),
  UUID: new Set([VALIDATIONS.REQUIRED]),
  Instant: new Set([VALIDATIONS.REQUIRED])
};

function isCommonDBType(type) {
  if (!type) {
    throw new BuildException(exceptions.NullPointer, 'The passed type must not be nil.');
  }
  return (_.snakeCase(type).toUpperCase() in COMMON_DB_TYPES) || type instanceof JDLEnum;
}

function isCassandraType(type) {
  if (!type) {
    throw new BuildException(exceptions.NullPointer, 'The passed type must not be nil.');
  }
  return (_.snakeCase(type).toUpperCase() in CASSANDRA_TYPES) && !(type instanceof JDLEnum);
}
function hasValidation(type, validation, isAnEnum) {
  if (!type || !validation) {
    throw new BuildException(exceptions.NullPointer, 'The passed type and value must not be nil.');
  }
  if (isAnEnum) {
    type = 'Enum';
  }
  return (isCommonDBType(type) && COMMON_DB_VALIDATIONS[type].has(validation))
    || (isCassandraType(type) && CASSANDRA_VALIDATIONS[type].has(validation));
}
function getIsType(databaseType, callback) {
  if (!databaseType) {
    throw new BuildException(exceptions.NullPointer, 'The passed type must not be nil.');
  }
  let isType;
  switch (databaseType) {
  case DatabaseTypes.sql:
  case DatabaseTypes.mysql:
  case DatabaseTypes.mariadb:
  case DatabaseTypes.postgresql:
  case DatabaseTypes.oracle:
  case DatabaseTypes.mssql:
  case DatabaseTypes.mongodb:
  case DatabaseTypes.couchbase:
    isType = isCommonDBType;
    break;
  case DatabaseTypes.cassandra:
    isType = isCassandraType;
    break;
  default:
    callback && callback();
    throw new BuildException(
      exceptions.IllegalArgument,
      'The passed database type must either be \'sql\', \'mysql\', \'mariadb\', \'postgresql\', \'oracle\', \'mssql\', \'mongodb\', \'couchbase\', or \'cassandra\'');
  }
  return isType;
}
module.exports = {
  COMMON_DB_TYPES,
  CASSANDRA_TYPES,
  isCommonDBType,
  isCassandraType,
  hasValidation,
  getIsType
};
