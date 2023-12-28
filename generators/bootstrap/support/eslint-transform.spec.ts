import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import { it, describe, expect } from 'esmocha';
import { transform } from 'p-transform';
import { setModifiedFileState } from 'mem-fs-editor/state';

import { createESLintTransform } from './eslint-transform.js';

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
      setModifiedFileState(file);
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
