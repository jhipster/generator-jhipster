/* global describe, it */

const expect = require('chai').expect;
const cliUtil = require('../cli/utils');
const packageJson = require('../package.json');

describe('jhipster cli utils test', () => {
    describe('getArgs', () => {
        describe('when called without argument', () => {
            it('returns an empty string', () => {
                expect(cliUtil.getArgs({})).to.equal('');
            });
        });
        describe('when called with argument array', () => {
            const argument = ['test', 'foo'];
            it('returns a joined string', () => {
                expect(cliUtil.getArgs({ argument })).to.equal('[test foo]');
            });
        });
    });
    describe('getOptionsFromArgs', () => {
        describe('when called with empty args', () => {
            it('returns an empty array', () => {
                expect(cliUtil.getOptionsFromArgs([])).to.eql([]);
            });
        });
        describe('when called with string arguments', () => {
            const argument = ['test', 'foo'];
            it('returns an array with strings', () => {
                expect(cliUtil.getOptionsFromArgs(argument)).to.eql(['test', 'foo']);
            });
        });
        describe('when called with array & string argument', () => {
            const argument = [['bar', 'test'], 'foo'];
            it('returns an array with strings', () => {
                expect(cliUtil.getOptionsFromArgs(argument)).to.eql(['bar', 'test', 'foo']);
            });
        });
        describe('when called with array & object argument', () => {
            const argument = [['bar'], { foo: 'foo' }];
            it('returns an array with valid strings', () => {
                expect(cliUtil.getOptionsFromArgs(argument)).to.eql(['bar']);
            });
        });
    });
    describe('getCommand', () => {
        describe('when called with only cmd', () => {
            it('returns a default command', () => {
                expect(cliUtil.getCommand('app')).to.eql('jhipster:app');
            });
        });
        describe('when called with cmd & invalid opts', () => {
            it('returns a default command', () => {
                expect(cliUtil.getCommand('app', {}, {})).to.eql('jhipster:app');
            });
        });
        describe('when called with cmd, args & valid opts', () => {
            const argument = [['bar', 'foo']];
            it('returns a command with argument', () => {
                expect(cliUtil.getCommand('app', argument, { argument })).to.eql('jhipster:app bar foo');
            });
        });
    });
    describe('getCommandOptions', () => {
        describe('when called with empty argv', () => {
            it('returns an empty object', () => {
                expect(cliUtil.getCommandOptions(packageJson, [])).to.eql({});
            });
        });
        describe('when called with argv flags', () => {
            const argv = ['--force', '--skip-install'];
            it('returns an object with camelcase and dashcase keys', () => {
                expect(cliUtil.getCommandOptions(packageJson, argv)).to.eql({
                    force: true,
                    'skip-install': true,
                    skipInstall: true
                });
            });
        });
        describe('when called with argv flags with value', () => {
            const argv = ['--force', '--skip-install', '--foo', 'bar'];
            it('returns an object with camelcase and dashcase keys', () => {
                expect(cliUtil.getCommandOptions(packageJson, argv)).to.eql({
                    force: true,
                    'skip-install': true,
                    skipInstall: true,
                    foo: 'bar'
                });
            });
        });
        describe('when called with argv flags with value array', () => {
            const argv = ['--force', '--skip-install', '--foo', 'bar,who'];
            it('returns an object with camelcase and dashcase keys', () => {
                expect(cliUtil.getCommandOptions(packageJson, argv)).to.eql({
                    force: true,
                    'skip-install': true,
                    skipInstall: true,
                    foo: 'bar,who'
                });
            });
        });
    });
});
