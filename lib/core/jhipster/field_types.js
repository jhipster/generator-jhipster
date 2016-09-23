'use strict';

const Set = require('../../utils/objects/set'),
    _ = require('lodash'),
    _v = require('./validations'),
    JDLEnum = require('../jdl_enum'),
    VALIDATIONS = _v.VALIDATIONS,
    DatabaseTypes = require('./database_types').Types,
    buildException = require('../../exceptions/exception_factory').buildException,
    exceptions = require('../../exceptions/exception_factory').exceptions;

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
  TEXT_BLOB: 'TextBlob'
};

const SQL_VALIDATIONS = {
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
  TextBlob: new Set([VALIDATIONS.REQUIRED, VALIDATIONS.MINBYTES, VALIDATIONS.MAXBYTES])
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
  TEXT_BLOB: 'TextBlob'
};

const MONGODB_VALIDATIONS = {
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
  TextBlob: new Set([VALIDATIONS.REQUIRED, VALIDATIONS.MINBYTES, VALIDATIONS.MAXBYTES])
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
  UUID: 'UUID'
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
  UUID: new Set([VALIDATIONS.REQUIRED])
};

function isSQLType(type) {
  if (!type) {
    throw new buildException(exceptions.NullPointer, 'The passed type must not be nil.');
  }
  return (_.snakeCase(type).toUpperCase() in SQL_TYPES) || type instanceof JDLEnum;
}

function isMongoDBType(type) {
  if (!type) {
    throw new buildException(exceptions.NullPointer, 'The passed type must not be nil.');
  }
  return (_.snakeCase(type).toUpperCase() in MONGODB_TYPES) || type instanceof JDLEnum;
}

function isCassandraType(type) {
  if (!type) {
    throw new buildException(exceptions.NullPointer, 'The passed type must not be nil.');
  }
  return (_.snakeCase(type).toUpperCase() in CASSANDRA_TYPES) && !(type instanceof JDLEnum);
}

function hasValidation(type, validation, isAnEnum) {
  if (!type || !validation) {
    throw new buildException(exceptions.NullPointer, 'The passed type and value must not be nil.');
  }
  var concreteType = type;
  if (isAnEnum) {
    concreteType = 'Enum'
  }
  return (isSQLType(concreteType) && SQL_VALIDATIONS[concreteType].has(validation))
      || (isMongoDBType(concreteType) && MONGODB_VALIDATIONS[concreteType].has(validation))
      || (isCassandraType(concreteType) && CASSANDRA_VALIDATIONS[concreteType].has(validation));
}

function getIsType(databaseType, callback) {
  if (!databaseType) {
    throw new buildException(exceptions.NullPointer, 'The passed type must not be nil.');
  }
  let isType;
  switch (databaseType) {
    case DatabaseTypes.sql:
    case DatabaseTypes.mysql:
    case DatabaseTypes.mariadb:
    case DatabaseTypes.postgresql:
    case DatabaseTypes.oracle:
      isType = isSQLType;
      break;
    case DatabaseTypes.mongodb:
      isType = isMongoDBType;
      break;
    case DatabaseTypes.cassandra:
      isType = isCassandraType;
      break;
    default:
      callback && callback();
      throw new buildException(
          exceptions.IllegalArgument,
          "The passed database type must either be 'sql', 'mysql', 'mariadb', 'postgresql', 'oracle', 'mongodb', or 'cassandra'");
  }
  return isType;
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
