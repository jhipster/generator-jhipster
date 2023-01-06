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

import _ from 'lodash';
import validations from './validations.js';
import JDLEnum from '../models/jdl-enum.js';
import databaseTypes from './database-types.js';

const {
  Validations: { REQUIRED, UNIQUE, MAX, MAXBYTES, MAXLENGTH, MIN, MINBYTES, MINLENGTH, PATTERN },
} = validations;
const { MONGODB, MARIADB, COUCHBASE, NEO4J, CASSANDRA, MSSQL, MYSQL, NO, ORACLE, POSTGRESQL, SQL } = databaseTypes;

export const CommonDBTypes = {
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
  DURATION: 'Duration',
};

export const RelationalOnlyDBTypes = {
  BYTES: 'byte[]',
  BYTE_BUFFER: 'ByteBuffer',
};

export const BlobTypes = {
  IMAGE: 'image',
  ANY: 'any',
  TEXT: 'text',
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
  Duration: new Set([REQUIRED, UNIQUE]),
};

export default {
  CommonDBTypes,
  RelationalOnlyDBTypes,
  isCommonDBType,
  hasValidation,
  getIsType,
  isBlobType,
  BlobTypes,
};

export function isCommonDBType(type) {
  if (!type) {
    throw new Error('The passed type must not be nil.');
  }

  return _.snakeCase(type).toUpperCase() in CommonDBTypes || type instanceof JDLEnum;
}

export function isBlobType(type?: any) {
  if (!type) {
    return false;
  }
  return (
    CommonDBTypes.BLOB === type || CommonDBTypes.ANY_BLOB === type || CommonDBTypes.IMAGE_BLOB === type || CommonDBTypes.TEXT_BLOB === type
  );
}

export function hasValidation(type, validation, isAnEnum?: any) {
  if (!type || !validation) {
    throw new Error('The passed type and value must not be nil.');
  }
  if (isAnEnum) {
    type = 'Enum';
  }
  return isCommonDBType(type) && CommonDBValidations[type].has(validation);
}

export function getIsType(databaseType, callback?: any) {
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
    case CASSANDRA:
    case NEO4J:
      isType = isCommonDBType;
      break;
    case NO:
      isType = () => true;
      break;
    default:
      callback && callback();
      throw new Error(
        "The passed database type must either be 'sql', 'mysql', 'mariadb', 'postgresql'," +
          " 'oracle', 'mssql', 'mongodb', 'couchbase', 'neo4j' or 'cassandra'"
      );
  }
  return isType;
}
