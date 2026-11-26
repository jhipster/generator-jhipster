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
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { supportedLanguages } from '../../../../languages/support/languages.ts';

import { prepareClientTranslation } from './translations.ts';

const translationsFolder = join(import.meta.dirname, '../templates/src/main/webapp/i18n');
const readTranslation = (languageTag: string, file: string) =>
  JSON.parse(readFileSync(join(translationsFolder, languageTag, `${file}.json`), 'utf8'));

const names = {
  capitalizedBaseName: 'Jhipster',
  hipsterName: 'Java Hipster',
  hipsterProductName: 'JHipster',
  hipsterHomePageProductName: 'JHipster',
  hipsterStackOverflowProductName: 'JHipster',
  hipsterBugTrackerProductName: 'JHipster',
  hipsterChatProductName: 'JHipster',
  hipsterTwitterUsername: '@jhipster',
};

describe('generator - client:i18n - internal - prepareClientTranslation', () => {
  it('should have the translation files of English in every supported language', () => {
    const files = readdirSync(join(translationsFolder, 'en')).sort();
    for (const { languageTag } of supportedLanguages) {
      expect({ languageTag, files: readdirSync(join(translationsFolder, languageTag)).sort() }).toEqual({ languageTag, files });
    }
  });

  it('should write the names of the application', () => {
    const translation = prepareClientTranslation('home', readTranslation('en', 'home'), names);
    expect(translation.home.title).toBe('Welcome, Java Hipster!');
    expect(prepareClientTranslation('global', readTranslation('en', 'global'), names).global.title).toBe('Jhipster');
  });

  it('should leave out the keys whose options do not hold', () => {
    const { indicator } = prepareClientTranslation('health', readTranslation('en', 'health'), names).health;
    expect(indicator).not.toHaveProperty('db');
    expect(indicator).not.toHaveProperty('consul');
    expect(indicator).toHaveProperty('diskSpace');
    expect(prepareClientTranslation('global', readTranslation('en', 'global'), names).global.menu.admin).not.toHaveProperty('gateway');
  });

  it('should keep the keys whose options hold', () => {
    const { indicator } = prepareClientTranslation('health', readTranslation('en', 'health'), {
      ...names,
      databaseTypeSql: true,
      reactive: true,
      applicationTypeGateway: true,
      serviceDiscoveryConsul: true,
    }).health;
    expect(indicator).toMatchObject({ r2dbc: 'Database', consul: 'Consul', discoveryComposite: 'Discovery Composite' });
    expect(indicator).not.toHaveProperty('db');
    expect(indicator).not.toHaveProperty('reactiveDiscoveryClients');
  });
});
