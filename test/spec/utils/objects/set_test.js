

/* eslint-disable no-new, no-unused-expressions */
const expect = require('chai').expect;
const Set = require('../../../../lib/utils/objects/set');

describe('Set', () => {
  describe('::new', () => {
    describe('with no arg', () => {
      it('creates a new Set', () => {
        new Set(); // eslint-disable-line
      });
    });
    describe('with an array', () => {
      it('creates a Set with the array\'s elements', () => {
        const set = new Set([1, 2, 3, 4]);
        expect(set.size()).to.eq(4);
      });
    });
  });
  describe('#add', () => {
    describe('when trying to add a nil element', () => {
      it('fails', () => {
        const mySet = new Set();
        try {
          mySet.add(null);
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
      });
    });
    describe('when trying to add a new element', () => {
      it('returns true', () => {
        const mySet = new Set();
        const result = mySet.add('Abc');
        expect(result).to.be.true;
        expect(mySet.size()).to.eq(1);
      });
    });
    describe('when trying to add an existing element', () => {
      it('returns false', () => {
        const mySet = new Set();
        mySet.add('Abc');
        const result = mySet.add('Abc');
        expect(result).to.be.false;
        expect(mySet.size()).to.eq(1);
      });
    });
  });
  describe('#addArrayElements', () => {
    describe('when trying to add elements from a nil array', () => {
      it('fails', () => {
        const mySet = new Set();
        try {
          mySet.addArrayElements(null);
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
      });
    });
    describe('when trying to add an array\'s elements', () => {
      describe('but every element already exists in the Set', () => {
        it('returns false', () => {
          const mySet = new Set();
          mySet.addArrayElements([1, 2, 3, 4, 5, 6]);
          const result = mySet.addArrayElements([1, 2, 3, 4, 5, 6]);
          expect(result).to.be.false;
          expect(mySet.size()).to.eq(6);
        });
      });
      describe('and at least one element is not already in the Set', () => {
        it('returns true', () => {
          const mySet = new Set();
          mySet.addArrayElements([1, 2, 3, 4, 5, 6]);
          const result = mySet.addArrayElements([1, 2, 3, 4, 5, 6, 7]);
          expect(result).to.be.true;
          expect(mySet.size()).to.eq(7);
        });
      });
    });
  });
  describe('#addSetElements', () => {
    describe('when passing a nil Set', () => {
      it('fails', () => {
        const mySet = new Set();
        try {
          mySet.addSetElements(null);
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
      });
    });
    describe('when passing an empty Set', () => {
      it('doesn\'t change the Set and returns false', () => {
        const mySet = new Set();
        mySet.addArrayElements([1, 2, 3, 4, 5, 6]);
        const myOtherSet = new Set();
        const result = mySet.addSetElements(myOtherSet);
        expect(result).to.be.false;
        expect(mySet.size()).to.eq(6);
      });
    });
    describe('when passing a Set containing already present elements', () => {
      it('doesn\'t change the Set and returns false', () => {
        const mySet = new Set();
        mySet.addArrayElements([1, 2, 3, 4, 5, 6]);
        const myOtherSet = new Set();
        myOtherSet.addArrayElements([1, 2, 3, 4, 5, 6]);
        const result = mySet.addSetElements(myOtherSet);
        expect(result).to.be.false;
        expect(mySet.size()).to.eq(6);
      });
    });
    describe('when passing a Set having at least one new element', () => {
      it('changes the Set and returns true', () => {
        const mySet = new Set();
        mySet.addArrayElements([1, 2, 3, 4, 5, 6]);
        const myOtherSet = new Set();
        myOtherSet.addArrayElements([1, 2, 3, 4, 5, 7]);
        const result = mySet.addSetElements(myOtherSet);
        expect(result).to.be.true;
        expect(mySet.size()).to.eq(7);
      });
    });
  });
  describe('#remove', () => {
    describe('when asking to remove a nil element', () => {
      it('returns false', () => {
        const mySet = new Set();
        mySet.addArrayElements([1, 2, 3, 4, 5, 6]);
        const result = mySet.remove(null);
        expect(result).to.be.false;
        expect(mySet.size()).to.eq(6);
      });
    });
    describe('when asking to remove an element that is not present', () => {
      it('returns false', () => {
        const mySet = new Set();
        mySet.addArrayElements([1, 2, 3, 4, 5, 6]);
        const result = mySet.remove(42);
        expect(result).to.be.false;
        expect(mySet.size()).to.eq(6);
      });
    });
    describe('when asking to remove a present element', () => {
      it('returns true', () => {
        const mySet = new Set();
        mySet.addArrayElements([1, 2, 3, 4, 5, 6]);
        const result = mySet.remove(3);
        expect(result).to.be.true;
        expect(mySet.size()).to.eq(5);
      });
    });
  });
  describe('#forEach', () => {
    describe('when passing a nil function', () => {
      it('fails', () => {
        const mySet = new Set();
        try {
          mySet.forEach(null);
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
      });
    });
    describe('when passing a valid function', () => {
      it('executes it for each element', () => {
        const mySet = new Set();
        mySet.addArrayElements([1, 2, 3, 4, 5, 6]);
        const array = [];
        mySet.forEach((element) => {
          array.push(element);
        });
        expect(array.length).to.eq(6);
      });
    });
  });
  describe('#filter', () => {
    describe('when passing a nil function', () => {
      it('fails', () => {
        const mySet = new Set();
        try {
          mySet.filter(null);
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
      });
    });
    describe('when passing a valid function', () => {
      it('executes it for each element and returns the new Set', () => {
        const mySet = new Set();
        mySet.addArrayElements([1, 2, 3, 4, 5, 6]);
        const myNewSet = mySet.filter(element => element > 3);
        expect(myNewSet).not.to.be.null;
        myNewSet.forEach((element) => {
          expect(element > 3).to.be.true;
        });
      });
    });
  });
  describe('#map', () => {
    describe('when passing a nil function', () => {
      it('fails', () => {
        const mySet = new Set();
        try {
          mySet.map(null);
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
      });
    });
    describe('when passing a valid function', () => {
      it('executes it for each element and returns the new Set', () => {
        const mySet = new Set();
        mySet.addArrayElements([1, 2, 3, 4, 5, 6]);
        const myNewSet = mySet.map(element => element * 7);
        expect(myNewSet).not.to.be.null;
        expect(myNewSet.size()).to.eq(6);
        myNewSet.forEach((element) => {
          expect(element >= 7).to.be.true;
        });
      });
    });
  });
  describe('#has', () => {
    describe('when passing a nil object', () => {
      it('returns false', () => {
        const mySet = new Set();
        mySet.addArrayElements([1, 2, 3, 4, 5, 6]);
        expect(mySet.has(null)).to.be.false;
        expect(mySet.has(undefined)).to.be.false;
      });
    });
    describe('when passing an object that is not present', () => {
      it('returns false', () => {
        const mySet = new Set();
        mySet.addArrayElements([1, 2, 3, 4, 5, 6]);
        expect(mySet.has(42)).to.be.false;
      });
    });
    describe('when passing a present object', () => {
      it('returns true', () => {
        const mySet = new Set();
        mySet.addArrayElements([1, 2, 3, 4, 5, 6]);
        expect(mySet.has(4)).to.be.true;
      });
    });
  });
  describe('#clear', () => {
    it('clears the Set', () => {
      const mySet = new Set();
      mySet.addArrayElements([1, 2, 3, 4, 5, 6]);
      mySet.clear();
      expect(mySet.size()).to.eq(0);
    });
  });
  describe('#size', () => {
    it('returns the size of the Set', () => {
      const mySet = new Set();
      mySet.addArrayElements([1, 2, 3, 4, 5, 6]);
      expect(mySet.size()).to.eq(6);
    });
  });
  describe('#join', () => {
    describe('when not passing a delimiter', () => {
      it('uses the comma', () => {
        const mySet = new Set();
        const array = [1, 2, 3, 4, 5, 6];
        mySet.addArrayElements(array);
        expect(mySet.join()).to.eq(array.join(','));
      });
    });
    describe('when passing a delimiter', () => {
      it('uses it', () => {
        const mySet = new Set();
        const array = [1, 2, 3, 4, 5, 6];
        mySet.addArrayElements(array);
        expect(mySet.join('& ')).to.eq(array.join('& '));
      });
    });
  });
  describe('#toString', () => {
    it('returns the stringified form of the Set', () => {
      const mySet = new Set();
      mySet.addArrayElements([1, 2, 3, 4, 5, 6]);
      expect(mySet.toString()).to.eq('[1,2,3,4,5,6]');
    });
  });
});
