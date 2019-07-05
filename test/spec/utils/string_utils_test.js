/**
 * Copyright 2013-2019 the original author or authors from the JHipster project.
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
const { expect } = require('chai');

const { lowerFirst, camelCase, upperFirst } = require('../../../lib/utils/string_utils');

describe('StringUtils', () => {
  describe('::camelCase', () => {
    context('when passing a valid string', () => {
      it('camel-cases it', () => {
        expect(camelCase('e')).to.equal('e');
        expect(camelCase('entity')).to.equal('entity');
        expect(camelCase('Entity')).to.equal('entity');
        expect(camelCase('EntityA')).to.equal('entityA');
        expect(camelCase('EntityAN')).to.equal('entityAN');
        expect(camelCase('Entity_AN')).to.equal('entityAN');
        expect(camelCase('_entity_AN')).to.equal('entityAN');
        expect(camelCase('_entit--y_AN---')).to.equal('entityAN');
        expect(camelCase('En tity_AN ')).to.equal('entityAN');
      });
    });
    context('when passing an invalid parameter', () => {
      context('as it is nil', () => {
        it('fails', () => {
          expect(() => {
            camelCase();
          }).to.throw('The passed string cannot be nil.');
        });
      });
      context('as it is empty', () => {
        it('returns it', () => {
          expect(camelCase('')).to.equal('');
        });
      });
    });
  });
  describe('::lowerFirst', () => {
    context('when passing a nil string', () => {
      it('fails', () => {
        expect(() => {
          lowerFirst();
        }).to.throw('The passed string cannot be nil.');
      });
    });
    context('when passing an empty string', () => {
      it('returns it', () => {
        expect(lowerFirst('')).to.equal('');
      });
    });
    context('when passing a valid string', () => {
      it('lowers the first letter', () => {
        expect(lowerFirst('Abc')).to.equal('abc');
      });
    });
  });
  describe('::upperFirst', () => {
    context('when passing a nil string', () => {
      it('fails', () => {
        expect(() => {
          upperFirst();
        }).to.throw('The passed string cannot be nil.');
      });
    });
    context('when passing an empty string', () => {
      it('returns it', () => {
        expect(upperFirst('')).to.equal('');
      });
    });
    context('when passing a valid string', () => {
      it('uppers the first letter', () => {
        expect(upperFirst('abc')).to.equal('Abc');
      });
    });
  });
});
