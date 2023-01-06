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

import fs from 'fs';

/**
 * Checks the file exists.
 * @param file the file to check.
 * @returns whether the file exists and is actually a file.
 */
export function doesFileExist(file: string): boolean {
  const statObject = getStatObject(file);
  return statObject && statObject.isFile();
}

/**
 * Checks the directory exists.
 * @param directory the directory to check.
 * @returns whether the directory exists and is actually a directory.
 */
export function doesDirectoryExist(directory: string): boolean {
  const statObject = getStatObject(directory);
  return statObject && statObject.isDirectory();
}

/**
 * Creates a directory, if it doesn't exist already.
 * @param directory the directory to create.
 * @throws WrongDirException if the directory to create exists and is a file.
 */
export function createFolderIfItDoesNotExist(directory: string) {
  if (!directory) {
    throw new Error('A directory must be passed to be created.');
  }
  const statObject = getStatObject(directory);
  if (statObject && statObject.isFile()) {
    throw new Error(`The directory to create '${directory}' is a file.`);
  }
  fs.mkdirSync(directory, { recursive: true });
}

function getStatObject(file: string) {
  try {
    return fs.statSync(file);
  } catch (error) {
    return false;
  }
}
