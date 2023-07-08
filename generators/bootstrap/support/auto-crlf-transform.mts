/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
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
import { transform } from 'p-transform';
import { stat } from 'fs/promises';
import { createReadStream } from 'fs';
import { isBinaryFile } from 'isbinaryfile';
import { type SimpleGit } from 'simple-git';
import { normalizeLineEndings } from '../../base/support/index.mjs';

/**
 * Detect the file first line endings
 */
export function detectCrLf(filePath: string): Promise<boolean> {
  return new Promise<boolean>((resolve, reject) => {
    let isCrlf;
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

const autoCrlfTransform = (git: SimpleGit) =>
  transform(async (file: any) => {
    if (!file.contents) {
      return file;
    }
    if (await isBinaryFile(file.contents)) {
      return file;
    }
    const fstat = await stat(file.path);
    if (!fstat.isFile()) {
      return file;
    }
    const attributes = Object.fromEntries(
      (await git.raw('check-attr', 'binary', 'eol', '--', file.path))
        .split(/\r\n|\r|\n/)
        .map(attr => attr.split(':'))
        .map(([_file, attr, value]) => [attr, value])
    );
    if (attributes.binary === 'set' || attributes.eol === 'lf') {
      return file;
    }
    if (attributes.eol === 'crlf' || (await detectCrLf(file.path))) {
      file.contents = Buffer.from(normalizeLineEndings(file.contents.toString(), '\r\n'));
    }
    return file;
  });

export default autoCrlfTransform;
