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

import { describe, it } from 'esmocha';

import { expect } from 'chai';

import { customCamelCase } from './string-utils.ts';

describe('jdl - StringUtils', () => {
  describe('customCamelCase', () => {
    describe('when passing a valid string', () => {
      describe('with only one letter', () => {
        it('should keep it as it is', () => {
          expect(customCamelCase('e')).to.equal('e');
        });
      });
      describe('with only lowercase letters', () => {
        it('should keep it as it is', () => {
          expect(customCamelCase('entity')).to.equal('entity');
        });
      });
      describe('with an uppercase first letter', () => {
        it('should lowercase the first letter', () => {
          expect(customCamelCase('Entity')).to.equal('entity');
        });
      });
      describe('with an uppercase first letter and ending with an uppercase letter', () => {
        it('should lowercase the first letter', () => {
          expect(customCamelCase('EntityA')).to.equal('entityA');
        });
      });
      describe('with an uppercase first letter and ending with more than one uppercase letter', () => {
        it('should lowercase the first letter', () => {
          expect(customCamelCase('EntityAN')).to.equal('entityAN');
        });
      });
      describe('with an underscore inside the word', () => {
        it('should remove it', () => {
          expect(customCamelCase('Entity_AN')).not.to.include('_');
        });
        it('should lowercase the word', () => {
          expect(customCamelCase('Entity_AN')).to.equal('entityAN');
        });
      });
      describe('beginning with an underscore and having one inside', () => {
        it('should remove the two underscores', () => {
          expect(customCamelCase('_entity_AN')).not.to.include('_');
        });
        it('should lowercase the word', () => {
          expect(customCamelCase('_entity_AN')).to.equal('entityAN');
        });
      });
      describe('with dashes inside', () => {
        it('should remove them', () => {
          expect(customCamelCase('_entit--y_AN---')).not.to.include('-');
        });
        it('should lowercase the word', () => {
          expect(customCamelCase('_entit--y_AN---')).to.equal('entityAN');
        });
      });
      describe('with spaces inside', () => {
        it('should remove them', () => {
          expect(customCamelCase('En tity_AN ')).not.to.include(' ');
        });
        it('should lowercase the word', () => {
          expect(customCamelCase('En tity_AN ')).to.equal('entityAN');
        });
      });
    });
    describe('when passing an invalid parameter', () => {
      describe('as it is nil', () => {
        it('should fail', () => {
          expect(() => {
            // @ts-expect-error
            customCamelCase();
          }).to.throw(/^The passed string cannot be nil\.$/);
        });
      });
      describe('as it is empty', () => {
        it('should return it', () => {
          expect(customCamelCase('')).to.equal('');
        });
      });
    });
  });
});
