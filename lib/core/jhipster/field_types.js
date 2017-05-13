'use strict';

const Set = require('../../utils/objects/set'),
  _ = require('lodash'),
  JDLEnum = require('../jdl_enum'),
  Validations = require('./validations').VALIDATIONS,
  DatabaseTypes = require('./database_types').Types,
  buildException = require('../../exceptions/exception_factory').buildException,
  Exceptions = require('../../exceptions/exception_factory').exceptions;

const SQL_TYPES = {
  STRING: 'String',
  INTEGER: 'Integer',
  LONG: 'Long',
  BIG_DECIMAL: 'BigDecimal',
  FLOAT: 'Float',
  DOUBLE: 'Float',
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

const SQL_VALIDATIONS = {
  String: new Set([Validations.REQUIRED, Validations.MINLENGTH, Validations.MAXLENGTH, Validations.PATTERN]),
  Integer: new Set([Validations.REQUIRED, Validations.MIN, Validations.MAX]),
  Long: new Set([Validations.REQUIRED, Validations.MIN, Validations.MAX]),
  BigDecimal: new Set([Validations.REQUIRED, Validations.MIN, Validations.MAX]),
  Float: new Set([Validations.REQUIRED, Validations.MIN, Validations.MAX]),
  Double: new Set([Validations.REQUIRED, Validations.MIN, Validations.MAX]),
  Enum: new Set([Validations.REQUIRED]),
  Boolean: new Set([Validations.REQUIRED]),
  LocalDate: new Set([Validations.REQUIRED]),
  ZonedDateTime: new Set([Validations.REQUIRED]),
  Blob: new Set([Validations.REQUIRED, Validations.MINBYTES, Validations.MAXBYTES]),
  AnyBlob: new Set([Validations.REQUIRED, Validations.MINBYTES, Validations.MAXBYTES]),
  ImageBlob: new Set([Validations.REQUIRED, Validations.MINBYTES, Validations.MAXBYTES]),
  TextBlob: new Set([Validations.REQUIRED, Validations.MINBYTES, Validations.MAXBYTES]),
  Instant: new Set([Validations.REQUIRED])
};

const MONGODB_TYPES = {
  STRING: 'String',
  INTEGER: 'Integer',
  LONG: 'Long',
  BIG_DECIMAL: 'BigDecimal',
  FLOAT: 'Float',
  DOUBLE: 'Float',
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

const MONGODB_VALIDATIONS = {
  String: new Set([Validations.REQUIRED, Validations.MINLENGTH, Validations.MAXLENGTH, Validations.PATTERN]),
  Integer: new Set([Validations.REQUIRED, Validations.MIN, Validations.MAX]),
  Long: new Set([Validations.REQUIRED, Validations.MIN, Validations.MAX]),
  BigDecimal: new Set([Validations.REQUIRED, Validations.MIN, Validations.MAX]),
  Float: new Set([Validations.REQUIRED, Validations.MIN, Validations.MAX]),
  Double: new Set([Validations.REQUIRED, Validations.MIN, Validations.MAX]),
  Enum: new Set([Validations.REQUIRED]),
  Boolean: new Set([Validations.REQUIRED]),
  LocalDate: new Set([Validations.REQUIRED]),
  ZonedDateTime: new Set([Validations.REQUIRED]),
  Blob: new Set([Validations.REQUIRED, Validations.MINBYTES, Validations.MAXBYTES]),
  AnyBlob: new Set([Validations.REQUIRED, Validations.MINBYTES, Validations.MAXBYTES]),
  ImageBlob: new Set([Validations.REQUIRED, Validations.MINBYTES, Validations.MAXBYTES]),
  TextBlob: new Set([Validations.REQUIRED, Validations.MINBYTES, Validations.MAXBYTES]),
  Instant: new Set([Validations.REQUIRED])
};

const CASSANDRA_TYPES = {
  STRING: 'String',
  INTEGER: 'Integer',
  LONG: 'Long',
  BIG_DECIMAL: 'BigDecimal',
  FLOAT: 'Float',
  DOUBLE: 'Float',
  BOOLEAN: 'Boolean',
  DATE: 'Date',
  UUID: 'UUID',
  INSTANT: 'Instant'
};

const CASSANDRA_VALIDATIONS = {
  String: new Set([Validations.REQUIRED, Validations.MINLENGTH, Validations.MAXLENGTH, Validations.PATTERN]),
  Integer: new Set([Validations.REQUIRED, Validations.MIN, Validations.MAX]),
  Long: new Set([Validations.REQUIRED, Validations.MIN, Validations.MAX]),
  BigDecimal: new Set([Validations.REQUIRED, Validations.MIN, Validations.MAX]),
  Float: new Set([Validations.REQUIRED, Validations.MIN, Validations.MAX]),
  Double: new Set([Validations.REQUIRED, Validations.MIN, Validations.MAX]),
  Boolean: new Set([Validations.REQUIRED]),
  Date: new Set([Validations.REQUIRED]),
  UUID: new Set([Validations.REQUIRED]),
  Instant: new Set([Validations.REQUIRED])
};

function isSQLType(type) {
  if (!type) {
    throw new buildException(Exceptions.NullPointer, 'The passed type must not be nil.');
  }
  return (_.snakeCase(type).toUpperCase() in SQL_TYPES) || type instanceof JDLEnum;
}

function isMongoDBType(type) {
  if (!type) {
    throw new buildException(Exceptions.NullPointer, 'The passed type must not be nil.');
  }
  return (_.snakeCase(type).toUpperCase() in MONGODB_TYPES) || type instanceof JDLEnum;
}

function isCassandraType(type) {
  if (!type) {
    throw new buildException(Exceptions.NullPointer, 'The passed type must not be nil.');
  }
  return (_.snakeCase(type).toUpperCase() in CASSANDRA_TYPES) && !(type instanceof JDLEnum);
}

function hasValidation(type, validation, isAnEnum) {
  if (!type || !validation) {
    throw new buildException(Exceptions.NullPointer, 'The passed type and value must not be nil.');
  }
  if (isAnEnum) {
    type = 'Enum';
  }
  return (isSQLType(type) && SQL_VALIDATIONS[type].has(validation))
    || (isMongoDBType(type) && MONGODB_VALIDATIONS[type].has(validation))
    || (isCassandraType(type) && CASSANDRA_VALIDATIONS[type].has(validation));
}

function getIsType(databaseType, callback) {
  if (!databaseType) {
    throw new buildException(Exceptions.NullPointer, 'The passed type must not be nil.');
  }
  switch (databaseType) {
  case DatabaseTypes.sql:
  case DatabaseTypes.mysql:
  case DatabaseTypes.mariadb:
  case DatabaseTypes.postgresql:
  case DatabaseTypes.oracle:
  case DatabaseTypes.mssql:
    return isSQLType;
  case DatabaseTypes.mongodb:
    return isMongoDBType;
  case DatabaseTypes.cassandra:
    return isCassandraType;
  default:
    callback && callback();
    throw new buildException(
      Exceptions.IllegalArgument,
      "The passed database type must either be 'sql', 'mysql', 'mariadb', 'postgresql', 'oracle', 'mssql', "
      + "'mongodb', or 'cassandra'");
  }
}

module.exports = {
  SQL_TYPES: SQL_TYPES,
  MONGODB_TYPES: MONGODB_TYPES,
  CASSANDRA_TYPES: CASSANDRA_TYPES,
  isSQLType: isSQLType,
  isMongoDBType: isMongoDBType,
  isCassandraType: isCassandraType,
  hasValidation: hasValidation,
  getIsType: getIsType
};
