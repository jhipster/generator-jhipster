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
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import { Readable } from 'node:stream';

import type { MemFsEditorFile } from 'mem-fs-editor';
import { simpleGit } from 'simple-git';

import autoCrlfTransform, { detectCrLf } from './auto-crlf-transform.ts';

import { defaultHelpers as helpers } from '#testing';

const gitAttributes = `* text=auto
*.bat text eol=crlf
*.sh text eol=lf
*.noeol -eol
*.nobinary -binary
*.native eol=native
*.bin binary
`;

const binaryContents = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0a, 0x00, 0x1a, 0x0a, 0x00]);

const runAutoCrlfTransform = async (
  baseDir: string,
  filePaths: string[],
  editorMetadata?: Record<string, unknown>,
): Promise<Record<string, string>> => {
  const files = filePaths.map(filePath => ({
    path: join(baseDir, filePath),
    contents: filePath.endsWith('.png') ? binaryContents : Buffer.from('line1\nline2\n'),
    state: 'modified',
    editorMetadata,
  })) as unknown as MemFsEditorFile[];

  const contents: Record<string, string> = {};
  const stream: AsyncIterable<MemFsEditorFile> = Readable.from(files).pipe(await autoCrlfTransform());
  for await (const file of stream) {
    contents[relative(baseDir, file.path).replaceAll('\\', '/')] = file.contents!.toString();
  }
  return contents;
};

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
        expect(await detectCrLf('lf-single.txt')).toBeUndefined();
      });
    });
  });

  describe('::autoCrlfTransform', () => {
    const filePaths = [
      'file.txt',
      'file.sh',
      'file.bat',
      'nested/file.txt',
      'nested/file.sh',
      'file.noeol',
      'file.nobinary',
      'file.native',
      'file.bin',
      'colon: file.txt',
      'image.png',
    ];
    // Without attributes every text file gets CRLF, binary contents are detected and left untouched.
    const fallback = Object.fromEntries(
      filePaths.map(filePath => [filePath, filePath.endsWith('.png') ? binaryContents.toString() : 'line1\r\nline2\r\n']),
    );

    const prepareBaseDir = async (): Promise<string> => {
      const result = await helpers.prepareTemporaryDir().withFiles({ '.gitattributes': gitAttributes }).commitFiles();
      return result.cwd;
    };

    describe('with gitRoot metadata', () => {
      let repoDir: string;
      let plainDir: string;

      before(async () => {
        repoDir = await prepareBaseDir();
        await simpleGit({ baseDir: repoDir }).init();
        // Created outside the yeoman-test lifecycle: preparing another temporary dir would drop `repoDir`.
        plainDir = await mkdtemp(join(tmpdir(), 'jhipster-auto-crlf-'));
      });

      after(async () => {
        await rm(plainDir, { recursive: true, force: true });
      });

      it('should normalize line endings using the gitattributes of the git root', async () => {
        await expect(runAutoCrlfTransform(repoDir, filePaths, { gitRoot: repoDir })).resolves.toEqual({
          'file.txt': 'line1\r\nline2\r\n',
          'file.sh': 'line1\nline2\n',
          'file.bat': 'line1\r\nline2\r\n',
          'nested/file.txt': 'line1\r\nline2\r\n',
          'nested/file.sh': 'line1\nline2\n',
          // unset, native and paths containing `: ` are treated as unspecified
          'file.noeol': 'line1\r\nline2\r\n',
          'file.nobinary': 'line1\r\nline2\r\n',
          'file.native': 'line1\r\nline2\r\n',
          'colon: file.txt': 'line1\r\nline2\r\n',
          // binary files are left untouched
          'file.bin': 'line1\nline2\n',
          'image.png': binaryContents.toString(),
        });
      });

      it('should fall back to content detection when the git root is not a git repository', async () => {
        await expect(runAutoCrlfTransform(repoDir, filePaths, { gitRoot: plainDir })).resolves.toEqual(fallback);
      });

      it('should fall back to content detection when the git root does not exist', async () => {
        await expect(runAutoCrlfTransform(repoDir, filePaths, { gitRoot: join(repoDir, 'missing') })).resolves.toEqual(fallback);
      });
    });

    describe('without gitRoot metadata', () => {
      let repoDir: string;

      before(async () => {
        repoDir = await prepareBaseDir();
        await simpleGit({ baseDir: repoDir }).init();
      });

      it('should fall back to content detection even inside a git repository', async () => {
        await expect(runAutoCrlfTransform(repoDir, filePaths)).resolves.toEqual(fallback);
      });
    });
  });
});
