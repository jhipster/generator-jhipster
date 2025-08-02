/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
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

import { before, describe, it } from 'esmocha';

import { expect } from 'chai';

import { relationshipTypes } from '../basic-types/index.ts';
import { relationshipOptions } from '../built-in-options/index.ts';

import JDLRelationship from './jdl-relationship.ts';

const { BUILT_IN_ENTITY } = relationshipOptions;

describe('jdl - JDLRelationship', () => {
  describe('new', () => {
    describe('when not passing at least one injected field', () => {
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
    describe('when passing an invalid type', () => {
      it('should fail', () => {
        expect(() => {
          new JDLRelationship({
            from: 'Abc',
            to: 'Abc2',
            injectedFieldInFrom: 'something',
            // @ts-expect-error
            type: 'WRONG_TYPE',
          });
        }).to.throw('A valid type and at least one injected field must be passed to create a relationship.');
      });
    });
    describe('when passing valid args', () => {
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
    describe('when passing an unidirectional one-to-many relationship', () => {
      describe('and disabling the conversion to a bidirectional relationship', () => {
        let relationship;

        before(() => {
          relationship = new JDLRelationship({
            from: 'Abc',
            to: 'Abc2',
            injectedFieldInFrom: 'something',
            type: relationshipTypes.ONE_TO_MANY,
          });
        });

        it('should not create a bidirectional relationship', () => {
          expect(relationship.injectedFieldInTo).to.be.null;
        });
      });
    });
    describe('when passing an unidirectional many-to-one relationship', () => {
      describe('and disabling the conversion to a bidirectional relationship', () => {
        let relationship;

        before(() => {
          relationship = new JDLRelationship({
            from: 'Abc',
            to: 'Abc2',
            injectedFieldInFrom: 'something',
            type: relationshipTypes.MANY_TO_ONE,
          });
        });

        it('should not create a bidirectional relationship', () => {
          expect(relationship.injectedFieldInTo).to.be.null;
        });
      });
    });
    describe('when passing an unidirectional many-to-one relationship', () => {
      describe('and disabling the conversion to a bidirectional relationship', () => {
        let relationship;

        before(() => {
          relationship = new JDLRelationship({
            from: 'Abc',
            to: 'Abc2',
            injectedFieldInFrom: 'something',
            type: relationshipTypes.ONE_TO_ONE,
          });
        });

        it('should not create a bidirectional relationship', () => {
          expect(relationship.injectedFieldInTo).to.be.null;
        });
      });
    });
    describe('when passing an unidirectional many-to-one relationship', () => {
      describe('and disabling the conversion to a bidirectional relationship', () => {
        let relationship;

        before(() => {
          relationship = new JDLRelationship({
            from: 'Abc',
            to: 'Abc2',
            injectedFieldInFrom: 'something',
            type: relationshipTypes.MANY_TO_MANY,
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
        `${relationship.type}_${relationship.from}{${relationship.injectedFieldInFrom}}_${relationship.to}`,
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
          global: { [BUILT_IN_ENTITY]: true },
          destination: {},
          source: {},
        },
      });
    });

    describe('when the option does not exist', () => {
      it('should return false', () => {
        expect(relationship.hasGlobalOption('toto')).to.be.false;
      });
    });
    describe('when the option exists', () => {
      it('should return true', () => {
        expect(relationship.hasGlobalOption(BUILT_IN_ENTITY)).to.be.true;
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
    describe('without any comment', () => {
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
}`,
        );
      });
    });
    describe('with comments for both sides', () => {
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
}`,
        );
      });
    });
    describe('with a comment for the source side', () => {
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
}`,
        );
      });
    });
    describe('with a comment for the destination side', () => {
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
}`,
        );
      });
    });
    describe('with only one injected field', () => {
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
}`,
        );
      });
    });
    describe('with both injected fields', () => {
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
}`,
        );
      });
    });
    describe('with options', () => {
      describe('being global', () => {
        let relationship;

        before(() => {
          relationship = new JDLRelationship({
            from: 'A',
            to: 'B',
            type: relationshipTypes.ONE_TO_ONE,
            injectedFieldInFrom: 'b',
            injectedFieldInTo: 'a',
            options: {
              global: { [BUILT_IN_ENTITY]: true },
              source: {},
              destination: {},
            },
          });
        });

        it('should add them', () => {
          expect(relationship.toString()).to.equal(
            `relationship ${relationship.type} {
  ${relationship.from}{${relationship.injectedFieldInFrom}} to ${relationship.to}{` +
              `${relationship.injectedFieldInTo}} with ${BUILT_IN_ENTITY}
}`,
          );
        });
      });
      describe('being global, on the source and on the destination', () => {
        let relationship;

        before(() => {
          relationship = new JDLRelationship({
            from: 'A',
            to: 'B',
            type: relationshipTypes.ONE_TO_ONE,
            injectedFieldInFrom: 'b',
            injectedFieldInTo: 'a',
            options: {
              global: { [BUILT_IN_ENTITY]: true },
              source: { id: true },
              destination: { id: true, idGenerator: 'sequence' },
            },
          });
        });

        it('should add them', () => {
          expect(relationship.toString()).to.equal(
            `relationship ${relationship.type} {
  @Id ${relationship.from}{${relationship.injectedFieldInFrom}} to @Id @IdGenerator(sequence) ${relationship.to}{${relationship.injectedFieldInTo}} with ${BUILT_IN_ENTITY}
}`,
          );
        });
      });
    });
  });
});
