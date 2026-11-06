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

import Generator from './index.ts';

import { shouldSupportFeatures, testBlueprintSupport } from '#test-support';
import { defaultHelpers as helpers, result } from '#testing';

const generator = `${basename(resolve(import.meta.dirname, '../../'))}:${basename(import.meta.dirname)}`;

describe(`generator - ${generator}`, () => {
  shouldSupportFeatures(Generator);
  describe('blueprint support', () => testBlueprintSupport(generator));

  describe('with enableTranslation disabled', () => {
    const marker = "__jhiTransformTranslateStringify__('key')";

    before(async () => {
      await helpers
        .runJHipster(generator)
        .withMockedJHipsterGenerators()
        .withMockedSource()
        .withSharedApplication({ getWebappTranslation: (key: string) => `translated ${key}` })
        .withJHipsterConfig({ enableTranslation: false })
        .onGenerator(clientSpringBoot => {
          clientSpringBoot.writeDestination('written.ts', marker);
          clientSpringBoot.fs.write(clientSpringBoot.destinationPath('other.ts'), marker);
        });
    });

    it('should translate the files written by the generator', () => {
      result.assertFileContent('written.ts', '"translated key"');
    });

    it('should keep the files of other generators', () => {
      result.assertFileContent('other.ts', marker);
    });
  });

  describe('with enableTranslation disabled and the models', () => {
    before(async () => {
      await helpers
        .runJHipster(generator)
        .withMockedJHipsterGenerators()
        .withMockedSource()
        .withSharedApplication({ getWebappTranslation: (key: string) => `translated ${key}` })
        .withJHipsterConfig({ enableTranslation: false });
    });

    for (const model of ['configuration', 'health', 'metrics']) {
      it(`should write the texts of the ${model} model`, () => {
        result.assertFileContent(`src/main/webapp/app/shared/jhipster/${model}.ts`, '"translated ');
        result.assertNoFileContent(`src/main/webapp/app/shared/jhipster/${model}.ts`, 'translationKey');
      });
    }
  });

  describe('with enableTranslation enabled', () => {
    before(async () => {
      await helpers
        .runJHipster(generator)
        .withMockedJHipsterGenerators()
        .withMockedSource()
        .withSharedApplication({ getWebappTranslation: (key: string) => `translated ${key}` })
        .withJHipsterConfig({ enableTranslation: true })
        .onGenerator(clientSpringBoot => {
          clientSpringBoot.writeDestination('written.ts', "__jhiTransformTranslateStringify__('key')");
        });
    });

    it('should not translate the files', () => {
      result.assertFileContent('written.ts', '__jhiTransformTranslateStringify__');
    });
  });

  describe('with defaults options', () => {
    before(async () => {
      await helpers.runJHipster(generator).withMockedJHipsterGenerators().withMockedSource().withSharedApplication({}).withJHipsterConfig();
    });

    it('should match files snapshot', () => {
      expect(result.getStateSnapshot()).toMatchSnapshot();
    });

    it('should compose with generators', () => {
      expect(result.getComposedGenerators()).toMatchInlineSnapshot(`[]`);
    });
  });
});
