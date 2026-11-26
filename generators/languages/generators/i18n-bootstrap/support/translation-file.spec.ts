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
import { describe, expect, it } from 'expect-node';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { findTranslationSource, prepareTranslation } from './translation-file.ts';

describe('generator - languages:i18n-bootstrap - support - translation-file', () => {
  describe('prepareTranslation', () => {
    it('should write the names in the texts', () => {
      expect(prepareTranslation({ a: { b: 'Welcome to {app}, {app}!', c: '{{ id }}' } }, { names: { app: 'Shop' } })).toEqual({
        a: { b: 'Welcome to Shop, Shop!', c: '{{ id }}' },
      });
    });

    it('should leave out the keys whose conditions do not hold', () => {
      const conditions = { 'a.b': ({ on }: { on: boolean }) => on, 'a.missing.c': () => false };
      expect(prepareTranslation({ a: { b: 'B', d: 'D' } }, { conditions, options: { on: false } })).toEqual({ a: { d: 'D' } });
      expect(prepareTranslation({ a: { b: 'B', d: 'D' } }, { conditions, options: { on: true } })).toEqual({ a: { b: 'B', d: 'D' } });
    });

    it('should not change the translation it is given', () => {
      const translation = { a: { b: 'B' } };
      prepareTranslation(translation, { conditions: { 'a.b': () => false } });
      expect(translation).toEqual({ a: { b: 'B' } });
    });
  });

  describe('findTranslationSource', () => {
    it('should find the template, then the JSON file, of the first folder that has one', () => {
      const root = mkdtempSync(join(tmpdir(), 'translation-file-'));
      try {
        const [blueprint, core] = [join(root, 'blueprint'), join(root, 'core')];
        mkdirSync(join(blueprint, 'en'), { recursive: true });
        mkdirSync(join(core, 'en'), { recursive: true });
        writeFileSync(join(core, 'en/global.json'), '{}');
        writeFileSync(join(core, 'en/home.json'), '{}');
        writeFileSync(join(blueprint, 'en/home.json.ejs'), '{}');
        expect(findTranslationSource([blueprint, core], 'en/global.json')).toEqual({ path: join(core, 'en/global.json'), template: false });
        expect(findTranslationSource([blueprint, core], 'en/home.json')).toEqual({
          path: join(blueprint, 'en/home.json.ejs'),
          template: true,
        });
        expect(findTranslationSource([blueprint, core], 'en/missing.json')).toBeUndefined();
      } finally {
        rmSync(root, { recursive: true });
      }
    });
  });
});
