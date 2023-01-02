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
import { parseFromContent } from '../../../jdl/readers/jdl-reader.js';
import { relationshipTypes, validations, unaryOptions, binaryOptions } from '../../../jdl/jhipster/index.mjs';

const { ONE_TO_MANY, MANY_TO_ONE, MANY_TO_MANY, ONE_TO_ONE } = relationshipTypes;
const {
  Validations: { MAX, MAXBYTES, MAXLENGTH, MIN, MINBYTES, MINLENGTH, PATTERN, REQUIRED, UNIQUE },
} = validations;
const { READ_ONLY, NO_FLUENT_METHOD, FILTER, SKIP_SERVER, SKIP_CLIENT, EMBEDDED } = unaryOptions;

const { Options, Values, OptionValues } = binaryOptions;

const { SEARCH, SERVICE, PAGINATION, DTO, ANGULAR_SUFFIX, MICROSERVICE } = Options;

describe('Grammar tests', () => {
  context('when parsing constants', () => {
    context('with integer values', () => {
      let constants;

      before(() => {
        const content = parseFromContent(`MIN = 42
MAX = 43`);
        constants = content.constants;
      });

      it('should parse them', () => {
        jestExpect(constants).toMatchInlineSnapshot(`
Object {
  "MAX": "43",
  "MIN": "42",
}
`);
      });
    });
    context('with decimal values', () => {
      let constants;

      before(() => {
        const content = parseFromContent('MIN = 42.42');
        constants = content.constants;
      });

      it('should parse them', () => {
        jestExpect(constants).toMatchInlineSnapshot(`
Object {
  "MIN": "42.42",
}
`);
      });
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
        jestExpect(application).toMatchInlineSnapshot(`
Object {
  "config": Object {},
  "entities": Array [],
  "options": Object {},
  "useOptions": Array [],
}
`);
      });
    });
    context('with a custom configuration', () => {
      context('when setting the applicationType', () => {
        let application;

        before(() => {
          const content = parseFromContent(`application {
  config {
    applicationType monolith
  }
}`);
          application = content.applications[0];
        });

        it('should parse it', () => {
          jestExpect(application).toMatchInlineSnapshot(`
Object {
  "config": Object {
    "applicationType": "monolith",
  },
  "entities": Array [],
  "options": Object {},
  "useOptions": Array [],
}
`);
        });
      });
      context('when setting the baseName', () => {
        let application;

        before(() => {
          const content = parseFromContent(`application {
  config {
    baseName toto
  }
}`);
          application = content.applications[0];
        });

        it('should parse it', () => {
          jestExpect(application).toMatchInlineSnapshot(`
Object {
  "config": Object {
    "baseName": "toto",
  },
  "entities": Array [],
  "options": Object {},
  "useOptions": Array [],
}
`);
        });
      });
      context('when setting the blueprints', () => {
        let application;

        before(() => {
          const content = parseFromContent(`application {
  config {
    blueprints [generator-jhipster-vuejs, generator-jhipster-nodejs]
  }
}`);
          application = content.applications[0];
        });

        it('should parse it', () => {
          jestExpect(application).toMatchInlineSnapshot(`
Object {
  "config": Object {
    "blueprints": Array [
      "generator-jhipster-vuejs",
      "generator-jhipster-nodejs",
    ],
  },
  "entities": Array [],
  "options": Object {},
  "useOptions": Array [],
}
`);
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
        jestExpect(applications).toMatchInlineSnapshot(`
Array [
  Object {
    "config": Object {
      "applicationType": "monolith",
      "baseName": "superApp2",
    },
    "entities": Array [],
    "options": Object {},
    "useOptions": Array [],
  },
  Object {
    "config": Object {
      "applicationType": "monolith",
      "baseName": "superApp1",
    },
    "entities": Array [],
    "options": Object {},
    "useOptions": Array [],
  },
]
`);
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
}

entity A
entity B
entity C
`);
          application = content.applications[0];
        });

        it('should parse them', () => {
          expect(application.entities).to.deep.equal(['A', 'B', 'C']);
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
}
entity A
entity B
entity C
`);
            application = content.applications[0];
          });

          it('should parse the list', () => {
            expect(application.entities).to.deep.equal(['B', 'C']);
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
}
entity A
entity B
entity C
`);
            application = content.applications[0];
          });

          it('should parse the list', () => {
            expect(application.entities).to.deep.equal(['B', 'C']);
          });
        });
      });
    });
    context('when having options', () => {
      let application;

      before(() => {
        const content = parseFromContent(`application {
  config {
    baseName superApp
    applicationType monolith
  }
  entities A, B, C
  readOnly B
  paginate A with pagination
  search * with couchbase except C
}
entity A
entity B
entity C
`);
        application = content.applications[0];
      });

      it('should parse them', () => {
        expect(application.options).to.deep.equal({
          readOnly: {
            list: ['B'],
            excluded: [],
          },
          pagination: {
            pagination: {
              list: ['A'],
              excluded: [],
            },
          },
          search: {
            couchbase: {
              list: ['*'],
              excluded: ['C'],
            },
          },
        });
      });
    });
    context('when having options in the use form', () => {
      let application;

      before(() => {
        const content = parseFromContent(`application {
  config {
    baseName superApp
    applicationType monolith
  }
  entities A, B, C
  use pagination for A
  use couchbase for * except C
}
entity A
entity B
entity C
`);
        application = content.applications[0];
      });

      it('should parse them', () => {
        expect(application.useOptions).to.deep.equal([
          {
            excluded: [],
            list: ['A'],
            optionValues: ['pagination'],
          },
          {
            excluded: ['C'],
            list: ['*'],
            optionValues: ['couchbase'],
          },
        ]);
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
        jestExpect(parsedEntity).toMatchInlineSnapshot(`
Object {
  "annotations": Array [],
  "body": Array [],
  "javadoc": null,
  "name": "A",
  "tableName": "A",
}
`);
      });
    });
    context('with a name and a table name', () => {
      let parsedEntity;

      before(() => {
        const content = parseFromContent('entity A(a_table)');
        parsedEntity = content.entities[0];
      });

      it('should parse it', () => {
        jestExpect(parsedEntity).toMatchInlineSnapshot(`
Object {
  "annotations": Array [],
  "body": Array [],
  "javadoc": null,
  "name": "A",
  "tableName": "a_table",
}
`);
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
        const content = parseFromContent(`@dto(mapstruct)
@service(serviceClass)
@readOnly
@customAnnotation(value1)
@customAnnotation2(2)
@customAnnotation3(2.42)
@customAnnotation4("foo bar $")
entity A`);
        parsedEntity = content.entities[0];
      });

      it('should parse it', () => {
        jestExpect(parsedEntity).toMatchInlineSnapshot(`
Object {
  "annotations": Array [
    Object {
      "optionName": "dto",
      "optionValue": "mapstruct",
      "type": "BINARY",
    },
    Object {
      "optionName": "service",
      "optionValue": "serviceClass",
      "type": "BINARY",
    },
    Object {
      "optionName": "readOnly",
      "type": "UNARY",
    },
    Object {
      "optionName": "customAnnotation",
      "optionValue": "value1",
      "type": "BINARY",
    },
    Object {
      "optionName": "customAnnotation2",
      "optionValue": "2",
      "type": "BINARY",
    },
    Object {
      "optionName": "customAnnotation3",
      "optionValue": "2.42",
      "type": "BINARY",
    },
    Object {
      "optionName": "customAnnotation4",
      "optionValue": "foo bar $",
      "type": "BINARY",
    },
  ],
  "body": Array [],
  "javadoc": null,
  "name": "A",
  "tableName": "A",
}
`);
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
          jestExpect(parsedEntity).toMatchInlineSnapshot(`
Object {
  "annotations": Array [],
  "body": Array [],
  "javadoc": "A comment",
  "name": "A",
  "tableName": "A",
}
`);
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
          jestExpect(parsedEntity).toMatchInlineSnapshot(`
Object {
  "annotations": Array [],
  "body": Array [],
  "javadoc": "
 * Big
 * comment.
",
  "name": "A",
  "tableName": "A",
}
`);
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
          jestExpect(parsedEntity).toMatchInlineSnapshot(`
Object {
  "annotations": Array [
    Object {
      "optionName": "id",
      "type": "UNARY",
    },
  ],
  "body": Array [],
  "javadoc": "A comment",
  "name": "A",
  "tableName": "A",
}
`);
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
            jestExpect(parsedEntity).toMatchInlineSnapshot(`
Object {
  "annotations": Array [],
  "body": Array [
    Object {
      "annotations": Array [
        Object {
          "optionName": "something",
          "type": "UNARY",
        },
      ],
      "javadoc": "field comment",
      "name": "name",
      "type": "String",
      "validations": Array [],
    },
  ],
  "javadoc": null,
  "name": "A",
  "tableName": "A",
}
`);
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
                value: '',
              },
            ]);
          });
        });
        context(`with the ${MINLENGTH} validation`, () => {
          context('using an integer value', () => {
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
                  value: '0',
                },
              ]);
            });
          });
          context('using a decimal value', () => {
            let parsedEntity;

            before(() => {
              const content = parseFromContent(
                `entity A {
  name String ${MINLENGTH}(0.01)
}
`
              );
              parsedEntity = content.entities[0];
            });

            it('should parse it', () => {
              expect(parsedEntity.body[0].validations).to.deep.equal([
                {
                  key: MINLENGTH,
                  value: '0.01',
                },
              ]);
            });
          });
        });
        context(`with the ${MAXLENGTH} validation`, () => {
          context('using an integer value', () => {
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
                  value: '42',
                },
              ]);
            });
          });
          context('using a decimal value', () => {
            let parsedEntity;

            before(() => {
              const content = parseFromContent(
                `entity A {
  name String ${MAXLENGTH}(42.01)
}
`
              );
              parsedEntity = content.entities[0];
            });

            it('should parse it', () => {
              expect(parsedEntity.body[0].validations).to.deep.equal([
                {
                  key: MAXLENGTH,
                  value: '42.01',
                },
              ]);
            });
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
                value: '[A-Za-z]\\d',
              },
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
                value: '',
              },
            ]);
          });
        });
        context(`with the ${MIN} validation`, () => {
          context('using an integer value', () => {
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
                  value: '0',
                },
              ]);
            });
          });
          context('using a decimal value', () => {
            let parsedEntity;

            before(() => {
              const content = parseFromContent(
                `entity A {
  name Integer ${MIN}(0.01)
}
`
              );
              parsedEntity = content.entities[0];
            });

            it('should parse it', () => {
              expect(parsedEntity.body[0].validations).to.deep.equal([
                {
                  key: MIN,
                  value: '0.01',
                },
              ]);
            });
          });
        });
        context(`with the ${MAX} validation`, () => {
          context('using an integer value', () => {
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
                  value: '0',
                },
              ]);
            });
          });
          context('using a decimal value', () => {
            let parsedEntity;

            before(() => {
              const content = parseFromContent(
                `entity A {
  name Integer ${MAX}(0.01)
}
`
              );
              parsedEntity = content.entities[0];
            });

            it('should parse it', () => {
              expect(parsedEntity.body[0].validations).to.deep.equal([
                {
                  key: MAX,
                  value: '0.01',
                },
              ]);
            });
          });
        });
        context(`with the ${MINBYTES} validation`, () => {
          context('using an integer value', () => {
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
                  value: '0',
                },
              ]);
            });
          });
          context('using a decimal value', () => {
            let parsedEntity;

            before(() => {
              const content = parseFromContent(
                `entity A {
  name TextBlob ${MINBYTES}(0.01)
}
`
              );
              parsedEntity = content.entities[0];
            });

            it('should parse it', () => {
              expect(parsedEntity.body[0].validations).to.deep.equal([
                {
                  key: MINBYTES,
                  value: '0.01',
                },
              ]);
            });
          });
        });
        context(`with the ${MAXBYTES} validation`, () => {
          context('using an integer value', () => {
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
                  value: '0',
                },
              ]);
            });
          });
          context('using a decimal value', () => {
            let parsedEntity;

            before(() => {
              const content = parseFromContent(
                `entity A {
  name TextBlob ${MAXBYTES}(0.01)
}
`
              );
              parsedEntity = content.entities[0];
            });

            it('should parse it', () => {
              expect(parsedEntity.body[0].validations).to.deep.equal([
                {
                  key: MAXBYTES,
                  value: '0.01',
                },
              ]);
            });
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
                constant: true,
              },
            ]);
          });
        });
      });
    });
  });
  context('when parsing enums', () => {
    context('with values separated by commas', () => {
      let parsedEnum;

      before(() => {
        const content = parseFromContent(
          `enum MyEnum {
  FRANCE,
  ENGLAND,
  ICELAND
}
`
        );
        parsedEnum = content.enums[0];
      });

      it('should parse them', () => {
        jestExpect(parsedEnum).toMatchInlineSnapshot(`
Object {
  "javadoc": null,
  "name": "MyEnum",
  "values": Array [
    Object {
      "key": "FRANCE",
    },
    Object {
      "key": "ENGLAND",
    },
    Object {
      "key": "ICELAND",
    },
  ],
}
`);
      });
    });
    context('with values separated by whitespaces', () => {
      let parsedEnum;

      before(() => {
        const content = parseFromContent(
          `enum MyEnum {
  FRANCE ENGLAND("aaa bbb ccc") ICELAND
  GERMANY
}
`
        );
        parsedEnum = content.enums[0];
      });

      it('should parse them', () => {
        jestExpect(parsedEnum).toMatchInlineSnapshot(`
Object {
  "javadoc": null,
  "name": "MyEnum",
  "values": Array [
    Object {
      "key": "FRANCE",
    },
    Object {
      "key": "ENGLAND",
      "value": "aaa bbb ccc",
    },
    Object {
      "key": "ICELAND",
    },
    Object {
      "key": "GERMANY",
    },
  ],
}
`);
      });
    });
    context('without custom values', () => {
      let parsedEnum;

      before(() => {
        const content = parseFromContent(
          `enum MyEnum {
  FRANCE,
  ENGLAND,
  ICELAND
}
`
        );
        parsedEnum = content.enums[0];
      });

      it('should parse it', () => {
        jestExpect(parsedEnum).toMatchInlineSnapshot(`
Object {
  "javadoc": null,
  "name": "MyEnum",
  "values": Array [
    Object {
      "key": "FRANCE",
    },
    Object {
      "key": "ENGLAND",
    },
    Object {
      "key": "ICELAND",
    },
  ],
}
`);
      });
    });

    context('without custom values but with comments', () => {
      let parsedEnum;

      before(() => {
        const content = parseFromContent(
          `
            /** country enum */
            enum MyEnum {
            /** some comment */FRANCE /** some comment */,
            /** some comment */ ITALY /** some comment */,
                                        ENGLAND /** some comment */,
                                        ICELAND/** some comment */,
            /** some comment */IRELAND,
            /** some comment */ CANADA
}
`
        );
        parsedEnum = content.enums[0];
      });

      it('should parse it', () => {
        jestExpect(parsedEnum).toMatchInlineSnapshot(`
Object {
  "javadoc": "country enum",
  "name": "MyEnum",
  "values": Array [
    Object {
      "comment": "some comment",
      "key": "FRANCE",
    },
    Object {
      "comment": "some comment",
      "key": "ITALY",
    },
    Object {
      "comment": "some comment",
      "key": "ENGLAND",
    },
    Object {
      "comment": "some comment",
      "key": "ICELAND",
    },
    Object {
      "comment": "some comment",
      "key": "IRELAND",
    },
    Object {
      "comment": "some comment",
      "key": "CANADA",
    },
  ],
}
`);
      });
    });

    context('with custom values containing spaces and with comments', () => {
      let parsedEnum;

      before(() => {
        const content = parseFromContent(
          `/** country enum */
            enum MyEnum {
            /** some comment */FRANCE ("cheese and wine country") /** some comment */,
            /** some comment */ ITALY /** some comment */,
                                        ENGLAND ("not a tea country") /** some comment */,
                                        ICELAND/** some comment */,
            /** some comment */IRELAND,
            /** some comment */ CANADA
}
`
        );
        parsedEnum = content.enums[0];
      });

      it('should parse it', () => {
        jestExpect(parsedEnum).toMatchInlineSnapshot(`
Object {
  "javadoc": "country enum",
  "name": "MyEnum",
  "values": Array [
    Object {
      "comment": "some comment",
      "key": "FRANCE",
      "value": "cheese and wine country",
    },
    Object {
      "comment": "some comment",
      "key": "ITALY",
    },
    Object {
      "comment": "some comment",
      "key": "ENGLAND",
      "value": "not a tea country",
    },
    Object {
      "comment": "some comment",
      "key": "ICELAND",
    },
    Object {
      "comment": "some comment",
      "key": "IRELAND",
    },
    Object {
      "comment": "some comment",
      "key": "CANADA",
    },
  ],
}
`);
      });
    });

    context('with custom values containing underscores and with comments', () => {
      let parsedEnum;

      before(() => {
        const content = parseFromContent(
          `enum MyEnum {
            /** some comment */FRANCE ("cheese_and_wine_country") /** some comment */,
            /** some comment */ ITALY /** some comment */,
                                        ENGLAND ("not_a_tea_country") /** some comment */,
                                        ICELAND/** some comment */,
            /** some comment */IRELAND,
            /** some comment */ CANADA
}
`
        );
        parsedEnum = content.enums[0];
      });

      it('should parse it', () => {
        jestExpect(parsedEnum).toMatchInlineSnapshot(`
Object {
  "javadoc": null,
  "name": "MyEnum",
  "values": Array [
    Object {
      "comment": "some comment",
      "key": "FRANCE",
      "value": "cheese_and_wine_country",
    },
    Object {
      "comment": "some comment",
      "key": "ITALY",
    },
    Object {
      "comment": "some comment",
      "key": "ENGLAND",
      "value": "not_a_tea_country",
    },
    Object {
      "comment": "some comment",
      "key": "ICELAND",
    },
    Object {
      "comment": "some comment",
      "key": "IRELAND",
    },
    Object {
      "comment": "some comment",
      "key": "CANADA",
    },
  ],
}
`);
      });
    });

    context('without values', () => {
      context('without spaces', () => {
        let parsedEnum;

        before(() => {
          const content = parseFromContent(
            `enum MyEnum {
  FRANCE (cheese_and_wine_country),
  ENGLAND (not_a_tea_country),
  ICELAND
}
`
          );
          parsedEnum = content.enums[0];
        });

        it('should parse it', () => {
          jestExpect(parsedEnum).toMatchInlineSnapshot(`
Object {
  "javadoc": null,
  "name": "MyEnum",
  "values": Array [
    Object {
      "key": "FRANCE",
      "value": "cheese_and_wine_country",
    },
    Object {
      "key": "ENGLAND",
      "value": "not_a_tea_country",
    },
    Object {
      "key": "ICELAND",
    },
  ],
}
`);
        });
      });
      context('with spaces', () => {
        let parsedEnum;

        before(() => {
          const content = parseFromContent(
            `enum MyEnum {
  FRANCE ("cheese and wine country"),
  ENGLAND ("not a tea country"),
  ICELAND
}
`
          );
          parsedEnum = content.enums[0];
        });

        it('should parse it', () => {
          jestExpect(parsedEnum).toMatchInlineSnapshot(`
Object {
  "javadoc": null,
  "name": "MyEnum",
  "values": Array [
    Object {
      "key": "FRANCE",
      "value": "cheese and wine country",
    },
    Object {
      "key": "ENGLAND",
      "value": "not a tea country",
    },
    Object {
      "key": "ICELAND",
    },
  ],
}
`);
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
          expect(relationship.cardinality).to.equal(relationshipType);
        });
      });
    });
    context('with only source & destination entities', () => {
      let relationship;

      before(() => {
        const content = parseFromContent('relationship OneToOne { A to B }');
        relationship = content.relationships[0];
      });

      it('should parse them', () => {
        jestExpect(relationship).toMatchInlineSnapshot(`
Object {
  "cardinality": "OneToOne",
  "from": Object {
    "injectedField": null,
    "javadoc": null,
    "name": "A",
  },
  "options": Object {
    "destination": Array [],
    "global": Array [],
    "source": Array [],
  },
  "to": Object {
    "injectedField": null,
    "javadoc": null,
    "name": "B",
  },
}
`);
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
        expect(relationship.options).to.deep.equal({
          global: [
            {
              optionName: 'jpaDerivedIdentifier',
              type: 'UNARY',
            },
          ],
          source: [],
          destination: [],
        });
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
          jestExpect(relationships).toMatchInlineSnapshot(`
Array [
  Object {
    "cardinality": "OneToOne",
    "from": Object {
      "injectedField": null,
      "javadoc": null,
      "name": "A",
    },
    "options": Object {
      "destination": Array [],
      "global": Array [
        Object {
          "optionName": "jpaDerivedIdentifier",
          "type": "UNARY",
        },
      ],
      "source": Array [],
    },
    "to": Object {
      "injectedField": null,
      "javadoc": null,
      "name": "B",
    },
  },
  Object {
    "cardinality": "OneToOne",
    "from": Object {
      "injectedField": null,
      "javadoc": null,
      "name": "B",
    },
    "options": Object {
      "destination": Array [],
      "global": Array [],
      "source": Array [],
    },
    "to": Object {
      "injectedField": null,
      "javadoc": null,
      "name": "C",
    },
  },
  Object {
    "cardinality": "OneToOne",
    "from": Object {
      "injectedField": null,
      "javadoc": null,
      "name": "D",
    },
    "options": Object {
      "destination": Array [],
      "global": Array [
        Object {
          "optionName": "jpaDerivedIdentifier",
          "type": "UNARY",
        },
      ],
      "source": Array [],
    },
    "to": Object {
      "injectedField": null,
      "javadoc": null,
      "name": "E",
    },
  },
]
`);
        });
      });
    });
    context('with annotations', () => {
      context('only in the source side', () => {
        let relationships;

        before(() => {
          const content = parseFromContent('relationship OneToOne { @id A to B }');
          relationships = content.relationships;
        });

        it('should parse them', () => {
          jestExpect(relationships).toMatchInlineSnapshot(`
Array [
  Object {
    "cardinality": "OneToOne",
    "from": Object {
      "injectedField": null,
      "javadoc": null,
      "name": "A",
    },
    "options": Object {
      "destination": Array [],
      "global": Array [],
      "source": Array [
        Object {
          "optionName": "id",
          "type": "UNARY",
        },
      ],
    },
    "to": Object {
      "injectedField": null,
      "javadoc": null,
      "name": "B",
    },
  },
]
`);
        });
      });
      context('only in the destination side', () => {
        let relationships;

        before(() => {
          const content = parseFromContent('relationship OneToOne { A to @id B }');
          relationships = content.relationships;
        });

        it('should parse them', () => {
          jestExpect(relationships).toMatchInlineSnapshot(`
Array [
  Object {
    "cardinality": "OneToOne",
    "from": Object {
      "injectedField": null,
      "javadoc": null,
      "name": "A",
    },
    "options": Object {
      "destination": Array [
        Object {
          "optionName": "id",
          "type": "UNARY",
        },
      ],
      "global": Array [],
      "source": Array [],
    },
    "to": Object {
      "injectedField": null,
      "javadoc": null,
      "name": "B",
    },
  },
]
`);
        });
      });
      context('in both sides', () => {
        let relationships;

        before(() => {
          const content = parseFromContent('relationship OneToOne { @id A to @id B }');
          relationships = content.relationships;
        });

        it('should parse them', () => {
          jestExpect(relationships).toMatchInlineSnapshot(`
Array [
  Object {
    "cardinality": "OneToOne",
    "from": Object {
      "injectedField": null,
      "javadoc": null,
      "name": "A",
    },
    "options": Object {
      "destination": Array [
        Object {
          "optionName": "id",
          "type": "UNARY",
        },
      ],
      "global": Array [],
      "source": Array [
        Object {
          "optionName": "id",
          "type": "UNARY",
        },
      ],
    },
    "to": Object {
      "injectedField": null,
      "javadoc": null,
      "name": "B",
    },
  },
]
`);
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
          parsedOption = content.options.skipClient;
        });

        it('should add the exclusions', () => {
          jestExpect(parsedOption).toMatchInlineSnapshot(`
Object {
  "excluded": Array [
    "A",
  ],
  "list": Array [
    "*",
  ],
}
`);
        });
      });
      [READ_ONLY, EMBEDDED, SKIP_CLIENT, SKIP_SERVER, FILTER, NO_FLUENT_METHOD].forEach(option => {
        context(option, () => {
          let parsedOption;

          before(() => {
            const content = parseFromContent(`${option} A`);
            parsedOption = content.options[option];
          });

          it('should parse it', () => {
            expect(parsedOption).to.deep.equal({
              list: ['A'],
              excluded: [],
            });
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
            parsedOption = content.options.clientRootFolder;
          });

          it('should parse it', () => {
            jestExpect(parsedOption).toMatchInlineSnapshot(`
Object {
  "client": Object {
    "excluded": Array [],
    "list": Array [
      "*",
    ],
  },
}
`);
          });
        });
        context('in the path form', () => {
          let parsedOption;

          before(() => {
            const content = parseFromContent('clientRootFolder * with "../../toto"');
            parsedOption = content.options.clientRootFolder;
          });

          it('should parse it', () => {
            jestExpect(parsedOption).toMatchInlineSnapshot(`
Object {
  "\\"../../toto\\"": Object {
    "excluded": Array [],
    "list": Array [
      "*",
    ],
  },
}
`);
          });
        });
      });
      context('with exclusions', () => {
        let parsedOption;

        before(() => {
          const content = parseFromContent('dto * with mapstruct except A');
          parsedOption = content.options.dto;
        });

        it('should add the exclusions', () => {
          jestExpect(parsedOption).toMatchInlineSnapshot(`
Object {
  "mapstruct": Object {
    "excluded": Array [
      "A",
    ],
    "list": Array [
      "*",
    ],
  },
}
`);
        });
      });
      [SEARCH, SERVICE, PAGINATION, DTO].forEach(option => {
        context(option, () => {
          Object.keys(Values[option]).forEach(key => {
            let parsedOption;
            const value = Values[option][key];

            before(() => {
              const content = parseFromContent(`${option === PAGINATION ? 'paginate' : option} A with ${value}`);
              parsedOption = content.options[option][value];
            });

            it(`should parse ${value} value`, () => {
              expect(parsedOption).to.deep.equal({
                list: ['A'],
                excluded: [],
              });
            });
          });
        });
      });
      [MICROSERVICE, ANGULAR_SUFFIX].forEach(option => {
        context(option, () => {
          let parsedOption;

          before(() => {
            const content = parseFromContent(`${option} A with toto`);
            parsedOption = content.options[option].toto;
          });

          it('should parse it', () => {
            expect(parsedOption).to.deep.equal({
              list: ['A'],
              excluded: [],
            });
          });
        });
      });
    });
    context("using the 'all' keyword", () => {
      let parsedOption;

      before(() => {
        const content = parseFromContent('clientRootFolder all with client');
        parsedOption = content.options.clientRootFolder;
      });

      it("should parse it as '*'", () => {
        jestExpect(parsedOption).toMatchInlineSnapshot(`
Object {
  "client": Object {
    "excluded": Array [],
    "list": Array [
      "*",
    ],
  },
}
`);
      });
    });
    context("using the '*' keyword", () => {
      let parsedOption;

      before(() => {
        const content = parseFromContent('clientRootFolder * with client');
        parsedOption = content.options.clientRootFolder;
      });

      it('should parse it', () => {
        jestExpect(parsedOption).toMatchInlineSnapshot(`
Object {
  "client": Object {
    "excluded": Array [],
    "list": Array [
      "*",
    ],
  },
}
`);
      });
    });
    context('using the use-form', () => {
      Object.keys(OptionValues).forEach(optionValue => {
        context(`of ${optionValue}`, () => {
          let parsedOptions;

          before(() => {
            const content = parseFromContent(`use ${optionValue} for A`);
            parsedOptions = content.useOptions;
          });

          it('should parse it', () => {
            expect(parsedOptions).to.deep.equal([
              {
                excluded: [],
                list: ['A'],
                optionValues: [optionValue],
              },
            ]);
          });
        });
      });
    });
  });
  context('when parsing deployments', () => {
    context('with kubernetesStorageClassName', () => {
      context('being empty', () => {
        let parsedDeployment;

        before(() => {
          const content = parseFromContent(
            `deployment {
  kubernetesStorageClassName ""
}
`
          );
          parsedDeployment = content.deployments[0];
        });

        it('should parse it', () => {
          jestExpect(parsedDeployment).toMatchInlineSnapshot(`
Object {
  "kubernetesStorageClassName": "",
}
`);
        });
      });
      context('being set', () => {
        let parsedDeployment;

        before(() => {
          const content = parseFromContent(
            `deployment {
  kubernetesStorageClassName "SetValue"
}
`
          );
          parsedDeployment = content.deployments[0];
        });

        it('should parse it', () => {
          jestExpect(parsedDeployment).toMatchInlineSnapshot(`
Object {
  "kubernetesStorageClassName": "SetValue",
}
`);
        });
      });
    });
  });
});
