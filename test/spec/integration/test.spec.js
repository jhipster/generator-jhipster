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

/* eslint-disable no-new, no-unused-expressions */
const fs = require('fs');
const path = require('path');
const { expect } = require('chai');

const ApplicationTypes = require('../../../lib/core/jhipster/application_types');
const JDLReader = require('../../../lib/readers/jdl_reader');
const DocumentParser = require('../../../lib/parsers/document_parser');
const JDLExporter = require('../../../lib/exporters/jdl_exporter');

describe('integration tests', () => {
  context('when parsing and exporting a JDL', () => {
    let originalContent = null;
    let writtenContent = null;

    before(() => {
      originalContent = DocumentParser.parseFromConfigurationObject({
        document: JDLReader.parseFromFiles([path.join('test', 'test_files', 'big_sample.jdl')]),
        applicationType: ApplicationTypes.MONOLITH
      });
      JDLExporter.exportToJDL(originalContent, 'exported.jdl');
      writtenContent = DocumentParser.parseFromConfigurationObject({
        document: JDLReader.parseFromFiles(['exported.jdl']),
        applicationType: ApplicationTypes.MONOLITH
      });
    });

    after(() => {
      fs.unlinkSync('exported.jdl');
    });

    it('keeps the same JDL content', () => {
      expect(writtenContent.toString()).to.equal(originalContent.toString());
    });
  });
});
