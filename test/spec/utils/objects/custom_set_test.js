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

/* eslint-disable no-new, no-unused-expressions */
const { expect } = require('chai');
const CustomSet = require('../../../../lib/utils/objects/custom_set');

describe('CustomSet', () => {
  describe('#addAll', () => {
    context('when adding elements from nothing', () => {
      let size;

      before(() => {
        const set = new CustomSet();
        set.addAll();
        size = set.size;
      });

      it('does not change the size', () => {
        expect(size).to.equal(0);
      });
    });
    context('when adding nil elements', () => {
      let set;

      before(() => {
        set = new CustomSet();
      });

      it('fails', () => {
        expect(() => {
          set.addAll(['A', null, 2]);
        }).to.throw("Can't add a nil element to the set.");
      });
    });
    context('when adding elements from an iterable', () => {
      context('but every element already exists in the Set', () => {
        let size;

        before(() => {
          const set = new CustomSet([1, 2]);
          set.addAll([1, 2]);
          size = set.size;
        });

        it('does not change the size of the set', () => {
          expect(size).to.equal(2);
        });
      });
      context('and at least one element is not already in the Set', () => {
        let size;

        before(() => {
          const set = new CustomSet([1, 2]);
          set.addAll([1, 3]);
          size = set.size;
        });

        it('changes the size of the set', () => {
          expect(size).to.equal(3);
        });
      });
    });
  });
  describe('#join', () => {
    context('when not passing the separator', () => {
      let result;

      before(() => {
        const set = new CustomSet();
        set.add(42);
        set.add('a');
        result = set.join();
      });

      it('joins the elements using a comma', () => {
        expect(result).to.equal('42,a');
      });
    });
    context('when passing a separator', () => {
      it('uses it', () => {
        let result;

        before(() => {
          const set = new CustomSet();
          set.add(42);
          set.add('a');
          result = set.join(', ');
        });

        it('joins the elements using a comma', () => {
          expect(result).to.equal('42, a');
        });
      });
    });
  });
  describe('#filter', () => {
    let set;

    before(() => {
      set = new CustomSet();
    });

    context('when passing a nil function', () => {
      it('fails', () => {
        expect(() => {
          set.filter(null);
        }).to.throw('The function must not be nil.');
      });
    });
    context('when passing a valid function', () => {
      let result;

      before(() => {
        const set = new CustomSet([1, 2, 3, 4, 5, 6]);
        result = set.filter(element => element > 3);
      });

      it('executes it for each element and returns the new JDLSet', () => {
        result.forEach(element => expect(element > 3).to.be.true);
      });
    });
  });
  describe('#toString', () => {
    let set;

    before(() => {
      set = new CustomSet([1, 2, 3, 4, 5, 6]);
    });

    it('returns the stringified form of the Set', () => {
      expect(set.toString()).to.eq('[1,2,3,4,5,6]');
    });
  });
});
