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

import type { MutateDataParam, MutateDataPropertiesWithRequiredProperties } from '../../lib/utils/object.ts';

import { javaBeanCase } from './support/java-formatting.ts';
import type { Application as JavaApplication, Field as JavaField, Relationship as JavaRelationship } from './types.ts';

export type JavaAddedApplicationProperties = {
  useNpmWrapper: boolean;
};

export const mutateApplication = {
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
  fieldInJavaBeanMethod: string;
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
} as const satisfies MutateDataPropertiesWithRequiredProperties<MutateDataParam<JavaField>, JavaAddedFieldProperties>;

export type JavaAddedRelationshipProperties = JavaAddedPropertyProperties;

export const mutateRelationship = {
  __override__: false,

  propertyJavaBeanName: ({ propertyName }) => javaBeanCase(propertyName),
  propertyConsumerName: ({ propertyJavaBeanName }) => `set${propertyJavaBeanName}`,
  propertySupplierName: ({ propertyJavaBeanName }) => `get${propertyJavaBeanName}`,
} as const satisfies MutateDataPropertiesWithRequiredProperties<MutateDataParam<JavaRelationship>, JavaAddedRelationshipProperties>;
