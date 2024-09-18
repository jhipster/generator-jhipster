import type { Field } from '../types/application/field.js';

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
  BYTES: 'byte[]', // Supported by mongodb at CI samples
  BYTE_BUFFER: 'ByteBuffer',
  ...blobFieldTypes,
} as const;

export default fieldTypes;

export const fieldTypeValues: string[] = Object.values(fieldTypes);

export type FieldType = (typeof fieldTypes)[keyof typeof fieldTypes];

export const isBlobType = (fieldType: string): fieldType is (typeof blobFieldTypes)[keyof typeof blobFieldTypes] => {
  return blobFieldTypesValues.includes(fieldType);
};

type EnumField =
  | {
      fieldType: string;
      fieldIsEnum: true;
      enumValues: { name: string; value: string }[];
      enumFileName: string;
    }
  | {
      fieldIsEnum: false;
      fieldType: FieldType;
    };

export const isFieldEnum = (field: Field): field is Field & EnumField => Boolean(field.fieldValues);
