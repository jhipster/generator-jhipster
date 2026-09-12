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
import { lowerFirst } from 'lodash-es';

import type { Field } from '../../../lib/jhipster/types/field.d.ts';
import { type EnumValue, parseEnumValues } from '../../../lib/utils/enum.ts';
import { formatDocAsJavaDoc } from '../../java/support/doc.ts';

type EnumField = Pick<Field, 'fieldType' | 'fieldValues' | 'fieldValuesJavadocs' | 'fieldTypeDocumentation'> & {
  enumInstance?: string;
  clientConstantsAsValues?: boolean;
};

type EnumValuesData = {
  withoutCustomValues: boolean;
  withSomeCustomValues: boolean;
  withCustomValues: boolean;
};

type EnumNameValue = {
  name: string;
  value: string;
  comment?: string;
};

const getCustomValuesState = (enumValues: EnumValue[]): EnumValuesData => {
  const state = {
    withoutCustomValue: 0,
    withCustomValue: 0,
  };
  enumValues.forEach(enumValue => {
    if (enumValue.value !== undefined) {
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

const getEnums = (enums: EnumValue[], comments?: Record<string, string>): EnumNameValue[] =>
  enums.map(({ name, value }) => ({
    name,
    value: value ?? name,
    comment: comments?.[name] && formatDocAsJavaDoc(comments[name], 4),
  }));

const extractEnumInstance = (field: Pick<EnumField, 'fieldType'>): string => {
  const { fieldType } = field;
  return lowerFirst(fieldType);
};

/**
 * Build an enum object
 * @param {Object} field - entity field
 * @param {String} [clientRootFolder] - the client's root folder
 * @return {Object} the enum info.
 */

export const getEnumInfo = (
  field: EnumField,
  clientRootFolder?: string,
): EnumValuesData & {
  enumName: string;
  enumInstance: string;
  enums: string[];
  enumValues: EnumNameValue[];
  clientRootFolder: string;
  enumJavadoc?: string;
} => {
  field.enumInstance = extractEnumInstance(field); // TODO remove side effect
  const entries = parseEnumValues(field.fieldValues, { clientConstants: field.clientConstantsAsValues });
  const customValuesState = getCustomValuesState(entries);
  return {
    enumName: field.fieldType,
    enumJavadoc: field.fieldTypeDocumentation && formatDocAsJavaDoc(field.fieldTypeDocumentation),
    enumInstance: field.enumInstance,
    enums:
      typeof field.fieldValues === 'string' ?
        field.fieldValues.split(',').map(value => value.trim())
      : entries.map(({ name, value }) => `${name}${value === undefined ? '' : `(${value})`}`),
    ...customValuesState,
    enumValues: getEnums(entries, field.fieldValuesJavadocs),
    clientRootFolder: clientRootFolder ? `${clientRootFolder}-` : '',
  };
};
