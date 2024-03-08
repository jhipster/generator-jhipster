import { before, it, describe, expect } from 'esmocha';
import { detectCrLf } from './auto-crlf-transform.js';
import { defaultHelpers as helpers } from '../../../testing/index.js';

describe('generator - bootstrap - utils', () => {
  describe('::detectCrLf', () => {
    before(async () => {
      await helpers
        .prepareTemporaryDir()
        .withFiles({
          'crlf.txt': 'a\r\ncrlf file',
          'lf.txt': 'a\nlf file',
          'lf-single.txt': 'a single line file',
        })
        .commitFiles();
    });

    describe('passing a crlf file', () => {
      it('should return true', async () => {
        expect(await detectCrLf('crlf.txt')).toBe(true);
      });
    });
    describe('passing a lf file', () => {
      it('should return false', async () => {
        expect(await detectCrLf('lf.txt')).toBe(false);
      });
    });
    describe('passing a single line file', () => {
      it('should return undefined', async () => {
        expect(await detectCrLf('lf-single.txt')).toBe(undefined);
      });
    });
  });
});
