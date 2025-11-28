import { camelCase, upperFirst } from 'lodash-es';
import type { Simplify } from 'type-fest';

import type { DerivedProperty, JHipsterChoices } from '../command/types.ts';

import { upperFirstCamelCase } from './string.ts';

export const flatChoices = (choices: JHipsterChoices): string[] =>
  choices.map(choice => (typeof choice === 'string' ? choice : choice.value)).filter(Boolean);

export const derivedPropertyName = <const P extends string, const V extends string, const S extends string = ''>(
  property: P,
  value: V,
  suffix?: S,
): `${DerivedProperty<P, V>}${S}` => {
  const cleaned = value.replaceAll(/[^a-z0-9-]/gi, '');
  const valueProperty = cleaned.includes('-') ? upperFirstCamelCase(cleaned) : upperFirst(cleaned);
  const camelCaseProperty = camelCase(property);
  return `${camelCaseProperty}${valueProperty}${suffix ?? ''}` as `${DerivedProperty<P, V>}${S}`;
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

export const buildMutateDataForProperty = <
  const P extends string,
  const Values extends string[],
  const PropertyType = Values[number],
  const Prefix extends string = P,
  const S extends string = '',
  const IsAny extends boolean = false,
  const IsArray extends boolean = false,
  const Data extends Partial<Record<P, IsArray extends true ? PropertyType[] : IsAny extends true ? any : PropertyType | undefined>> =
    Simplify<Partial<Record<P, IsArray extends true ? PropertyType[] : IsAny extends true ? any : PropertyType | undefined>>>,
>(
  property: P,
  possibleValues: Values,
  {
    prefix = property as unknown as Prefix,
    suffix = '' as S,
    array,
    valCheck = array ? (data, value) => (data[property] as any)?.includes(value) ?? false : (data, value) => data[property] === value,
  }: {
    prefix?: Prefix;
    suffix?: S;
    /** Property is an array, check if the property includes the value instead of matching the value */
    array?: IsArray;
    /** Set callback argument as any to avoid type mismatch */
    anyData?: IsAny;
    /** Callback logic */
    valCheck?: (data: Data, value: any) => boolean;
  } = {},
): Simplify<
  Data & {
    [K in Values[number] as ReturnType<typeof derivedPropertyName<Prefix, K, S>>]: (data: Data) => boolean;
  }
> => {
  return Object.fromEntries(
    possibleValues.map(value => [derivedPropertyName(prefix, value, suffix), (data: Data) => valCheck(data, value)]),
  ) as any;
};
