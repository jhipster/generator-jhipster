const assert = require('assert');
const { parseLiquibaseChangelogDate } = require('../utils/liquibase');
const { createFaker } = require('../utils/faker');

describe('Faker Utils', () => {
    describe('::getRecentDate', () => {
        const faker = createFaker();
        beforeEach(() => {
            faker.seed(47);
        });
        describe('when not passing parameters', () => {
            it('returns a date object', () => {
                assert(faker.getRecentDate() instanceof Date);
            });
        });
        describe('when passing 1 day', () => {
            it('returns a date object', () => {
                assert(faker.getRecentDate(1) instanceof Date);
            });
        });
        describe('when passing 1 day with changelogDate', () => {
            it('returns a date object', () => {
                assert(faker.getRecentDate(1, parseLiquibaseChangelogDate('20160208210114')) instanceof Date);
            });
            it('returns a recent reproducible date', () => {
                assert.equal(
                    faker.getRecentDate(1, parseLiquibaseChangelogDate('20160208210114')).toISOString(),
                    '2016-02-08T18:17:47.710Z'
                );
            });
        });
        describe('when passing 10 day with changelogDate', () => {
            it('returns a recent reproducible date', () => {
                assert.equal(
                    faker.getRecentDate(10, parseLiquibaseChangelogDate('20160208210114')).toISOString(),
                    '2016-02-07T17:46:59.078Z'
                );
            });
        });
    });
});
