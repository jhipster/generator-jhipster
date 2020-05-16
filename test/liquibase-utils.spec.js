const expect = require('chai').expect;
const faker = require('faker');
const assert = require('yeoman-assert');
const liquibaseUtils = require('../utils/liquibase');

describe('Liquibase Utils', () => {
    describe('::parseLiquibaseChangelogDate', () => {
        describe('when not passing parameters', () => {
            it('throws', () => {
                expect(() => liquibaseUtils.parseLiquibaseChangelogDate()).to.throw(/^A valid changelogDate is required to parse\.$/);
            });
        });
        describe('when passing an invalid changelogDate', () => {
            it('throws', () => {
                expect(() => liquibaseUtils.parseLiquibaseChangelogDate('1234')).to.throw(/^A valid changelogDate is required to parse\.$/);
            });
        });
        describe('when passing a valid changelogDate', () => {
            it('returns a date object', () => {
                assert(liquibaseUtils.parseLiquibaseChangelogDate('20160208210114') instanceof Date);
            });
            it('returns the date', () => {
                assert.equal(liquibaseUtils.parseLiquibaseChangelogDate('20160208210114').toISOString(), '2016-02-08T21:01:14.000Z');
            });
        });
    });
    describe('::getRecentDateForLiquibase', () => {
        beforeEach(() => {
            faker.seed(47);
        });
        describe('when not passing parameters', () => {
            it('returns a date object', () => {
                assert(liquibaseUtils.getRecentDateForLiquibase() instanceof Date);
            });
        });
        describe('when passing 1 day', () => {
            it('returns a date object', () => {
                assert(liquibaseUtils.getRecentDateForLiquibase(1) instanceof Date);
            });
        });
        describe('when passing 1 day with changelogDate', () => {
            it('returns a date object', () => {
                assert(liquibaseUtils.getRecentDateForLiquibase(1, '20160208210114') instanceof Date);
            });
            it('returns a recent reproducible date', () => {
                assert.equal(liquibaseUtils.getRecentDateForLiquibase(1, '20160208210114').toISOString(), '2016-02-08T18:17:47.710Z');
            });
        });
        describe('when passing 10 day with changelogDate', () => {
            it('returns a recent reproducible date', () => {
                assert.equal(liquibaseUtils.getRecentDateForLiquibase(10, '20160208210114').toISOString(), '2016-02-07T17:46:59.078Z');
            });
        });
    });
});
