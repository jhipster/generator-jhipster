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

import { describe, expect, it } from 'esmocha';

import { javaBeanCase } from './java-formatting.ts';

describe('generator > java', () => {
  describe('javaBeanCase', () => {
    describe('when called with a single lower case character name', () => {
      it('capitalizes it', () => {
        expect(javaBeanCase('x')).toBe('X');
      });
    });
    describe('when called with a single upper case character name', () => {
      it('leaves it untouched', () => {
        expect(javaBeanCase('X')).toBe('X');
      });
    });
    describe('when called with a name whose second letter is lower case', () => {
      it('capitalizes the first letter', () => {
        expect(javaBeanCase('destinationX')).toBe('DestinationX');
      });
    });
    describe('when called with a name whose second letter is upper case', () => {
      it('leaves it untouched', () => {
        expect(javaBeanCase('aName')).toBe('aName');
        expect(javaBeanCase('URL')).toBe('URL');
      });
    });
    describe('when called with a name whose second character is not a letter', () => {
      it('leaves it untouched', () => {
        expect(javaBeanCase('v2')).toBe('v2');
      });
    });
    describe('when called with an empty name', () => {
      it('returns it unchanged', () => {
        expect(javaBeanCase('')).toBe('');
      });
    });
  });
});
