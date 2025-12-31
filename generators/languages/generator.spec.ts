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
import { before, describe, it } from 'esmocha';
import { basename } from 'node:path';

import { defaultHelpers as helpers, result as runResult } from '../../lib/testing/index.ts';
import { shouldSupportFeatures, testBlueprintSupport } from '../../test/support/tests.ts';

import Generator from './index.ts';

const GENERATOR_LANGUAGES = 'languages';

const generator = basename(import.meta.dirname);

describe(`generator - ${generator}`, () => {
  shouldSupportFeatures(Generator);
  describe('blueprint support', () => testBlueprintSupport(generator));
  describe('languages migration', () => {
    describe('indonesian language', () => {
      before(() =>
        helpers
          .runJHipster(GENERATOR_LANGUAGES)
          .withSkipWritingPriorities()
          .withJHipsterConfig({
            jhipsterVersion: '7.9.3',
            enableTranslation: true,
            nativeLanguage: 'in',
            languages: ['in'],
            baseName: 'jhipster',
          })
          .commitFiles(),
      );
      it('should migrate in language to id', () => {
        runResult.assertJsonFileContent('.yo-rc.json', {
          'generator-jhipster': {
            nativeLanguage: 'id',
            languages: ['id'],
          },
        });
      });
    });
  });
});
