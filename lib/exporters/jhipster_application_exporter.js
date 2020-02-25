/**
 * Copyright 2013-2020 the original author or authors from the JHipster project.
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

const path = require('path');
const ApplicationValidator = require('../validators/application_validator');
const { createFolderIfItDoesNotExist, doesFileExist } = require('../utils/file_utils');
const { GENERATOR_NAME, writeConfigFile } = require('./export_utils');

module.exports = {
  exportApplications,
  exportApplication
};

/**
 * Exports JDL applications to JDL files in separate folders (based on application base names).
 * @param applications the applications to exporters (key: application name, value: a JDLApplication).
 * @return object[] exported applications in their final form.
 */
function exportApplications(applications) {
  if (!applications) {
    throw new Error('Applications have to be passed to be exported.');
  }
  return Object.values(applications).map(application => {
    checkForErrors(application);
    const exportableApplication = setUpApplicationStructure(application);
    writeApplicationFileForMultipleApplications(exportableApplication);
    return exportableApplication;
  });
}

/**
 * Exports JDL a application to a JDL file in the current directory.
 * @param application, the JDL application to exporters.
 * @return the exported application in its final form.
 */
function exportApplication(application) {
  checkForErrors(application);
  const exportableApplication = setUpApplicationStructure(application);
  writeConfigFile(exportableApplication);
  return exportableApplication;
}

function checkForErrors(application) {
  if (!application) {
    throw new Error('An application has to be passed to be exported.');
  }
  const validator = new ApplicationValidator();
  try {
    validator.validate(application);
  } catch (error) {
    throw new Error(`Can't export invalid application. ${error}`);
  }
}

function setUpApplicationStructure(application) {
  let applicationToExport = {
    [GENERATOR_NAME]: {}
  };
  applicationToExport[GENERATOR_NAME] = getApplicationConfig(application);
  applicationToExport.entities = application.getEntityNames();
  if (application.hasConfigurationOption('creationTimestamp')) {
    applicationToExport[GENERATOR_NAME].creationTimestamp = application.getConfigurationOptionValue(
      'creationTimestamp'
    );
  }
  applicationToExport = cleanUpOptions(applicationToExport);
  return applicationToExport;
}

function getApplicationConfig(application) {
  const result = {};
  application.forEachConfigurationOption(option => {
    result[option.name] = option.getValue();
  });
  return result;
}

function cleanUpOptions(application) {
  if (!application[GENERATOR_NAME].frontEndBuilder) {
    delete application[GENERATOR_NAME].frontEndBuilder;
  }
  delete application.entityNames;
  return application;
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
