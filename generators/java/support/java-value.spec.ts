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
import { describe, expect, it } from 'expect-node';

import type { Field as JavaField } from '../types.ts';

import { javaValue } from './java-value.ts';

const field = (javaFieldType: string, fieldIsEnum = false) => ({ javaFieldType, fieldIsEnum }) as JavaField;

describe('generator - java - support - java-value', () => {
  describe('javaValue', () => {
    it('should write each type as Java code', () => {
      expect(javaValue(field('String'), 'a "quoted" \\ text')).toBe(String.raw`"a \"quoted\" \\ text"`);
      expect(javaValue(field('String'), 'text')).toBe('"text"');
      expect(javaValue(field('Unit', true), 'KILO')).toBe('Unit.KILO');
      expect(javaValue(field('Integer'), 15)).toBe('15');
      expect(javaValue(field('Boolean'), false)).toBe('false');
      expect(javaValue(field('Long'), 12)).toBe('12L');
      expect(javaValue(field('Float'), 1.25)).toBe('1.25F');
      expect(javaValue(field('Double'), 2.5)).toBe('2.5D');
      expect(javaValue(field('BigDecimal'), 6159.79)).toBe('new BigDecimal("6159.79")');
      expect(javaValue(field('UUID'), 'a-b')).toBe('UUID.fromString("a-b")');
      expect(javaValue(field('LocalDate'), '2026-01-01')).toBe('LocalDate.parse("2026-01-01")');
      expect(javaValue(field('Instant'), '2026-01-01T00:00:00Z')).toBe('Instant.parse("2026-01-01T00:00:00Z")');
      expect(javaValue(field('ZonedDateTime'), '2026-01-01T00:00:00Z')).toBe(
        'ZonedDateTime.ofInstant(Instant.parse("2026-01-01T00:00:00Z"), ZoneOffset.UTC)',
      );
      expect(javaValue(field('LocalTime'), '10:15:00')).toBe('LocalTime.parse("10:15:00")');
      expect(javaValue(field('Duration'), 'PT5M')).toBe('Duration.parse("PT5M")');
    });

    it('should write no value of a blob', () => {
      expect(javaValue(field('byte[]'), 'file')).toBeUndefined();
    });
  });
});
