/**
 * Copyright 2013-2026 the original author or authors from the JHipster project.
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

import { before, describe, expect as jestExpect, it } from 'esmocha';

import { expect } from 'chai';

import { relationshipTypes } from '../../core/basic-types/index.ts';
import { relationshipOptions } from '../../core/built-in-options/index.ts';
import JDLRelationship from '../../core/models/jdl-relationship.ts';

import { convert } from './jdl-to-json-relationship-converter.ts';

const { ONE_TO_ONE, MANY_TO_MANY, MANY_TO_ONE, ONE_TO_MANY } = relationshipTypes;
const { BUILT_IN_ENTITY } = relationshipOptions;

describe('jdl - JDLToJSONRelationshipConverter', () => {
  describe('convert', () => {
    describe('when not passing any relationship', () => {
      it('should return an empty map', () => {
        expect(convert([]).size).to.equal(0);
        expect(convert([], ['A', 'B']).size).to.equal(0);
      });
    });
    describe('when not passing any entity name', () => {
      it('should return an empty map', () => {
        expect(convert(undefined, []).size).to.equal(0);
        expect(convert([], []).size).to.equal(0);
      });
    });
    describe('when passing relationships and entity names', () => {
      describe('without options, required relationships or comments', () => {
        let relationshipsForA: ReturnType<typeof convert>['get'];
        let relationshipsForB: ReturnType<typeof convert>['get'];

        before(() => {
          const oneToOneRelationship = new JDLRelationship({
            from: 'A',
            to: 'B',
            type: ONE_TO_ONE,
            injectedFieldInTo: 'a',
            injectedFieldInFrom: 'b',
          });
          const oneToManyRelationship = new JDLRelationship({
            from: 'A',
            to: 'B',
            type: ONE_TO_MANY,
            injectedFieldInTo: 'a',
            injectedFieldInFrom: 'b',
          });
          const manyToOneRelationship = new JDLRelationship({
            from: 'A',
            to: 'B',
            type: MANY_TO_ONE,
            injectedFieldInTo: 'a',
            injectedFieldInFrom: 'b',
          });
          const manyToManyRelationship = new JDLRelationship({
            from: 'A',
            to: 'B',
            type: MANY_TO_MANY,
            injectedFieldInTo: 'a',
            injectedFieldInFrom: 'b',
          });
          const returned = convert(
            [oneToOneRelationship, oneToManyRelationship, manyToOneRelationship, manyToManyRelationship],
            ['A', 'B'],
          );
          relationshipsForA = returned.get('A');
          relationshipsForB = returned.get('B');
        });

        it('should convert them', () => {
          jestExpect(relationshipsForA).toMatchInlineSnapshot(`
            [
              {
                "otherEntityName": "b",
                "otherEntityRelationshipName": "a",
                "relationshipName": "b",
                "relationshipSide": "left",
                "relationshipType": "one-to-one",
              },
              {
                "otherEntityName": "b",
                "otherEntityRelationshipName": "a",
                "relationshipName": "b",
                "relationshipSide": "left",
                "relationshipType": "one-to-many",
              },
              {
                "otherEntityName": "b",
                "otherEntityRelationshipName": "a",
                "relationshipName": "b",
                "relationshipSide": "left",
                "relationshipType": "many-to-one",
              },
              {
                "otherEntityName": "b",
                "otherEntityRelationshipName": "a",
                "relationshipName": "b",
                "relationshipSide": "left",
                "relationshipType": "many-to-many",
              },
            ]
          `);
          jestExpect(relationshipsForB).toMatchInlineSnapshot(`
            [
              {
                "otherEntityName": "a",
                "otherEntityRelationshipName": "b",
                "relationshipName": "a",
                "relationshipSide": "right",
                "relationshipType": "one-to-one",
              },
              {
                "otherEntityName": "a",
                "otherEntityRelationshipName": "b",
                "relationshipName": "a",
                "relationshipSide": "right",
                "relationshipType": "many-to-one",
              },
              {
                "otherEntityName": "a",
                "otherEntityRelationshipName": "b",
                "relationshipName": "a",
                "relationshipSide": "right",
                "relationshipType": "one-to-many",
              },
              {
                "otherEntityName": "a",
                "otherEntityRelationshipName": "b",
                "relationshipName": "a",
                "relationshipSide": "right",
                "relationshipType": "many-to-many",
              },
            ]
          `);
        });
      });
      describe('with options', () => {
        describe('being custom options', () => {
          let convertedRelationship: ReturnType<typeof convert>['get'];

          before(() => {
            const oneToOneRelationship = new JDLRelationship({
              from: 'A',
              to: 'B',
              type: ONE_TO_ONE,
              injectedFieldInTo: 'a',
              injectedFieldInFrom: 'b',
              options: {
                source: {},
                destination: {},
                global: {
                  custom: 42,
                },
              },
            });
            const returned = convert([oneToOneRelationship], ['A', 'B']);
            convertedRelationship = returned.get('A')[0];
          });

          it('should convert them', () => {
            jestExpect(convertedRelationship).toMatchInlineSnapshot(`
              {
                "options": {
                  "custom": 42,
                },
                "otherEntityName": "b",
                "otherEntityRelationshipName": "a",
                "relationshipName": "b",
                "relationshipSide": "left",
                "relationshipType": "one-to-one",
              }
            `);
          });
        });
        describe('being regular options', () => {
          let convertedRelationship: ReturnType<typeof convert>['get'];

          before(() => {
            const oneToOneRelationship = new JDLRelationship({
              from: 'A',
              to: 'B',
              type: ONE_TO_ONE,
              injectedFieldInTo: 'a',
              injectedFieldInFrom: 'b',
              options: {
                source: {},
                destination: {},
                global: {
                  [BUILT_IN_ENTITY]: true,
                },
              },
            });
            const returned = convert([oneToOneRelationship], ['A', 'B']);
            convertedRelationship = returned.get('A')[0];
          });

          it('should convert them', () => {
            jestExpect(convertedRelationship).toMatchInlineSnapshot(`
              {
                "otherEntityName": "b",
                "otherEntityRelationshipName": "a",
                "relationshipName": "b",
                "relationshipSide": "left",
                "relationshipType": "one-to-one",
                "relationshipWithBuiltInEntity": true,
              }
            `);
          });
        });
      });
      describe('with required relationships', () => {
        let relationshipsForA: ReturnType<typeof convert>['get'];
        let relationshipsForB: ReturnType<typeof convert>['get'];

        before(() => {
          const oneToOneRelationship = new JDLRelationship({
            from: 'A',
            to: 'B',
            type: ONE_TO_ONE,
            injectedFieldInTo: 'a',
            injectedFieldInFrom: 'b',
            isInjectedFieldInFromRequired: true,
            isInjectedFieldInToRequired: true,
          });
          const returned = convert([oneToOneRelationship], ['A', 'B']);
          relationshipsForA = returned.get('A');
          relationshipsForB = returned.get('B');
        });

        it('should convert them', () => {
          jestExpect(relationshipsForA).toMatchInlineSnapshot(`
            [
              {
                "otherEntityName": "b",
                "otherEntityRelationshipName": "a",
                "relationshipName": "b",
                "relationshipSide": "left",
                "relationshipType": "one-to-one",
                "relationshipValidateRules": "required",
              },
            ]
          `);
          jestExpect(relationshipsForB).toMatchInlineSnapshot(`
            [
              {
                "otherEntityName": "a",
                "otherEntityRelationshipName": "b",
                "relationshipName": "a",
                "relationshipSide": "right",
                "relationshipType": "one-to-one",
                "relationshipValidateRules": "required",
              },
            ]
          `);
        });
      });
      describe('with comments', () => {
        let relationshipsForA: ReturnType<typeof convert>['get'];
        let relationshipsForB: ReturnType<typeof convert>['get'];

        before(() => {
          const oneToOneRelationship = new JDLRelationship({
            from: 'A',
            to: 'B',
            type: ONE_TO_ONE,
            injectedFieldInTo: 'a',
            injectedFieldInFrom: 'b',
            commentInFrom: 'A to B',
            commentInTo: 'A to B but in the destination',
          });
          const returned = convert([oneToOneRelationship], ['A', 'B']);
          relationshipsForA = returned.get('A');
          relationshipsForB = returned.get('B');
        });

        it('should convert them', () => {
          jestExpect(relationshipsForA).toMatchInlineSnapshot(`
            [
              {
                "documentation": "A to B",
                "otherEntityName": "b",
                "otherEntityRelationshipName": "a",
                "relationshipName": "b",
                "relationshipSide": "left",
                "relationshipType": "one-to-one",
              },
            ]
          `);
          jestExpect(relationshipsForB).toMatchInlineSnapshot(`
            [
              {
                "documentation": "A to B but in the destination",
                "otherEntityName": "a",
                "otherEntityRelationshipName": "b",
                "relationshipName": "a",
                "relationshipSide": "right",
                "relationshipType": "one-to-one",
              },
            ]
          `);
        });
      });
      describe("when the injected field in the destination side isn't present", () => {
        describe('for a One-to-One relationship', () => {
          let relationshipFromSourceToDestination: ReturnType<typeof convert>['get'];
          let relationshipFromDestinationToSource: ReturnType<typeof convert>['get'];

          before(() => {
            const oneToOneRelationship = new JDLRelationship({
              from: 'A',
              to: 'B',
              type: ONE_TO_ONE,
              injectedFieldInFrom: 'b',
            });
            const returned = convert([oneToOneRelationship], ['A', 'B']);
            relationshipFromSourceToDestination = returned.get('A')[0];
            relationshipFromDestinationToSource = returned.get('B')[0];
          });

          it('should add the relationship for the source entity', () => {
            jestExpect(relationshipFromSourceToDestination).toMatchInlineSnapshot(`
              {
                "otherEntityName": "b",
                "relationshipName": "b",
                "relationshipSide": "left",
                "relationshipType": "one-to-one",
              }
            `);
          });
          it('should not add the relationship for the destination entity', () => {
            expect(relationshipFromDestinationToSource).to.be.undefined;
          });
        });
        describe('for a One-to-Many relationship', () => {
          let relationshipFromSourceToDestination: ReturnType<typeof convert>['get'];
          let relationshipFromDestinationToSource: ReturnType<typeof convert>['get'];

          before(() => {
            const oneToManyRelationship = new JDLRelationship({
              from: 'A',
              to: 'B',
              type: ONE_TO_MANY,
              injectedFieldInFrom: 'b',
            });
            const returned = convert([oneToManyRelationship], ['A', 'B']);
            relationshipFromSourceToDestination = returned.get('A')[0];
            relationshipFromDestinationToSource = returned.get('B')[0];
          });

          it('should add the relationship for the source entity', () => {
            jestExpect(relationshipFromSourceToDestination).toMatchInlineSnapshot(`
              {
                "otherEntityName": "b",
                "relationshipName": "b",
                "relationshipSide": "left",
                "relationshipType": "one-to-many",
              }
            `);
          });
          it('should add the relationship for the destination entity', () => {
            jestExpect(relationshipFromDestinationToSource).toBeUndefined();
          });
        });
        describe('for a Many-to-One relationship', () => {
          let relationshipFromSourceToDestination: ReturnType<typeof convert>['get'];
          let relationshipFromDestinationToSource: ReturnType<typeof convert>['get'];

          before(() => {
            const manyToOneRelationship = new JDLRelationship({
              from: 'A',
              to: 'B',
              type: MANY_TO_ONE,
              injectedFieldInFrom: 'b',
            });
            const returned = convert([manyToOneRelationship], ['A', 'B']);
            relationshipFromSourceToDestination = returned.get('A')[0];
            relationshipFromDestinationToSource = returned.get('B')[0];
          });

          it('should add the relationship for the source entity', () => {
            jestExpect(relationshipFromSourceToDestination).toMatchInlineSnapshot(`
              {
                "otherEntityName": "b",
                "relationshipName": "b",
                "relationshipSide": "left",
                "relationshipType": "many-to-one",
              }
            `);
          });
          it('should not add the relationship for the destination entity', () => {
            expect(relationshipFromDestinationToSource).to.be.undefined;
          });
        });
        describe('for a Many-to-Many relationship', () => {
          let relationshipFromSourceToDestination: ReturnType<typeof convert>['get'];
          let relationshipFromDestinationToSource: ReturnType<typeof convert>['get'];

          before(() => {
            const manyToManyRelationship = new JDLRelationship({
              from: 'A',
              to: 'B',
              type: MANY_TO_MANY,
              injectedFieldInFrom: 'b',
            });
            const returned = convert([manyToManyRelationship], ['A', 'B']);
            relationshipFromSourceToDestination = returned.get('A')[0];
            relationshipFromDestinationToSource = returned.get('B')[0];
          });

          it('should add the relationship for the source entity', () => {
            jestExpect(relationshipFromSourceToDestination).toMatchInlineSnapshot(`
              {
                "otherEntityName": "b",
                "relationshipName": "b",
                "relationshipSide": "left",
                "relationshipType": "many-to-many",
              }
            `);
          });
          it('should add the relationship for the destination entity', () => {
            jestExpect(relationshipFromDestinationToSource).toBeUndefined();
          });
        });
      });
      describe("when the injected field in the source side isn't present", () => {
        describe('for a One-to-One relationship', () => {
          let relationshipFromSourceToDestination: ReturnType<typeof convert>['get'];
          let relationshipFromDestinationToSource: ReturnType<typeof convert>['get'];

          before(() => {
            const oneToOneRelationship = new JDLRelationship({
              from: 'A',
              to: 'B',
              type: ONE_TO_ONE,
              injectedFieldInTo: 'a',
            });
            const returned = convert([oneToOneRelationship], ['A', 'B']);
            relationshipFromSourceToDestination = returned.get('A')[0];
            relationshipFromDestinationToSource = returned.get('B')[0];
          });

          it('should add the relationship for the source entity', () => {
            jestExpect(relationshipFromSourceToDestination).toMatchInlineSnapshot(`
              {
                "otherEntityName": "b",
                "otherEntityRelationshipName": "a",
                "relationshipName": "b",
                "relationshipSide": "left",
                "relationshipType": "one-to-one",
              }
            `);
          });
          it('should add the relationship for the destination entity', () => {
            jestExpect(relationshipFromDestinationToSource).toMatchInlineSnapshot(`
              {
                "otherEntityName": "a",
                "relationshipName": "a",
                "relationshipSide": "right",
                "relationshipType": "one-to-one",
              }
            `);
          });
        });
        describe('for a One-to-Many relationship', () => {
          let relationshipFromSourceToDestination: ReturnType<typeof convert>['get'];
          let relationshipFromDestinationToSource: ReturnType<typeof convert>['get'];

          before(() => {
            const oneToManyRelationship = new JDLRelationship({
              from: 'A',
              to: 'B',
              type: ONE_TO_MANY,
              injectedFieldInTo: 'a',
            });
            const returned = convert([oneToManyRelationship], ['A', 'B']);
            relationshipFromSourceToDestination = returned.get('A')[0];
            relationshipFromDestinationToSource = returned.get('B')[0];
          });

          it('should add the relationship for the source entity', () => {
            jestExpect(relationshipFromSourceToDestination).toMatchInlineSnapshot(`
              {
                "otherEntityName": "b",
                "otherEntityRelationshipName": "a",
                "relationshipName": "b",
                "relationshipSide": "left",
                "relationshipType": "one-to-many",
              }
            `);
          });
          it('should add the relationship for the destination entity', () => {
            jestExpect(relationshipFromDestinationToSource).toMatchInlineSnapshot(`
              {
                "otherEntityName": "a",
                "relationshipName": "a",
                "relationshipSide": "right",
                "relationshipType": "many-to-one",
              }
            `);
          });
        });
        describe('for a Many-to-One relationship', () => {
          let relationshipFromSourceToDestination: ReturnType<typeof convert>['get'];
          let relationshipFromDestinationToSource: ReturnType<typeof convert>['get'];

          before(() => {
            const manyToOneRelationship = new JDLRelationship({
              from: 'A',
              to: 'B',
              type: MANY_TO_ONE,
              injectedFieldInTo: 'a',
            });
            const returned = convert([manyToOneRelationship], ['A', 'B']);
            relationshipFromSourceToDestination = returned.get('A')[0];
            relationshipFromDestinationToSource = returned.get('B')[0];
          });

          it('should add the relationship for the source entity', () => {
            jestExpect(relationshipFromSourceToDestination).toMatchInlineSnapshot(`
              {
                "otherEntityName": "b",
                "otherEntityRelationshipName": "a",
                "relationshipName": "b",
                "relationshipSide": "left",
                "relationshipType": "many-to-one",
              }
            `);
          });
          it('should add the relationship for the destination entity', () => {
            jestExpect(relationshipFromDestinationToSource).toMatchInlineSnapshot(`
              {
                "otherEntityName": "a",
                "relationshipName": "a",
                "relationshipSide": "right",
                "relationshipType": "one-to-many",
              }
            `);
          });
        });
        describe('for a Many-to-Many relationship', () => {
          let relationshipFromSourceToDestination: ReturnType<typeof convert>['get'];
          let relationshipFromDestinationToSource: ReturnType<typeof convert>['get'];

          before(() => {
            const manyToManyRelationship = new JDLRelationship({
              from: 'A',
              to: 'B',
              type: MANY_TO_MANY,
              injectedFieldInTo: 'a',
            });
            const returned = convert([manyToManyRelationship], ['A', 'B']);
            relationshipFromSourceToDestination = returned.get('A')[0];
            relationshipFromDestinationToSource = returned.get('B')[0];
          });

          it('should add the relationship for the source entity', () => {
            jestExpect(relationshipFromSourceToDestination).toMatchInlineSnapshot(`
              {
                "otherEntityName": "b",
                "otherEntityRelationshipName": "a",
                "relationshipName": "b",
                "relationshipSide": "left",
                "relationshipType": "many-to-many",
              }
            `);
          });
          it('should add the relationship for the destination entity', () => {
            jestExpect(relationshipFromDestinationToSource).toMatchInlineSnapshot(`
              {
                "otherEntityName": "a",
                "relationshipName": "a",
                "relationshipSide": "right",
                "relationshipType": "many-to-many",
              }
            `);
          });
        });
      });
      describe('when setting custom field for relationship mapping', () => {
        describe('for a One-to-One relationship', () => {
          let relationshipFromSourceToDestination: ReturnType<typeof convert>['get'];
          let relationshipFromDestinationToSource: ReturnType<typeof convert>['get'];

          before(() => {
            const oneToOneRelationship = new JDLRelationship({
              from: 'A',
              to: 'B',
              type: ONE_TO_ONE,
              injectedFieldInFrom: 'b(name)',
              injectedFieldInTo: 'a(name)',
            });
            const returned = convert([oneToOneRelationship], ['A', 'B']);
            relationshipFromSourceToDestination = returned.get('A')[0];
            relationshipFromDestinationToSource = returned.get('B')[0];
          });

          it('should add it for the source entity', () => {
            jestExpect(relationshipFromSourceToDestination).toMatchInlineSnapshot(`
              {
                "otherEntityField": "name",
                "otherEntityName": "b",
                "otherEntityRelationshipName": "a",
                "relationshipName": "b",
                "relationshipSide": "left",
                "relationshipType": "one-to-one",
              }
            `);
          });
          it('should ignore it for the destination entity', () => {
            jestExpect(relationshipFromDestinationToSource).toMatchInlineSnapshot(`
              {
                "otherEntityField": "name",
                "otherEntityName": "a",
                "otherEntityRelationshipName": "b",
                "relationshipName": "a",
                "relationshipSide": "right",
                "relationshipType": "one-to-one",
              }
            `);
          });
        });
        describe('for a One-to-Many relationship', () => {
          let relationshipFromSourceToDestination: ReturnType<typeof convert>['get'];
          let relationshipFromDestinationToSource: ReturnType<typeof convert>['get'];

          before(() => {
            const oneToManyRelationship = new JDLRelationship({
              from: 'A',
              to: 'B',
              type: ONE_TO_MANY,
              injectedFieldInFrom: 'b(name)',
              injectedFieldInTo: 'a(name)',
            });
            const returned = convert([oneToManyRelationship], ['A', 'B']);
            relationshipFromSourceToDestination = returned.get('A')[0];
            relationshipFromDestinationToSource = returned.get('B')[0];
          });

          it('should ignore it for the source entity', () => {
            jestExpect(relationshipFromSourceToDestination).toMatchInlineSnapshot(`
              {
                "otherEntityField": "name",
                "otherEntityName": "b",
                "otherEntityRelationshipName": "a",
                "relationshipName": "b",
                "relationshipSide": "left",
                "relationshipType": "one-to-many",
              }
            `);
          });
          it('should add it for the destination entity', () => {
            jestExpect(relationshipFromDestinationToSource).toMatchInlineSnapshot(`
              {
                "otherEntityField": "name",
                "otherEntityName": "a",
                "otherEntityRelationshipName": "b",
                "relationshipName": "a",
                "relationshipSide": "right",
                "relationshipType": "many-to-one",
              }
            `);
          });
        });
        describe('for a Many-to-One relationship', () => {
          let relationshipFromSourceToDestination: ReturnType<typeof convert>['get'];
          let relationshipFromDestinationToSource: ReturnType<typeof convert>['get'];

          before(() => {
            const manyToOneRelationship = new JDLRelationship({
              from: 'A',
              to: 'B',
              type: MANY_TO_ONE,
              injectedFieldInFrom: 'b(name)',
              injectedFieldInTo: 'a(name)',
            });
            const returned = convert([manyToOneRelationship], ['A', 'B']);
            relationshipFromSourceToDestination = returned.get('A')[0];
            relationshipFromDestinationToSource = returned.get('B')[0];
          });

          it('should add it for the source entity', () => {
            jestExpect(relationshipFromSourceToDestination).toMatchInlineSnapshot(`
              {
                "otherEntityField": "name",
                "otherEntityName": "b",
                "otherEntityRelationshipName": "a",
                "relationshipName": "b",
                "relationshipSide": "left",
                "relationshipType": "many-to-one",
              }
            `);
          });
          it('should ignore it for the source entity', () => {
            jestExpect(relationshipFromDestinationToSource).toMatchInlineSnapshot(`
              {
                "otherEntityField": "name",
                "otherEntityName": "a",
                "otherEntityRelationshipName": "b",
                "relationshipName": "a",
                "relationshipSide": "right",
                "relationshipType": "one-to-many",
              }
            `);
          });
        });
        describe('for a Many-to-Many relationship', () => {
          let relationshipFromSourceToDestination: ReturnType<typeof convert>['get'];
          let relationshipFromDestinationToSource: ReturnType<typeof convert>['get'];

          before(() => {
            const manyToManyRelationship = new JDLRelationship({
              from: 'A',
              to: 'B',
              type: MANY_TO_MANY,
              injectedFieldInFrom: 'b(name)',
              injectedFieldInTo: 'a(name)',
            });
            const returned = convert([manyToManyRelationship], ['A', 'B']);
            relationshipFromSourceToDestination = returned.get('A')[0];
            relationshipFromDestinationToSource = returned.get('B')[0];
          });

          it('should add it for the source entity', () => {
            jestExpect(relationshipFromSourceToDestination).toMatchInlineSnapshot(`
              {
                "otherEntityField": "name",
                "otherEntityName": "b",
                "otherEntityRelationshipName": "a",
                "relationshipName": "b",
                "relationshipSide": "left",
                "relationshipType": "many-to-many",
              }
            `);
          });
          it('should add it for the destination entity', () => {
            jestExpect(relationshipFromDestinationToSource).toMatchInlineSnapshot(`
              {
                "otherEntityField": "name",
                "otherEntityName": "a",
                "otherEntityRelationshipName": "b",
                "relationshipName": "a",
                "relationshipSide": "right",
                "relationshipType": "many-to-many",
              }
            `);
          });
        });
      });
    });
  });
});
