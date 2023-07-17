import { expect } from 'esmocha';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import { transform } from 'p-transform';

import { createESLintTransform } from './eslint-transform.mjs';

describe('generator - bootstrap - eslint', () => {
  describe('::createESLintTransform', () => {
    it('should remove unused imports', async () => {
      const file = {
        path: 'foo.ts',
        contents: Buffer.from(`
import { Foo } from 'bar';
export const foo = 'bar';
`),
      };
      await pipeline(
        Readable.from([file]),
        createESLintTransform(),
        transform(() => undefined),
      );
      expect(file.contents.toString()).toBe(`
export const foo = 'bar';
`);
    });
  });
});
