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

import { after, before, describe, esmocha, expect, it } from 'esmocha';

import { APPLICATION_TYPE_MICROSERVICE } from '../../../core/application-types.ts';
import { getDefaultJDLEntityConfig } from '../../../jdl-config/jdl-entity-config.ts';
import { getDefaultJDLRelationshipConfig } from '../../../jdl-config/jdl-relationship-config.ts';
import { createJDLRuntime, getDefaultRuntime } from '../../../jdl-config/jdl-runtime.ts';
import { relationshipTypes } from '../basic-types/index.ts';
import { binaryOptions, unaryOptions, validations } from '../built-in-options/index.ts';
import { parseFromContent as originalParseFromContent } from '../readers/jdl-reader.ts';
import logger from '../utils/objects/logger.ts';

import type { ParsedJDLApplications, ParsedJDLOption } from './types/parsed.ts';

const runtime = getDefaultRuntime();
const parseFromContent = (content: string) => originalParseFromContent(content, runtime);

const { ONE_TO_MANY, MANY_TO_ONE, MANY_TO_MANY, ONE_TO_ONE } = relationshipTypes;
const {
  Validations: { MAX, MAXBYTES, MAXLENGTH, MIN, MINBYTES, MINLENGTH, PATTERN, REQUIRED, UNIQUE },
} = validations;
const { READ_ONLY, NO_FLUENT_METHOD, FILTER, SKIP_SERVER, SKIP_CLIENT, EMBEDDED } = unaryOptions;

const { Options, Values } = binaryOptions;
// The values a `use` statement accepts: every binary option value but `no`.
const useValues = Object.values(getDefaultJDLEntityConfig().configs)
  .flatMap(option => option.choices ?? [])
  .filter(value => value !== 'no');

const { SEARCH, SERVICE, PAGINATION, DTO, ANGULAR_SUFFIX } = Options;

