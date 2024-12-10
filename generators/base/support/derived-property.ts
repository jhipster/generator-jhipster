import { upperFirstCamelCase } from '../../../lib/utils/string.js';

export const applyDerivedProperty = <const Prop extends string, const Values extends string>(
  data: any,
  property: Prop,
  possibleValues: Values[],
  { addAny, addNo, defaultValue = 'no' }: { addAny?: boolean; addNo?: boolean; defaultValue?: string } = {},
) => {
  const actualValue = data[property] ?? defaultValue;
  for (const value of possibleValues) {
    const valueProterty = upperFirstCamelCase(value);
    data[`${property}${valueProterty}`] ??= actualValue === value;
  }
  if (addAny) {
    data[`${property}Any`] ??= possibleValues.includes(actualValue) && actualValue !== 'no';
  }
  if (addNo) {
    if (possibleValues.includes('no' as any)) {
      throw new Error('Possible values already include "no"');
    }
    data[`${property}No`] ??= actualValue === 'no';
  }
};
