'use strict';

const expect = require('chai').expect,
  fail = expect.fail,
  JDLEntity = require('../../../lib/core/jdl_entity'),
  JDLRelationship = require('../../../lib/core/jdl_relationship'),
  RELATIONSHIP_TYPES = require('../../../lib/core/jhipster/relationship_types').RELATIONSHIP_TYPES;

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
            type: RELATIONSHIP_TYPES.MANY_TO_MANY
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
          type: RELATIONSHIP_TYPES.ONE_TO_ONE
        });
        expect(relationship.to.name).to.eq('Abc2');
        expect(relationship.from.name).to.eq('Abc');
        expect(relationship.injectedFieldInFrom).to.eq('something');
        expect(relationship.type).to.eq(RELATIONSHIP_TYPES.ONE_TO_ONE);
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
              type: RELATIONSHIP_TYPES.MANY_TO_MANY,
              injectedFieldInFrom: 'something'
            })
          ).to.be.false;
          expect(JDLRelationship.isValid({
            to: {},
            from: {name: 'Valid', tableName: 't_valid', fields: []},
            type: RELATIONSHIP_TYPES.MANY_TO_MANY,
            injectedFieldInFrom: 'something'
          })).to.be.false;
        });
      });
      describe('because the type is invalid', function () {
        it('returns false', function () {
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
        it('returns false', function () {
          expect(
            JDLRelationship.isValid({
              from: {name: 'Valid2', tableName: 't_valid2', fields: []},
              to: {name: 'Valid', tableName: 't_valid', fields: []},
              type: RELATIONSHIP_TYPES.MANY_TO_MANY
            })
          ).to.be.false;
        });
      });
    });
    describe('when passing a valid object', function () {
      it('returns true', function () {
        expect(
          JDLRelationship.isValid({
            from: {name: 'Valid2', tableName: 't_valid2', fields: []},
            to: {name: 'Valid', tableName: 't_valid', fields: []},
            type: RELATIONSHIP_TYPES.MANY_TO_MANY,
            injectedFieldInFrom: 'something'
          })
        ).to.be.true;
      });
    });
  });
  describe('#validate', function () {
    describe('when passing an incorrect relationship', function () {
      describe('because it is invalid', function () {
        it('fails', function () {
          var relationship = new JDLRelationship({
            from: {name: 'Valid2', tableName: 't_valid2', fields: []},
            to: {name: 'Valid', tableName: 't_valid', fields: []},
            type: RELATIONSHIP_TYPES.MANY_TO_MANY,
            injectedFieldInFrom: 'something'
          });
          relationship.injectedFieldInFrom = null;
          try {
            relationship.validate();
            fail();
          } catch (error) {
            expect(error.name).to.eq('InvalidObjectException');
          }
        });
      });
      describe("because the type doesn't exist", function () {
        it('fails', function () {
          var relationship = new JDLRelationship({
            from: {name: 'Valid2', tableName: 't_valid2', fields: []},
            to: {name: 'Valid', tableName: 't_valid', fields: []},
            type: RELATIONSHIP_TYPES.MANY_TO_MANY,
            injectedFieldInFrom: 'something'
          });
          relationship.type = 'WRONG';
          try {
            relationship.validate();
            fail();
          } catch (error) {
            expect(error.name).to.eq('InvalidObjectException');
          }
        });
      });
      describe('because the source entity is not in a One-to-One', function () {
        it('fails', function () {
          var relationship = new JDLRelationship({
            from: {name: 'Valid2', tableName: 't_valid2', fields: []},
            to: {name: 'Valid', tableName: 't_valid', fields: []},
            type: RELATIONSHIP_TYPES.ONE_TO_ONE,
            injectedFieldInTo: 'something'
          });
          try {
            relationship.validate();
            fail();
          } catch (error) {
            expect(error.name).to.eq('MalformedAssociationException');
          }
        });
      });
      describe('because one of the injected fields is not present in a One-to-Many (not bidirectional)', function () {
        it('just adds the missing side', function () {
          var relationship = new JDLRelationship({
            from: {name: 'Valid2', tableName: 't_valid2', fields: []},
            to: {name: 'Valid', tableName: 't_valid', fields: []},
            type: RELATIONSHIP_TYPES.ONE_TO_MANY,
            injectedFieldInFrom: 'something'
          });
          relationship.validate();
          expect(relationship.injectedFieldInTo).to.eq('valid2');
          relationship.injectedFieldInFrom = null;
          relationship.validate();
          expect(relationship.injectedFieldInFrom).to.eq('valid');
        });
      });
      describe('because both the sides are present in a Many-to-One (not unidirectional)', function () {
        it('fails', function () {
          var relationship = new JDLRelationship({
            from: {name: 'Valid2', tableName: 't_valid2', fields: []},
            to: {name: 'Valid', tableName: 't_valid', fields: []},
            type: RELATIONSHIP_TYPES.MANY_TO_ONE,
            injectedFieldInFrom: 'something',
            injectedFieldInTo: 'somethingElse'
          });
          try {
            relationship.validate();
            fail();
          } catch (error) {
            expect(error.name).to.eq('MalformedAssociationException');
          }
        });
      });
      describe('because one of the sides is not present in a Many-to-Many (not bidirectional)', function () {
        it('fails', function () {
          var relationship = new JDLRelationship({
            from: {name: 'Valid2', tableName: 't_valid2', fields: []},
            to: {name: 'Valid', tableName: 't_valid', fields: []},
            type: RELATIONSHIP_TYPES.MANY_TO_MANY,
            injectedFieldInFrom: 'something'
          });
          try {
            relationship.validate();
            fail();
          } catch (error) {
            expect(error.name).to.eq('MalformedAssociationException');
          }
        });
      });
    });
  });
  describe('#getId', function () {
    it('returns an unique representation of the relationship', function () {
      var relationship = new JDLRelationship({
        from: new JDLEntity({name: 'A'}),
        to: new JDLEntity({name: 'B'}),
        type: RELATIONSHIP_TYPES.ONE_TO_ONE,
        injectedFieldInFrom: 'b'
      });
      expect(relationship.getId()).to.eq(`${relationship.type}_${relationship.from.name}{${relationship.injectedFieldInFrom}}_${relationship.to.name}`);
    });
  });
  describe('#toString', function () {
    describe('without any comment', function () {
      it('stringifies the relationship', function () {
        var relationship = new JDLRelationship({
          from: new JDLEntity({name: 'A'}),
          to: new JDLEntity({name: 'B'}),
          type: RELATIONSHIP_TYPES.ONE_TO_ONE,
          injectedFieldInFrom: 'b'
        });
        expect(relationship.toString()).to.eq(
          `relationship ${relationship.type} {
  ${relationship.from.name}{${relationship.injectedFieldInFrom}} to ${relationship.to.name}
}`
        );
      });
    });
    describe('with comments for both sides', function () {
      it('stringifies the relationship', function () {
        var relationship = new JDLRelationship({
          from: new JDLEntity({name: 'A'}),
          to: new JDLEntity({name: 'B'}),
          type: RELATIONSHIP_TYPES.ONE_TO_ONE,
          injectedFieldInFrom: 'b',
          commentInFrom: 'Some comment.',
          commentInTo: 'Some other comment.'
        });
        expect(relationship.toString()).to.eq(
          `relationship ${relationship.type} {
  /**
   * ${relationship.commentInFrom}
   */
  ${relationship.from.name}{${relationship.injectedFieldInFrom}} to
  /**
   * ${relationship.commentInTo}
   */
  ${relationship.to.name}
}`
        );
      });
    });
    describe('with a comment for the source side', function () {
      it('stringifies the relationship', function () {
        var relationship = new JDLRelationship({
          from: new JDLEntity({name: 'A'}),
          to: new JDLEntity({name: 'B'}),
          type: RELATIONSHIP_TYPES.ONE_TO_ONE,
          injectedFieldInFrom: 'b',
          commentInFrom: 'Some comment.'
        });
        expect(relationship.toString()).to.eq(
          `relationship ${relationship.type} {
  /**
   * ${relationship.commentInFrom}
   */
  ${relationship.from.name}{${relationship.injectedFieldInFrom}} to ${relationship.to.name}
}`
        );
      });
    });
    describe('with a comment for the destination side', function () {
      it('stringifies the relationship', function () {
        var relationship = new JDLRelationship({
          from: new JDLEntity({name: 'A'}),
          to: new JDLEntity({name: 'B'}),
          type: RELATIONSHIP_TYPES.ONE_TO_ONE,
          injectedFieldInFrom: 'b',
          commentInTo: 'Some other comment.'
        });
        expect(relationship.toString()).to.eq(
          `relationship ${relationship.type} {
  ${relationship.from.name}{${relationship.injectedFieldInFrom}} to
  /**
   * ${relationship.commentInTo}
   */
  ${relationship.to.name}
}`
        );
      });
    });
    describe('with only one injected field', function () {
      it('stringifies the relationship', function () {
        var relationship = new JDLRelationship({
          from: new JDLEntity({name: 'A'}),
          to: new JDLEntity({name: 'B'}),
          type: RELATIONSHIP_TYPES.ONE_TO_ONE,
          injectedFieldInFrom: 'b'
        });
        expect(relationship.toString()).to.eq(
          `relationship ${relationship.type} {
  ${relationship.from.name}{${relationship.injectedFieldInFrom}} to ${relationship.to.name}
}`
        );
      });
    });
    describe('with both injected fields', function () {
      it('stringifies the relationship', function () {
        var relationship = new JDLRelationship({
          from: new JDLEntity({name: 'A'}),
          to: new JDLEntity({name: 'B'}),
          type: RELATIONSHIP_TYPES.ONE_TO_ONE,
          injectedFieldInFrom: 'b',
          injectedFieldInTo: 'a(id)'
        });
        expect(relationship.toString()).to.eq(
          `relationship ${relationship.type} {
  ${relationship.from.name}{${relationship.injectedFieldInFrom}} to ${relationship.to.name}{${relationship.injectedFieldInTo}}
}`
        );
      });
    });
  });
});
