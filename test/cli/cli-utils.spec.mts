import { expect } from 'chai';
import { getCommand } from '../../cli/utils.mjs';

describe('cli - utils test', () => {
  describe('getCommand', () => {
    describe('when called with only cmd', () => {
      it('returns a default command', () => {
        expect(getCommand('app')).to.eql('app');
      });
    });
    describe('when called with cmd & invalid opts', () => {
      it('returns a default command', () => {
        expect(getCommand('app', [])).to.eql('app');
      });
    });
    describe('when called with cmd, args & valid opts', () => {
      const argument = [['bar', 'foo']];
      it('returns a command with argument', () => {
        expect(getCommand('app', argument)).to.eql('app bar foo');
      });
    });
  });
});
