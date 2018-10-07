/**
 * Copyright 2013-2018 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see http://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* eslint-disable no-new, no-unused-expressions */
const { expect } = require('chai');

const JDLRelationship = require('../../../lib/core/jdl_relationship');
const RelationshipTypes = require('../../../lib/core/jhipster/relationship_types');
const JDLRelationships = require('../../../lib/core/jdl_relationships');

describe('JDLRelationships', () => {
  describe('#add', () => {
    context('when passing an invalid relationship', () => {
      context('because it is nil', () => {
        it('fails', () => {
          expect(() => {
            new JDLRelationships().add();
          }).to.throw('A relationship must be passed so as to be added.');
        });
      });
      context('because it is invalid', () => {
        it('fails', () => {
          expect(() => {
            new JDLRelationships().add({
              to: 'A',
              from: 'B'
            });
          }).to.throw('A valid relationship must be passed so as to be added.');
        });
      });
    });
    context('when passing a valid relationship', () => {
      let relationships = null;

      before(() => {
        relationships = new JDLRelationships();
        relationships.add(
          new JDLRelationship({
            from: 'Abc',
            to: 'Abc2',
            injectedFieldInFrom: 'something',
            type: RelationshipTypes.ONE_TO_ONE
          })
        );
        relationships.add(
          new JDLRelationship({
            from: 'Abc2',
            to: 'Abc3',
            injectedFieldInFrom: 'somethingElse',
            type: RelationshipTypes.ONE_TO_ONE
          })
        );
      });

      it('succeeds', () => {
        expect(relationships.size()).to.eq(2);
      });
    });
  });
  describe('#get', () => {
    context('when passing an invalid type', () => {
      it('fails', () => {
        expect(() => {
          new JDLRelationships().get('oops', 42);
        }).to.throw("A valid relationship type must be passed so as to retrieve the relationship, got 'oops'.");
      });
    });
    context('when passing an invalid id', () => {
      it('fails', () => {
        expect(() => {
          new JDLRelationships().get(RelationshipTypes.ONE_TO_MANY);
        }).to.throw('A relationship id must be passed so as to retrieve the relationship.');
      });
    });
    context('when passing valid arguments', () => {
      context('but there is no relationship', () => {
        it('returns null', () => {
          expect(new JDLRelationships().get(RelationshipTypes.ONE_TO_MANY, 42)).to.be.undefined;
        });
      });
      context('for an existing relationship', () => {
        let relationships = null;
        let relationship = null;

        before(() => {
          relationships = new JDLRelationships();
          relationship = new JDLRelationship({
            from: 'Abc',
            to: 'Abc2',
            injectedFieldInFrom: 'something',
            type: RelationshipTypes.ONE_TO_ONE
          });
          relationships.add(relationship);
        });

        it('returns it', () => {
          expect(relationships.get(relationship.type, relationship.getId())).to.deep.equal(relationship);
        });
      });
    });
  });
  describe('#getOneToOne', () => {
    context('when passing an invalid id', () => {
      it('fails', () => {
        expect(() => {
          new JDLRelationships().getOneToOne();
        }).to.throw('A relationship id must be passed so as to retrieve the relationship.');
      });
    });
    context('when passing valid arguments', () => {
      context('but there is no relationship', () => {
        it('returns null', () => {
          expect(new JDLRelationships().getOneToOne(42)).to.be.undefined;
        });
      });
      context('for an existing relationship', () => {
        let relationships = null;
        let relationship = null;

        before(() => {
          relationships = new JDLRelationships();
          relationship = new JDLRelationship({
            from: 'Abc',
            to: 'Abc2',
            injectedFieldInFrom: 'something',
            type: RelationshipTypes.ONE_TO_ONE
          });
          relationships.add(relationship);
        });

        it('returns it', () => {
          expect(relationships.getOneToOne(relationship.getId())).to.deep.equal(relationship);
        });
      });
    });
  });
  describe('#getOneToMany', () => {
    context('when passing an invalid id', () => {
      it('fails', () => {
        expect(() => {
          new JDLRelationships().getOneToMany();
        }).to.throw('A relationship id must be passed so as to retrieve the relationship.');
      });
    });
    context('when passing valid arguments', () => {
      context('but there is no relationship', () => {
        it('returns null', () => {
          expect(new JDLRelationships().getOneToMany(42)).to.be.undefined;
        });
      });
      context('for an existing relationship', () => {
        let relationships = null;
        let relationship = null;

        before(() => {
          relationships = new JDLRelationships();
          relationship = new JDLRelationship({
            from: 'Abc',
            to: 'Abc2',
            injectedFieldInFrom: 'something',
            type: RelationshipTypes.ONE_TO_MANY
          });
          relationships.add(relationship);
        });

        it('returns it', () => {
          expect(relationships.getOneToMany(relationship.getId())).to.deep.equal(relationship);
        });
      });
    });
  });
  describe('#getManyToOne', () => {
    context('when passing an invalid id', () => {
      it('fails', () => {
        expect(() => {
          new JDLRelationships().getManyToOne();
        }).to.throw('A relationship id must be passed so as to retrieve the relationship.');
      });
    });
    context('when passing valid arguments', () => {
      context('but there is no relationship', () => {
        it('returns null', () => {
          expect(new JDLRelationships().getManyToOne(42)).to.be.undefined;
        });
      });
      context('for an existing relationship', () => {
        let relationships = null;
        let relationship = null;

        before(() => {
          relationships = new JDLRelationships();
          relationship = new JDLRelationship({
            from: 'Abc',
            to: 'Abc2',
            injectedFieldInFrom: 'something',
            type: RelationshipTypes.MANY_TO_ONE
          });
          relationships.add(relationship);
        });

        it('returns it', () => {
          expect(relationships.getManyToOne(relationship.getId())).to.deep.equal(relationship);
        });
      });
    });
  });
  describe('#getManyToMany', () => {
    context('when passing an invalid id', () => {
      it('fails', () => {
        expect(() => {
          new JDLRelationships().getManyToMany();
        }).to.throw('A relationship id must be passed so as to retrieve the relationship.');
      });
    });
    context('when passing valid arguments', () => {
      context('but there is no relationship', () => {
        it('returns null', () => {
          expect(new JDLRelationships().getManyToMany(42)).to.be.undefined;
        });
      });
      context('for an existing relationship', () => {
        let relationships = null;
        let relationship = null;

        before(() => {
          relationships = new JDLRelationships();
          relationship = new JDLRelationship({
            from: 'Abc',
            to: 'Abc2',
            injectedFieldInFrom: 'something',
            type: RelationshipTypes.MANY_TO_MANY
          });
          relationships.add(relationship);
        });

        it('returns it', () => {
          expect(relationships.getManyToMany(relationship.getId())).to.deep.equal(relationship);
        });
      });
    });
  });
  describe('#toArray', () => {
    let relationships = null;
    let relationship1 = null;
    let relationship2 = null;
    let array = [];

    before(() => {
      relationships = new JDLRelationships();
      relationship1 = new JDLRelationship({
        from: 'Abc',
        to: 'Abc2',
        injectedFieldInFrom: 'something',
        type: RelationshipTypes.ONE_TO_ONE
      });
      relationship2 = new JDLRelationship({
        from: 'Abc2',
        to: 'Abc3',
        injectedFieldInFrom: 'somethingElse',
        type: RelationshipTypes.ONE_TO_ONE
      });
      relationships.add(relationship1);
      relationships.add(relationship2);
      array = relationships.toArray();
    });

    it('returns the list of each relationship', () => {
      expect(array).to.deep.eq([relationship1, relationship2]);
    });
  });
  describe('#oneToOneQuantity', () => {
    context('when there is no OtO relationship', () => {
      it('returns 0', () => {
        expect(new JDLRelationships().oneToOneQuantity()).to.equal(0);
      });
    });
    context('when there are OtO relationships', () => {
      let relationships = null;

      before(() => {
        relationships = new JDLRelationships();
        relationships.add(
          new JDLRelationship({
            from: 'Abc',
            to: 'Abc2',
            injectedFieldInFrom: 'something',
            type: RelationshipTypes.ONE_TO_ONE
          })
        );
      });

      it('returns the size', () => {
        expect(relationships.oneToOneQuantity()).to.equal(1);
      });
    });
  });
  describe('#oneToManyQuantity', () => {
    context('when there is no OtM relationship', () => {
      it('returns 0', () => {
        expect(new JDLRelationships().oneToManyQuantity()).to.equal(0);
      });
    });
    context('when there are OtM relationships', () => {
      let relationships = null;

      before(() => {
        relationships = new JDLRelationships();
        relationships.add(
          new JDLRelationship({
            from: 'Abc',
            to: 'Abc2',
            injectedFieldInFrom: 'something',
            type: RelationshipTypes.ONE_TO_MANY
          })
        );
      });

      it('returns the size', () => {
        expect(relationships.oneToManyQuantity()).to.equal(1);
      });
    });
  });
  describe('#manyToOneQuantity', () => {
    context('when there is no MtO relationship', () => {
      it('returns 0', () => {
        expect(new JDLRelationships().manyToOneQuantity()).to.equal(0);
      });
    });
    context('when there are MtO relationships', () => {
      let relationships = null;

      before(() => {
        relationships = new JDLRelationships();
        relationships.add(
          new JDLRelationship({
            from: 'Abc',
            to: 'Abc2',
            injectedFieldInFrom: 'something',
            type: RelationshipTypes.MANY_TO_ONE
          })
        );
      });

      it('returns the size', () => {
        expect(relationships.manyToOneQuantity()).to.equal(1);
      });
    });
  });
  describe('#manyToManyQuantity', () => {
    context('when there is no OtO relationship', () => {
      it('returns 0', () => {
        expect(new JDLRelationships().manyToManyQuantity()).to.equal(0);
      });
    });
    context('when there are OtO relationships', () => {
      let relationships = null;

      before(() => {
        relationships = new JDLRelationships();
        relationships.add(
          new JDLRelationship({
            from: 'Abc',
            to: 'Abc2',
            injectedFieldInFrom: 'something',
            type: RelationshipTypes.MANY_TO_MANY
          })
        );
      });

      it('returns the size', () => {
        expect(relationships.manyToManyQuantity()).to.equal(1);
      });
    });
  });
  describe('#size', () => {
    let relationships = null;

    before(() => {
      relationships = new JDLRelationships();
    });

    it('returns the number of relationships', () => {
      expect(relationships.size()).to.equal(0);
      relationships.add(
        new JDLRelationship({
          from: 'Abc',
          to: 'Abc2',
          injectedFieldInFrom: 'something',
          type: RelationshipTypes.ONE_TO_ONE
        })
      );
      expect(relationships.size()).to.equal(1);
    });
  });
  describe('#forEach', () => {
    let jdlRelationships;

    before(() => {
      jdlRelationships = new JDLRelationships();
    });

    context('when not passing a function', () => {
      it('does not fail', () => {
        jdlRelationships.forEach();
      });
    });
    context('when passing a function', () => {
      const result = [];

      before(() => {
        jdlRelationships.add(
          new JDLRelationship({
            from: 'Abc',
            to: 'Abc2',
            injectedFieldInFrom: 'something',
            type: RelationshipTypes.ONE_TO_MANY
          })
        );
        jdlRelationships.add(
          new JDLRelationship({
            from: 'Abc',
            to: 'Abc2',
            injectedFieldInFrom: 'something',
            type: RelationshipTypes.ONE_TO_ONE
          })
        );
        jdlRelationships.forEach(jdlRelationship => {
          result.push({ from: jdlRelationship.from, to: jdlRelationship.to, type: jdlRelationship.type });
        });
      });

      it('uses each relationship', () => {
        expect(result).to.deep.equal([
          {
            from: 'Abc',
            to: 'Abc2',
            type: 'OneToOne'
          },
          {
            from: 'Abc',
            to: 'Abc2',
            type: 'OneToMany'
          }
        ]);
      });
    });
  });
  describe('#toString', () => {
    context('when there is no relationship', () => {
      it('returns an emptry string', () => {
        expect(new JDLRelationships().toString()).to.equal('');
      });
    });
    context('when having one relationship per type', () => {
      let relationships = null;
      let oneToOneRelationship = null;
      let oneToManyRelationship = null;

      before(() => {
        relationships = new JDLRelationships();
        oneToOneRelationship = new JDLRelationship({
          from: 'Abc',
          to: 'Abc2',
          injectedFieldInFrom: 'something',
          type: RelationshipTypes.ONE_TO_ONE
        });
        oneToManyRelationship = new JDLRelationship({
          from: 'Abc',
          to: 'Abc2',
          injectedFieldInTo: 'somethingElse',
          type: RelationshipTypes.ONE_TO_MANY
        });
        relationships.add(oneToOneRelationship);
        relationships.add(oneToManyRelationship);
      });

      it('uses the standard string form', () => {
        expect(relationships.toString()).to.eq(`relationship ${oneToOneRelationship.type} {
  ${oneToOneRelationship.from}{${oneToOneRelationship.injectedFieldInFrom}} to ${oneToOneRelationship.to}
}
relationship ${oneToManyRelationship.type} {
  ${oneToManyRelationship.from} to ${oneToManyRelationship.to}{${oneToManyRelationship.injectedFieldInTo}}
}`);
      });
    });
    context('when having more than one relationship per type', () => {
      let relationships = null;
      let oneToOneRelationship1 = null;
      let oneToOneRelationship2 = null;

      before(() => {
        relationships = new JDLRelationships();
        oneToOneRelationship1 = new JDLRelationship({
          from: 'Abc',
          to: 'Abc2',
          injectedFieldInFrom: 'something',
          type: RelationshipTypes.ONE_TO_ONE
        });
        oneToOneRelationship2 = new JDLRelationship({
          from: 'Abc2',
          to: 'Abc3',
          injectedFieldInTo: 'somethingElse',
          type: RelationshipTypes.ONE_TO_ONE
        });
        relationships.add(oneToOneRelationship1);
        relationships.add(oneToOneRelationship2);
      });

      it('uses the new string form', () => {
        expect(relationships.toString()).to.eq(`relationship ${oneToOneRelationship1.type} {
  ${oneToOneRelationship1.from}{${oneToOneRelationship1.injectedFieldInFrom}} to ${oneToOneRelationship1.to},
  ${oneToOneRelationship2.from} to ${oneToOneRelationship2.to}{${oneToOneRelationship2.injectedFieldInTo}}
}`);
      });
    });
  });
});
