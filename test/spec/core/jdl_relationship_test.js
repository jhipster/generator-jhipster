'use strict';

const expect = require('chai').expect,
    fail = expect.fail,
    JDLEntity = require('../../../lib/core/jdl_entity'),
    JDLRelationship = require('../../../lib/core/jdl_relationship').JDLRelationship,
    RelationshipTypes = require('../../../lib/core/jdl_relationship').RelationshipTypes;

describe('JDLRelationship', function () {
  describe('::new', function () {
    describe('when not passing at least one injected field', function () {
      it('fails', function () {
        try {
          new JDLRelationship({
            from: new JDLEntity({
              name: 'Abc'
            }),
            to: new JDLEntity({
              name: 'Abc2'
            }),
            type: RelationshipTypes.ManyToMany
          });
          fail();
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
      });
    });
    describe('when having invalid entities as source and/or destination', function () {
      it('fails', function () {
        try {
          new JDLRelationship({
            from: {},
            to: new JDLEntity({
              name: 'Abc2'
            }),
            injectedFieldInFrom: 'something'
          });
          fail();
        } catch (error) {
          expect(error.name).to.eq('InvalidObjectException');
        }
        try {
          new JDLRelationship({
            from: new JDLEntity({
              name: 'Abc1'
            }),
            to: {},
            injectedFieldInFrom: 'something'
          });
          fail();
        } catch (error) {
          expect(error.name).to.eq('InvalidObjectException');
        }
        try {
          new JDLRelationship({
            from: {},
            to: {},
            injectedFieldInFrom: 'something'
          });
          fail();
        } catch (error) {
          expect(error.name).to.eq('InvalidObjectException');
        }
      });
    });
    describe('when passing an invalid type', function () {
      it('fails', function () {
        try {
          new JDLRelationship({
            from: new JDLEntity({
              name: 'Abc'
            }),
            to: new JDLEntity({
              name: 'Abc2'
            }),
            injectedFieldInFrom: 'something',
            type: 'WRONG_TYPE'
          });
          fail();
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
      });
    });
    describe('when passing valid args', function () {
      it('succeeds', function () {
        var relationship = new JDLRelationship({
          from: new JDLEntity({
            name: 'Abc'
          }),
          to: new JDLEntity({
            name: 'Abc2'
          }),
          injectedFieldInFrom: 'something',
          type: RelationshipTypes.OneToOne
        });
        expect(relationship.to.name).to.eq('Abc2');
        expect(relationship.from.name).to.eq('Abc');
        expect(relationship.injectedFieldInFrom).to.eq('something');
        expect(relationship.type).to.eq(RelationshipTypes.OneToOne);
      });
    });
  });
  describe('::isValid', function () {
    describe('when checking the validity of an invalid object', function () {
      describe('because it is nil or invalid', function () {
        it('returns false', function () {
          expect(JDLRelationship.isValid(null)).to.be.false;
          expect(JDLRelationship.isValid(undefined)).to.be.false;
        });
      });
      describe('because the entities are invalid', function () {
        it('returns false', function () {
          expect(
              JDLRelationship.isValid({
                from: {},
                to: {name: 'Valid', tableName: 't_valid', fields: []},
                type: RelationshipTypes.ManyToMany,
                injectedFieldInFrom: 'something'
              })
          ).to.be.false;
          expect(JDLRelationship.isValid({
            to: {},
            from: {name: 'Valid', tableName: 't_valid', fields: []},
            type: RelationshipTypes.ManyToMany,
            injectedFieldInFrom: 'something'
          })).to.be.false;
        });
      });
      describe('because the type is invalid', function () {
        it('returns false', function() {
          expect(
              JDLRelationship.isValid({
                from: {name: 'Valid2', tableName: 't_valid2', fields: []},
                to: {name: 'Valid', tableName: 't_valid', fields: []},
                type: 'WRONG',
                injectedFieldInFrom: 'something'
              })
          ).to.be.false;
        });
      });
      describe('because it lacks an injected field', function () {
        it('returns false', function() {
          expect(
              JDLRelationship.isValid({
                from: {name: 'Valid2', tableName: 't_valid2', fields: []},
                to: {name: 'Valid', tableName: 't_valid', fields: []},
                type: RelationshipTypes.ManyToMany
              })
          ).to.be.false;
        });
      });
    });
    describe('when passing a valid object', function() {
      it('returns true', function() {
        expect(
            JDLRelationship.isValid({
              from: {name: 'Valid2', tableName: 't_valid2', fields: []},
              to: {name: 'Valid', tableName: 't_valid', fields: []},
              type: RelationshipTypes.ManyToMany,
              injectedFieldInFrom: 'something'
            })
        ).to.be.true;
      });
    });
  });
  describe('#toString', function () {

  });
});