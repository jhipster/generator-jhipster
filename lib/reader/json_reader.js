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

const _ = require('lodash');
const fs = require('fs');
const Parser = require('../parser/json_parser');
const Reader = require('../reader/json_file_reader');
const BuildException = require('../exceptions/exception_factory').BuildException;
const exceptions = require('../exceptions/exception_factory').exceptions;

module.exports = {
  parseFromDir
};

/* Parse the given jhipster app dir and return a JDLObject */
function parseFromDir(dir) {
  let isDir = false;
  if (!dir) {
    throw new BuildException(
      exceptions.IllegalArgument, 'The app directory must be passed.');
  }
  try {
    isDir = fs.statSync(dir).isDirectory();
  } catch (error) { // doesn't exist
    isDir = false;
  }
  if (!isDir) {
    throw new BuildException(
      exceptions.WrongDir,
      'The passed dir must exist and must be a directory.');
  }
  const jdl = Parser.parseServerOptions(Reader.readEntityJSON(`${dir}/.yo-rc.json`)['generator-jhipster']);
  const entityDir = `${dir}/.jhipster`;
  let isJhipsterDirectory = false;
  try {
    isJhipsterDirectory = fs.statSync(entityDir).isDirectory();
  } catch (error) {
    // .jhipster dir doesn't exist'
    return jdl;
  }
  if (!isJhipsterDirectory) {
    throw new BuildException(
      exceptions.WrongDir,
      `'${entityDir}' must be a directory.`);
  }
  const entities = {};
  _.forEach(fs.readdirSync(entityDir), (file) => {
    if (file.slice(file.length - 5, file.length) === '.json') {
      const entityName = file.slice(0, file.length - 5);
      try {
        entities[entityName] = Reader.readEntityJSON(`${entityDir}/${file}`);
      } catch (error) {
        // Not an entity file, not adding
      }
    }
  });
  Parser.parseEntities(entities, jdl);
  return jdl;
}
