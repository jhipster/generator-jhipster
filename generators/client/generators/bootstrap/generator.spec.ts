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
import { before, describe, expect, it } from 'expect-node';
import { basename, resolve } from 'node:path';

import { testBootstrapEntities } from '../../../../test/support/bootstrap-tests.ts';

import Generator from './generator.ts';

import { shouldSupportFeatures } from '#test-support';
import { defaultHelpers as helpers, runResult } from '#testing';

const generator = `${basename(resolve(import.meta.dirname, '../../'))}:${basename(import.meta.dirname)}`;

describe(`generator - ${generator}`, () => {
  shouldSupportFeatures(Generator);

  it('bootstrap migration', async () => {
    await helpers
      .runJHipster('jhipster:bootstrap-application-client')
      .prepareEnvironment()
      .withMockedGenerators(['jhipster:client:bootstrap']);
    expect(runResult.getComposedGenerators()).toContain('jhipster:client:bootstrap');
  });

  describe('withAdminUi', () => {
    const run = (config: Record<string, unknown>) => helpers.runJHipster(generator).withJHipsterConfig(config);

    it('should default to true with a Spring Boot backend', async () => {
      await run({});
      expect(runResult.application?.withAdminUi).toBe(true);
    });

    it('should default to false with another backend', async () => {
      await run({ backendType: 'Other' });
      expect(runResult.application?.withAdminUi).toBe(false);
    });

    it('should keep the value set for another backend', async () => {
      await run({ backendType: 'Other', withAdminUi: true });
      expect(runResult.application?.withAdminUi).toBe(true);
    });

    it('should default to false in a microservice', async () => {
      await run({ applicationType: 'microservice' });
      expect(runResult.application?.withAdminUi).toBe(false);
    });
  });

  describe('with', () => {
    describe('default config', () => {
      before(async () => {
        await helpers.runJHipster(generator).withJHipsterConfig();
      });

      it('should succeed - snapshot', () => {
        expect(runResult.getSnapshot()).toMatchInlineSnapshot(`
{
  ".yo-rc.json": {
    "contents": "{
  "generator-jhipster": {
    "baseName": "jhipster",
    "creationTimestamp": 1577836800000,
    "entities": []
  }
}
",
    "stateCleared": "modified",
  },
}
`);
      });
    });
  });

  testBootstrapEntities(generator);
});
