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
const { ONE_TO_MANY, MANY_TO_ONE, MANY_TO_MANY, ONE_TO_ONE } = require('../../../lib/core/jhipster/relationship_types');
const {
  MAX,
  MAXBYTES,
  MAXLENGTH,
  MIN,
  MINBYTES,
  MINLENGTH,
  PATTERN,
  REQUIRED,
  UNIQUE
} = require('../../../lib/core/jhipster/validations');

describe('Grammar tests', () => {
  context('when parsing constants', () => {
    let constants;

    before(() => {
      const content = parseFromContent(`MIN = 42
MAX = 43`);
      constants = content.constants;
    });

    it('should parse them', () => {
      expect(constants).to.deep.equal({ MIN: 42, MAX: 43 });
    });
  });
  context('when parsing applications', () => {
    context('with no custom configuration', () => {
      let application;

      before(() => {
        const content = parseFromContent('application {}');
        application = content.applications[0];
      });

      it('should parse it', () => {
        expect(application).to.deep.equal({
          config: {},
          entities: {
            entityList: [],
            excluded: []
          }
        });
      });
    });
    context('with a custom configuration', () => {
      let application;

      before(() => {
        const content = parseFromContent(`application {
  config {
    baseName superApp
    applicationType monolith
  }
}`);
        application = content.applications[0];
      });

      it('should parse it', () => {
        expect(application).to.deep.equal({
          config: {
            baseName: 'superApp',
            applicationType: 'monolith'
          },
          entities: {
            entityList: [],
            excluded: []
          }
        });
      });
    });
    context('with more than one application', () => {
      let applications;

      before(() => {
        const content = parseFromContent(`application {
  config {
    baseName superApp2
    applicationType monolith
  }
}

application {
  config {
    baseName superApp1
    applicationType monolith
  }
}
`);
        applications = content.applications;
      });

      it('should parse them', () => {
        expect(applications).to.deep.equal([
          {
            config: {
              baseName: 'superApp2',
              applicationType: 'monolith'
            },
            entities: {
              entityList: [],
              excluded: []
            }
          },
          {
            config: {
              baseName: 'superApp1',
              applicationType: 'monolith'
            },
            entities: {
              entityList: [],
              excluded: []
            }
          }
        ]);
      });
    });
    context('when having entities', () => {
      context('without exclusions', () => {
        let application;

        before(() => {
          const content = parseFromContent(`application {
  config {
    baseName superApp
    applicationType monolith
  }
  entities A, B, C
}`);
          application = content.applications[0];
        });

        it('should parse them', () => {
          expect(application.entities.entityList).to.deep.equal(['A', 'B', 'C']);
        });
      });
      context('with exclusions', () => {
        context("using the 'all' keyword", () => {
          let application;

          before(() => {
            const content = parseFromContent(`application {
  config {
    baseName superApp
    applicationType monolith
  }
  entities all except A
}`);
            application = content.applications[0];
          });

          it('should parse the list', () => {
            expect(application.entities.entityList).to.deep.equal(['*']);
          });
          it('should parse the list', () => {
            expect(application.entities.excluded).to.deep.equal(['A']);
          });
        });
        context("using the '*' keyword", () => {
          let application;

          before(() => {
            const content = parseFromContent(`application {
  config {
    baseName superApp
    applicationType monolith
  }
  entities * except A
}`);
            application = content.applications[0];
          });

          it('should parse the list', () => {
            expect(application.entities.entityList).to.deep.equal(['*']);
          });
          it('should parse the list', () => {
            expect(application.entities.excluded).to.deep.equal(['A']);
          });
        });
      });
    });
  });
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
    context('without fields', () => {
      context('if using curly braces or not', () => {
        let firstDeclaration;
        let secondDeclaration;

        before(() => {
          const firstContent = parseFromContent('entity A');
          const secondContent = parseFromContent('entity A {}');
          firstDeclaration = firstContent.entities[0];
          secondDeclaration = secondContent.entities[0];
        });

        it('should produce the same result', () => {
          expect(firstDeclaration).to.deep.equal(secondDeclaration);
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
      context('with validations', () => {
        context(`with the ${REQUIRED} validation`, () => {
          let parsedEntity;

          before(() => {
            const content = parseFromContent(
              `entity A {
  name String ${REQUIRED}
}
`
            );
            parsedEntity = content.entities[0];
          });

          it('should parse it', () => {
            expect(parsedEntity.body[0].validations).to.deep.equal([
              {
                key: REQUIRED,
                value: ''
              }
            ]);
          });
        });
        context(`with the ${MINLENGTH} validation`, () => {
          let parsedEntity;

          before(() => {
            const content = parseFromContent(
              `entity A {
  name String ${MINLENGTH}(0)
}
`
            );
            parsedEntity = content.entities[0];
          });

          it('should parse it', () => {
            expect(parsedEntity.body[0].validations).to.deep.equal([
              {
                key: MINLENGTH,
                value: 0
              }
            ]);
          });
        });
        context(`with the ${MAXLENGTH} validation`, () => {
          let parsedEntity;

          before(() => {
            const content = parseFromContent(
              `entity A {
  name String ${MAXLENGTH}(42)
}
`
            );
            parsedEntity = content.entities[0];
          });

          it('should parse it', () => {
            expect(parsedEntity.body[0].validations).to.deep.equal([
              {
                key: MAXLENGTH,
                value: 42
              }
            ]);
          });
        });
        context(`with the ${PATTERN} validation`, () => {
          let parsedEntity;

          before(() => {
            const content = parseFromContent(
              `entity A {
  name String ${PATTERN}(/[A-Za-z]\\d/)
}
`
            );
            parsedEntity = content.entities[0];
          });

          it('should parse it', () => {
            expect(parsedEntity.body[0].validations).to.deep.equal([
              {
                key: PATTERN,
                value: '[A-Za-z]\\d'
              }
            ]);
          });
        });
        context(`with the ${UNIQUE} validation`, () => {
          let parsedEntity;

          before(() => {
            const content = parseFromContent(
              `entity A {
  name String ${UNIQUE}
}
`
            );
            parsedEntity = content.entities[0];
          });

          it('should parse it', () => {
            expect(parsedEntity.body[0].validations).to.deep.equal([
              {
                key: UNIQUE,
                value: ''
              }
            ]);
          });
        });
        context(`with the ${MIN} validation`, () => {
          let parsedEntity;

          before(() => {
            const content = parseFromContent(
              `entity A {
  name Integer ${MIN}(0)
}
`
            );
            parsedEntity = content.entities[0];
          });

          it('should parse it', () => {
            expect(parsedEntity.body[0].validations).to.deep.equal([
              {
                key: MIN,
                value: 0
              }
            ]);
          });
        });
        context(`with the ${MAX} validation`, () => {
          let parsedEntity;

          before(() => {
            const content = parseFromContent(
              `entity A {
  name Integer ${MAX}(0)
}
`
            );
            parsedEntity = content.entities[0];
          });

          it('should parse it', () => {
            expect(parsedEntity.body[0].validations).to.deep.equal([
              {
                key: MAX,
                value: 0
              }
            ]);
          });
        });
        context(`with the ${MINBYTES} validation`, () => {
          let parsedEntity;

          before(() => {
            const content = parseFromContent(
              `entity A {
  name TextBlob ${MINBYTES}(0)
}
`
            );
            parsedEntity = content.entities[0];
          });

          it('should parse it', () => {
            expect(parsedEntity.body[0].validations).to.deep.equal([
              {
                key: MINBYTES,
                value: 0
              }
            ]);
          });
        });
        context(`with the ${MAXBYTES} validation`, () => {
          let parsedEntity;

          before(() => {
            const content = parseFromContent(
              `entity A {
  name TextBlob ${MAXBYTES}(0)
}
`
            );
            parsedEntity = content.entities[0];
          });

          it('should parse it', () => {
            expect(parsedEntity.body[0].validations).to.deep.equal([
              {
                key: MAXBYTES,
                value: 0
              }
            ]);
          });
        });
        context('using constants', () => {
          let parsedEntity;

          before(() => {
            const content = parseFromContent(
              `MAX=42
entity A {
  name TextBlob ${MAXBYTES}(MAX)
}
`
            );
            parsedEntity = content.entities[0];
          });

          it('should parse it', () => {
            expect(parsedEntity.body[0].validations).to.deep.equal([
              {
                key: MAXBYTES,
                value: 'MAX',
                constant: true
              }
            ]);
          });
        });
      });
    });
  });
  context('when parsing a relationship', () => {
    [ONE_TO_ONE, MANY_TO_MANY, MANY_TO_ONE, ONE_TO_MANY].forEach(relationshipType => {
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
          options: [],
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
      context('without them being required', () => {
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
      context('with them being required', () => {
        let relationship;

        before(() => {
          const content = parseFromContent('relationship OneToOne { A{b required} to B{a required} }');
          relationship = content.relationships[0];
        });

        it('should set the source field requirement to true', () => {
          expect(relationship.from.required).to.be.true;
        });
        it('should set the destination field requirement to true', () => {
          expect(relationship.to.required).to.be.true;
        });
      });
    });
    context('with an explicit join field in the source', () => {
      let relationship;

      before(() => {
        const content = parseFromContent('relationship OneToOne { A{b(name)} to B }');
        relationship = content.relationships[0];
      });

      it('should add it', () => {
        expect(relationship.from.injectedField).to.equal('b(name)');
      });
    });
    context('with an explicit join field in the destination', () => {
      let relationship;

      before(() => {
        const content = parseFromContent('relationship OneToOne { A to B{a(name)} }');
        relationship = content.relationships[0];
      });

      it('should add it', () => {
        expect(relationship.to.injectedField).to.equal('a(name)');
      });
    });
    context('with an explicit join field in both sides', () => {
      let relationship;

      before(() => {
        const content = parseFromContent('relationship OneToOne { A{b(name)} to B{a(name)} }');
        relationship = content.relationships[0];
      });

      it('should add it in the source', () => {
        expect(relationship.from.injectedField).to.equal('b(name)');
      });
      it('should add it in the destination', () => {
        expect(relationship.to.injectedField).to.equal('a(name)');
      });
    });
    context('with a method', () => {
      let relationship;

      before(() => {
        const content = parseFromContent('relationship OneToOne { A to B with jpaDerivedIdentifier }');
        relationship = content.relationships[0];
      });

      it('should add it', () => {
        expect(relationship.options).to.deep.equal([
          {
            option: 'jpaDerivedIdentifier',
            type: 'UNARY'
          }
        ]);
      });
    });
    context('when parsing more than one relationship', () => {
      context('with methods', () => {
        let relationships;

        before(() => {
          const content = parseFromContent(`relationship OneToOne {
  A to B with jpaDerivedIdentifier,
  B to C,
  D to E with jpaDerivedIdentifier
}
`);
          relationships = content.relationships;
        });

        it('should add them', () => {
          expect(relationships).to.deep.equal([
            {
              cardinality: 'one-to-one',
              from: {
                injectedField: null,
                javadoc: null,
                name: 'A'
              },
              options: [
                {
                  option: 'jpaDerivedIdentifier',
                  type: 'UNARY'
                }
              ],
              to: {
                injectedField: null,
                javadoc: null,
                name: 'B'
              }
            },
            {
              cardinality: 'one-to-one',
              from: {
                injectedField: null,
                javadoc: null,
                name: 'B'
              },
              options: [],
              to: {
                injectedField: null,
                javadoc: null,
                name: 'C'
              }
            },
            {
              cardinality: 'one-to-one',
              from: {
                injectedField: null,
                javadoc: null,
                name: 'D'
              },
              options: [
                {
                  option: 'jpaDerivedIdentifier',
                  type: 'UNARY'
                }
              ],
              to: {
                injectedField: null,
                javadoc: null,
                name: 'E'
              }
            }
          ]);
        });
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
