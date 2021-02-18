const expect = require('chai').expect;
const cliUtil = require('../../cli/utils');

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
  describe('getOptionAsArgs', () => {
    describe('when called with empty args', () => {
      it('returns a default string array', () => {
        expect(cliUtil.getOptionAsArgs({})).to.eql([]);
      });
    });
    describe('when called with valid arguments', () => {
      const argument = { foo: true, bar: '123' };
      it('returns an array of truthy string args', () => {
        expect(cliUtil.getOptionAsArgs(argument)).to.eql(['--foo', '--bar', '123']);
      });
    });
    describe('when called with valid argument having false value', () => {
      const argument = { foo: true, bar: '123', insight: false };
      it('returns an array of truthy string args', () => {
        expect(cliUtil.getOptionAsArgs(argument)).to.eql(['--foo', '--bar', '123', '--no-insight']);
      });
    });
    describe('when called with valid arguments and withEntities', () => {
      const argument = { foo: true, bar: '123', withEntities: true };
      it('returns an array of string args', () => {
        expect(cliUtil.getOptionAsArgs(argument)).to.eql(['--foo', '--bar', '123', '--with-entities']);
      });
    });
    describe('when called with valid arguments and force', () => {
      const argument = { foo: true, bar: '123', force: true };
      it('returns an array of string args', () => {
        expect(cliUtil.getOptionAsArgs(argument)).to.eql(['--foo', '--bar', '123', '--force']);
      });
    });
    describe('when called with valid arguments with duplicates in different case', () => {
      const argument = { fooBar: true, bar: '123', 'foo-bar': true, foo_bar: true };
      it('returns an array of string args', () => {
        expect(cliUtil.getOptionAsArgs(argument)).to.eql(['--foo-bar', '--bar', '123']);
      });
    });
    describe('when called with valid arguments with single char keys', () => {
      const argument = { foo: true, bar: '123', d: true };
      it('returns an array of string args', () => {
        expect(cliUtil.getOptionAsArgs(argument)).to.eql(['--foo', '--bar', '123', '-d']);
      });
    });
    describe('when called with empty string', () => {
      const argument = { foo: true, bar: '' };
      it('returns an array of string args', () => {
        expect(cliUtil.getOptionAsArgs(argument)).to.eql(['--foo', '--bar', '']);
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
});
