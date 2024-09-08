import type { Field as BaseField } from '../../../lib/types/base/field.js';

export interface Field extends BaseField {
  propertyName: string;

  enumFileName?: string;
  documentation?: string;
  fieldIsEnum?: boolean;

  skipClient?: boolean;
  skipServer?: boolean;

  blobContentTypeText?: string;

  filterableField?: boolean;
  transient?: boolean;
  columnRequired?: boolean;

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

  fieldTypeDuration?: boolean;
  fieldTypeBoolean: boolean;
  /** @deprecated */
  fieldTypeTemporal: boolean;
  /** @deprecated */
  fieldTypeCharSequence: boolean;
  /** @deprecated */
  fieldTypeNumeric: boolean;
}