describe('jdl - Grammar tests', () => {
  describe('when parsing constants', () => {
    describe('with integer values', () => {
      let constants: ParsedJDLApplications['constants'];

      before(() => {
        const content = parseFromContent(`MIN = 42
MAX = 43`);
        ({ constants } = content);
      });

      it('should parse them', () => {
        expect(constants).toMatchInlineSnapshot(`
{
  "MAX": "43",
  "MIN": "42",
}
`);
      });
    });
    describe('with decimal values', () => {
      let constants: ParsedJDLApplications['constants'];

      before(() => {
        const content = parseFromContent('MIN = 42.42');
        ({ constants } = content);
      });

      it('should parse them', () => {
        expect(constants).toMatchInlineSnapshot(`
{
  "MIN": "42.42",
}
`);
      });
    });
  });
  describe('when parsing applications', () => {
    describe('with no custom configuration', () => {
      let application: ParsedJDLApplications['applications'][number];

      before(() => {
        const content = parseFromContent('application {}');
        application = content.applications[0];
      });

      it('should parse it', () => {
        expect(application).toMatchInlineSnapshot(`
{
  "config": {},
  "entities": [],
  "entitiesOptions": {
    "entityList": [],
    "excluded": [],
  },
  "namespaceConfigs": {},
  "options": {},
  "useOptions": [],
}
`);
      });
    });
    describe('with a custom configuration', () => {
      describe('when setting the applicationType', () => {
        let application: ParsedJDLApplications['applications'][number];

        before(() => {
          const content = parseFromContent(`application {
  config {
    applicationType monolith
  }
}`);
          application = content.applications[0];
        });

        it('should parse it', () => {
          expect(application).toMatchInlineSnapshot(`
{
  "config": {
    "applicationType": "monolith",
  },
  "entities": [],
  "entitiesOptions": {
    "entityList": [],
    "excluded": [],
  },
  "namespaceConfigs": {},
  "options": {},
  "useOptions": [],
}
`);
        });
      });
      describe('when setting the baseName', () => {
        let application: ParsedJDLApplications['applications'][number];

        before(() => {
          const content = parseFromContent(`application {
  config {
    baseName toto
  }
}`);
          application = content.applications[0];
        });

        it('should parse it', () => {
          expect(application).toMatchInlineSnapshot(`
{
  "config": {
    "baseName": "toto",
  },
  "entities": [],
  "entitiesOptions": {
    "entityList": [],
    "excluded": [],
  },
  "namespaceConfigs": {},
  "options": {},
  "useOptions": [],
}
`);
        });
      });
      describe('when setting the blueprints', () => {
        let application: ParsedJDLApplications['applications'][number];

        before(() => {
          const content = parseFromContent(`application {
  config {
    blueprints [generator-jhipster-vuejs, generator-jhipster-nodejs]
  }
}`);
          application = content.applications[0];
        });

        it('should parse it', () => {
          expect(application).toMatchInlineSnapshot(`
{
  "config": {
    "blueprints": [
      "generator-jhipster-vuejs",
      "generator-jhipster-nodejs",
    ],
  },
  "entities": [],
  "entitiesOptions": {
    "entityList": [],
    "excluded": [],
  },
  "namespaceConfigs": {},
  "options": {},
  "useOptions": [],
}
`);
        });
      });
    });
    describe('with more than one application', () => {
      let applications: ParsedJDLApplications['applications'];

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
        ({ applications } = content);
      });

      it('should parse them', () => {
        expect(applications).toMatchInlineSnapshot(`
[
  {
    "config": {
      "applicationType": "monolith",
      "baseName": "superApp2",
    },
    "entities": [],
    "entitiesOptions": {
      "entityList": [],
      "excluded": [],
    },
    "namespaceConfigs": {},
    "options": {},
    "useOptions": [],
  },
  {
    "config": {
      "applicationType": "monolith",
      "baseName": "superApp1",
    },
    "entities": [],
    "entitiesOptions": {
      "entityList": [],
      "excluded": [],
    },
    "namespaceConfigs": {},
    "options": {},
    "useOptions": [],
  },
]
`);
      });
    });
    describe('when having entities', () => {
      describe('without exclusions', () => {
        let application: ParsedJDLApplications['applications'][number];

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
          expect(application.entities).toEqual(['A', 'B', 'C']);
        });
      });
      describe('with exclusions', () => {
        describe("using the 'all' keyword", () => {
          let application: ParsedJDLApplications['applications'][number];

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
            expect(application.entities).toEqual(['B', 'C']);
          });
        });
        describe("using the '*' keyword", () => {
          let application: ParsedJDLApplications['applications'][number];

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
            expect(application.entities).toEqual(['B', 'C']);
          });
        });
      });
    });
    describe('when having options', () => {
      let application: ParsedJDLApplications['applications'][number];

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
        expect(application.options).toEqual({
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
    describe('when having options in the use form', () => {
      let application: ParsedJDLApplications['applications'][number];

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
        expect(application.useOptions).toEqual([
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
  describe('when parsing an entity', () => {
    describe('with a name', () => {
      let parsedEntity: ParsedJDLApplications['entities'][number];

      before(() => {
        const content = parseFromContent('entity A');
        parsedEntity = content.entities[0];
      });

      it('should parse it', () => {
        expect(parsedEntity).toMatchInlineSnapshot(`
{
  "annotations": [],
  "body": [],
  "documentation": null,
  "name": "A",
  "tableName": undefined,
}
`);
      });
    });
    describe('with a name and a table name', () => {
      let parsedEntity: ParsedJDLApplications['entities'][number];

      before(() => {
        const content = parseFromContent('entity A(a_table)');
        parsedEntity = content.entities[0];
      });

      it('should parse it', () => {
        expect(parsedEntity).toMatchInlineSnapshot(`
{
  "annotations": [],
  "body": [],
  "documentation": null,
  "name": "A",
  "tableName": "a_table",
}
`);
      });
    });
    describe('without fields', () => {
      describe('if using curly braces or not', () => {
        let firstDeclaration: ParsedJDLApplications['entities'][number];
        let secondDeclaration: ParsedJDLApplications['entities'][number];

        before(() => {
          const firstContent = parseFromContent('entity A');
          const secondContent = parseFromContent('entity A {}');
          firstDeclaration = firstContent.entities[0];
          secondDeclaration = secondContent.entities[0];
        });

        it('should produce the same result', () => {
          expect(firstDeclaration).toEqual(secondDeclaration);
        });
      });
    });
    describe('with boolean annotation values', () => {
      it('should parse them as booleans, a boolean being a name', () => {
        const content = parseFromContent('@readOnly(true)\n@embedded(false)\nentity A');
        expect(content.entities[0].annotations).toEqual([
          { optionName: 'readOnly', optionValue: true, type: 'BINARY' },
          { optionName: 'embedded', optionValue: false, type: 'BINARY' },
        ]);
      });
    });
    describe('with annotations', () => {
      let parsedEntity: ParsedJDLApplications['entities'][number];

      before(() => {
        const content = parseFromContent(`@dto(mapstruct)
@service(serviceClass)
@readOnly
@customAnnotation(value1)
@customAnnotation2(2)
@customAnnotation3(2.42)
@customAnnotation4("foo bar $")
@customAnnotation5("java(\\"a\\" + b)")
entity A`);
        parsedEntity = content.entities[0];
      });

      it('should parse it', () => {
        expect(parsedEntity).toMatchInlineSnapshot(`
{
  "annotations": [
    {
      "optionName": "dto",
      "optionValue": "mapstruct",
      "type": "BINARY",
    },
    {
      "optionName": "service",
      "optionValue": "serviceClass",
      "type": "BINARY",
    },
    {
      "optionName": "readOnly",
      "type": "UNARY",
    },
    {
      "optionName": "customAnnotation",
      "optionValue": "value1",
      "type": "BINARY",
    },
    {
      "optionName": "customAnnotation2",
      "optionValue": 2,
      "type": "BINARY",
    },
    {
      "optionName": "customAnnotation3",
      "optionValue": 2.42,
      "type": "BINARY",
    },
    {
      "optionName": "customAnnotation4",
      "optionValue": "foo bar $",
      "type": "BINARY",
    },
    {
      "optionName": "customAnnotation5",
      "optionValue": "java(\\"a\\" + b)",
      "type": "BINARY",
    },
  ],
  "body": [],
  "documentation": null,
  "name": "A",
  "tableName": undefined,
}
`);
      });
    });
    describe('with comments', () => {
      describe('with single-line comments', () => {
        let parsedEntity: ParsedJDLApplications['entities'][number];

        before(() => {
          const content = parseFromContent('/** A comment */\nentity A');
          parsedEntity = content.entities[0];
        });

        it('should parse it', () => {
          expect(parsedEntity).toMatchInlineSnapshot(`
{
  "annotations": [],
  "body": [],
  "documentation": "A comment",
  "name": "A",
  "tableName": undefined,
}
`);
        });
      });
      describe('with multi-line comments', () => {
        let parsedEntity: ParsedJDLApplications['entities'][number];

        before(() => {
          const content = parseFromContent(`/**
 * Big
 * comment.
 */
 entity A`);
          parsedEntity = content.entities[0];
        });

        it('should parse it', () => {
          expect(parsedEntity).toMatchInlineSnapshot(`
{
  "annotations": [],
  "body": [],
  "documentation": "
 * Big
 * comment.
",
  "name": "A",
  "tableName": undefined,
}
`);
        });
      });
    });
    describe('with annotations and comments', () => {
      describe('when comments appear before annotations', () => {
        let parsedEntity: ParsedJDLApplications['entities'][number];

        before(() => {
          const content = parseFromContent(
            `/** A comment */
 @id
 entity A
 `,
          );
          parsedEntity = content.entities[0];
        });

        it('should parse it', () => {
          expect(parsedEntity).toMatchInlineSnapshot(`
{
  "annotations": [
    {
      "optionName": "id",
      "type": "UNARY",
    },
  ],
  "body": [],
  "documentation": "A comment",
  "name": "A",
  "tableName": undefined,
}
`);
        });
      });
      describe('when comments appear after annotations', () => {
        it('should fail', () => {
          expect(() => {
            parseFromContent(
              `@id
 /** A comment */
 entity A
 `,
            );
          }).toThrow();
        });
      });
    });
    describe('with fields', () => {
      describe('having annotations and comments', () => {
        describe('when comments appear before annotations', () => {
          let parsedEntity: ParsedJDLApplications['entities'][number];

          before(() => {
            const content = parseFromContent(
              `entity A {
  /** field comment */
  @something
  name String
}
`,
            );
            parsedEntity = content.entities[0];
          });

          it('should parse it', () => {
            expect(parsedEntity).toMatchInlineSnapshot(`
{
  "annotations": [],
  "body": [
    {
      "annotations": [
        {
          "optionName": "something",
          "type": "UNARY",
        },
      ],
      "documentation": "field comment",
      "name": "name",
      "type": "String",
      "validations": [],
    },
  ],
  "documentation": null,
  "name": "A",
  "tableName": undefined,
}
`);
          });
        });
        describe('when comments appear after annotations', () => {
          it('should fail', () => {
            expect(() => {
              parseFromContent(`entity A {
  @something
  /** a comment */
  name String
}
`);
            }).toThrow();
          });
        });
      });
      describe('with validations', () => {
        describe(`with the ${REQUIRED} validation`, () => {
          let parsedEntity: ParsedJDLApplications['entities'][number];

          before(() => {
            const content = parseFromContent(
              `entity A {
  name String ${REQUIRED}
}
`,
            );
            parsedEntity = content.entities[0];
          });

          it('should parse it', () => {
            expect(parsedEntity.body?.[0].validations).toEqual([
              {
                key: REQUIRED,
                value: '',
              },
            ]);
          });
        });
        describe(`with the ${MINLENGTH} validation`, () => {
          describe('using an integer value', () => {
            let parsedEntity: ParsedJDLApplications['entities'][number];

            before(() => {
              const content = parseFromContent(
                `entity A {
  name String ${MINLENGTH}(0)
}
`,
              );
              parsedEntity = content.entities[0];
            });

            it('should parse it', () => {
              expect(parsedEntity.body?.[0].validations).toEqual([
                {
                  key: MINLENGTH,
                  value: '0',
                },
              ]);
            });
          });
          describe('using a decimal value', () => {
            let parsedEntity: ParsedJDLApplications['entities'][number];

            before(() => {
              const content = parseFromContent(
                `entity A {
  name String ${MINLENGTH}(0.01)
}
`,
              );
              parsedEntity = content.entities[0];
            });

            it('should parse it', () => {
              expect(parsedEntity.body?.[0].validations).toEqual([
                {
                  key: MINLENGTH,
                  value: '0.01',
                },
              ]);
            });
          });
        });
        describe(`with the ${MAXLENGTH} validation`, () => {
          describe('using an integer value', () => {
            let parsedEntity: ParsedJDLApplications['entities'][number];

            before(() => {
              const content = parseFromContent(
                `entity A {
  name String ${MAXLENGTH}(42)
}
`,
              );
              parsedEntity = content.entities[0];
            });

            it('should parse it', () => {
              expect(parsedEntity.body?.[0].validations).toEqual([
                {
                  key: MAXLENGTH,
                  value: '42',
                },
              ]);
            });
          });
          describe('using a decimal value', () => {
            let parsedEntity: ParsedJDLApplications['entities'][number];

            before(() => {
              const content = parseFromContent(
                `entity A {
  name String ${MAXLENGTH}(42.01)
}
`,
              );
              parsedEntity = content.entities[0];
            });

            it('should parse it', () => {
              expect(parsedEntity.body?.[0].validations).toEqual([
                {
                  key: MAXLENGTH,
                  value: '42.01',
                },
              ]);
            });
          });
        });
        describe(`with the ${PATTERN} validation`, () => {
          let parsedEntity: ParsedJDLApplications['entities'][number];

          before(() => {
            const content = parseFromContent(
              String.raw`entity A {
  name String ${PATTERN}(/[A-Za-z]\d/)
}
`,
            );
            parsedEntity = content.entities[0];
          });

          it('should parse it', () => {
            expect(parsedEntity.body?.[0].validations).toEqual([
              {
                key: PATTERN,
                value: String.raw`[A-Za-z]\d`,
              },
            ]);
          });
        });
        describe(`with the ${UNIQUE} validation`, () => {
          let parsedEntity: ParsedJDLApplications['entities'][number];

          before(() => {
            const content = parseFromContent(
              `entity A {
  name String ${UNIQUE}
}
`,
            );
            parsedEntity = content.entities[0];
          });

          it('should parse it', () => {
            expect(parsedEntity.body?.[0].validations).toEqual([
              {
                key: UNIQUE,
                value: '',
              },
            ]);
          });
        });
        describe(`with the ${MIN} validation`, () => {
          describe('using an integer value', () => {
            let parsedEntity: ParsedJDLApplications['entities'][number];

            before(() => {
              const content = parseFromContent(
                `entity A {
  name Integer ${MIN}(0)
}
`,
              );
              parsedEntity = content.entities[0];
            });

            it('should parse it', () => {
              expect(parsedEntity.body?.[0].validations).toEqual([
                {
                  key: MIN,
                  value: '0',
                },
              ]);
            });
          });
          describe('using a decimal value', () => {
            let parsedEntity: ParsedJDLApplications['entities'][number];

            before(() => {
              const content = parseFromContent(
                `entity A {
  name Integer ${MIN}(0.01)
}
`,
              );
              parsedEntity = content.entities[0];
            });

            it('should parse it', () => {
              expect(parsedEntity.body?.[0].validations).toEqual([
                {
                  key: MIN,
                  value: '0.01',
                },
              ]);
            });
          });
        });
        describe(`with the ${MAX} validation`, () => {
          describe('using an integer value', () => {
            let parsedEntity: ParsedJDLApplications['entities'][number];

            before(() => {
              const content = parseFromContent(
                `entity A {
  name Integer ${MAX}(0)
}
`,
              );
              parsedEntity = content.entities[0];
            });

            it('should parse it', () => {
              expect(parsedEntity.body?.[0].validations).toEqual([
                {
                  key: MAX,
                  value: '0',
                },
              ]);
            });
          });
          describe('using a decimal value', () => {
            let parsedEntity: ParsedJDLApplications['entities'][number];

            before(() => {
              const content = parseFromContent(
                `entity A {
  name Integer ${MAX}(0.01)
}
`,
              );
              parsedEntity = content.entities[0];
            });

            it('should parse it', () => {
              expect(parsedEntity.body?.[0].validations).toEqual([
                {
                  key: MAX,
                  value: '0.01',
                },
              ]);
            });
          });
        });
        describe(`with the ${MINBYTES} validation`, () => {
          describe('using an integer value', () => {
            let parsedEntity: ParsedJDLApplications['entities'][number];

            before(() => {
              const content = parseFromContent(
                `entity A {
  name TextBlob ${MINBYTES}(0)
}
`,
              );
              parsedEntity = content.entities[0];
            });

            it('should parse it', () => {
              expect(parsedEntity.body?.[0].validations).toEqual([
                {
                  key: MINBYTES,
                  value: '0',
                },
              ]);
            });
          });
          describe('using a decimal value', () => {
            let parsedEntity: ParsedJDLApplications['entities'][number];

            before(() => {
              const content = parseFromContent(
                `entity A {
  name TextBlob ${MINBYTES}(0.01)
}
`,
              );
              parsedEntity = content.entities[0];
            });

            it('should parse it', () => {
              expect(parsedEntity.body?.[0].validations).toEqual([
                {
                  key: MINBYTES,
                  value: '0.01',
                },
              ]);
            });
          });
        });
        describe(`with the ${MAXBYTES} validation`, () => {
          describe('using an integer value', () => {
            let parsedEntity: ParsedJDLApplications['entities'][number];

            before(() => {
              const content = parseFromContent(
                `entity A {
  name TextBlob ${MAXBYTES}(0)
}
`,
              );
              parsedEntity = content.entities[0];
            });

            it('should parse it', () => {
              expect(parsedEntity.body?.[0].validations).toEqual([
                {
                  key: MAXBYTES,
                  value: '0',
                },
              ]);
            });
          });
          describe('using a decimal value', () => {
            let parsedEntity: ParsedJDLApplications['entities'][number];

            before(() => {
              const content = parseFromContent(
                `entity A {
  name TextBlob ${MAXBYTES}(0.01)
}
`,
              );
              parsedEntity = content.entities[0];
            });

            it('should parse it', () => {
              expect(parsedEntity.body?.[0].validations).toEqual([
                {
                  key: MAXBYTES,
                  value: '0.01',
                },
              ]);
            });
          });
        });
        describe('using constants', () => {
          let parsedEntity: ParsedJDLApplications['entities'][number];

          before(() => {
            const content = parseFromContent(
              `MAX=42
entity A {
  name TextBlob ${MAXBYTES}(MAX)
}
`,
            );
            parsedEntity = content.entities[0];
          });

          it('should parse it', () => {
            expect(parsedEntity.body?.[0].validations).toEqual([
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
  describe('when parsing enums', () => {
    describe('with values separated by commas', () => {
      let parsedEnum: ParsedJDLApplications['enums'][number];

      before(() => {
        const content = parseFromContent(
          `enum MyEnum {
  FRANCE,
  ENGLAND,
  ICELAND
}
`,
        );
        parsedEnum = content.enums[0];
      });

      it('should parse them', () => {
        expect(parsedEnum).toMatchInlineSnapshot(`
{
  "documentation": null,
  "name": "MyEnum",
  "values": [
    {
      "key": "FRANCE",
    },
    {
      "key": "ENGLAND",
    },
    {
      "key": "ICELAND",
    },
  ],
}
`);
      });
    });
    describe('with values separated by whitespaces', () => {
      let parsedEnum: ParsedJDLApplications['enums'][number];

      before(() => {
        const content = parseFromContent(
          `enum MyEnum {
  FRANCE ENGLAND("aaa bbb ccc") ICELAND
  GERMANY
}
`,
        );
        parsedEnum = content.enums[0];
      });

      it('should parse them', () => {
        expect(parsedEnum).toMatchInlineSnapshot(`
{
  "documentation": null,
  "name": "MyEnum",
  "values": [
    {
      "key": "FRANCE",
    },
    {
      "key": "ENGLAND",
      "value": "aaa bbb ccc",
    },
    {
      "key": "ICELAND",
    },
    {
      "key": "GERMANY",
    },
  ],
}
`);
      });
    });
    describe('without custom values', () => {
      let parsedEnum: ParsedJDLApplications['enums'][number];

      before(() => {
        const content = parseFromContent(
          `enum MyEnum {
  FRANCE,
  ENGLAND,
  ICELAND
}
`,
        );
        parsedEnum = content.enums[0];
      });

      it('should parse it', () => {
        expect(parsedEnum).toMatchInlineSnapshot(`
{
  "documentation": null,
  "name": "MyEnum",
  "values": [
    {
      "key": "FRANCE",
    },
    {
      "key": "ENGLAND",
    },
    {
      "key": "ICELAND",
    },
  ],
}
`);
      });
    });

    describe('without custom values but with comments', () => {
      let parsedEnum: ParsedJDLApplications['enums'][number];

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
`,
        );
        parsedEnum = content.enums[0];
      });

      it('should parse it', () => {
        expect(parsedEnum).toMatchInlineSnapshot(`
{
  "documentation": "country enum",
  "name": "MyEnum",
  "values": [
    {
      "comment": "some comment",
      "key": "FRANCE",
    },
    {
      "comment": "some comment",
      "key": "ITALY",
    },
    {
      "comment": "some comment",
      "key": "ENGLAND",
    },
    {
      "comment": "some comment",
      "key": "ICELAND",
    },
    {
      "comment": "some comment",
      "key": "IRELAND",
    },
    {
      "comment": "some comment",
      "key": "CANADA",
    },
  ],
}
`);
      });
    });

    describe('with custom values containing spaces and with comments', () => {
      let parsedEnum: ParsedJDLApplications['enums'][number];

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
`,
        );
        parsedEnum = content.enums[0];
      });

      it('should parse it', () => {
        expect(parsedEnum).toMatchInlineSnapshot(`
{
  "documentation": "country enum",
  "name": "MyEnum",
  "values": [
    {
      "comment": "some comment",
      "key": "FRANCE",
      "value": "cheese and wine country",
    },
    {
      "comment": "some comment",
      "key": "ITALY",
    },
    {
      "comment": "some comment",
      "key": "ENGLAND",
      "value": "not a tea country",
    },
    {
      "comment": "some comment",
      "key": "ICELAND",
    },
    {
      "comment": "some comment",
      "key": "IRELAND",
    },
    {
      "comment": "some comment",
      "key": "CANADA",
    },
  ],
}
`);
      });
    });

    describe('with custom values containing underscores and with comments', () => {
      let parsedEnum: ParsedJDLApplications['enums'][number];

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
`,
        );
        parsedEnum = content.enums[0];
      });

      it('should parse it', () => {
        expect(parsedEnum).toMatchInlineSnapshot(`
{
  "documentation": null,
  "name": "MyEnum",
  "values": [
    {
      "comment": "some comment",
      "key": "FRANCE",
      "value": "cheese_and_wine_country",
    },
    {
      "comment": "some comment",
      "key": "ITALY",
    },
    {
      "comment": "some comment",
      "key": "ENGLAND",
      "value": "not_a_tea_country",
    },
    {
      "comment": "some comment",
      "key": "ICELAND",
    },
    {
      "comment": "some comment",
      "key": "IRELAND",
    },
    {
      "comment": "some comment",
      "key": "CANADA",
    },
  ],
}
`);
      });
    });

    describe('without values', () => {
      describe('without spaces', () => {
        let parsedEnum: ParsedJDLApplications['enums'][number];

        before(() => {
          const content = parseFromContent(
            `enum MyEnum {
  FRANCE (cheese_and_wine_country),
  ENGLAND (not_a_tea_country),
  ICELAND
}
`,
          );
          parsedEnum = content.enums[0];
        });

        it('should parse it', () => {
          expect(parsedEnum).toMatchInlineSnapshot(`
{
  "documentation": null,
  "name": "MyEnum",
  "values": [
    {
      "key": "FRANCE",
      "value": "cheese_and_wine_country",
    },
    {
      "key": "ENGLAND",
      "value": "not_a_tea_country",
    },
    {
      "key": "ICELAND",
    },
  ],
}
`);
        });
      });
      describe('with spaces', () => {
        let parsedEnum: ParsedJDLApplications['enums'][number];

        before(() => {
          const content = parseFromContent(
            `enum MyEnum {
  FRANCE ("cheese and wine country"),
  ENGLAND ("not a tea country"),
  ICELAND
}
`,
          );
          parsedEnum = content.enums[0];
        });

        it('should parse it', () => {
          expect(parsedEnum).toMatchInlineSnapshot(`
{
  "documentation": null,
  "name": "MyEnum",
  "values": [
    {
      "key": "FRANCE",
      "value": "cheese and wine country",
    },
    {
      "key": "ENGLAND",
      "value": "not a tea country",
    },
    {
      "key": "ICELAND",
    },
  ],
}
`);
        });
      });
    });
  });
  describe('when parsing a relationship', () => {
    [ONE_TO_ONE, MANY_TO_MANY, MANY_TO_ONE, ONE_TO_MANY].forEach(relationshipType => {
      describe(`for a ${relationshipType} relationship`, () => {
        let relationship: ParsedJDLApplications['relationships'][number];

        before(() => {
          const content = parseFromContent(`relationship ${relationshipType} { A to B }`);
          relationship = content.relationships[0];
        });

        it('should parse it', () => {
          expect(relationship.cardinality).toBe(relationshipType);
        });
      });
    });
    describe('with only source & destination entities', () => {
      let relationship: ParsedJDLApplications['relationships'][number];

      before(() => {
        const content = parseFromContent('relationship OneToOne { A to B }');
        relationship = content.relationships[0];
      });

      it('should parse them', () => {
        expect(relationship).toMatchInlineSnapshot(`
{
  "cardinality": "OneToOne",
  "from": {
    "documentation": null,
    "injectedField": null,
    "name": "A",
  },
  "options": {
    "destination": [],
    "global": [],
    "source": [],
  },
  "to": {
    "documentation": null,
    "injectedField": null,
    "name": "B",
  },
}
`);
      });
    });
    describe('with an injected field in the source', () => {
      describe('that is not required', () => {
        let relationship: ParsedJDLApplications['relationships'][number];

        before(() => {
          const content = parseFromContent('relationship OneToOne { A{b} to B }');
          relationship = content.relationships[0];
        });

        it('should add it', () => {
          expect(relationship.from.injectedField).toBe('b');
        });
        it('should set the field requirement to false', () => {
          expect(relationship.from.required).toBe(false);
        });
      });
      describe('that is required', () => {
        let relationship: ParsedJDLApplications['relationships'][number];

        before(() => {
          const content = parseFromContent('relationship OneToOne { A{b required} to B }');
          relationship = content.relationships[0];
        });

        it('should add it', () => {
          expect(relationship.from.injectedField).toBe('b');
        });
        it('should set the field requirement to true', () => {
          expect(relationship.from.required).toBe(true);
        });
      });
    });
    describe('with an injected field in the destination', () => {
      describe('that is not required', () => {
        let relationship: ParsedJDLApplications['relationships'][number];

        before(() => {
          const content = parseFromContent('relationship OneToOne { A to B{a} }');
          relationship = content.relationships[0];
        });

        it('should add it', () => {
          expect(relationship.to.injectedField).toBe('a');
        });
        it('should set the field requirement to false', () => {
          expect(relationship.to.required).toBe(false);
        });
      });
      describe('that is required', () => {
        let relationship: ParsedJDLApplications['relationships'][number];

        before(() => {
          const content = parseFromContent('relationship OneToOne { A to B{a required} }');
          relationship = content.relationships[0];
        });

        it('should add it', () => {
          expect(relationship.to.injectedField).toBe('a');
        });
        it('should set the field requirement to true', () => {
          expect(relationship.to.required).toBe(true);
        });
      });
    });
    describe('with an injected field in both sides', () => {
      describe('without them being required', () => {
        let relationship: ParsedJDLApplications['relationships'][number];

        before(() => {
          const content = parseFromContent('relationship OneToOne { A{b} to B{a} }');
          relationship = content.relationships[0];
        });

        it('should add it in the source', () => {
          expect(relationship.from.injectedField).toBe('b');
        });
        it('should set the source field requirement to false', () => {
          expect(relationship.from.required).toBe(false);
        });
        it('should add it in the destination', () => {
          expect(relationship.to.injectedField).toBe('a');
        });
        it('should set the destination field requirement to false', () => {
          expect(relationship.to.required).toBe(false);
        });
      });
      describe('with them being required', () => {
        let relationship: ParsedJDLApplications['relationships'][number];

        before(() => {
          const content = parseFromContent('relationship OneToOne { A{b required} to B{a required} }');
          relationship = content.relationships[0];
        });

        it('should set the source field requirement to true', () => {
          expect(relationship.from.required).toBe(true);
        });
        it('should set the destination field requirement to true', () => {
          expect(relationship.to.required).toBe(true);
        });
      });
    });
    describe('with an explicit join field in the source', () => {
      let relationship: ParsedJDLApplications['relationships'][number];

      before(() => {
        const content = parseFromContent('relationship OneToOne { A{b(name)} to B }');
        relationship = content.relationships[0];
      });

      it('should add it', () => {
        expect(relationship.from.injectedField).toBe('b(name)');
      });
    });
    describe('with an explicit join field in the destination', () => {
      let relationship: ParsedJDLApplications['relationships'][number];

      before(() => {
        const content = parseFromContent('relationship OneToOne { A to B{a(name)} }');
        relationship = content.relationships[0];
      });

      it('should add it', () => {
        expect(relationship.to.injectedField).toBe('a(name)');
      });
    });
    describe('with an explicit join field in both sides', () => {
      let relationship: ParsedJDLApplications['relationships'][number];

      before(() => {
        const content = parseFromContent('relationship OneToOne { A{b(name)} to B{a(name)} }');
        relationship = content.relationships[0];
      });

      it('should add it in the source', () => {
        expect(relationship.from.injectedField).toBe('b(name)');
      });
      it('should add it in the destination', () => {
        expect(relationship.to.injectedField).toBe('a(name)');
      });
    });
    describe('with a method', () => {
      let relationship: ParsedJDLApplications['relationships'][number];

      before(() => {
        const content = parseFromContent('relationship OneToOne { A to B with builtInEntity }');
        relationship = content.relationships[0];
      });

      it('should add it', () => {
        expect(relationship.options).toEqual({
          global: [
            {
              optionName: 'builtInEntity',
              type: 'UNARY',
            },
          ],
          source: [],
          destination: [],
        });
      });
    });
    describe('when parsing more than one relationship', () => {
      describe('with methods', () => {
        let relationships: ParsedJDLApplications['relationships'];

        before(() => {
          const content = parseFromContent(`relationship OneToOne {
  A to B with builtInEntity,
  B to C,
  D to E with builtInEntity
}
`);
          ({ relationships } = content);
        });

        it('should add them', () => {
          expect(relationships).toMatchInlineSnapshot(`
[
  {
    "cardinality": "OneToOne",
    "from": {
      "documentation": null,
      "injectedField": null,
      "name": "A",
    },
    "options": {
      "destination": [],
      "global": [
        {
          "optionName": "builtInEntity",
          "type": "UNARY",
        },
      ],
      "source": [],
    },
    "to": {
      "documentation": null,
      "injectedField": null,
      "name": "B",
    },
  },
  {
    "cardinality": "OneToOne",
    "from": {
      "documentation": null,
      "injectedField": null,
      "name": "B",
    },
    "options": {
      "destination": [],
      "global": [],
      "source": [],
    },
    "to": {
      "documentation": null,
      "injectedField": null,
      "name": "C",
    },
  },
  {
    "cardinality": "OneToOne",
    "from": {
      "documentation": null,
      "injectedField": null,
      "name": "D",
    },
    "options": {
      "destination": [],
      "global": [
        {
          "optionName": "builtInEntity",
          "type": "UNARY",
        },
      ],
      "source": [],
    },
    "to": {
      "documentation": null,
      "injectedField": null,
      "name": "E",
    },
  },
]
`);
        });
      });
    });
    describe('with annotations', () => {
      describe('only in the source side', () => {
        let relationships: ParsedJDLApplications['relationships'];

        before(() => {
          const content = parseFromContent('relationship OneToOne { @id A to B }');
          ({ relationships } = content);
        });

        it('should parse them', () => {
          expect(relationships).toMatchInlineSnapshot(`
[
  {
    "cardinality": "OneToOne",
    "from": {
      "documentation": null,
      "injectedField": null,
      "name": "A",
    },
    "options": {
      "destination": [],
      "global": [],
      "source": [
        {
          "optionName": "id",
          "type": "UNARY",
        },
      ],
    },
    "to": {
      "documentation": null,
      "injectedField": null,
      "name": "B",
    },
  },
]
`);
        });
      });
      describe('only in the destination side', () => {
        let relationships: ParsedJDLApplications['relationships'];

        before(() => {
          const content = parseFromContent('relationship OneToOne { A to @id B }');
          ({ relationships } = content);
        });

        it('should parse them', () => {
          expect(relationships).toMatchInlineSnapshot(`
[
  {
    "cardinality": "OneToOne",
    "from": {
      "documentation": null,
      "injectedField": null,
      "name": "A",
    },
    "options": {
      "destination": [
        {
          "optionName": "id",
          "type": "UNARY",
        },
      ],
      "global": [],
      "source": [],
    },
    "to": {
      "documentation": null,
      "injectedField": null,
      "name": "B",
    },
  },
]
`);
        });
      });
      describe('in both sides', () => {
        let relationships: ParsedJDLApplications['relationships'];

        before(() => {
          const content = parseFromContent('relationship OneToOne { @id A to @id B }');
          ({ relationships } = content);
        });

        it('should parse them', () => {
          expect(relationships).toMatchInlineSnapshot(`
[
  {
    "cardinality": "OneToOne",
    "from": {
      "documentation": null,
      "injectedField": null,
      "name": "A",
    },
    "options": {
      "destination": [
        {
          "optionName": "id",
          "type": "UNARY",
        },
      ],
      "global": [],
      "source": [
        {
          "optionName": "id",
          "type": "UNARY",
        },
      ],
    },
    "to": {
      "documentation": null,
      "injectedField": null,
      "name": "B",
    },
  },
]
`);
        });
      });
    });
  });
  describe('when parsing a misspelled statement keyword', () => {
    it('should report the statement at the misspelled keyword', () => {
      // An option statement never opens a block, so `entiti Foo {` is not one: it is reported as an unknown statement.
      expect(() => parseFromContent('entiti Foo {\n  name String\n}')).toThrow(
        /^Unknown statement 'entiti', expected an entity, an enum, a relationship, an application, a deployment, a use statement, a constant or an option statement\.\n\tat line: 1, column: 1$/,
      );
    });
    it('should report the statement inside an application', () => {
      expect(() => parseFromContent('entity A\napplication {\n  config { baseName foo }\n  entitis A {}\n}')).toThrow(
        /^Unknown statement 'entitis', expected a config block, an entities statement, a use statement or an option statement\.\n\tat line: 4, column: 3$/,
      );
    });
    it('should report an unknown option statement by its name', () => {
      expect(() => parseFromContent('entity A\nreadonly A')).toThrow(/^Unknown option: readonly\.\n\tat line: 2, column: 1$/);
    });
  });
  describe('when parsing an option statement of the wrong kind', () => {
    it('should report a unary option given a value', () => {
      expect(() => parseFromContent('entity A\nreadOnly A with x')).toThrow(
        /^The readOnly option takes no value\.\n\tat line: 2, column: 1$/,
      );
    });
    it('should report a binary option without a value', () => {
      expect(() => parseFromContent('entity A\ndto A')).toThrow(
        /^The dto option needs a value: dto <entities> with <value>\.\n\tat line: 2, column: 1$/,
      );
    });
    it('should report it inside an application', () => {
      expect(() => parseFromContent('entity A\napplication {\n  config { baseName foo }\n  entities A\n  dto A\n}')).toThrow(
        /^The dto option needs a value: dto <entities> with <value>\.\n\tat line: 5, column: 3$/,
      );
    });
  });
  describe('when parsing an unknown relationship option', () => {
    it('should report it at the option', () => {
      expect(() => parseFromContent('entity A\nentity B\nrelationship OneToMany {\n  A{b} to B with cascade\n}')).toThrow(
        /^Unknown relationship option: cascade\.\n\tat line: 4, column: 18$/,
      );
    });
  });
  describe('when parsing an unknown deployment option', () => {
    it('should report it at the key', () => {
      expect(() => parseFromContent('deployment {\n  deploymentType docker-compose\n  fooBar x\n}')).toThrow(
        /^Unknown deployment option: fooBar\.\n\tat line: 3, column: 3$/,
      );
    });
  });
  describe('when a jdl has several errors', () => {
    it('should report every one of them', () => {
      expect(() => parseFromContent('application {\n  config {\n    fooBar true\n    serverPort abc\n  }\n}')).toThrow(
        /^Unknown application option: fooBar\.\n\tat line: 3, column: 5\nAn integer literal is expected, but found: "abc"\n\tat line: 4, column: 16$/,
      );
    });
  });
  describe('when parsing the deprecated paginate keyword inside an application', () => {
    let warnSpy: ReturnType<typeof esmocha.spyOn>;
    let parsedOptions: ParsedJDLApplications['applications'][number]['options'];

    before(() => {
      warnSpy = esmocha.spyOn(logger, 'warn');
      parsedOptions = parseFromContent('entity A\napplication {\n  config { baseName foo }\n  entities A\n  paginate A with pagination\n}')
        .applications[0].options;
    });

    after(() => {
      warnSpy.mockRestore();
    });

    it('should parse it as the pagination option and warn', () => {
      expect(parsedOptions).toEqual({ pagination: { pagination: { list: ['A'], excluded: [] } } });
      expect(warnSpy).toHaveBeenCalledWith('The paginate option is deprecated, please use pagination instead.');
    });
  });
  describe('when parsing an option statement of a runtime with entity definitions of its own', () => {
    it('should report an option the definitions do not declare', () => {
      const customRuntime = createJDLRuntime({ entity: { configs: { audited: { jdl: { type: 'unary' } } } } });
      expect(() => originalParseFromContent('entity A\naudited A\nreadOnly A', customRuntime)).toThrow(
        /^Unknown option: readOnly\.\n\tat line: 3, column: 1$/,
      );
    });
  });
  describe('when parsing the deprecated paginate keyword', () => {
    let warnSpy: ReturnType<typeof esmocha.spyOn>;
    let parsedOptions: ParsedJDLApplications['options'];

    before(() => {
      warnSpy = esmocha.spyOn(logger, 'warn');
      parsedOptions = parseFromContent('paginate A with pagination').options;
    });

    after(() => {
      warnSpy.mockRestore();
    });

    it('should parse it as the pagination option', () => {
      expect(parsedOptions).toEqual({ pagination: { pagination: { list: ['A'], excluded: [] } } });
    });
    it('should warn', () => {
      expect(warnSpy).toHaveBeenCalledWith('The paginate option is deprecated, please use pagination instead.');
    });
  });
  describe('when parsing the options of a runtime with entity definitions of its own', () => {
    let parsed: ParsedJDLApplications;

    before(() => {
      // The lexer and the parser know no option by themselves: they take them from the entity definitions.
      const customRuntime = createJDLRuntime({
        entity: {
          configs: {
            ...getDefaultJDLEntityConfig().configs,
            audited: { jdl: { type: 'unary' } },
            cache: { choices: ['redis', 'no'], jdl: { type: 'binary' } },
          },
        },
        relationship: { configs: { ...getDefaultJDLRelationshipConfig().configs, cascade: { jdl: { type: 'unary' } } } },
      });
      parsed = originalParseFromContent(
        `entity A
entity B
audited A
cache A with redis
relationship OneToMany {
  A{b} to B with cascade
}`,
        customRuntime,
      );
    });

    it('should parse the unary and binary options', () => {
      expect(parsed.options).toEqual({ audited: { list: ['A'], excluded: [] }, cache: { redis: { list: ['A'], excluded: [] } } });
    });
    it('should parse the relationship option', () => {
      expect(parsed.relationships[0].options.global).toEqual([{ optionName: 'cascade', type: 'UNARY' }]);
    });
  });
  describe('when parsing an option', () => {
    describe('being unary', () => {
      describe('with exclusions', () => {
        let parsedOption: ParsedJDLApplications['options']['skipClient'];

        before(() => {
          const content = parseFromContent('skipClient * except A');
          parsedOption = content.options.skipClient;
        });

        it('should add the exclusions', () => {
          expect(parsedOption).toMatchInlineSnapshot(`
{
  "excluded": [
    "A",
  ],
  "list": [
    "*",
  ],
}
`);
        });
      });
      [READ_ONLY, EMBEDDED, SKIP_CLIENT, SKIP_SERVER, FILTER, NO_FLUENT_METHOD].forEach(option => {
        describe(option, () => {
          let parsedOption: ParsedJDLApplications['options'][string];

          before(() => {
            const content = parseFromContent(`${option} A`);
            parsedOption = content.options[option];
          });

          it('should parse it', () => {
            expect(parsedOption).toEqual({
              list: ['A'],
              excluded: [],
            });
          });
        });
      });
    });
    describe('being binary', () => {
      describe('being clientRootFolder', () => {
        describe('in the regular form', () => {
          let parsedOption: ParsedJDLApplications['options']['clientRootFolder'];

          before(() => {
            const content = parseFromContent('clientRootFolder * with client');
            parsedOption = content.options.clientRootFolder;
          });

          it('should parse it', () => {
            expect(parsedOption).toMatchInlineSnapshot(`
{
  "client": {
    "excluded": [],
    "list": [
      "*",
    ],
  },
}
`);
          });
        });
        describe('in the path form', () => {
          let parsedOption: ParsedJDLApplications['options']['clientRootFolder'];

          before(() => {
            const content = parseFromContent('clientRootFolder * with "../../toto"');
            parsedOption = content.options.clientRootFolder;
          });

          it('should parse it', () => {
            expect(parsedOption).toMatchInlineSnapshot(`
{
  ""../../toto"": {
    "excluded": [],
    "list": [
      "*",
    ],
  },
}
`);
          });
        });
      });
      describe('with exclusions', () => {
        let parsedOption: ParsedJDLApplications['options']['dto'];

        before(() => {
          const content = parseFromContent('dto * with mapstruct except A');
          parsedOption = content.options.dto;
        });

        it('should add the exclusions', () => {
          expect(parsedOption).toMatchInlineSnapshot(`
{
  "mapstruct": {
    "excluded": [
      "A",
    ],
    "list": [
      "*",
    ],
  },
}
`);
        });
      });
      [SEARCH, SERVICE, PAGINATION, DTO].forEach(option => {
        describe(option, () => {
          (Object.keys(Values[option]) as (keyof (typeof Values)[typeof option])[]).forEach(key => {
            let parsedOption: any;
            const value: any = Values[option][key];

            before(() => {
              const content = parseFromContent(`${option} A with ${value}`);
              // @ts-expect-error FIXME
              parsedOption = content.options[option][value];
            });

            it(`should parse ${value} value`, () => {
              expect(parsedOption).toEqual({
                list: ['A'],
                excluded: [],
              });
            });
          });
        });
      });
      [APPLICATION_TYPE_MICROSERVICE, ANGULAR_SUFFIX].forEach(option => {
        describe(option, () => {
          let parsedOption: any;

          before(() => {
            const content = parseFromContent(`${option} A with toto`);
            parsedOption = (content.options[option] as Record<string, ParsedJDLOption>).toto;
          });

          it('should parse it', () => {
            expect(parsedOption).toEqual({
              list: ['A'],
              excluded: [],
            });
          });
        });
      });
    });
    describe("using the 'all' keyword", () => {
      let parsedOption: ParsedJDLApplications['options']['clientRootFolder'];

      before(() => {
        const content = parseFromContent('clientRootFolder all with client');
        parsedOption = content.options.clientRootFolder;
      });

      it("should parse it as '*'", () => {
        expect(parsedOption).toMatchInlineSnapshot(`
{
  "client": {
    "excluded": [],
    "list": [
      "*",
    ],
  },
}
`);
      });
    });
    describe("using the '*' keyword", () => {
      let parsedOption: ParsedJDLApplications['options']['clientRootFolder'];

      before(() => {
        const content = parseFromContent('clientRootFolder * with client');
        parsedOption = content.options.clientRootFolder;
      });

      it('should parse it', () => {
        expect(parsedOption).toMatchInlineSnapshot(`
{
  "client": {
    "excluded": [],
    "list": [
      "*",
    ],
  },
}
`);
      });
    });
    describe('using the use-form', () => {
      useValues.forEach(optionValue => {
        describe(`of ${optionValue}`, () => {
          let parsedOptions: ParsedJDLApplications['useOptions'];

          before(() => {
            const content = parseFromContent(`use ${optionValue} for A`);
            parsedOptions = content.useOptions;
          });

          it('should parse it', () => {
            expect(parsedOptions).toEqual([
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
  describe('when parsing a deprecated option', () => {
    let warnSpy: ReturnType<typeof esmocha.spyOn>;

    before(() => {
      warnSpy = esmocha.spyOn(logger, 'warn');
      parseFromContent(`deployment { gatewayType SpringCloudGateway }
`);
    });

    after(() => {
      warnSpy.mockRestore();
    });

    it('should warn with the reason of the deployment option', () => {
      expect(warnSpy).toHaveBeenCalledWith(
        'The gatewayType deployment option is deprecated: no generator reads it, it will be removed in JHipster v10',
      );
    });
  });
  describe('when parsing deployments', () => {
    describe('with kubernetesStorageClassName', () => {
      describe('being empty', () => {
        let parsedDeployment: ParsedJDLApplications['deployments'][number];

        before(() => {
          const content = parseFromContent(
            `deployment {
  kubernetesStorageClassName ""
}
`,
          );
          parsedDeployment = content.deployments[0];
        });

        it('should parse it', () => {
          expect(parsedDeployment).toMatchInlineSnapshot(`
{
  "kubernetesStorageClassName": "",
}
`);
        });
      });
      describe('being set', () => {
        let parsedDeployment: ParsedJDLApplications['deployments'][number];

        before(() => {
          const content = parseFromContent(
            `deployment {
  kubernetesStorageClassName "SetValue"
}
`,
          );
          parsedDeployment = content.deployments[0];
        });

        it('should parse it', () => {
          expect(parsedDeployment).toMatchInlineSnapshot(`
{
  "kubernetesStorageClassName": "SetValue",
}
`);
        });
      });
    });
  });
});
