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
import { basename, resolve } from 'node:path';

import { defaultHelpers as helpers, result } from '../../../../lib/testing/index.ts';
import { shouldSupportFeatures, testBlueprintSupport } from '../../../../test/support/tests.ts';
import { CONTEXT_DATA_SANITIZATION_KEY } from '../../support/constants.ts';

import Generator from './index.ts';

const generator = `${basename(resolve(import.meta.dirname, '../../'))}:${basename(import.meta.dirname)}`;

describe(`generator - ${generator}`, () => {
  shouldSupportFeatures(Generator);
  describe('blueprint support', () => testBlueprintSupport(generator, { bootstrapGenerator: true }));

  describe('with defaults options', () => {
    before(async () => {
      await helpers.runJHipster(generator).withMockedJHipsterGenerators().withMockedSource().withSharedApplication({}).withJHipsterConfig();
    });

    it('should match files snapshot', () => {
      expect(result.getStateSnapshot()).toMatchSnapshot();
    });

    it('should call source snapshot', () => {
      expect(result.sourceCallsArg).toMatchSnapshot();
    });

    it('should compose with generators', () => {
      expect(result.composedMockedGenerators).toMatchInlineSnapshot(`[]`);
    });
  });

  describe('security hardening', () => {
    before(async () => {
      await helpers
        .runJHipster(generator)
        // eslint-disable-next-line no-template-curly-in-string
        .withJHipsterConfig({ applicationProperty: '${injected}' } as any)
        .withSkipWritingPriorities();
    });

    it('should be applied to application config', () => {
      expect(result.application).toMatchObject(
        expect.objectContaining({
          applicationProperty: '',
        }),
      );
    });
  });

  describe('custom security hardening', () => {
    before(async () => {
      await helpers
        .runJHipster(generator)
        // eslint-disable-next-line no-template-curly-in-string
        .withJHipsterConfig({ applicationProperty: '${injected}' } as any)
        .withTask('initializing', function () {
          this.getContextData(CONTEXT_DATA_SANITIZATION_KEY, { replacement: (data: any) => ({ ...data, applicationProperty: 'foo' }) });
        })
        .withSkipWritingPriorities();
    });

    it('should be applied to application config', () => {
      expect(result.application).toMatchObject(
        expect.objectContaining({
          applicationProperty: 'foo',
        }),
      );
    });
  });
});
