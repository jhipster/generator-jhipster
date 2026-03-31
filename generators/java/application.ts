/**
 * Copyright 2013-2026 the original author or authors from the JHipster project.
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
import { upperFirst } from 'lodash-es';

import { buildMutateDataForProperty } from '../../lib/utils/derived-property.ts';
import {
  type MutateDataParam,
  type MutateDataPropertiesWithRequiredProperties,
  dontOverrideMutateDataProperty,
} from '../../lib/utils/object.ts';
import { getJavaValueGeneratorForType } from '../server/support/index.ts';

import { formatDocAsJavaDoc } from './support/doc.ts';
import { javaBeanCase } from './support/java-formatting.ts';
import type { Application as JavaApplication, Field as JavaField, Relationship as JavaRelationship } from './types.ts';

export type JavaAddedApplicationProperties = {
  useNpmWrapper: boolean;
};

export const mutateApplicationPreparing = {
  __override__: false,

  useNpmWrapper: false,
} as const satisfies MutateDataPropertiesWithRequiredProperties<MutateDataParam<JavaApplication>, JavaAddedApplicationProperties>;

type JavaAddedPropertyProperties = {
  propertyJavaBeanName?: string;
  /**
   * Name of the Supplier (Getter) method to use to initialize the property.
   */
  propertySupplierName?: string;
  /**
   * Name of the Consumer (Setter) method to use to set the property.
   */
  propertyConsumerName?: string;
};

export type JavaAddedFieldProperties = JavaAddedPropertyProperties & {
  javaFieldType: string;
  fieldInJavaBeanMethod: string;
  fieldJavadoc: string | undefined;
  fieldJavaValueGenerator?: string;
  /** @deprecated Use `fieldJavaValueGenerator` instead */
  javaValueGenerator?: string;
  javaValueSample1: string | undefined;
  javaValueSample2: string | undefined;
  fieldValidateRulesPatternJava: string | undefined;
};

const primaryKeyTypes = ['String', 'Integer', 'Long', 'UUID'] as const;
const sampleValues = (fieldName: string, javaFieldType: (typeof primaryKeyTypes)[number]): string[] | undefined => {
  if (javaFieldType === 'String') {
    return [`"${fieldName}1"`, `"${fieldName}2"`];
  }
  return {
    Integer: ['1', '2'],
    Long: ['1L', '2L'],
    UUID: ['UUID.fromString("23d8dc04-a48b-45d9-a01d-4b728f0ad4aa")', 'UUID.fromString("ad79f240-3727-46c3-b89f-2cf6ebd74367")'],
  }[javaFieldType];
};

