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

import type { MemFsEditorFile } from 'mem-fs-editor';

import { createMultiStepTransform } from './index.ts';

const root = "root = true\n<&- fragments.render({ join: '\\n\\n' }) &>";

const runMultiStepTransform = async (
  files: Record<string, string>,
  options?: Parameters<typeof createMultiStepTransform>[0],
): Promise<Record<string, string>> => {
  const stream: AsyncIterable<MemFsEditorFile> = Readable.from(
    Object.entries(files).map(([path, contents]) => ({ path, contents: Buffer.from(contents) })),
  ).pipe(createMultiStepTransform(options));
  const result: Record<string, string> = {};
  for await (const file of stream) {
    result[file.path] = file.contents!.toString();
  }
  return result;
};

describe('generator - bootstrap - multi-step transform', () => {
  it('renders the fragments into their template', async () => {
    await expect(
      runMultiStepTransform({
        '/p/.editorconfig.jhi': root,
        '/p/.editorconfig.jhi.java': '[*.java]\nindent_size = 4',
      }),
    ).resolves.toEqual({ '/p/.editorconfig': 'root = true\n[*.java]\nindent_size = 4\n' });
  });

  it('lists the merged files in the editor metadata of the file', async () => {
    const stream: AsyncIterable<MemFsEditorFile & { editorMetadata?: Record<string, unknown> }> = Readable.from(
      Object.entries({
        '/p/.editorconfig.jhi': root,
        '/p/.editorconfig.jhi.client': '<&- fragments.render() &>',
        '/p/.editorconfig.jhi.client.vue': '[*.vue]\nindent_size = 2',
        '/p/.editorconfig.jhi.java': '[*.java]\nindent_size = 4',
      }).map(([path, contents]) => ({ path, contents: Buffer.from(contents), editorMetadata: { gitRoot: '/p' } })),
    ).pipe(createMultiStepTransform());
    const files = [];
    for await (const file of stream) files.push(file);
    expect(files.map(({ path, editorMetadata }) => ({ path, editorMetadata }))).toEqual([
      {
        path: '/p/.editorconfig',
        editorMetadata: {
          gitRoot: '/p',
          mergedFiles: [
            '/p/.editorconfig.jhi',
            '/p/.editorconfig.jhi.client',
            '/p/.editorconfig.jhi.client.vue',
            '/p/.editorconfig.jhi.java',
          ],
        },
      },
    ]);
  });

  it('logs a fragment dropped without its template', async () => {
    const log: string[] = [];
    await expect(
      runMultiStepTransform({ '/p/.editorconfig.jhi.java': '[*.java]\nindent_size = 4' }, { log: message => log.push(message) }),
    ).resolves.toEqual({});
    expect(log).toEqual(['The fragment /p/.editorconfig.jhi.java was dropped: its template /p/.editorconfig.jhi was not written with it.']);
  });

  it('logs a fragment of a fragment dropped without its parent fragment', async () => {
    const log: string[] = [];
    await runMultiStepTransform(
      { '/p/.editorconfig.jhi': root, '/p/.editorconfig.jhi.client.vue': '[*.vue]\nindent_size = 2' },
      { log: message => log.push(message) },
    );
    expect(log).toEqual([
      'The fragment /p/.editorconfig.jhi.client.vue was dropped: its template /p/.editorconfig.jhi.client was not written with it.',
    ]);
  });
});
