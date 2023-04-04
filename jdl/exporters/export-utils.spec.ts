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

import { jestExpect as expect } from 'mocha-expect-snapshot';
import { readFileSync, writeFileSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { writeConfigFile } from '../exporters/export-utils.js';
import { basicHelpers as helpers } from '../../test/support/helpers.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('jdl - ExportUtils', () => {
  beforeEach(async () => {
    await helpers.prepareTemporaryDir();
  });
  describe('writeConfigFile', () => {
    context('when there is no .yo-rc.json file present', () => {
      let exportedConfig;

      beforeEach(() => {
        const config = {
          'generator-jhipster': {
            jhipsterVersion: '7.0.0',
          },
        };
        writeConfigFile(config);
        exportedConfig = JSON.parse(readFileSync('.yo-rc.json', { encoding: 'utf-8' }));
      });

      it('should export the config', () => {
        expect(exportedConfig).toMatchInlineSnapshot(`
{
  "generator-jhipster": {
    "jhipsterVersion": "7.0.0",
  },
}
`);
      });
    });
    context('when there is a .yo-rc.json file present', () => {
      let exportedConfig;

      beforeEach(() => {
        const existingConfig = {
          'generator-jhipster': {
            jhipsterVersion: '6.5.4',
          },
          somethingElse: {
            answer: 42,
          },
        };
        writeFileSync('.yo-rc.json', JSON.stringify(existingConfig, null, 2));
        const newConfig = {
          'generator-jhipster': {
            jhipsterVersion: '7.0.0',
          },
          somethingNew: {
            question: 'No comment',
          },
        };
        writeConfigFile(newConfig);
        exportedConfig = JSON.parse(readFileSync('.yo-rc.json', { encoding: 'utf-8' }));
      });

      it('should export the config', () => {
        expect(exportedConfig).toMatchInlineSnapshot(`
{
  "generator-jhipster": {
    "jhipsterVersion": "7.0.0",
  },
  "somethingElse": {
    "answer": 42,
  },
  "somethingNew": {
    "question": "No comment",
  },
}
`);
      });
    });

    context('when there is a .yo-rc.json file present with creationTimestamp', () => {
      let exportedConfig;

      beforeEach(() => {
        const existingConfig = {
          'generator-jhipster': {
            jhipsterVersion: '6.5.4',
            creationTimestamp: 'old',
          },
          somethingElse: {
            answer: 42,
          },
        };
        writeFileSync('.yo-rc.json', JSON.stringify(existingConfig, null, 2));
        const newConfig = {
          'generator-jhipster': {
            jhipsterVersion: '7.0.0',
            creationTimestamp: 'new',
          },
          somethingNew: {
            question: 'No comment',
          },
        };
        writeConfigFile(newConfig);
        exportedConfig = JSON.parse(readFileSync('.yo-rc.json', { encoding: 'utf-8' }));
      });

      it('should export the config', () => {
        expect(exportedConfig).toMatchInlineSnapshot(`
{
  "generator-jhipster": {
    "creationTimestamp": "old",
    "jhipsterVersion": "7.0.0",
  },
  "somethingElse": {
    "answer": 42,
  },
  "somethingNew": {
    "question": "No comment",
  },
}
`);
      });
    });

    context('when there is a .yo-rc.json file present without creationTimestamp', () => {
      let exportedConfig;

      beforeEach(() => {
        const existingConfig = {
          'generator-jhipster': {
            jhipsterVersion: '6.5.4',
          },
          somethingElse: {
            answer: 42,
          },
        };
        writeFileSync('.yo-rc.json', JSON.stringify(existingConfig, null, 2));
        const newConfig = {
          'generator-jhipster': {
            jhipsterVersion: '7.0.0',
            creationTimestamp: 'new',
          },
          somethingNew: {
            question: 'No comment',
          },
        };
        writeConfigFile(newConfig);
        exportedConfig = JSON.parse(readFileSync('.yo-rc.json', { encoding: 'utf-8' }));
      });

      it('should export the config with new creationTimestamp', () => {
        expect(exportedConfig).toMatchInlineSnapshot(`
{
  "generator-jhipster": {
    "creationTimestamp": "new",
    "jhipsterVersion": "7.0.0",
  },
  "somethingElse": {
    "answer": 42,
  },
  "somethingNew": {
    "question": "No comment",
  },
}
`);
      });
    });
  });
});
