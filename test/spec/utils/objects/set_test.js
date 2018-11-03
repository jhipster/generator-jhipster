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
const JDLSet = require('../../../../lib/utils/objects/set');

describe('JDLSet', () => {
  let set;

  beforeEach(() => {
    set = new JDLSet();
  });

  describe('::new', () => {
    context('with no arg', () => {
      it('creates a new JDLSet', () => {
        new JDLSet(); // eslint-disable-line
      });
    });
    context('with an array', () => {
      let set = null;

      before(() => {
        set = new JDLSet([1, 2, 3, 4]);
      });

      it("creates a Set with the array's elements", () => {
        expect(set.size()).to.eq(4);
      });
    });
  });
  describe('#add', () => {
    context('when trying to add a nil element', () => {
      it('fails', () => {
        expect(() => {
          set.add(null);
        }).to.throw("Can't add a nil element to the set.");
      });
    });
    context('when trying to add a new element', () => {
      it('returns true', () => {
        const result = set.add('Abc');
        expect(result).to.be.true;
        expect(set.size()).to.eq(1);
      });
    });
    context('when trying to add an existing element', () => {
      it('returns false', () => {
        set.add('Abc');
        const result = set.add('Abc');
        expect(result).to.be.false;
        expect(set.size()).to.eq(1);
      });
    });
  });
  describe('#addArrayElements', () => {
    context('when trying to add elements from a nil array', () => {
      it('fails', () => {
        expect(() => {
          set.addArrayElements(null);
        }).to.throw("Can't add elements to the set from a nil object.");
      });
    });
    context("when trying to add an array's elements", () => {
      context('but every element already exists in the Set', () => {
        it('returns false', () => {
          set.addArrayElements([1, 2, 3, 4, 5, 6]);
          const result = set.addArrayElements([1, 2, 3, 4, 5, 6]);
          expect(result).to.be.false;
          expect(set.size()).to.eq(6);
        });
      });
      context('and at least one element is not already in the Set', () => {
        it('returns true', () => {
          set.addArrayElements([1, 2, 3, 4, 5, 6]);
          const result = set.addArrayElements([1, 2, 3, 4, 5, 6, 7]);
          expect(result).to.be.true;
          expect(set.size()).to.eq(7);
        });
      });
    });
  });
  describe('#addSetElements', () => {
    context('when passing a nil Set', () => {
      it('fails', () => {
        expect(() => {
          set.addSetElements(null);
        }).to.throw("Can't add elements to the set from a nil object.");
      });
    });
    context('when passing an empty Set', () => {
      it("doesn't change the Set and returns false", () => {
        set.addArrayElements([1, 2, 3, 4, 5, 6]);
        const otherSet = new JDLSet();
        const result = set.addSetElements(otherSet);
        expect(result).to.be.false;
        expect(set.size()).to.eq(6);
      });
    });
    context('when passing a Set containing already present elements', () => {
      it("doesn't change the Set and returns false", () => {
        set.addArrayElements([1, 2, 3, 4, 5, 6]);
        const otherSet = new JDLSet();
        otherSet.addArrayElements([1, 2, 3, 4, 5, 6]);
        const result = set.addSetElements(otherSet);
        expect(result).to.be.false;
        expect(set.size()).to.eq(6);
      });
    });
    context('when passing a Set having at least one new element', () => {
      it('changes the Set and returns true', () => {
        set.addArrayElements([1, 2, 3, 4, 5, 6]);
        const otherSet = new JDLSet();
        otherSet.addArrayElements([1, 2, 3, 4, 5, 7]);
        const result = set.addSetElements(otherSet);
        expect(result).to.be.true;
        expect(set.size()).to.eq(7);
      });
    });
  });
  describe('#remove', () => {
    context('when asking to remove a nil element', () => {
      it('returns false', () => {
        set.addArrayElements([1, 2, 3, 4, 5, 6]);
        const result = set.remove(null);
        expect(result).to.be.false;
        expect(set.size()).to.eq(6);
      });
    });
    context('when asking to remove an element that is not present', () => {
      it('returns false', () => {
        set.addArrayElements([1, 2, 3, 4, 5, 6]);
        const result = set.remove(42);
        expect(result).to.be.false;
        expect(set.size()).to.eq(6);
      });
    });
    context('when asking to remove a present element', () => {
      it('returns true', () => {
        set.addArrayElements([1, 2, 3, 4, 5, 6]);
        const result = set.remove(3);
        expect(result).to.be.true;
        expect(set.size()).to.eq(5);
      });
    });
  });
  describe('#forEach', () => {
    context('when passing a nil function', () => {
      it('fails', () => {
        expect(() => {
          set.forEach(null);
        }).to.throw('The function must not be nil.');
      });
    });
    context('when passing a valid function', () => {
      it('executes it for each element', () => {
        set.addArrayElements([1, 2, 3, 4, 5, 6]);
        const array = [];
        set.forEach(element => array.push(element));
        expect(array.length).to.eq(6);
      });
    });
  });
  describe('#filter', () => {
    context('when passing a nil function', () => {
      it('fails', () => {
        expect(() => {
          set.filter(null);
        }).to.throw('The function must not be nil.');
      });
    });
    context('when passing a valid function', () => {
      it('executes it for each element and returns the new JDLSet', () => {
        set.addArrayElements([1, 2, 3, 4, 5, 6]);
        const newSet = set.filter(element => element > 3);
        expect(newSet).not.to.be.null;
        newSet.forEach(element => expect(element > 3).to.be.true);
      });
    });
  });
  describe('#map', () => {
    context('when passing a nil function', () => {
      it('fails', () => {
        expect(() => {
          set.map(null);
        }).to.throw('The function must not be nil.');
      });
    });
    context('when passing a valid function', () => {
      it('executes it for each element and returns the new JDLSet', () => {
        set.addArrayElements([1, 2, 3, 4, 5, 6]);
        const newSet = set.map(element => element * 7);
        expect(newSet).not.to.be.null;
        expect(newSet.size()).to.eq(6);
        newSet.forEach(element => expect(element >= 7).to.be.true);
      });
    });
  });
  describe('#has', () => {
    context('when passing a nil object', () => {
      it('returns false', () => {
        set.addArrayElements([1, 2, 3, 4, 5, 6]);
        expect(set.has(null)).to.be.false;
        expect(set.has()).to.be.false;
      });
    });
    context('when passing an object that is not present', () => {
      it('returns false', () => {
        set.addArrayElements([1, 2, 3, 4, 5, 6]);
        expect(set.has(42)).to.be.false;
      });
    });
    context('when passing a present object', () => {
      it('returns true', () => {
        set.addArrayElements([1, 2, 3, 4, 5, 6]);
        expect(set.has(4)).to.be.true;
      });
    });
  });
  describe('#clear', () => {
    it('clears the Set', () => {
      set.addArrayElements([1, 2, 3, 4, 5, 6]);
      set.clear();
      expect(set.size()).to.eq(0);
    });
  });
  describe('#size', () => {
    it('returns the size of the Set', () => {
      set.addArrayElements([1, 2, 3, 4, 5, 6]);
      expect(set.size()).to.eq(6);
    });
  });
  describe('#join', () => {
    context('when not passing a delimiter', () => {
      it('uses the comma', () => {
        const array = [1, 2, 3, 4, 5, 6];
        set.addArrayElements(array);
        expect(set.join()).to.eq(array.join(','));
      });
    });
    context('when passing a delimiter', () => {
      it('uses it', () => {
        const array = [1, 2, 3, 4, 5, 6];
        set.addArrayElements(array);
        expect(set.join('& ')).to.eq(array.join('& '));
      });
    });
  });
  describe('#toString', () => {
    it('returns the stringified form of the Set', () => {
      set.addArrayElements([1, 2, 3, 4, 5, 6]);
      expect(set.toString()).to.eq('[1,2,3,4,5,6]');
    });
  });
});
