import { describe, expect, it } from 'esmocha';

import { getCommand } from './utils.ts';

describe('cli - utils test', () => {
  describe('getCommand', () => {
    describe('when called with only cmd', () => {
      it('returns a default command', () => {
        expect(getCommand('app')).toEqual('app');
      });
    });
    describe('when called with cmd & invalid opts', () => {
      it('returns a default command', () => {
        expect(getCommand('app', [])).toEqual('app');
      });
    });
    describe('when called with cmd, args & valid opts', () => {
      const argument = [['bar', 'foo']];
      it('returns a command with argument', () => {
        expect(getCommand('app', argument)).toEqual('app bar foo');
      });
    });
  });
});
