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
import type { Field } from '../entity.ts';

type NumberField = Pick<Field, 'fieldTypeInteger' | 'fieldTypeLong' | 'fieldTypeFloat' | 'fieldTypeDouble' | 'fieldTypeBigDecimal'>;

/**
 * The largest value of a number type that a REST client reads as it is, the smallest one being its opposite: a JSON
 * number is a double in JavaScript, which holds an Integer, a Long up to Number.MAX_SAFE_INTEGER, and the fake data of
 * a Double or a BigDecimal, which has cents, up to 10^13, its 15 significant digits that a double always gives back as
 * they are written; of a Float up to a hundredth of 2^24.
 */
export const restNumberLimit = (field: NumberField): number | undefined => {
  if (field.fieldTypeInteger) return 2147483647;
  if (field.fieldTypeLong) return Number.MAX_SAFE_INTEGER;
  if (field.fieldTypeFloat) return 2 ** 24 / 100;
  if (field.fieldTypeDouble || field.fieldTypeBigDecimal) return 10 ** 13;
  return undefined;
};

/** A min or a max, given as a number or as its text, like a JDL does. */
export const ruleNumber = (value: number | string | undefined) => (value === undefined ? undefined : Number.parseFloat(`${value}`));

/**
 * The limits of a value of a number field: its min and its max, else the limits of its type that a REST client reads as
 * they are.
 */
export const getFieldNumberLimits = (
  field: NumberField & Pick<Field, 'fieldValidateRulesMin' | 'fieldValidateRulesMax'>,
): { min: number; max: number } | undefined => {
  const limit = restNumberLimit(field);
  if (limit === undefined) return undefined;
  return { min: ruleNumber(field.fieldValidateRulesMin) ?? -limit, max: ruleNumber(field.fieldValidateRulesMax) ?? limit };
};
