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

import { defaultHelpers as helpers, runResult } from '../../lib/testing/index.ts';

const GENERATOR_APP = 'app';

const allMockedComposedGenerators = [
  'jhipster:common',
  'jhipster:languages',
  'jhipster:entities',
  'jhipster:entity',
  'jhipster:database-changelog',
  'jhipster:bootstrap',
  'jhipster:git',
  'jhipster:server',
  'jhipster:client',
];

describe('generator - app - composing', () => {
  describe('when mocking all generators', () => {
    describe('with default options', () => {
      before(async () => {
        await helpers.runJHipster('app').withJHipsterConfig().withMockedGenerators(allMockedComposedGenerators);
      });

      it('should compose with bootstrap generator', () => {
        runResult.assertGeneratorComposed('jhipster:bootstrap');
      });
      it('should compose with common generator', () => {
        runResult.assertGeneratorComposedOnce('jhipster:common');
      });
      it('should compose with server generator', () => {
        runResult.assertGeneratorComposedOnce('jhipster:server');
      });
      it('should compose with client generator', () => {
        runResult.assertGeneratorComposedOnce('jhipster:client');
      });
      it('should not compose with languages generator', () => {
        runResult.assertGeneratorNotComposed('jhipster:languages');
      });
      it('should not compose with entities generator', () => {
        runResult.assertGeneratorNotComposed('jhipster:entities');
      });
      it('should not compose with entity generator', () => {
        runResult.assertGeneratorNotComposed('jhipster:entity');
      });
      it('should not compose with database-changelog generator', () => {
        runResult.assertGeneratorNotComposed('jhipster:database-changelog');
      });
    });

    describe('with --skip-client', () => {
      before(async () => {
        await helpers
          .runJHipster(GENERATOR_APP)
          .withJHipsterConfig({
            skipClient: true,
          })
          .withMockedGenerators(allMockedComposedGenerators);
      });

      it('should compose with bootstrap generator', () => {
        runResult.assertGeneratorComposed('jhipster:bootstrap');
      });
      it('should compose with common generator', () => {
        runResult.assertGeneratorComposedOnce('jhipster:common');
      });
      it('should compose with server generator', () => {
        runResult.assertGeneratorComposedOnce('jhipster:server');
      });
      it('should not compose with client generator', () => {
        runResult.assertGeneratorNotComposed('jhipster:client');
      });
      it('should not compose with languages generator', () => {
        runResult.assertGeneratorNotComposed('jhipster:languages');
      });
      it('should not compose with entities generator', () => {
        runResult.assertGeneratorNotComposed('jhipster:entities');
      });
      it('should not compose with entity generator', () => {
        runResult.assertGeneratorNotComposed('jhipster:entity');
      });
      it('should not compose with database-changelog generator', () => {
        runResult.assertGeneratorNotComposed('jhipster:database-changelog');
      });
    });

    describe('with --skip-server', () => {
      before(async () => {
        await helpers
          .runJHipster(GENERATOR_APP)
          .withJHipsterConfig({
            skipServer: true,
          })
          .withMockedGenerators(allMockedComposedGenerators);
      });

      it('should compose with bootstrap generator', () => {
        runResult.assertGeneratorComposed('jhipster:bootstrap');
      });
      it('should compose with common generator', () => {
        runResult.assertGeneratorComposedOnce('jhipster:common');
      });
      it('should not compose with server generator', () => {
        runResult.assertGeneratorNotComposed('jhipster:server');
      });
      it('should compose with client generator', () => {
        runResult.assertGeneratorComposedOnce('jhipster:client');
      });
      it('should not compose with entities generator', () => {
        runResult.assertGeneratorNotComposed('jhipster:entities');
      });
      it('should not compose with entity generator', () => {
        runResult.assertGeneratorNotComposed('jhipster:entity');
      });
      it('should not compose with database-changelog generator', () => {
        runResult.assertGeneratorNotComposed('jhipster:database-changelog');
      });
    });
  });
});
