'use strict';

const expect = require('chai').expect,
    fail = expect.fail,
    JDLEntity = require('../../../lib/core/jdl_entity'),
    JDLRelationship = require('../../../lib/core/jdl_relationship').JDLRelationship,
    RelationshipTypes = require('../../../lib/core/jdl_relationship').RelationshipTypes,
    JDLRelationships = require('../../../lib/core/jdl_relationships');

describe('JDLRelationships', function () {
  describe('#add', function () {
    describe('when passing an invalid relationship', function () {
      describe('because it is nil', function () {
        it('fails', function () {
          try {
            new JDLRelationships().add(null);
          } catch (error) {
            expect(error.name).to.eq('NullPointerException');
          }
          try {
            new JDLRelationships().add(undefined);
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
          type: RelationshipTypes.OneToOne
        }));
        relationships.add(new JDLRelationship({
          from: new JDLEntity({
            name: 'Abc2'
          }),
          to: new JDLEntity({
            name: 'Abc3'
          }),
          injectedFieldInFrom: 'somethingElse',
          type: RelationshipTypes.OneToOne
        }));
        expect(relationships.relationships.OneToOne.length).to.eq(2);
      });
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
          type: RelationshipTypes.OneToOne
        });
        var otm = new JDLRelationship({
          from: new JDLEntity({
            name: 'Abc'
          }),
          to: new JDLEntity({
            name: 'Abc2'
          }),
          injectedFieldInTo: 'somethingElse',
          type: RelationshipTypes.OneToMany
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
          type: RelationshipTypes.OneToOne
        });
        var oto2 = new JDLRelationship({
          from: new JDLEntity({
            name: 'Abc2'
          }),
          to: new JDLEntity({
            name: 'Abc3'
          }),
          injectedFieldInTo: 'somethingElse',
          type: RelationshipTypes.OneToOne
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
