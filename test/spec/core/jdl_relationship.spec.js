/**
 * Copyright 2013-2019 the original author or authors from the JHipster project.
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
const { JPA_DERIVED_IDENTIFIER } = require('../../../lib/core/jhipster/relationship_options');
const RelationshipTypes = require('../../../lib/core/jhipster/relationship_types');

describe('JDLRelationship', () => {
  describe('::new', () => {
    context('when not passing at least one injected field', () => {
      it('fails', () => {
        expect(() => {
          new JDLRelationship({
            from: 'Abc',
            to: 'Abc2',
            type: RelationshipTypes.MANY_TO_MANY
          });
        }).to.throw('A valid type and at least one injected field must be passed to create a relationship.');
      });
    });
    context('when passing an invalid type', () => {
      it('fails', () => {
        expect(() => {
          new JDLRelationship({
            from: 'Abc',
            to: 'Abc2',
            injectedFieldInFrom: 'something',
            type: 'WRONG_TYPE'
          });
        }).to.throw('A valid type and at least one injected field must be passed to create a relationship.');
      });
    });
    context('when passing valid args', () => {
      let relationship = null;

      before(() => {
        relationship = new JDLRelationship({
          from: 'Abc',
          to: 'Abc2',
          injectedFieldInFrom: 'something',
          type: RelationshipTypes.ONE_TO_ONE
        });
      });

      it('succeeds', () => {
        expect(relationship.to).to.eq('Abc2');
        expect(relationship.from).to.eq('Abc');
        expect(relationship.injectedFieldInFrom).to.eq('something');
        expect(relationship.type).to.eq(RelationshipTypes.ONE_TO_ONE);
      });
    });
  });
  describe('#getId', () => {
    let relationship = null;

    before(() => {
      relationship = new JDLRelationship({
        from: 'A',
        to: 'B',
        type: RelationshipTypes.ONE_TO_ONE,
        injectedFieldInFrom: 'b'
      });
    });

    it('returns an unique representation of the relationship', () => {
      expect(relationship.getId()).to.eq(
        `${relationship.type}_${relationship.from}{${relationship.injectedFieldInFrom}}_${relationship.to}`
      );
    });
  });
  describe('#hasOption', () => {
    let relationship;

    before(() => {
      relationship = new JDLRelationship({
        from: 'A',
        to: 'B',
        injectedFieldInTo: 'a',
        type: RelationshipTypes.ONE_TO_ONE,
        options: { [JPA_DERIVED_IDENTIFIER]: true }
      });
    });

    context('when the option does not exist', () => {
      it('returns false', () => {
        expect(relationship.hasOption('toto')).to.be.false;
      });
    });
    context('when the option exists', () => {
      it('returns true', () => {
        expect(relationship.hasOption(JPA_DERIVED_IDENTIFIER)).to.be.true;
      });
    });
  });
  describe('#forEachOption', () => {
    let relationship;

    before(() => {
      relationship = new JDLRelationship({
        from: 'A',
        to: 'B',
        injectedFieldInTo: 'a',
        type: RelationshipTypes.ONE_TO_ONE,
        options: { 1: 1, 2: 2, 3: 3 }
      });
    });

    it('executes the function for each element', () => {
      let i = 1;
      relationship.forEachOption(option => {
        expect(option).to.equal(i);
        i++;
      });
    });
  });
  describe('#toString', () => {
    context('without any comment', () => {
      let relationship = null;

      before(() => {
        relationship = new JDLRelationship({
          from: 'A',
          to: 'B',
          type: RelationshipTypes.ONE_TO_ONE,
          injectedFieldInFrom: 'b'
        });
      });

      it('stringifies the relationship', () => {
        expect(relationship.toString()).to.eq(
          `relationship ${relationship.type} {
  ${relationship.from}{${relationship.injectedFieldInFrom}} to ${relationship.to}
}`
        );
      });
    });
    context('with comments for both sides', () => {
      let relationship = null;

      before(() => {
        relationship = new JDLRelationship({
          from: 'A',
          to: 'B',
          type: RelationshipTypes.ONE_TO_ONE,
          injectedFieldInFrom: 'b',
          commentInFrom: 'Some comment.',
          commentInTo: 'Some other comment.'
        });
      });

      it('stringifies the relationship', () => {
        expect(relationship.toString()).to.eq(
          `relationship ${relationship.type} {
  /**
   * ${relationship.commentInFrom}
   */
  ${relationship.from}{${relationship.injectedFieldInFrom}} to
  /**
   * ${relationship.commentInTo}
   */
  ${relationship.to}
}`
        );
      });
    });
    context('with a comment for the source side', () => {
      let relationship = null;

      before(() => {
        relationship = new JDLRelationship({
          from: 'A',
          to: 'B',
          type: RelationshipTypes.ONE_TO_ONE,
          injectedFieldInFrom: 'b',
          commentInFrom: 'Some comment.'
        });
      });

      it('stringifies the relationship', () => {
        expect(relationship.toString()).to.eq(
          `relationship ${relationship.type} {
  /**
   * ${relationship.commentInFrom}
   */
  ${relationship.from}{${relationship.injectedFieldInFrom}} to ${relationship.to}
}`
        );
      });
    });
    context('with a comment for the destination side', () => {
      let relationship = null;

      before(() => {
        relationship = new JDLRelationship({
          from: 'A',
          to: 'B',
          type: RelationshipTypes.ONE_TO_ONE,
          injectedFieldInFrom: 'b',
          commentInTo: 'Some other comment.'
        });
      });

      it('stringifies the relationship', () => {
        expect(relationship.toString()).to.eq(
          `relationship ${relationship.type} {
  ${relationship.from}{${relationship.injectedFieldInFrom}} to
  /**
   * ${relationship.commentInTo}
   */
  ${relationship.to}
}`
        );
      });
    });
    context('with only one injected field', () => {
      let relationship = null;

      before(() => {
        relationship = new JDLRelationship({
          from: 'A',
          to: 'B',
          type: RelationshipTypes.ONE_TO_ONE,
          injectedFieldInFrom: 'b'
        });
      });

      it('stringifies the relationship', () => {
        expect(relationship.toString()).to.eq(
          `relationship ${relationship.type} {
  ${relationship.from}{${relationship.injectedFieldInFrom}} to ${relationship.to}
}`
        );
      });
    });
    context('with both injected fields', () => {
      let relationship = null;

      before(() => {
        relationship = new JDLRelationship({
          from: 'A',
          to: 'B',
          type: RelationshipTypes.ONE_TO_ONE,
          injectedFieldInFrom: 'b',
          injectedFieldInTo: 'a(id)'
        });
      });

      it('stringifies the relationship', () => {
        expect(relationship.toString()).to.eq(
          `relationship ${relationship.type} {
  ${relationship.from}{${relationship.injectedFieldInFrom}} to ${relationship.to}{${relationship.injectedFieldInTo}}
}`
        );
      });
    });
    context('with options', () => {
      let relationship = null;

      before(() => {
        relationship = new JDLRelationship({
          from: 'A',
          to: 'B',
          type: RelationshipTypes.ONE_TO_ONE,
          injectedFieldInFrom: 'b',
          injectedFieldInTo: 'a',
          options: { [JPA_DERIVED_IDENTIFIER]: true }
        });
      });

      it('adds them', () => {
        expect(relationship.toString()).to.equal(
          `relationship ${relationship.type} {
  ${relationship.from}{${relationship.injectedFieldInFrom}} to ${relationship.to}{` +
            `${relationship.injectedFieldInTo}} with ${JPA_DERIVED_IDENTIFIER}
}`
        );
      });
    });
  });
});
