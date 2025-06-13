import type { Field as SpringDataRelationalField } from '../spring-data-relational/index.js';
import type { Field as LiquibaseField } from '../liquibase/index.js';
import type { Field as ClientField } from '../client/index.js';

export type FieldAll = SpringDataRelationalField &
  LiquibaseField &
  ClientField & {
    filterableField?: boolean;

    autoGenerate?: boolean;

    /**
     * Faker template passed to `faker.helpers.fake()`.
     * @see https://fakerjs.dev/api/helpers.html#fake
     */
    fakerTemplate?: string;

    // Temporary fields for Faker
    uniqueValue?: any[];

    // Blob
    fieldWithContentType?: boolean;
    contentTypeFieldName?: string;

    blobContentTypeText?: boolean;
    blobContentTypeImage?: boolean;
    blobContentTypeAny?: boolean;

    fieldTypeBytes?: boolean;
    // Derived properties
    fieldTypeBinary?: boolean;
    fieldTypeDuration?: boolean;
    fieldTypeTimed?: boolean;
    fieldTypeLocalDate?: boolean;
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

    fieldValidationMin?: boolean;
    fieldValidationMinLength?: boolean;
    fieldValidationMax?: boolean;
    fieldValidationMaxLength?: boolean;
    fieldValidationPattern?: boolean;
    fieldValidationUnique?: boolean;
    fieldValidationMinBytes?: boolean;
    fieldValidationMaxBytes?: boolean;
  };
