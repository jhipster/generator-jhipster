import type { Field as BaseField } from '../../../lib/types/base/field.js';
import type { Property } from './property.js';

export interface Field extends Property, BaseField {
  propertyName: string;

  enumFileName?: string;

  // Annotations
  skipClient?: boolean;
  skipServer?: boolean;

  filterableField?: boolean;
  columnRequired?: boolean;

  unique?: boolean;
  maxlength?: number;

  // Temporary fields for Faker
  uniqueValue?: any[];
  /** @deprecated */
  createRandexp: () => any;

  // Java specific
  propertyJavaBeanName?: string;
  propertyDtoJavaType?: string;
  propertyJavaFilterType?: string;
  fieldInJavaBeanMethod?: string;
  fieldJavaBuildSpecification?: string;
  fieldJavadoc?: string;
  fieldJavaValueGenerator?: string;
  javaValueGenerator?: string;
  propertyJavaFilteredType?: string;
  liquibaseDefaultValueAttributeValue?: string;

  propertyJavaCustomFilter?: { type: string; superType: string; fieldType: string };

  // Blob
  fieldWithContentType?: boolean;
  contentTypeFieldName?: string;
  blobContentTypeText?: string;

  // Derived properties
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

  relationshipsPath?: string[];

  liquibaseDefaultValueAttributeName?: string;
  shouldDropDefaultValue?: boolean;
  shouldCreateContentType?: boolean;
  loadColumnType?: string;
  liquibaseGenerateFakeData?: boolean;
  columnType?: string;
  defaultValueComputed: any;
  defaultValue: any;
}
