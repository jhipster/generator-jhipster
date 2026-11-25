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
import { before, describe, expect, it } from 'expect-node';

import { type FakerWithRandexp, createFaker } from './faker.ts';

// The login pattern of the built-in User.
const LOGIN_PATTERN = '^[a-zA-Z0-9!$&*+=?^_`{|}~.-]+@[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)*$|^[_.@A-Za-z0-9-]+$';

describe('generator - base-application - support - faker - createRandexp', () => {
  let faker: FakerWithRandexp;

  before(async () => {
    faker = await createFaker();
  });

  const draw = (pattern: string, length?: { min?: number; max?: number }, count = 200) => {
    faker.seed(1);
    const re = faker.createRandexp(pattern);
    return Array.from({ length: count }, () => re.gen(length));
  };
  const outside = (values: string[], pattern: string, min: number, max: number) =>
    values.filter(value => value.length < min || value.length > max || !new RegExp(pattern).test(value));

  for (const [pattern, min, max] of [
    ['^[a-z]+( [a-z]+)*$', 80, 255],
    [String.raw`^[a-z]+\.com$`, 6, 12],
    ['^[a-z]+$', 100, 255],
    ['^(foo|barbaz)+$', 20, 25],
    [LOGIN_PATTERN, 40, 50],
  ] as const) {
    it(`should generate ${pattern} within ${min} and ${max} characters`, () => {
      expect(outside(draw(pattern, { min, max }), pattern, min, max)).toStrictEqual([]);
    });
  }

  it('should generate repetitions without a bound past the minimum', () => {
    const lengths = new Set(draw('^[a-z]+$', { min: 30, max: 255 }).map(value => value.length));
    expect(Math.min(...lengths)).toBe(30);
    expect(lengths.size).toBeGreaterThan(1);
  });

  it('should generate the values of randexp when the length limits no choice', () => {
    for (const pattern of ['^[a-z]+( [a-z]+)*$', '^[a-zA-Z0-9]*$', LOGIN_PATTERN, String.raw`^[A-Z]{2}-\d{3,5}(-[a-z]+)?$`]) {
      expect(draw(pattern, { min: 0, max: 255 })).toStrictEqual(draw(pattern));
    }
  });
});
