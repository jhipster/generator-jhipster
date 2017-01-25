'use strict';

const expect = require('chai').expect,
  fail = expect.fail,
  JDLBinaryOption = require('../../../lib/core/jdl_binary_option'),
  JDLEntity = require('../../../lib/core/jdl_entity'),
  BINARY_OPTIONS = require('../../../lib/core/jhipster/binary_options').BINARY_OPTIONS,
  BINARY_OPTION_VALUES = require('../../../lib/core/jhipster/binary_options').BINARY_OPTION_VALUES;

describe('JDLBinaryOption', function () {
  describe('::new', function () {
    describe('when passing no argument', function () {
      it('fails', function () {
        try {
          new JDLBinaryOption();
          fail();
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
      });
    });
    describe('when passing an invalid name', function () {
      it('fails', function () {
        try {
          new JDLBinaryOption({name: 'IsNotAnOption'});
          fail();
        } catch (error) {
          expect(error.name).to.eq('IllegalArgumentException');
        }
      });
    });
    describe('when passing a name but no value', function () {
      it('fails', function () {
        try {
          new JDLBinaryOption({name: BINARY_OPTIONS.DTO});
          fail();
        } catch (error) {
          expect(error.name).to.eq('IllegalArgumentException');
        }
      });
    });
    describe('when passing a name and a value', function () {
      it('creates the option', function () {
        var option = new JDLBinaryOption({
          name: BINARY_OPTIONS.DTO,
          value: BINARY_OPTION_VALUES.dto.MAPSTRUCT
        });
        expect(option).not.to.be.null;
        expect(option.name).to.eq(BINARY_OPTIONS.DTO);
        expect(option.value).to.eq(BINARY_OPTION_VALUES.dto.MAPSTRUCT);
      });
    });
    describe('when passing a list of entity names and excluded names with some of them being repeated', function () {
      it('removes the dupes', function () {
        var option = new JDLBinaryOption({
          name: BINARY_OPTIONS.DTO,
          value: BINARY_OPTION_VALUES.dto.MAPSTRUCT,
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
        expect(JDLBinaryOption.isValid()).to.be.false;
      });
    });
    describe('when passing an object with no name', function () {
      it('returns false', function () {
        expect(JDLBinaryOption.isValid({})).to.be.false;
      });
    });
    describe('when passing an object with a name', function () {
      it('returns false', function () {
        expect(JDLBinaryOption.isValid({name: BINARY_OPTIONS.DTO})).to.be.false;
      });
    });
    describe('when passing an object with a name, entity names and excluded names', function () {
      it('returns true', function () {
        var emptyOption = new JDLBinaryOption({
          name: BINARY_OPTIONS.DTO,
          value: BINARY_OPTION_VALUES.dto.MAPSTRUCT
        });
        expect(
          JDLBinaryOption.isValid({
            name: BINARY_OPTIONS.DTO,
            value: BINARY_OPTION_VALUES.dto.MAPSTRUCT,
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
        var option = new JDLBinaryOption({
          name: BINARY_OPTIONS.DTO,
          value: BINARY_OPTION_VALUES.dto.MAPSTRUCT
        });
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
        var option = new JDLBinaryOption({
          name: BINARY_OPTIONS.DTO,
          value: BINARY_OPTION_VALUES.dto.MAPSTRUCT
        });
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
        var option = new JDLBinaryOption({
          name: BINARY_OPTIONS.DTO,
          value: BINARY_OPTION_VALUES.dto.MAPSTRUCT
        });
        var result = option.addEntity(new JDLEntity({name: 'A'}));
        expect(result).to.be.true;
        expect(option.entityNames.size()).to.eq(1);
      });
    });
    describe('when passing a valid entity that has already been added', function () {
      it('returns false', function () {
        var option = new JDLBinaryOption({
          name: BINARY_OPTIONS.DTO,
          value: BINARY_OPTION_VALUES.dto.MAPSTRUCT
        });
        option.addEntity(new JDLEntity({name: 'A'}));
        var result = option.addEntity(new JDLEntity({name: 'A'}));
        expect(result).to.be.false;
        expect(option.entityNames.size()).to.eq(1);
      });
    });
    describe('when passing an excluded entity', function () {
      it('returns false', function () {
        var option = new JDLBinaryOption({
          name: BINARY_OPTIONS.DTO,
          value: BINARY_OPTION_VALUES.dto.MAPSTRUCT
        });
        option.addEntity(new JDLEntity({name: 'A'}));
        var result = option.excludeEntity(new JDLEntity({name: 'A'}));
        expect(result).to.be.false;
      });
    });
  });
  describe('#excludeEntity', function () {
    describe('when passing a nil entity', function () {
      it('fails', function () {
        var option = new JDLBinaryOption({
          name: BINARY_OPTIONS.DTO,
          value: BINARY_OPTION_VALUES.dto.MAPSTRUCT
        });
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
        var option = new JDLBinaryOption({
          name: BINARY_OPTIONS.DTO,
          value: BINARY_OPTION_VALUES.dto.MAPSTRUCT
        });
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
        var option = new JDLBinaryOption({
          name: BINARY_OPTIONS.DTO,
          value: BINARY_OPTION_VALUES.dto.MAPSTRUCT
        });
        var result = option.excludeEntity(new JDLEntity({name: 'A'}));
        expect(result).to.be.true;
        expect(option.excludedNames.size()).to.eq(1);
      });
    });
    describe('when passing a valid entity that has already been excluded', function () {
      it('returns false', function () {
        var option = new JDLBinaryOption({
          name: BINARY_OPTIONS.DTO,
          value: BINARY_OPTION_VALUES.dto.MAPSTRUCT
        });
        option.excludeEntity(new JDLEntity({name: 'A'}));
        var result = option.excludeEntity(new JDLEntity({name: 'A'}));
        expect(result).to.be.false;
        expect(option.excludedNames.size()).to.eq(1);
      });
    });
    describe('when passing an added entity', function () {
      it('returns false', function () {
        var option = new JDLBinaryOption({
          name: BINARY_OPTIONS.DTO,
          value: BINARY_OPTION_VALUES.dto.MAPSTRUCT
        });
        option.excludeEntity(new JDLEntity({name: 'A'}));
        var result = option.addEntity(new JDLEntity({name: 'A'}));
        expect(result).to.be.false;
      });
    });
  });
  describe('#toString', function () {
    it('stringifies the option', function () {
      var option = new JDLBinaryOption({
        name: BINARY_OPTIONS.DTO,
        value: BINARY_OPTION_VALUES.dto.MAPSTRUCT
      });
      expect(option.toString()).to.eq(`${BINARY_OPTIONS.DTO} * with ${BINARY_OPTION_VALUES.dto.MAPSTRUCT}`);
      option.addEntity(new JDLEntity({name: 'D'}));
      expect(option.toString()).to.eq(`${BINARY_OPTIONS.DTO} D with ${BINARY_OPTION_VALUES.dto.MAPSTRUCT}`);
      option.addEntity(new JDLEntity({name: 'E'}));
      option.addEntity(new JDLEntity({name: 'F'}));
      expect(option.toString()).to.eq(`${BINARY_OPTIONS.DTO} D, E, F with ${BINARY_OPTION_VALUES.dto.MAPSTRUCT}`);
      option.excludeEntity(new JDLEntity({name: 'A'}));
      expect(option.toString()).to.eq(`${BINARY_OPTIONS.DTO} D, E, F with ${BINARY_OPTION_VALUES.dto.MAPSTRUCT} except A`);
      option.excludeEntity(new JDLEntity({name: 'B'}));
      option.excludeEntity(new JDLEntity({name: 'C'}));
      expect(option.toString()).to.eq(`${BINARY_OPTIONS.DTO} D, E, F with ${BINARY_OPTION_VALUES.dto.MAPSTRUCT} except A, B, C`);
      option = new JDLBinaryOption({
        name: BINARY_OPTIONS.PAGINATION,
        value: BINARY_OPTION_VALUES.pagination.PAGER
      });
      expect(option.toString()).to.eq(`paginate * with ${BINARY_OPTION_VALUES.pagination.PAGER}`);
    });
  });
});
