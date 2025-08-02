import { camelCase, upperFirst } from 'lodash-es';

import type { JHipsterChoices } from '../command/types.js';

import { upperFirstCamelCase } from './string.ts';

export const flatChoices = (choices: JHipsterChoices): string[] =>
  choices.map(choice => (typeof choice === 'string' ? choice : choice.value)).filter(Boolean);

export const derivedPropertyName = (property: string, value: string): string => {
  value = value.replaceAll(/[^a-z0-9]/gi, '');
  const valueProterty = value.includes('-') ? upperFirstCamelCase(value) : upperFirst(value);
  const camelCaseProperty = camelCase(property);
  return `${camelCaseProperty}${valueProterty}`;
};

export const applyDerivedProperty = <const Prop extends string>(
  data: any,
  property: Prop,
  possibleValues: JHipsterChoices,
  { addAny, addNo, defaultValue = 'no' }: { addAny?: boolean; addNo?: boolean; defaultValue?: string } = {},
) => {
  const camelCaseProp = camelCase(property);
  let actualValue = data[camelCaseProp] ?? defaultValue;
  actualValue = actualValue === false && possibleValues.includes('no' as any) ? 'no' : actualValue;
  const flattenedChoices = flatChoices(possibleValues);
  let isAny = false;
  for (const value of flattenedChoices) {
    const isProperty = Array.isArray(actualValue) ? actualValue.includes(value) : actualValue === value;
    data[derivedPropertyName(property, value)] ??= isProperty;
    if (isProperty && value !== 'no') {
      isAny = true;
    }
  }
  if (addAny) {
    data[derivedPropertyName(property, 'any')] ??= isAny;
  }
  if (addNo) {
    if (flattenedChoices.includes('no' as any)) {
      throw new Error('Possible values already include "no"');
    }
    data[derivedPropertyName(property, 'no')] ??= !isAny;
  }
};

export const applyDerivedPropertyOnly = (data: any, property: string, actualValue: any, possibleValues: string[]) => {
  for (const value of possibleValues) {
    const isProperty = Array.isArray(actualValue) ? actualValue.includes(value) : actualValue === value;
    data[derivedPropertyName(property, value)] ??= isProperty;
  }
};
