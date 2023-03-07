import { jestExpect as expect } from 'mocha-expect-snapshot';

import { detectCrLf } from './auto-crlf-transform.mjs';
import { defaultHelpers as helpers } from '../../../test/support/helpers.mjs';

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
