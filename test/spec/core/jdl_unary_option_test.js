'use strict';

const expect = require('chai').expect,
    JDLUnaryOption = require('../../../lib/core/jdl_unary_option').JDLUnaryOption,
    JDLEntity = require('../../../lib/core/jdl_entity'),
    UNARY_OPTIONS = require('../../../lib/core/jdl_unary_option').UNARY_OPTIONS;

describe('JDLUnaryOption', function () {
  describe('::new', function () {
    describe('when passing no argument', function () {
      it('fails', function () {
        try {
          new JDLUnaryOption();
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
      });
    });
    describe('when passing a name at least', function () {
      it('creates an option', function () {
        var option = new JDLUnaryOption({name: UNARY_OPTIONS.SKIP_CLIENT});
        expect(option.name).to.eq(UNARY_OPTIONS.SKIP_CLIENT);
      });
    });
    describe('when passing a list of entity names and excluded names with some of them being repeated', function() {
      it('removes the dupes', function() {
        var option = new JDLUnaryOption({
          name: UNARY_OPTIONS.SKIP_CLIENT,
          entityNames: ['A', 'B', 'C', 'A'],
          excludedNames: ['E', 'E', 'D']
        });
        expect(option.entityNames.size()).to.eq(3);
        expect(option.entityNames.has('A')).to.be.true;
        expect(option.entityNames.has('B')).to.be.true;
        expect(option.entityNames.has('C')).to.be.true;
        expect(option.excludedNames.size()).to.eq(2);
        expect(option.excludedNames.has('E')).to.be.true;
        expect(option.excludedNames.has('D')).to.be.true;
      });
    });
  });
  describe('::isValid', function () {
    describe('when passing a nil object', function () {
      it('fails', function () {
        try {
          JDLUnaryOption.isValid();
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
      });
    });
    describe('when passing an object with no name', function () {
      it('fails', function () {
        try {
          JDLUnaryOption.isValid({});
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
      });
    });
    describe('when passing an object with a name', function () {
      it('returns false', function () {
        expect(JDLUnaryOption.isValid({name: UNARY_OPTIONS.SKIP_CLIENT})).to.be.false;
      });
    });
    describe('when passing an object with a name, entity names and excluded names', function () {
      it('returns true', function () {
        var emptyOption = new JDLUnaryOption({name: UNARY_OPTIONS.SKIP_CLIENT});
        expect(
            JDLUnaryOption.isValid({
              name: UNARY_OPTIONS.SKIP_CLIENT,
              entityNames: emptyOption.entityNames,
              excludedNames: emptyOption.excludedNames
            })
        ).to.be.true;
      });
    });
  });
  describe('#addEntity', function () {
    describe('when passing a nil entity', function () {
      it('fails', function () {
        var option = new JDLUnaryOption({name: UNARY_OPTIONS.SKIP_CLIENT});
        try {
          option.addEntity(null);
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
      });
    });
    describe('when passing an invalid entity', function () {
      it('fails', function () {
        var option = new JDLUnaryOption({name: UNARY_OPTIONS.SKIP_CLIENT});
        try {
          option.addEntity({});
        } catch (error) {
          expect(error.name).to.eq('InvalidObjectException');
        }
      });
    });
    describe("when passing a valid entity that hasn't been added yet", function () {
      it('returns true', function () {
        var option = new JDLUnaryOption({name: UNARY_OPTIONS.SKIP_CLIENT});
        var result = option.addEntity(new JDLEntity({name: 'A'}));
        expect(result).to.be.true;
        expect(option.entityNames.size()).to.eq(1);
      });
    });
    describe('when passing a valid entity that has already been added', function () {
      it('returns false', function () {
        var option = new JDLUnaryOption({name: UNARY_OPTIONS.SKIP_CLIENT});
        option.addEntity(new JDLEntity({name: 'A'}));
        var result = option.addEntity(new JDLEntity({name: 'A'}));
        expect(result).to.be.false;
        expect(option.entityNames.size()).to.eq(1);
      });
    });
  });
  describe('#excludeEntity', function () {
    describe('when passing a nil entity', function () {
      it('fails', function () {
        var option = new JDLUnaryOption({name: UNARY_OPTIONS.SKIP_CLIENT});
        try {
          option.excludeEntity(null);
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
      });
    });
    describe('when passing an invalid entity', function () {
      it('fails', function () {
        var option = new JDLUnaryOption({name: UNARY_OPTIONS.SKIP_CLIENT});
        try {
          option.excludeEntity({});
        } catch (error) {
          expect(error.name).to.eq('InvalidObjectException');
        }
      });
    });
    describe("when passing a valid entity that hasn't been excluded yet", function () {
      it('returns true', function () {
        var option = new JDLUnaryOption({name: UNARY_OPTIONS.SKIP_CLIENT});
        var result = option.excludeEntity(new JDLEntity({name: 'A'}));
        expect(result).to.be.true;
        expect(option.excludedNames.size()).to.eq(1);
      });
    });
    describe('when passing a valid entity that has already been excluded', function () {
      it('returns false', function () {
        var option = new JDLUnaryOption({name: UNARY_OPTIONS.SKIP_CLIENT});
        option.excludeEntity(new JDLEntity({name: 'A'}));
        var result = option.excludeEntity(new JDLEntity({name: 'A'}));
        expect(result).to.be.false;
        expect(option.excludedNames.size()).to.eq(1);
      });
    });
  });
  describe('#toString', function () {
  });
});
