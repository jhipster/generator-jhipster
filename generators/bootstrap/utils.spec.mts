import { jestExpect as expect } from 'mocha-expect-snapshot';
import { writeFileSync } from 'fs';
import { prepareTempDir } from '../../test/support/temp-dir.mjs';

import { detectCrLf } from './utils.mjs';

describe('generator - bootstrap - utils', () => {
  describe('::detectCrLf', () => {
    describe('passing a crlf file', () => {
      let cleanup;
      before(() => {
        cleanup = prepareTempDir();
        writeFileSync('crlf.txt', 'a\r\ncrlf file');
      });
      after(() => cleanup());

      it('should return true', async () => {
        expect(await detectCrLf('crlf.txt')).toBe(true);
      });
    });
    describe('passing a lf file', () => {
      let cleanup;
      before(() => {
        cleanup = prepareTempDir();
        writeFileSync('lf.txt', 'a\nlf file');
      });
      after(() => cleanup());

      it('should return false', async () => {
        expect(await detectCrLf('lf.txt')).toBe(false);
      });
    });
    describe('passing a single line file', () => {
      let cleanup;
      before(() => {
        cleanup = prepareTempDir();
        writeFileSync('lf.txt', 'a single line file');
      });
      after(() => cleanup());

      it('should return undefined', async () => {
        expect(await detectCrLf('lf.txt')).toBe(undefined);
      });
    });
  });
});
