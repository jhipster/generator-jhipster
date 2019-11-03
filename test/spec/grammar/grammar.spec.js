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
  context('when parsing an option', () => {
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
