/* global describe, it */

const assert = require('assert');
const cliUtil = require('../cli/utils');
const packageJson = require('../package.json');

describe('jhipster cli utils test', () => {
    describe('getArgs', () => {
        describe('when called without argument', () => {
            it('returns an empty string', () => {
                assert.equal(cliUtil.getArgs({}), '');
            });
        });
        describe('when called with argument array', () => {
            const argument = ['test', 'foo'];
            it('returns a joined string', () => {
                assert.equal(cliUtil.getArgs({ argument }), '[test foo]');
            });
        });
    });
    describe('getOptionsFromArgs', () => {
        describe('when called with empty args', () => {
            it('returns an empty array', () => {
                assert.deepEqual(cliUtil.getOptionsFromArgs([]), []);
            });
        });
        describe('when called with string arguments', () => {
            const argument = ['test', 'foo'];
            it('returns an array with strings', () => {
                assert.deepEqual(cliUtil.getOptionsFromArgs(argument), ['test', 'foo']);
            });
        });
        describe('when called with array & string argument', () => {
            const argument = [['bar', 'test'], 'foo'];
            it('returns an array with strings', () => {
                assert.deepEqual(cliUtil.getOptionsFromArgs(argument), ['bar', 'test', 'foo']);
            });
        });
        describe('when called with array & object argument', () => {
            const argument = [['bar'], { foo: 'foo' }];
            it('returns an array with valid strings', () => {
                assert.deepEqual(cliUtil.getOptionsFromArgs(argument), ['bar']);
            });
        });
    });
    describe('getCommand', () => {
        describe('when called with only cmd', () => {
            it('returns a default command', () => {
                assert.deepEqual(cliUtil.getCommand('app'), 'jhipster:app');
            });
        });
        describe('when called with cmd & invalid opts', () => {
            it('returns a default command', () => {
                assert.deepEqual(cliUtil.getCommand('app', {}, {}), 'jhipster:app');
            });
        });
        describe('when called with cmd, args & valid opts', () => {
            const argument = [['bar', 'foo']];
            it('returns a command with argument', () => {
                assert.deepEqual(cliUtil.getCommand('app', argument, { argument }), 'jhipster:app bar foo');
            });
        });
    });
    describe('getCommandOptions', () => {
        describe('when called with empty argv', () => {
            it('returns an empty object', () => {
                assert.deepEqual(cliUtil.getCommandOptions(packageJson, []), {});
            });
        });
        describe('when called with argv flags', () => {
            const argv = ['--force', '--skip-install'];
            it('returns an object with camelcase and dashcase keys', () => {
                assert.deepEqual(cliUtil.getCommandOptions(packageJson, argv), {
                    force: true,
                    'skip-install': true,
                    skipInstall: true
                });
            });
        });
        describe('when called with argv flags with value', () => {
            const argv = ['--force', '--skip-install', '--foo', 'bar'];
            it('returns an object with camelcase and dashcase keys', () => {
                assert.deepEqual(cliUtil.getCommandOptions(packageJson, argv), {
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
                assert.deepEqual(cliUtil.getCommandOptions(packageJson, argv), {
                    force: true,
                    'skip-install': true,
                    skipInstall: true,
                    foo: 'bar,who'
                });
            });
        });
    });
});
