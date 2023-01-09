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

import { jestExpect as expect } from 'mocha-expect-snapshot';
import { convertRelationships } from '../../../../jdl/converters/parsed-jdl-to-jdl-object/relationship-converter.js';

describe('jdl - RelationshipConverter', () => {
  describe('convertRelationships', () => {
    context('when not passing relationships', () => {
      it('should fail', () => {
        // @ts-expect-error
        expect(() => convertRelationships()).toThrow(/^Relationships have to be passed so as to be converted\.$/);
      });
    });
    context('when passing relationships', () => {
      context('with all the fields', () => {
        let convertedRelationships;

        before(() => {
          convertedRelationships = convertRelationships(
            [
              {
                from: {
                  name: 'Source',
                  injectedField: 'destination',
                  required: true,
                  javadoc: '/**\n * Required\n */',
                },
                to: {
                  name: 'Destination',
                  injectedField: 'source',
                  required: false,
                  javadoc: '/**\n * Not required\n */',
                },
                cardinality: 'one-to-many',
                options: {
                  global: [{ optionName: 'jpaDerivedIdentifier', type: 'UNARY' }],
                  source: [],
                  destination: [],
                },
              },
            ],
            options => {
              if (options.length !== 0) {
                return { jpaDerivedIdentifier: true };
              }
              return {};
            }
          );
        });

        it('should convert them', () => {
          expect(convertedRelationships).toMatchInlineSnapshot(`
[
  JDLRelationship {
    "commentInFrom": "/**\\nRequired\\n/",
    "commentInTo": "/**\\nNot required\\n/",
    "from": "Source",
    "injectedFieldInFrom": "destination",
    "injectedFieldInTo": "source",
    "isInjectedFieldInFromRequired": true,
    "isInjectedFieldInToRequired": false,
    "options": {
      "destination": {},
      "global": {
        "jpaDerivedIdentifier": true,
      },
      "source": {},
    },
    "to": "Destination",
    "type": "OneToMany",
  },
]
`);
        });
      });
      context('when there is no injected field in both sides', () => {
        let convertedRelationships;

        before(() => {
          convertedRelationships = convertRelationships(
            [
              {
                from: {
                  name: 'Source',
                  required: true,
                  javadoc: '/**\n * Required\n */',
                },
                to: {
                  name: 'Destination',
                  required: false,
                  javadoc: '/**\n * Not required\n */',
                },
                cardinality: 'one-to-many',
                options: {
                  global: [{ optionName: 'jpaDerivedIdentifier', type: 'UNARY' }],
                  source: [],
                  destination: [],
                },
              },
            ],
            options => {
              if (options.length !== 0) {
                return { jpaDerivedIdentifier: true };
              }
              return {};
            }
          );
        });

        it('should generate them', () => {
          expect(convertedRelationships).toMatchInlineSnapshot(`
[
  JDLRelationship {
    "commentInFrom": "/**\\nRequired\\n/",
    "commentInTo": "/**\\nNot required\\n/",
    "from": "Source",
    "injectedFieldInFrom": "destination",
    "injectedFieldInTo": "source",
    "isInjectedFieldInFromRequired": true,
    "isInjectedFieldInToRequired": false,
    "options": {
      "destination": {},
      "global": {
        "jpaDerivedIdentifier": true,
      },
      "source": {},
    },
    "to": "Destination",
    "type": "OneToMany",
  },
]
`);
        });
      });
    });
  });
});
