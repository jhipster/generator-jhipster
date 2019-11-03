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

/* eslint-disable no-unused-expressions */

const { expect } = require('chai');
const { parseFromContent } = require('../../../lib/readers/jdl_reader');

describe('Grammar tests', () => {
  context('when parsing an entity', () => {
    context('with a name', () => {
      let parsedEntity;

      before(() => {
        const content = parseFromContent('entity A');
        parsedEntity = content.entities[0];
      });

      it('should parse it', () => {
        expect(parsedEntity).to.deep.equal({
          annotations: [],
          body: [],
          javadoc: null,
          name: 'A',
          tableName: 'A'
        });
      });
    });
    context('with a name and a table name', () => {
      let parsedEntity;

      before(() => {
        const content = parseFromContent('entity A(a_table)');
        parsedEntity = content.entities[0];
      });

      it('should parse it', () => {
        expect(parsedEntity).to.deep.equal({
          annotations: [],
          body: [],
          javadoc: null,
          name: 'A',
          tableName: 'a_table'
        });
      });
    });
    context('with annotations', () => {
      let parsedEntity;

      before(() => {
        const content = parseFromContent('@dto(mapstruct)\n@service(serviceClass)\n@readOnly\nentity A');
        parsedEntity = content.entities[0];
      });

      it('should parse it', () => {
        expect(parsedEntity).to.deep.equal({
          annotations: [
            {
              method: 'mapstruct',
              option: 'dto',
              type: 'BINARY'
            },
            {
              method: 'serviceClass',
              option: 'service',
              type: 'BINARY'
            },
            {
              option: 'readOnly',
              type: 'UNARY'
            }
          ],
          body: [],
          javadoc: null,
          name: 'A',
          tableName: 'A'
        });
      });
    });
    context('with comments', () => {
      context('with single-line comments', () => {
        let parsedEntity;

        before(() => {
          const content = parseFromContent('/** A comment */\nentity A');
          parsedEntity = content.entities[0];
        });

        it('should parse it', () => {
          expect(parsedEntity).to.deep.equal({
            annotations: [],
            body: [],
            javadoc: ' A comment ',
            name: 'A',
            tableName: 'A'
          });
        });
      });
      context('with multi-line comments', () => {
        let parsedEntity;

        before(() => {
          const content = parseFromContent(`/**
 * Big 
 * comment.
 */
 entity A`);
          parsedEntity = content.entities[0];
        });

        it('should parse it', () => {
          expect(parsedEntity).to.deep.equal({
            annotations: [],
            body: [],
            javadoc: '\n * Big \n * comment.\n ',
            name: 'A',
            tableName: 'A'
          });
        });
      });
    });
    context('with annotations and comments', () => {
      context('when comments appear before annotations', () => {
        let parsedEntity;

        before(() => {
          const content = parseFromContent(
            `/** A comment */
 @id
 entity A
 `
          );
          parsedEntity = content.entities[0];
        });

        it('should parse it', () => {
          expect(parsedEntity).to.deep.equal({
            annotations: [
              {
                option: 'id',
                type: 'UNARY'
              }
            ],
            body: [],
            javadoc: ' A comment ',
            name: 'A',
            tableName: 'A'
          });
        });
      });
      context('when comments appear after annotations', () => {
        it('should fail', () => {
          expect(() => {
            parseFromContent(
              `@id
 /** A comment */
 entity A
 `
            );
          }).to.throw();
        });
      });
    });
    context('with fields', () => {
      context('having annotations and comments', () => {
        context('when comments appear before annotations', () => {
          let parsedEntity;

          before(() => {
            const content = parseFromContent(
              `entity A {
  /** field comment */
  @something
  name String
}
`
            );
            parsedEntity = content.entities[0];
          });

          it('should parse it', () => {
            expect(parsedEntity).to.deep.equal({
              annotations: [],
              body: [
                {
                  annotations: [
                    {
                      option: 'something',
                      type: 'UNARY'
                    }
                  ],
                  javadoc: ' field comment ',
                  name: 'name',
                  type: 'String',
                  validations: []
                }
              ],
              javadoc: null,
              name: 'A',
              tableName: 'A'
            });
          });
        });
        context('when comments appear after annotations', () => {
          it('should fail', () => {
            expect(() => {
              parseFromContent(`entity A {
  @something
  /** a comment */
  name String
}
`);
            }).to.throw();
          });
        });
      });
    });
  });
  context('when parsing a relationship', () => {
    ['OneToOne', 'OneToMany', 'ManyToOne', 'ManyToMany'].forEach(relationshipType => {
      context(`for a ${relationshipType} relationship`, () => {
        let relationship;

        before(() => {
          const content = parseFromContent(`relationship ${relationshipType} { A to B }`);
          relationship = content.relationships[0];
        });

        it('should parse it', () => {
          expect(relationship.cardinality).to.equal(formatRelationshipType(relationshipType));
        });
      });

      function formatRelationshipType(relationshipType) {
        return relationshipType.replace(
          /([A-Za-z]+?)To([A-Za-z]+)/,
          (match, firstGroup, secondGroup) => `${firstGroup.toLowerCase()}-to-${secondGroup.toLowerCase()}`
        );
      }
    });
    context('with only source & destination entities', () => {
      let relationship;

      before(() => {
        const content = parseFromContent('relationship OneToOne { A to B }');
        relationship = content.relationships[0];
      });

      it('should parse them', () => {
        expect(relationship).to.deep.equal({
          annotations: [],
          cardinality: 'one-to-one',
          from: {
            injectedField: null,
            javadoc: null,
            name: 'A'
          },
          to: {
            injectedField: null,
            javadoc: null,
            name: 'B'
          }
        });
      });
    });
    context('with an injected field in the source', () => {
      context('that is not required', () => {
        let relationship;

        before(() => {
          const content = parseFromContent('relationship OneToOne { A{b} to B }');
          relationship = content.relationships[0];
        });

        it('should add it', () => {
          expect(relationship.from.injectedField).to.equal('b');
        });
        it('should set the field requirement to false', () => {
          expect(relationship.from.required).to.be.false;
        });
      });
      context('that is required', () => {
        let relationship;

        before(() => {
          const content = parseFromContent('relationship OneToOne { A{b required} to B }');
          relationship = content.relationships[0];
        });

        it('should add it', () => {
          expect(relationship.from.injectedField).to.equal('b');
        });
        it('should set the field requirement to true', () => {
          expect(relationship.from.required).to.be.true;
        });
      });
    });
    context('with an injected field in the destination', () => {
      context('that is not required', () => {
        let relationship;

        before(() => {
          const content = parseFromContent('relationship OneToOne { A to B{a} }');
          relationship = content.relationships[0];
        });

        it('should add it', () => {
          expect(relationship.to.injectedField).to.equal('a');
        });
        it('should set the field requirement to false', () => {
          expect(relationship.to.required).to.be.false;
        });
      });
      context('that is required', () => {
        let relationship;

        before(() => {
          const content = parseFromContent('relationship OneToOne { A to B{a required} }');
          relationship = content.relationships[0];
        });

        it('should add it', () => {
          expect(relationship.to.injectedField).to.equal('a');
        });
        it('should set the field requirement to true', () => {
          expect(relationship.to.required).to.be.true;
        });
      });
    });
    context('with an injected field in both sides', () => {
      let relationship;

      before(() => {
        const content = parseFromContent('relationship OneToOne { A{b} to B{a} }');
        relationship = content.relationships[0];
      });

      it('should add it in the source', () => {
        expect(relationship.from.injectedField).to.equal('b');
      });
      it('should set the source field requirement to false', () => {
        expect(relationship.from.required).to.be.false;
      });
      it('should add it in the destination', () => {
        expect(relationship.to.injectedField).to.equal('a');
      });
      it('should set the destination field requirement to false', () => {
        expect(relationship.to.required).to.be.false;
      });
    });
  });
  context('when parsing an option', () => {
    context('being unary', () => {
      context('with exclusions', () => {
        let parsedOption;

        before(() => {
          const content = parseFromContent('skipClient * except A');
          parsedOption = content.noClient;
        });

        it('should add the exclusions', () => {
          expect(parsedOption).to.deep.equal({
            excluded: ['A'],
            list: ['*']
          });
        });
      });
    });
    context('being binary', () => {
      context('being clientRootFolder', () => {
        context('in the regular form', () => {
          let parsedOption;

          before(() => {
            const content = parseFromContent('clientRootFolder * with client');
            parsedOption = content.clientRootFolder;
          });

          it('should parse it', () => {
            expect(parsedOption).to.deep.equal({
              client: {
                excluded: [],
                list: ['*']
              }
            });
          });
        });
        context('in the path form', () => {
          let parsedOption;

          before(() => {
            const content = parseFromContent('clientRootFolder * with "../../toto"');
            parsedOption = content.clientRootFolder;
          });

          it('should parse it', () => {
            expect(parsedOption).to.deep.equal({
              '"../../toto"': {
                excluded: [],
                list: ['*']
              }
            });
          });
        });
      });
      context('with exclusions', () => {
        let parsedOption;

        before(() => {
          const content = parseFromContent('dto * with mapstruct except A');
          parsedOption = content.dto;
        });

        it('should add the exclusions', () => {
          expect(parsedOption).to.deep.equal({
            mapstruct: {
              excluded: ['A'],
              list: ['*']
            }
          });
        });
      });
    });
    context("using the 'all' keyword", () => {
      let parsedOption;

      before(() => {
        const content = parseFromContent('clientRootFolder all with client');
        parsedOption = content.clientRootFolder;
      });

      it("should parse it as '*'", () => {
        expect(parsedOption).to.deep.equal({
          client: {
            excluded: [],
            list: ['*']
          }
        });
      });
    });
    context("using the '*' keyword", () => {
      let parsedOption;

      before(() => {
        const content = parseFromContent('clientRootFolder * with client');
        parsedOption = content.clientRootFolder;
      });

      it('should parse it', () => {
        expect(parsedOption).to.deep.equal({
          client: {
            excluded: [],
            list: ['*']
          }
        });
      });
    });
  });
});
