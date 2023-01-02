/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* eslint-disable no-new, no-unused-expressions */
import { expect } from 'chai';

import JDLRelationship from '../../../jdl/models/jdl-relationship.js';
import { relationshipTypes, relationshipOptions } from '../../../jdl/jhipster/index.mjs';

const { JPA_DERIVED_IDENTIFIER } = relationshipOptions;

describe('JDLRelationship', () => {
  describe('new', () => {
    context('when not passing at least one injected field', () => {
      it('should fail', () => {
        expect(() => {
          new JDLRelationship({
            from: 'Abc',
            to: 'Abc2',
            type: relationshipTypes.MANY_TO_MANY,
          });
        }).to.throw('A valid type and at least one injected field must be passed to create a relationship.');
      });
    });
    context('when passing an invalid type', () => {
      it('should fail', () => {
        expect(() => {
          new JDLRelationship({
            from: 'Abc',
            to: 'Abc2',
            injectedFieldInFrom: 'something',
            type: 'WRONG_TYPE',
          });
        }).to.throw('A valid type and at least one injected field must be passed to create a relationship.');
      });
    });
    context('when passing valid args', () => {
      let relationship;

      before(() => {
        relationship = new JDLRelationship({
          from: 'Abc',
          to: 'Abc2',
          injectedFieldInFrom: 'something',
          type: relationshipTypes.ONE_TO_ONE,
        });
      });

      it('should create the relationship', () => {
        expect(relationship.to).to.equal('Abc2');
        expect(relationship.from).to.equal('Abc');
        expect(relationship.injectedFieldInFrom).to.equal('something');
        expect(relationship.type).to.equal(relationshipTypes.ONE_TO_ONE);
      });
    });
    context('when passing an unidirectional one-to-many relationship', () => {
      context('and disabling the conversion to a bidirectional relationship', () => {
        let relationship;

        before(() => {
          relationship = new JDLRelationship({
            from: 'Abc',
            to: 'Abc2',
            injectedFieldInFrom: 'something',
            type: relationshipTypes.ONE_TO_MANY,
            unidirectionalRelationships: true,
          });
        });

        it('should not create a bidirectional relationship', () => {
          expect(relationship.injectedFieldInTo).to.be.null;
        });
      });
    });
    context('when passing an unidirectional many-to-one relationship', () => {
      context('and disabling the conversion to a bidirectional relationship', () => {
        let relationship;

        before(() => {
          relationship = new JDLRelationship({
            from: 'Abc',
            to: 'Abc2',
            injectedFieldInFrom: 'something',
            type: relationshipTypes.MANY_TO_ONE,
            unidirectionalRelationships: true,
          });
        });

        it('should not create a bidirectional relationship', () => {
          expect(relationship.injectedFieldInTo).to.be.null;
        });
      });
    });
    context('when passing an unidirectional many-to-one relationship', () => {
      context('and disabling the conversion to a bidirectional relationship', () => {
        let relationship;

        before(() => {
          relationship = new JDLRelationship({
            from: 'Abc',
            to: 'Abc2',
            injectedFieldInFrom: 'something',
            type: relationshipTypes.ONE_TO_ONE,
            unidirectionalRelationships: true,
          });
        });

        it('should not create a bidirectional relationship', () => {
          expect(relationship.injectedFieldInTo).to.be.null;
        });
      });
    });
    context('when passing an unidirectional many-to-one relationship', () => {
      context('and disabling the conversion to a bidirectional relationship', () => {
        let relationship;

        before(() => {
          relationship = new JDLRelationship({
            from: 'Abc',
            to: 'Abc2',
            injectedFieldInFrom: 'something',
            type: relationshipTypes.MANY_TO_MANY,
            unidirectionalRelationships: true,
          });
        });

        it('should not create a bidirectional relationship', () => {
          expect(relationship.injectedFieldInTo).to.be.null;
        });
      });
    });
  });
  describe('getId', () => {
    let relationship;

    before(() => {
      relationship = new JDLRelationship({
        from: 'A',
        to: 'B',
        type: relationshipTypes.ONE_TO_ONE,
        injectedFieldInFrom: 'b',
      });
    });

    it('should return an unique representation of the relationship', () => {
      expect(relationship.getId()).to.equal(
        `${relationship.type}_${relationship.from}{${relationship.injectedFieldInFrom}}_${relationship.to}`
      );
    });
  });
  describe('hasGlobalOption', () => {
    let relationship;

    before(() => {
      relationship = new JDLRelationship({
        from: 'A',
        to: 'B',
        injectedFieldInTo: 'a',
        type: relationshipTypes.ONE_TO_ONE,
        options: {
          global: { [JPA_DERIVED_IDENTIFIER]: true },
          destination: {},
          source: {},
        },
      });
    });

    context('when the option does not exist', () => {
      it('should return false', () => {
        expect(relationship.hasGlobalOption('toto')).to.be.false;
      });
    });
    context('when the option exists', () => {
      it('should return true', () => {
        expect(relationship.hasGlobalOption(JPA_DERIVED_IDENTIFIER)).to.be.true;
      });
    });
  });
  describe('forEachGlobalOption', () => {
    let relationship;
    let options;

    before(() => {
      options = { global: { custom: 1, anotherCustom: 42 } };
      relationship = new JDLRelationship({
        from: 'A',
        to: 'B',
        injectedFieldInTo: 'a',
        type: relationshipTypes.ONE_TO_ONE,
        options,
      });
    });

    it('should loop over the function for each element', () => {
      relationship.forEachGlobalOption((optionName, optionValue) => {
        expect(optionValue).to.equal(options.global[optionName]);
      });
    });
  });
  describe('toString', () => {
    context('without any comment', () => {
      let relationship;

      before(() => {
        relationship = new JDLRelationship({
          from: 'A',
          to: 'B',
          type: relationshipTypes.ONE_TO_ONE,
          injectedFieldInFrom: 'b',
        });
      });

      it('should stringify the relationship', () => {
        expect(relationship.toString()).to.equal(
          `relationship ${relationship.type} {
  ${relationship.from}{${relationship.injectedFieldInFrom}} to ${relationship.to}
}`
        );
      });
    });
    context('with comments for both sides', () => {
      let relationship;

      before(() => {
        relationship = new JDLRelationship({
          from: 'A',
          to: 'B',
          type: relationshipTypes.ONE_TO_ONE,
          injectedFieldInFrom: 'b',
          commentInFrom: 'Some comment.',
          commentInTo: 'Some other comment.',
        });
      });

      it('should stringify the relationship', () => {
        expect(relationship.toString()).to.equal(
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
      let relationship;

      before(() => {
        relationship = new JDLRelationship({
          from: 'A',
          to: 'B',
          type: relationshipTypes.ONE_TO_ONE,
          injectedFieldInFrom: 'b',
          commentInFrom: 'Some comment.',
        });
      });

      it('should stringify the relationship', () => {
        expect(relationship.toString()).to.equal(
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
      let relationship;

      before(() => {
        relationship = new JDLRelationship({
          from: 'A',
          to: 'B',
          type: relationshipTypes.ONE_TO_ONE,
          injectedFieldInFrom: 'b',
          commentInTo: 'Some other comment.',
        });
      });

      it('should stringify the relationship', () => {
        expect(relationship.toString()).to.equal(
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
      let relationship;

      before(() => {
        relationship = new JDLRelationship({
          from: 'A',
          to: 'B',
          type: relationshipTypes.ONE_TO_ONE,
          injectedFieldInFrom: 'b',
        });
      });

      it('should stringify the relationship', () => {
        expect(relationship.toString()).to.equal(
          `relationship ${relationship.type} {
  ${relationship.from}{${relationship.injectedFieldInFrom}} to ${relationship.to}
}`
        );
      });
    });
    context('with both injected fields', () => {
      let relationship;

      before(() => {
        relationship = new JDLRelationship({
          from: 'A',
          to: 'B',
          type: relationshipTypes.ONE_TO_ONE,
          injectedFieldInFrom: 'b',
          injectedFieldInTo: 'a(id)',
        });
      });

      it('should stringify the relationship', () => {
        expect(relationship.toString()).to.equal(
          `relationship ${relationship.type} {
  ${relationship.from}{${relationship.injectedFieldInFrom}} to ${relationship.to}{${relationship.injectedFieldInTo}}
}`
        );
      });
    });
    context('with options', () => {
      context('being global', () => {
        let relationship;

        before(() => {
          relationship = new JDLRelationship({
            from: 'A',
            to: 'B',
            type: relationshipTypes.ONE_TO_ONE,
            injectedFieldInFrom: 'b',
            injectedFieldInTo: 'a',
            options: {
              global: { [JPA_DERIVED_IDENTIFIER]: true },
              source: {},
              destination: {},
            },
          });
        });

        it('should add them', () => {
          expect(relationship.toString()).to.equal(
            `relationship ${relationship.type} {
  ${relationship.from}{${relationship.injectedFieldInFrom}} to ${relationship.to}{` +
              `${relationship.injectedFieldInTo}} with ${JPA_DERIVED_IDENTIFIER}
}`
          );
        });
      });
      context('being global, on the source and on the destination', () => {
        let relationship;

        before(() => {
          relationship = new JDLRelationship({
            from: 'A',
            to: 'B',
            type: relationshipTypes.ONE_TO_ONE,
            injectedFieldInFrom: 'b',
            injectedFieldInTo: 'a',
            options: {
              global: { [JPA_DERIVED_IDENTIFIER]: true },
              source: { id: true },
              destination: { id: true, idGenerator: 'sequence' },
            },
          });
        });

        it('should add them', () => {
          expect(relationship.toString()).to.equal(
            `relationship ${relationship.type} {
  @id
  ${relationship.from}{${relationship.injectedFieldInFrom}} to
  @id
  @idGenerator(sequence)
  ${relationship.to}{${relationship.injectedFieldInTo}} with ${JPA_DERIVED_IDENTIFIER}
}`
          );
        });
      });
    });
  });
});
