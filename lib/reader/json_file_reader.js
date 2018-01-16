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
const _ = require('lodash');
const isNilOrEmpty = require('../utils/string_utils').isNilOrEmpty;
const BuildException = require('../exceptions/exception_factory').BuildException;
const exceptions = require('../exceptions/exception_factory').exceptions;

module.exports = {
  readEntityJSON,
  toFilePath,
  doesfileExist
};

function readEntityJSON(filePath) {
  if (isNilOrEmpty(filePath)) {
    throw new BuildException(exceptions.NullPointer, 'The passed file path must not be nil.');
  }
  try {
    if (!doesfileExist(filePath)) {
      throw new BuildException(exceptions.FileNotFound, `The passed file '${filePath}' is a folder.`);
    }
  } catch (error) {
    if (error.name === 'FileNotFoundException') {
      throw error;
    }
    throw new BuildException(exceptions.FileNotFound, `The passed file '${filePath}' couldn't be found.`);
  }
  return JSON.parse(fs.readFileSync(filePath));
}

function toFilePath(entityName) {
  if (isNilOrEmpty(entityName)) {
    throw new BuildException(exceptions.NullPointer, 'The passed entity name must not be nil.');
  }
  return `.jhipster/${_.upperFirst(entityName)}.json`;
}

function doesfileExist(filePath) {
  try {
    return fs.statSync(filePath).isFile();
  } catch (error) {
    return false;
  }
}
