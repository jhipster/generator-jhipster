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

  describe('with a serverI18nDir and the translation enabled', () => {
    before(async () => {
      await helpers
        .runJHipster(generator)
        .withMockedJHipsterGenerators()
        .withSharedApplication({ serverI18nDir: 'server/src/i18n/', serverI18nTestDir: 'server/test/i18n/' })
        .withJHipsterConfig({ enableTranslation: true, nativeLanguage: 'en', languages: ['en', 'fr'] });
    });

    it('should write the messages to the folder', () => {
      expect(result.getStateSnapshot()).toMatchSnapshot();
    });
  });

  describe('with the files named by the language tag', () => {
    before(async () => {
      await helpers
        .runJHipster(generator)
        .withMockedJHipsterGenerators()
        .withSharedApplication({
          serverI18nDir: 'server/src/i18n/',
          serverI18nFileNaming: 'languageTag',
          languagesToGenerate: ['en', 'pt-br', 'zh-cn'],
        })
        .withJHipsterConfig({ enableTranslation: true, nativeLanguage: 'en', languages: ['en', 'pt-br', 'zh-cn'] });
    });

    it('should name the file of each language by its language tag', () => {
      result.assertFile([
        'server/src/i18n/messages.properties',
        'server/src/i18n/messages_pt-br.properties',
        'server/src/i18n/messages_zh-cn.properties',
      ]);
      result.assertNoFile(['server/src/i18n/messages_pt_BR.properties', 'server/src/i18n/messages_zh_CN.properties']);
    });
  });
});
