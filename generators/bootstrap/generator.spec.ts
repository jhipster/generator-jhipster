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
import { before, describe, expect, it } from 'esmocha';
import { basename } from 'node:path';

import { shouldSupportFeatures } from '../../test/support/tests.ts';
import BaseGenerator from '../base/index.ts';

import Generator from './index.ts';

import { defaultHelpers as helpers, result } from '#testing';

const generator = basename(import.meta.dirname);

describe(`generator - ${generator}`, () => {
  shouldSupportFeatures(Generator);

  describe('instance', () => {
    let bootstrapGenerator: Generator;

    beforeEach(async () => {
      bootstrapGenerator = await helpers.instantiateDummyGenerator(Generator);
    });

    it('should not set jhipsterConfig', () => {
      expect(bootstrapGenerator.jhipsterConfig).toBeUndefined();
    });

    it('should reject jhipsterConfigWithDefaults access', () => {
      expect(() => bootstrapGenerator.jhipsterConfigWithDefaults).toThrow(
        'jhipsterConfigWithDefaults is not available in uniqueGlobally generators',
      );
    });
  });

  describe('removeNeedles', () => {
    const content = 'first\n// jhipster-needle-add-content - JHipster will add content here\nlast\n';

    class NeedleGenerator extends BaseGenerator {
      get [BaseGenerator.WRITING]() {
        return this.asWritingTaskGroup({
          write() {
            this.writeDestination('file.txt', content);
          },
        });
      }
    }

    describe('with removeNeedles config', () => {
      before(async () => {
        await helpers.run(NeedleGenerator).withJHipsterConfig({ removeNeedles: true }).withJHipsterGenerators();
      });

      it('should remove needles from the committed file', () => {
        result.assertEqualsFileContent('file.txt', 'first\nlast\n');
      });
    });

    describe('without removeNeedles config', () => {
      before(async () => {
        await helpers.run(NeedleGenerator).withJHipsterGenerators();
      });

      it('should keep needles', () => {
        result.assertEqualsFileContent('file.txt', content);
      });
    });
  });
});
