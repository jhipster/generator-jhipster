

/* eslint-disable no-new, no-unused-expressions */
const expect = require('chai').expect;
const JDLBinaryOption = require('../../../lib/core/jdl_binary_option');
const JDLEntity = require('../../../lib/core/jdl_entity');
const BINARY_OPTIONS = require('../../../lib/core/jhipster/binary_options').BINARY_OPTIONS;
const BINARY_OPTION_VALUES = require('../../../lib/core/jhipster/binary_options').BINARY_OPTION_VALUES;

const fail = expect.fail;

describe('JDLBinaryOption', () => {
  describe('::new', () => {
    describe('when passing no argument', () => {
      it('fails', () => {
        try {
          new JDLBinaryOption();
          fail();
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
      });
    });
    describe('when passing an invalid name', () => {
      it('fails', () => {
        try {
          new JDLBinaryOption({ name: 'IsNotAnOption' });
          fail();
        } catch (error) {
          expect(error.name).to.eq('IllegalArgumentException');
          expect(
            error.message
          ).to.eq('The option\'s name and value must be valid, got no value for \'IsNotAnOption\'.');
        }
      });
    });
    describe('when passing a name but no value', () => {
      it('fails', () => {
        try {
          new JDLBinaryOption({ name: BINARY_OPTIONS.DTO });
          fail();
        } catch (error) {
          expect(error.name).to.eq('IllegalArgumentException');
          expect(error.message).to.eq('The option\'s name and value must be valid, got no value for \'dto\'.');
        }
      });
    });
    describe('when passing a name and a value', () => {
      it('creates the option', () => {
        const option = new JDLBinaryOption({
          name: BINARY_OPTIONS.DTO,
          value: BINARY_OPTION_VALUES.dto.MAPSTRUCT
        });
        expect(option).not.to.be.null;
        expect(option.name).to.eq(BINARY_OPTIONS.DTO);
        expect(option.value).to.eq(BINARY_OPTION_VALUES.dto.MAPSTRUCT);
      });
    });
    describe('when passing a list of entity names and excluded names with some of them being repeated', () => {
      it('removes the dupes', () => {
        const option = new JDLBinaryOption({
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
  describe('::isValid', () => {
    describe('when passing a nil object', () => {
      it('returns false', () => {
        expect(JDLBinaryOption.isValid()).to.be.false;
      });
    });
    describe('when passing an object with no name', () => {
      it('returns false', () => {
        expect(JDLBinaryOption.isValid({})).to.be.false;
      });
    });
    describe('when passing an object with a name', () => {
      it('returns false', () => {
        expect(JDLBinaryOption.isValid({ name: BINARY_OPTIONS.DTO })).to.be.false;
      });
    });
    describe('when passing an object with a name, entity names, excluded names and a type', () => {
      it('returns true', () => {
        const emptyOption = new JDLBinaryOption({
          name: BINARY_OPTIONS.DTO,
          value: BINARY_OPTION_VALUES.dto.MAPSTRUCT
        });
        expect(
          JDLBinaryOption.isValid({
            name: BINARY_OPTIONS.DTO,
            value: BINARY_OPTION_VALUES.dto.MAPSTRUCT,
            entityNames: emptyOption.entityNames,
            excludedNames: emptyOption.excludedNames,
            getType: () => 'BINARY'
          })
        ).to.be.true;
      });
    });
  });
  describe('#addEntity', () => {
    describe('when passing a nil entity', () => {
      it('fails', () => {
        const option = new JDLBinaryOption({
          name: BINARY_OPTIONS.DTO,
          value: BINARY_OPTION_VALUES.dto.MAPSTRUCT
        });
        try {
          option.addEntity(null);
          fail();
        } catch (error) {
          expect(error.name).to.eq('InvalidObjectException');
          expect(error.message).to.eq('The passed entity must be valid.\nErrors: No entity');
        }
      });
    });
    describe('when passing an invalid entity', () => {
      it('fails', () => {
        const option = new JDLBinaryOption({
          name: BINARY_OPTIONS.DTO,
          value: BINARY_OPTION_VALUES.dto.MAPSTRUCT
        });
        try {
          option.addEntity({});
          fail();
        } catch (error) {
          expect(error.name).to.eq('InvalidObjectException');
          expect(
            error.message
          ).to.eq('The passed entity must be valid.\nErrors: No entity name, No table name, No fields object');
        }
      });
    });
    describe('when passing a valid entity that hasn\'t been added yet', () => {
      it('returns true', () => {
        const option = new JDLBinaryOption({
          name: BINARY_OPTIONS.DTO,
          value: BINARY_OPTION_VALUES.dto.MAPSTRUCT
        });
        const result = option.addEntity(new JDLEntity({ name: 'A' }));
        expect(result).to.be.true;
        expect(option.entityNames.size()).to.eq(1);
      });
    });
    describe('when passing a valid entity that has already been added', () => {
      it('returns false', () => {
        const option = new JDLBinaryOption({
          name: BINARY_OPTIONS.DTO,
          value: BINARY_OPTION_VALUES.dto.MAPSTRUCT
        });
        option.addEntity(new JDLEntity({ name: 'A' }));
        const result = option.addEntity(new JDLEntity({ name: 'A' }));
        expect(result).to.be.false;
        expect(option.entityNames.size()).to.eq(1);
      });
    });
    describe('when passing an excluded entity', () => {
      it('returns false', () => {
        const option = new JDLBinaryOption({
          name: BINARY_OPTIONS.DTO,
          value: BINARY_OPTION_VALUES.dto.MAPSTRUCT
        });
        option.addEntity(new JDLEntity({ name: 'A' }));
        const result = option.excludeEntity(new JDLEntity({ name: 'A' }));
        expect(result).to.be.false;
      });
    });
  });
  describe('#excludeEntity', () => {
    describe('when passing a nil entity', () => {
      it('fails', () => {
        const option = new JDLBinaryOption({
          name: BINARY_OPTIONS.DTO,
          value: BINARY_OPTION_VALUES.dto.MAPSTRUCT
        });
        try {
          option.excludeEntity(null);
          fail();
        } catch (error) {
          expect(error.name).to.eq('InvalidObjectException');
          expect(error.message).to.eq('The passed entity must be valid.\nErrors: No entity');
        }
      });
    });
    describe('when passing an invalid entity', () => {
      it('fails', () => {
        const option = new JDLBinaryOption({
          name: BINARY_OPTIONS.DTO,
          value: BINARY_OPTION_VALUES.dto.MAPSTRUCT
        });
        try {
          option.excludeEntity({});
          fail();
        } catch (error) {
          expect(error.name).to.eq('InvalidObjectException');
          expect(
            error.message
          ).to.eq('The passed entity must be valid.\nErrors: No entity name, No table name, No fields object');
        }
      });
    });
    describe('when passing a valid entity that hasn\'t been excluded yet', () => {
      it('returns true', () => {
        const option = new JDLBinaryOption({
          name: BINARY_OPTIONS.DTO,
          value: BINARY_OPTION_VALUES.dto.MAPSTRUCT
        });
        const result = option.excludeEntity(new JDLEntity({ name: 'A' }));
        expect(result).to.be.true;
        expect(option.excludedNames.size()).to.eq(1);
      });
    });
    describe('when passing a valid entity that has already been excluded', () => {
      it('returns false', () => {
        const option = new JDLBinaryOption({
          name: BINARY_OPTIONS.DTO,
          value: BINARY_OPTION_VALUES.dto.MAPSTRUCT
        });
        option.excludeEntity(new JDLEntity({ name: 'A' }));
        const result = option.excludeEntity(new JDLEntity({ name: 'A' }));
        expect(result).to.be.false;
        expect(option.excludedNames.size()).to.eq(1);
      });
    });
    describe('when passing an added entity', () => {
      it('returns false', () => {
        const option = new JDLBinaryOption({
          name: BINARY_OPTIONS.DTO,
          value: BINARY_OPTION_VALUES.dto.MAPSTRUCT
        });
        option.excludeEntity(new JDLEntity({ name: 'A' }));
        const result = option.addEntity(new JDLEntity({ name: 'A' }));
        expect(result).to.be.false;
      });
    });
  });
  describe('#toString', () => {
    it('stringifies the option', () => {
      let option = new JDLBinaryOption({
        name: BINARY_OPTIONS.DTO,
        value: BINARY_OPTION_VALUES.dto.MAPSTRUCT
      });
      expect(option.toString()).to.eq(`${BINARY_OPTIONS.DTO} * with ${BINARY_OPTION_VALUES.dto.MAPSTRUCT}`);
      option.addEntity(new JDLEntity({ name: 'D' }));
      expect(option.toString()).to.eq(`${BINARY_OPTIONS.DTO} D with ${BINARY_OPTION_VALUES.dto.MAPSTRUCT}`);
      option.addEntity(new JDLEntity({ name: 'E' }));
      option.addEntity(new JDLEntity({ name: 'F' }));
      expect(option.toString()).to.eq(`${BINARY_OPTIONS.DTO} D, E, F with ${BINARY_OPTION_VALUES.dto.MAPSTRUCT}`);
      option.excludeEntity(new JDLEntity({ name: 'A' }));
      expect(option.toString()).to.eq(`${BINARY_OPTIONS.DTO} D, E, F with ${BINARY_OPTION_VALUES.dto.MAPSTRUCT} except A`);
      option.excludeEntity(new JDLEntity({ name: 'B' }));
      option.excludeEntity(new JDLEntity({ name: 'C' }));
      expect(option.toString()).to.eq(`${BINARY_OPTIONS.DTO} D, E, F with ${BINARY_OPTION_VALUES.dto.MAPSTRUCT} except A, B, C`);
      option = new JDLBinaryOption({
        name: BINARY_OPTIONS.PAGINATION,
        value: BINARY_OPTION_VALUES.pagination.PAGER
      });
      expect(option.toString()).to.eq(`paginate * with ${BINARY_OPTION_VALUES.pagination.PAGER}`);
    });
  });
});
