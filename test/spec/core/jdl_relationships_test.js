

/* eslint-disable no-new, no-unused-expressions */
const expect = require('chai').expect;

const fail = expect.fail;
const JDLEntity = require('../../../lib/core/jdl_entity');
const JDLRelationship = require('../../../lib/core/jdl_relationship');
const RELATIONSHIP_TYPES = require('../../../lib/core/jhipster/relationship_types').RELATIONSHIP_TYPES;
const JDLRelationships = require('../../../lib/core/jdl_relationships');

describe('JDLRelationships', () => {
  describe('#add', () => {
    describe('when passing an invalid relationship', () => {
      describe('because it is nil', () => {
        it('fails', () => {
          try {
            new JDLRelationships().add(null);
            fail();
          } catch (error) {
            expect(error.name).to.eq('NullPointerException');
          }
          try {
            new JDLRelationships().add(undefined);
            fail();
          } catch (error) {
            expect(error.name).to.eq('NullPointerException');
          }
        });
      });
      describe('because it is invalid', () => {
        it('fails', () => {
          try {
            new JDLRelationships().add({
              to: { name: 'A' },
              from: { name: 'B' }
            });
            fail();
          } catch (error) {
            expect(error.name).to.eq('InvalidObjectException');
          }
        });
      });
    });
    describe('when passing a valid relationship', () => {
      it('succeeds', () => {
        const relationships = new JDLRelationships();
        relationships.add(new JDLRelationship({
          from: new JDLEntity({
            name: 'Abc'
          }),
          to: new JDLEntity({
            name: 'Abc2'
          }),
          injectedFieldInFrom: 'something',
          type: RELATIONSHIP_TYPES.ONE_TO_ONE
        }));
        relationships.add(new JDLRelationship({
          from: new JDLEntity({
            name: 'Abc2'
          }),
          to: new JDLEntity({
            name: 'Abc3'
          }),
          injectedFieldInFrom: 'somethingElse',
          type: RELATIONSHIP_TYPES.ONE_TO_ONE
        }));
        expect(relationships.size).to.eq(2);
        expect(Object.keys(relationships.relationships.OneToOne).length).to.eq(2);
      });
    });
  });
  describe('#toArray', () => {
    it('returns the list of each relationship', () => {
      const relationships = new JDLRelationships();
      const relationship1 = new JDLRelationship({
        from: new JDLEntity({
          name: 'Abc'
        }),
        to: new JDLEntity({
          name: 'Abc2'
        }),
        injectedFieldInFrom: 'something',
        type: RELATIONSHIP_TYPES.ONE_TO_ONE
      });
      const relationship2 = new JDLRelationship({
        from: new JDLEntity({
          name: 'Abc2'
        }),
        to: new JDLEntity({
          name: 'Abc3'
        }),
        injectedFieldInFrom: 'somethingElse',
        type: RELATIONSHIP_TYPES.ONE_TO_ONE
      });
      relationships.add(relationship1);
      relationships.add(relationship2);
      const array = relationships.toArray();
      expect(array).to.deep.eq([relationship1, relationship2]);
    });
  });
  describe('#toString', () => {
    describe('when having one relationship per type', () => {
      it('uses the standard string form', () => {
        const relationships = new JDLRelationships();
        const oto = new JDLRelationship({
          from: new JDLEntity({
            name: 'Abc'
          }),
          to: new JDLEntity({
            name: 'Abc2'
          }),
          injectedFieldInFrom: 'something',
          type: RELATIONSHIP_TYPES.ONE_TO_ONE
        });
        const otm = new JDLRelationship({
          from: new JDLEntity({
            name: 'Abc'
          }),
          to: new JDLEntity({
            name: 'Abc2'
          }),
          injectedFieldInTo: 'somethingElse',
          type: RELATIONSHIP_TYPES.ONE_TO_MANY
        });
        relationships.add(oto);
        relationships.add(otm);
        expect(relationships.toString()).to.eq(`relationship ${oto.type} {
  ${oto.from.name}{${oto.injectedFieldInFrom}} to ${oto.to.name}
}
relationship ${otm.type} {
  ${otm.from.name} to ${otm.to.name}{${otm.injectedFieldInTo}}
}`);
      });
    });
    describe('when having more than one relationship per type', () => {
      it('uses the new string form', () => {
        const relationships = new JDLRelationships();
        const oto1 = new JDLRelationship({
          from: new JDLEntity({
            name: 'Abc'
          }),
          to: new JDLEntity({
            name: 'Abc2'
          }),
          injectedFieldInFrom: 'something',
          type: RELATIONSHIP_TYPES.ONE_TO_ONE
        });
        const oto2 = new JDLRelationship({
          from: new JDLEntity({
            name: 'Abc2'
          }),
          to: new JDLEntity({
            name: 'Abc3'
          }),
          injectedFieldInTo: 'somethingElse',
          type: RELATIONSHIP_TYPES.ONE_TO_ONE
        });
        relationships.add(oto1);
        relationships.add(oto2);
        expect(relationships.toString()).to.eq(`relationship ${oto1.type} {
  ${oto1.from.name}{${oto1.injectedFieldInFrom}} to ${oto1.to.name},
  ${oto2.from.name} to ${oto2.to.name}{${oto2.injectedFieldInTo}}
}`);
      });
    });
  });
});
