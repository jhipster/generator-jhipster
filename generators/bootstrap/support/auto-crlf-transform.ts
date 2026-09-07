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
import { createReadStream } from 'node:fs';

import { isBinaryFile } from 'isbinaryfile';
import type { MemFsEditorFile } from 'mem-fs-editor';
import { isFileStateModified } from 'mem-fs-editor/state';
import { transform } from 'p-transform';
import { simpleGit } from 'simple-git';

import { CRLF, normalizeLineEndings } from '../../../lib/utils/index.ts';

/**
 * Detect the file first line endings
 */
export function detectCrLf(filePath: string): Promise<boolean | undefined> {
  return new Promise<boolean | undefined>((resolve, reject) => {
    let isCrlf: boolean | undefined;
    const rs = createReadStream(filePath, { encoding: 'utf8' });
    rs.on('data', function (chunk) {
      const n = chunk.indexOf('\n');
      const r = chunk.indexOf('\r');
      if (n !== -1 || r !== -1) {
        isCrlf = n === -1 || (r !== -1 && r < n);
        rs.close();
      }
    })
      .on('close', function () {
        resolve(isCrlf);
      })
      .on('error', function (err) {
        reject(err);
      });
  });
}

const autoCrlfTransform = async (_config: { baseDir?: string } = {}) => {
  return transform(async (file: MemFsEditorFile) => {
    if (!isFileStateModified(file)) {
      return file;
    }

    // The generator that wrote the file registered the repository root as `gitRoot` metadata, trust it.
    const { gitRoot } = file.editorMetadata ?? {};
    const attrs = typeof gitRoot === 'string' ? await checkAttributes(gitRoot, file.path) : undefined;

    // An explicit `binary` attribute wins (`set`, or `unset` for `-binary`); otherwise, and without a repository
    // (Storage writes like `.yo-rc.json`, `--skip-git`, failed initialization), binary files are detected from
    // their contents. Only explicit `eol` values drive the decision: `unset` (`-eol`), `unspecified`, `native`
    // and anything unexpected are treated as unspecified, line endings are best effort and must not abort the
    // commit. Without attributes, existing files keep the line endings found on disk and new files get CRLF.
    const isBinary = attrs?.binary === 'set' || (attrs?.binary !== 'unset' && (await isBinaryFile(file.contents!)));
    const useCrlf =
      attrs ?
        attrs.eol === 'crlf' || (!isBinary && attrs.eol !== 'lf')
      : !isBinary && ((await detectCrLf(file.path).catch(() => undefined)) ?? true);

    if (useCrlf) {
      file.contents = Buffer.from(normalizeLineEndings(file.contents!.toString(), CRLF));
    }

    return file;
  });
};

/**
 * Look up the `binary` and `eol` git attributes of a file, undefined when git cannot answer.
 */
async function checkAttributes(gitRoot: string, filePath: string): Promise<Record<string, string> | undefined> {
  let checkAttrs: string;
  try {
    // `-z` output is `<path>\0<attribute>\0<value>\0` triples, paths may contain `: `.
    checkAttrs = await simpleGit({ baseDir: gitRoot })
      .env({ HOME: process.env.HOME, PATH: process.env.PATH, LANG: 'C', LC_ALL: 'C' })
      .raw('check-attr', '-z', 'binary', 'eol', '--', filePath);
  } catch {
    // Not a repository (initialization failed), missing directory or git cannot be executed.
    return undefined;
  }
  const fields = checkAttrs.split('\0');
  const attrs: Record<string, string> = {};
  for (let index = 0; index + 2 < fields.length; index += 3) {
    attrs[fields[index + 1]] = fields[index + 2];
  }
  return attrs;
}

export default autoCrlfTransform;
