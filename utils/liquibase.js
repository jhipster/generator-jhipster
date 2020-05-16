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
const faker = require('faker');

module.exports = { getRecentDateForLiquibase, parseLiquibaseChangelogDate };

/*
 * Current faker version is 4.1.0 and was release in 2017
 * It is outdated
 * https://github.com/Marak/faker.js/blob/10bfb9f467b0ac2b8912ffc15690b50ef3244f09/lib/date.js#L73-L96
 * Needed for reproducible builds
 */
function getRecentDate(days = 1, date = new Date()) {
    const range = {
        min: 1000,
        max: (days || 1) * 24 * 3600 * 1000,
    };

    let future = date.getTime();
    future -= faker.random.number(range); // some time from now to N days ago, in milliseconds
    date.setTime(future);

    return date;
}

function parseLiquibaseChangelogDate(changelogDate) {
    if (!changelogDate || changelogDate.length !== 14) {
        throw new Error('A valid changelogDate is required to parse.');
    }
    const formatedDate = `${changelogDate.substring(0, 4)}-${changelogDate.substring(4, 6)}-${changelogDate.substring(
        6,
        8
    )}T${changelogDate.substring(8, 10)}:${changelogDate.substring(10, 12)}:${changelogDate.substring(12, 14)}+00:00`;
    return new Date(Date.parse(formatedDate));
}

function getRecentDateForLiquibase(days, changelogDate) {
    let refDate;
    if (changelogDate) {
        refDate = parseLiquibaseChangelogDate(changelogDate);
    }
    return getRecentDate(days, refDate);
}
