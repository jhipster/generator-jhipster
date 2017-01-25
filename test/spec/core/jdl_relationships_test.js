'use strict';

const expect = require('chai').expect,
  fail = expect.fail,
  JDLEntity = require('../../../lib/core/jdl_entity'),
  JDLRelationship = require('../../../lib/core/jdl_relationship'),
  RELATIONSHIP_TYPES = require('../../../lib/core/jhipster/relationship_types').RELATIONSHIP_TYPES,
  JDLRelationships = require('../../../lib/core/jdl_relationships');

describe('JDLRelationships', function () {
  describe('#add', function () {
    describe('when passing an invalid relationship', function () {
      describe('because it is nil', function () {
        it('fails', function () {
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
      describe('because it is invalid', function () {
        it('fails', function () {
          try {
            new JDLRelationships().add({
              to: {name: 'A'},
              from: {name: 'B'}
            });
            fail();
          } catch (error) {
            expect(error.name).to.eq('InvalidObjectException');
          }
        });
      });
    });
    describe('when passing a valid relationship', function () {
      it('succeeds', function () {
        var relationships = new JDLRelationships();
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
  describe('#toArray', function () {
    it('returns the list of each relationship', function () {
      var relationships = new JDLRelationships();
      var relationship1 = new JDLRelationship({
        from: new JDLEntity({
          name: 'Abc'
        }),
        to: new JDLEntity({
          name: 'Abc2'
        }),
        injectedFieldInFrom: 'something',
        type: RELATIONSHIP_TYPES.ONE_TO_ONE
      });
      var relationship2 = new JDLRelationship({
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
      var array = relationships.toArray();
      expect(array).to.deep.eq([relationship1, relationship2]);
    });
  });
  describe('#toString', function () {
    describe('when having one relationship per type', function () {
      it('uses the standard string form', function () {
        var relationships = new JDLRelationships();
        var oto = new JDLRelationship({
          from: new JDLEntity({
            name: 'Abc'
          }),
          to: new JDLEntity({
            name: 'Abc2'
          }),
          injectedFieldInFrom: 'something',
          type: RELATIONSHIP_TYPES.ONE_TO_ONE
        });
        var otm = new JDLRelationship({
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
    describe('when having more than one relationship per type', function () {
      it('uses the new string form', function () {
        var relationships = new JDLRelationships();
        var oto1 = new JDLRelationship({
          from: new JDLEntity({
            name: 'Abc'
          }),
          to: new JDLEntity({
            name: 'Abc2'
          }),
          injectedFieldInFrom: 'something',
          type: RELATIONSHIP_TYPES.ONE_TO_ONE
        });
        var oto2 = new JDLRelationship({
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
