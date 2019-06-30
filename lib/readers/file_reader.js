/**
 * Copyright 2013-2018 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see http://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const fs = require('fs');
const FileUtils = require('../utils/file_utils');

module.exports = {
  readFile,
  readFiles
};

/**
 * Reads the given files.
 * @param iterable the iterable object containing the file paths.
 * @returns an Iterable of the passed files' content.
 */
function readFiles(iterable) {
  if (!iterable) {
    throw new Error('The passed files must not be nil.');
  }
  return iterable.map(path => readFile(path));
}

/**
 * Reads a given file.
 * @param path the file's path.
 * @returns {string} the file's content.
 */
function readFile(path) {
  if (!path) {
    throw new Error('The passed file must not be nil to be read.');
  }
  if (!FileUtils.doesFileExist(path)) {
    throw new Error(`The passed file '${path}' must exist and must not be a directory to be read.`);
  }
  return fs.readFileSync(path, 'utf-8').toString();
}
