/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
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
import { Faker, type LocaleDefinition, base, en } from '@faker-js/faker';
import Randexp from 'randexp';

import { languageToJavaLanguage } from '../../languages/support/languages.js';

class RandexpWithFaker extends Randexp {
  faker: Faker;

  constructor(regexp: string | RegExp, flags: string | undefined, faker: Faker) {
    super(regexp, flags);
    this.max = 5;
    this.faker = faker;
    if (this.faker === undefined) {
      throw new Error('Faker is required');
    }
    // In order to have consistent results with RandExp, the RNG is seeded.
    this.randInt = (from: number, to?: number): number => faker.number.int({ min: from, max: to });
  }
}

export class FakerWithRandexp extends Faker {
  createRandexp(regexp: string | RegExp, flags?: string) {
    return new RandexpWithFaker(regexp, flags, this);
  }
}

/**
 * Create a faker instance.
 * @param nativeLanguage - native language
 * @returns Faker instance
 */

export async function createFaker(nativeLanguage = 'en') {
  nativeLanguage = languageToJavaLanguage(nativeLanguage);
  let locale: LocaleDefinition;
  try {
    locale = ((await import(`@faker-js/faker`)) as any)[nativeLanguage];
  } catch {
    // Faker not implemented for the native language, fallback to en.

    locale = (await import('@faker-js/faker')).en;
  }

  const faker = new FakerWithRandexp({
    locale: [locale, base, en],
  });
  faker.createRandexp = (pattern, m) => new RandexpWithFaker(pattern, m, faker);
  return faker;
}
