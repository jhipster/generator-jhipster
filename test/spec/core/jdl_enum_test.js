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
          fail();
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
      });
    });
    describe('when not passing a name', function () {
      it('fails', function () {
        try {
          new JDLEnum({values: ['ABC'], comment: 'My enumeration.'});
          fail();
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
          fail();
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
      });
    });
    describe('when passing a value', function () {
      it('converts it to a string value', function () {
        jdlEnum.addValue(42);
        expect(jdlEnum.values.toString()).to.deep.eq("[42]");
      });
    });
  });
  describe('::isValid', function () {
    describe('when validating an invalid object', function () {
      describe('with no name', function () {
        it('returns false', function () {
          expect(JDLEnum.isValid({values: ['A', 'B']})).to.be.false;
        });
      });
    });
  });
  describe('#toString', function () {
    it('stringifies the enum', function () {
      var values = ['FRENCH', 'ENGLISH', 'ICELANDIC'];
      var jdlEnum = new JDLEnum({
        name: 'Language',
        values: values,
        comment: 'The language enumeration.'
      });
      expect(jdlEnum.toString()).to.eq(
        `/**
 * ${jdlEnum.comment}
 */
enum ${jdlEnum.name} {
  ${values.join(',\n  ')}
}`
      );
    });
  });
});
