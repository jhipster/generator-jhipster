/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
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

import { readFileSync } from 'fs';
import logger from '../utils/objects/logger.js';

import * as parser from '../parsing/api.js';
import performJDLPostParsingTasks from '../parsing/jdl-post-parsing-tasks.js';
import type { JDLRuntime } from '../types/runtime.js';

/**
 * Parses the given files and returns the resulting intermediate object.
 * If one file is passed, the file will be read and its parsed content returned.
 * If more than one are passed, they will be assembled and only parsed once.
 * @param files the files to parse.
 * @returns {Object} the intermediate object.
 */
export function parseFromFiles(files: string[], runtime: JDLRuntime) {
  checkFiles(files);
  checkAllTheFilesAreJDLFiles(files);
  return parse(getFilesContent(files), runtime);
}

/**
 * Parses the given content and returns the resulting intermediate object.
 * @param content the JDL content to parse.
 * @returns {Object} the intermediate object.
 */
export function parseFromContent(content: string, runtime: JDLRuntime) {
  if (!content) {
    throw new Error('A valid JDL content must be passed so as to be parsed.');
  }
  return parse(content, runtime);
}

export function getCstFromContent(content: string, runtime: JDLRuntime) {
  return getCst(content, runtime);
}

function checkFiles(files: string[]) {
  if (!files || files.length === 0) {
    throw new Error('The files must be passed to be parsed.');
  }
}

function getFilesContent(files: string[]): string {
  try {
    return files.length === 1 ? readFileSync(files[0], 'utf-8') : aggregateFiles(files);
  } catch (error) {
    throw new Error(`The passed file '${files[0]}' must exist and must not be a directory to be read.`, { cause: error });
  }
}

function checkAllTheFilesAreJDLFiles(files) {
  for (let i = 0; i < files.length; i++) {
    checkFileIsJDLFile(files[i]);
  }
}

/**
 * Parsed the stringified JDL content and returns an intermediate object from the Chevrotain parsers.
 * @param content the JDL content.
 * @returns the intermediate object.
 */
function parse(content: string, runtime: JDLRuntime) {
  if (!content) {
    throw new Error('File content must be passed, it is currently empty.');
  }
  try {
    const processedInput = filterJDLDirectives(removeInternalJDLComments(content));
    const parsedContent = parser.parse(processedInput, undefined, runtime);
    return performJDLPostParsingTasks(parsedContent);
  } catch (error) {
    if (error instanceof SyntaxError) {
      logger.error(`Syntax error message:\n\t${error.message}`);
    }
    throw error;
  }
}

function getCst(content: string, runtime: JDLRuntime) {
  if (!content) {
    throw new Error('File content must be passed, it is currently empty.');
  }
  try {
    const processedInput = filterJDLDirectives(removeInternalJDLComments(content));
    return parser.getCst(processedInput, undefined, runtime);
  } catch (error) {
    if (error instanceof SyntaxError) {
      logger.error(`Syntax error message:\n\t${error.message}`);
    }
    throw error;
  }
}

function removeInternalJDLComments(content: string) {
  // Removing an internal Comment will not affect line/column location info
  // as no lines are removed and the comments consumes the rest of the line.
  return content.replace(/\/\/[^\n\r]*/gm, '');
}

function filterJDLDirectives(content: string) {
  // We are only removing the directive not the whole line to avoid modifying line/column
  // location information in parsers errors.
  return content.replace(/^\u0023.*/gm, '');
}

/**
 * Checks whether the given file is a JDL file, only from the extension.
 * Doesn't return anything, but fails if the extension doesn't match.
 * @param file the file to check.
 */
export function checkFileIsJDLFile(file: string): void {
  if (!file.endsWith('.jh') && !file.endsWith('.jdl')) {
    throw new Error(`The passed file '${file}' must end with '.jh' or '.jdl' to be valid.`);
  }
}

function aggregateFiles(files: string[]): string {
  return files.map(file => readFileSync(file, 'utf-8')).join('\n');
}
