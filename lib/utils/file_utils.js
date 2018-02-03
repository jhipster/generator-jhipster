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
const BuildException = require('../exceptions/exception_factory').BuildException;
const exceptions = require('../exceptions/exception_factory').exceptions;

module.exports = {
  doesFileExist,
  doesDirectoryExist,
  createDirectory
};

function doesFileExist(file) {
  const statObject = getStatObject(file);
  return statObject && statObject.isFile();
}

function doesDirectoryExist(directory) {
  const statObject = getStatObject(directory);
  return statObject && statObject.isDirectory();
}

function createDirectory(directory) {
  const statObject = getStatObject(directory);
  if (!statObject) {
    fs.mkdirSync(directory);
    return;
  }
  if (statObject && statObject.isFile()) {
    throw new BuildException(exceptions.WrongDir, `The directory to create '${directory}' is a file.`);
  }
}

function getStatObject(file) {
  try {
    return fs.statSync(file);
  } catch (error) {
    return false;
  }
}
