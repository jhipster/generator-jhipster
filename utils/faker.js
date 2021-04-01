/**
 * Copyright 2013-2021 the original author or authors from the JHipster project.
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
const Faker = require('faker/lib');
const Randexp = require('randexp');

const { languageToJavaLanguage } = require('../generators/utils');

class RandexpWithFaker extends Randexp {
  constructor(regexp, m, faker) {
    super(regexp, m);
    this.max = 5;
    this.faker = faker;
    if (this.faker === undefined) {
      throw new Error('Faker is required');
    }
  }

  // In order to have consistent results with RandExp, the RNG is seeded.
  randInt(min, max) {
    return this.faker.datatype.number({ min, max });
  }
}

/**
 * Create a faker instance.
 * @param {string} nativeLanguage - native language
 * @returns {object} Faker instance
 */
function createFaker(nativeLanguage = 'en') {
  nativeLanguage = languageToJavaLanguage(nativeLanguage);
  // Fallback language
  // eslint-disable-next-line global-require
  const locales = { en: require('faker/lib/locales/en') };
  if (nativeLanguage !== 'en') {
    try {
      // eslint-disable-next-line global-require, import/no-dynamic-require
      const nativeLanguageLocale = require(`faker/lib/locales/${nativeLanguage}`);
      locales[nativeLanguage] = nativeLanguageLocale;
    } catch (error) {
      // Faker not implemented for the native language, fallback to en.
      nativeLanguage = 'en';
    }
  }
  const faker = new Faker({ locales, locale: nativeLanguage, localeFallback: 'en' });
  faker.createRandexp = (pattern, m) => new RandexpWithFaker(pattern, m, faker);
  return faker;
}

module.exports = { createFaker };
