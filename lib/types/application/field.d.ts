import type { Field as BaseField } from '../../../lib/types/base/field.js';

export interface Field extends BaseField {
  propertyName: string;

  documentation?: string;

  enumFileName?: string;
  enumValues?: { name: string; value: string }[];
  fieldIsEnum?: boolean;

  // Annotations
  skipClient?: boolean;
  skipServer?: boolean;

  filterableField?: boolean;
  transient?: boolean;
  columnRequired?: boolean;
  id?: boolean;

  // Validation
  fieldValidate?: boolean;
  unique?: boolean;
  fieldValidateRules?: string[];
  fieldValidateRulesPattern?: string | RegExp;
  fieldValidateRulesMaxlength?: number;
  maxlength?: any;

  // Faker
  uniqueValue?: any[];
  createRandexp: () => any;

  // Java specific
  propertyJavaBeanName?: string;
  propertyDtoJavaType?: string;
  propertyJavaFilterType?: string;
  fieldInJavaBeanMethod?: string;
  fieldJavaBuildSpecification?: string;
  fieldJavaValueGenerator?: string;
  javaValueGenerator?: string;
  propertyJavaFilteredType?: string;
  liquibaseDefaultValueAttributeValue?: string;

  propertyJavaCustomFilter?: { type: string; superType: string; fieldType: string };

  generateFakeData?: () => any;

  // Blob
  fieldWithContentType?: boolean;
  contentTypeFieldName?: string;
  blobContentTypeText?: string;

  // Derived properties
  fieldTypeDuration?: boolean;
  fieldTypeBoolean: boolean;
  /** @deprecated */
  fieldTypeTemporal: boolean;
  /** @deprecated */
  fieldTypeCharSequence: boolean;
  /** @deprecated */
  fieldTypeNumeric: boolean;

  /** @deprecated */
  reference?: any;
  relationshipsPath?: string[];
}
