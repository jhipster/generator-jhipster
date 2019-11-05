/** Copyright 2013-2019 the original author or authors from the JHipster project.
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
/* eslint-disable no-unused-expressions */

const { expect } = require('chai');
const Rules = require('../../../lib/linter/rules');

describe('Rules', () => {
  describe('getRules', () => {
    context('when not passing a rule name', () => {
      it('should fail', () => {
        expect(() => Rules.getRule(undefined)).to.throw(/^A rule name has to be passed to get a rule\.$/);
      });
    });
    context('when passing a rule name', () => {
      context('of an absent rule', () => {
        it('should return undefined', () => {
          expect(Rules.getRule('toto')).to.be.undefined;
        });
      });
      Object.keys(Rules.RuleNames).forEach(ruleName => {
        context(`for rule name ${ruleName}`, () => {
          it('should return the corresponding rule', () => {
            expect(Rules.getRule(ruleName)).to.deep.equal(Rules[ruleName]);
          });
        });
      });
    });
  });
});
