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
const chalk = require('chalk'); // eslint-disable-line import/no-extraneous-dependencies
const pegjsParser = require('../dsl/pegjs_parser');
const BuildException = require('../exceptions/exception_factory').BuildException;
const exceptions = require('../exceptions/exception_factory').exceptions;
const winston = require('winston');

module.exports = {
  parse,
  parseFromFiles,
  checkFileIsJDLFile
};

/* Parse the given content and return an intermediate object */
function parse(content) {
  if (!content || content.length === 0) {
    throw new BuildException(
      exceptions.IllegalArgument, 'The content must be passed.');
  }
  try {
    return pegjsParser.parse(filterJDLDirectives(removeInternalJDLComments(content)));
  } catch (error) {
    winston.error(`${chalk.red('An error has occurred:\n\t')}${error.name}`);
    winston.error(`${chalk.red('Error message:\n\t')}${error.message}`);
    winston.error(`${chalk.red('Position:')}\n\tAt l.${error.location.start.line}.`);
    throw new Error(error);
  }
}

function removeInternalJDLComments(content) {
  return content.replace(/\/\/[^\n\r]*/mg, '');
}

function filterJDLDirectives(content) {
  return content.replace(/^\u0023.*\n?/mg, '');
}

/* Parse the given files and return an intermediate object */
function parseFromFiles(files) {
  if (!files || files.length === 0) {
    throw new BuildException(
      exceptions.IllegalArgument, 'The file/s must be passed.');
  }
  checkAllTheFilesAreJDLFiles(files);
  return parse(files.length === 1
    ? readFileContent(files[0])
    : aggregateFiles(files));
}

/* private methods */

function checkAllTheFilesAreJDLFiles(files) {
  for (let i = 0; i < files.length; i++) {
    checkFileIsJDLFile(files[i]);
  }
}

function checkFileIsJDLFile(file) {
  if (file.slice(file.length - 3, file.length) !== '.jh'
    && file.slice(file.length - 4, file.length) !== '.jdl') {
    throw new BuildException(
      exceptions.WrongFile,
      `The passed file '${file}' must end with '.jh' or '.jdl' to be valid.`);
  }
}

function aggregateFiles(files) {
  let content = '';
  for (let i = 0; i < files.length; i++) {
    content = `${content}\n${readFileContent(files[i])}`;
  }
  return content;
}

function readFileContent(file) {
  let isDirOrInvalid = false;
  try {
    isDirOrInvalid = fs.statSync(file).isDirectory();
  } catch (error) { // doesn't exist
    isDirOrInvalid = true;
  }
  if (isDirOrInvalid) {
    throw new BuildException(
      exceptions.WrongFile,
      `The passed file '${file}' must exist and must not be a directory.`);
  }
  return fs.readFileSync(file, 'utf-8').toString();
}