export const mutateField = {
  __override__: false,
  fieldInJavaBeanMethod: ({ fieldName }) => {
    // Handle the specific case when the second letter is capitalized
    // See http://stackoverflow.com/questions/2948083/naming-convention-for-getters-setters-in-java
    if (fieldName.length > 1) {
      const firstLetter = fieldName.charAt(0);
      const secondLetter = fieldName.charAt(1);
      if (firstLetter === firstLetter.toLowerCase() && secondLetter === secondLetter.toUpperCase()) {
        return firstLetter.toLowerCase() + fieldName.slice(1);
      }
      return upperFirst(fieldName);
    }
    return upperFirst(fieldName);
  },
  propertyJavaBeanName: ({ propertyName }) => javaBeanCase(propertyName),
  propertyConsumerName: ({ propertyJavaBeanName }) => `set${propertyJavaBeanName}`,
  propertySupplierName: ({ propertyJavaBeanName }) => `get${propertyJavaBeanName}`,
  javaFieldType: field => (field.blobContentTypeText ? 'String' : field.fieldType),
  fieldJavadoc: ({ documentation }) => (documentation ? formatDocAsJavaDoc(documentation, 4) : undefined),
  ...buildMutateDataForProperty('javaFieldType', primaryKeyTypes),
  javaValueSample1: ({ fieldName, javaFieldType }) => sampleValues(fieldName, javaFieldType as any)?.[0],
  javaValueSample2: ({ fieldName, javaFieldType }) => sampleValues(fieldName, javaFieldType as any)?.[1],
  fieldJavaValueGenerator: ({ javaFieldType }) =>
    primaryKeyTypes.includes(javaFieldType as any) ? getJavaValueGeneratorForType(javaFieldType) : undefined,
  javaValueGenerator: ({ fieldJavaValueGenerator }) => fieldJavaValueGenerator,
  fieldValidateRulesPatternJava: ({ fieldValidateRulesPattern }) =>
    fieldValidateRulesPattern ? fieldValidateRulesPattern.replace(/\\/g, '\\\\').replace(/"/g, String.raw`\"`) : fieldValidateRulesPattern,
} as const satisfies MutateDataPropertiesWithRequiredProperties<MutateDataParam<JavaField>, JavaAddedFieldProperties>;

export type JavaAddedValidatedFieldProperties = JavaAddedPropertyProperties & {
  javaFieldValidatorsPartial?: string;
};

export const mutateValidatedField = {
  javaFieldValidatorsPartial: dontOverrideMutateDataProperty(field => {
    const validators = [];
    const MAX_VALUE = 2147483647;
    const isBlob = field.fieldTypeBytes;

    if (field.fieldValidationRequired && !isBlob) {
      // reactive tests need a default validation message because lookup is blocking
      validators.push(`@NotNull`);
    }
    if (field.fieldValidationMinLength && !field.fieldValidationMaxLength) {
      validators.push(`@Size(min = ${field.fieldValidateRulesMinlength})`);
    }
    if (field.fieldValidationMaxLength && !field.fieldValidationMinLength) {
      validators.push(`@Size(max = ${field.fieldValidateRulesMaxlength})`);
    }
    if (field.fieldValidationMinLength && field.fieldValidationMaxLength) {
      validators.push(`@Size(min = ${field.fieldValidateRulesMinlength}, max = ${field.fieldValidateRulesMaxlength})`);
    }
    // Not supported anymore because the server can't check the size of the blob before downloading it completely.
    // if (rules.includes('minbytes') && !rules.includes('maxbytes')) {
    //   validators.push('@Size(min = ' + field.fieldValidateRulesMinbytes + ')');
    // }
    // if (rules.includes('maxbytes') && !rules.includes('minbytes')) {
    //   validators.push('@Size(max = ' + field.fieldValidateRulesMaxbytes + ')');
    // }
    // if (rules.includes('minbytes') && rules.includes('maxbytes')) {
    //   validators.push('@Size(min = ' + field.fieldValidateRulesMinbytes + ', max = ' + field.fieldValidateRulesMaxbytes + ')');
    // }
    if (field.fieldValidationMin) {
      if (field.fieldTypeFloat || field.fieldTypeDouble || field.fieldTypeBigDecimal) {
        validators.push(`@DecimalMin(value = "${field.fieldValidateRulesMin}")`);
      } else {
        const isLong = (field.fieldValidateRulesMin ?? 0) > MAX_VALUE || field.fieldTypeLong ? 'L' : '';
        validators.push(`@Min(value = ${field.fieldValidateRulesMin}${isLong})`);
      }
    }
    if (field.fieldValidationMax) {
      if (field.fieldTypeFloat || field.fieldTypeDouble || field.fieldTypeBigDecimal) {
        validators.push(`@DecimalMax(value = "${field.fieldValidateRulesMax}")`);
      } else {
        const isLong = (field.fieldValidateRulesMax ?? 0) > MAX_VALUE || field.fieldTypeLong ? 'L' : '';
        validators.push(`@Max(value = ${field.fieldValidateRulesMax}${isLong})`);
      }
    }
    if (field.fieldValidationPattern) {
      validators.push(`@Pattern(regexp = "${field.fieldValidateRulesPatternJava}")`);
    }
    return `${validators.join('\n    ')}\n`;
  }),
} as const satisfies MutateDataPropertiesWithRequiredProperties<MutateDataParam<JavaField>, JavaAddedValidatedFieldProperties>;

export type JavaAddedRelationshipProperties = JavaAddedPropertyProperties;

export const mutateRelationship = {
  __override__: false,

  propertyJavaBeanName: ({ propertyName }) => javaBeanCase(propertyName),
  propertyConsumerName: ({ propertyJavaBeanName }) => `set${propertyJavaBeanName}`,
  propertySupplierName: ({ propertyJavaBeanName }) => `get${propertyJavaBeanName}`,
} as const satisfies MutateDataPropertiesWithRequiredProperties<MutateDataParam<JavaRelationship>, JavaAddedRelationshipProperties>;
