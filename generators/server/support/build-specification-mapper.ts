import type { FieldType } from '../../base-application/internal/types/field-types.ts';
import { fieldTypes } from '../../../lib/jhipster/index.js';

const {
  STRING: TYPE_STRING,
  INTEGER: TYPE_INTEGER,
  LONG: TYPE_LONG,
  BIG_DECIMAL: TYPE_BIG_DECIMAL,
  FLOAT: TYPE_FLOAT,
  DOUBLE: TYPE_DOUBLE,
  LOCAL_DATE: TYPE_LOCAL_DATE,
  ZONED_DATE_TIME: TYPE_ZONED_DATE_TIME,
  INSTANT: TYPE_INSTANT,
  DURATION: TYPE_DURATION,
  LOCAL_TIME: TYPE_LOCAL_TIME,
} = fieldTypes.CommonDBTypes;

/**
 * Return the method name which converts the filter to specification
 * @param {string} fieldType
 */
export const getSpecificationBuildForType = (fieldType: FieldType) => {
  if (
    (
      [
        TYPE_INTEGER,
        TYPE_LONG,
        TYPE_FLOAT,
        TYPE_DOUBLE,
        TYPE_BIG_DECIMAL,
        TYPE_LOCAL_DATE,
        TYPE_ZONED_DATE_TIME,
        TYPE_INSTANT,
        TYPE_DURATION,
        TYPE_LOCAL_TIME,
      ] as string[]
    ).includes(fieldType)
  ) {
    return 'buildRangeSpecification';
  }
  if (fieldType === TYPE_STRING) {
    return 'buildStringSpecification';
  }
  return 'buildSpecification';
};
