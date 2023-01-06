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
import { createReadStream } from 'fs';

/**
 * Detect the file first line endings
 *
 * @param {string} filePath
 * @returns {boolean|undefined} true in case of crlf, false in case of lf, undefined for a single line file
 */
// eslint-disable-next-line import/prefer-default-export
export function detectCrLf(filePath) {
  return new Promise((resolve, reject) => {
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
