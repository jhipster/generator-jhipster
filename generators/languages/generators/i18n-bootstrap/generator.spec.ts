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
import { after, before, describe, expect, it } from 'expect-node';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';

import Generator from './generator.ts';

import { shouldSupportFeatures } from '#test-support';
import { defaultHelpers as helpers, result } from '#testing';

const generator = `${basename(resolve(dirname(import.meta.dirname), '../'))}:${basename(import.meta.dirname)}`;

const translation = { home: { title: 'Welcome' } };

describe(`generator - ${generator}`, () => {
  shouldSupportFeatures(Generator);

  describe('with the translation enabled', () => {
    before(async () => {
      await helpers
        .runJHipster(generator)
        .withMockedJHipsterGenerators()
        .withJHipsterConfig({ enableTranslation: true, nativeLanguage: 'fr', languages: ['fr', 'en'] })
        .withTask('writing', function ({ application }: any) {
          application.addTranslation({ languageTag: 'fr', destinationFile: 'i18n/fr/home.json', translation });
        });
    });

    it('should write the translation file - snapshot', () => {
      expect(result.getStateSnapshot()).toMatchSnapshot();
    });

    it('should write the translation as JSON', () => {
      result.assertJsonFileContent('i18n/fr/home.json', translation);
    });
  });

  describe('with the translation disabled', () => {
    before(async () => {
      await helpers
        .runJHipster(generator)
        .withMockedJHipsterGenerators()
        .withJHipsterConfig({ enableTranslation: false, nativeLanguage: 'fr' })
        .withTask('writing', function ({ application }: any) {
          application.addTranslation({ languageTag: 'fr', destinationFile: 'i18n/fr/home.json', translation });
          application.addTranslation({
            languageTag: 'en',
            destinationFile: 'i18n/en/home.json',
            translation: { home: { title: 'Hi', subtitle: 'Home' } },
          });
          application.addTranslation({
            languageTag: 'de',
            destinationFile: 'i18n/de/home.json',
            translation: { home: { other: 'Andere' } },
          });
        });
    });

    it('should write no file - snapshot', () => {
      expect(result.getStateSnapshot()).toMatchSnapshot();
    });

    it('should read the native language, English as its fallback, without a file', () => {
      expect(result.application!.translations).toEqual({ home: { title: 'Welcome', subtitle: 'Home' } });
      expect(result.application!.getWebappTranslation!('home.title')).toBe('Welcome');
    });
  });

  describe('loadTranslationFiles', () => {
    const templatesFolder = mkdtempSync(join(tmpdir(), 'i18n-bootstrap-'));
    after(() => rmSync(templatesFolder, { recursive: true }));

    const loadAndWrite = async function ({ application }: any) {
      application.loadTranslationFiles({
        templatesFolders: [templatesFolder],
        folder: (languageTag: string) => languageTag,
        names: { app: 'Shop' },
        conditions: { home: { 'home.gateway': ({ gateway }: { gateway?: boolean }) => gateway } },
        context: { appName: 'Shop' },
      });
      application.writeTranslationFiles({
        files: ['home', 'menu'],
        destinationFile: (languageTag: string, file: string) => `i18n/${languageTag}/${file}.json`,
      });
    };

    before(() => {
      mkdirSync(join(templatesFolder, 'fr'), { recursive: true });
      mkdirSync(join(templatesFolder, 'en'), { recursive: true });
      writeFileSync(join(templatesFolder, 'en/other.json'), JSON.stringify({ other: { title: 'Other', subtitle: 'Fallback' } }));
      writeFileSync(join(templatesFolder, 'fr/home.json'), JSON.stringify({ home: { title: 'Bienvenue {app}', gateway: 'Passerelle' } }));
      writeFileSync(join(templatesFolder, 'fr/menu.json.ejs'), '{ "menu": { "title": "Menu <%= appName %>" } }');
      writeFileSync(join(templatesFolder, 'fr/other.json'), JSON.stringify({ other: { title: 'Autre' } }));
    });

    describe('with the translation enabled', () => {
      before(async () => {
        await helpers
          .runJHipster(generator)
          .withMockedJHipsterGenerators()
          .withJHipsterConfig({ enableTranslation: true, nativeLanguage: 'fr', languages: ['fr'] })
          .withTask('writing', loadAndWrite);
      });

      it('should translate the languages of the application', () => {
        expect(result.application!.translationLanguages.map(({ languageTag }: { languageTag: string }) => languageTag)).toEqual(['fr']);
      });

      it('should write the prepared JSON file of a language', () => {
        result.assertJsonFileContent('i18n/fr/home.json', { home: { title: 'Bienvenue Shop' } });
        result.assertNoJsonFileContent('i18n/fr/home.json', { home: { gateway: 'Passerelle' } });
      });

      it('should write the rendered template of a language', () => {
        result.assertJsonFileContent('i18n/fr/menu.json', { menu: { title: 'Menu Shop' } });
      });

      it('should write only the files asked', () => {
        result.assertNoFile('i18n/fr/other.json');
      });
    });

    describe('with the translation disabled', () => {
      before(async () => {
        await helpers
          .runJHipster(generator)
          .withMockedJHipsterGenerators()
          .withJHipsterConfig({ enableTranslation: false, nativeLanguage: 'fr' })
          .withTask('writing', loadAndWrite);
      });

      it('should write no file', () => {
        result.assertNoFile('i18n/fr/home.json');
      });

      it('should load every file of the language', () => {
        expect(result.application!.getWebappTranslation!('other.title')).toBe('Autre');
        expect(result.application!.getWebappTranslation!('menu.title')).toBe('Menu Shop');
        expect(result.application!.getWebappTranslation!('other.subtitle')).toBe('Fallback');
      });
    });
  });

  describe('translationLanguages without the translation', () => {
    before(async () => {
      await helpers
        .runJHipster(generator)
        .withMockedJHipsterGenerators()
        .withJHipsterConfig({ enableTranslation: false, nativeLanguage: 'fr' });
    });

    it('should be the native language and English', () => {
      expect(result.application!.translationLanguages.map(({ languageTag }: { languageTag: string }) => languageTag)).toEqual(['fr', 'en']);
    });
  });
});
