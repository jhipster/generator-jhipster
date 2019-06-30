/**
 * Copyright 2013-2017 the original author or authors from the JHipster project.
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
const FileUtils = require('../utils/file_utils');

const GENERATOR_NAME = 'generator-jhipster';

module.exports = {
  checkPath,
  createFolderIfNeeded,
  writeConfigFile,
  GENERATOR_NAME
};

function checkPath(pathToCheck) {
  if (FileUtils.doesFileExist(pathToCheck)) {
    throw new Error(
      `A file '${pathToCheck}' already exists, so a folder of the same name can't be created for the application.`
    );
  }
}

function createFolderIfNeeded(path) {
  if (!FileUtils.doesDirectoryExist(path)) {
    FileUtils.createDirectory(path);
  }
}

/**
 * This function writes a Yeoman config file in the current folder.
 * @param config the configuration.
 * @param yoRcPath the yeoman conf file path
 */
function writeConfigFile(config, yoRcPath = '.yo-rc.json') {
  let newYoRc = { ...config };
  if (FileUtils.doesFileExist(yoRcPath)) {
    const yoRc = JSON.parse(fs.readFileSync(yoRcPath, { encoding: 'utf-8' }));
    newYoRc = {
      ...yoRc,
      ...config,
      [GENERATOR_NAME]: {
        ...yoRc[GENERATOR_NAME],
        ...config[GENERATOR_NAME]
      }
    };
  }
  fs.writeFileSync(yoRcPath, JSON.stringify(newYoRc, null, 2));
}
