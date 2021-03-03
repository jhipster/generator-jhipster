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

/* eslint-disable no-new, no-unused-expressions */
const fs = require('fs');
const path = require('path');
const { expect } = require('chai');

const ApplicationTypes = require('../../../jdl/jhipster/application-types');
const JDLReader = require('../../../jdl/readers/jdl-reader');
const DocumentParser = require('../../../jdl/converters/parsed-jdl-to-jdl-object/parsed-jdl-to-jdl-object-converter');
const JDLExporter = require('../../../jdl/exporters/jdl-exporter');

describe('integration tests', () => {
  context('when parsing and exporting a JDL', () => {
    let originalContent;
    let writtenContent;

    before(() => {
      originalContent = DocumentParser.parseFromConfigurationObject({
        parsedContent: JDLReader.parseFromFiles([path.join(__dirname, '..', 'test-files', 'big_sample.jdl')]),
        applicationType: ApplicationTypes.MONOLITH,
      });
      JDLExporter.exportToJDL(originalContent, 'exported.jdl');
      writtenContent = DocumentParser.parseFromConfigurationObject({
        parsedContent: JDLReader.parseFromFiles(['exported.jdl']),
        applicationType: ApplicationTypes.MONOLITH,
      });
    });

    after(() => {
      fs.unlinkSync('exported.jdl');
    });

    it('should keep the same JDL content', () => {
      expect(writtenContent.toString()).to.equal(originalContent.toString());
    });
  });
});
