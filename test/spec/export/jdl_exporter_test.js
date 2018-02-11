/**
 * Copyright 2013-2018 the original author or authors from the JHipster project.
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

/* eslint-disable no-new, no-unused-expressions */
const expect = require('chai').expect;

const fail = expect.fail;
const fs = require('fs');
const readEntityJSON = require('../../../lib/reader/json_file_reader').readEntityJSON;
const Exporter = require('../../../lib/export/jdl_exporter');
const JDLReader = require('../../../lib/reader/jdl_reader');
const DocumentParser = require('../../../lib/parser/document_parser');
const EntityParser = require('../../../lib/parser/entity_parser');
const parseFromDir = require('../../../lib/reader/json_reader').parseFromDir;

// todo: clean up this test file
describe('::exportToJDL', () => {
  describe('when passing invalid parameters', () => {
    describe('such as undefined', () => {
      it('throws an error', () => {
        try {
          Exporter.exportToJDL();
          fail();
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
      });
    });
  });
  describe('when passing valid arguments', () => {
    describe('when exporting json to entity JDL', () => {
      const jdl = parseFromDir('./test/test_files/jhipster_app');
      Exporter.exportToJDL(jdl);
      const input = JDLReader.parseFromFiles(['./jhipster-jdl.jh']);
      const newEntities = EntityParser.parse({
        jdlObject: DocumentParser.parse(input, 'sql'),
        databaseType: 'sql'
      });
      const previousEntities = {};
      ['Country', 'Department', 'Employee', 'Job', 'JobHistory', 'Location', 'Region', 'Task'].forEach((entityName) => {
        previousEntities[entityName] = readEntityJSON(`./test/test_files/jhipster_app/.jhipster/${entityName}.json`);
        previousEntities[entityName].changelogDate = newEntities[entityName].changelogDate;
        if (!previousEntities[entityName].javadoc) {
          previousEntities[entityName].javadoc = undefined;
        }
        // Sort arrays to ease comparison
        previousEntities[entityName].fields.sort(
          (f1, f2) => (f1.fieldName < f2.fieldName) - (f1.fieldName > f2.fieldName));
        newEntities[entityName].fields.sort(
          (f1, f2) => (f1.fieldName < f2.fieldName) - (f1.fieldName > f2.fieldName));
        previousEntities[entityName].relationships.sort(
          (r1, r2) => (r1.relationshipName < r2.relationshipName) - (r1.relationshipName > r2.relationshipName));
        newEntities[entityName].relationships.sort(
          (r1, r2) => (r1.relationshipName < r2.relationshipName) - (r1.relationshipName > r2.relationshipName));
      });
      it('exports it', () => {
        expect(fs.statSync('./jhipster-jdl.jh').isFile()).to.be.true;
        expect(newEntities).to.deep.eq(previousEntities);
        // clean up the mess...
        fs.unlinkSync('./jhipster-jdl.jh');
      });
    });
  });
});
