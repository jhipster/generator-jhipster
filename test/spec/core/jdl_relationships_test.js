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
const expect = require('chai').expect;

const fail = expect.fail;
const JDLEntity = require('../../../lib/core/jdl_entity');
const JDLRelationship = require('../../../lib/core/jdl_relationship');
const RelationshipTypes = require('../../../lib/core/jhipster/relationship_types').RelationshipTypes;
const JDLRelationships = require('../../../lib/core/jdl_relationships');

describe('JDLRelationships', () => {
  describe('#add', () => {
    context('when passing an invalid relationship', () => {
      context('because it is nil', () => {
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
      context('because it is invalid', () => {
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
    context('when passing a valid relationship', () => {
      let relationships = null;

      before(() => {
        relationships = new JDLRelationships();
        relationships.add(new JDLRelationship({
          from: new JDLEntity({
            name: 'Abc'
          }),
          to: new JDLEntity({
            name: 'Abc2'
          }),
          injectedFieldInFrom: 'something',
          type: RelationshipTypes.ONE_TO_ONE
        }));
        relationships.add(new JDLRelationship({
          from: new JDLEntity({
            name: 'Abc2'
          }),
          to: new JDLEntity({
            name: 'Abc3'
          }),
          injectedFieldInFrom: 'somethingElse',
          type: RelationshipTypes.ONE_TO_ONE
        }));
      });

      it('succeeds', () => {
        expect(relationships.size()).to.eq(2);
        expect(Object.keys(relationships.relationships.OneToOne).length).to.eq(2);
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
        from: new JDLEntity({
          name: 'Abc'
        }),
        to: new JDLEntity({
          name: 'Abc2'
        }),
        injectedFieldInFrom: 'something',
        type: RelationshipTypes.ONE_TO_ONE
      });
      relationship2 = new JDLRelationship({
        from: new JDLEntity({
          name: 'Abc2'
        }),
        to: new JDLEntity({
          name: 'Abc3'
        }),
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
  describe('#size', () => {
    let relationships = null;

    before(() => {
      relationships = new JDLRelationships();
    });

    it('returns the number of relationships', () => {
      expect(relationships.size()).to.equal(0);
      relationships.add(new JDLRelationship({
        from: new JDLEntity({
          name: 'Abc'
        }),
        to: new JDLEntity({
          name: 'Abc2'
        }),
        injectedFieldInFrom: 'something',
        type: RelationshipTypes.ONE_TO_ONE
      }));
      expect(relationships.size()).to.equal(1);
    });
  });
  describe('#toString', () => {
    context('when having one relationship per type', () => {
      let relationships = null;
      let oneToOneRelationship = null;
      let oneToManyRelationship = null;

      before(() => {
        relationships = new JDLRelationships();
        oneToOneRelationship = new JDLRelationship({
          from: new JDLEntity({
            name: 'Abc'
          }),
          to: new JDLEntity({
            name: 'Abc2'
          }),
          injectedFieldInFrom: 'something',
          type: RelationshipTypes.ONE_TO_ONE
        });
        oneToManyRelationship = new JDLRelationship({
          from: new JDLEntity({
            name: 'Abc'
          }),
          to: new JDLEntity({
            name: 'Abc2'
          }),
          injectedFieldInTo: 'somethingElse',
          type: RelationshipTypes.ONE_TO_MANY
        });
        relationships.add(oneToOneRelationship);
        relationships.add(oneToManyRelationship);
      });

      it('uses the standard string form', () => {
        expect(relationships.toString()).to.eq(`relationship ${oneToOneRelationship.type} {
  ${oneToOneRelationship.from.name}{${oneToOneRelationship.injectedFieldInFrom}} to ${oneToOneRelationship.to.name}
}
relationship ${oneToManyRelationship.type} {
  ${oneToManyRelationship.from.name} to ${oneToManyRelationship.to.name}{${oneToManyRelationship.injectedFieldInTo}}
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
          from: new JDLEntity({
            name: 'Abc'
          }),
          to: new JDLEntity({
            name: 'Abc2'
          }),
          injectedFieldInFrom: 'something',
          type: RelationshipTypes.ONE_TO_ONE
        });
        oneToOneRelationship2 = new JDLRelationship({
          from: new JDLEntity({
            name: 'Abc2'
          }),
          to: new JDLEntity({
            name: 'Abc3'
          }),
          injectedFieldInTo: 'somethingElse',
          type: RelationshipTypes.ONE_TO_ONE
        });
        relationships.add(oneToOneRelationship1);
        relationships.add(oneToOneRelationship2);
      });

      it('uses the new string form', () => {
        expect(relationships.toString()).to.eq(`relationship ${oneToOneRelationship1.type} {
  ${oneToOneRelationship1.from.name}{${oneToOneRelationship1.injectedFieldInFrom}} to ${oneToOneRelationship1.to.name},
  ${oneToOneRelationship2.from.name} to ${oneToOneRelationship2.to.name}{${oneToOneRelationship2.injectedFieldInTo}}
}`);
      });
    });
  });
});
