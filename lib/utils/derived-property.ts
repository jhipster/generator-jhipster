import { camelCase, upperFirst } from 'lodash-es';
import type { CamelCase, Simplify } from 'type-fest';

import type { JHipsterChoices } from '../command/types.ts';

import { upperFirstCamelCase } from './string.ts';

export const flatChoices = (choices: JHipsterChoices): string[] =>
  choices.map(choice => (typeof choice === 'string' ? choice : choice.value)).filter(Boolean);

export const derivedPropertyName = <const P extends string, const V extends string, const S extends string = ''>(
  property: P,
  value: V,
  suffix?: S,
): `${CamelCase<P>}${Capitalize<CamelCase<V>>}${S}` => {
  const cleaned = value.replaceAll(/[^a-z0-9-]/gi, '');
  const valueProperty = cleaned.includes('-') ? upperFirstCamelCase(cleaned) : upperFirst(cleaned);
  const camelCaseProperty = camelCase(property);
  return `${camelCaseProperty}${valueProperty}${suffix ?? ''}` as `${CamelCase<P>}${Capitalize<CamelCase<V>>}${S}`;
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

export const buildMutateDataForProperty = <
  const P extends string,
  const Values extends string[],
  const Data extends Partial<Record<P, Values[number]>>,
>(
  property: P,
  possibleValues: Values,
): Simplify<
  Data & {
    [K in Values[number] as `${P}${Capitalize<K>}`]: (data: Simplify<Data>) => (typeof data)[P] extends K ? true : false;
  }
> => {
  return Object.fromEntries(
    possibleValues.map(value => [derivedPropertyName(property, value), (data: Data) => data[property] === value]),
  ) as any;
};

export const buildMutateDataForPropertyWithCustomPrefix = <
  const P extends string,
  const Prefix extends string,
  const Values extends string[],
  const S extends string = '',
  const Data extends Partial<Record<P, Values[number] | undefined>> = Simplify<Partial<Record<P, Values[number] | undefined>>>,
>(
  property: P,
  prefix: Prefix,
  possibleValues: Values,
  suffix?: S,
): Simplify<
  Data & {
    [K in Values[number] as ReturnType<typeof derivedPropertyName<Prefix, K, S>>]: (data: Data) => boolean;
  }
> => {
  return Object.fromEntries(
    possibleValues.map(value => [derivedPropertyName(prefix, value, suffix), (data: Data) => data[property] === value]),
  ) as any;
};
