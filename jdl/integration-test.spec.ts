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

/* eslint-disable no-new, no-unused-expressions */
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { expect } from 'chai';
import { jestExpect } from 'esmocha';

import { applicationTypes } from './jhipster/index.mjs';
import { parseFromContent, parseFromFiles } from './readers/jdl-reader.js';
import DocumentParser from './converters/parsed-jdl-to-jdl-object/parsed-jdl-to-jdl-object-converter.js';
import exportToJDL from './exporters/jdl-exporter.js';
import { basicHelpers as helpers } from '../test/support/index.mjs';
import { convert } from './converters/jdl-to-json/jdl-without-application-to-json-converter.js';

const { MONOLITH } = applicationTypes;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('jdl - integration tests', () => {
  beforeEach(async () => {
    await helpers.prepareTemporaryDir();
  });

  context('when parsing and exporting a JDL', () => {
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

  context('when parsing entities JDL', () => {
    const applicationName = 'jhipster';
    const jdl = `
entity A {}
entity B {}
relationship ManyToOne {
  A to B
}
`;
    context('with bidirectional relationship', () => {
      let result: Map<any, any[]>;

      beforeEach(() => {
        result = convert({
          applicationName,
          databaseType: 'sql',
          jdlObject: DocumentParser.parseFromConfigurationObject({
            parsedContent: parseFromContent(jdl),
            applicationType: MONOLITH,
          }),
        });
      });

      it('should add relationship at both sides', () => {
        jestExpect(result.get('jhipster')![0].relationships.length).toBe(1);
        jestExpect(result.get('jhipster')![1].relationships.length).toBe(1);
      });

      it('should result matching', () => {
        jestExpect(result).toMatchInlineSnapshot(`
Map {
  "jhipster" => [
    JSONEntity {
      "applications": "*",
      "documentation": undefined,
      "dto": undefined,
      "embedded": undefined,
      "entityTableName": "a",
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
      "applications": "*",
      "documentation": undefined,
      "dto": undefined,
      "embedded": undefined,
      "entityTableName": "b",
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

    context('with unidirectional relationship and annotation at destination', () => {
      let result: Map<any, any[]>;
      const jdl = `
entity A {}
entity B {}
relationship ManyToOne {
  A{b} to @AnnotationAtASide B
}
`;

      beforeEach(() => {
        result = convert({
          applicationName,
          databaseType: 'sql',
          jdlObject: DocumentParser.parseFromConfigurationObject({
            parsedContent: parseFromContent(jdl),
            applicationType: MONOLITH,
          }),
        });
      });

      it('should add relationship at one side', () => {
        jestExpect(result.get('jhipster')![0].relationships.length).toBe(1);
        jestExpect(result.get('jhipster')![1].relationships.length).toBe(0);
      });

      it('should result matching', () => {
        jestExpect(result).toMatchInlineSnapshot(`
Map {
  "jhipster" => [
    JSONEntity {
      "applications": "*",
      "documentation": undefined,
      "dto": undefined,
      "embedded": undefined,
      "entityTableName": "a",
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
      "applications": "*",
      "documentation": undefined,
      "dto": undefined,
      "embedded": undefined,
      "entityTableName": "b",
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

    context('with unidirectional relationship and annotation at both sides', () => {
      let result: Map<any, any[]>;
      const jdl = `
entity A {}
entity B {}
relationship ManyToOne {
  @AnnotationAtBSide A{b} to @AnnotationAtASide B
}
`;

      beforeEach(() => {
        result = convert({
          applicationName,
          databaseType: 'sql',
          jdlObject: DocumentParser.parseFromConfigurationObject({
            parsedContent: parseFromContent(jdl),
            applicationType: MONOLITH,
          }),
        });
      });

      it('should add relationship at both sides', () => {
        jestExpect(result.get('jhipster')![0].relationships.length).toBe(1);
        jestExpect(result.get('jhipster')![1].relationships.length).toBe(1);
      });

      it('should result matching', () => {
        jestExpect(result).toMatchInlineSnapshot(`
Map {
  "jhipster" => [
    JSONEntity {
      "applications": "*",
      "documentation": undefined,
      "dto": undefined,
      "embedded": undefined,
      "entityTableName": "a",
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
      "applications": "*",
      "documentation": undefined,
      "dto": undefined,
      "embedded": undefined,
      "entityTableName": "b",
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
});
