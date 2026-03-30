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

/* define global expect */

import { describe, expect, it } from 'esmocha';

import { customCamelCase, pluralize } from './string-utils.ts';

describe('jdl - StringUtils', () => {
  describe('pluralize', () => {
    it('should keep it as it is when force is false', () => {
      expect(pluralize('UserData', { force: false })).toBe('UserData');
    });
    it('should append an "s" when force is true', () => {
      expect(pluralize('UserData', { force: true })).toBe('UserDatas');
    });
  });
  describe('customCamelCase', () => {
    describe('when passing a valid string', () => {
      describe('with only one letter', () => {
        it('should keep it as it is', () => {
          expect(customCamelCase('e')).toBe('e');
        });
      });
      describe('with only lowercase letters', () => {
        it('should keep it as it is', () => {
          expect(customCamelCase('entity')).toBe('entity');
        });
      });
      describe('with an uppercase first letter', () => {
        it('should lowercase the first letter', () => {
          expect(customCamelCase('Entity')).toBe('entity');
        });
      });
      describe('with an uppercase first letter and ending with an uppercase letter', () => {
        it('should lowercase the first letter', () => {
          expect(customCamelCase('EntityA')).toBe('entityA');
        });
      });
      describe('with an uppercase first letter and ending with more than one uppercase letter', () => {
        it('should lowercase the first letter', () => {
          expect(customCamelCase('EntityAN')).toBe('entityAN');
        });
      });
      describe('with an underscore inside the word', () => {
        it('should remove it', () => {
          expect(customCamelCase('Entity_AN')).not.toContain('_');
        });
        it('should lowercase the word', () => {
          expect(customCamelCase('Entity_AN')).toBe('entityAN');
        });
      });
      describe('beginning with an underscore and having one inside', () => {
        it('should remove the two underscores', () => {
          expect(customCamelCase('_entity_AN')).not.toContain('_');
        });
        it('should lowercase the word', () => {
          expect(customCamelCase('_entity_AN')).toBe('entityAN');
        });
      });
      describe('with dashes inside', () => {
        it('should remove them', () => {
          expect(customCamelCase('_entit--y_AN---')).not.toContain('-');
        });
        it('should lowercase the word', () => {
          expect(customCamelCase('_entit--y_AN---')).toBe('entityAN');
        });
      });
      describe('with spaces inside', () => {
        it('should remove them', () => {
          expect(customCamelCase('En tity_AN ')).not.toContain(' ');
        });
        it('should lowercase the word', () => {
          expect(customCamelCase('En tity_AN ')).toBe('entityAN');
        });
      });
    });
    describe('when passing an invalid parameter', () => {
      describe('as it is nil', () => {
        it('should fail', () => {
          expect(() => {
            // @ts-expect-error
            customCamelCase();
          }).toThrow(/^The passed string cannot be nil\.$/);
        });
      });
      describe('as it is empty', () => {
        it('should return it', () => {
          expect(customCamelCase('')).toBe('');
        });
      });
    });
  });
});
