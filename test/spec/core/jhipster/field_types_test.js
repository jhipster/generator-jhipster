'use strict';

const expect = require('chai').expect,
  fail = expect.fail,
  FieldTypes = require('../../../../lib/core/jhipster/field_types'),
  Validations = require('../../../../lib/core/jhipster/validations').VALIDATIONS,
  JDLEnum = require('../../../../lib/core/jdl_enum');

describe('FieldTypes', function () {
  describe('::isSQLType', function () {
    describe('when passing an invalid argument', function () {
      it('fails', function () {
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
    describe('when passing a false type', function () {
      it('returns false', function () {
        expect(FieldTypes.isSQLType(FieldTypes.CASSANDRA_TYPES.UUID)).to.be.false;
      });
    });
    describe('when passing a valid type', function () {
      it('returns true', function () {
        expect(FieldTypes.isSQLType(FieldTypes.SQL_TYPES.BIG_DECIMAL)).to.be.true;
      });
    });
    describe('when passing an enum', function () {
      it('returns true', function () {
        expect(FieldTypes.isSQLType(new JDLEnum({name: 'MyEnum'}))).to.be.true;
      });
    });
  });
  describe('::isMongoDBType', function () {
    describe('when passing an invalid argument', function () {
      it('fails', function () {
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
    describe('when passing a false type', function () {
      it('returns false', function () {
        expect(FieldTypes.isMongoDBType(FieldTypes.CASSANDRA_TYPES.UUID)).to.be.false;
      });
    });
    describe('when passing a valid type', function () {
      it('returns true', function () {
        expect(FieldTypes.isMongoDBType(FieldTypes.MONGODB_TYPES.BIG_DECIMAL)).to.be.true;
      });
    });
    describe('when passing an enum', function () {
      it('returns true', function () {
        expect(FieldTypes.isMongoDBType(new JDLEnum({name: 'MyEnum'}))).to.be.true;
      });
    });
  });
  describe('::isCassandraType', function () {
    describe('when passing an invalid argument', function () {
      it('fails', function () {
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
    describe('when passing a false type', function () {
      it('returns false', function () {
        expect(FieldTypes.isCassandraType(FieldTypes.SQL_TYPES.LOCAL_DATE)).to.be.false;
      });
    });
    describe('when passing a valid type', function () {
      it('returns true', function () {
        expect(FieldTypes.isCassandraType(FieldTypes.CASSANDRA_TYPES.BIG_DECIMAL)).to.be.true;
      });
    });
    describe('when passing an enum', function () {
      it('returns false', function () {
        expect(FieldTypes.isCassandraType(new JDLEnum({name: 'MyEnum'}))).to.be.false;
      });
    });
  });
  describe('::getIsType', function () {
    describe('when passing an invalid argument', function () {
      it('fails', function () {
        try {
          FieldTypes.getIsType(null);
          fail();
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
        try {
          FieldTypes.getIsType(null, function () {
            //do nothing
          });
          fail();
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
      });
    });
    describe('when passing a valid argument without callback', function () {
      it('returns isType', function () {
        expect(FieldTypes.getIsType('mysql')).to.eq(FieldTypes.isSQLType);
      });
    });
    describe('when passing a valid argument and callback', function () {
      it('returns true', function () {
        expect(FieldTypes.getIsType('sql', function () {
          //do nothing
        })).to.eq(FieldTypes.isSQLType);
      });
    });
  });
  describe('::hasValidation', function () {
    describe('when passing an invalid argument', function () {
      it('fails', function () {
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
    describe('when passing a false argument', function () {
      it('returns false', function () {
        expect(FieldTypes.hasValidation(FieldTypes.CASSANDRA_TYPES.BIG_DECIMAL, Validations.PATTERN)).to.be.false;
      });
    });
    describe('when passing a valid argument', function () {
      it('returns true', function () {
        expect(FieldTypes.hasValidation(FieldTypes.CASSANDRA_TYPES.BIG_DECIMAL, Validations.MIN)).to.be.true;
      });
    });
  });
});
