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
/* eslint-disable no-unused-expressions */

import { jestExpect } from 'mocha-expect-snapshot';
import { expect } from 'chai';
import JDLRelationship from '../../../../jdl/models/jdl-relationship.js';
import { convert } from '../../../../jdl/converters/jdl-to-json/jdl-to-json-relationship-converter.js';
import { relationshipTypes, relationshipOptions } from '../../../../jdl/jhipster/index.mjs';

const { ONE_TO_ONE, MANY_TO_MANY, MANY_TO_ONE, ONE_TO_MANY } = relationshipTypes;
const { JPA_DERIVED_IDENTIFIER } = relationshipOptions;

describe('jdl - JDLToJSONRelationshipConverter', () => {
  describe('convert', () => {
    context('when not passing any relationship', () => {
      it('should return an empty map', () => {
        expect(convert([]).size).to.equal(0);
        expect(convert([], ['A', 'B']).size).to.equal(0);
      });
    });
    context('when not passing any entity name', () => {
      it('should return an empty map', () => {
        expect(convert(undefined, []).size).to.equal(0);
        expect(convert([], []).size).to.equal(0);
      });
    });
    context('when passing relationships and entity names', () => {
      context('without options, required relationships or comments', () => {
        let relationshipsForA;
        let relationshipsForB;

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
          const returned: any = convert(
            [oneToOneRelationship, oneToManyRelationship, manyToOneRelationship, manyToManyRelationship],
            ['A', 'B']
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
    "ownerSide": true,
    "relationshipName": "b",
    "relationshipType": "one-to-one",
  },
  {
    "otherEntityName": "b",
    "otherEntityRelationshipName": "a",
    "relationshipName": "b",
    "relationshipType": "one-to-many",
  },
  {
    "otherEntityName": "b",
    "otherEntityRelationshipName": "a",
    "relationshipName": "b",
    "relationshipType": "many-to-one",
  },
  {
    "otherEntityName": "b",
    "otherEntityRelationshipName": "a",
    "ownerSide": true,
    "relationshipName": "b",
    "relationshipType": "many-to-many",
  },
]
`);
          jestExpect(relationshipsForB).toMatchInlineSnapshot(`
[
  {
    "otherEntityName": "a",
    "otherEntityRelationshipName": "b",
    "ownerSide": false,
    "relationshipName": "a",
    "relationshipType": "one-to-one",
  },
  {
    "otherEntityName": "a",
    "otherEntityRelationshipName": "b",
    "relationshipName": "a",
    "relationshipType": "many-to-one",
  },
  {
    "otherEntityName": "a",
    "otherEntityRelationshipName": "b",
    "relationshipName": "a",
    "relationshipType": "one-to-many",
  },
  {
    "otherEntityName": "a",
    "otherEntityRelationshipName": "b",
    "ownerSide": false,
    "relationshipName": "a",
    "relationshipType": "many-to-many",
  },
]
`);
        });
      });
      context('with options', () => {
        context('being custom options', () => {
          let convertedRelationship;

          before(() => {
            const oneToOneRelationship = new JDLRelationship({
              from: 'A',
              to: 'B',
              type: ONE_TO_ONE,
              injectedFieldInTo: 'a',
              injectedFieldInFrom: 'b',
              options: {
                global: {
                  custom: 42,
                },
              },
            });
            const returned: any = convert([oneToOneRelationship], ['A', 'B']);
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
  "ownerSide": true,
  "relationshipName": "b",
  "relationshipType": "one-to-one",
}
`);
          });
        });
        context('being regular options', () => {
          let convertedRelationship;

          before(() => {
            const oneToOneRelationship = new JDLRelationship({
              from: 'A',
              to: 'B',
              type: ONE_TO_ONE,
              injectedFieldInTo: 'a',
              injectedFieldInFrom: 'b',
              options: {
                global: {
                  [JPA_DERIVED_IDENTIFIER]: true,
                },
              },
            });
            const returned: any = convert([oneToOneRelationship], ['A', 'B']);
            convertedRelationship = returned.get('A')[0];
          });

          it('should convert them', () => {
            jestExpect(convertedRelationship).toMatchInlineSnapshot(`
{
  "otherEntityName": "b",
  "otherEntityRelationshipName": "a",
  "ownerSide": true,
  "relationshipName": "b",
  "relationshipType": "one-to-one",
  "useJPADerivedIdentifier": true,
}
`);
          });
        });
      });
      context('with required relationships', () => {
        let relationshipsForA;
        let relationshipsForB;

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
          const returned: any = convert([oneToOneRelationship], ['A', 'B']);
          relationshipsForA = returned.get('A');
          relationshipsForB = returned.get('B');
        });

        it('should convert them', () => {
          jestExpect(relationshipsForA).toMatchInlineSnapshot(`
[
  {
    "otherEntityName": "b",
    "otherEntityRelationshipName": "a",
    "ownerSide": true,
    "relationshipName": "b",
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
    "ownerSide": false,
    "relationshipName": "a",
    "relationshipType": "one-to-one",
    "relationshipValidateRules": "required",
  },
]
`);
        });
      });
      context('with comments', () => {
        let relationshipsForA;
        let relationshipsForB;

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
          const returned: any = convert([oneToOneRelationship], ['A', 'B']);
          relationshipsForA = returned.get('A');
          relationshipsForB = returned.get('B');
        });

        it('should convert them', () => {
          jestExpect(relationshipsForA).toMatchInlineSnapshot(`
[
  {
    "javadoc": "A to B",
    "otherEntityName": "b",
    "otherEntityRelationshipName": "a",
    "ownerSide": true,
    "relationshipName": "b",
    "relationshipType": "one-to-one",
  },
]
`);
          jestExpect(relationshipsForB).toMatchInlineSnapshot(`
[
  {
    "javadoc": "A to B but in the destination",
    "otherEntityName": "a",
    "otherEntityRelationshipName": "b",
    "ownerSide": false,
    "relationshipName": "a",
    "relationshipType": "one-to-one",
  },
]
`);
        });
      });
      context("when the injected field in the destination side isn't present", () => {
        context('for a One-to-One relationship', () => {
          let relationshipFromSourceToDestination;
          let relationshipFromDestinationToSource;

          before(() => {
            const oneToOneRelationship = new JDLRelationship({
              from: 'A',
              to: 'B',
              type: ONE_TO_ONE,
              injectedFieldInFrom: 'b',
            });
            const returned: any = convert([oneToOneRelationship], ['A', 'B']);
            relationshipFromSourceToDestination = returned.get('A')[0];
            relationshipFromDestinationToSource = returned.get('B')[0];
          });

          it('should add the relationship for the source entity', () => {
            jestExpect(relationshipFromSourceToDestination).toMatchInlineSnapshot(`
{
  "otherEntityName": "b",
  "ownerSide": true,
  "relationshipName": "b",
  "relationshipType": "one-to-one",
}
`);
          });
          it('should not add the relationship for the destination entity', () => {
            expect(relationshipFromDestinationToSource).to.be.undefined;
          });
        });
        context('for a One-to-Many relationship', () => {
          let relationshipFromSourceToDestination;
          let relationshipFromDestinationToSource;

          before(() => {
            const oneToManyRelationship = new JDLRelationship({
              from: 'A',
              to: 'B',
              type: ONE_TO_MANY,
              injectedFieldInFrom: 'b',
            });
            const returned: any = convert([oneToManyRelationship], ['A', 'B']);
            relationshipFromSourceToDestination = returned.get('A')[0];
            relationshipFromDestinationToSource = returned.get('B')[0];
          });

          it('should add the relationship for the source entity', () => {
            jestExpect(relationshipFromSourceToDestination).toMatchInlineSnapshot(`
{
  "otherEntityName": "b",
  "otherEntityRelationshipName": "a",
  "relationshipName": "b",
  "relationshipType": "one-to-many",
}
`);
          });
          it('should add the relationship for the destination entity', () => {
            jestExpect(relationshipFromDestinationToSource).toMatchInlineSnapshot(`
{
  "otherEntityName": "a",
  "otherEntityRelationshipName": "b",
  "relationshipName": "a",
  "relationshipType": "many-to-one",
}
`);
          });
        });
        context('for a Many-to-One relationship', () => {
          let relationshipFromSourceToDestination;
          let relationshipFromDestinationToSource;

          before(() => {
            const manyToOneRelationship = new JDLRelationship({
              from: 'A',
              to: 'B',
              type: MANY_TO_ONE,
              injectedFieldInFrom: 'b',
            });
            const returned: any = convert([manyToOneRelationship], ['A', 'B']);
            relationshipFromSourceToDestination = returned.get('A')[0];
            relationshipFromDestinationToSource = returned.get('B')[0];
          });

          it('should add the relationship for the source entity', () => {
            jestExpect(relationshipFromSourceToDestination).toMatchInlineSnapshot(`
{
  "otherEntityName": "b",
  "relationshipName": "b",
  "relationshipType": "many-to-one",
}
`);
          });
          it('should not add the relationship for the destination entity', () => {
            expect(relationshipFromDestinationToSource).to.be.undefined;
          });
        });
        context('for a Many-to-Many relationship', () => {
          let relationshipFromSourceToDestination;
          let relationshipFromDestinationToSource;

          before(() => {
            const manyToManyRelationship = new JDLRelationship({
              from: 'A',
              to: 'B',
              type: MANY_TO_MANY,
              injectedFieldInFrom: 'b',
            });
            const returned: any = convert([manyToManyRelationship], ['A', 'B']);
            relationshipFromSourceToDestination = returned.get('A')[0];
            relationshipFromDestinationToSource = returned.get('B')[0];
          });

          it('should add the relationship for the source entity', () => {
            jestExpect(relationshipFromSourceToDestination).toMatchInlineSnapshot(`
{
  "otherEntityName": "b",
  "otherEntityRelationshipName": "a",
  "ownerSide": true,
  "relationshipName": "b",
  "relationshipType": "many-to-many",
}
`);
          });
          it('should add the relationship for the destination entity', () => {
            jestExpect(relationshipFromDestinationToSource).toMatchInlineSnapshot(`
{
  "otherEntityName": "a",
  "otherEntityRelationshipName": "b",
  "ownerSide": false,
  "relationshipName": "a",
  "relationshipType": "many-to-many",
}
`);
          });
        });
      });
      context("when the injected field in the source side isn't present", () => {
        context('for a One-to-One relationship', () => {
          let relationshipFromSourceToDestination;
          let relationshipFromDestinationToSource;

          before(() => {
            const oneToOneRelationship = new JDLRelationship({
              from: 'A',
              to: 'B',
              type: ONE_TO_ONE,
              injectedFieldInTo: 'a',
            });
            const returned: any = convert([oneToOneRelationship], ['A', 'B']);
            relationshipFromSourceToDestination = returned.get('A')[0];
            relationshipFromDestinationToSource = returned.get('B')[0];
          });

          it('should add the relationship for the source entity', () => {
            jestExpect(relationshipFromSourceToDestination).toMatchInlineSnapshot(`
{
  "otherEntityName": "b",
  "otherEntityRelationshipName": "a",
  "ownerSide": true,
  "relationshipName": "b",
  "relationshipType": "one-to-one",
}
`);
          });
          it('should add the relationship for the destination entity', () => {
            jestExpect(relationshipFromDestinationToSource).toMatchInlineSnapshot(`
{
  "otherEntityName": "a",
  "otherEntityRelationshipName": "b",
  "ownerSide": false,
  "relationshipName": "a",
  "relationshipType": "one-to-one",
}
`);
          });
        });
        context('for a One-to-Many relationship', () => {
          let relationshipFromSourceToDestination;
          let relationshipFromDestinationToSource;

          before(() => {
            const oneToManyRelationship = new JDLRelationship({
              from: 'A',
              to: 'B',
              type: ONE_TO_MANY,
              injectedFieldInTo: 'a',
            });
            const returned: any = convert([oneToManyRelationship], ['A', 'B']);
            relationshipFromSourceToDestination = returned.get('A')[0];
            relationshipFromDestinationToSource = returned.get('B')[0];
          });

          it('should add the relationship for the source entity', () => {
            jestExpect(relationshipFromSourceToDestination).toMatchInlineSnapshot(`
{
  "otherEntityName": "b",
  "otherEntityRelationshipName": "a",
  "relationshipName": "b",
  "relationshipType": "one-to-many",
}
`);
          });
          it('should add the relationship for the destination entity', () => {
            jestExpect(relationshipFromDestinationToSource).toMatchInlineSnapshot(`
{
  "otherEntityName": "a",
  "otherEntityRelationshipName": "b",
  "relationshipName": "a",
  "relationshipType": "many-to-one",
}
`);
          });
        });
        context('for a Many-to-One relationship', () => {
          let relationshipFromSourceToDestination;
          let relationshipFromDestinationToSource;

          before(() => {
            const manyToOneRelationship = new JDLRelationship({
              from: 'A',
              to: 'B',
              type: MANY_TO_ONE,
              injectedFieldInTo: 'a',
            });
            const returned: any = convert([manyToOneRelationship], ['A', 'B']);
            relationshipFromSourceToDestination = returned.get('A')[0];
            relationshipFromDestinationToSource = returned.get('B')[0];
          });

          it('should add the relationship for the source entity', () => {
            jestExpect(relationshipFromSourceToDestination).toMatchInlineSnapshot(`
{
  "otherEntityName": "b",
  "otherEntityRelationshipName": "a",
  "relationshipName": "b",
  "relationshipType": "many-to-one",
}
`);
          });
          it('should add the relationship for the destination entity', () => {
            jestExpect(relationshipFromDestinationToSource).toMatchInlineSnapshot(`
{
  "otherEntityName": "a",
  "otherEntityRelationshipName": "b",
  "relationshipName": "a",
  "relationshipType": "one-to-many",
}
`);
          });
        });
        context('for a Many-to-Many relationship', () => {
          let relationshipFromSourceToDestination;
          let relationshipFromDestinationToSource;

          before(() => {
            const manyToManyRelationship = new JDLRelationship({
              from: 'A',
              to: 'B',
              type: MANY_TO_MANY,
              injectedFieldInTo: 'a',
            });
            const returned: any = convert([manyToManyRelationship], ['A', 'B']);
            relationshipFromSourceToDestination = returned.get('A')[0];
            relationshipFromDestinationToSource = returned.get('B')[0];
          });

          it('should add the relationship for the source entity', () => {
            jestExpect(relationshipFromSourceToDestination).toMatchInlineSnapshot(`
{
  "otherEntityName": "b",
  "otherEntityRelationshipName": "a",
  "ownerSide": true,
  "relationshipName": "b",
  "relationshipType": "many-to-many",
}
`);
          });
          it('should add the relationship for the destination entity', () => {
            jestExpect(relationshipFromDestinationToSource).toMatchInlineSnapshot(`
{
  "otherEntityName": "a",
  "otherEntityRelationshipName": "b",
  "ownerSide": false,
  "relationshipName": "a",
  "relationshipType": "many-to-many",
}
`);
          });
        });
      });
      context('when setting custom field for relationship mapping', () => {
        context('for a One-to-One relationship', () => {
          let relationshipFromSourceToDestination;
          let relationshipFromDestinationToSource;

          before(() => {
            const oneToOneRelationship = new JDLRelationship({
              from: 'A',
              to: 'B',
              type: ONE_TO_ONE,
              injectedFieldInFrom: 'b(name)',
              injectedFieldInTo: 'a(name)',
            });
            const returned: any = convert([oneToOneRelationship], ['A', 'B']);
            relationshipFromSourceToDestination = returned.get('A')[0];
            relationshipFromDestinationToSource = returned.get('B')[0];
          });

          it('should add it for the source entity', () => {
            jestExpect(relationshipFromSourceToDestination).toMatchInlineSnapshot(`
{
  "otherEntityField": "name",
  "otherEntityName": "b",
  "otherEntityRelationshipName": "a",
  "ownerSide": true,
  "relationshipName": "b",
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
  "ownerSide": false,
  "relationshipName": "a",
  "relationshipType": "one-to-one",
}
`);
          });
        });
        context('for a One-to-Many relationship', () => {
          let relationshipFromSourceToDestination;
          let relationshipFromDestinationToSource;

          before(() => {
            const oneToManyRelationship = new JDLRelationship({
              from: 'A',
              to: 'B',
              type: ONE_TO_MANY,
              injectedFieldInFrom: 'b(name)',
              injectedFieldInTo: 'a(name)',
            });
            const returned: any = convert([oneToManyRelationship], ['A', 'B']);
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
  "relationshipType": "many-to-one",
}
`);
          });
        });
        context('for a Many-to-One relationship', () => {
          let relationshipFromSourceToDestination;
          let relationshipFromDestinationToSource;

          before(() => {
            const manyToOneRelationship = new JDLRelationship({
              from: 'A',
              to: 'B',
              type: MANY_TO_ONE,
              injectedFieldInFrom: 'b(name)',
              injectedFieldInTo: 'a(name)',
            });
            const returned: any = convert([manyToOneRelationship], ['A', 'B']);
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
  "relationshipType": "one-to-many",
}
`);
          });
        });
        context('for a Many-to-Many relationship', () => {
          let relationshipFromSourceToDestination;
          let relationshipFromDestinationToSource;

          before(() => {
            const manyToManyRelationship = new JDLRelationship({
              from: 'A',
              to: 'B',
              type: MANY_TO_MANY,
              injectedFieldInFrom: 'b(name)',
              injectedFieldInTo: 'a(name)',
            });
            const returned: any = convert([manyToManyRelationship], ['A', 'B']);
            relationshipFromSourceToDestination = returned.get('A')[0];
            relationshipFromDestinationToSource = returned.get('B')[0];
          });

          it('should add it for the source entity', () => {
            jestExpect(relationshipFromSourceToDestination).toMatchInlineSnapshot(`
{
  "otherEntityField": "name",
  "otherEntityName": "b",
  "otherEntityRelationshipName": "a",
  "ownerSide": true,
  "relationshipName": "b",
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
  "ownerSide": false,
  "relationshipName": "a",
  "relationshipType": "many-to-many",
}
`);
          });
        });
      });
    });
  });
});
