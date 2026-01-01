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
import { describe, expect } from 'esmocha';
import { basename } from 'node:path';

import { defaultHelpers as helpers, result as runResult } from '../../lib/testing/index.ts';
import { shouldSupportFeatures, testBlueprintSupport } from '../../test/support/tests.ts';

import Generator from './index.ts';

const generator = basename(import.meta.dirname);

describe(`generator - ${generator}`, () => {
  shouldSupportFeatures(Generator);
  describe.skip('blueprint support', () => testBlueprintSupport(generator));

  describe('with default configuration', () => {
    before(async () => {
      await helpers
        .runJHipster('entity')
        .withMockedGenerators(['jhipster:languages'])
        .withJHipsterConfig({})
        .withAnswers({ fieldAdd: false, relationshipAdd: false, service: 'no', dto: 'no', pagination: 'no' })
        .withSharedApplication({ getWebappTranslation: () => 'translations' })
        .withArguments(['Foo'])
        .withOptions({ ignoreNeedlesError: true, regenerate: true, force: true, singleEntity: true })
        .withMockedSource();
    });

    it('should match files snapshot', () => {
      expect(runResult.getStateSnapshot()).toMatchSnapshot();
    });
  });
});
