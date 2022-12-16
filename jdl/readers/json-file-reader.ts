/**
 * Copyright 2013-2022 the original author or authors from the JHipster project.
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

import path from 'path';
import { upperFirst } from '../utils/string-utils.js';
import { readFile } from './file-reader.js';

/**
 * Reads a JSON file.
 * @param filePath the JSON file's path
 * @return its content
 */
export function readJSONFile(filePath: string) {
  return JSON.parse(readFile(filePath));
}

/**
 * From an entity's name, gives the expected file path.
 * @param entityName the entity's name.
 * @returns the file's path.
 */
export function toFilePath(entityName: string): string {
  if (!entityName) {
    throw new Error('The passed entity name must not be nil to be converted to file path.');
  }
  return path.join('.jhipster', `${upperFirst(entityName)}.json`);
}
