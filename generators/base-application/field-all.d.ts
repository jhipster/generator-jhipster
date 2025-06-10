import type { Field as JavaField } from '../java/index.js';
import type { Field as ClientField } from '../client/index.js';

export type FieldAll = JavaField &
  ClientField & {
    columnName?: string;

    filterableField?: boolean;
    transient?: boolean;
    columnRequired?: boolean;
    id?: boolean;

    autoGenerate?: boolean;
    nullable?: boolean;

    /**
     * Faker template passed to `faker.helpers.fake()`.
     * @see https://fakerjs.dev/api/helpers.html#fake
     */
    fakerTemplate?: string;

    // Validation
    fieldValidate?: boolean;
    unique?: boolean;
    maxlength?: number;

    // Temporary fields for Faker
    uniqueValue?: any[];

    // Blob
    fieldWithContentType?: boolean;
    contentTypeFieldName?: string;
    blobContentTypeText?: string;

    // Derived properties
    fieldTypeBinary?: boolean;
    fieldTypeDuration?: boolean;
    fieldTypeBoolean: boolean;
    fieldTypeTimed?: boolean;
    fieldTypeLocalDate?: boolean;
    fieldTypeDateTime?: boolean;
    fieldTypeLocalTime?: boolean;
    /** @deprecated */
    fieldTypeTemporal: boolean;
    /** @deprecated */
    fieldTypeCharSequence: boolean;
    /** @deprecated */
    fieldTypeNumeric: boolean;

    /** @deprecated */
    reference?: any;
    relationshipsPath?: string[];

    shouldDropDefaultValue?: boolean;
    shouldCreateContentType?: boolean;
    loadColumnType?: string;
    columnType?: string;
    defaultValueComputed: any;
    defaultValue: any;
  };
