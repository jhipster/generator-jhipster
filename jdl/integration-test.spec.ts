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

import { applicationTypes } from './jhipster/index.mjs';
import { parseFromFiles } from './readers/jdl-reader.js';
import DocumentParser from './converters/parsed-jdl-to-jdl-object/parsed-jdl-to-jdl-object-converter.js';
import exportToJDL from './exporters/jdl-exporter.js';
import { basicHelpers as helpers } from '../test/support/helpers.mjs';

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
});
