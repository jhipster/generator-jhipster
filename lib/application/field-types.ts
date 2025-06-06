import type { SetFieldType, SetRequired } from 'type-fest';
import type { Field } from '../../generators/base-application/field-all.js';
import type { Field as BaseField } from '../types/base/field.js';

const blobFieldTypes = {
  BLOB: 'Blob',
  ANY_BLOB: 'AnyBlob',
  IMAGE_BLOB: 'ImageBlob',
  TEXT_BLOB: 'TextBlob',
} as const;

const blobFieldTypesValues: string[] = Object.values(blobFieldTypes);

const fieldTypes = {
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
  INSTANT: 'Instant',
  DURATION: 'Duration',
  TIME: 'LocalTime',
  BYTES: 'byte[]', // Supported by mongodb at CI samples
  BYTE_BUFFER: 'ByteBuffer',
  ...blobFieldTypes,
} as const;

export default fieldTypes;

export const fieldTypeValues: string[] = Object.values(fieldTypes);

export type FieldType = (typeof fieldTypes)[keyof typeof fieldTypes];

type FieldBlobType = (typeof blobFieldTypes)[keyof typeof blobFieldTypes];

type FieldBinaryType = (typeof blobFieldTypes)[keyof typeof blobFieldTypes] | 'byte[]';

export const isBlobType = (fieldType: string): fieldType is FieldBlobType => blobFieldTypesValues.includes(fieldType);

export const getBlobContentType = (fieldType: FieldBlobType) => {
  if (fieldType === 'AnyBlob') {
    return 'any';
  } else if (fieldType === 'ImageBlob') {
    return 'image';
  } else if (fieldType === 'TextBlob') {
    return 'text';
  }
  return undefined;
};

export const isFieldBlobType = (field: Field): field is SetFieldType<Field, 'fieldType', FieldBlobType> => isBlobType(field.fieldType);

export const isFieldBinaryType = (field: Field): field is SetFieldType<Field, 'fieldType', FieldBinaryType> =>
  isBlobType(field.fieldType) || field.fieldType === 'byte[]';

export const isFieldEnumType = (field: Field): field is SetRequired<Field, 'enumFileName' | 'enumValues'> => Boolean(field.fieldValues);

export const isFieldNotEnumType = (field: Field): field is SetFieldType<Field, 'fieldType', FieldType> => !field.fieldValues;

export const convertFieldBlobType = <const F extends BaseField = BaseField>(field: F): F => {
  // Convert fieldTypes to correct fieldTypes
  if (field.fieldTypeBlobContent === 'image') {
    field.fieldType = 'ImageBlob';
    field.fieldTypeBlobContent = undefined;
  } else if (field.fieldTypeBlobContent === 'any') {
    field.fieldType = 'AnyBlob';
    field.fieldTypeBlobContent = undefined;
  } else if (field.fieldTypeBlobContent === 'text') {
    field.fieldType = 'TextBlob';
    field.fieldTypeBlobContent = undefined;
  } else {
    // Unknown type is not supported.
    // Fallback to ByteBuffer for cassandra databases.
    field.fieldType = 'ByteBuffer';
  }
  return field;
};
