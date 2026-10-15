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

import { after, before, describe, expect, it } from 'esmocha';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

import type { VinylMemFsEditorFile } from 'mem-fs-editor';
import { setModifiedFileState } from 'mem-fs-editor/state';
import { transform } from 'p-transform';
import File from 'vinyl';

import { createESLintTransform } from './eslint-transform.ts';
import { createPrettierTransform } from './prettier-support.ts';

const createFile = (dir: string, name: string, contents: string): VinylMemFsEditorFile => {
  const file = new File({ cwd: dir, base: dir, path: join(dir, name), contents: Buffer.from(contents) }) as unknown as VinylMemFsEditorFile;
  setModifiedFileState(file);
  return file;
};

const commit = async (file: VinylMemFsEditorFile, formatter: NodeJS.ReadWriteStream) => {
  await pipeline(
    Readable.from([file]),
    formatter,
    transform(() => undefined),
  );
  return file.contents!.toString();
};

describe('generator - bootstrap - formatter pools', () => {
  const unusedImport = "import { Foo } from 'bar';\nexport const foo = 'bar';\n";
  let dirs: string[];

  before(() => {
    dirs = [mkdtempSync(join(tmpdir(), 'jhi-pools-')), mkdtempSync(join(tmpdir(), 'jhi-pools-'))];
  });

  after(() => {
    for (const dir of dirs) rmSync(dir, { recursive: true, force: true });
  });

  it('lints the files of each commit in its own destination', async () => {
    for (const dir of dirs) {
      const file = createFile(dir, 'foo.ts', unusedImport);
      expect(await commit(file, await createESLintTransform({ cwd: dir }))).toBe("export const foo = 'bar';\n");
    }
  });

  it('formats with the config files of each commit', async () => {
    const [dir] = dirs;
    const cwd = process.cwd();
    process.chdir(dir);
    try {
      writeFileSync(join(dir, '.prettierrc'), JSON.stringify({ singleQuote: false }));
      expect(await commit(createFile(dir, 'a.ts', "const a = 'x';\n"), await createPrettierTransform.call(undefined as any))).toBe(
        'const a = "x";\n',
      );
      writeFileSync(join(dir, '.prettierrc'), JSON.stringify({ singleQuote: true }));
      expect(await commit(createFile(dir, 'a.ts', 'const a = "x";\n'), await createPrettierTransform.call(undefined as any))).toBe(
        "const a = 'x';\n",
      );
    } finally {
      process.chdir(cwd);
    }
  });

  it('starts no worker for a next commit of the process', async () => {
    const [dir] = dirs;
    await commit(createFile(dir, 'b.ts', unusedImport), await createESLintTransform({ cwd: dir }));
    let created = 0;
    const onWorker = () => created++;
    process.on('worker', onWorker);
    try {
      await commit(createFile(dir, 'c.ts', unusedImport), await createESLintTransform({ cwd: dir }));
    } finally {
      process.off('worker', onWorker);
    }
    expect(created).toBe(0);
  });
});
