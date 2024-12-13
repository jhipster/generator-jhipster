import { camelCase, upperFirst } from 'lodash-es';
import type { JHipsterChoices } from '../command/types.js';
import { upperFirstCamelCase } from './string.js';

const flatChoices = (choices: JHipsterChoices): string[] => choices.map(choice => (typeof choice === 'string' ? choice : choice.value));

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
    const valueProterty = value.includes('-') ? upperFirstCamelCase(value) : upperFirst(value);
    const isProperty = Array.isArray(actualValue) ? actualValue.includes(value) : actualValue === value;
    data[`${camelCaseProp}${valueProterty}`] ??= isProperty;
    if (isProperty && value !== 'no') {
      isAny = true;
    }
  }
  if (addAny) {
    data[`${camelCaseProp}Any`] ??= isAny;
  }
  if (addNo) {
    if (flattenedChoices.includes('no' as any)) {
      throw new Error('Possible values already include "no"');
    }
    data[`${camelCaseProp}No`] ??= !isAny;
  }
};
