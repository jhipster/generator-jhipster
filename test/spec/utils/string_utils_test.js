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

const StringUtils = require('../../../lib/utils/string_utils');

describe('StringUtils', () => {
  describe('::camelCase', () => {
    context('when passing a valid string', () => {
      it('camel-cases it', () => {
        expect(StringUtils.camelCase('e')).to.eq('e');
        expect(StringUtils.camelCase('entity')).to.eq('entity');
        expect(StringUtils.camelCase('Entity')).to.eq('entity');
        expect(StringUtils.camelCase('EntityA')).to.eq('entityA');
        expect(StringUtils.camelCase('EntityAN')).to.eq('entityAN');
        expect(StringUtils.camelCase('Entity_AN')).to.eq('entityAN');
        expect(StringUtils.camelCase('_entity_AN')).to.eq('entityAN');
        expect(StringUtils.camelCase('_entit--y_AN---')).to.eq('entityAN');
        expect(StringUtils.camelCase('En tity_AN ')).to.eq('entityAN');
      });
    });
    context('when passing an invalid parameter', () => {
      context('as it is nil', () => {
        it('fails', () => {
          expect(() => {
            StringUtils.camelCase();
          }).to.throw('The passed string cannot be nil.');
        });
      });
      context('as it is empty', () => {
        it('returns it', () => {
          expect(StringUtils.camelCase('')).to.eq('');
        });
      });
    });
  });
});
