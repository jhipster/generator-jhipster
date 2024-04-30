/**
 * Copyright 2013-2024 the original author or authors from the JHipster project.
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

/* eslint-disable no-new, no-unused-expressions */
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { expect } from 'chai';
import { it, describe, expect as jestExpect, beforeEach } from 'esmocha';
import { applicationTypes } from './jhipster/index.js';
import { parseFromContent, parseFromFiles } from './readers/jdl-reader.js';
import DocumentParser from './converters/parsed-jdl-to-jdl-object/parsed-jdl-to-jdl-object-converter.js';
import exportToJDL from './exporters/jdl-exporter.js';
import { basicHelpers as helpers } from '../testing/index.js';
import { convert as convertWithoutApplication } from './converters/jdl-to-json/jdl-without-application-to-json-converter.js';
import { ApplicationWithEntities, createImporterFromContent } from './jdl-importer.js';

const { MONOLITH } = applicationTypes;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('jdl - integration tests', () => {
  beforeEach(async () => {
    await helpers.prepareTemporaryDir();
  });

  describe('when parsing and exporting a JDL', () => {
    let originalContent;
    let writtenContent;

    beforeEach(() => {
      originalContent = DocumentParser.parseFromConfigurationObject({
        parsedContent: parseFromFiles([path.join(__dirname, '__test-files__', 'big_sample.jdl')]),
        applicationType: MONOLITH,
      });
      exportToJDL(originalContent, 'exported.jdl');
      writtenContent = DocumentParser.parseFromConfigurationObject({
        parsedContent: parseFromFiles(['exported.jdl']),
        applicationType: MONOLITH,
      });
    });

    it('should keep the same JDL content', () => {
      expect(writtenContent.toString()).to.equal(originalContent.toString());
    });
  });

  describe('when parsing entities JDL', () => {
    const applicationName = 'jhipster';

    describe('with annotations', () => {
      let result: Map<any, any[]>;
      let convertedJdl: string;
      const jdl = `@BooleanTrue(true)
@BooleanFalse(false)
@Integer(1)
@Decimal(10.1)
@Escaped("a.b")
@String(foo)
@Unary
entity A
`;
      const expectedJdl = jdl.replace('(true)', '').replace('(foo)', '("foo")');

      beforeEach(() => {
        const jdlObject = DocumentParser.parseFromConfigurationObject({
          parsedContent: parseFromContent(jdl),
          applicationType: MONOLITH,
        });
        result = convertWithoutApplication({
          applicationName,
          databaseType: 'sql',
          jdlObject,
        });
        convertedJdl = jdlObject.toString();
      });

      it('stringfied JDL should match original jdl', () => {
        jestExpect(convertedJdl).toEqual(expectedJdl);
      });
      it('should result matching', () => {
        jestExpect(result).toMatchInlineSnapshot(`
Map {
  "jhipster" => [
    JSONEntity {
      "annotations": {
        "booleanFalse": false,
        "booleanTrue": true,
        "decimal": 10.1,
        "escaped": "a.b",
        "integer": 1,
        "string": "foo",
        "unary": true,
      },
      "applications": "*",
      "documentation": undefined,
      "dto": undefined,
      "embedded": undefined,
      "entityTableName": undefined,
      "fields": [],
      "fluentMethods": undefined,
      "jpaMetamodelFiltering": undefined,
      "name": "A",
      "pagination": undefined,
      "readOnly": undefined,
      "relationships": [],
      "service": undefined,
    },
  ],
}
`);
      });
    });

    describe('with bidirectional relationship', () => {
      let result: Map<any, any[]>;
      const jdl = `
entity A {}
entity B {}
relationship ManyToOne {
  A to B
}
`;

      beforeEach(() => {
        result = convertWithoutApplication({
          applicationName,
          databaseType: 'sql',
          jdlObject: DocumentParser.parseFromConfigurationObject({
            parsedContent: parseFromContent(jdl),
            applicationType: MONOLITH,
          }),
        });
      });

      it('should add relationship at both sides', () => {
        jestExpect(result.get(applicationName)![0].relationships.length).toBe(1);
        jestExpect(result.get(applicationName)![1].relationships.length).toBe(1);
      });

      it('should result matching', () => {
        jestExpect(result).toMatchInlineSnapshot(`
Map {
  "jhipster" => [
    JSONEntity {
      "annotations": {},
      "applications": "*",
      "documentation": undefined,
      "dto": undefined,
      "embedded": undefined,
      "entityTableName": undefined,
      "fields": [],
      "fluentMethods": undefined,
      "jpaMetamodelFiltering": undefined,
      "name": "A",
      "pagination": undefined,
      "readOnly": undefined,
      "relationships": [
        {
          "otherEntityName": "b",
          "otherEntityRelationshipName": "a",
          "relationshipName": "b",
          "relationshipSide": "left",
          "relationshipType": "many-to-one",
        },
      ],
      "service": undefined,
    },
    JSONEntity {
      "annotations": {},
      "applications": "*",
      "documentation": undefined,
      "dto": undefined,
      "embedded": undefined,
      "entityTableName": undefined,
      "fields": [],
      "fluentMethods": undefined,
      "jpaMetamodelFiltering": undefined,
      "name": "B",
      "pagination": undefined,
      "readOnly": undefined,
      "relationships": [
        {
          "otherEntityName": "a",
          "otherEntityRelationshipName": "b",
          "relationshipName": "a",
          "relationshipSide": "right",
          "relationshipType": "one-to-many",
        },
      ],
      "service": undefined,
    },
  ],
}
`);
      });
    });

    describe('with unidirectional relationship and annotation at destination', () => {
      let result: Map<any, any[]>;
      let convertedJdl: string;
      const jdl = `entity A
entity B

relationship ManyToOne {
  A{b} to @AnnotationAtASide B
}
`;

      beforeEach(() => {
        const jdlObject = DocumentParser.parseFromConfigurationObject({
          parsedContent: parseFromContent(jdl),
          applicationType: MONOLITH,
        });
        result = convertWithoutApplication({
          applicationName,
          databaseType: 'sql',
          jdlObject,
        });
        convertedJdl = jdlObject.toString();
      });

      it('convert back to jdl', () => {
        jestExpect(convertedJdl).toBe(jdl);
      });

      it('should add relationship at one side', () => {
        jestExpect(result.get(applicationName)![0].relationships.length).toBe(1);
        jestExpect(result.get(applicationName)![1].relationships.length).toBe(0);
      });

      it('should result matching', () => {
        jestExpect(result).toMatchInlineSnapshot(`
Map {
  "jhipster" => [
    JSONEntity {
      "annotations": {},
      "applications": "*",
      "documentation": undefined,
      "dto": undefined,
      "embedded": undefined,
      "entityTableName": undefined,
      "fields": [],
      "fluentMethods": undefined,
      "jpaMetamodelFiltering": undefined,
      "name": "A",
      "pagination": undefined,
      "readOnly": undefined,
      "relationships": [
        {
          "options": {
            "annotationAtASide": true,
          },
          "otherEntityName": "b",
          "relationshipName": "b",
          "relationshipSide": "left",
          "relationshipType": "many-to-one",
        },
      ],
      "service": undefined,
    },
    JSONEntity {
      "annotations": {},
      "applications": "*",
      "documentation": undefined,
      "dto": undefined,
      "embedded": undefined,
      "entityTableName": undefined,
      "fields": [],
      "fluentMethods": undefined,
      "jpaMetamodelFiltering": undefined,
      "name": "B",
      "pagination": undefined,
      "readOnly": undefined,
      "relationships": [],
      "service": undefined,
    },
  ],
}
`);
      });
    });

    describe('with unidirectional relationship and annotation at both sides', () => {
      let result: Map<any, any[]>;
      const jdl = `
entity A {}
entity B {}
relationship ManyToOne {
  @AnnotationAtBSide A{b} to @AnnotationAtASide B
}
`;

      beforeEach(() => {
        result = convertWithoutApplication({
          applicationName,
          databaseType: 'sql',
          jdlObject: DocumentParser.parseFromConfigurationObject({
            parsedContent: parseFromContent(jdl),
            applicationType: MONOLITH,
          }),
        });
      });

      it('should add relationship at both sides', () => {
        jestExpect(result.get(applicationName)![0].relationships.length).toBe(1);
        jestExpect(result.get(applicationName)![1].relationships.length).toBe(1);
      });

      it('should result matching', () => {
        jestExpect(result).toMatchInlineSnapshot(`
Map {
  "jhipster" => [
    JSONEntity {
      "annotations": {},
      "applications": "*",
      "documentation": undefined,
      "dto": undefined,
      "embedded": undefined,
      "entityTableName": undefined,
      "fields": [],
      "fluentMethods": undefined,
      "jpaMetamodelFiltering": undefined,
      "name": "A",
      "pagination": undefined,
      "readOnly": undefined,
      "relationships": [
        {
          "options": {
            "annotationAtASide": true,
          },
          "otherEntityName": "b",
          "relationshipName": "b",
          "relationshipSide": "left",
          "relationshipType": "many-to-one",
        },
      ],
      "service": undefined,
    },
    JSONEntity {
      "annotations": {},
      "applications": "*",
      "documentation": undefined,
      "dto": undefined,
      "embedded": undefined,
      "entityTableName": undefined,
      "fields": [],
      "fluentMethods": undefined,
      "jpaMetamodelFiltering": undefined,
      "name": "B",
      "pagination": undefined,
      "readOnly": undefined,
      "relationships": [
        {
          "options": {
            "annotationAtBSide": true,
          },
          "otherEntityName": "a",
          "otherEntityRelationshipName": "b",
          "relationshipName": "a",
          "relationshipSide": "right",
          "relationshipType": "one-to-many",
        },
      ],
      "service": undefined,
    },
  ],
}
`);
      });
    });
  });

  describe('when parsing JDL with blueprint configs', () => {
    const applicationName = 'jhipster';

    describe('without blueprint', () => {
      const jdl = `
application {
  config {
    baseName jhipster
  }
  config(foo) {
    stringConfig stringValue
  }
}
`;

      it('should throw error', () => {
        const importer = createImporterFromContent(jdl);
        jestExpect(() => importer.import()).toThrowError(/Blueprint namespace config foo requires the blueprint foo/);
      });
    });

    describe('with blueprint', () => {
      let result: Record<string, ApplicationWithEntities>;
      const jdl = `
application {
  config {
    baseName jhipster
    blueprints [foo, entity-audit]
  }
  config(foo) {
    stringConfig fooValue
    trueConfig true
    falseConfig false
    listConfig [fooitem]
    integerConfig 123
  }
  config(entity-audit) {
    stringConfig barValue
    trueConfig true
    falseConfig false
    listConfig [baritem]
    integerConfig 321
  }
}
`;

      beforeEach(() => {
        const importer = createImporterFromContent(jdl);
        const importState = importer.import();
        result = importState.exportedApplicationsWithEntities;
      });

      it('should result matching', () => {
        jestExpect(result[applicationName]).toMatchInlineSnapshot(`
{
  "config": {
    "baseName": "jhipster",
    "blueprints": [
      {
        "name": "foo",
      },
      {
        "name": "entity-audit",
      },
    ],
    "entities": [],
  },
  "entities": [],
  "namespaceConfigs": {
    "entity-audit": {
      "falseConfig": false,
      "integerConfig": 321,
      "listConfig": [
        "baritem",
      ],
      "stringConfig": "barValue",
      "trueConfig": true,
    },
  },
}
`);
      });
    });
  });
});
