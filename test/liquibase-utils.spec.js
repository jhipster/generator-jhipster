const expect = require('chai').expect;
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
});
