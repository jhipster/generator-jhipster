

/* eslint-disable no-new, no-unused-expressions */
const expect = require('chai').expect;

const fail = expect.fail;
const FieldTypes = require('../../../../lib/core/jhipster/field_types');
const Validations = require('../../../../lib/core/jhipster/validations').VALIDATIONS;
const JDLEnum = require('../../../../lib/core/jdl_enum');

describe('FieldTypes', () => {
  describe('::isSQLType', () => {
    describe('when passing an invalid argument', () => {
      it('fails', () => {
        try {
          FieldTypes.isSQLType(null);
          fail();
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
        try {
          FieldTypes.isSQLType(undefined);
          fail();
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
        try {
          FieldTypes.isSQLType('');
          fail();
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
      });
    });
    describe('when passing a false type', () => {
      it('returns false', () => {
        expect(FieldTypes.isSQLType(FieldTypes.CASSANDRA_TYPES.UUID)).to.be.false;
      });
    });
    describe('when passing a valid type', () => {
      it('returns true', () => {
        expect(FieldTypes.isSQLType(FieldTypes.SQL_TYPES.BIG_DECIMAL)).to.be.true;
      });
    });
    describe('when passing an enum', () => {
      it('returns true', () => {
        expect(FieldTypes.isSQLType(new JDLEnum({ name: 'MyEnum' }))).to.be.true;
      });
    });
  });
  describe('::isMongoDBType', () => {
    describe('when passing an invalid argument', () => {
      it('fails', () => {
        try {
          FieldTypes.isMongoDBType(null);
          fail();
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
        try {
          FieldTypes.isMongoDBType(undefined);
          fail();
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
        try {
          FieldTypes.isMongoDBType('');
          fail();
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
      });
    });
    describe('when passing a false type', () => {
      it('returns false', () => {
        expect(FieldTypes.isMongoDBType(FieldTypes.CASSANDRA_TYPES.UUID)).to.be.false;
      });
    });
    describe('when passing a valid type', () => {
      it('returns true', () => {
        expect(FieldTypes.isMongoDBType(FieldTypes.MONGODB_TYPES.BIG_DECIMAL)).to.be.true;
      });
    });
    describe('when passing an enum', () => {
      it('returns true', () => {
        expect(FieldTypes.isMongoDBType(new JDLEnum({ name: 'MyEnum' }))).to.be.true;
      });
    });
  });
  describe('::isCassandraType', () => {
    describe('when passing an invalid argument', () => {
      it('fails', () => {
        try {
          FieldTypes.isCassandraType(null);
          fail();
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
        try {
          FieldTypes.isCassandraType(undefined);
          fail();
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
        try {
          FieldTypes.isCassandraType('');
          fail();
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
      });
    });
    describe('when passing a false type', () => {
      it('returns false', () => {
        expect(FieldTypes.isCassandraType(FieldTypes.SQL_TYPES.LOCAL_DATE)).to.be.false;
      });
    });
    describe('when passing a valid type', () => {
      it('returns true', () => {
        expect(FieldTypes.isCassandraType(FieldTypes.CASSANDRA_TYPES.BIG_DECIMAL)).to.be.true;
      });
    });
    describe('when passing an enum', () => {
      it('returns false', () => {
        expect(FieldTypes.isCassandraType(new JDLEnum({ name: 'MyEnum' }))).to.be.false;
      });
    });
  });
  describe('::getIsType', () => {
    describe('when passing an invalid argument', () => {
      it('fails', () => {
        try {
          FieldTypes.getIsType(null);
          fail();
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
        try {
          FieldTypes.getIsType(null, () => {
            // do nothing
          });
          fail();
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
      });
    });
    describe('when passing a valid argument without callback', () => {
      it('returns isType', () => {
        expect(FieldTypes.getIsType('mysql')).to.eq(FieldTypes.isSQLType);
      });
    });
    describe('when passing a valid argument and callback', () => {
      it('returns true', () => {
        expect(FieldTypes.getIsType('sql', () => {
          // do nothing
        })).to.eq(FieldTypes.isSQLType);
      });
    });
  });
  describe('::hasValidation', () => {
    describe('when passing an invalid argument', () => {
      it('fails', () => {
        try {
          FieldTypes.hasValidation(null, null);
          fail();
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
        try {
          FieldTypes.hasValidation(null, Validations.MAXLENGTH);
          fail();
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
        try {
          FieldTypes.hasValidation(FieldTypes.CASSANDRA_TYPES.BIG_DECIMAL, null);
          fail();
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
      });
    });
    describe('when passing a false argument', () => {
      it('returns false', () => {
        expect(FieldTypes.hasValidation(FieldTypes.CASSANDRA_TYPES.BIG_DECIMAL, Validations.PATTERN)).to.be.false;
      });
    });
    describe('when passing a valid argument', () => {
      it('returns true', () => {
        expect(FieldTypes.hasValidation(FieldTypes.CASSANDRA_TYPES.BIG_DECIMAL, Validations.MIN)).to.be.true;
      });
    });
  });
});
