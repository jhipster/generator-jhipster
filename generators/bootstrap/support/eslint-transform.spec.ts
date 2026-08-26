/**
 * Copyright 2013-2026 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
