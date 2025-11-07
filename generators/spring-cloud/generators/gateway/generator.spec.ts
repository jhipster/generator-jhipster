/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
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
import { shouldSupportFeatures, testBlueprintSupport } from '../../../../test/support/tests.js';

import Generator from './index.ts';

const generator = `${basename(resolve(import.meta.dirname, '../../'))}:${basename(import.meta.dirname)}`;

describe(`generator - ${generator}`, () => {
  shouldSupportFeatures(Generator);
  describe('blueprint support', () => testBlueprintSupport(generator));

  describe('with defaults options', () => {
    before(async () => {
      await helpers
        .runJHipster(generator)
        .withMockedJHipsterGenerators({ except: ['jhipster:java:bootstrap', 'jhipster:java:build-tool'] })
        .withMockedSource()
        .withSharedApplication({})
        .withJHipsterConfig();
    });

    it('should match files snapshot', () => {
      expect(result.getStateSnapshot()).toMatchSnapshot();
    });

    it('should call source snapshot', () => {
      expect(result.sourceCallsArg).toMatchSnapshot();
    });

    it('should compose with generators', () => {
      expect(result.getComposedGenerators()).toMatchInlineSnapshot(`
[
  "jhipster:maven",
]
`);
    });
  });

  describe('with serviceDiscovery option', () => {
    before(async () => {
      await helpers
        .runJHipster(generator)
        .withMockedJHipsterGenerators({ except: ['jhipster:java:bootstrap', 'jhipster:java:build-tool'] })
        .withMockedSource()
        .withSharedApplication({})
        .withJHipsterConfig({ serviceDiscoveryType: 'consul' });
    });

    it('should match files snapshot', () => {
      expect(result.getStateSnapshot()).toMatchSnapshot();
    });

    it('should call source snapshot', () => {
      expect(result.sourceCallsArg).toMatchSnapshot();
    });

    it('should compose with generators', () => {
      expect(result.getComposedGenerators()).toMatchInlineSnapshot(`
[
  "jhipster:maven",
]
`);
    });
  });

  describe('imperative option requires experimental flag', () => {
    it('should throw error', async () => {
      await expect(
        helpers
          .runJHipster(generator)
          .withMockedJHipsterGenerators({ except: ['jhipster:java:bootstrap', 'jhipster:java:build-tool'] })
          .withMockedSource()
          .withSharedApplication({})
          .withJHipsterConfig({ reactive: false }),
      ).rejects.toThrow('Spring Cloud Gateway MVC support is experimental');
    });
  });

  describe('with imperative option', () => {
    before(async () => {
      await helpers
        .runJHipster(generator)
        .withMockedJHipsterGenerators({ except: ['jhipster:java:bootstrap', 'jhipster:java:build-tool'] })
        .withMockedSource()
        .withSharedApplication({})
        .withOptions({ experimental: true })
        .withJHipsterConfig({ reactive: false });
    });

    it('should match files snapshot', () => {
      expect(result.getStateSnapshot()).toMatchSnapshot();
    });

    it('should call source snapshot', () => {
      expect(result.sourceCallsArg).toMatchSnapshot();
    });

    it('should compose with generators', () => {
      expect(result.getComposedGenerators()).toMatchInlineSnapshot(`
[
  "jhipster:maven",
]
`);
    });
  });
});
