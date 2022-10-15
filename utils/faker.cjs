/**
 * Copyright 2013-2022 the original author or authors from the JHipster project.
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
const { Faker } = require('@faker-js/faker');
const Randexp = require('randexp');

const { languageToJavaLanguage, stringHashCode } = require('../generators/utils.cjs');

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
async function createFaker(nativeLanguage = 'en') {
  nativeLanguage = languageToJavaLanguage(nativeLanguage);
  let nativeFakerInstance;
  // Faker >=6 doesn't exports locales by itself, it exports a faker instance with the locale.
  // We need a Faker instance for each entity, to build additional fake instances, use the locale from the exported localized faker instance.
  // See https://github.com/faker-js/faker/pull/642
  try {
    // eslint-disable-next-line import/no-dynamic-require
    nativeFakerInstance = (await import(`@faker-js/faker/locale/${nativeLanguage}`)).faker;
  } catch (error) {
    // Faker not implemented for the native language, fallback to en.
    // eslint-disable-next-line import/no-unresolved, import/no-dynamic-require
    nativeFakerInstance = (await import('@faker-js/faker/locale/en')).faker;
  }

  const faker = new Faker({
    locales: nativeFakerInstance.locales,
    locale: nativeFakerInstance.locale,
    localeFallback: nativeFakerInstance.localeFallback,
  });
  faker.createRandexp = (pattern, m) => new RandexpWithFaker(pattern, m, faker);
  return faker;
}

async function addFakerToEntity(entityWithConfig, nativeLanguage = 'en') {
  entityWithConfig.faker = entityWithConfig.faker || (await createFaker(nativeLanguage));
  entityWithConfig.resetFakerSeed = (suffix = '') =>
    entityWithConfig.faker.seed(stringHashCode(entityWithConfig.name.toLowerCase() + suffix));
  entityWithConfig.resetFakerSeed();
}

module.exports = { createFaker, addFakerToEntity };
