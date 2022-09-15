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

const path = require('path');
const { createFolderIfItDoesNotExist, doesFileExist } = require('../../utils/file-utils');
const { GENERATOR_NAME, writeConfigFile } = require('../export-utils');

module.exports = {
  exportApplications,
  exportApplication,
};

/**
 * Exports JDL applications to JDL files in separate folders (based on application base names).
 * @param {Array<Object>} applications -  the formatted applications to export
 */
function exportApplications(applications) {
  if (!applications) {
    throw new Error('Applications have to be passed to be exported.');
  }
  applications.forEach(application => {
    writeApplicationFileForMultipleApplications(application);
  });
}

/**
 * Exports JDL a application to a JDL file in the current directory.
 * @param {Object} application - the formatted JHipster application to export.
 */
function exportApplication(application) {
  writeConfigFile(application);
}

/**
 * This function writes a Yeoman config file in an application folder.
 * @param application the application.
 */
function writeApplicationFileForMultipleApplications(application) {
  const applicationBaseName = application[GENERATOR_NAME].baseName;
  if (doesFileExist(applicationBaseName)) {
    throw new Error(
      `A file named '${applicationBaseName}' already exists, so a folder of the same name can't be created for the application.`
    );
  }
  createFolderIfItDoesNotExist(applicationBaseName);
  writeConfigFile(application, path.join(applicationBaseName, '.yo-rc.json'));
}
