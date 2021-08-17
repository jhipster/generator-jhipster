/**
 * Copyright 2013-2021 the original author or authors from the JHipster project.
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

const path = require('path');
const FileReader = require('./file-reader');
const { upperFirst } = require('../utils/string-utils');

module.exports = {
  readJSONFile,
  toFilePath,
};

/**
 * Reads a JSON file.
 * @param filePath the JSON file's path
 * @return its content
 */
function readJSONFile(filePath) {
  return JSON.parse(FileReader.readFile(filePath));
}

/**
 * From an entity's name, gives the expected file path.
 * @param entityName the entity's name.
 * @returns {string} the file's path.
 */
function toFilePath(entityName) {
  if (!entityName) {
    throw new Error('The passed entity name must not be nil to be converted to file path.');
  }
  return path.join('.jhipster', `${upperFirst(entityName)}.json`);
}
