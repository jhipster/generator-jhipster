

/* eslint-disable no-new, no-unused-expressions */
const expect = require('chai').expect;

const fail = expect.fail;
const JDLUnaryOption = require('../../../lib/core/jdl_unary_option');
const JDLEntity = require('../../../lib/core/jdl_entity');
const UNARY_OPTIONS = require('../../../lib/core/jhipster/unary_options').UNARY_OPTIONS;

describe('JDLUnaryOption', () => {
  describe('::new', () => {
    describe('when passing no argument', () => {
      it('fails', () => {
        try {
          new JDLUnaryOption();
          fail();
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
      });
    });
    describe('when passing an invalid name', () => {
      it('fails', () => {
        try {
          new JDLUnaryOption({ name: 'IsNotAnOption' });
          fail();
        } catch (error) {
          expect(error.name).to.eq('IllegalArgumentException');
          expect(error.message).to.eq('The option\'s name must be valid, got \'IsNotAnOption\'.');
        }
      });
    });
    describe('when passing a name at least', () => {
      it('creates an option', () => {
        const option = new JDLUnaryOption({ name: UNARY_OPTIONS.SKIP_CLIENT });
        expect(option.name).to.eq(UNARY_OPTIONS.SKIP_CLIENT);
      });
    });
    describe('when passing a list of entity names and excluded names with some of them being repeated', () => {
      it('removes the dupes', () => {
        const option = new JDLUnaryOption({
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
  describe('::isValid', () => {
    describe('when passing a nil object', () => {
      it('returns false', () => {
        expect(JDLUnaryOption.isValid()).to.be.false;
      });
    });
    describe('when passing an object with no name', () => {
      it('returns false', () => {
        expect(JDLUnaryOption.isValid({})).to.be.false;
      });
    });
    describe('when passing an object with a name', () => {
      it('returns false', () => {
        expect(JDLUnaryOption.isValid({ name: UNARY_OPTIONS.SKIP_CLIENT })).to.be.false;
      });
    });
    describe('when passing an object with a name, entity names and excluded names', () => {
      it('returns true', () => {
        const emptyOption = new JDLUnaryOption({ name: UNARY_OPTIONS.SKIP_CLIENT });
        expect(
          JDLUnaryOption.isValid({
            name: UNARY_OPTIONS.SKIP_CLIENT,
            entityNames: emptyOption.entityNames,
            excludedNames: emptyOption.excludedNames,
            getType: () => 'UNARY'
          })
        ).to.be.true;
      });
    });
  });
  describe('#addEntity', () => {
    describe('when passing a nil entity', () => {
      it('fails', () => {
        const option = new JDLUnaryOption({ name: UNARY_OPTIONS.SKIP_CLIENT });
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
        const option = new JDLUnaryOption({ name: UNARY_OPTIONS.SKIP_CLIENT });
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
        const option = new JDLUnaryOption({ name: UNARY_OPTIONS.SKIP_CLIENT });
        const result = option.addEntity(new JDLEntity({ name: 'A' }));
        expect(result).to.be.true;
        expect(option.entityNames.size()).to.eq(1);
      });
    });
    describe('when passing a valid entity that has already been added', () => {
      it('returns false', () => {
        const option = new JDLUnaryOption({ name: UNARY_OPTIONS.SKIP_CLIENT });
        option.addEntity(new JDLEntity({ name: 'A' }));
        const result = option.addEntity(new JDLEntity({ name: 'A' }));
        expect(result).to.be.false;
        expect(option.entityNames.size()).to.eq(1);
      });
    });
    describe('when passing an excluded entity', () => {
      it('returns false', () => {
        const option = new JDLUnaryOption({ name: UNARY_OPTIONS.SKIP_CLIENT });
        option.addEntity(new JDLEntity({ name: 'A' }));
        const result = option.excludeEntity(new JDLEntity({ name: 'A' }));
        expect(result).to.be.false;
      });
    });
  });
  describe('#addEntitiesFromAnotherOption', () => {
    const option = new JDLUnaryOption({
      name: UNARY_OPTIONS.SKIP_SERVER,
      entityNames: ['B', 'C'],
      excludedNames: ['Z']
    });

    describe('when passing an invalid option', () => {
      it('returns false', () => {
        expect(option.addEntitiesFromAnotherOption(null)).to.be.false;
      });
    });
    describe('when passing a valid option', () => {
      let returned;

      before(() => {
        const option2 = new JDLUnaryOption({
          name: UNARY_OPTIONS.SKIP_SERVER,
          entityNames: ['A', 'C'],
          excludedNames: ['Y']
        });
        returned = option.addEntitiesFromAnotherOption(option2);
      });

      it('returns true', () => {
        expect(returned).to.be.true;
      });
      it('adds the source entities to the target option', () => {
        expect(option.entityNames.toString()).to.equal('[B,C,A]');
      });
      it('adds the excluded source entities to the target option', () => {
        expect(option.excludedNames.toString()).to.equal('[Z,Y]');
      });
    });
  });
  describe('#excludeEntity', () => {
    describe('when passing a nil entity', () => {
      it('fails', () => {
        const option = new JDLUnaryOption({ name: UNARY_OPTIONS.SKIP_CLIENT });
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
        const option = new JDLUnaryOption({ name: UNARY_OPTIONS.SKIP_CLIENT });
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
        const option = new JDLUnaryOption({ name: UNARY_OPTIONS.SKIP_CLIENT });
        const result = option.excludeEntity(new JDLEntity({ name: 'A' }));
        expect(result).to.be.true;
        expect(option.excludedNames.size()).to.eq(1);
      });
    });
    describe('when passing a valid entity that has already been excluded', () => {
      it('returns false', () => {
        const option = new JDLUnaryOption({ name: UNARY_OPTIONS.SKIP_CLIENT });
        option.excludeEntity(new JDLEntity({ name: 'A' }));
        const result = option.excludeEntity(new JDLEntity({ name: 'A' }));
        expect(result).to.be.false;
        expect(option.excludedNames.size()).to.eq(1);
      });
    });
    describe('when passing an added entity', () => {
      it('returns false', () => {
        const option = new JDLUnaryOption({ name: UNARY_OPTIONS.SKIP_CLIENT });
        option.excludeEntity(new JDLEntity({ name: 'A' }));
        const result = option.addEntity(new JDLEntity({ name: 'A' }));
        expect(result).to.be.false;
      });
    });
  });
  describe('#toString', () => {
    it('stringifies the option', () => {
      const option = new JDLUnaryOption({ name: UNARY_OPTIONS.SKIP_CLIENT });
      expect(option.toString()).to.eq(`${UNARY_OPTIONS.SKIP_CLIENT} for *`);
      option.addEntity(new JDLEntity({ name: 'D' }));
      expect(option.toString()).to.eq(`${UNARY_OPTIONS.SKIP_CLIENT} for D`);
      option.addEntity(new JDLEntity({ name: 'E' }));
      option.addEntity(new JDLEntity({ name: 'F' }));
      expect(option.toString()).to.eq(`${UNARY_OPTIONS.SKIP_CLIENT} for D, E, F`);
      option.excludeEntity(new JDLEntity({ name: 'A' }));
      expect(option.toString()).to.eq(`${UNARY_OPTIONS.SKIP_CLIENT} for D, E, F except A`);
      option.excludeEntity(new JDLEntity({ name: 'B' }));
      option.excludeEntity(new JDLEntity({ name: 'C' }));
      expect(option.toString()).to.eq(`${UNARY_OPTIONS.SKIP_CLIENT} for D, E, F except A, B, C`);
    });
  });
});
