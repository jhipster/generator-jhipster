/**
 * Copyright 2013-2020 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const Faker = require('faker/lib');
const Randexp = require('randexp');

const { parseLiquibaseChangelogDate } = require('./liquibase');

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
        return this.faker.random.number({ min, max });
    }
}

/**
 * Create a faker instance.
 * @param {string} nativeLanguage - native language
 * @returns {object} Faker instance
 */
function createFaker(nativeLanguage = 'en') {
    // eslint-disable-next-line global-require
    const locales = { en: require('faker/lib/locales/en') };
    if (nativeLanguage !== 'en') {
        // eslint-disable-next-line global-require, import/no-dynamic-require
        locales[nativeLanguage] = require(`faker/lib/locales/${nativeLanguage}`);
    }
    const faker = new Faker({ locales, locale: nativeLanguage });
    faker.getRecentDateForLiquibase = getRecentDateForLiquibase.bind(undefined, faker);
    return faker;
}

/*
 * Current faker version is 4.1.0 and was release in 2017
 * It is outdated
 * https://github.com/Marak/faker.js/blob/10bfb9f467b0ac2b8912ffc15690b50ef3244f09/lib/date.js#L73-L96
 * Needed for reproducible builds
 */
function getRecentDate(faker, days = 1, date = new Date()) {
    const range = {
        min: 1000,
        max: (days || 1) * 24 * 3600 * 1000,
    };

    let future = date.getTime();
    future -= faker.random.number(range); // some time from now to N days ago, in milliseconds
    date.setTime(future);

    return date;
}

function getRecentDateForLiquibase(faker, days, changelogDate) {
    let refDate;
    if (changelogDate) {
        refDate = parseLiquibaseChangelogDate(changelogDate);
    }
    return getRecentDate(faker, days, refDate);
}

module.exports = { createFaker, RandexpWithFaker, getRecentDateForLiquibase };
