'use strict';

const expect = require('chai').expect,
    Set = require('../../../../lib/utils/objects/set');

describe('Set', function () {
  describe('::new()', function () {
    it('creates a new Set', function () {
      new Set();
    });
  });
  describe('::add', function () {
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
  describe('::addArrayElements', function () {
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
    describe("when trying to add an array's elements", function() {
      describe('but every element already exists in the Set', function() {
        it('returns false', function() {
          var mySet = new Set();
          mySet.addArrayElements([1,2,3,4,5,6]);
          var result = mySet.addArrayElements([1,2,3,4,5,6]);
          expect(result).to.be.false;
          expect(mySet.size()).to.eq(6);
        });
      });
      describe('and at least one element is not already in the Set', function() {
        it('returns true', function() {
          var mySet = new Set();
          mySet.addArrayElements([1,2,3,4,5,6]);
          var result = mySet.addArrayElements([1,2,3,4,5,6,7]);
          expect(result).to.be.true;
          expect(mySet.size()).to.eq(7);
        });
      });
    });
  });
  describe('::addSet', function () {

  });
  describe('::remove', function () {

  });
  describe('::forEach', function () {

  });
  describe('::filter', function () {

  });
  describe('::map', function () {

  });
  describe('::has', function () {

  });
  describe('::clear', function () {

  });
  describe('::size', function () {

  });
  describe('::toString', function () {

  });
});
