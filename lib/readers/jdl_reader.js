/**
 * Copyright 2013-2019 the original author or authors from the JHipster project.
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

const logger = require('../utils/objects/logger');

const FileReader = require('./file_reader');
const parser = require('../dsl/api');

module.exports = {
  parseFromFiles,
  parseFromContent,
  getCstFromContent,
  checkFileIsJDLFile
};

/**
 * Parses the given files and returns the resulting intermediate object.
 * If one file is passed, the file will be read and its parsed content returned.
 * If more than one are passed, they will be assembled and only parsed once.
 * @param files the files to parse.
 * @returns {Object} the intermediate object.
 */
function parseFromFiles(files) {
  checkFiles(files);
  checkAllTheFilesAreJDLFiles(files);
  return parse(getFilesContent(files));
}

/**
 * Parses the given content and returns the resulting intermediate object.
 * @param content the JDL content to parse.
 * @returns {Object} the intermediate object.
 */
function parseFromContent(content) {
  if (!content) {
    throw new Error('A valid JDL content must be passed so as to be parsed.');
  }
  return parse(content);
}

function getCstFromContent(content) {
  return getCst(content);
}

function checkFiles(files) {
  if (!files || files.length === 0) {
    throw new Error('The files must be passed to be parsed.');
  }
}

function getFilesContent(files) {
  return files.length === 1 ? FileReader.readFile(files[0]) : aggregateFiles(files);
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
function parse(content) {
  return callApiMethod('parse', content);
}

function getCst(content) {
  return callApiMethod('getCst', content);
}

function callApiMethod(methodName, content) {
  if (!content) {
    throw new Error('File content must be passed, it is currently empty.');
  }
  try {
    const processedInput = filterJDLDirectives(removeInternalJDLComments(content));
    return parser[methodName](processedInput);
  } catch (error) {
    logger.error(`Error message:\n\t${error.message}`);
    throw new SyntaxError(error);
  }
}

function removeInternalJDLComments(content) {
  // Removing an internal Comment will not affect line/column location info
  // as no lines are removed and the comments consumes the rest of the line.
  return content.replace(/\/\/[^\n\r]*/gm, '');
}

function filterJDLDirectives(content) {
  // We are only removing the directive not the whole line to avoid modifying line/column
  // location information in parsers errors.
  return content.replace(/^\u0023.*/gm, '');
}

/**
 * Checks whether the given file is a JDL file, only from the extension.
 * Doesn't return anything, but fails if the extension doesn't match.
 * @param file the file to check.
 */
function checkFileIsJDLFile(file) {
  if (!file.endsWith('.jh') && !file.endsWith('.jdl')) {
    throw new Error(`The passed file '${file}' must end with '.jh' or '.jdl' to be valid.`);
  }
}

function aggregateFiles(files) {
  return FileReader.readFiles(files).join('\n');
}
