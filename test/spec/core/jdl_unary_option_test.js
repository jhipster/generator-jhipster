'use strict';

const expect = require('chai').expect,
  fail = expect.fail,
  JDLUnaryOption = require('../../../lib/core/jdl_unary_option'),
  JDLEntity = require('../../../lib/core/jdl_entity'),
  UNARY_OPTIONS = require('../../../lib/core/jhipster/unary_options').UNARY_OPTIONS;

describe('JDLUnaryOption', function () {
  describe('::new', function () {
    describe('when passing no argument', function () {
      it('fails', function () {
        try {
          new JDLUnaryOption();
          fail();
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
      });
    });
    describe('when passing an invalid name', function () {
      it('fails', function () {
        try {
          new JDLUnaryOption({name: 'IsNotAnOption'});
          fail();
        } catch (error) {
          expect(error.name).to.eq('IllegalArgumentException');
        }
      });
    });
    describe('when passing a name at least', function () {
      it('creates an option', function () {
        var option = new JDLUnaryOption({name: UNARY_OPTIONS.SKIP_CLIENT});
        expect(option.name).to.eq(UNARY_OPTIONS.SKIP_CLIENT);
      });
    });
    describe('when passing a list of entity names and excluded names with some of them being repeated', function () {
      it('removes the dupes', function () {
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
      it('returns false', function () {
        expect(JDLUnaryOption.isValid()).to.be.false;
      });
    });
    describe('when passing an object with no name', function () {
      it('returns false', function () {
        expect(JDLUnaryOption.isValid({})).to.be.false;
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
          fail();
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
          fail();
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
    describe('when passing an excluded entity', function () {
      it('returns false', function () {
        var option = new JDLUnaryOption({name: UNARY_OPTIONS.SKIP_CLIENT});
        option.addEntity(new JDLEntity({name: 'A'}));
        var result = option.excludeEntity(new JDLEntity({name: 'A'}));
        expect(result).to.be.false;
      });
    });
  });
  describe('#excludeEntity', function () {
    describe('when passing a nil entity', function () {
      it('fails', function () {
        var option = new JDLUnaryOption({name: UNARY_OPTIONS.SKIP_CLIENT});
        try {
          option.excludeEntity(null);
          fail();
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
          fail();
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
    describe('when passing an added entity', function () {
      it('returns false', function () {
        var option = new JDLUnaryOption({name: UNARY_OPTIONS.SKIP_CLIENT});
        option.excludeEntity(new JDLEntity({name: 'A'}));
        var result = option.addEntity(new JDLEntity({name: 'A'}));
        expect(result).to.be.false;
      });
    });
  });
  describe('#toString', function () {
    it('stringifies the option', function () {
      var option = new JDLUnaryOption({name: UNARY_OPTIONS.SKIP_CLIENT});
      expect(option.toString()).to.eq(`${UNARY_OPTIONS.SKIP_CLIENT} for *`);
      option.addEntity(new JDLEntity({name: 'D'}));
      expect(option.toString()).to.eq(`${UNARY_OPTIONS.SKIP_CLIENT} for D`);
      option.addEntity(new JDLEntity({name: 'E'}));
      option.addEntity(new JDLEntity({name: 'F'}));
      expect(option.toString()).to.eq(`${UNARY_OPTIONS.SKIP_CLIENT} for D, E, F`);
      option.excludeEntity(new JDLEntity({name: 'A'}));
      expect(option.toString()).to.eq(`${UNARY_OPTIONS.SKIP_CLIENT} for D, E, F except A`);
      option.excludeEntity(new JDLEntity({name: 'B'}));
      option.excludeEntity(new JDLEntity({name: 'C'}));
      expect(option.toString()).to.eq(`${UNARY_OPTIONS.SKIP_CLIENT} for D, E, F except A, B, C`);
    });
  });
});
