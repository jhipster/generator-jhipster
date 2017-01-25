'use strict';

const expect = require('chai').expect,
  Set = require('../../../../lib/utils/objects/set');

describe('Set', function () {
  describe('::new', function () {
    describe('with no arg', function () {
      it('creates a new Set', function () {
        new Set();
      });
    });
    describe('with an array', function () {
      it("creates a Set with the array's elements", function () {
        var set = new Set([1, 2, 3, 4]);
        expect(set.size()).to.eq(4);
      });
    });
  });
  describe('#add', function () {
    describe('when trying to add a nil element', function () {
      it('fails', function () {
        var mySet = new Set();
        try {
          mySet.add(null);
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
      });
    });
    describe('when trying to add a new element', function () {
      it('returns true', function () {
        var mySet = new Set();
        var result = mySet.add('Abc');
        expect(result).to.be.true;
        expect(mySet.size()).to.eq(1);
      });
    });
    describe('when trying to add an existing element', function () {
      it('returns false', function () {
        var mySet = new Set();
        mySet.add('Abc');
        var result = mySet.add('Abc');
        expect(result).to.be.false;
        expect(mySet.size()).to.eq(1);
      });
    });
  });
  describe('#addArrayElements', function () {
    describe('when trying to add elements from a nil array', function () {
      it('fails', function () {
        var mySet = new Set();
        try {
          mySet.addArrayElements(null);
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
      });
    });
    describe("when trying to add an array's elements", function () {
      describe('but every element already exists in the Set', function () {
        it('returns false', function () {
          var mySet = new Set();
          mySet.addArrayElements([1, 2, 3, 4, 5, 6]);
          var result = mySet.addArrayElements([1, 2, 3, 4, 5, 6]);
          expect(result).to.be.false;
          expect(mySet.size()).to.eq(6);
        });
      });
      describe('and at least one element is not already in the Set', function () {
        it('returns true', function () {
          var mySet = new Set();
          mySet.addArrayElements([1, 2, 3, 4, 5, 6]);
          var result = mySet.addArrayElements([1, 2, 3, 4, 5, 6, 7]);
          expect(result).to.be.true;
          expect(mySet.size()).to.eq(7);
        });
      });
    });
  });
  describe('#addSetElements', function () {
    describe('when passing a nil Set', function () {
      it('fails', function () {
        var mySet = new Set();
        try {
          mySet.addSetElements(null);
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
      });
    });
    describe('when passing an empty Set', function () {
      it("doesn't change the Set and returns false", function () {
        var mySet = new Set();
        mySet.addArrayElements([1, 2, 3, 4, 5, 6]);
        var myOtherSet = new Set();
        var result = mySet.addSetElements(myOtherSet);
        expect(result).to.be.false;
        expect(mySet.size()).to.eq(6);
      });
    });
    describe('when passing a Set containing already present elements', function () {
      it("doesn't change the Set and returns false", function () {
        var mySet = new Set();
        mySet.addArrayElements([1, 2, 3, 4, 5, 6]);
        var myOtherSet = new Set();
        myOtherSet.addArrayElements([1, 2, 3, 4, 5, 6]);
        var result = mySet.addSetElements(myOtherSet);
        expect(result).to.be.false;
        expect(mySet.size()).to.eq(6);
      });
    });
    describe('when passing a Set having at least one new element', function () {
      it('changes the Set and returns true', function () {
        var mySet = new Set();
        mySet.addArrayElements([1, 2, 3, 4, 5, 6]);
        var myOtherSet = new Set();
        myOtherSet.addArrayElements([1, 2, 3, 4, 5, 7]);
        var result = mySet.addSetElements(myOtherSet);
        expect(result).to.be.true;
        expect(mySet.size()).to.eq(7);
      });
    });
  });
  describe('#remove', function () {
    describe('when asking to remove a nil element', function () {
      it('returns false', function () {
        var mySet = new Set();
        mySet.addArrayElements([1, 2, 3, 4, 5, 6]);
        var result = mySet.remove(null);
        expect(result).to.be.false;
        expect(mySet.size()).to.eq(6);
      });
    });
    describe('when asking to remove an element that is not present', function () {
      it('returns false', function () {
        var mySet = new Set();
        mySet.addArrayElements([1, 2, 3, 4, 5, 6]);
        var result = mySet.remove(42);
        expect(result).to.be.false;
        expect(mySet.size()).to.eq(6);
      });
    });
    describe('when asking to remove a present element', function () {
      it('returns true', function () {
        var mySet = new Set();
        mySet.addArrayElements([1, 2, 3, 4, 5, 6]);
        var result = mySet.remove(3);
        expect(result).to.be.true;
        expect(mySet.size()).to.eq(5);
      });
    });
  });
  describe('#forEach', function () {
    describe('when passing a nil function', function () {
      it('fails', function () {
        var mySet = new Set();
        try {
          mySet.forEach(null);
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
      });
    });
    describe('when passing a valid function', function () {
      it('executes it for each element', function () {
        var mySet = new Set();
        mySet.addArrayElements([1, 2, 3, 4, 5, 6]);
        var array = [];
        mySet.forEach(function (element) {
          array.push(element);
        });
        expect(array.length).to.eq(6);
      });
    });
  });
  describe('#filter', function () {
    describe('when passing a nil function', function () {
      it('fails', function () {
        var mySet = new Set();
        try {
          mySet.filter(null);
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
      });
    });
    describe('when passing a valid function', function () {
      it('executes it for each element and returns the new Set', function () {
        var mySet = new Set();
        mySet.addArrayElements([1, 2, 3, 4, 5, 6]);
        var myNewSet = mySet.filter(function (element) {
          return element > 3;
        });
        expect(myNewSet).not.to.be.null;
        expect(myNewSet.size()).to.eq(3);
        myNewSet.forEach(function (element) {
          expect(element > 3).to.be.true;
        });
      });
    });
  });
  describe('#map', function () {
    describe('when passing a nil function', function () {
      it('fails', function () {
        var mySet = new Set();
        try {
          mySet.map(null);
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
      });
    });
    describe('when passing a valid function', function () {
      it('executes it for each element and returns the new Set', function () {
        var mySet = new Set();
        mySet.addArrayElements([1, 2, 3, 4, 5, 6]);
        var myNewSet = mySet.map(function (element) {
          return element * 7;
        });
        expect(myNewSet).not.to.be.null;
        expect(myNewSet.size()).to.eq(6);
        myNewSet.forEach(function (element) {
          expect(element >= 7).to.be.true;
        });
      });
    });
  });
  describe('#has', function () {
    describe('when passing a nil object', function () {
      it('returns false', function () {
        var mySet = new Set();
        mySet.addArrayElements([1, 2, 3, 4, 5, 6]);
        expect(mySet.has(null)).to.be.false;
        expect(mySet.has(undefined)).to.be.false;
      });
    });
    describe('when passing an object that is not present', function () {
      it('returns false', function () {
        var mySet = new Set();
        mySet.addArrayElements([1, 2, 3, 4, 5, 6]);
        expect(mySet.has(42)).to.be.false;
      });
    });
    describe('when passing a present object', function () {
      it('returns true', function () {
        var mySet = new Set();
        mySet.addArrayElements([1, 2, 3, 4, 5, 6]);
        expect(mySet.has(4)).to.be.true;
      });
    });
  });
  describe('#clear', function () {
    it('clears the Set', function () {
      var mySet = new Set();
      mySet.addArrayElements([1, 2, 3, 4, 5, 6]);
      mySet.clear();
      expect(mySet.size()).to.eq(0);
    });
  });
  describe('#size', function () {
    it('returns the size of the Set', function () {
      var mySet = new Set();
      mySet.addArrayElements([1, 2, 3, 4, 5, 6]);
      expect(mySet.size()).to.eq(6);
    });
  });
  describe('#join', function () {
    describe('when not passing a delimiter', function () {
      it('uses the comma', function () {
        var mySet = new Set();
        var array = [1, 2, 3, 4, 5, 6];
        mySet.addArrayElements(array);
        expect(mySet.join()).to.eq(array.join(','));
      });
    });
    describe('when passing a delimiter', function () {
      it('uses it', function () {
        var mySet = new Set();
        var array = [1, 2, 3, 4, 5, 6];
        mySet.addArrayElements(array);
        expect(mySet.join('& ')).to.eq(array.join('& '));
      });
    });
  });
  describe('#toString', function () {
    it('returns the stringified form of the Set', function () {
      var mySet = new Set();
      mySet.addArrayElements([1, 2, 3, 4, 5, 6]);
      expect(mySet.toString()).to.eq('[1,2,3,4,5,6]');
    });
  });
});
