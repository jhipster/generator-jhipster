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

import { type EntityTranslationTexts, buildEntityTranslation, getEntityTranslations } from './entity-translations.ts';

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

  it('should keep the texts as written', () => {
    const texts = { ...readTexts('en'), createLabel: 'Create a "new" {entity}' };
    expect(getEntityTranslations(texts, names).createLabel).toBe('Create a "new" Order Line');
  });
});

describe('generator - client:i18n - internal - buildEntityTranslation', () => {
  const entity = {
    frontendAppName: 'jhipsterApp',
    entityTranslationKey: 'orderLine',
    entityNameHumanized: 'Order Line',
    entityNamePluralHumanized: 'Order Lines',
    fields: [{ fieldName: 'name', fieldNameHumanized: 'Name', documentation: 'The "name"' }],
    relationships: [{ relationshipName: 'order', relationshipNameHumanized: 'Order' }],
  };

  it('should build the translation of an entity', () => {
    expect(buildEntityTranslation(entity, readTexts('en'))).toEqual({
      jhipsterApp: {
        orderLine: {
          home: {
            title: 'Order Lines',
            refreshListLabel: 'Refresh list',
            createLabel: 'Create a new Order Line',
            createOrEditLabel: 'Create or edit a Order Line',
            notFound: 'No Order Lines found',
          },
          created: 'A new Order Line is created with identifier {{ param }}',
          updated: 'A Order Line is updated with identifier {{ param }}',
          deleted: 'A Order Line is deleted with identifier {{ param }}',
          delete: { question: 'Are you sure you want to delete Order Line {{ id }}?' },
          detail: { title: 'Order Line' },
          name: 'Name',
          order: 'Order',
          help: { name: 'The "name"' },
        },
      },
    });
  });

  it('should leave the texts of the changes out of a read-only entity', () => {
    expect(buildEntityTranslation({ ...entity, readOnly: true }, readTexts('en')).jhipsterApp.orderLine).toEqual({
      home: { title: 'Order Lines', refreshListLabel: 'Refresh list', notFound: 'No Order Lines found' },
      detail: { title: 'Order Line' },
      name: 'Name',
      order: 'Order',
      help: { name: 'The "name"' },
    });
  });

  it('should write the texts of the changes of a microservice entity under the microservice', () => {
    const translation = buildEntityTranslation({ ...entity, microserviceAppName: 'orders', searchEngineAny: true }, readTexts('en'));
    expect(translation.jhipsterApp.orderLine).not.toHaveProperty('created');
    expect(translation.jhipsterApp.orderLine.home.search).toBe('Search for Order Line');
    expect(translation.orders).toEqual({
      orderLine: {
        created: 'A new Order Line is created with identifier {{ param }}',
        updated: 'A Order Line is updated with identifier {{ param }}',
        deleted: 'A Order Line is deleted with identifier {{ param }}',
      },
    });
  });
});
