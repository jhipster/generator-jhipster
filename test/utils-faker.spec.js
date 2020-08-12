const faker = require('faker');
const assert = require('assert');
const { getRecentDateForLiquibase } = require('../utils/faker');

describe('Liquibase Utils', () => {
    describe('::getRecentDateForLiquibase', () => {
        beforeEach(() => {
            faker.seed(47);
        });
        describe('when not passing parameters', () => {
            it('returns a date object', () => {
                assert(getRecentDateForLiquibase(faker) instanceof Date);
            });
        });
        describe('when passing 1 day', () => {
            it('returns a date object', () => {
                assert(getRecentDateForLiquibase(faker, 1) instanceof Date);
            });
        });
        describe('when passing 1 day with changelogDate', () => {
            it('returns a date object', () => {
                assert(getRecentDateForLiquibase(faker, 1, '20160208210114') instanceof Date);
            });
            it('returns a recent reproducible date', () => {
                assert.equal(getRecentDateForLiquibase(faker, 1, '20160208210114').toISOString(), '2016-02-08T18:17:47.710Z');
            });
        });
        describe('when passing 10 day with changelogDate', () => {
            it('returns a recent reproducible date', () => {
                assert.equal(getRecentDateForLiquibase(faker, 10, '20160208210114').toISOString(), '2016-02-07T17:46:59.078Z');
            });
        });
    });
});
