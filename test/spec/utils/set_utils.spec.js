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
const { addAll, join, filter } = require('../../../lib/utils/set_utils');

describe('SetUtils', () => {
  describe('addAll', () => {
    context('when not passing a set', () => {
      it('fails', () => {
        expect(() => addAll()).to.throw('A Set must be passed so as to insert elements.');
      });
    });
    context('when not passing elements', () => {
      let set;

      before(() => {
        set = new Set([1, 2, 3]);
        addAll(set);
      });

      it('returns the set unchanged', () => {
        expect(set).to.deep.equal(new Set([1, 2, 3]));
      });
    });
    context('when passing an empty list as elements', () => {
      let set;

      before(() => {
        set = new Set([1, 2, 3]);
        addAll(set, []);
      });

      it('returns the set unchanged', () => {
        expect(set).to.deep.equal(new Set([1, 2, 3]));
      });
    });
    context('when passing elements', () => {
      let set;

      before(() => {
        set = new Set([1, 2, 3]);
        addAll(set, [3, 42]);
      });

      it('adds them to the set', () => {
        expect(set).to.deep.equal(new Set([1, 2, 3, 42]));
      });
    });
  });
  describe('join', () => {
    context('when not passing a set', () => {
      it('fails', () => {
        expect(() => join()).to.throw('A Set must be passed so as to join elements.');
      });
    });
    context('when not passing the separator', () => {
      let result;

      before(() => {
        const set = new Set();
        set.add(42);
        set.add('a');
        result = join(set);
      });

      it('joins the elements using a comma', () => {
        expect(result).to.equal('42,a');
      });
    });
    context('when passing a separator', () => {
      it('uses it', () => {
        let result;

        before(() => {
          const set = new Set();
          set.add(42);
          set.add('a');
          result = join(set, ', ');
        });

        it('joins the elements using the separator', () => {
          expect(result).to.equal('42, a');
        });
      });
    });
  });
  describe('filter', () => {
    let set;

    before(() => {
      set = new Set();
    });

    context('when not passing a set', () => {
      it('fails', () => {
        expect(() => filter()).to.throw('A Set must be passed so as to filter elements.');
      });
    });
    context('when passing a nil function', () => {
      it('fails', () => {
        expect(() => {
          filter(set, null);
        }).to.throw('The function must not be nil to filter the set.');
      });
    });
    context('when passing a valid function', () => {
      let result;

      before(() => {
        const set = new Set([1, 2, 3, 4, 5, 6]);
        result = filter(set, element => element > 3);
      });

      it('executes it for each element and returns the new Set', () => {
        result.forEach(element => expect(element > 3).to.be.true);
      });
    });
  });
});
