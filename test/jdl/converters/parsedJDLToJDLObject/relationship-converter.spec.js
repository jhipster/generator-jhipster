/**
 * Copyright 2013-2021 the original author or authors from the JHipster project.
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

const { expect } = require('chai');
const JDLRelationship = require('../../../../jdl/models/jdl-relationship');
const { convertRelationships } = require('../../../../jdl/converters/parsed-jdl-to-jdl-object/relationship-converter');

describe('RelationshipConverter', () => {
  describe('convertRelationships', () => {
    context('when not passing relationships', () => {
      it('should fail', () => {
        expect(() => convertRelationships()).to.throw(/^Relationships have to be passed so as to be converted\.$/);
      });
    });
    context('when passing relationships', () => {
      context('with all the fields', () => {
        let convertedRelationships;
        let expectedRelationships;

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
          expectedRelationships = [
            new JDLRelationship({
              from: 'Source',
              to: 'Destination',
              type: 'OneToMany',
              injectedFieldInFrom: 'destination',
              injectedFieldInTo: 'source',
              isInjectedFieldInFromRequired: true,
              isInjectedFieldInToRequired: false,
              commentInFrom: '/**\\nRequired\\n/',
              commentInTo: '/**\\nNot required\\n/',
              options: {
                global: {
                  jpaDerivedIdentifier: true,
                },
                destination: {},
                source: {},
              },
            }),
          ];
        });

        it('should convert them', () => {
          expect(convertedRelationships).to.deep.equal(expectedRelationships);
        });
      });
      context('when there is no injected field in both sides', () => {
        let convertedRelationships;
        let expectedRelationships;

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
          expectedRelationships = [
            new JDLRelationship({
              from: 'Source',
              to: 'Destination',
              type: 'OneToMany',
              injectedFieldInFrom: 'destination',
              injectedFieldInTo: 'source',
              isInjectedFieldInFromRequired: true,
              isInjectedFieldInToRequired: false,
              commentInFrom: '/**\\nRequired\\n/',
              commentInTo: '/**\\nNot required\\n/',
              options: {
                global: {
                  jpaDerivedIdentifier: true,
                },
                destination: {},
                source: {},
              },
            }),
          ];
        });

        it('should generate them', () => {
          expect(convertedRelationships).to.deep.equal(expectedRelationships);
        });
      });
    });
  });
});
