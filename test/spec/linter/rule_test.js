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

const { expect } = require('chai');
const Rule = require('../../../lib/linter/rule');
const { INFO, ERROR } = require('../../../lib/linter/rule_levels');

describe('Rule', () => {
  describe('new', () => {
    context('when not passing any arg', () => {
      it('fails', () => {
        expect(() => {
          new Rule();
        }).to.throw('A rule must at least have a name.');
      });
    });
    context('when not passing any name', () => {
      it('fails', () => {
        expect(() => {
          new Rule({});
        }).to.throw('A rule must at least have a name.');
      });
    });
    context('when not passing a level', () => {
      let rule;

      before(() => {
        rule = new Rule({ name: 'Toto' });
      });

      it("sets the rule's level to the info one", () => {
        expect(rule.level).to.equal(INFO);
      });
    });
  });
  describe('compareTo', () => {
    let rule;
    let otherRule;

    beforeEach(() => {
      rule = new Rule({ name: 'Toto' });
      otherRule = new Rule({ name: 'Tata' });
    });

    context('when comparing to no rule', () => {
      it('fails', () => {
        expect(() => {
          rule.compareTo();
        }).to.throw('A rule has to be passed so as to be compared.');
      });
    });
    context('when comparing two equal rules', () => {
      it('returns 0', () => {
        expect(rule.compareTo(otherRule)).to.equal(0);
      });
    });
    context('when the first rule is more important than the other', () => {
      beforeEach(() => {
        rule.level = ERROR;
      });

      it('returns 1', () => {
        expect(rule.compareTo(otherRule)).to.equal(1);
      });
    });
    context('when the first rule is less important than the other', () => {
      beforeEach(() => {
        otherRule.level = ERROR;
      });

      it('returns 1', () => {
        expect(rule.compareTo(otherRule)).to.equal(-1);
      });
    });
  });
});
