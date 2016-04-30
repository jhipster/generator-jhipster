'use strict';

const expect = require('chai').expect,
    fail = expect.fail,
    JDLEnum = require('../../../lib/core/jdl_enum');

describe('JDLEnum', function () {
  describe('::new', function () {
    describe('when not passing any argument', function () {
      it('fails', function () {
        try {
          new JDLEnum();
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
      });
    });
    describe('when not passing a name', function () {
      it('fails', function () {
        try {
          new JDLEnum({values: ['ABC'], comment: 'My enumeration.'});
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
      });
    });
    describe('when passing arguments', function () {
      it('uses them', function () {
        new JDLEnum({name: 'MyEnum', values: ['ABC']});
      });
    });
  });
  describe('#addValue', function () {
    var jdlEnum = new JDLEnum({name: 'MyEnum'});
    describe('when not passing a value', function () {
      it('fails', function () {
        try {
          jdlEnum.addValue(null);
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
      });
    });
    describe('when passing a value', function () {
      it('converts it to a string value', function () {
        jdlEnum.addValue(42);
        expect(jdlEnum.values).to.deep.eq(['42']);
      });
    });
  });
  describe('#toString', function () {
    it('stringifies the enum', function () {
      var jdlEnum = new JDLEnum({
        name: 'Language',
        values: ['FRENCH', 'ENGLISH', 'ICELANDIC'],
        comment: 'The language enumeration.'
      });
      expect(jdlEnum.toString()).to.eq(
`/**
 * ${jdlEnum.comment}
 */
enum ${jdlEnum.name} {
  ${jdlEnum.values[0]},
  ${jdlEnum.values[1]},
  ${jdlEnum.values[2]}
}`
      );
    });
  });
});
