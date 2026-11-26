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
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { supportedLanguages } from '../../../../languages/support/languages.ts';

import { type EntityTranslationTexts, getEntityTranslations } from './entity-translations.ts';

const textsFolder = join(import.meta.dirname, '../templates/entity/i18n');
const readTexts = (languageTag: string): EntityTranslationTexts =>
  JSON.parse(readFileSync(join(textsFolder, `${languageTag}.json`), 'utf8'));

describe('generator - client:i18n - internal - getEntityTranslations', () => {
  const names = { entity: 'Order Line', entities: 'Order Lines' };

  it('should have the texts of every supported language', () => {
    for (const { languageTag } of supportedLanguages) {
      expect(Object.keys(getEntityTranslations(readTexts(languageTag), names))).toEqual(
        expect.arrayContaining(['createLabel', 'notFound', 'created', 'updated', 'deleted', 'deleteQuestion']),
      );
    }
  });

  it('should write the names of the entity in the texts', () => {
    expect(getEntityTranslations(readTexts('en'), names)).toMatchObject({
      createLabel: 'Create a new Order Line',
      notFound: 'No Order Lines found',
    });
  });

  it('should agree the Brazilian Portuguese texts with the gender of the variant', () => {
    expect(getEntityTranslations(readTexts('pt-br'), { ...names, variant: 'female' })).toMatchObject({
      createLabel: 'Criar nova Order Line',
      notFound: 'Nenhuma Order Line encontrada',
      created: 'Uma nova Order Line foi criada com o identificador {{ param }}',
    });
    expect(getEntityTranslations(readTexts('pt-br'), names)).toMatchObject({
      createLabel: 'Criar novo Order Line',
      notFound: 'Nenhum Order Line encontrado',
    });
  });

  it('should write the texts as the content of JSON strings', () => {
    const texts = { ...readTexts('en'), createLabel: 'Create a "new" {entity}' };
    expect(getEntityTranslations(texts, names).createLabel).toBe('Create a \\"new\\" Order Line');
  });
});
