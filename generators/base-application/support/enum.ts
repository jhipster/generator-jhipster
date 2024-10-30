/**
 * Copyright 2013-2024 the original author or authors from the JHipster project.
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
import { lowerFirst } from 'lodash-es';
import { formatDocAsJavaDoc } from '../../java/support/doc.js';

const doesTheEnumValueHaveACustomValue = enumValue => {
  return enumValue.includes('(');
};

const getCustomValuesState = enumValues => {
  const state = {
    withoutCustomValue: 0,
    withCustomValue: 0,
  };
  enumValues.forEach(enumValue => {
    if (doesTheEnumValueHaveACustomValue(enumValue)) {
      state.withCustomValue++;
    } else {
      state.withoutCustomValue++;
    }
  });
  return {
    withoutCustomValues: state.withCustomValue === 0,
    withSomeCustomValues: state.withCustomValue !== 0 && state.withoutCustomValue !== 0,
    withCustomValues: state.withoutCustomValue === 0,
  };
};

const getEnums = (enums, customValuesState, comments) => {
  if (customValuesState.withoutCustomValues) {
    return enums.map(enumValue => ({
      name: enumValue,
      value: enumValue,
      comment: comments?.[enumValue] && formatDocAsJavaDoc(comments[enumValue], 4),
    }));
  }
  return enums.map(enumValue => {
    if (!doesTheEnumValueHaveACustomValue(enumValue)) {
      return {
        name: enumValue.trim(),
        value: enumValue.trim(),
        comment: comments?.[enumValue] && formatDocAsJavaDoc(comments[enumValue], 4),
      };
    }

    const matched = /\s*(.+?)\s*\((.+?)\)/.exec(enumValue);
    return {
      name: matched![1],
      value: matched![2],
      comment: comments?.[matched![1]] && formatDocAsJavaDoc(comments[matched![1]], 4),
    };
  });
};

const extractEnumInstance = field => {
  const fieldType = field.fieldType;
  return lowerFirst(fieldType);
};

const extractEnumEntries = field => {
  return field.fieldValues.split(',').map(fieldValue => fieldValue.trim());
};

/**
 * Build an enum object
 * @param {Object} field - entity field
 * @param {String} [clientRootFolder] - the client's root folder
 * @return {Object} the enum info.
 */

export const getEnumInfo = (field, clientRootFolder?) => {
  field.enumInstance = extractEnumInstance(field); // TODO remove side effect
  const enums = extractEnumEntries(field);
  const customValuesState = getCustomValuesState(enums);
  return {
    enumName: field.fieldType,
    enumJavadoc: field.fieldTypeDocumentation && formatDocAsJavaDoc(field.fieldTypeDocumentation),
    enumInstance: field.enumInstance,
    enums,
    ...customValuesState,
    enumValues: getEnums(enums, customValuesState, field.fieldValuesJavadocs),
    clientRootFolder: clientRootFolder ? `${clientRootFolder}-` : '',
  };
};
