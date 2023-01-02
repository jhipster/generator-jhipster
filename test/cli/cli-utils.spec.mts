import { expect } from 'chai';
import { getOptionAsArgs, getCommand } from '../../cli/utils.mjs';

describe('jhipster cli utils test', () => {
  describe('getOptionAsArgs', () => {
    describe('when called with empty args', () => {
      it('returns a default string array', () => {
        expect(getOptionAsArgs({})).to.eql([]);
      });
    });
    describe('when called with valid arguments', () => {
      const argument = { foo: true, bar: '123' };
      it('returns an array of truthy string args', () => {
        expect(getOptionAsArgs(argument)).to.eql(['--foo', '--bar', '123']);
      });
    });
    describe('when called with valid argument having false value', () => {
      const argument = { foo: true, bar: '123', insight: false };
      it('returns an array of truthy string args', () => {
        expect(getOptionAsArgs(argument)).to.eql(['--foo', '--bar', '123', '--no-insight']);
      });
    });
    describe('when called with valid arguments and withEntities', () => {
      const argument = { foo: true, bar: '123', withEntities: true };
      it('returns an array of string args', () => {
        expect(getOptionAsArgs(argument)).to.eql(['--foo', '--bar', '123', '--with-entities']);
      });
    });
    describe('when called with valid arguments and force', () => {
      const argument = { foo: true, bar: '123', force: true };
      it('returns an array of string args', () => {
        expect(getOptionAsArgs(argument)).to.eql(['--foo', '--bar', '123', '--force']);
      });
    });
    describe('when called with valid arguments with duplicates in different case', () => {
      const argument = { fooBar: true, bar: '123', 'foo-bar': true, foo_bar: true };
      it('returns an array of string args', () => {
        expect(getOptionAsArgs(argument)).to.eql(['--foo-bar', '--bar', '123']);
      });
    });
    describe('when called with valid arguments with single char keys', () => {
      const argument = { foo: true, bar: '123', d: true };
      it('returns an array of string args', () => {
        expect(getOptionAsArgs(argument)).to.eql(['--foo', '--bar', '123', '-d']);
      });
    });
    describe('when called with empty string', () => {
      const argument = { foo: true, bar: '' };
      it('returns an array of string args', () => {
        expect(getOptionAsArgs(argument)).to.eql(['--foo', '--bar', '']);
      });
    });
  });
  describe('getCommand', () => {
    describe('when called with only cmd', () => {
      it('returns a default command', () => {
        expect(getCommand('app')).to.eql('app');
      });
    });
    describe('when called with cmd & invalid opts', () => {
      it('returns a default command', () => {
        expect(getCommand('app', {}, {})).to.eql('app');
      });
    });
    describe('when called with cmd, args & valid opts', () => {
      const argument = [['bar', 'foo']];
      it('returns a command with argument', () => {
        expect(getCommand('app', argument, { argument })).to.eql('app bar foo');
      });
    });
  });
});
