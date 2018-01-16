/**
 * Copyright 2013-2018 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see http://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* define global expect */
/* eslint-disable no-new, no-unused-expressions */
const expect = require('chai').expect;

const fail = expect.fail;
const camelCase = require('../../../lib/utils/string_utils').camelCase;
const isNilOrEmpty = require('../../../lib/utils/string_utils').isNilOrEmpty;

describe('StringUtils', () => {
  describe('::camelCase', () => {
    describe('when passing a valid string', () => {
      it('camel-cases it', () => {
        expect(camelCase('e')).to.eq('e');
        expect(camelCase('entity')).to.eq('entity');
        expect(camelCase('Entity')).to.eq('entity');
        expect(camelCase('EntityA')).to.eq('entityA');
        expect(camelCase('EntityAN')).to.eq('entityAN');
        expect(camelCase('Entity_AN')).to.eq('entityAN');
        expect(camelCase('_entity_AN')).to.eq('entityAN');
        expect(camelCase('_entit--y_AN---')).to.eq('entityAN');
        expect(camelCase('En tity_AN ')).to.eq('entityAN');
      });
    });
    describe('when passing an invalid parameter', () => {
      describe('as it is nil', () => {
        it('fails', () => {
          try {
            camelCase();
            fail();
          } catch (error) {
            expect(error.name).to.eq('NullPointerException');
          }
        });
      });
      describe('as it is empty', () => {
        it('returns it', () => {
          expect(camelCase('')).to.eq('');
        });
      });
    });
  });
  describe('::isNilOrEmpty', () => {
    describe('when passing a nil object', () => {
      it('returns true', () => {
        expect(isNilOrEmpty(null)).to.be.true;
      });
    });
    describe('when passing an undefined object', () => {
      it('returns true', () => {
        expect(isNilOrEmpty(undefined)).to.be.true;
      });
    });
    describe('when passing an empty string', () => {
      it('returns true', () => {
        expect(isNilOrEmpty('')).to.be.true;
      });
    });
    describe('when passing a valid string', () => {
      it('returns false', () => {
        expect(isNilOrEmpty('ABC')).to.be.false;
      });
    });
  });
});
