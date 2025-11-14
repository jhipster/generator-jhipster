import { describe, expect, it } from 'esmocha';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

import { setModifiedFileState } from 'mem-fs-editor/state';
import { transform } from 'p-transform';

import { createESLintTransform } from './eslint-transform.ts';

describe('generator - bootstrap - eslint', () => {
  describe('::createESLintTransform', () => {
    it('should remove unused imports', async () => {
      const file = {
        path: 'foo.ts',
        contents: Buffer.from(`
import { Foo } from 'bar';
// eslint-disable-next-line no-console
export const foo = 'bar';
`),
      };
      setModifiedFileState(file);
      await pipeline(
        Readable.from([file]),
        await createESLintTransform(),
        transform(() => undefined),
      );
      expect(file.contents.toString()).toBe(`
// eslint-disable-next-line no-console
export const foo = 'bar';
`);
    });
  });
});
