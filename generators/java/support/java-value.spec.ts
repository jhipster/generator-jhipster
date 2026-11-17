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

import { javaSmallerValue, javaValue } from './java-value.ts';

const field = (properties: Record<string, unknown>) => properties as unknown as JavaField;

describe('generator - java - support - java-value', () => {
  describe('javaValue', () => {
    it('should write each type as Java code', () => {
      expect(javaValue(field({ fieldTypeString: true }), 'a "quoted" \\ text')).toBe(String.raw`"a \"quoted\" \\ text"`);
      expect(javaValue(field({ blobContentTypeText: true }), 'text')).toBe('"text"');
      expect(javaValue(field({ fieldIsEnum: true, fieldType: 'Unit' }), 'KILO')).toBe('Unit.KILO');
      expect(javaValue(field({ fieldTypeInteger: true }), 15)).toBe('15');
      expect(javaValue(field({ fieldTypeBoolean: true }), false)).toBe('false');
      expect(javaValue(field({ fieldTypeLong: true }), 12)).toBe('12L');
      expect(javaValue(field({ fieldTypeFloat: true }), 1.25)).toBe('1.25F');
      expect(javaValue(field({ fieldTypeDouble: true }), 2.5)).toBe('2.5D');
      expect(javaValue(field({ fieldTypeBigDecimal: true }), 6159.79)).toBe('new BigDecimal("6159.79")');
      expect(javaValue(field({ fieldTypeUUID: true }), 'a-b')).toBe('UUID.fromString("a-b")');
      expect(javaValue(field({ fieldTypeLocalDate: true }), '2026-01-01')).toBe('LocalDate.parse("2026-01-01")');
      expect(javaValue(field({ fieldTypeInstant: true }), '2026-01-01T00:00:00Z')).toBe('Instant.parse("2026-01-01T00:00:00Z")');
      expect(javaValue(field({ fieldTypeZonedDateTime: true }), '2026-01-01T00:00:00Z')).toBe(
        'ZonedDateTime.ofInstant(Instant.parse("2026-01-01T00:00:00Z"), ZoneOffset.UTC)',
      );
      expect(javaValue(field({ fieldTypeLocalTime: true }), '10:15:00')).toBe('LocalTime.parse("10:15:00")');
      expect(javaValue(field({ fieldTypeDuration: true }), 'PT5M')).toBe('Duration.parse("PT5M")');
    });

    it('should write no value of a blob', () => {
      expect(javaValue(field({ fieldTypeBinary: true }), 'file')).toBeUndefined();
    });
  });

  describe('javaSmallerValue', () => {
    it('should write a smaller value of each ordered type from its code', () => {
      expect(javaSmallerValue(field({ fieldTypeInteger: true }), '15')).toBe('15 - 1');
      expect(javaSmallerValue(field({ fieldTypeLong: true }), '12L')).toBe('12L - 1L');
      expect(javaSmallerValue(field({ fieldTypeFloat: true }), '1.25F')).toBe('1.25F - 1F');
      expect(javaSmallerValue(field({ fieldTypeDouble: true }), '2.5D')).toBe('2.5D - 1D');
      expect(javaSmallerValue(field({ fieldTypeBigDecimal: true }), 'X')).toBe('X.subtract(BigDecimal.ONE)');
      expect(javaSmallerValue(field({ fieldTypeLocalDate: true }), 'X')).toBe('X.minusDays(1)');
      expect(javaSmallerValue(field({ fieldTypeInstant: true }), 'X')).toBe('X.minusSeconds(1)');
      expect(javaSmallerValue(field({ fieldTypeZonedDateTime: true }), 'X')).toBe('X.minusSeconds(1)');
      expect(javaSmallerValue(field({ fieldTypeDuration: true }), 'X')).toBe('X.minusMinutes(1)');
    });

    it('should write no smaller value of a type without an order', () => {
      expect(javaSmallerValue(field({ fieldTypeString: true }), '"text"')).toBeUndefined();
      expect(javaSmallerValue(field({ fieldTypeBoolean: true }), 'true')).toBeUndefined();
    });
  });
});
