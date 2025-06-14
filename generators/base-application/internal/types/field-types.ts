import type { SetFieldType, SetRequired } from 'type-fest';
import type { FieldAll } from '../../field-all.js';
import type { Field as BaseField } from '../../../../lib/jhipster/types/field.js';
import { type FieldBinaryType, type FieldBlobType, type FieldType, blobFieldTypesValues } from '../../../../lib/jhipster/field-types.ts';

export const isBlobType = (fieldType: string): fieldType is FieldBlobType =>
  (Object.values(blobFieldTypesValues) as string[]).includes(fieldType);

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

export const isFieldBlobType = (field: FieldAll): field is SetFieldType<FieldAll, 'fieldType', FieldBlobType> =>
  isBlobType(field.fieldType);

export const isFieldBinaryType = (field: FieldAll): field is SetFieldType<FieldAll, 'fieldType', FieldBinaryType> =>
  isBlobType(field.fieldType) || field.fieldType === 'byte[]';

export const isFieldEnumType = (field: FieldAll): field is SetRequired<FieldAll, 'enumFileName' | 'enumValues'> =>
  Boolean(field.fieldValues);

export const isFieldNotEnumType = (field: FieldAll): field is SetFieldType<FieldAll, 'fieldType', FieldType> => !field.fieldValues;

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
