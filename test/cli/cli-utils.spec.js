const assert = require('assert');
const expect = require('chai').expect;
const fs = require('fs');
const cliUtil = require('../../cli/utils');
const packageJson = require('../../package.json');

const { revertTempDir, testInTempDir } = require('../utils/utils');

describe('jhipster cli utils test', () => {
    describe('toString', () => {
        describe('should convert primitives to string', () => {
            it('returns a string', () => {
                expect(cliUtil.toString('test')).to.equal('test');
                expect(cliUtil.toString(10)).to.equal('10');
                expect(cliUtil.toString(true)).to.equal('true');
            });
        });
        describe('should convert array to string', () => {
            it('returns a string', () => {
                expect(cliUtil.toString(['test', 'foo'])).to.equal('test, foo');
                expect(cliUtil.toString([10, true, 'test'])).to.equal('10, true, test');
            });
        });
        describe('should convert simple objects to string', () => {
            it('returns a string', () => {
                expect(cliUtil.toString({ string: 'test', bool: true, int: 10 })).to.equal('string: test, bool: true, int: 10');
            });
        });
        describe('should convert complex objects to string', () => {
            it('returns a string', () => {
                expect(cliUtil.toString({ string: 'test', bool: true, int: 10, array: [1, 2], obj: { test: 1 } })).to.equal(
                    'string: test, bool: true, int: 10, array: Object, obj: Object'
                );
            });
        });
    });
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
    describe('getOptionAsArgs', () => {
        describe('when called with empty args', () => {
            it('returns a default string array', () => {
                expect(cliUtil.getOptionAsArgs({})).to.eql(['--from-cli']);
            });
        });
        describe('when called with valid arguments', () => {
            const argument = { foo: true, bar: '123' };
            it('returns an array of truthy string args', () => {
                expect(cliUtil.getOptionAsArgs(argument)).to.eql(['--foo', '--bar', '123', '--from-cli']);
            });
        });
        describe('when called with valid argument having false value', () => {
            const argument = { foo: true, bar: '123', insight: false };
            it('returns an array of truthy string args', () => {
                expect(cliUtil.getOptionAsArgs(argument)).to.eql(['--foo', '--bar', '123', '--no-insight', '--from-cli']);
            });
        });
        describe('when called with valid arguments and withEntities', () => {
            const argument = { foo: true, bar: '123' };
            it('returns an array of string args', () => {
                expect(cliUtil.getOptionAsArgs(argument, true)).to.eql(['--foo', '--bar', '123', '--with-entities', '--from-cli']);
            });
        });
        describe('when called with valid arguments and force', () => {
            const argument = { foo: true, bar: '123' };
            it('returns an array of string args', () => {
                expect(cliUtil.getOptionAsArgs(argument, false, true)).to.eql(['--foo', '--bar', '123', '--force', '--from-cli']);
            });
        });
        describe('when called with valid arguments with duplicates in different case', () => {
            const argument = { fooBar: true, bar: '123', 'foo-bar': true, foo_bar: true };
            it('returns an array of string args', () => {
                expect(cliUtil.getOptionAsArgs(argument, false, true)).to.eql(['--foo-bar', '--bar', '123', '--force', '--from-cli']);
            });
        });
        describe('when called with valid arguments with single char keys', () => {
            const argument = { foo: true, bar: '123', d: true };
            it('returns an array of string args', () => {
                expect(cliUtil.getOptionAsArgs(argument)).to.eql(['--foo', '--bar', '123', '-d', '--from-cli']);
            });
        });
    });
    describe('getCommand', () => {
        describe('when called with only cmd', () => {
            it('returns a default command', () => {
                expect(cliUtil.getCommand('app')).to.eql('app');
            });
        });
        describe('when called with cmd & invalid opts', () => {
            it('returns a default command', () => {
                expect(cliUtil.getCommand('app', {}, {})).to.eql('app');
            });
        });
        describe('when called with cmd, args & valid opts', () => {
            const argument = [['bar', 'foo']];
            it('returns a command with argument', () => {
                expect(cliUtil.getCommand('app', argument, { argument })).to.eql('app bar foo');
            });
        });
    });
    describe('getCommandOptions', () => {
        describe('when called with empty argv', () => {
            it('returns the default object', () => {
                expect(cliUtil.getCommandOptions(packageJson, [])).to.eql({ 'from-cli': true });
            });
        });
        describe('when called with argv flags', () => {
            const argv = ['--force', '--skip-install'];
            it('returns an object with camelcase and dashcase keys', () => {
                expect(cliUtil.getCommandOptions(packageJson, argv)).to.eql({
                    force: true,
                    'skip-install': true,
                    skipInstall: true,
                    'from-cli': true,
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
                    foo: 'bar',
                    'from-cli': true,
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
                    foo: 'bar,who',
                    'from-cli': true,
                });
            });
        });
    });
    describe('loadAllBlueprintsWithVersion', () => {
        describe('when there is no .yo-rc.json', () => {
            let oldCwd;

            before(() => {
                assert(!fs.existsSync('.yo-rc.json'));
                oldCwd = testInTempDir(() => {}, true);
            });
            after(() => {
                revertTempDir(oldCwd);
            });

            it('returns an empty object', () => {
                expect(cliUtil.loadAllBlueprintsWithVersion()).to.deep.equal({});
            });
        });

        describe('when blueprints was passed by command', () => {
            let oldCwd;
            let oldArgv;
            let returned;

            before(() => {
                oldArgv = process.argv;
                process.argv = ['--blueprints', 'vuejs,dotnet'];
                assert(!fs.existsSync('.yo-rc.json'));
                oldCwd = testInTempDir(() => {}, true);
                returned = cliUtil.loadAllBlueprintsWithVersion();
            });
            after(() => {
                process.argv = oldArgv;
                revertTempDir(oldCwd);
            });

            it('returns blueprints with no version', () => {
                expect(returned).to.deep.equal({
                    'generator-jhipster-vuejs': undefined,
                    'generator-jhipster-dotnet': undefined,
                });
            });
        });

        describe('when there are no blueprints on .yo-rc.json', () => {
            let oldCwd;
            let returned;

            before(() => {
                oldCwd = testInTempDir(() => {}, true);
                const yoRcContent = {
                    'generator-jhipster': {
                        blueprints: [],
                    },
                };
                fs.writeFileSync('.yo-rc.json', JSON.stringify(yoRcContent));
                returned = cliUtil.loadAllBlueprintsWithVersion();
            });
            after(() => {
                fs.unlinkSync('.yo-rc.json');
                revertTempDir(oldCwd);
            });

            it('returns an empty object', () => {
                expect(returned).to.deep.equal({});
            });
        });

        describe('when there are blueprints on .yo-rc.json', () => {
            let returned;
            let oldCwd;

            before(() => {
                oldCwd = testInTempDir(() => {}, true);
                const yoRcContent = {
                    'generator-jhipster': {
                        blueprints: [
                            { name: 'generator-jhipster-beeblebrox', version: 'latest' },
                            { name: 'generator-jhipster-h2g2-answer', version: '42' },
                        ],
                    },
                };
                fs.writeFileSync('.yo-rc.json', JSON.stringify(yoRcContent));
                returned = cliUtil.loadAllBlueprintsWithVersion();
            });
            after(() => {
                fs.unlinkSync('.yo-rc.json');
                revertTempDir(oldCwd);
            });

            it('returns the blueprints names & versions', () => {
                expect(returned).to.deep.equal({
                    'generator-jhipster-beeblebrox': 'latest',
                    'generator-jhipster-h2g2-answer': '42',
                });
            });
        });

        describe('when blueprints are defined in both command and .yo-rc.json', () => {
            let oldCwd;
            let oldArgv;
            let returned;

            before(() => {
                oldArgv = process.argv;
                process.argv = ['--blueprints', 'vuejs,dotnet'];
                assert(!fs.existsSync('.yo-rc.json'));
                oldCwd = testInTempDir(() => {}, true);

                const yoRcContent = {
                    'generator-jhipster': {
                        blueprints: [
                            { name: 'generator-jhipster-vuejs', version: 'latest' },
                            { name: 'generator-jhipster-h2g2-answer', version: '42' },
                        ],
                    },
                };
                fs.writeFileSync('.yo-rc.json', JSON.stringify(yoRcContent));
                returned = cliUtil.loadAllBlueprintsWithVersion();
            });
            after(() => {
                fs.unlinkSync('.yo-rc.json');
                process.argv = oldArgv;
                revertTempDir(oldCwd);
            });

            it('returns the blueprints names & versions, .yo-rc taking precedence', () => {
                expect(returned).to.deep.equal({
                    'generator-jhipster-vuejs': 'latest',
                    'generator-jhipster-dotnet': undefined,
                    'generator-jhipster-h2g2-answer': '42',
                });
            });
        });
    });
});
