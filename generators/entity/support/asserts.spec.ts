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

import { isNumber, isSignedDecimalNumber, isSignedNumber } from './asserts.ts';

describe('generator - entity - support - asserts', () => {
  describe('::isNumber', () => {
    it('accepts an unsigned integer', () => {
      expect(isNumber('10')).toBe(true);
    });
    it('rejects a signed integer', () => {
      expect(isNumber('-10')).toBe(false);
    });
  });
  describe('::isSignedNumber', () => {
    it('accepts an unsigned integer', () => {
      expect(isSignedNumber('10')).toBe(true);
    });
    it('accepts a negative integer', () => {
      expect(isSignedNumber('-5')).toBe(true);
    });
    it('accepts a positive sign', () => {
      expect(isSignedNumber('+21')).toBe(true);
    });
    it('rejects a decimal', () => {
      expect(isSignedNumber('1.5')).toBe(false);
    });
    it('rejects text', () => {
      expect(isSignedNumber('ten')).toBe(false);
    });
  });
  describe('::isSignedDecimalNumber', () => {
    it('accepts an integer', () => {
      expect(isSignedDecimalNumber('10')).toBe(true);
    });
    it('accepts a negative decimal', () => {
      expect(isSignedDecimalNumber('-1.5')).toBe(true);
    });
    it('rejects a decimal separator other than a dot', () => {
      expect(isSignedDecimalNumber('1a5')).toBe(false);
    });
  });
});
