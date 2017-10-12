

/* eslint-disable no-new, no-unused-expressions */
const expect = require('chai').expect;
const JDLEnum = require('../../../lib/core/jdl_enum');

const fail = expect.fail;

describe('JDLEnum', () => {
  describe('::new', () => {
    describe('when not passing any argument', () => {
      it('fails', () => {
        try {
          new JDLEnum();
          fail();
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
      });
    });
    describe('when not passing a name', () => {
      it('fails', () => {
        try {
          new JDLEnum({ values: ['ABC'], comment: 'My enumeration.' });
          fail();
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
      });
    });
    describe('when passing arguments', () => {
      it('uses them', () => {
        new JDLEnum({ name: 'MyEnum', values: ['ABC'] });
      });
    });
    describe('when passing a reserved keyword as name', () => {
      it('fails', () => {
        try {
          new JDLEnum({ name: 'class' });
          fail();
        } catch (error) {
          expect(error.name).to.eq('IllegalNameException');
        }
      });
    });
  });
  describe('#addValue', () => {
    const jdlEnum = new JDLEnum({ name: 'MyEnum' });
    describe('when not passing a value', () => {
      it('fails', () => {
        try {
          jdlEnum.addValue(null);
          fail();
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
      });
    });
    describe('when passing a value', () => {
      it('converts it to a string value', () => {
        jdlEnum.addValue(42);
        expect(jdlEnum.values.toString()).to.deep.eq('[42]');
      });
    });
  });
  describe('::isValid', () => {
    describe('when validating an invalid object', () => {
      describe('with no name', () => {
        it('returns false', () => {
          expect(JDLEnum.isValid({ values: ['A', 'B'] })).to.be.false;
        });
      });
      describe('with a reserved keyword as name', () => {
        it('returns false', () => {
          expect(
            JDLEnum.isValid({ name: 'class' })
          ).to.be.false;
        });
      });
    });
  });
  describe('#toString', () => {
    it('stringifies the enum', () => {
      const values = ['FRENCH', 'ENGLISH', 'ICELANDIC'];
      const jdlEnum = new JDLEnum({
        name: 'Language',
        values,
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
