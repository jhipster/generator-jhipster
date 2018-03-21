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

const FileReader = require('./file_reader');
const pegjsParser = require('../dsl/pegjs_parser');
const BuildException = require('../exceptions/exception_factory').BuildException;
const exceptions = require('../exceptions/exception_factory').exceptions;
const winston = require('winston');

module.exports = {
  parse,
  parseFromFiles,
  checkFileIsJDLFile
};

/**
 * Parsed the stringified JDL content and returns an intermediate object from the PegJS parser.
 * @param content the JDL content.
 * @returns the intermediate object.
 */
function parse(content) {
  if (!content || content.length === 0) {
    throw new BuildException(
      exceptions.IllegalArgument, 'The content must be passed.');
  }
  try {
    return pegjsParser.parse(filterJDLDirectives(removeInternalJDLComments(content)));
  } catch (error) {
    winston.error(`An error has occurred:\n\t${error.name}`);
    winston.error(`Error message:\n\t${error.message}`);
    winston.error(`Position:\n\tAt l.${error.location.start.line}.`);
    throw new SyntaxError(error);
  }
}

function removeInternalJDLComments(content) {
  return content.replace(/\/\/[^\n\r]*/mg, '');
}

function filterJDLDirectives(content) {
  return content.replace(/^\u0023.*\n?/mg, '');
}

/**
 * Parses the given files and returns the resulting intermediate object.
 * If one file is passed, the file will be read and its parsed contet returned.
 * If more than one are passed, they will be assembled and only parsed once.
 * @param files the files to parse.
 * @returns {Object} the intermediate object.
 */
function parseFromFiles(files) {
  if (!files || files.length === 0) {
    throw new BuildException(
      exceptions.IllegalArgument, 'The file/s must be passed.');
  }
  checkAllTheFilesAreJDLFiles(files);
  return parse(files.length === 1
    ? FileReader.readFile(files[0])
    : aggregateFiles(files));
}

function checkAllTheFilesAreJDLFiles(files) {
  for (let i = 0; i < files.length; i++) {
    checkFileIsJDLFile(files[i]);
  }
}

/**
 * Checks whether the given file is a JDL file, only from the extension.
 * Doesn't return anything, but fails if the extension doesn't match.
 * @param file the file to check.
 */
function checkFileIsJDLFile(file) {
  if (file.slice(file.length - 3, file.length) !== '.jh'
    && file.slice(file.length - 4, file.length) !== '.jdl') {
    throw new BuildException(
      exceptions.WrongFile,
      `The passed file '${file}' must end with '.jh' or '.jdl' to be valid.`);
  }
}

function aggregateFiles(files) {
  return FileReader.readFiles(files).join('\n');
}
